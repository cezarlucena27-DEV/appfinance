# Deploy: do Git direto para o servidor (Hostinger VPS)

Como funciona: a cada `git push` na branch `main`, o GitHub Actions conecta no
seu VPS via SSH e executa `scripts/deploy.sh`, que atualiza o código, compila
e reinicia o app com PM2.

```
git push origin main  ──>  GitHub Actions  ──>  SSH no VPS  ──>  deploy.sh
                                                                    ├── git pull
                                                                    ├── npm ci + build (backend e frontend)
                                                                    ├── prisma db push
                                                                    └── pm2 reload financeapp
```

O backend também serve o frontend compilado (`frontend/dist`), então tudo roda
em um único serviço na porta 3000.

---

## 1. Preparar o servidor (só na primeira vez)

Conecte no seu VPS (hPanel Hostinger → VPS → **SSH access** / ou pelo terminal
do navegador em **Overview → Browser terminal**):

```bash
ssh root@SEU_IP
```

Instale Node.js 20, Git, PM2 e Bash:

```bash
apt update && apt install -y git curl
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
npm install -g pm2
node -v && pm2 -v   # deve mostrar v20+ e 5.x+
```

Crie a pasta e clone o repositório (repo privado: use um token do GitHub —
GitHub → Settings → Developer settings → Personal access tokens → permissão `repo`):

```bash
mkdir -p /var/www && cd /var/www
git clone https://SEU_TOKEN@github.com/cezarlucena27-DEV/opencode.git financeapp
cd financeapp
```

Crie o `.env` de produção:

```bash
cp .env.example backend/.env
nano backend/.env    # preencha JWT_SECRET, JWT_REFRESH_SECRET, ADMIN_KEY e FRONTEND_URL
```

Gere segredos fortes com:
`node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`

Faça o primeiro deploy manual (as vezes seguintes são automáticas):

```bash
bash scripts/deploy.sh main
```

Deixe o PM2 iniciar sozinho se o servidor reiniciar:

```bash
pm2 startup          # execute o comando que ele imprimir
pm2 save
```

Teste: `http://SEU_IP:3000` (libere a porta no firewall: `ufw allow 3000/tcp`
ou pelo painel Hostinger → Firewall).

---

## 2. Configurar os secrets no GitHub (só uma vez)

Repositório no GitHub → **Settings → Secrets and variables → Actions → New repository secret**:

| Secret            | Valor                                                        |
| ----------------- | ------------------------------------------------------------ |
| `SSH_HOST`        | IP do seu VPS (ex: `123.45.67.89`)                           |
| `SSH_USER`        | `root` (ou usuário criado no VPS)                            |
| `SSH_PRIVATE_KEY` | Chave privada SSH (passo abaixo)                             |
| `APP_DIR`         | `/var/www/financeapp`                                        |

Gerar a chave SSH para o deploy (rode na sua máquina ou no próprio VPS):

```bash
ssh-keygen -t ed25519 -C "deploy-financeapp" -f ~/deploy_key -N ""
# Copie o CONTEÚDO de ~/deploy_key (privada) no secret SSH_PRIVATE_KEY
# Autorize a pública no servidor:
cat ~/deploy_key.pub >> ~/.ssh/authorized_keys
```

> No Windows PowerShell use `ssh-keygen -t ed25519 -f $HOME\deploy_key -N '""'`

---

## 3. Publicar (o dia a dia)

```bash
git add .
git commit -m "minha alteracao"
git push origin main
```

Acompanhe em: repositório no GitHub → aba **Actions**. Se ficar verde, já está
no ar. Deploy manual também é possível: Actions → "Deploy para producao" → Run workflow.

---

## 4. Apontar seu domínio (opcional)

1. hPanel → Domínios → DNS → crie registro **A** apontando `@` para o IP do VPS.
2. Atualize `FRONTEND_URL` no `backend/.env` do servidor com o domínio e rode
   `bash scripts/deploy.sh main`.
3. HTTPS: instale Nginx + Certbot quando tiver domínio:
   `apt install -y nginx certbot python3-certbot-nginx`, proxy de `/` → `http://localhost:3000`,
   depois `certbot --nginx -d seudominio.com.br`.

---

## Segurança — FAÇA ANTES DO PRIMEIRO PUSH

O histórico atual do Git já contém versões antigas do `.env`, `dev.db` e
`asaas-config.json`. Eles foram removidos do projeto agora, mas **troque estes
segredos** por segurança:

- [ ] `JWT_SECRET` e `JWT_REFRESH_SECRET` novos no `.env` do servidor
- [ ] `ADMIN_KEY` nova
- [ ] Chave de API do Asaas (painel Asaas) — o `asaas-config.json` agora só existe no servidor

---

## Problemas comuns

| Sintoma | Solução |
| --- | --- |
| Actions falha em `Permission denied (publickey)` | Secret `SSH_PRIVATE_KEY` errado ou pub key não está no `authorized_keys` |
| Build do frontend falha no servidor (memória) | Adicione swap: `fallocate -l 2G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile` |
| App não sobe após deploy | `pm2 logs financeapp --lines 50` no VPS |
| Erro de banco | Verifique `backend/.env` (`DATABASE_URL`) e rode `npx prisma db push` dentro de `backend/` |
| Porta 3000 bloqueada | Libere no firewall do hPanel/UFW |
