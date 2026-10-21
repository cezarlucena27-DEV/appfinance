const SENSITIVE_KEY = /pass(word)?|senha|token|secret|authorization|api[_-]?key|hash/i;
const MAX_STRING_LENGTH = 2000;

export function redactSensitive<T>(value: T, depth = 0): T {
  if (value === null || value === undefined) return value;
  if (depth > 8) return '[omitido]' as unknown as T;
  if (typeof value === 'string') {
    return (value.length > MAX_STRING_LENGTH ? value.slice(0, MAX_STRING_LENGTH) : value) as unknown as T;
  }
  if (typeof value !== 'object') return value;
  if (value instanceof Date || Buffer.isBuffer(value)) return value;

  if (Array.isArray(value)) {
    return value.map((item) => redactSensitive(item, depth + 1)) as unknown as T;
  }

  const result: Record<string, unknown> = {};
  for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
    result[key] = SENSITIVE_KEY.test(key) ? '[REDIGIDO]' : redactSensitive(item, depth + 1);
  }
  return result as T;
}
