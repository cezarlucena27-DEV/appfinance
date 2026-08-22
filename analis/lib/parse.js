const VAGUE_WORDS = [
  'solução', 'soluções', 'inovador', 'inovadora', 'inovação', 'melhor', 'qualidade',
  'excelência', 'compromisso', 'experiência', 'personalizado', 'personalizada',
  'atendimento', 'rápido', 'rápida', 'moderno', 'moderna', 'diferenciado',
  'diferenciada', 'líder', 'liderança', 'referência', 'confiança', 'segurança',
  'agilidade', 'resultado', 'resultados', 'expert', 'expertise', 'premium',
  'alta performance', 'elevado padrão', 'comprometimento', 'dedicação',
  'exclusivo', 'exclusiva', 'praticidade', 'prático', 'prática', 'simplicidade',
  'transparência', 'ética', 'responsabilidade', 'valorização', 'respeito',
  'parceria', 'satisfação', 'sucesso', 'eficiência', 'produtividade'
];

const ENTITY_MAP = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', ndash: '–',
  mdash: '—', hellip: '…', copy: '©', reg: '®', trade: '™', eacute: 'é',
  egrave: 'è', ecirc: 'ê', aacute: 'á', agrave: 'à', acirc: 'â', oacute: 'ó',
  ocirc: 'ô', uacute: 'ú', ucirc: 'û', iacute: 'í', icirc: 'î', ccedil: 'ç',
  atilde: 'ã', otilde: 'õ', ntilde: 'ñ', sdot: '·', middot: '·', rsquo: '’',
  lsquo: '‘', rdquo: '”', ldquo: '“', raquo: '»', laquo: '«'
};

function decodeEntities(text) {
  return text
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(parseInt(d, 10)))
    .replace(/&([a-zA-Z]+);/g, (m, name) => ENTITY_MAP[name.toLowerCase()] ?? m);
}

function stripTags(text) {
  return text
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript\b[^>]*>[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ');
}

function extractText(html) {
  return decodeEntities(stripTags(String(html || ''))).trim();
}

function countWords(text) {
  return (text.match(/[A-Za-zÀ-ÿ0-9$%€£¥]+(?:[./-][A-Za-zÀ-ÿ0-9]+)*/g) || []).length;
}

function parseHeadings(html) {
  const levels = [];
  for (let i = 1; i <= 6; i++) {
    const re = new RegExp(`<h${i}\\b[^>]*>([\\s\\S]*?)<\\/h${i}>`, 'gi');
    let m;
    while ((m = re.exec(html)) !== null) {
      levels.push({ level: i, text: decodeEntities(stripTags(m[1])).trim(), idx: m.index });
    }
  }
  levels.sort((a, b) => a.idx - b.idx);
  return levels;
}

function parseLinks(html, baseUrl) {
  const links = [];
  const re = /<a\b[^>]*href=["']([^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    const text = decodeEntities(stripTags(m[2])).trim();
    if (!text) continue;
    let target = null;
    try {
      target = new URL(m[1], baseUrl).href;
    } catch {
      continue;
    }
    links.push({ text, target, internal: target.startsWith(baseUrl) });
  }
  return links;
}

function parseJsonLd(html) {
  const blocks = [];
  const re = /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    try {
      blocks.push(JSON.parse(decodeEntities(m[1]).trim()));
    } catch {
      blocks.push(null);
    }
  }
  return blocks;
}

