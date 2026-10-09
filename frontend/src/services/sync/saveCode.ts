// 存档码:80 位随机数,Crockford base32(去掉 I L O U,避免抄错),显示成 XXXX-XXXX-XXXX-XXXX。
// 服务器只收到它的 SHA-256(vaultKey),拿不到存档码本身。
const SAVE_CODE_ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
const SAVE_CODE_LENGTH = 16;

const formatInGroupsOfFour = (characters: string) => characters.match(/.{4}/g)!.join('-');

export function generateSaveCode(): string {
  const randomBytes = crypto.getRandomValues(new Uint8Array(SAVE_CODE_LENGTH));
  const characters = Array.from(randomBytes, (byte) => SAVE_CODE_ALPHABET[byte % 32]).join('');
  return formatInGroupsOfFour(characters);
}

/** 用户手抄/粘贴的输入 → 规范形式;格式不对返回 null。容错:大小写、空格、横线、O/0、I/L/1 */
export function normalizeSaveCode(input: string): string | null {
  const characters = input.toUpperCase().replace(/[^0-9A-Z]/g, '').replace(/O/g, '0').replace(/[IL]/g, '1');
  const hasValidLength = characters.length === SAVE_CODE_LENGTH;
  const usesOnlyAlphabet = [...characters].every((character) => SAVE_CODE_ALPHABET.includes(character));
  return hasValidLength && usesOnlyAlphabet ? formatInGroupsOfFour(characters) : null;
}

/** 存档码 → 发给后端的 vaultKey(SHA-256 的十六进制) */
export async function hashSaveCodeToVaultKey(saveCode: string): Promise<string> {
  const encoded = new TextEncoder().encode(`poopoo-diary:v1:${saveCode}`);
  const digest = await crypto.subtle.digest('SHA-256', encoded);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}
