const fs = require('fs');
let c = fs.readFileSync('C:\\Users\\user\\Desktop\\opencode\\frontend\\src\\pages\\Settings.tsx', 'utf8');

// Fix 1: Replace > with > (JSX escape) - new string has the HTML entity > (ampersand-g-t-semicolon)
let old1 = 'Master convida em Configuracoes > Usuarios. Papel: Comum ou Admin.';
let new1 = 'Master convida em Configuracoes ' + '&' + 'gt;' + ' Usuarios. Papel: Comum ou Admin.';
console.log('Old1:', old1);
console.log('New1:', new1);
c = c.replace(old1, new1);

// Fix 2: Replace > with > (JSX escape)
let old2 = 'Configuracoes > Dados e Privacidade > Solicitar exclusao.';
let new2 = 'Configuracoes ' + '&' + 'gt;' + ' Dados e Privacidade ' + '&' + 'gt;' + ' Solicitar exclusao.';
console.log('Old2:', old2);
console.log('New2:', new2);
c = c.replace(old2, new2);

fs.writeFileSync('C:\\Users\\user\\Desktop\\opencode\\frontend\\src\\pages\\Settings.tsx', c);
console.log('Fixed!');
console.log('Line 463:', c.split('\n')[462]);
console.log('Line 468:', c.split('\n')[467]);