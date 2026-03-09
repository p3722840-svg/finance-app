import { useState } from 'react';
import { Plus, Edit2, Trash2, Settings } from 'lucide-react';
import { useFinanceStore, Expense } from '../store/financeStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

function ExpensesPage() {
  const { expenses, expenseCategories, addExpenseCategory, removeExpenseCategory, addExpense, updateExpense, deleteExpense } = useFinanceStore();
  const [showModal, setShowModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newCategory, setNewCategory] = useState('');
  const [form, setForm] = useState({ amount: '', category: '', date: '', remark: '' });

  const handleSubmit = () => {
    if (!form.amount || !form.date || !form.category) return;
    if (editingId) {
      updateExpense(editingId, { ...form, amount: parseFloat(form.amount) });
    } else {
      addExpense({ ...form, amount: parseFloat(form.amount) });
    }
    setShowModal(false);
    setEditingId(null);
    setForm({ amount: '', category: expenseCategories[0] || '', date: '', remark: '' });
  };

  const handleEdit = (item: Expense) => {
    setForm({ amount: String(item.amount), category: item.category, date: item.date, remark: item.remark });
    setEditingId(item.id);
    setShowModal(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('确定删除这条记录？')) {
      deleteExpense(id);
    }
  };

  const handleAddCategory = () => {
    if (newCategory.trim()) {
      addExpenseCategory(newCategory.trim());
      setNewCategory('');
    }
  };

  const handleRemoveCategory = (category: string) => {
    if (confirm(`确定删除分类"${category}"？`)) {
      removeExpenseCategory(category);
    }
  };

  const total = expenses.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">支出管理</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowSettings(true)}>
            <Settings className="w-4 h-4 mr-2" />
            分类管理
          </Button>
          <Button onClick={() => { setForm({ amount: '', category: expenseCategories[0] || '', date: '', remark: '' }); setEditingId(null); setShowModal(true); }}>
            <Plus className="w-4 h-4 mr-2" />
            添加支出
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-gray-500">本月支出总额</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-red-500">¥{total.toFixed(2)}</p>
        </CardContent>
      </Card>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>日期</TableHead>
              <TableHead>分类</TableHead>
              <TableHead>金额</TableHead>
              <TableHead>备注</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {expenses.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.date}</TableCell>
                <TableCell>
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">{item.category}</span>
                </TableCell>
                <TableCell className="text-red-600 font-medium">¥{item.amount.toFixed(2)}</TableCell>
                <TableCell className="text-gray-500">{item.remark || '-'}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(item)} className="mr-2">
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)}>
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {expenses.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-gray-400 h-24">
                  暂无支出记录
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {showModal && (
        <>
          <div className="fixed inset-0 z-50 bg-black/50" onClick={() => setShowModal(false)} />
          <div className="fixed top-1/2 left-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold mb-4">{editingId ? '编辑支出' : '添加支出'}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">金额</label>
                <Input
                  type="number"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">分类</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {expenseCategories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">日期</label>
                <Input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">备注</label>
                <Input
                  type="text"
                  value={form.remark}
                  onChange={(e) => setForm({ ...form, remark: e.target.value })}
                  placeholder="可选"
                />
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowModal(false)}>取消</Button>
                <Button onClick={handleSubmit}>确定</Button>
              </div>
            </div>
          </div>
        </>
      )}

      {showSettings && (
        <>
          <div className="fixed inset-0 z-50 bg-black/50" onClick={() => setShowSettings(false)} />
          <div className="fixed top-1/2 left-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold mb-4">支出分类管理</h3>
            <div className="space-y-3">
              {expenseCategories.map((cat) => (
                <div key={cat} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span>{cat}</span>
                  <Button variant="ghost" size="sm" onClick={() => handleRemoveCategory(cat)} className="text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <div className="flex gap-2">
                <Input
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="新分类名称"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
                />
                <Button onClick={handleAddCategory}>添加</Button>
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <Button variant="outline" onClick={() => setShowSettings(false)}>关闭</Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default ExpensesPage;
