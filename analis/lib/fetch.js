const dns = require('dns').promises;

const AI_AGENTS = [
  { label: 'GPTBot', owner: 'OpenAI' },
  { label: 'OAI-SearchBot', owner: 'OpenAI' },
  { label: 'ChatGPT-User', owner: 'OpenAI' },
  { label: 'ClaudeBot', owner: 'Anthropic' },
  { label: 'Claude-Web', owner: 'Anthropic' },
  { label: 'anthropic-ai', owner: 'Anthropic' },
  { label: 'PerplexityBot', owner: 'Perplexity' },
  { label: 'Perplexity-User', owner: 'Perplexity' },
  { label: 'Google-Extended', owner: 'Google' },
  { label: 'Applebot-Extended', owner: 'Apple' },
  { label: 'Meta-ExternalAgent', owner: 'Meta' },
  { label: 'Amazonbot', owner: 'Amazon' },
  { label: 'CCBot', owner: 'Common Crawl' },
  { label: 'Bytespider', owner: 'ByteDance' },
  { label: 'cohere-ai', owner: 'Cohere' },
  { label: 'Diffbot', owner: 'Diffbot' },
  { label: 'DataForSeoBot', owner: 'DataForSEO' },
  { label: 'ExaBot', owner: 'Exa' },
  { label: 'YouBot', owner: 'You.com' },
  { label: 'OmniBot', owner: 'Omni' }
];
const AI_AGENT_NAMES = AI_AGENTS.map(a => a.label);

const PRIVATE_IPS = [
  /^0\./, /^10\./, /^100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\./, /^127\./,
  /^169\.254\./, /^172\.(1[6-9]|2\d|3[01])\./, /^192\.168\./,
  /^::1$/i, /^fc/i, /^fd/i, /^fe80:/i, /^2001:db8/i
];

const HUMAN_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';
const AI_UA = 'Mozilla/5.0 (compatible; CognitionBot/1.0; +https://localhost:3210/) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';

function normalizeUrl(raw) {
  let url = String(raw || '').trim();
  if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
  const parsed = new URL(url);
  if (!parsed.hostname.includes('.') && parsed.hostname !== 'localhost') {
    throw new Error('Endereço inválido. Exemplo: seudominio.com.br');
  }
  return parsed;
}

async function ssrfGuard(hostname) {
  if (process.env.ALLOW_PRIVATE === '1') return;
  if (/^localhost$/i.test(hostname)) {
    throw new Error('Endereço local bloqueado por segurança (SSRF). Defina ALLOW_PRIVATE=1 apenas em ambiente local para liberar.');
  }
  let addrs;
  try {
    addrs = await dns.lookup(hostname, { all: true });
  } catch {
    throw new Error(`Falha de DNS para ${hostname}`);
  }
  for (const { address } of addrs) {
    if (PRIVATE_IPS.some(re => re.test(address))) {
      throw new Error('Endereço privado bloqueado por segurança (SSRF).');
    }
  }
}

