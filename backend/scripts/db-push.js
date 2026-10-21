// Aplica o schema no banco. Substitui o operador "||" para funcionar em
// qualquer shell (sh, cmd, PowerShell).
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Na Hostinger os binarios do Prisma chegam sem permissao de execucao (EACCES).
function makePrismaEnginesExecutable() {
  const dirs = [
    path.join(__dirname, '..', 'node_modules', '@prisma', 'engines'),
    path.join(__dirname, '..', 'node_modules', 'prisma'),
  ];
  for (const dir of dirs) {
    let files = [];
    try { files = fs.readdirSync(dir); } catch { continue; }
    for (const file of files) {
      if (!file.startsWith('schema-engine')) continue;
      try { fs.chmodSync(path.join(dir, file), 0o755); } catch { /* sem permissao: segue */ }
    }
  }
}

function runNode(script) {
  const r = spawnSync('node', [path.join(__dirname, script)], { stdio: 'inherit' });
  if (r.status !== 0) {
    console.error(`[erro] ${script} falhou com codigo ${r.status}`);
    process.exit(r.status || 1);
  }
}

makePrismaEnginesExecutable();

const r = spawnSync('npx', ['--no-install', 'prisma', 'db', 'push', '--skip-generate'], {
  stdio: 'inherit',
  shell: true,
});

if (r.status === 0) {
  console.log('[ok] Schema aplicado no banco com sucesso');
} else {
  // O db push depende do binario schema-engine, que pode nao executar no host.
  // As tabelas novas sao garantidas a seguir pelo ensure-schema.js.
  console.warn(`[aviso] prisma db push saiu com codigo ${r.status} - usando ensure-schema`);
}

runNode('ensure-schema.js');
runNode('normalize-card-brands.js');
