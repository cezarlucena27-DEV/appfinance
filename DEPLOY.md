# Deploy — FinanceApp na Hostinger (Implantação de GitHub)

Como funciona: o hPanel do Hostinger monitora a branch `main`. A cada `git push`,
a própria Hostinger clona, compila e reinicia a aplicação Node automaticamente.
Um único processo NestJS serve a API (`/api/*`) e o frontend React.

```
git push origin main  ──>  Hostinger detecta  ──>  install → build → start
```

---

## Configuração no hPanel (Implantação de GitHub)

| Campo | Valor |
| --- | --- |
| Repositório | cezarlucena27-DEV/appfinance |
| Filial | main |
| Diretório raiz | `backend` ou vazio — **ambos funcionam** (o frontend já vai compilado e versionado em `backend/public`) |
| Framework | NestJS (detectado) ou Padrão |
| Versão do Node | 20.x ou 22.x |

Se o painel permitir editar comandos manualmente:

- Install: `npm install`
- Build: `npm run build`
- Start: `npm run start`

> Arquitetura: um único processo NestJS serve a API (`/api/*`) e o frontend
> React. O Vite compila o frontend para `backend/public` (commitado no Git),
> então o servidor não precisa instalar dependências do frontend nem rodar o
> build do Vite. O `build` também aplica o schema do banco (`prisma db push`).

## Variáveis de ambiente (painel → variáveis de ambiente do app)

| Variável | Valor |
| --- | --- |
| `NODE_ENV` | `production` |
| `JWT_SECRET` | segredo forte novo, mínimo 32 caracteres (nunca o antigo!) |
| `JWT_REFRESH_SECRET` | outro segredo forte, **diferente** do `JWT_SECRET` |
| `SUPER_ADMIN_EMAIL` | e-mail do super administrador — **obrigatório** |
| `FRONTEND_URL` | `https://sandybrown-jellyfish-697903.hostingersite.com` |
| `DATABASE_URL` | string de conexão MySQL — ver abaixo |
| `TRUST_PROXY` | `1` atrás de proxy reverso (padrão do Hostinger); `0` se acesso direto |

> O app **recusa iniciar** se `DATABASE_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`
> (mín. 32, distintos) ou `SUPER_ADMIN_EMAIL` estiverem ausentes.

Gerar segredos: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`

Após o primeiro deploy, promova a conta do super admin (o e-mail precisa já
existir no banco): `npm run bootstrap:super-admin`.

## 🗄️ Banco de dados (MySQL)

O schema usa MySQL/MariaDB (`provider = "mysql"`) e lê `DATABASE_URL`.

Formato esperado:

```
mysql://USUARIO:SENHA@HOST:3306/NOME_DO_BANCO
```

Notas:

- Senha com caracteres especiais precisa de URL-encoding na string
  (`;` → `%3B`, `*` → `%2A`).
- Se o app rodar no **mesmo plano Hostinger** do banco, use `127.0.0.1:3306`
  como host (acesso local, sem configurar nada no painel).
- Se rodar em **outro servidor**, use o hostname mostrado em
  hPanel → Databases → Remote MySQL e libere o IP desse servidor na mesma
  página — sem isso o MySQL recusa a conexão com "Access denied for user".
- O schema do banco é aplicado automaticamente no deploy (`prisma db push`,
  melhor-esforço: se falhar, o app sobe mesmo assim e avisa nos logs).
- O backup do antigo banco Supabase já foi migrado para este MySQL
  (conversão em `backend/scripts/pg2mysql.js`); não há nada a fazer em
  novos deploys.
- Para dev local, coloque a mesma URL no `backend/.env`.

---

## Alternativa: VPS próprio com PM2

O histórico deste repo também contém o pipeline GitHub Actions + PM2
(`scripts/deploy.sh`), útil se migrar para uma VPS (Hostinger KVM etc).
Passo a passo completo na versão anterior deste arquivo ou sob demanda.

## Problemas comuns

| Sintoma | Solução |
| --- | --- |
| `Cannot GET /` ou 404 na home | Confira se o commit mais recente foi implantado (força "Redeploy"); veja logs de implantação |
| "Internal server error" ao abrir o site | Normal durante o redeploy; aguarde ~1 min e recarregue com Ctrl+F5 |
| Falha no build (memória) | O build atual é leve (só backend + Prisma); verifique se não há comando customizado rodando Vite no servidor |
| Erro de banco no start | Confira `DATABASE_URL`; rode `npm run prisma:push --prefix backend` |
| App não reiniciou | Force "Redeploy" no hPanel e confira os logs de implantação |
