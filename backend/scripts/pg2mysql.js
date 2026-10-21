// Converte o dump PostgreSQL (schema public) para MySQL e importa via DATABASE_URL.
// Uso:
//   node --env-file=.env scripts/pg2mysql.js convert <dump> <saida.sql>
//   node --env-file=.env scripts/pg2mysql.js import <dump> <arquivo.sql>
const fs = require('fs');

function parseDump(file) {
  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
  const tables = [];
  let cur = null;
  for (const line of lines) {
    if (!cur) {
      const m = line.match(/^COPY public\."([^"]+)" \((.+)\) FROM stdin;$/);
      if (m) {
        const cols = m[2].split(', ').map((c) => c.replace(/^"|"$/g, ''));
        cur = { table: m[1], cols, rows: [] };
        tables.push(cur);
      }
      continue;
    }
    if (line === '\\.') { cur = null; continue; }
    cur.rows.push(line);
  }
  return tables;
}

function unescapeCopyValue(raw) {
  if (raw.length >= 2 && raw[0] === '"' && raw[raw.length - 1] === '"') {
    let out = '';
    for (let i = 1; i < raw.length - 1; i++) {
      const ch = raw[i];
      if (ch === '\\') {
        const n = raw[++i];
        out += n === 'n' ? '\n' : n === 'r' ? '\r' : n === 't' ? '\t' : n === 'b' ? '\b' : n === 'f' ? '\f' : n;
      } else out += ch;
    }
    return { str: out };
  }
  if (raw === '\\N') return { null: true };
  return { raw };
}

function escStr(s) {
  return "'" + s.replace(/[\0\b\t\n\r\x1a\\'"]/g, (c) => ({
    '\0': '\\0', '\b': '\\b', '\t': '\\t', '\n': '\\n', '\r': '\\r',
    '\x1a': '\\Z', '\\': '\\\\', '"': '\\"', "'": "\\'",
  }[c])) + "'";
}

function toSql(raw) {
  const v = unescapeCopyValue(raw);
  if (v.null) return 'NULL';
  if ('str' in v) return escStr(v.str);
  const x = v.raw;
  if (x === 't') return '1';
  if (x === 'f') return '0';
  if (x === '') return "''";
  if (/^-?\d+(\.\d+)?([eE][+-]?\d+)?$/.test(x)) return x;
  return escStr(x);
}

function convert(dumpFile, outFile) {
  const tables = parseDump(dumpFile);
  const out = ['SET NAMES utf8mb4;', 'SET FOREIGN_KEY_CHECKS=0;', 'SET UNIQUE_CHECKS=0;'];
  const counts = {};
  for (const { table, cols, rows } of tables) {
    counts[table] = rows.length;
    if (rows.length === 0) continue;
    const colSql = cols.map((c) => `\`${c}\``).join(', ');
    for (let i = 0; i < rows.length; i += 200) {
      const tuples = rows.slice(i, i + 200).map((row) => '(' + row.split('\t').map(toSql).join(', ') + ')');
      out.push(`INSERT INTO \`${table}\` (${colSql}) VALUES\n${tuples.join(',\n')};`);
    }
  }
  out.push('SET FOREIGN_KEY_CHECKS=1;', 'SET UNIQUE_CHECKS=1;');
  fs.writeFileSync(outFile, out.join('\n'));
  return counts;
}

async function importSql(sqlFile, expectedCounts) {
  const mysql = require('mysql2/promise');
  const conn = await mysql.createConnection({
    uri: process.env.DATABASE_URL,
    multipleStatements: true,
    charset: 'utf8mb4',
  });
  const sql = fs.readFileSync(sqlFile, 'utf8');
  await conn.query('SET FOREIGN_KEY_CHECKS=0');
  for (const table of Object.keys(expectedCounts)) {
    await conn.query(`TRUNCATE TABLE \`${table}\``);
  }
  await conn.query(sql);
  console.log('Importacao executada. Verificacao de linhas:');
  let ok = true;
  for (const [table, expected] of Object.entries(expectedCounts)) {
    const [rows] = await conn.query(`SELECT COUNT(*) AS n FROM \`${table}\``);
    const n = rows[0].n;
    const mark = n === expected ? 'OK ' : 'DIFF';
    if (n !== expected) ok = false;
    console.log(`  [${mark}] ${table}: dump=${expected} mysql=${n}`);
  }
  await conn.end();
  if (!ok) process.exitCode = 1;
}

(async () => {
  const [cmd, dumpFile, target] = process.argv.slice(2);
  if (cmd === 'convert') {
    const counts = convert(dumpFile, target);
    console.log(JSON.stringify(counts, null, 2));
  } else if (cmd === 'import') {
    const counts = parseDump(dumpFile).reduce((a, t) => ({ ...a, [t.table]: t.rows.length }), {});
    await importSql(target, counts);
  } else {
    console.error('Uso: convert <dump> <out.sql> | import <dump> <sql>');
    process.exit(1);
  }
})();
