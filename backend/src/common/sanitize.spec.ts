import { redactSensitive } from './sanitize';

describe('redactSensitive', () => {
  it('remove chaves sensiveis', () => {
    const result = redactSensitive({
      email: 'user@example.com',
      password: 'segredo',
      senha: 'x',
      access_token: 'abc',
      apiKey: 'k',
      passwordHash: 'h',
      Authorization: 'Bearer x',
    }) as Record<string, unknown>;

    expect(result.email).toBe('user@example.com');
    expect(result.password).toBe('[REDIGIDO]');
    expect(result.senha).toBe('[REDIGIDO]');
    expect(result.access_token).toBe('[REDIGIDO]');
    expect(result.apiKey).toBe('[REDIGIDO]');
    expect(result.passwordHash).toBe('[REDIGIDO]');
    expect(result.Authorization).toBe('[REDIGIDO]');
  });

  it('redige aninhado e em arrays', () => {
    const result = redactSensitive({ a: [{ password: 'x', ok: 1 }] }) as any;
    expect(result.a[0].password).toBe('[REDIGIDO]');
    expect(result.a[0].ok).toBe(1);
  });

  it('trunca strings longas', () => {
    const long = 'a'.repeat(3000);
    expect((redactSensitive(long) as unknown as string).length).toBe(2000);
  });

  it('preserva Date e nao quebra com primitivos', () => {
    const date = new Date();
    expect(redactSensitive(date)).toBe(date);
    expect(redactSensitive(42)).toBe(42);
    expect(redactSensitive(null)).toBeNull();
  });
});
