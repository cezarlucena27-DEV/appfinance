const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { scan } = require('./lib/scan');
const { record, removeHost, history } = require('./lib/store');

const PORT = process.env.PORT || 3210;
const PUBLIC = path.join(__dirname, 'public');

const tokens = new Map();
const TOKEN_TTL_MS = 30 * 60 * 1000;
const RATE_WINDOW_MS = 60 * 1000;
const RATE_MAX = 6;
const rateHits = new Map();

function newToken() {
  const t = crypto.randomBytes(16).toString('hex');
  tokens.set(t, Date.now() + TOKEN_TTL_MS);
  return t;
}

function checkToken(t) {
  if (!t) return false;
  const exp = tokens.get(t);
  if (!exp) return false;
  if (Date.now() > exp) {
    tokens.delete(t);
    return false;
  }
  tokens.delete(t);
  return true;
}

function checkRate(ip) {
  const now = Date.now();
  const w = rateHits.get(ip) || [];
  const fresh = w.filter(t => now - t < RATE_WINDOW_MS);
  if (fresh.length >= RATE_MAX) {
    rateHits.set(ip, fresh);
    return false;
  }
  fresh.push(now);
  rateHits.set(ip, fresh);
  return true;
}

const META = {
  scanToken: 'scan-token',
  baseUrl: 'base-url',
  planosUrl: 'planos-url',
  whatsapp: 'whatsapp',
  whatsappMsg: 'whatsapp-msg'
};

function readIndex(token) {
  let html = fs.readFileSync(path.join(PUBLIC, 'index.html'), 'utf8');
  html = html.replace(`content="__SCAN_TOKEN__"`, `content="${token}"`);
  return html;
}

function readBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', (c) => { body += c; if (body.length > 1e6) req.destroy(); });
    req.on('end', () => resolve(body));
    req.on('error', () => resolve(''));
  });
}

function sendJson(res, code, obj) {
  res.writeHead(code, { 'content-type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(obj));
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const p = url.pathname;

  if (p === '/' || p === '/index.html') {
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    res.end(readIndex(newToken()));
    return;
  }

  if (p === '/assets/app.js' || p === '/assets/app.css') {
    const file = path.join(PUBLIC, p.replace(/^\/assets\//, ''));
    if (!fs.existsSync(file)) {
      res.writeHead(404); res.end();
      return;
    }
    res.writeHead(200, {
      'content-type': p.endsWith('.js') ? 'text/javascript; charset=utf-8' : 'text/css; charset=utf-8',
      'cache-control': 'no-store'
    });
    res.end(fs.readFileSync(file, 'utf8'));
    return;
  }

  if (p === '/planos') {
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    res.end(fs.readFileSync(path.join(PUBLIC, 'planos.html'), 'utf8'));
    return;
  }

  if (p === '/exemplo') {
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    res.end(fs.readFileSync(path.join(PUBLIC, 'exemplo.html'), 'utf8'));
    return;
  }

  if (p === '/robots.txt') {
    res.writeHead(200, { 'content-type': 'text/plain; charset=utf-8' });
    res.end('User-agent: *\nAllow: /\nSitemap: http://localhost:3210/sitemap.xml\n');
    return;
  }

  if (p === '/sitemap.xml') {
    res.writeHead(200, { 'content-type': 'application/xml; charset=utf-8' });
    res.end('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>http://localhost:3210/exemplo</loc></url>\n</urlset>\n');
    return;
  }

  if (p === '/api/scan.php' && req.method === 'POST') {
    const ip = req.socket.remoteAddress || 'local';
    let body;
    try {
      body = JSON.parse(await readBody(req) || '{}');
    } catch {
      return sendJson(res, 400, { error: 'Requisição inválida.' });
    }
    if (!checkToken(body.token)) {
      return sendJson(res, 200, { code: 'token' });
    }
    if (!checkRate(ip)) {
      return sendJson(res, 429, { error: 'Muitas análises em pouco tempo. Aguarde um minuto e tente de novo.' });
    }
    if (!body.url || !String(body.url).trim()) {
      return sendJson(res, 400, { error: 'Digite o endereço do seu site — exemplo: seudominio.com.br' });
    }
    try {
      const result = await scan(String(body.url).trim());
      result.token = newToken();
      record(result.host, result);
      return sendJson(res, 200, result);
    } catch (e) {
      const msg = String(e && e.message || e);
      const status = /bloqueado|inválido|Falha de DNS|privado/i.test(msg) ? 400 : 502;
      return sendJson(res, status, { error: msg });
    }
  }

  if (p === '/api/remover' && req.method === 'POST') {
    let body;
    try {
      body = JSON.parse(await readBody(req) || '{}');
    } catch {
      return sendJson(res, 400, { error: 'Requisição inválida.' });
    }
    if (!body.host) return sendJson(res, 400, { error: 'Informe o host.' });
    const left = removeHost(String(body.host));
    return sendJson(res, 200, { removido: true, restantes: left });
  }

  if (p === '/api/historico' && req.method === 'GET') {
    return sendJson(res, 200, { total: history().length, historico: history().slice(0, 50) });
  }

  res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
  res.end('Não encontrado');
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`A porta ${PORT} já está em uso. O servidor já pode estar rodando.`);
    console.error('Abra http://localhost:' + PORT + ' no navegador.');
    process.exit(1);
  }
  throw err;
});

server.listen(PORT, () => {
  console.log('====================================================');
  console.log('  Índice de Visibilidade Cognitiva (réplica local)');
  console.log('  Abra no navegador: http://localhost:' + PORT);
  console.log('  Referência local (nota alta): http://localhost:' + PORT + '/exemplo');
  console.log('====================================================');
});