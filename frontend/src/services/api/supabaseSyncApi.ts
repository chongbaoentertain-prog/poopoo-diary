import type { PushPayload, RemoteSnapshot, SyncBackend } from '../sync/syncTypes';

/** 网络不通(离线、DNS、超时)。和"服务器拒绝"区分开:前者静默等下次重试,后者要提示 */
export class OfflineError extends Error {}

/**
 * Supabase 的 RPC 端点。只用 fetch,不引入 supabase-js。
 * publishable / anon key 本来就是给前端用的;真正的权限在数据库函数里(见 supabase/migrations)。
 */
export function createHttpBackend(url: string, apiKey: string): SyncBackend {
  const call = async <T>(fn: string, body: unknown): Promise<T> => {
    let res: Response;
    try {
      res = await fetch(`${url}/rest/v1/rpc/${fn}`, {
        method: 'POST',
        headers: { apikey: apiKey, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
    } catch {
      throw new OfflineError(`无法连接服务器(${fn})`);
    }
    if (!res.ok) throw new Error(`${fn} 失败:HTTP ${res.status} ${await res.text().catch(() => '')}`);
    return res.json() as Promise<T>;
  };

  return {
    pull: (key, since) => call<RemoteSnapshot>('sync_pull', { p_key: key, p_since: since }),
    push: (key, payload: PushPayload) => call<string>('sync_push', { p_key: key, p_payload: payload }),
    clear: (key) => call<string>('vault_clear', { p_key: key }),
    restore: (key) => call<string>('vault_restore', { p_key: key }),
  };
}

export const backendFromEnv = (): SyncBackend | null => {
  const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
  return url && key ? createHttpBackend(url.replace(/\/$/, ''), key) : null;
};
