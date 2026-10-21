import { existsSync } from 'fs';
import { join } from 'path';

// Caminho canonico: <backend>/asaas-config.json (coberto pelo .gitignore).
// __dirname e src/common (ts-node) ou dist/common (build), ambos dois niveis abaixo do backend.
const CANONICAL_PATH = join(__dirname, '..', '..', 'asaas-config.json');

// Leitura e escrita usam sempre o mesmo arquivo. Locais antigos so sao usados
// enquanto o canonico nao existir, para nao perder uma configuracao ja salva.
export function getAsaasConfigPath(): string {
  if (existsSync(CANONICAL_PATH)) return CANONICAL_PATH;
  const legacy = [
    join(process.cwd(), 'asaas-config.json'),
    join(process.cwd(), 'backend', 'asaas-config.json'),
  ];
  for (const p of legacy) {
    if (existsSync(p)) return p;
  }
  return CANONICAL_PATH;
}
