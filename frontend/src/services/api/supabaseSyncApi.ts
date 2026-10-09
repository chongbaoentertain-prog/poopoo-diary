import type { PushPayload, RemoteSnapshot, SyncApi } from '../../types/sync';

/** 网络不通(离线、DNS、超时)。和"服务器拒绝"区分开:前者静默等下次重试,后者要提示 */
export class NetworkUnavailableError extends Error {}

/**
 * Supabase 的 RPC 端点。只用 fetch,不引入 supabase-js。
 * publishable / anon key 本来就是给前端用的;真正的权限在数据库函数里(见 backend/supabase/migrations)。
 */
export function createSupabaseSyncApi(projectUrl: string, publicApiKey: string): SyncApi {
  const callFunction = async <Result>(functionName: string, body: unknown): Promise<Result> => {
    let response: Response;
    try {
      response = await fetch(`${projectUrl}/rest/v1/rpc/${functionName}`, {
        method: 'POST',
        headers: { apikey: publicApiKey, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
    } catch {
      throw new NetworkUnavailableError(`无法连接服务器(${functionName})`);
    }
    if (!response.ok) {
      throw new Error(`${functionName} 失败:HTTP ${response.status} ${await response.text().catch(() => '')}`);
    }
    return response.json() as Promise<Result>;
  };

  return {
    pull: (vaultKey, changedSince) => callFunction<RemoteSnapshot>('sync_pull', { p_key: vaultKey, p_since: changedSince }),
    push: (vaultKey, payload: PushPayload) => callFunction<string>('sync_push', { p_key: vaultKey, p_payload: payload }),
    clear: (vaultKey) => callFunction<string>('vault_clear', { p_key: vaultKey }),
    restore: (vaultKey) => callFunction<string>('vault_restore', { p_key: vaultKey }),
  };
}

/** 读取 .env.local 里的 Supabase 配置;没配置就返回 null,整个同步功能随之关闭 */
export const createSyncApiFromEnvironment = (): SyncApi | null => {
  const projectUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const publicApiKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
  return projectUrl && publicApiKey ? createSupabaseSyncApi(projectUrl.replace(/\/$/, ''), publicApiKey) : null;
};
