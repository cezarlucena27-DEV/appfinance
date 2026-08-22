// Fix JSX > characters in Settings.tsx
const fs = require('fs');
let c = fs.readFileSync('C:\\Users\\user\\Desktop\\opencode\\frontend\\src\\pages\\Settings.tsx', 'utf8');

// Fix 1: Replace > with > in FAQ inviting family line (escape for JSX)
 // Key: replacement has > not just >
c = c.replace(
  'Master convida em Configuracoes > Usuarios. Papel: Comum ou Admin.',
  'Master convida em Configuracoes > Usuarios. Papel: Comum ou Admin.'
);

// Fix 2: Replace > with > in FAQ LGPD/exclusion line (escape for JSX)
 // Key: replacement has > not just >
c = c.replace(
  'Configuracoes > Dados e Privacidade > Solicitar exclusao.',
  'Configuracoes > Dados e Privacidade > Solicitar exclusao.'
);

fs.writeFileSync('C:\\Users\\user\\Desktop\\opencode\\frontend\\src\\pages\\Settings.tsx', c);
console.log('Fixed JSX > characters');
console.log('Line 463:', c.split('\n')[462]);
console.log('Line 468:', c.split('\n')[467]);
"