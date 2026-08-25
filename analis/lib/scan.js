const crypto = require('crypto');
const { normalizeUrl, ssrfGuard, fetchLikeHuman, fetchLikeAI, fetchRobots, fetchSitemap } = require('./fetch');
const { buildAnalysis } = require('./parse');
const { computeMetrics, buildConsequences, buildActions, globalOf, humanTotalOf } = require('./metrics');
const { computeReach } = require('./reach');

const CACHE_TTL_MS = 3 * 60 * 1000;
const cache = new Map();

function cacheKey(url) {
  return url.href.replace(/\/$/, '');
}

function getCached(url) {
  const key = cacheKey(url);
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) return hit.result;
  cache.delete(key);
  return null;
}

function setCached(url, result) {
  const key = cacheKey(url);
  cache.set(key, { at: Date.now(), result });
  if (cache.size > 200) {
    const oldest = cache.keys().next().value;
    cache.delete(oldest);
  }
}

function serverBlockLabel(fetchRes) {
  if (fetchRes.status === 0) return { label: 'A conexão foi recusada antes do conteúdo.' };
  if (fetchRes.status === 403 || fetchRes.status === 401 || fetchRes.status === 429) {
    return { label: `O servidor recusou o acesso do leitor (status ${fetchRes.status}).` };
  }
  return { label: `A página respondeu com status ${fetchRes.status} — nada foi lido.` };
}

async function scan(rawUrl) {
  const url = normalizeUrl(rawUrl);
  await ssrfGuard(url.hostname);

  const cached = getCached(url);
  if (cached) return cached;

  const started = Date.now();

  const human = await fetchLikeHuman(url.href);
  const ai = await fetchLikeAI(url.href);

  const robots = await fetchRobots(url.origin, url.pathname).catch(() => ({ exists: false, groups: [], sitemaps: [], aiBlocked: false }));
  const sitemap = await fetchSitemap(url.origin, robots.sitemaps).catch(() => ({ ok: false, url: '', status: 0, urlCount: 0 }));

  const serverBlock = ai.status !== 200 ? serverBlockLabel(ai) : null;

  const aH = human.status === 200 ? buildAnalysis(human.body, url.origin) : null;
  const aA = ai.status === 200 ? buildAnalysis(ai.body, url.origin) : null;

  const ctx = {
    robots,
    sitemap,
    statusOk: ai.status === 200,
    otherWords: aH ? aH.words : 0,
    finalUrl: ai.finalUrl || url.href
  };
  const ctxHuman = {
    robots,
    sitemap,
    statusOk: human.status === 200,
    otherWords: aA ? aA.words : 0,
    finalUrl: human.finalUrl || url.href
  };

  const mAI = computeMetrics({
    a: aA || { words: 0, inlineScriptBytes: 0, iframes: 0, metaDesc: '', canonical: '', jsonLd: [], vagueTotal: 0, prices: 0, dates: 0, percents: 0, hasOffer: false, hasProduct: false, langAttr: null, h1s: [], hierarchyOk: true, tagCounts: {}, imgsTotal: 0, imgsNoAlt: 0, weakAnchors: [] },
    elapsedMs: ai.elapsedMs
  }, ctx);
  const mHuman = computeMetrics({
    a: aH || { words: 0, inlineScriptBytes: 0, iframes: 0, metaDesc: '', canonical: '', jsonLd: [], vagueTotal: 0, prices: 0, dates: 0, percents: 0, hasOffer: false, hasProduct: false, langAttr: null, h1s: [], hierarchyOk: true, tagCounts: {}, imgsTotal: 0, imgsNoAlt: 0, weakAnchors: [] },
    elapsedMs: human.elapsedMs
  }, ctxHuman);

  const aiScore = serverBlock ? 0 : mAI.total;
  const humanScore = human.status === 200 ? humanTotalOf(mHuman.scores) : 0;
  const gap = Math.max(0, humanScore - aiScore);

  const vectors = serverBlock
    ? mAI.vectors.map(v => ({ ...v, score: 0, status: 'bad', label: 'crítico' }))
    : mAI.vectors;
  const consequences = buildConsequences(vectors);
  const global = globalOf(aiScore, gap, serverBlock);

  const reach = computeReach(robots, aA ? aA.noindex : false, url.pathname);

  const result = {
    host: url.host,
    duration_ms: Date.now() - started,
    ai_score: aiScore,
    human_score: humanScore,
    gap,
    global_status: global.global_status,
    global_label: global.global_label,
    alert: global.alert,
    server_block: serverBlock,
    title: aA ? aA.title : null,
    raw_text: aA ? aA.text : '',
    raw_text_chars: aA ? aA.text.length : 0,
    final_url: ai.finalUrl || url.href,
    framable: aA ? aA.framableByHeaders(ai.headers) && /^https?:$/.test(new URL(ai.finalUrl || url.href).protocol) : false,
    og_image: aA ? aA.ogImage : '',
    description: aA ? aA.description : '',
    consequences,
    vectors,
    actions: buildActions(vectors, !!serverBlock),
    reach,
    ev_id: crypto.randomBytes(8).toString('hex')
  };

  setCached(url, result);
  return result;
}

module.exports = { scan, getCached };