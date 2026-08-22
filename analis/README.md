# Índice de Visibilidade Cognitiva

Réplica local (localhost) do sistema de diagnóstico https://visibilidadecognitiva.com.br/:
mede, de 0 a 100, o quanto uma página é visível para modelos de IA (GPT, Claude,
Perplexity, Google-Extended, entre outros) — e o quanto essa visibilidade custa
em cliques e vendas.

Zero dependências: apenas Node.js (testado com Node 24) e o navegador.

## Como rodar

1. Dê dois cliques em `iniciar.bat` (abre o navegador em `http://localhost:3210`).
2. Digite uma URL (ex.: `http://localhost:3210/exemplo` ou `uol.com.br`) e clique em **Analisar**.
3. Para páginas locais (localhost/127.0.0.1), o `ALLOW_PRIVATE=1` já vem definido no `iniciar.bat`.
   Rodando `node server.js` direto no terminal, defina `ALLOW_PRIVATE=1` antes para liberar endereços locais.

## O que o sistema faz

A cada análise, o servidor lê a página duas vezes:

- **Leitura humana** — navegador real (user-agent Chrome), como um visitante.
- **Leitura de IA** — user-agent de bot, sem JavaScript, como o modelo enxerga.

A partir da diferença entre as duas leituras e de cinco componentes, sai o Índice:

| Componente | Peso |
|---|---|
| Latência de leitura | 30% |
| Fronteira de acesso | 20% |
| Cartografia do conteúdo | 20% |
| Densidade factual | 15% |
| Coerência estrutural | 15% |

O resultado mostra: nota 0–100, alerta, evidência do que a IA leu, consequências,
comparativo lado a lado (como a IA vê vs. como um humano vê), os cinco componentes,
o alcance por agente de IA (20 agentes), contexto de mercado e um bloco de assinatura
com funil de venda (planos + WhatsApp).

**O peso de cada componente é segredo do índice**: não vem do servidor e não é exibido
no navegador. Os critérios de cálculo são proprietários.

## Rotas

| Rota | Função |
|---|---|
| `/` | Página inicial com formulário de análise (gera o token) |
| `/planos` | Página de planos e funil |
| `/exemplo` | Página de referência local (pontua ~100) |
| `/robots.txt`, `/sitemap.xml` | Servidos para a própria ferramenta |
| `POST /api/scan.php` | Executa a análise `{url, token, pagina, fbclid}` |
| `POST /api/remover` | Remove um domínio do histórico `{host}` |
| `GET /api/historico` | Lista o histórico (host, data, notas) |

## Regras de uso

- **Token**: cada visita à página inicial recebe um token de uso único (30 min de validade).
  A resposta de cada análise devolve um token novo.
- **Limite**: 6 análises por minuto por IP (429 acima disso).
- **Cache**: análises repetidas da mesma URL são servidas em cache por 3 minutos.
- **SSRF**: IPs privados e de loopback são bloqueados, exceto com `ALLOW_PRIVATE=1`
  (necessário para analisar páginas locais).
- **Histórico**: `data/historico.json` guarda apenas host, data e notas — o conteúdo
  da página nunca é gravado. Domínios podem ser removidos via `POST /api/remover`.

## Estrutura

```
lib/fetch.js    leituras humano/IA, robots.txt, sitemap, 20 agentes
lib/parse.js    extração e heurísticas do HTML
lib/metrics.js  cálculo dos 5 componentes e nota global
lib/reach.js    alcance por agente de IA
lib/scan.js     orquestração + cache
lib/store.js    histórico em disco
server.js       rotas, token e limite de uso
public/         front-end (index, planos, exemplo, app.js, app.css)
data/           criado em runtime (historico.json)
```