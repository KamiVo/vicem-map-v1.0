import React, { useState, useEffect } from 'react';
import { FaTimes, FaSpinner, FaSave, FaTrash, FaPlus, FaChartBar, FaBoxOpen } from 'react-icons/fa';
import { fetchSalesData, saveSalesData, fetchProducts, saveProduct, deleteProduct } from '../services/firebase';

const MONTHS = ['Tháng 1','Tháng 2','Tháng 3','Tháng 4','Tháng 5','Tháng 6','Tháng 7','Tháng 8','Tháng 9','Tháng 10','Tháng 11','Tháng 12'];
const CURRENT_YEAR = new Date().getFullYear();

const emptyProduct = { name: '', stock: '', stockUnit: 'Bao', price: '', priceUnit: 'Bao' };

const DataManagementModal = ({ dealer, onClose }) => {
  const [activeTab, setActiveTab] = useState('sales');
  const [selectedYear, setSelectedYear] = useState(CURRENT_YEAR);
  
  // Sales state
  const [months, setMonths] = useState(Array(12).fill(0));
  const [salesLoading, setSalesLoading] = useState(false);
  const [salesSaving, setSalesSaving] = useState(false);
  
  // Products state
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null); // null | 'new' | {id, ...}

  // Load sales data on year change
  useEffect(() => {
    if (!dealer?.id) return;
    setSalesLoading(true);
    fetchSalesData(dealer.id, selectedYear)
      .then(data => setMonths(data.months || Array(12).fill(0)))
      .catch(console.error)
      .finally(() => setSalesLoading(false));
  }, [dealer?.id, selectedYear]);

  // Load products
  useEffect(() => {
    if (!dealer?.id) return;
    setProductsLoading(true);
    fetchProducts(dealer.id)
      .then(setProducts)
      .catch(console.error)
      .finally(() => setProductsLoading(false));
  }, [dealer?.id]);

  const total = months.reduce((s, v) => s + (Number(v) || 0), 0);

  const handleMonthChange = (idx, val) => {
    const updated = [...months];
    updated[idx] = val === '' ? 0 : Number(val);
    setMonths(updated);
  };

  const handleSaveSales = async () => {
    setSalesSaving(true);
    try {
      await saveSalesData(dealer.id, selectedYear, months);
      alert(`Đã lưu sản lượng năm ${selectedYear} thành công!`);
    } catch (e) {
      console.error(e);
      alert('Lỗi khi lưu sản lượng.');
    } finally {
      setSalesSaving(false);
    }
  };

  const handleSaveProduct = async (product) => {
    try {
      await saveProduct(dealer.id, product);
      const updated = await fetchProducts(dealer.id);
      setProducts(updated);
      setEditingProduct(null);
    } catch (e) {
      console.error(e);
      alert('Lỗi khi lưu sản phẩm.');
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Xóa sản phẩm này?')) return;
    try {
      await deleteProduct(dealer.id, productId);
      setProducts(prev => prev.filter(p => p.id !== productId));
    } catch (e) {
      alert('Lỗi khi xóa sản phẩm.');
    }
  };

  if (!dealer) return null;

  return (
    <div className="fixed inset-0 z-[4000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-[#1a2332] text-white p-5 flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-lg font-bold">Quản lý Số Liệu</h2>
            <p className="text-xs text-gray-400 mt-0.5 truncate max-w-md">{dealer.name}</p>
          </div>
          <button onClick={onClose} className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors">
            <FaTimes />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 shrink-0">
          <button
            onClick={() => setActiveTab('sales')}
            className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'sales' ? 'text-orange-600 border-b-2 border-orange-500 bg-orange-50' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <FaChartBar /> Sản lượng kinh doanh
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'products' ? 'text-orange-600 border-b-2 border-orange-500 bg-orange-50' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <FaBoxOpen /> Hàng hóa đang bán
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6">
          
          {/* ===== SALES TAB ===== */}
          {activeTab === 'sales' && (
            <div>
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-gray-800">Nhập sản lượng theo từng tháng</h3>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-500 font-medium">Năm:</label>
                  <select
                    value={selectedYear}
                    onChange={e => setSelectedYear(Number(e.target.value))}
                    className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm font-bold text-gray-800 outline-none focus:ring-2 focus:ring-orange-400"
                  >
                    {Array.from({ length: 10 }, (_, i) => CURRENT_YEAR - i).map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min="2000"
                    max={CURRENT_YEAR + 5}
                    value={selectedYear}
                    onChange={e => e.target.value && setSelectedYear(Number(e.target.value))}
                    className="w-24 border border-gray-200 rounded-lg px-2 py-1.5 text-sm font-bold text-gray-800 outline-none focus:ring-2 focus:ring-orange-400 text-center"
                    placeholder="Năm..."
                  />
                </div>
              </div>

              {salesLoading ? (
                <div className="flex items-center justify-center h-48 text-gray-400">
                  <FaSpinner className="animate-spin mr-2" /> Đang tải dữ liệu...
                </div>
              ) : (
                <>
                  {/* Total Banner */}
                  <div className="bg-gradient-to-r from-orange-500 to-orange-400 rounded-xl p-4 text-white flex justify-between items-center mb-5 shadow-md shadow-orange-200">
                    <div>
                      <p className="text-orange-100 text-xs font-bold uppercase tracking-wider">Tổng sản lượng tích lũy năm {selectedYear}</p>
                      <p className="text-3xl font-black mt-1">{total.toLocaleString()} Tấn</p>
                    </div>
                    <div className="bg-white/20 p-3 rounded-xl">
                      <FaChartBar className="text-2xl" />
                    </div>
                  </div>

                  {/* Monthly Input Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-6">
                    {months.map((val, idx) => (
                      <div key={idx} className="bg-gray-50 border border-gray-100 rounded-xl p-3 hover:border-orange-200 transition-colors">
                        <label className="block text-xs font-bold text-gray-500 mb-1.5">{MONTHS[idx]}</label>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min="0"
                            value={val === 0 ? '' : val}
                            placeholder="0"
                            onChange={e => handleMonthChange(idx, e.target.value)}
                            className="w-full bg-white border border-gray-200 rounded-lg px-2 py-1.5 text-sm font-bold text-gray-800 outline-none focus:ring-2 focus:ring-orange-400 text-center"
                          />
                          <span className="text-xs text-gray-400 shrink-0">T</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={handleSaveSales}
                    disabled={salesSaving}
                    className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-sm transition-colors shadow-md shadow-orange-200 flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {salesSaving ? <FaSpinner className="animate-spin" /> : <FaSave />}
                    {salesSaving ? 'Đang lưu...' : `Lưu sản lượng năm ${selectedYear}`}
                  </button>
                </>
              )}
            </div>
          )}

          {/* ===== PRODUCTS TAB ===== */}
          {activeTab === 'products' && (
            <div>
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-gray-800">Danh mục hàng hóa ({products.length}/10)</h3>
                {products.length < 10 && !editingProduct && (
                  <button
                    onClick={() => setEditingProduct({ ...emptyProduct })}
                    className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold px-4 py-2 rounded-xl transition-colors"
                  >
                    <FaPlus /> Thêm hàng hóa
                  </button>
                )}
              </div>

              {/* nếu editingProduct không có id thì là thêm mới → hiện form ở đầu */}
              {editingProduct && !editingProduct.id && (
                <ProductForm
                  product={editingProduct}
                  onSave={handleSaveProduct}
                  onCancel={() => setEditingProduct(null)}
                />
              )}

              {productsLoading ? (
                <div className="flex items-center justify-center h-32 text-gray-400">
                  <FaSpinner className="animate-spin mr-2" /> Đang tải sản phẩm...
                </div>
              ) : products.length === 0 && !editingProduct ? (
                <div className="text-center py-12 text-gray-400">
                  <FaBoxOpen className="text-4xl mx-auto mb-3 opacity-30" />
                  <p className="font-medium">Chưa có hàng hóa nào.</p>
                  <p className="text-sm">Nhấn "Thêm hàng hóa" để bắt đầu.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {products.map(p => (
                    editingProduct?.id === p.id ? (
                      <ProductForm key={p.id} product={editingProduct} onSave={handleSaveProduct} onCancel={() => setEditingProduct(null)} />
                    ) : (
                      <div key={p.id} className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-orange-200 hover:shadow-sm transition-all group">
                        <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center shrink-0">
                          <FaBoxOpen className="text-orange-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm text-gray-900 truncate">{p.name}</p>
                          <p className="text-xs text-gray-500 mt-0.5">Tồn: <b className="text-gray-700">{Number(p.stock).toLocaleString()} {p.stockUnit}</b> · Giá: <b className="text-gray-700">{Number(p.price).toLocaleString()}đ/{p.priceUnit}</b></p>
                        </div>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => setEditingProduct(p)} className="text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded-lg font-bold transition-colors">Sửa</button>
                          <button onClick={() => handleDeleteProduct(p.id)} className="text-xs bg-red-50 text-red-500 hover:bg-red-100 px-3 py-1.5 rounded-lg font-bold transition-colors"><FaTrash /></button>
                        </div>
                      </div>
                    )
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Inline Product Form Component
const ProductForm = ({ product, onSave, onCancel }) => {
  const [form, setForm] = useState(product);

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return alert('Vui lòng nhập tên hàng hóa.');
    onSave(form);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-orange-50 border-2 border-orange-200 rounded-xl p-4 mb-3 space-y-3">
      <p className="text-sm font-bold text-orange-700">{form.id ? 'Chỉnh sửa' : 'Thêm'} hàng hóa</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="sm:col-span-2">
          <label className="text-xs font-bold text-gray-600 block mb-1">Tên hàng hóa *</label>
          <input required name="name" value={form.name} onChange={handleChange} placeholder="VD: Xi măng PCB40" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-400" />
        </div>
        <div>
          <label className="text-xs font-bold text-gray-600 block mb-1">Tồn kho</label>
          <div className="flex gap-2">
            <input type="number" name="stock" value={form.stock} onChange={handleChange} placeholder="0" className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-400" />
            <input name="stockUnit" value={form.stockUnit} onChange={handleChange} placeholder="Bao" className="w-20 border border-gray-200 rounded-lg px-2 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-400" />
          </div>
        </div>
        <div>
          <label className="text-xs font-bold text-gray-600 block mb-1">Đơn giá (đ)</label>
          <div className="flex gap-2">
            <input type="number" name="price" value={form.price} onChange={handleChange} placeholder="0" className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-400" />
            <input name="priceUnit" value={form.priceUnit} onChange={handleChange} placeholder="Bao" className="w-20 border border-gray-200 rounded-lg px-2 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-400" />
          </div>
        </div>
      </div>
      <div className="flex gap-2 justify-end pt-1">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-gray-600 font-bold bg-white hover:bg-gray-50 rounded-lg text-sm border border-gray-200 transition-colors">Hủy</button>
        <button type="submit" className="px-4 py-2 text-white font-bold bg-orange-500 hover:bg-orange-600 rounded-lg text-sm transition-colors flex items-center gap-2"><FaSave /> Lưu</button>
      </div>
    </form>
  );
};

export default DataManagementModal;
