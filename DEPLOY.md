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
| `JWT_SECRET` | segredo forte novo (nunca o antigo!) |
| `JWT_REFRESH_SECRET` | outro segredo forte |
| `ADMIN_KEY` | nova chave do painel admin |
| `FRONTEND_URL` | `https://sandybrown-jellyfish-697903.hostingersite.com` |
| `DATABASE_URL` | ver seção SQLite abaixo |

Gerar segredos: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`

## ⚠️ SQLite e persistência de dados

O banco padrão é `backend/prisma/dev.db`, criado dentro da pasta do app. Em
plataformas que substituem os arquivos a cada deploy, esse dado pode ser
perdido. Para produção:

1. Descubra um caminho persistente da sua conta (ex: `/home/uXXXX/`) e defina:
   `DATABASE_URL="file:/home/uXXXX/financeapp-data/prod.db"`
   (o Prisma usa essa env no lugar do schema automaticamente)
2. Faça o primeiro deploy, depois copie o db atual para lá se já tiver dados.
3. Baixe backup periodicamente pelo Gerenciador de Arquivos.

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
