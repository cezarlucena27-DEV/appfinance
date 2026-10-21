function requireEnv(name: string, minLength: number): string {
  const value = (process.env[name] || '').trim();
  if (value.length < minLength) {
    throw new Error(
      `[config] ${name} ausente ou muito curto (minimo ${minLength} caracteres). ` +
        'Defina a variavel de ambiente antes de iniciar a aplicacao.',
    );
  }
  return value;
}

export function getJwtSecret(): string {
  return requireEnv('JWT_SECRET', 32);
}

export function getJwtRefreshSecret(): string {
  return requireEnv('JWT_REFRESH_SECRET', 32);
}

export function getSuperAdminEmail(): string {
  return (process.env.SUPER_ADMIN_EMAIL || '').trim().toLowerCase();
}

// Unico ponto de comparacao com o super admin (normaliza espacos e caixa).
export function isSuperAdmin(email?: string | null): boolean {
  const superAdminEmail = getSuperAdminEmail();
  return !!superAdminEmail && String(email || '').trim().toLowerCase() === superAdminEmail;
}

export function validateSecurityEnv(): void {
  const jwtSecret = getJwtSecret();
  const jwtRefreshSecret = getJwtRefreshSecret();
  if (jwtSecret === jwtRefreshSecret) {
    throw new Error('[config] JWT_SECRET e JWT_REFRESH_SECRET devem ser diferentes.');
  }
  if (!getSuperAdminEmail()) {
    throw new Error('[config] SUPER_ADMIN_EMAIL nao definido. Defina o e-mail do super administrador.');
  }
}
