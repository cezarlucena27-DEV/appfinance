// Aplica o schema no banco e falha o deploy se nao for possivel.
// Substitui o operador "||" para funcionar em qualquer shell (sh, cmd, PowerShell).
const { spawnSync } = require('child_process');

const r = spawnSync('npx', ['--no-install', 'prisma', 'db', 'push', '--skip-generate'], {
  stdio: 'inherit',
  shell: true,
});

if (r.status !== 0) {
  console.error(`[erro] prisma db push falhou com codigo ${r.status}`);
  process.exit(r.status || 1);
}
console.log('[ok] Schema aplicado no banco com sucesso');

const n = spawnSync('node', [require('path').join(__dirname, 'normalize-card-brands.js')], { stdio: 'inherit' });
if (n.status !== 0) {
  console.error(`[erro] normalizacao de bandeiras falhou com codigo ${n.status}`);
  process.exit(n.status || 1);
}
