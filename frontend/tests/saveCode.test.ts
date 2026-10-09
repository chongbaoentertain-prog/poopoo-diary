import { describe, expect, it } from 'vitest';
import { generateSaveCode, hashSaveCodeToVaultKey, normalizeSaveCode } from '../src/services/sync/saveCode';

describe('存档码', () => {
  it('生成的码格式正确,且能被规范化(容错大小写、空格、O/0、I/L/1)', () => {
    const saveCode = generateSaveCode();
    expect(saveCode).toMatch(/^[0-9A-HJKMNP-TV-Z]{4}(-[0-9A-HJKMNP-TV-Z]{4}){3}$/);
    expect(normalizeSaveCode(saveCode.toLowerCase().replace(/-/g, ' '))).toBe(saveCode);
    expect(normalizeSaveCode('oooo-iiii-llll-1111')).toBe('0000-1111-1111-1111');
    expect(normalizeSaveCode('太短了')).toBeNull();
    expect(normalizeSaveCode('UUUU-UUUU-UUUU-UUUU')).toBeNull(); // U 不在字母表里
  });

  it('vaultKey 是 64 位十六进制,同一个码得到同一个 key,服务器拿不到码本身', async () => {
    const vaultKey = await hashSaveCodeToVaultKey('0000-1111-2222-3333');
    expect(vaultKey).toMatch(/^[0-9a-f]{64}$/);
    expect(await hashSaveCodeToVaultKey('0000-1111-2222-3333')).toBe(vaultKey);
    expect(vaultKey).not.toContain('0000');
  });
});
