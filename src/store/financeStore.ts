import { create } from 'zustand';
import { getDatabase, saveDatabase } from '../lib/database';

export interface Expense {
  id: number;
  amount: number;
  category: string;
  date: string;
  remark: string;
}

export interface Income {
  id: number;
  amount: number;
  source: string;
  date: string;
  remark: string;
}

export interface InventoryItem {
  id: number;
  product_name: string;
  quantity: number;
  unit_price: number;
  type: 'in' | 'out';
  date: string;
}

interface FinanceStore {
  expenses: Expense[];
  incomes: Income[];
  inventory: InventoryItem[];
  expenseCategories: string[];
  incomeSources: string[];
  loading: boolean;
  loadData: () => Promise<void>;
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  updateExpense: (id: number, expense: Omit<Expense, 'id'>) => void;
  deleteExpense: (id: number) => void;
  addIncome: (income: Omit<Income, 'id'>) => void;
  updateIncome: (id: number, income: Omit<Income, 'id'>) => void;
  deleteIncome: (id: number) => void;
  addInventory: (item: Omit<InventoryItem, 'id'>) => void;
  updateInventory: (id: number, item: Omit<InventoryItem, 'id'>) => void;
  deleteInventory: (id: number) => void;
  addExpenseCategory: (category: string) => void;
  removeExpenseCategory: (category: string) => void;
  addIncomeSource: (source: string) => void;
  removeIncomeSource: (source: string) => void;
}

export const useFinanceStore = create<FinanceStore>((set, get) => ({
  expenses: [],
  incomes: [],
  inventory: [],
  expenseCategories: ['餐饮', '交通', '购物', '教育', '医疗', '其他'],
  incomeSources: ['工资', '奖金', '投资', '其他'],
  loading: true,

  loadData: async () => {
    const db = getDatabase();
    if (!db) return;

    const expenses = db.exec('SELECT * FROM expenses ORDER BY date DESC');
    const incomes = db.exec('SELECT * FROM incomes ORDER BY date DESC');
    const inventory = db.exec('SELECT * FROM inventory ORDER BY date DESC');
    
    const categoriesResult = db.exec("SELECT value FROM settings WHERE key = 'expense_categories'");
    const sourcesResult = db.exec("SELECT value FROM settings WHERE key = 'income_sources'");

    const expenseCategories = categoriesResult[0]?.values[0]?.[0]?.toString().split(',') || ['餐饮', '交通', '购物', '教育', '医疗', '其他'];
    const incomeSources = sourcesResult[0]?.values[0]?.[0]?.toString().split(',') || ['工资', '奖金', '投资', '其他'];

    set({
      expenses: expenses[0]?.values.map((row: any) => ({
        id: row[0],
        amount: row[1],
        category: row[2],
        date: row[3],
        remark: row[4] || '',
      })) || [],
      incomes: incomes[0]?.values.map((row: any) => ({
        id: row[0],
        amount: row[1],
        source: row[2],
        date: row[3],
        remark: row[4] || '',
      })) || [],
      inventory: inventory[0]?.values.map((row: any) => ({
        id: row[0],
        product_name: row[1],
        quantity: row[2],
        unit_price: row[3],
        type: row[4],
        date: row[5],
      })) || [],
      expenseCategories,
      incomeSources,
      loading: false,
    });
  },

  addExpense: (expense) => {
    const db = getDatabase();
    if (!db) return;
    db.run(
      'INSERT INTO expenses (amount, category, date, remark) VALUES (?, ?, ?, ?)',
      [expense.amount, expense.category, expense.date, expense.remark]
    );
    saveDatabase();
    get().loadData();
  },

  updateExpense: (id, expense) => {
    const db = getDatabase();
    if (!db) return;
    db.run(
      'UPDATE expenses SET amount = ?, category = ?, date = ?, remark = ? WHERE id = ?',
      [expense.amount, expense.category, expense.date, expense.remark, id]
    );
    saveDatabase();
    get().loadData();
  },

  deleteExpense: (id) => {
    const db = getDatabase();
    if (!db) return;
    db.run('DELETE FROM expenses WHERE id = ?', [id]);
    saveDatabase();
    get().loadData();
  },

  addIncome: (income) => {
    const db = getDatabase();
    if (!db) return;
    db.run(
      'INSERT INTO incomes (amount, source, date, remark) VALUES (?, ?, ?, ?)',
      [income.amount, income.source, income.date, income.remark]
    );
    saveDatabase();
    get().loadData();
  },

  updateIncome: (id, income) => {
    const db = getDatabase();
    if (!db) return;
    db.run(
      'UPDATE incomes SET amount = ?, source = ?, date = ?, remark = ? WHERE id = ?',
      [income.amount, income.source, income.date, income.remark, id]
    );
    saveDatabase();
    get().loadData();
  },

  deleteIncome: (id) => {
    const db = getDatabase();
    if (!db) return;
    db.run('DELETE FROM incomes WHERE id = ?', [id]);
    saveDatabase();
    get().loadData();
  },

  addInventory: (item) => {
    const db = getDatabase();
    if (!db) return;
    db.run(
      'INSERT INTO inventory (product_name, quantity, unit_price, type, date) VALUES (?, ?, ?, ?, ?)',
      [item.product_name, item.quantity, item.unit_price, item.type, item.date]
    );
    saveDatabase();
    get().loadData();
  },

  updateInventory: (id, item) => {
    const db = getDatabase();
    if (!db) return;
    db.run(
      'UPDATE inventory SET product_name = ?, quantity = ?, unit_price = ?, type = ?, date = ? WHERE id = ?',
      [item.product_name, item.quantity, item.unit_price, item.type, item.date, id]
    );
    saveDatabase();
    get().loadData();
  },

  deleteInventory: (id) => {
    const db = getDatabase();
    if (!db) return;
    db.run('DELETE FROM inventory WHERE id = ?', [id]);
    saveDatabase();
    get().loadData();
  },

  addExpenseCategory: (category) => {
    const db = getDatabase();
    if (!db) return;
    const current = get().expenseCategories;
    if (!current.includes(category)) {
      const newCategories = [...current, category].join(',');
      db.run("UPDATE settings SET value = ? WHERE key = 'expense_categories'", [newCategories]);
      saveDatabase();
      get().loadData();
    }
  },

  removeExpenseCategory: (category) => {
    const db = getDatabase();
    if (!db) return;
    const current = get().expenseCategories;
    if (current.length > 1) {
      const newCategories = current.filter(c => c !== category).join(',');
      db.run("UPDATE settings SET value = ? WHERE key = 'expense_categories'", [newCategories]);
      saveDatabase();
      get().loadData();
    }
  },

  addIncomeSource: (source) => {
    const db = getDatabase();
    if (!db) return;
    const current = get().incomeSources;
    if (!current.includes(source)) {
      const newSources = [...current, source].join(',');
      db.run("UPDATE settings SET value = ? WHERE key = 'income_sources'", [newSources]);
      saveDatabase();
      get().loadData();
    }
  },

  removeIncomeSource: (source) => {
    const db = getDatabase();
    if (!db) return;
    const current = get().incomeSources;
    if (current.length > 1) {
      const newSources = current.filter(s => s !== source).join(',');
      db.run("UPDATE settings SET value = ? WHERE key = 'income_sources'", [newSources]);
      saveDatabase();
      get().loadData();
    }
  },
}));
