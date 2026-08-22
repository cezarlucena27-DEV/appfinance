const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const HISTORY_FILE = path.join(DATA_DIR, 'historico.json');

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function loadHistory() {
  ensureDir();
  if (!fs.existsSync(HISTORY_FILE)) return [];
  try {
    return JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));
  } catch {
    return [];
  }
}

function saveHistory(list) {
  ensureDir();
  fs.writeFileSync(HISTORY_FILE, JSON.stringify(list, null, 2), 'utf8');
}

function record(host, result) {
  const list = loadHistory();
  list.push({
    host,
    data: new Date().toISOString(),
    ai_score: result.ai_score,
    human_score: result.human_score,
    gap: result.gap,
    global_status: result.global_status,
    global_label: result.global_label
  });
  if (list.length > 500) list.splice(0, list.length - 500);
  saveHistory(list);
}

function removeHost(host) {
  const list = loadHistory().filter(e => e.host !== host);
  saveHistory(list);
  return list.length;
}

function history() {
  return loadHistory().slice().reverse();
}

module.exports = { record, removeHost, history };