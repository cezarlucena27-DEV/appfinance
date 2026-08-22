/* Réplica local do Índice de Visibilidade Cognitiva.
   Camada de apresentação. Nenhuma regra de pontuação vive aqui:
   o servidor devolve tudo pronto. */
(function () {
  'use strict';

  var TOKEN = meta('scan-token');
  var recarregou = false;
  var BASE = meta('base-url') || './';
  var API = BASE + 'api/scan.php';
  var PLANOS = meta('planos-url') || '/planos';
  var WHATSAPP = meta('whatsapp');
  var WHATSAPP_MSG = meta('whatsapp-msg');

  var form = byId('form'), input = byId('url'), btn = byId('go');
  var hint = byId('hint'), errBox = byId('err'), loadBox = byId('loading');
  var resultBox = byId('result'), hero = byId('hero');
  var busy = false;

  if (!form) { return; }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    run();
  });

  function run() {
    var url = (input.value || '').trim();
    if (busy) { return; }

    if (!url) {
      errBox.textContent = 'Digite o endereço do seu site aqui em cima — exemplo: seudominio.com.br';
      errBox.hidden = false;
      hint.hidden = true;
      try { input.focus(); input.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch (e) {}
      return;
    }

    busy = true;
    btn.disabled = true;
    btn.textContent = 'Analisando…';
    hint.hidden = true;
    errBox.hidden = true;
    loadBox.hidden = false;
    resultBox.innerHTML = '';

    fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: url, token: TOKEN })
    })
      .then(function (r) {
        return r.json().then(function (j) { return { ok: r.ok, data: j }; });
      })
      .then(function (res) {
        if (res.data && res.data.token) { TOKEN = res.data.token; }

        if (!res.ok) {
          if (res.data && res.data.code === 'token' && !recarregou) {
            recarregou = true;
            return renovarToken().then(function () {
              busy = false;
              btn.disabled = false;
              run();
            });
          }
          throw new Error((res.data && res.data.error) || 'Falha na análise.');
        }
        recarregou = false;
        render(res.data);
      })
      .catch(function (e) {
        var msg = e && e.message ? e.message : 'Falha na análise.';
        errBox.textContent = msg;
        errBox.hidden = false;
        hint.hidden = false;
      })
      .then(function () {
        busy = false;
        btn.disabled = false;
        btn.textContent = 'Analisar';
        loadBox.hidden = true;
      });
  }

  function renovarToken() {
    return fetch(window.location.href, { credentials: 'same-origin' })
      .then(function (r) { return r.text(); })
      .then(function (html) {
        var m = html.match(/name="scan-token"\s+content="([^"]+)"/);
        if (m) { TOKEN = m[1]; }
      })
      .catch(function () {});
  }

  /* ------------------------------------------------------------ render */

  function render(d) {
    hero.className = 'hero compact';

    var root = el('div', 'wrap fade');
    root.appendChild(urlbar(d));
    root.appendChild(headline(d));
    root.appendChild(evidencia(d));
    root.appendChild(consequences(d));
    root.appendChild(gauges(d));
    root.appendChild(compare(d));
    root.appendChild(metrics(d));
    root.appendChild(reach(d));
    root.appendChild(context());
    root.appendChild(assinatura(d));

    resultBox.innerHTML = '';
    resultBox.appendChild(root);

    setTimeout(function () { root.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 60);

    countTo(root.querySelector('[data-c="score"]'), d.ai_score, 2000, 250);
    countTo(root.querySelector('[data-c="human"]'), d.human_score, 1500, 550);
    countTo(root.querySelector('[data-c="ai"]'), d.ai_score, 1900, 800);
    countTo(root.querySelector('[data-c="gap"]'), d.gap, 1600, 1100);

    var nums = root.querySelectorAll('[data-vec]');
    for (var i = 0; i < nums.length; i++) {
      countTo(nums[i], parseInt(nums[i].getAttribute('data-vec'), 10), 1200, 500 + i * 110);
    }

    var rings = root.querySelectorAll('[data-ring]');
    setTimeout(function () {
      for (var j = 0; j < rings.length; j++) {
        rings[j].style.strokeDashoffset = rings[j].getAttribute('data-ring');
      }
    }, 180);

    barraFixa(d, root);
  }

  function evidencia(d) {
    var box = el('div', 'evidencia');
    if (d.server_block) {
      box.appendChild(el('p', 'ev-label', 'o que a IA conseguiu ler da sua página'));
      box.appendChild(el('p', 'ev-vazio', 'Nada. ' + (d.server_block.label || 'A conexão foi recusada antes do conteúdo.')));
      box.appendChild(ancora());
      return box;
    }

    box.appendChild(el('p', 'ev-label', 'o que a IA leu da sua página agora'));

    var linhas = el('div', 'ev-linhas');

    var t = el('div', 'ev-linha');
    t.appendChild(el('span', 'ev-k', 'título lido'));
    t.appendChild(el('span', 'ev-v' + (d.title ? '' : ' ev-nulo'),
      d.title ? '“' + d.title + '”' : 'nenhum título foi lido'));
    linhas.appendChild(t);

    var c = el('div', 'ev-linha');
    c.appendChild(el('span', 'ev-k', 'conteúdo recebido'));
    c.appendChild(el('span', 'ev-v', fmt(d.raw_text_chars) + ' caracteres'));
    linhas.appendChild(c);
    box.appendChild(linhas);

    var trecho = (d.raw_text || '').replace(/\s+/g, ' ').trim().slice(0, 180);
    if (trecho) {
      var pre = el('p', 'ev-trecho');
      pre.textContent = '“' + trecho + (d.raw_text.length > 180 ? '…' : '') + '”';
      box.appendChild(pre);
      box.appendChild(el('p', 'ev-nota',
        d.ai_score >= 90
          ? 'É isso que os modelos usam para falar de você. E está completo.'
          : 'É com isso, e só com isso, que os modelos falam de você hoje.'));
    }

    box.appendChild(ancora());
    return box;
  }

  function ancora() {
    var a = el('a', 'ev-ancora', 'ver a página inteira que a IA recebeu ↓');
    a.setAttribute('href', '#comparacao');
    a.addEventListener('click', function (ev) {
      ev.preventDefault();
      var alvo = document.getElementById('comparacao');
      if (alvo) { alvo.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    });
    return a;
  }

  function barraFixa(d, root) {
    var antiga = byId('barra-fixa');
    if (antiga) { antiga.parentNode.removeChild(antiga); }

    var bar = el('div', 'barra-fixa');
    bar.id = 'barra-fixa';
    var liberada = false;

    var info = el('div', 'barra-info');
    info.appendChild(el('strong', null, String(d.ai_score)));
    info.appendChild(el('span', null, 'de 100 · ' + d.host));
    bar.appendChild(info);

    var ab = el('a', 'btn lima', 'Ver planos');
    ab.setAttribute('href', PLANOS);
    bar.appendChild(ab);
    document.body.appendChild(bar);

    var prova = root.querySelector('#comparacao');
    var final = root.querySelector('.assina');

    if (!window.IntersectionObserver || !prova) {
      setTimeout(function () { liberada = true; bar.className = 'barra-fixa visivel'; }, 25000);
      return;
    }

    new IntersectionObserver(function (ent) {
      var e = ent[0];
      if (!liberada && !e.isIntersecting && e.boundingClientRect.top < 0) {
        liberada = true;
        bar.className = 'barra-fixa visivel';
      }
    }, { threshold: 0 }).observe(prova);

    if (final) {
      new IntersectionObserver(function (ent) {
        if (!liberada) { return; }
        bar.className = 'barra-fixa' + (ent[0].isIntersecting ? '' : ' visivel');
      }, { threshold: 0.2 }).observe(final);
    }
  }

  function assinatura(d) {
    var s = d.ai_score;
    var sec = el('section', 'assina');

    var selo, titulo, forte, texto, ordem;

    if (s >= 90) {
      selo = 'você está no topo';
      titulo = 'Você está à frente. ';
      forte = 'Agora existe algo a perder.';
      texto = 'Um resultado assim se desfaz numa troca de tema, num plugin ou numa página '
            + 'publicada às pressas — e o estrago fica invisível até alguém medir de novo. '
            + 'Enquanto isso, qualquer concorrente pode digitar o seu endereço aqui e '
            + 'acompanhar a sua nota todos os dias.';
      ordem = ['plano', 'blindagem', 'monitor', 'radar'];
    } else if (s >= 50) {
      selo = 'você está no meio do pelotão';
      titulo = 'Dá para passar na frente. ';
      forte = 'Quem sair primeiro leva a citação.';
      texto = 'Numa resposta de IA costumam ser citadas uma ou duas fontes: não existe '
            + 'segunda página. O concorrente que ajustar o site antes de você não vai '
            + 'avisar — a diferença aparece no seu tráfego, semanas depois.';
      ordem = ['plano', 'monitor', 'radar', 'blindagem'];
    } else {
      selo = 'o problema não é só a nota de hoje';
      titulo = 'Você viu o tamanho do buraco. ';
      forte = 'Amanhã ele pode estar maior, e ninguém vai te avisar.';
      texto = 'A nota que você acabou de ver vale para agora. Qualquer mudança no site mexe '
            + 'nesse número, e a descoberta costuma acontecer do pior jeito: semanas depois, '
            + 'quando o tráfego já caiu e ninguém liga uma coisa à outra.';
      ordem = ['plano', 'monitor', 'radar', 'blindagem'];
    }

    sec.appendChild(el('span', 'selo', selo));

    var h = el('h3');
    h.appendChild(document.createTextNode(titulo));
    h.appendChild(el('b', null, forte));
    sec.appendChild(h);

    sec.appendChild(el('p', null, texto));

    var pilares = {
      plano: ['✓',
        'Plano de correção, passo a passo. ',
        'A lista exata do que corrigir no seu site e em cada página, em ordem de retorno: '
        + 'o primeiro item é sempre o que rende mais pelo que custa. Cada tarefa mostra '
        + 'quantos pontos ela vale, você marca o que já fez, e o sistema confere sozinho '
        + 'na varredura seguinte.'],
      monitor: ['24h',
        'Monitoramento diário e alerta a cada mudança. ',
        'Para cima ou para baixo, você recebe um e-mail com o que mudou e em qual página. '
        + 'No painel, o seu IVC e a média do seu setor ficam lado a lado, com histórico.'],
      blindagem: ['⛊',
        'Blindagem Competitiva. ',
        'Nenhum concorrente consegue acompanhar a sua nota, o seu histórico ou ser avisado '
        + 'quando ela muda. Ele vê a foto de hoje; nunca o filme.'],
      radar: ['◎',
        'Radar de Concorrência. ',
        'A nota das páginas que disputam a mesma resposta que a sua, todos os dias — e um '
        + 'aviso no dia em que qualquer uma delas subir.']
    };

    var ul = el('ul', 'pilares');
    for (var i = 0; i < ordem.length; i++) {
      var pl = pilares[ordem[i]];
      var li = el('li', i === 0 ? 'principal' : null);
      li.appendChild(el('span', 'mk', pl[0]));
      var txt = el('span');
      txt.appendChild(el('b', null, pl[1]));
      txt.appendChild(document.createTextNode(pl[2]));
      li.appendChild(txt);
      ul.appendChild(li);
    }
    sec.appendChild(ul);

    var acoes = el('div', 'acoes');
    var a = el('a', 'btn lima', 'Ver os planos');
    a.setAttribute('href', PLANOS);
    acoes.appendChild(a);
    acoes.appendChild(el('span', 'preco-de', 'a partir de R$ 49,90 por mês'));
    sec.appendChild(acoes);

    sec.appendChild(el('p', 'agora',
      'Ao cadastrar a página, a nota dela aparece no painel em segundos. No dia seguinte a '
      + 'varredura entra sozinha.'));

    var again = el('button', 'btn ghost outra', 'analisar outra página');
    again.addEventListener('click', function () {
      resultBox.innerHTML = '';
      hero.className = 'hero';
      hint.hidden = false;
      input.value = '';
      input.focus();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    sec.appendChild(again);

    return sec;
  }

  function urlbar(d) {
    var bar = el('div', 'urlbar');
    var b = el('b', null, d.host);
    bar.appendChild(b);
    bar.appendChild(el('span', null, 'análise em ' + d.duration_ms + ' ms'));
    return bar;
  }

  function headline(d) {
    var crit = d.global_status !== 'otimo';
    var box = el('div', 'headline');

    var big = el('span', 'big ' + (crit ? 's-critico' : 's-otimo'), '0');
    big.setAttribute('data-c', 'score');
    box.appendChild(big);

    box.appendChild(el('p', 'headline-scale', 'de 100 · Índice de Visibilidade Cognitiva'));

    var alertBox = el('p', 'alert ' + (crit ? 'crit' : 'good'));
    alertBox.appendChild(el('span', 'alert-mark', crit ? '!' : '✓'));
    alertBox.appendChild(document.createTextNode(d.alert));
    box.appendChild(alertBox);

    return box;
  }

  function gauges(d) {
    var box = el('div', 'gauges');
    box.appendChild(gauge('para uma pessoa', d.human_score, 'human',
      'a sua página aberta num navegador'));

    var mid = el('div', 'gap-badge');
    var n = el('div', 'n', '0');
    n.setAttribute('data-c', 'gap');
    mid.appendChild(n);
    mid.appendChild(el('div', 't', 'pontos de diferença'));
    box.appendChild(mid);

    box.appendChild(gauge('para um modelo de IA', d.ai_score, 'ai',
      fmt(d.raw_text_chars) + ' caracteres recebidos'));
    return box;
  }

  function gauge(label, score, key, subLabel) {
    var wrap = el('div', 'gauge');
    wrap.appendChild(el('div', 'lbl', label));

    var R = 68, C = 2 * Math.PI * R, size = 184;
    var color = score >= 90 ? '#0cce6b' : '#a50e0e';

    var ns = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('width', size); svg.setAttribute('height', size);
    svg.setAttribute('viewBox', '0 0 ' + size + ' ' + size);

    var bg = document.createElementNS(ns, 'circle');
    bg.setAttribute('class', 'ring-bg');
    bg.setAttribute('cx', size / 2); bg.setAttribute('cy', size / 2); bg.setAttribute('r', R);
    bg.setAttribute('fill', 'none'); bg.setAttribute('stroke-width', '11');
    svg.appendChild(bg);

    var fg = document.createElementNS(ns, 'circle');
    fg.setAttribute('class', 'ring-fg');
    fg.setAttribute('cx', size / 2); fg.setAttribute('cy', size / 2); fg.setAttribute('r', R);
    fg.setAttribute('fill', 'none'); fg.setAttribute('stroke', color);
    fg.setAttribute('stroke-width', '11'); fg.setAttribute('stroke-linecap', 'round');
    fg.setAttribute('stroke-dasharray', C);
    fg.setAttribute('stroke-dashoffset', C);
    fg.setAttribute('data-ring', C - (C * Math.max(0, Math.min(100, score))) / 100);
    svg.appendChild(fg);

    var txt = document.createElementNS(ns, 'text');
    txt.setAttribute('class', 'num');
    txt.setAttribute('x', size / 2); txt.setAttribute('y', size / 2 + 1);
    txt.setAttribute('fill', color);
    txt.setAttribute('data-c', key);
    txt.textContent = '0';
    svg.appendChild(txt);

    wrap.appendChild(svg);
    wrap.appendChild(el('div', 'sub-lbl', subLabel));
    return wrap;
  }

  function consequences(d) {
    var box = el('div');
    box.appendChild(el('p', 'conseq-label', 'o que isso custa hoje'));
    var ul = el('ul', 'conseq');
    for (var i = 0; i < d.consequences.length; i++) {
      ul.appendChild(el('li', null, d.consequences[i]));
    }
    box.appendChild(ul);
    return box;
  }

  function compare(d) {
    var sec = el('section', 'section');
    sec.id = 'comparacao';
    var head = el('div', 'sec-head');
    head.appendChild(el('h2', null, 'A mesma página, dois leitores'));
    head.appendChild(el('span', 'meta', 'lado a lado, sem edição'));
    sec.appendChild(head);

    var grid = el('div', 'compare');

    var left = el('div', 'card');
    left.appendChild(cardHead('para uma pessoa', 'a sua página completa'));
    var lb = el('div', 'card-body white');
    if (d.framable) {
      lb.appendChild(el('div', 'iframe-ph', 'carregando a sua página…'));
      var fr = el('iframe', 'live');
      fr.setAttribute('src', d.final_url);
      fr.setAttribute('sandbox', 'allow-scripts allow-same-origin');
      fr.setAttribute('loading', 'lazy');
      fr.setAttribute('referrerpolicy', 'no-referrer');
      fr.setAttribute('title', 'Sua página renderizada');
      lb.appendChild(fr);
    } else {
      var inner = el('div', 'mock-inner');
      inner.appendChild(el('span', 'chip', 'prévia'));
      if (d.og_image) {
        var img = el('img');
        img.setAttribute('src', d.og_image);
        img.setAttribute('alt', '');
        img.setAttribute('referrerpolicy', 'no-referrer');
        inner.appendChild(img);
      }
      inner.appendChild(el('h3', null, d.title || 'Sem título'));
      inner.appendChild(el('p', null, d.description || ''));
      lb.appendChild(inner);
    }
    left.appendChild(lb);

    var right = el('div', 'card');
    right.appendChild(cardHead('para um modelo de IA', 'tudo o que chega até ele'));
    var rb = el('div', 'card-body');
    if (d.server_block) {
      rb.appendChild(empty('×', 'Conexão recusada',
        d.server_block.label + ' Para qualquer modelo de IA, esta página não existe.'));
    } else if (d.raw_text_chars < 300) {
      rb.appendChild(empty('×',
        d.raw_text_chars === 0 ? 'Nada legível foi recebido' : 'Só ' + d.raw_text_chars + ' caracteres recebidos',
        'Isto é a sua página inteira, do jeito que o modelo recebe.'));
    } else {
      var pre = el('pre', 'raw');
      pre.textContent = d.raw_text;
      rb.appendChild(pre);
    }
    right.appendChild(rb);

    grid.appendChild(left);
    grid.appendChild(right);
    sec.appendChild(grid);
    sec.appendChild(el('div', 'compare-foot',
      'O mesmo endereço, no mesmo instante. À esquerda, o que uma pessoa vê. À direita, tudo o que um modelo de IA recebe.'));
    return sec;
  }

  function cardHead(k, v) {
    var h = el('div', 'card-head');
    h.appendChild(el('div', 'k', k));
    h.appendChild(el('div', 'v', v));
    return h;
  }

  function empty(mark, msg, detail) {
    var box = el('div', 'empty');
    box.appendChild(el('div', 'big-x', mark));
    box.appendChild(el('div', 'msg', msg));
    box.appendChild(el('div', 'detail', detail));
    return box;
  }

  function metrics(d) {
    var sec = el('section', 'section');
    var head = el('div', 'sec-head');
    head.appendChild(el('h2', null, 'Os cinco componentes'));
    head.appendChild(el('span', 'meta', d.ai_score + ' de 100 · ' + d.global_label));
    sec.appendChild(head);

    for (var i = 0; i < d.vectors.length; i++) {
      var v = d.vectors[i];
      var row = el('div', 'metric s-' + v.status);

      row.appendChild(el('div', 'glyph', v.glyph));

      var mid = el('div');
      var name = el('div', 'name');
      name.appendChild(document.createTextNode(v.name));
      mid.appendChild(name);

      var pill = el('span', 'pill');
      pill.appendChild(el('i'));
      pill.appendChild(document.createTextNode(v.label));
      mid.appendChild(pill);

      mid.appendChild(el('p', 'urgency', v.urgency));
      row.appendChild(mid);

      var num = el('div', 'num', '0');
      num.setAttribute('data-vec', v.score);
      row.appendChild(num);

      sec.appendChild(row);
    }
    return sec;
  }

  var REACH_STATE = [
    { cls: 'ok', txt: 'lê a sua página' },
    { cls: 'warn', txt: 'lê pela metade' },
    { cls: 'bad', txt: 'NÃO LÊ' }
  ];

  function reach(d) {
    var states = (d.reach && d.reach.states) ? d.reach.states : [];
    var counts = (d.reach && d.reach.counts) ? d.reach.counts : [0, 0, 0];
    var systems = (d.reach && d.reach.systems) ? d.reach.systems : [];

    var sec = el('section', 'section');
    var head = el('div', 'sec-head');
    head.appendChild(el('h2', null, 'Quem consegue chegar até você'));
    head.appendChild(el('span', 'meta',
      counts[0] + ' leem · ' + counts[1] + ' pela metade · ' + counts[2] + ' não leem'));
    sec.appendChild(head);

    var grid = el('div', 'botgrid');
    for (var i = 0; i < systems.length; i++) {
      var label = systems[i].label, owner = systems[i].owner;
      var st = REACH_STATE[states[i] === undefined ? 1 : states[i]];

      var cell = el('div', 'bot ' + st.cls);
      var n = el('div', 'n');
      n.appendChild(el('i'));
      n.appendChild(document.createTextNode(label));
      cell.appendChild(n);
      cell.appendChild(el('div', 'o', owner + ' · ' + st.txt));
      grid.appendChild(cell);
    }
    sec.appendChild(grid);
    return sec;
  }

  var FACTS = [
    {
      n: '58%',
      k: 'a menos de cliques',
      t: 'Quando a inteligência artificial responde na frente do Google, o site que estava em primeiro lugar perde mais da metade das visitas que teria.',
      src: 'Ahrefs · 300 mil buscas comparadas',
      url: 'https://ahrefs.com/blog/ai-overviews-reduce-clicks-update'
    },
    {
      n: '42%',
      k: 'a mais de vendas',
      t: 'Quem chega pela inteligência artificial compra mais do que quem chega por qualquer outro caminho. Chega já convencido.',
      src: 'Adobe · mais de 1 trilhão de visitas',
      url: 'https://business.adobe.com/blog/ai-traffic-surge-retail-sites-not-machine-readable'
    },
    {
      n: '1 em 4',
      k: 'nem abre o seu site',
      t: 'A pessoa lê a resposta da IA e vai embora. Se a IA não conseguiu ler a sua página, ela responde com o que achou por aí sobre você.',
      src: 'Pew Research · 900 pessoas acompanhadas',
      url: 'https://www.pewresearch.org/short-reads/2025/07/22/google-users-are-less-likely-to-click-on-links-when-an-ai-summary-appears-in-the-results/'
    }
  ];

  function context() {
    var sec = el('section', 'section');
    var head = el('div', 'sec-head');
    head.appendChild(el('h2', null, 'Por que isso importa agora'));
    head.appendChild(el('span', 'meta', 'três números, sem termo técnico'));
    sec.appendChild(head);

    var grid = el('div', 'facts');
    for (var i = 0; i < FACTS.length; i++) {
      var f = FACTS[i];
      var card = el('div', 'fact');
      card.appendChild(el('div', 'fact-n', f.n));
      card.appendChild(el('div', 'fact-k', f.k));
      card.appendChild(el('p', 'fact-t', f.t));
      var a = el('a', 'fact-src', f.src);
      a.setAttribute('href', f.url);
      a.setAttribute('target', '_blank');
      a.setAttribute('rel', 'noopener nofollow');
      card.appendChild(a);
      grid.appendChild(card);
    }
    sec.appendChild(grid);

    sec.appendChild(el('p', 'facts-foot',
      'O caminho antigo está encolhendo. O novo cresceu 393% em um ano. Quem já está legível hoje pega de graça o espaço que daqui a pouco vai ser disputado.'));
    return sec;
  }

  /* -------------------------------------------------------------- util */

  function countTo(node, target, duration, delay, suffix) {
    if (!node) { return; }
    suffix = suffix || '';
    setTimeout(function () {
      var start = null;
      function step(ts) {
        if (start === null) { start = ts; }
        var p = Math.min(1, (ts - start) / duration);
        var eased = 1 - Math.pow(1 - p, 3);
        node.textContent = Math.round(target * eased) + suffix;
        if (p < 1) { requestAnimationFrame(step); }
      }
      requestAnimationFrame(step);
    }, delay || 0);
  }

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) { n.className = cls; }
    if (text !== undefined && text !== null) { n.textContent = text; }
    return n;
  }
  function byId(id) { return document.getElementById(id); }
  function meta(name) {
    var m = document.querySelector('meta[name="' + name + '"]');
    return m ? m.getAttribute('content') : '';
  }
  function fmt(n) {
    return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }
})();