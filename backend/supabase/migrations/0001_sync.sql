-- 噗噗日记:存档码同步
--
-- 没有账号体系。客户端本地生成一个高熵存档码,只把它的 SHA-256(下面叫 key)发给服务器;
-- 数据库里只有 key,没有存档码本身。谁持有存档码,谁就能读写对应的数据。
--
-- 表全部开启 RLS 且不建任何 policy:anon / authenticated 无法直接读写表,
-- 只能调用下面的 security definer 函数,函数里按 key 取数。
--
-- 软删除:清空数据只是打上 deleted_at,保留 30 天后由定时任务永久清除。
-- 这 30 天里用户可以「恢复清空的数据」(vault_restore)。
--
-- 在 Supabase 控制台 SQL Editor 里整份执行即可,可重复执行。

create table if not exists public.vaults (
  key text primary key check (key ~ '^[0-9a-f]{64}$'),
  created_at timestamptz not null default now(),
  cleared_at timestamptz,             -- 最近一次「清空全部数据」的时间,其他设备据此清掉本地
  profile jsonb,                      -- {nickname, avatarId, anonymous, activeCharacterId}
  profile_updated_at bigint           -- 客户端毫秒时间戳,后写者胜
);

-- 清空前的资料,供 30 天内恢复。清空时 profile 会被置空,不留这份就恢复不了昵称/头像/当前角色
alter table public.vaults add column if not exists profile_before_clear jsonb;
alter table public.vaults add column if not exists profile_updated_before_clear bigint;

create table if not exists public.vault_check_ins (
  vault_key text not null references public.vaults (key) on delete cascade,
  id text not null,                   -- 客户端生成,只增不改,所以多设备合并不会冲突
  date date not null,
  at timestamptz not null,
  character_id text not null,
  stamp_id text not null,             -- 角色id:形态:心情
  counted boolean not null,
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  primary key (vault_key, id)
);
create index if not exists vault_check_ins_sync_idx on public.vault_check_ins (vault_key, updated_at);

-- 只存"拥有哪些角色、哪些已毕业";经验和形态由签到记录重算,不同步
create table if not exists public.vault_progress (
  vault_key text not null references public.vaults (key) on delete cascade,
  character_id text not null,
  graduated boolean not null default false,
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  primary key (vault_key, character_id)
);

alter table public.vaults enable row level security;
alter table public.vault_check_ins enable row level security;
alter table public.vault_progress enable row level security;
revoke all on public.vaults, public.vault_check_ins, public.vault_progress from anon, authenticated;

-- 拉取:since 为空时只返回未删除的全量;否则返回 since 之后变动过的行(含已删除的,客户端据此删本地)
create or replace function public.sync_pull(p_key text, p_since timestamptz default null)
returns jsonb
language plpgsql security definer set search_path = public
as $$
declare
  v public.vaults;
begin
  if p_key !~ '^[0-9a-f]{64}$' then raise exception 'bad key'; end if;
  select * into v from public.vaults where key = p_key;
  if not found then
    return jsonb_build_object('profile', null, 'checkIns', '[]'::jsonb, 'progress', '[]'::jsonb, 'clearedAt', null, 'serverTime', now());
  end if;

  return jsonb_build_object(
    'profile', case when v.profile is null then null else v.profile || jsonb_build_object('updatedAt', v.profile_updated_at) end,
    'clearedAt', v.cleared_at,
    'serverTime', now(),
    'checkIns', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', c.id, 'date', c.date, 'at', c.at, 'characterId', c.character_id,
        'stampId', c.stamp_id, 'counted', c.counted, 'deleted', c.deleted_at is not null))
      from public.vault_check_ins c
      where c.vault_key = p_key
        and ((p_since is null and c.deleted_at is null) or (p_since is not null and c.updated_at > p_since))
    ), '[]'::jsonb),
    'progress', coalesce((
      select jsonb_agg(jsonb_build_object('characterId', g.character_id, 'graduated', g.graduated, 'deleted', g.deleted_at is not null))
      from public.vault_progress g
      where g.vault_key = p_key
        and ((p_since is null and g.deleted_at is null) or (p_since is not null and g.updated_at > p_since))
    ), '[]'::jsonb)
  );
end $$;

-- 推送:{profile?, checkIns[], progress[]}。第一次推送时创建 vault。
-- 签到记录 on conflict do nothing:已存在(含已被清空标记的)就不动,避免旧设备把清掉的数据复活。
create or replace function public.sync_push(p_key text, p_payload jsonb)
returns timestamptz
language plpgsql security definer set search_path = public
as $$
declare
  prof jsonb := p_payload -> 'profile';
