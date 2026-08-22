const fs = require('fs');
let c = fs.readFileSync('C:\\Users\\user\\Desktop\\opencode\\frontend\\src\\pages\\Settings.tsx', 'utf8');

// Fix 1: Replace > with > in the FAQ inviting family line
c = c.replace(
  'Master convida em Configuracoes > Usuarios. Papel: Comum ou Admin.',
  'Master convida em Configuracoes > Usuarios. Papel: Comum ou Admin.'
);

// Fix 2: Replace > with > in the FAQ LGPD/exclusion line
c = c.replace(
  'Configuracoes > Dados e Privacidade > Solicitar exclusao.',
  'Configuracoes > Dados e Privacidade > Solicitar exclusao.'
);

fs.writeFileSync('C:\\Users\\user\\Desktop\\opencode\\frontend\\src\\pages\\Settings.tsx', c);
console.log('Fixed');