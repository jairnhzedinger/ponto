const fs = require('fs');
const path = require('path');

const DATA_DIR = path.resolve(__dirname, '..', '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'ponto.json');

const DEFAULT_DATA = {
  punches: [],
  meta: {
    lastImport: null
  }
};

function ensureDatabase() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(DEFAULT_DATA, null, 2));
  }
}

function readDatabase() {
  ensureDatabase();
  const content = fs.readFileSync(DB_FILE, 'utf8');
  const data = JSON.parse(content || '{}');
  return {
    punches: Array.isArray(data.punches) ? data.punches : [],
    meta: {
      lastImport: data.meta?.lastImport ?? null
    }
  };
}

function writeDatabase(data) {
  ensureDatabase();
  const payload = {
    punches: Array.isArray(data.punches) ? data.punches : [],
    meta: {
      lastImport: data.meta?.lastImport ?? null
    }
  };
  fs.writeFileSync(DB_FILE, JSON.stringify(payload, null, 2));
  return payload;
}

module.exports = {
  DATA_DIR,
  DB_FILE,
  DEFAULT_DATA,
  readDatabase,
  writeDatabase
};
