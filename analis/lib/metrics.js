const VECTORS = [
  {
    key: 'latencia',
    glyph: '🧠',
    name: 'Latência Cognitiva',
    ok: 'a sua mensagem chega inteira no primeiro contato',
    warn: 'os modelos leem fragmentos e completam o resto sozinhos',
    bad: 'o modelo quase não recebe conteúdo e conclui sobre você a partir do que achou por aí'
  },
  {
    key: 'fronteira',
    glyph: '🚪',
    name: 'Fronteira Operacional',
    ok: 'as portas de entrada estão abertas para quem gera respostas',
    warn: 'parte das portas de entrada está fechada',
    bad: 'você está recusando as visitas que chegariam já prontas para comprar'
  },
  {
    key: 'cartografia',
    glyph: '🗺️',
    name: 'Cartografia de Origem',
    ok: 'existe orientação clara guiando o modelo pelo seu conteúdo',
    warn: 'a orientação do conteúdo é parcial',
    bad: 'a IA escolhe sozinha qual página sua citar — raramente é a que vende'
  },
  {
    key: 'densidade',
    glyph: '⚖️',
    name: 'Densidade Declarativa',
    ok: 'o essencial da sua oferta está afirmado como fato',
    warn: 'parte da oferta fica à interpretação da máquina',
    bad: 'preço, formato e promessa da sua oferta chegam errados do outro lado'
  },
  {
    key: 'coerencia',
    glyph: '📐',
    name: 'Coerência de Sinal',
    ok: 'a estrutura da página sustenta uma citação sem ambiguidade',
    warn: 'a citação sai com ruído',
    bad: 'você continua sendo citado, mas o resumo sai diferente do que você diria'
  }
];

const cap = (v) => Math.max(0, Math.min(100, Math.round(v)));

function statusOf(score) {
  if (score >= 80) return 'ok';
  if (score >= 50) return 'warn';
  return 'bad';
}

const STATUS_LABEL = { ok: 'em ordem', warn: 'com perdas', bad: 'crítico' };

function latencia(a, otherWords, statusOk) {
  if (!statusOk) return 0;
  let s = 60;
  if (a.words >= 800) s += 20;
  else if (a.words >= 300) s += 10;
  if (a.inlineScriptBytes <= 5000 && a.iframes === 0) s += 10;
  const ratio = otherWords > 0 ? a.words / otherWords : 1;
  if (ratio >= 0.9) s += 10;
  else if (ratio >= 0.5) s += 5;
  return cap(s);
}

function fronteira({ statusOk, robots, sitemapDeclared, elapsedMs }) {
  let s = 65;
  if (statusOk) s += 10;
  else s -= 40;
  if (robots.exists && !robots.aiBlocked) s += 10;
  if (sitemapDeclared) s += 10;
  if (statusOk && elapsedMs < 3000) s += 5;
  return cap(s);
}

function cartografia({ a, sitemap, finalUrl }) {
  let s = 50;
  if (a.metaDesc) s += a.metaDesc.length >= 70 && a.metaDesc.length <= 160 ? 15 : 7;
  if (a.canonical) {
    const same = a.canonical.replace(/\/+$/, '') === String(finalUrl).replace(/\/+$/, '');
    s += same ? 15 : 5;
  }
  const valid = a.jsonLd.filter(Boolean).length;
  if (valid >= 2) s += 10;
  else if (valid === 1) s += 6;
  if (sitemap.ok && sitemap.urlCount > 0) s += 10;
  else if (sitemap.url) s += 4;
  return cap(s);
}

function densidade({ a }) {
  let s = 55;
  const fatos = a.prices + a.dates + a.percents;
  if (fatos >= 4) s += 15;
  else if (fatos >= 1) s += 8;
  if (a.hasOffer || a.hasProduct) s += 15;
  const pct = a.words ? (a.vagueTotal / a.words) * 100 : 0;
  if (pct <= 2) s += 15;
  else if (pct <= 5) s += 8;
  return cap(s);
}

