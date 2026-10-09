# 噗噗日记

养成式的排便打卡 app。每天签到攒经验,培育一只噗一步步进化成最终形态;每次签到选一个今天的心情,日历和图鉴都会记住;还能把某一天或一段时间做成搞笑卡片分享给朋友。

> 目前是 beta。数据默认只存在浏览器 localStorage;配置 Supabase 后,用「存档码」就能多设备同步,**不需要注册登录**。

## 目录

- [快速开始](#快速开始)
- [玩法速览](#玩法速览)
- [存档码与云端同步](#存档码与云端同步)
- [常见问题](#常见问题)
- [目录结构](#目录结构)
- [开发](#开发)
- [文档](#文档)

## 快速开始

```bash
npm install
npm run dev     # 开发,默认 http://localhost:5173
npm test        # 单元测试
npm run build   # 类型检查 + 打包
```

需要 Node 18 以上。**不配置任何东西也能完整使用**,只是数据只在这台设备上,没有云端同步。

## 玩法速览

| | |
|---|---|
| 签到 | 每天第一次签到计经验,同一天再签只记录不计经验;可补签过去的日子,也可批量补签 |
| 连续 | 连续天数越长经验倍率越高(见 `src/domain/xp.ts`) |
| 进化 | 经验达到阈值进化,共 5 个形态;满级后可毕业进图鉴,再选一只新的 |
| 心情 | 签到时选 7 种心情之一(从好到坏):舒畅、淡定、躺平、憋屈、泄气、嫌弃、崩溃。日历显示当天最新一次的心情,图鉴显示该角色最近一次的心情 |
| 角色 | 7 个属性(金木水火土衰弱中毒)× 每属性 3 只,共 21 只。每只都有符合名字的道具,进化到形态 5 还有专属场景,名册见 [docs/characters.md](docs/characters.md) |
| 分享 | 首页右上角「分享」:选当天 / 近 7 天 / 本月 / 自定义范围(最多 42 天),预览卡片后以图片分享或下载。可隐藏昵称和心情,卡片上的搞笑文案按角色定制 |
| 同步 | 首次打开自动生成存档码,换设备输入它即可找回;离线照常签到,联网自动补同步 |
| 清空 | 「个人」页「清空全部数据」,需输入「清空」确认;云端软删除,**30 天内可以恢复** |

## 存档码与云端同步

### 它是什么

没有账号和密码。第一次打开 app 时,本机会静默生成一个存档码,形如 `K7MQ-X2PD-9WTR-4HJF`,存在浏览器里。服务器只拿到它的哈希值,拿不到存档码本身。

**谁有存档码,谁就能看到这份记录**,所以不要发给别人。分享卡片里不会出现它。

### 用户怎么用

| 想做的事 | 怎么做 |
|---|---|
| 查看 / 复制存档码 | 「个人」→「存档与同步」→ 显示 / 复制 |
| 验证云端确实有数据 | 同一张卡片里点「检查云端数据」,会显示云端的记录数和角色数 |
| 换手机 / 换浏览器 | 新设备打开 app,在启动页点「已经有存档码?恢复之前的记录」输入存档码。本机已有记录的话会和云端合并,不会丢 |
| 清空所有数据 | 「个人」→「清空全部数据」,输入「清空」确认 |
| 误清空了 | 30 天内,「个人」页(清空后会回到启动页,那里同样有)会出现「恢复清空的数据」 |

没有「找回存档码」的途径。存档码丢了、浏览器数据又被清掉,就找不回记录。所以签满 3 天后首页会提醒保存一次。

### 开发者怎么开启云端同步

同步是可选的,不配置则同步相关界面会整体隐藏。

1. 在 [supabase.com](https://supabase.com) 新建项目,到 **Project Settings → API** 复制 `Project URL` 和 `anon` / `publishable` key。
2. 复制 `.env.example` 为 `.env.local`,填入这两个值。**不要填 `service_role` / `secret` key。** `.env.local` 已被 `.gitignore` 排除。
3. 打开 Supabase 控制台的 **SQL Editor**,把 [`supabase/migrations/0001_sync.sql`](supabase/migrations/0001_sync.sql) 整份贴进去执行(可重复执行)。
4. 运行联调检查,应全部 ✓:

   ```bash
   node scripts/check-supabase.mjs
   ```

5. `npm run dev`,「个人」页看到「已同步」即成功。

设计、合并规则和安全模型见 [docs/sync.md](docs/sync.md)。

## 常见问题

**输入存档码后什么都没恢复?**
先确认原来的设备显示「已同步」。没同步完,云端是空的。再用「检查云端数据」看云端有没有记录。

**能在同一个浏览器里测试存档码吗?**
不能,因为它已经绑着这个码了。请用无痕窗口(或另一个浏览器)打开,走一遍「输入存档码恢复」。**测试前不要点「清空全部数据」**,清空会把云端的数据一起删掉。

**清空之后输入存档码为什么还是空的?**
存档码只是找回云端数据的钥匙,清空后云端数据已被标记删除。要找回请用「恢复清空的数据」,30 天内有效。

**两台设备同一天都签到了会怎样?**
合并后两条记录都保留,但只有最早的一条计经验,不会重复加。

**离线时能用吗?**
能。页面读写的是本机存档,联网后自动补同步。

**没配置 Supabase 会怎样?**
完全本地使用,所有同步相关界面隐藏。

## 目录结构

```
src/
  domain/      纯逻辑:经验、连续天数、进化、重算。不依赖 React,有单元测试
  storage/     存档接口 Repository + localStorage / 内存两种实现
  sync/        云端同步:存档码、合并规则、同步引擎、Supabase 接口
  store/       zustand store(动作)、读档修正 normalize、selectors
  data/
    characters/  角色数据,每个属性一个文件,index.ts 汇总
  components/  跨页面复用的组件
    art/       噗的全部绘制:身体 / 脸 / 配饰 / 每只角色的道具和场景(kits/)
  features/    按页面划分:checkin、calendar、collection、profile、review、onboarding、character、share、sync
supabase/      数据库迁移(建表、权限、同步函数)
scripts/       联调检查脚本
docs/          架构、同步、角色名册、美术指南
```

依赖方向:`features → store → domain`,`features/components → data`,`domain` 不依赖任何上层。

## 开发

- 技术栈:React 18 + TypeScript + Vite + Tailwind CSS 4 + zustand + Vitest。
- 测试覆盖经验规则、存档、签到、分享卡片数据、角色表完整性,以及多设备同步的各种场景(用内存版服务器)。
- **改同步的 SQL 时**,同步修改 `src/sync/__tests__/fakeBackend.ts`(内存版服务器,行为要和 SQL 对齐),并重新运行 `node scripts/check-supabase.mjs` ——单元测试跑的不是真 SQL。
- 新增角色:改 `src/data/characters/<属性>.ts` 并补 `src/components/art/kits/<属性>.tsx`,测试会检查是否齐全,步骤见 [docs/characters.md](docs/characters.md)。

## 文档

- [docs/architecture.md](docs/architecture.md):数据流、存档、读档修正、分享
- [docs/sync.md](docs/sync.md):存档码同步的设计、安全模型、部署步骤
- [docs/characters.md](docs/characters.md):21 只角色名册,以及怎么新增 / 下架角色
- [docs/art-guide.md](docs/art-guide.md):噗的绘制分层、坐标约定、怎么画道具和场景
