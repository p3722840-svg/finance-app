import initSqlJs, { Database } from 'sql.js';

let db: Database | null = null;

export async function initDatabase(): Promise<Database> {
  if (db) return db;

  const wasmResponse = await fetch('/sql-wasm.wasm');
  const wasmBuffer = await wasmResponse.arrayBuffer();

  const SQL = await initSqlJs({
    wasmBinary: wasmBuffer,
  });

  const savedData = localStorage.getItem('finance_db');
  if (savedData) {
    const data = Uint8Array.from(atob(savedData), c => c.charCodeAt(0));
    db = new SQL.Database(data);
  } else {
    db = new SQL.Database();
    db.run(`
      CREATE TABLE IF NOT EXISTS expenses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        amount REAL NOT NULL,
        category TEXT NOT NULL,
        date TEXT NOT NULL,
        remark TEXT
      );
      CREATE TABLE IF NOT EXISTS incomes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        amount REAL NOT NULL,
        source TEXT NOT NULL,
        date TEXT NOT NULL,
        remark TEXT
      );
      CREATE TABLE IF NOT EXISTS inventory (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_name TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        unit_price REAL NOT NULL,
        type TEXT NOT NULL,
        date TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT
      );
    `);
    db.run("INSERT OR IGNORE INTO settings (key, value) VALUES ('expense_categories', '餐饮,交通,购物,教育,医疗,其他')");
    db.run("INSERT OR IGNORE INTO settings (key, value) VALUES ('income_sources', '工资,奖金,投资,其他')");
    saveDatabase();
  }

  return db;
}

export function saveDatabase() {
  if (!db) return;
  const data = db.export();
  const base64 = btoa(String.fromCharCode(...data));
  localStorage.setItem('finance_db', base64);
}

export function getDatabase(): Database | null {
  return db;
}
