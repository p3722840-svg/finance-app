import { useState } from 'react';
import { Plus, Edit2, Trash2, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';
import { useFinanceStore, InventoryItem } from '../store/financeStore';
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

function InventoryPage() {
  const { inventory, addInventory, updateInventory, deleteInventory } = useFinanceStore();
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ product_name: '', quantity: '', unit_price: '', type: 'in' as 'in' | 'out', date: '' });

  const handleSubmit = () => {
    if (!form.product_name || !form.quantity || !form.unit_price || !form.date) return;
    const data = {
      product_name: form.product_name,
      quantity: parseInt(form.quantity),
      unit_price: parseFloat(form.unit_price),
      type: form.type,
      date: form.date,
    };
    if (editingId) {
      updateInventory(editingId, data);
    } else {
      addInventory(data);
    }
    setShowModal(false);
    setEditingId(null);
    setForm({ product_name: '', quantity: '', unit_price: '', type: 'in', date: '' });
  };

  const handleEdit = (item: InventoryItem) => {
    setForm({
      product_name: item.product_name,
      quantity: String(item.quantity),
      unit_price: String(item.unit_price),
      type: item.type,
      date: item.date,
    });
    setEditingId(item.id);
    setShowModal(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('确定删除这条记录？')) {
      deleteInventory(id);
    }
  };

  const stockMap = new Map<string, number>();
  inventory.forEach((item) => {
    const current = stockMap.get(item.product_name) || 0;
    stockMap.set(item.product_name, item.type === 'in' ? current + item.quantity : current - item.quantity);
  });

  const totalIn = inventory
    .filter((i) => i.type === 'in')
    .reduce((sum, i) => sum + i.quantity * i.unit_price, 0);
  const totalOut = inventory
    .filter((i) => i.type === 'out')
    .reduce((sum, i) => sum + i.quantity * i.unit_price, 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">库存管理</h2>
        <Button onClick={() => { setForm({ product_name: '', quantity: '', unit_price: '', type: 'in', date: '' }); setEditingId(null); setShowModal(true); }}>
          <Plus className="w-4 h-4 mr-2" />
          添加记录
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-500">入库总额</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">¥{totalIn.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-500">出库总额</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">¥{totalOut.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-500">库存种类</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600">{stockMap.size}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>当前库存</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            {Array.from(stockMap.entries()).map(([name, qty]) => (
              <div key={name} className="bg-gray-50 rounded-lg p-3">
                <p className="font-medium text-gray-800 truncate">{name}</p>
                <p className={`text-lg font-bold ${qty > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {qty > 0 ? qty : '缺货'}
                </p>
              </div>
            ))}
            {stockMap.size === 0 && (
              <p className="col-span-4 text-center text-gray-400 py-4">暂无库存记录</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>日期</TableHead>
              <TableHead>类型</TableHead>
              <TableHead>商品名称</TableHead>
              <TableHead>数量</TableHead>
              <TableHead>单价</TableHead>
              <TableHead>小计</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inventory.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.date}</TableCell>
                <TableCell>
                  {item.type === 'in' ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded text-sm">
                      <ArrowDownToLine className="w-3 h-3" /> 入库
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded text-sm">
                      <ArrowUpFromLine className="w-3 h-3" /> 出库
                    </span>
                  )}
                </TableCell>
                <TableCell>{item.product_name}</TableCell>
                <TableCell>{item.quantity}</TableCell>
                <TableCell>¥{item.unit_price.toFixed(2)}</TableCell>
                <TableCell className="font-medium">¥{(item.quantity * item.unit_price).toFixed(2)}</TableCell>
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
            {inventory.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-gray-400 h-24">
                  暂无库存记录
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
            <h3 className="text-lg font-semibold mb-4">{editingId ? '编辑记录' : '添加记录'}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">类型</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value as 'in' | 'out' })}
                  className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="in">入库</option>
                  <option value="out">出库</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">商品名称</label>
                <Input
                  type="text"
                  value={form.product_name}
                  onChange={(e) => setForm({ ...form, product_name: e.target.value })}
                  placeholder="请输入商品名称"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">数量</label>
                  <Input
                    type="number"
                    value={form.quantity}
                    onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">单价</label>
                  <Input
                    type="number"
                    value={form.unit_price}
                    onChange={(e) => setForm({ ...form, unit_price: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">日期</label>
                <Input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
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
    </div>
  );
}

export default InventoryPage;
