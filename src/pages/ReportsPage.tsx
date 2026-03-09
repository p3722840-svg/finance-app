import { useState } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useFinanceStore } from '../store/financeStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

function ReportsPage() {
  const { expenses, incomes, expenseCategories, incomeSources } = useFinanceStore();
  const [year, setYear] = useState(new Date().getFullYear().toString());

  const filterByYear = (dateStr: string) => dateStr.startsWith(year);

  const yearExpenses = expenses.filter(e => filterByYear(e.date));
  const yearIncomes = incomes.filter(i => filterByYear(i.date));

  const monthlyData = getMonthlyData(yearExpenses, yearIncomes);
  
  const totalExpense = yearExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalIncome = yearIncomes.reduce((sum, i) => sum + i.amount, 0);
  const profit = totalIncome - totalExpense;

  const expenseByCategory = expenseCategories.map(cat => ({
    name: cat,
    value: yearExpenses.filter(e => e.category === cat).reduce((sum, e) => sum + e.amount, 0)
  })).filter(item => item.value > 0);

  const incomeBySource = incomeSources.map(src => ({
    name: src,
    value: yearIncomes.filter(i => i.source === src).reduce((sum, i) => sum + i.amount, 0)
  })).filter(item => item.value > 0);

  const topExpenses = [...expenseByCategory].sort((a, b) => b.value - a.value).slice(0, 5);
  const topIncomes = [...incomeBySource].sort((a, b) => b.value - a.value).slice(0, 5);

  const expenseRecords = yearExpenses.length;
  const incomeRecords = yearIncomes.length;
  const avgExpense = expenseRecords > 0 ? totalExpense / expenseRecords : 0;
  const avgIncome = incomeRecords > 0 ? totalIncome / incomeRecords : 0;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">财务报表</h2>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">年份:</label>
          <Input
            type="number"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="w-24"
          />
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-500">年收入</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">¥{totalIncome.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-500">年支出</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">¥{totalExpense.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-500">年盈利</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ¥{profit.toFixed(2)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-500">月均结余</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${profit / 12 >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ¥{(profit / 12).toFixed(2)}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>月均支出/收入对比</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">月均支出: ¥{avgExpense.toFixed(2)}</p>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div className="bg-red-500 h-3 rounded-full" style={{ width: '100%' }}></div>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">月均收入: ¥{avgIncome.toFixed(2)}</p>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div className="bg-green-500 h-3 rounded-full" style={{ width: '100%' }}></div>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">支出记录数: {expenseRecords} 笔</p>
                <p className="text-sm text-gray-500">收入记录数: {incomeRecords} 笔</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>年度统计</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">收入记录</span>
                <span className="font-medium">{incomeRecords} 笔</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">支出记录</span>
                <span className="font-medium">{expenseRecords} 笔</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">支出分类数</span>
                <span className="font-medium">{expenseByCategory.length} 类</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">收入来源数</span>
                <span className="font-medium">{incomeBySource.length} 类</span>
              </div>
              <div className="flex justify-between border-t pt-2 mt-2">
                <span className="text-gray-500">支出占比收入</span>
                <span className="font-medium text-red-500">
                  {totalIncome > 0 ? ((totalExpense / totalIncome) * 100).toFixed(1) : 0}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>月度收支柱状图</CardTitle>
        </CardHeader>
        <CardContent>
          {monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value: number) => `¥${value.toFixed(2)}`} />
                <Legend />
                <Bar dataKey="收入" fill="#10B981" />
                <Bar dataKey="支出" fill="#EF4444" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400">暂无数据</div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>支出分类排行</CardTitle>
          </CardHeader>
          <CardContent>
            {topExpenses.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={topExpenses}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {topExpenses.map((_, index) => (
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
            <CardTitle>收入来源排行</CardTitle>
          </CardHeader>
          <CardContent>
            {topIncomes.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={topIncomes}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {topIncomes.map((_, index) => (
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
    </div>
  );
}

function getMonthlyData(expenses: any[], incomes: any[]) {
  const monthMap = new Map<string, { income: number; expense: number }>();
  
  for (let i = 1; i <= 12; i++) {
    const m = `${i}`.padStart(2, '0');
    monthMap.set(m, { income: 0, expense: 0 });
  }
  
  expenses.forEach(e => {
    const m = e.date.slice(5, 7);
    const current = monthMap.get(m) || { income: 0, expense: 0 };
    monthMap.set(m, { ...current, expense: current.expense + e.amount });
  });
  
  incomes.forEach(i => {
    const m = i.date.slice(5, 7);
    const current = monthMap.get(m) || { income: 0, expense: 0 };
    monthMap.set(m, { ...current, income: current.income + i.amount });
  });

  return Array.from(monthMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([month, data]) => ({
      month: `${month}月`,
      收入: data.income,
      支出: data.expense
    }));
}

export default ReportsPage;