begin
  if p_key !~ '^[0-9a-f]{64}$' then raise exception 'bad key'; end if;
  if jsonb_array_length(coalesce(p_payload -> 'checkIns', '[]'::jsonb)) > 1000 then raise exception 'too many check-ins'; end if;
  if jsonb_array_length(coalesce(p_payload -> 'progress', '[]'::jsonb)) > 100 then raise exception 'too many progress rows'; end if;

  insert into public.vaults (key) values (p_key) on conflict do nothing;

  insert into public.vault_check_ins (vault_key, id, date, at, character_id, stamp_id, counted)
  select p_key, x.id, x.date, x.at, x."characterId", x."stampId", x.counted
  from jsonb_to_recordset(coalesce(p_payload -> 'checkIns', '[]'::jsonb))
    as x(id text, date date, at timestamptz, "characterId" text, "stampId" text, counted boolean)
  on conflict (vault_key, id) do nothing;

  -- 毕业状态只会从 false 变 true;已被清空标记的角色重新拥有时恢复
  insert into public.vault_progress (vault_key, character_id, graduated)
  select p_key, x."characterId", coalesce(x.graduated, false)
  from jsonb_to_recordset(coalesce(p_payload -> 'progress', '[]'::jsonb)) as x("characterId" text, graduated boolean)
  on conflict (vault_key, character_id) do update
    set graduated = public.vault_progress.graduated or excluded.graduated,
        deleted_at = null,
        updated_at = now()
    where public.vault_progress.deleted_at is not null or (excluded.graduated and not public.vault_progress.graduated);

  if prof is not null and (prof ->> 'updatedAt') is not null then
    update public.vaults
       set profile = prof - 'updatedAt', profile_updated_at = (prof ->> 'updatedAt')::bigint
     where key = p_key and (profile_updated_at is null or profile_updated_at < (prof ->> 'updatedAt')::bigint);
  end if;

  return now();
end $$;


-- 清空全部数据(软删除):标记所有行,并记下清空时间,其他设备下次同步时会清掉本地。
-- 同时留一份清空前的资料,30 天内可以恢复。
create or replace function public.vault_clear(p_key text)
returns timestamptz
language plpgsql security definer set search_path = public
as $$
begin
  if p_key !~ '^[0-9a-f]{64}$' then raise exception 'bad key'; end if;
  insert into public.vaults (key) values (p_key) on conflict do nothing;
  update public.vaults
     set cleared_at = now(), profile_before_clear = profile, profile_updated_before_clear = profile_updated_at,
         profile = null, profile_updated_at = null
   where key = p_key;
  update public.vault_check_ins set deleted_at = now(), updated_at = now() where vault_key = p_key and deleted_at is null;
  update public.vault_progress set deleted_at = now(), updated_at = now() where vault_key = p_key and deleted_at is null;
  return now();
end $$;

-- 恢复最近一次清空的数据(30 天内)。只恢复那一次清空删掉的行(deleted_at = cleared_at,同一事务里时间相同);
-- 清空之后用户重新产生的数据原样保留,和恢复的数据合并;资料以现在的为准,没有才用清空前的。
create or replace function public.vault_restore(p_key text)
returns timestamptz
language plpgsql security definer set search_path = public
as $$
declare
  v public.vaults;
begin
  if p_key !~ '^[0-9a-f]{64}$' then raise exception 'bad key'; end if;
  select * into v from public.vaults where key = p_key for update;
  if not found or v.cleared_at is null then raise exception 'nothing to restore'; end if;
  if v.cleared_at < now() - interval '30 days' then raise exception 'restore window expired'; end if;

  update public.vault_check_ins set deleted_at = null, updated_at = now() where vault_key = p_key and deleted_at = v.cleared_at;
  update public.vault_progress set deleted_at = null, updated_at = now() where vault_key = p_key and deleted_at = v.cleared_at;

  update public.vaults
     set cleared_at = null,
         profile = coalesce(profile, profile_before_clear),
         profile_updated_at = case when profile is null then profile_updated_before_clear else profile_updated_at end,
         profile_before_clear = null, profile_updated_before_clear = null
   where key = p_key;
  return now();
end $$;

-- 永久清除:软删除满 30 天的行,以及过期的清空前资料。只给定时任务用,不对外开放。
create or replace function public.purge_soft_deleted()
returns void
language sql security definer set search_path = public
as $$
  delete from public.vault_check_ins where deleted_at < now() - interval '30 days';
  delete from public.vault_progress where deleted_at < now() - interval '30 days';
  update public.vaults set profile_before_clear = null, profile_updated_before_clear = null
   where cleared_at < now() - interval '30 days' and profile_before_clear is not null;
$$;

revoke all on function public.sync_pull(text, timestamptz), public.sync_push(text, jsonb), public.vault_clear(text), public.vault_restore(text), public.purge_soft_deleted() from public;
grant execute on function public.sync_pull(text, timestamptz), public.sync_push(text, jsonb), public.vault_clear(text), public.vault_restore(text) to anon, authenticated;

-- 每天凌晨 3 点(UTC)清除。pg_cron 在部分项目里要先到 Database → Extensions 手动启用;
-- 没启用也不影响同步,只是不会自动清除,启用后重新执行本文件即可。
do $$
begin
  create extension if not exists pg_cron;
  perform cron.schedule('poopoo-purge-soft-deleted', '0 3 * * *', 'select public.purge_soft_deleted()');
exception when others then
  raise notice 'pg_cron 不可用,已跳过自动清除任务:%', sqlerrm;
end $$;
