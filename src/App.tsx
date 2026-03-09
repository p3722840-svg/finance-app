import { useEffect, useState } from 'react';
import { HashRouter, Routes, Route, NavLink } from 'react-router-dom';
import { Wallet, TrendingUp, Package, BarChart3, Home } from 'lucide-react';
import { initDatabase } from './lib/database';
import { useFinanceStore } from './store/financeStore';
import ExpensesPage from './pages/ExpensesPage';
import IncomesPage from './pages/IncomesPage';
import InventoryPage from './pages/InventoryPage';
import ReportsPage from './pages/ReportsPage';
import DashboardPage from './pages/DashboardPage';

function App() {
  const [dbReady, setDbReady] = useState(false);
  const loadData = useFinanceStore((state) => state.loadData);

  useEffect(() => {
    initDatabase().then(() => {
      setDbReady(true);
      loadData();
    });
  }, [loadData]);

  if (!dbReady) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <HashRouter>
      <div className="flex h-screen bg-gray-50">
        <aside className="w-56 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-5 border-b border-gray-200">
            <h1 className="text-xl font-bold text-blue-600 flex items-center gap-2">
              <Wallet className="w-6 h-6" />
              财务记账
            </h1>
          </div>
          <nav className="flex-1 p-3 space-y-1">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`
              }
            >
              <Home className="w-5 h-5" />
              首页
            </NavLink>
            <NavLink
              to="/expenses"
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`
              }
            >
              <TrendingUp className="w-5 h-5" />
              支出管理
            </NavLink>
            <NavLink
              to="/incomes"
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`
              }
            >
              <Wallet className="w-5 h-5" />
              收入管理
            </NavLink>
            <NavLink
              to="/inventory"
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`
              }
            >
              <Package className="w-5 h-5" />
              库存管理
            </NavLink>
            <NavLink
              to="/reports"
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`
              }
            >
              <BarChart3 className="w-5 h-5" />
              财务报表
            </NavLink>
          </nav>
        </aside>
        <main className="flex-1 overflow-auto">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/expenses" element={<ExpensesPage />} />
            <Route path="/incomes" element={<IncomesPage />} />
            <Route path="/inventory" element={<InventoryPage />} />
            <Route path="/reports" element={<ReportsPage />} />
          </Routes>
        </main>
      </div>
    </HashRouter>
  );
}

export default App;
