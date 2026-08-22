# Deploy — FinanceApp na Hostinger (Implantação de GitHub)

Como funciona: o hPanel do Hostinger monitora a branch `main`. A cada `git push`,
a própria Hostinger clona, compila e reinicia a aplicação Node automaticamente.
Um único processo NestJS serve a API (`/api/*`) e o frontend React.

```
git push origin main  ──>  Hostinger detecta  ──>  npm install → build → start
                                                   (package.json da raiz orquestra tudo)
```

---

## Configuração no hPanel (Implantação de GitHub)

| Campo | Valor |
| --- | --- |
| Repositório | cezarlucena27-DEV/appfinance |
| Filial | main |
| Diretório raiz | **(vazio / raiz do repo)** — NÃO usar `backend` |
| Framework | Padrão (usa os scripts do `package.json` da raiz) |
| Versão do Node | 20.x ou 22.x |

Se o painel permitir editar comandos manualmente:

- Install: `npm install`
- Build: `npm run build`
- Start: `npm run start`

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
| `Cannot GET /` | Frontend não compilado/achado — veja logs; garanta raiz = raiz do repo e commit recente |
| Falha no build (memória) | Reduza para build só do backend + commite `frontend/dist` pronto |
| Erro de banco no start | Confira `DATABASE_URL`; rode `npm run prisma:push --prefix backend` |
| App não reiniciou | Force "Redeploy" no hPanel e confira os logs de implantação |
