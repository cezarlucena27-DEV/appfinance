// Aplica o schema no banco sem nunca falhar o deploy.
// Substitui o operador "||" para funcionar em qualquer shell (sh, cmd, PowerShell).
const { spawnSync } = require('child_process');

try {
  const r = spawnSync('npx', ['--no-install', 'prisma', 'db', 'push', '--skip-generate'], {
    stdio: 'inherit',
    shell: true,
  });
  console.log(
    r.status === 0
      ? '[ok] Schema aplicado no banco com sucesso'
      : `[aviso] prisma db push saiu com codigo ${r.status} - o app vai subir mesmo assim`,
  );
} catch (e) {
  console.log('[aviso] Nao foi possivel executar prisma db push:', e.message);
}
process.exit(0);