function buildAnalysis(html, baseUrl) {
  html = String(html || '');
  const text = extractText(html);
  const words = countWords(text);
  const headings = parseHeadings(html);
  const links = parseLinks(html, baseUrl);
  const jsonLd = parseJsonLd(html);
  const schemaTypes = [...new Set(
    jsonLd.filter(Boolean).flatMap(b => {
      const t = b['@type'];
      if (Array.isArray(t)) return t;
      if (b['@graph']) return b['@graph'].map(g => g['@type']).filter(Boolean);
      return [t];
    })
  )];
  const scripts = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)]
    .map(m => {
      const attrs = m[0].match(/<script\b([^>]*)>/i)[1];
      const src = (attrs.match(/src=["']([^"']*)["']/i) || [])[1];
      return { inline: !src, bytes: m[1].length };
    });
  const inlineScriptBytes = scripts.filter(s => s.inline).reduce((a, s) => a + s.bytes, 0);
  const lazyCount = [...html.matchAll(/<img\b[^>]*loading=["']lazy["']/gi)].length;
  const iframes = (html.match(/<iframe\b/gi) || []).length;
  const imgsTotal = (html.match(/<img\b/gi) || []).length;
  const imgsNoAlt = (html.match(/<img\b(?![^>]*\balt=)[^>]*>/gi) || []).length;
  const langAttr = ((html.match(/<html\b[^>]*lang=["']([\w-]+)["']/i) || [])[1]) || null;
  const title = decodeEntities(stripTags((html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || '')).trim();
  const metaDesc = (html.match(/<meta\b[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i) || [])[1] || '';
  const canonical = (html.match(/<link\b[^>]*rel=["']canonical["'][^>]*href=["']([^"']*)["']/i) || [])[1] || '';
  const ogImage = (html.match(/<meta\b[^>]*property=["']og:image["'][^>]*content=["']([^"']*)["']/i) || [])[1]
    || (html.match(/<meta\b[^>]*content=["']([^"']*)["'][^>]*property=["']og:image["']/i) || [])[1] || '';
  const ogDescription = (html.match(/<meta\b[^>]*property=["']og:description["'][^>]*content=["']([^"']*)["']/i) || [])[1]
    || (html.match(/<meta\b[^>]*content=["']([^"']*)["'][^>]*property=["']og:description["']/i) || [])[1] || '';
  const description = ogDescription || metaDesc;
  const noindex = /<meta\b[^>]*name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(html)
    || /<meta\b[^>]*name=["']googlebot["'][^>]*content=["'][^"']*noindex/i.test(html)
    || /noindex/i.test((html.match(/<meta\b[^>]*name=["']robots["'][^>]*content=["']([^"']*)["']/i) || [])[1] || '');
  const h1s = headings.filter(h => h.level === 1);
  const hierarchyOk = (() => {
    let prev = 0;
    for (const h of headings) {
      if (prev && h.level > prev + 1) return false;
      prev = h.level;
    }
    return true;
  })();
  const tagCounts = { header: 0, nav: 0, main: 0, article: 0, section: 0, footer: 0 };
  for (const tag of Object.keys(tagCounts)) {
    tagCounts[tag] = (html.match(new RegExp(`<${tag}\\b`, 'gi')) || []).length;
  }
  const weakAnchors = links.filter(l => /^(clique aqui|saiba mais|leia mais|ler mais|ver mais|acesse|aqui|continue|mais)$/i.test(l.text));
  const lower = ' ' + text.toLowerCase() + ' ';
  let vagueTotal = 0;
  for (const w of VAGUE_WORDS) {
    const re = new RegExp(`(^|[^A-Za-zÀ-ÿ])${w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^A-Za-zÀ-ÿ]|$)`, 'gi');
    vagueTotal += (lower.match(re) || []).length;
  }
  const prices = (text.match(/R\$\s?\d[\d.]*(?:,\d+)?|\$\s?\d[\d.,]*|€\s?\d[\d.,]*|USD\s?\d[\d.,]*/g) || []).length;
  const dates = (text.match(/\b\d{1,2}\/\d{1,2}\/\d{2,4}\b|\b\d{4}\b|\b(janeiro|fevereiro|março|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro)\b/gi) || []).length;
  const percents = (text.match(/\d+(?:[.,]\d+)?\s?%/g) || []).length;
  const hasOffer = jsonLd.some(b => b && (b['@type'] === 'Offer'
    || [].concat(b['@type'] || []).includes('Offer')
    || JSON.stringify(b).includes('"offers"')));
  const hasProduct = jsonLd.some(b => b && [].concat(b['@type'] || []).some(t => t === 'Product' || t === 'Service' || t === 'LocalBusiness'));
  const framableByHeaders = (headers) => {
    const xfo = String(headers['x-frame-options'] || '').toUpperCase();
    if (xfo === 'DENY' || xfo === 'SAMEORIGIN') return false;
    const csp = String(headers['content-security-policy'] || '');
    const m = csp.match(/frame-ancestors\s+([^;]*)/i);
    if (m) {
      const v = m[1].trim();
      if (v === 'none' || v === "'none'") return false;
      if (!/\*|https?:/i.test(v)) return false;
    }
    return true;
  };

  return {
    text, words, headings, links, jsonLd, schemaTypes,
    inlineScriptBytes, lazyCount, iframes,
    imgsTotal, imgsNoAlt, langAttr, title, metaDesc, canonical, ogImage, description,
    noindex, h1s, hierarchyOk, tagCounts, weakAnchors, vagueTotal,
    prices, dates, percents, hasOffer, hasProduct, framableByHeaders
  };
}

module.exports = { buildAnalysis, extractText, countWords, VAGUE_WORDS };