function decodeBody(buffer, contentType) {
  let charset = 'utf-8';
  const m = (contentType || '').match(/charset=([\w-]+)/i);
  if (m) charset = m[1];
  let html = buffer.toString('utf-8');
  const meta = html.match(/<meta[^>]+charset=["']?([\w-]+)/i);
  if (meta) charset = meta[1];
  try {
    return new TextDecoder(charset).decode(buffer);
  } catch {
    return new TextDecoder('utf-8').decode(buffer);
  }
}

async function get(url, headers, timeoutMs = 20000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const started = Date.now();
  let res;
  try {
    res = await fetch(url, { headers, redirect: 'follow', signal: controller.signal });
  } catch (e) {
    clearTimeout(timer);
    return {
      status: 0,
      statusText: String(e && e.message || 'erro de rede'),
      headers: {},
      body: '',
      bytes: 0,
      elapsedMs: Date.now() - started,
      ok: false
    };
  }
  const buf = Buffer.from(await res.arrayBuffer());
  const elapsed = Date.now() - started;
  clearTimeout(timer);
  return {
    status: res.status,
    statusText: res.statusText,
    headers: Object.fromEntries(res.headers.entries()),
    body: decodeBody(buf, res.headers.get('content-type')),
    bytes: buf.length,
    elapsedMs: elapsed,
    ok: res.ok,
    finalUrl: res.url
  };
}

async function fetchLikeHuman(url) {
  return get(url, {
    'user-agent': HUMAN_UA,
    'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'accept-language': 'pt-BR,pt;q=0.9,en;q=0.8'
  });
}

async function fetchLikeAI(url) {
  return get(url, {
    'user-agent': AI_UA,
    'accept': 'text/html,application/xhtml+xml',
    'accept-language': 'en-US,en;q=0.9'
  });
}

function parseRobotsTxt(body) {
  const groups = [];
  let current = null;
  for (const raw of body.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const idx = line.indexOf(':');
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim().toLowerCase();
    const value = line.slice(idx + 1).trim();
    if (key === 'user-agent') {
      current = { agent: value.toLowerCase(), rules: [] };
      groups.push(current);
    } else if (current && key === 'disallow') {
      current.rules.push({ type: 'disallow', value });
    } else if (current && key === 'allow') {
      current.rules.push({ type: 'allow', value });
    } else if (key === 'sitemap') {
      groups.push({ agent: '__sitemap__', rules: [{ type: 'sitemap', value }] });
    }
  }
  return groups;
}

function findRobotsEntry(groups, agents) {
  const lower = agents.map(a => String(a).toLowerCase());
  let specific = null;
  let wildcard = null;
  const sitemaps = [];
  for (const g of groups) {
    if (g.agent === '__sitemap__') {
      for (const r of g.rules) if (r.type === 'sitemap') sitemaps.push(r.value);
      continue;
    }
    if (lower.includes(g.agent)) specific = g;
    if (g.agent === '*') wildcard = g;
  }
  return { specific, wildcard, sitemaps };
}

/* Avaliação de robots.txt por caminho (RFC 9309):
   - o grupo do agente específico vence o grupo '*' inteiro;
   - dentro do grupo, vence a regra com prefixo mais longo;
   - empate de comprimento favorece Allow;
   - 'Disallow:' vazio significa "nada bloqueado". */
function ruleApplies(value, pathname) {
  if (!value) return false;
  if (value.endsWith('$')) return pathname === value.slice(0, -1);
  return pathname.startsWith(value);
}

function pathAllowed(entry, pathname) {
  if (!entry) return true;
  let best = null;
  for (const r of entry.rules) {
    if (!ruleApplies(r.value, pathname)) continue;
    const len = r.value.length;
    if (!best || len > best.len || (len === best.len && r.type === 'allow')) {
      best = { type: r.type, len };
    }
  }
  return !best || best.type === 'allow';
}

function groupForAgent(groups, agent) {
  const wanted = String(agent).toLowerCase();
  let wild = null;
  for (const g of groups) {
    if (g.agent === '__sitemap__') continue;
    if (g.agent === wanted) return g;
    if (g.agent === '*') wild = g;
  }
  return wild;
}

function allowsAgent(groups, agent, pathname) {
  return pathAllowed(groupForAgent(groups, agent), pathname);
}

async function fetchRobots(origin, pathname = '/') {
  const res = await get(new URL('/robots.txt', origin).href, { 'user-agent': AI_UA }, 10000);
  if (res.status >= 400) {
    return { exists: false, status: res.status, groups: [], sitemaps: [], aiBlocked: false };
  }
  const groups = parseRobotsTxt(res.body);
  const aiEntry = findRobotsEntry(groups, AI_AGENT_NAMES);
  const aiBlocked = AI_AGENT_NAMES.some(a => !allowsAgent(groups, a, pathname));
  return { exists: true, status: res.status, groups, sitemaps: aiEntry.sitemaps, aiBlocked };
}

async function fetchSitemap(origin, sitemapsFromRobots) {
  const candidates = sitemapsFromRobots && sitemapsFromRobots.length
    ? sitemapsFromRobots
    : [new URL('/sitemap.xml', origin).href];
  for (const s of candidates) {
    try {
      const res = await get(s, { 'user-agent': AI_UA }, 10000);
      if (res.status >= 400) continue;
      const trimmed = res.body.trim();
      const isXml = trimmed.startsWith('<?xml') || trimmed.startsWith('<urlset') || trimmed.startsWith('<sitemapindex');
      const urlCount = (res.body.match(/<loc>/gi) || []).length;
      return { ok: isXml && urlCount > 0, url: s, status: res.status, urlCount };
    } catch {
      continue;
    }
  }
  return { ok: false, url: candidates[0] || '', status: 0, urlCount: 0 };
}

module.exports = {
  AI_AGENTS, AI_AGENT_NAMES, HUMAN_UA, AI_UA,
  normalizeUrl, ssrfGuard, fetchLikeHuman, fetchLikeAI,
  fetchRobots, fetchSitemap, findRobotsEntry, allowsAgent
};