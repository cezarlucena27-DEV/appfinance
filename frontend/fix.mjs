import fs from 'fs';
const filePath = 'C:\\Users\\user\\Desktop\\opencode\\frontend\\src\\pages\\Settings.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Replace > with > in JSX text content (escape for JSX)
content = content.replace(
  'Master convida em Configuracoes > Usuarios. Papel: Comum ou Admin.',
  'Master convida em Configuracoes > Usuarios. Papel: Comum ou Admin.'
);
content = content.replace(
  'Configuracoes > Dados e Privacidade > Solicitar exclusao.',
  'Configuracoes > Dados e Privacidade > Solicitar exclusao.'
);

fs.writeFileSync(filePath, content);
console.log('Fixed!');