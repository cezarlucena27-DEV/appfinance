const VECTORS = [
  {
    key: 'latencia',
    glyph: '🧠',
    name: 'Latência Cognitiva',
    mede: 'Quanto do seu conteúdo chega inteiro ao modelo já na primeira resposta.',
    ok: 'a sua mensagem chega inteira no primeiro contato',
    warn: 'os modelos leem fragmentos e completam o resto sozinhos',
    bad: 'o modelo quase não recebe conteúdo e conclui sobre você a partir do que achou por aí'
  },
  {
    key: 'fronteira',
    glyph: '🚪',
    name: 'Fronteira Operacional',
    mede: 'Se as portas de entrada estão declaradas e abertas para os leitores de IA.',
    ok: 'as portas de entrada estão abertas para quem gera respostas',
    warn: 'parte das portas de entrada está fechada',
    bad: 'você está recusando as visitas que chegariam já prontas para comprar'
  },
  {
    key: 'cartografia',
    glyph: '🗺️',
    name: 'Cartografia de Origem',
    mede: 'Se existe mapa e sinalização guiando o modelo pelo seu conteúdo.',
    ok: 'existe orientação clara guiando o modelo pelo seu conteúdo',
    warn: 'a orientação do conteúdo é parcial',
    bad: 'a IA escolhe sozinha qual página sua citar — raramente é a que vende'
  },
  {
    key: 'densidade',
    glyph: '⚖️',
    name: 'Densidade Declarativa',
    mede: 'Quanto da sua oferta está afirmado como fato, pronto para virar citação.',
    ok: 'o essencial da sua oferta está afirmado como fato',
    warn: 'parte da oferta fica à interpretação da máquina',
    bad: 'preço, formato e promessa da sua oferta chegam errados do outro lado'
  },
  {
    key: 'coerencia',
    glyph: '📐',
    name: 'Coerência de Sinal',
    mede: 'Se a estrutura da página sustenta uma citação sem ambiguidade.',
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
    fronteira: fronteira({
      statusOk: ctx.statusOk,
      robots: ctx.robots,
      sitemapDeclared: !!(ctx.robots && Array.isArray(ctx.robots.sitemaps) && ctx.robots.sitemaps.length > 0),
      elapsedMs: fetchData.elapsedMs
    }),
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
    key: v.key,
    glyph: v.glyph,
    name: v.name,
    label: STATUS_LABEL[statusOf(scores[v.key])],
    status: statusOf(scores[v.key]),
    score: scores[v.key],
    urgency: scores[v.key] >= 80 ? v.ok : scores[v.key] >= 50 ? v.warn : v.bad,
    mede: v.mede,
    fazer: ACTIONS[v.key].texto
  }));
}

/* Ações em linguagem simples, para quem não é técnico.
   Cada passo traz, entre aspas, a frase pronta para repassar
   ao responsável pelo site. */
const ACTIONS = {
  fronteira: {
    titulo: 'Abra a porta de entrada dos leitores de IA',
    texto: 'O site tem um arquivo público que decide quem pode ler as páginas (o robots.txt). ' +
      'Hoje ele está fechando a porta justamente para quem traria clientes sem custo de anúncio. ' +
      'Peça, nesses termos: “liberar os leitores GPTBot, ClaudeBot, PerplexityBot e Google-Extended no robots.txt”.'
  },
  latencia: {
    titulo: 'Faça o conteúdo principal virar pronto na primeira resposta',
    texto: 'Parte da sua página só aparece depois que o navegador junta as peças (o JavaScript). ' +
      'Quem gera respostas de IA não junta peças: lê o que chegar de primeira e segue. ' +
      'Leve esta frase ao responsável pelo site: “colocar o texto principal direto no HTML inicial (renderização no servidor)”.'
  },
  cartografia: {
    titulo: 'Deixe um mapa do conteúdo à mão',
    texto: 'Sem um mapa, cada sistema escolhe sozinho qual página sua citar — e raramente escolhe a que vende. ' +
      'O mapa é um arquivo que lista suas páginas (sitemap.xml), mais uma frase-resumo descrevendo cada página importante. ' +
      'Peça: “criar ou atualizar o sitemap.xml e escrever a meta description das páginas principais”.'
  },
  densidade: {
    titulo: 'Afirme preço, prazo e garantia como fato',
    texto: 'Frases vagas — “entre em contato”, “sob consulta”, “a melhor da região” — não viram citação. ' +
      'Números e promessas explícitas viram: quanto custa, em quanto tempo entrega, qual a garantia, quais os pagamentos aceitos. ' +
      'Revise as páginas principais e troque cada frase vaga por um dado concreto.'
  },
  coerencia: {
    titulo: 'Organize a página como um documento',
    texto: 'Um título grande por página (H1), subtítulos em ordem, parágrafos curtos e links com nome claro ' +
      '(“ver tabela de preços”, não “clique aqui”). É essa estrutura que permite citar você sem distorcer o que você disse.'
  }
};

const ACTION_ORDER = ['fronteira', 'latencia', 'cartografia', 'densidade', 'coerencia'];
const ACTION_OK = {
  chave: 'ok',
  severidade: 'ok',
  titulo: 'Mantenha o padrão de hoje',
  texto: 'Esta análise não encontrou ponto crítico. A nota muda sozinha quando o site, a hospedagem ou ' +
    'os próprios sistemas de IA mudam — vale repetir a análise de vez em quando, principalmente depois de qualquer alteração no site.'
};

function buildActions(vectors, serverBlock) {
  const st = {};
  for (const v of vectors) if (v.key) st[v.key] = v.status;

  const itens = [];
  for (const k of ACTION_ORDER) {
    if (st[k] === 'bad' || st[k] === 'warn') {
      itens.push({ chave: k, severidade: st[k], titulo: ACTIONS[k].titulo, texto: ACTIONS[k].texto });
    }
  }
  if (!itens.length) return [ACTION_OK];

  if (serverBlock) {
    itens.sort((a) => a.chave === 'fronteira' ? -1 : 0);
  }
  return itens;
}

function buildConsequences(vectors) {
  return vectors.map(v => {
    if (v.status === 'ok') return `${v.name}: ${v.urgency}.`;
    return `${v.name}: ${v.label}. ${v.urgency[0].toUpperCase()}${v.urgency.slice(1)}.`;
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

function computeMetrics(fetchData, ctx) {
  ctx = ctx || {};
  const score = compute(
    { a: fetchData.a, elapsedMs: fetchData.elapsedMs },
    {
      otherWords: ctx.otherWords,
      statusOk: ctx.statusOk,
      robots: ctx.robots,
      sitemap: ctx.sitemap,
      finalUrl: ctx.finalUrl
    }
  );
  const vectors = buildVectors(score.scores);
  return {
    total: score.total,
    scores: score.scores,
    vectors
  };
}

/* A leitura humana usa só os componentes que fazem sentido para uma pessoa:
   a mensagem chega inteira (Latência), a oferta é afirmada como fato
   (Densidade) e a estrutura sustenta o que foi dito (Coerência).
   Portas para robôs e mapas de máquina são critérios exclusivos da
   leitura de IA — por isso o Gap pode existir mesmo sem bloqueio algum.
   Pesos proporcionais aos originais, renormalizados: 30:15:15 → 50:25:25. */
function humanTotalOf(scores) {
  return cap(
    scores.latencia * 0.5 +
    scores.densidade * 0.25 +
    scores.coerencia * 0.25
  );
}

module.exports = { computeMetrics, buildConsequences, buildActions, globalOf, humanTotalOf, WEIGHTS, VECTORS };