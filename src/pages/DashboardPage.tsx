import { useState } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { useFinanceStore } from '../store/financeStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

function DashboardPage() {
  const { expenses, incomes, expenseCategories, incomeSources } = useFinanceStore();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const filterByDateRange = (dateStr: string) => {
    if (!startDate && !endDate) return true;
    if (startDate && !endDate) return dateStr >= startDate;
    if (!startDate && endDate) return dateStr <= endDate;
    return dateStr >= startDate && dateStr <= endDate;
  };

  const filteredExpenses = expenses.filter(e => filterByDateRange(e.date));
  const filteredIncomes = incomes.filter(i => filterByDateRange(i.date));

  const totalExpense = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalIncome = filteredIncomes.reduce((sum, i) => sum + i.amount, 0);
  const profit = totalIncome - totalExpense;

  const expenseByCategory = expenseCategories.map(cat => ({
    name: cat,
    value: filteredExpenses.filter(e => e.category === cat).reduce((sum, e) => sum + e.amount, 0)
  })).filter(item => item.value > 0);

  const incomeBySource = incomeSources.map(src => ({
    name: src,
    value: filteredIncomes.filter(i => i.source === src).reduce((sum, i) => sum + i.amount, 0)
  })).filter(item => item.value > 0);

  const trendData = getMonthlyTrend(expenses, incomes);

  const recentExpenses = filteredExpenses.slice(0, 5);
  const recentIncomes = filteredIncomes.slice(0, 5);

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">数据概览</h2>

      <div className="flex gap-4 items-center">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">开始日期:</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="flex h-10 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">结束日期:</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="flex h-10 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        {(startDate || endDate) && (
          <button
            onClick={() => { setStartDate(''); setEndDate(''); }}
            className="text-sm text-blue-600 hover:underline"
          >
            清除筛选
          </button>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-500">总收入</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">¥{totalIncome.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-500">总支出</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">¥{totalExpense.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-500">盈利</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ¥{profit.toFixed(2)}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>支出分类占比</CardTitle>
          </CardHeader>
          <CardContent>
            {expenseByCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={expenseByCategory}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {expenseByCategory.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `¥${value.toFixed(2)}`} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-400">暂无数据</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>收入来源占比</CardTitle>
          </CardHeader>
          <CardContent>
            {incomeBySource.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={incomeBySource}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {incomeBySource.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `¥${value.toFixed(2)}`} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-400">暂无数据</div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>收支趋势</CardTitle>
        </CardHeader>
        <CardContent>
          {trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value: number) => `¥${value.toFixed(2)}`} />
                <Legend />
                <Line type="monotone" dataKey="收入" stroke="#10B981" strokeWidth={2} />
                <Line type="monotone" dataKey="支出" stroke="#EF4444" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400">暂无数据</div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>最近支出</CardTitle>
          </CardHeader>
          <CardContent>
            {recentExpenses.length > 0 ? (
              <div className="space-y-2">
                {recentExpenses.map(item => (
                  <div key={item.id} className="flex justify-between items-center py-2 border-b">
                    <div>
                      <p className="font-medium">{item.category}</p>
                      <p className="text-sm text-gray-500">{item.date}</p>
                    </div>
                    <p className="text-red-600 font-medium">¥{item.amount.toFixed(2)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-4">暂无记录</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>最近收入</CardTitle>
          </CardHeader>
          <CardContent>
            {recentIncomes.length > 0 ? (
              <div className="space-y-2">
                {recentIncomes.map(item => (
                  <div key={item.id} className="flex justify-between items-center py-2 border-b">
                    <div>
                      <p className="font-medium">{item.source}</p>
                      <p className="text-sm text-gray-500">{item.date}</p>
                    </div>
                    <p className="text-green-600 font-medium">¥{item.amount.toFixed(2)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-4">暂无记录</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function getMonthlyTrend(expenses: any[], incomes: any[]) {
  const monthMap = new Map<string, { income: number; expense: number }>();
  
  expenses.forEach(e => {
    const m = e.date.slice(0, 7);
    const current = monthMap.get(m) || { income: 0, expense: 0 };
    monthMap.set(m, { ...current, expense: current.expense + e.amount });
  });
  
  incomes.forEach(i => {
    const m = i.date.slice(0, 7);
    const current = monthMap.get(m) || { income: 0, expense: 0 };
    monthMap.set(m, { ...current, income: current.income + i.amount });
  });

  return Array.from(monthMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-6)
    .map(([month, data]) => ({
      month,
      收入: data.income,
      支出: data.expense
    }));
}

export default DashboardPage;
