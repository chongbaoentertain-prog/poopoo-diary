// 存档码:80 位随机数,Crockford base32(去掉 I L O U,避免抄错),显示成 XXXX-XXXX-XXXX-XXXX。
// 服务器只收到它的 SHA-256,拿不到存档码本身。
const ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
const LENGTH = 16;

export function generateCode(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(LENGTH));
  const raw = Array.from(bytes, (b) => ALPHABET[b % 32]).join('');
  return raw.match(/.{4}/g)!.join('-');
}

/** 用户手抄/粘贴的输入 → 规范形式;格式不对返回 null。容错:大小写、空格、横线、O/0、I/L/1 */
export function normalizeCode(input: string): string | null {
  const raw = input.toUpperCase().replace(/[^0-9A-Z]/g, '').replace(/O/g, '0').replace(/[IL]/g, '1');
  if (raw.length !== LENGTH || [...raw].some((c) => !ALPHABET.includes(c))) return null;
  return raw.match(/.{4}/g)!.join('-');
}

export async function codeToKey(code: string): Promise<string> {
  const data = new TextEncoder().encode(`poopoo-diary:v1:${code}`);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
}
