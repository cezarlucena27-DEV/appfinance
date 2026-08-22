const fs = require('fs');
let content = fs.readFileSync('C:\\Users\\user\\Desktop\\opencode\\frontend\\src\\pages\\Settings.tsx', 'utf8');

// Fix 1: Replace > with > in FAQ inviting family line
let old1 = 'Master convida em Configuracoes > Usuarios. Papel: Comum ou Admin.';
let new1 = 'Master convida em Configuracoes > Usuarios. Papel: Comum ou Admin.';
console.log('Old1:', old1);
console.log('New1:', new1);
content = content.replace(old1, new1);

// Fix 2: Replace > with > in FAQ LGPD/exclusion line
let old2 = 'Configuracoes > Dados e Privacidade > Solicitar exclusao.';
let new2 = 'Configuracoes > Dados e Privacidade > Solicitar exclusao.';
console.log('Old2:', old2);
console.log('New2:', new2);
content = content.replace(old2, new2);

fs.writeFileSync('C:\\Users\\user\\Desktop\\opencode\\frontend\\src\\pages\\Settings.tsx', content);
console.log('Fixed JSX > characters');