function coerencia({ a }) {
  let s = 55;
  if (a.langAttr) s += 8;
  if (a.h1s.length === 1) s += 7;
  if (a.hierarchyOk) s += 7;
  const sem = Object.values(a.tagCounts).filter(v => v > 0).length;
  if (sem >= 3) s += 8;
  else if (sem >= 2) s += 4;
  const imgsOk = a.imgsTotal === 0 || a.imgsNoAlt === 0;
  const halfOk = a.imgsTotal > 0 && a.imgsNoAlt <= a.imgsTotal / 2;
  if (imgsOk) s += 8;
  else if (halfOk) s += 4;
  if (a.weakAnchors.length === 0) s += 7;
  return cap(s);
}

const WEIGHTS = {
  latencia: 0.30,
  fronteira: 0.20,
  cartografia: 0.20,
  densidade: 0.15,
  coerencia: 0.15
};

function compute(fetchData, ctx) {
  const scores = {
    latencia: latencia(fetchData.a, ctx.otherWords, ctx.statusOk),
    fronteira: fronteira({ statusOk: ctx.statusOk, robots: ctx.robots, sitemapDeclared: ctx.robots.sitemaps.length > 0, elapsedMs: fetchData.elapsedMs }),
    cartografia: cartografia({ a: fetchData.a, sitemap: ctx.sitemap, finalUrl: ctx.finalUrl }),
    densidade: densidade({ a: fetchData.a }),
    coerencia: coerencia({ a: fetchData.a })
  };
  let total = 0;
  for (const k of Object.keys(WEIGHTS)) total += scores[k] * WEIGHTS[k];
  return { scores, total: cap(total) };
}

function buildVectors(scores) {
  return VECTORS.map(v => ({
    glyph: v.glyph,
    name: v.name,
    label: STATUS_LABEL[statusOf(scores[v.key])],
    status: statusOf(scores[v.key]),
    score: scores[v.key],
    urgency: scores[v.key] >= 80 ? v.ok : scores[v.key] >= 50 ? v.warn : v.bad
  }));
}

function buildConsequences(vectors) {
  return vectors.map(v => {
    if (v.status === 'ok') return `${v.name}: ${v.urgency}.`;
    return `${v.name} em ${v.label}. ${v.urgency[0].toUpperCase()}${v.urgency.slice(1)}.`;
  });
}

function globalOf(score, gap, serverBlock) {
  if (serverBlock) {
    return {
      global_status: 'critico',
      global_label: 'Crítico',
      alert: 'Nada do que existe na sua página chegou ao modelo. Para qualquer sistema de IA, ela não existe.'
    };
  }
  if (score >= 90) {
    return {
      global_status: 'otimo',
      global_label: 'Ótimo',
      alert: 'A sua página tem condição de ser a fonte da resposta.'
    };
  }
  if (score >= 50) {
    return {
      global_status: 'alerta',
      global_label: 'Precisa de atenção',
      alert: gap >= 20
        ? `A leitura caiu ${gap} pontos quando o leitor virou máquina. É exatamente aí que a sua mensagem se perde.`
        : 'Parte do seu conteúdo não chega aos modelos — e é essa parte que vira resposta, indicação e venda.'
    };
  }
  return {
    global_status: 'critico',
    global_label: 'Crítico',
    alert: 'Os modelos não conseguem ler o essencial da sua página. O que responderem sobre você será concluído por eles.'
  };
}

function computeMetrics({ a, robots, sitemap, statusOk, otherWords, elapsedMs, finalUrl }) {
  const score = compute({ a, elapsedMs }, { otherWords, statusOk, robots, sitemap, finalUrl });
  const vectors = buildVectors(score.scores);
  return {
    total: score.total,
    scores: score.scores,
    vectors
  };
}

module.exports = { computeMetrics, buildConsequences, globalOf, WEIGHTS, VECTORS };