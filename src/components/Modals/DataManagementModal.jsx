import React, { useState, useEffect } from 'react';
import { FaTimes, FaSpinner, FaSave, FaTrash, FaPlus, FaChartBar, FaBoxOpen } from 'react-icons/fa';
import { fetchSalesData, saveSalesData, fetchProducts, saveProduct, deleteProduct, fetchAllSalesYears } from '../../services/firebase';
import CustomSelect from '../UI/CustomSelect';
import { errorAlert, successAlert, confirmAlert } from '../../utils/alerts';

const MONTHS = ['Tháng 1','Tháng 2','Tháng 3','Tháng 4','Tháng 5','Tháng 6','Tháng 7','Tháng 8','Tháng 9','Tháng 10','Tháng 11','Tháng 12'];
const CURRENT_YEAR = new Date().getFullYear();

const emptyProduct = { name: '', stock: '', stockUnit: 'Bao', price: '', priceUnit: 'Bao' };

const DataManagementModal = ({ dealer, onClose }) => {
  const [activeTab, setActiveTab] = useState('sales');
  const [selectedYear, setSelectedYear] = useState(CURRENT_YEAR);
  const [availableYears, setAvailableYears] = useState([CURRENT_YEAR]);
  
  // Sales state
  const [months, setMonths] = useState(Array(12).fill(0));
  const [salesLoading, setSalesLoading] = useState(false);
  const [salesSaving, setSalesSaving] = useState(false);
  
  // Products state
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null); // null | 'new' | {id, ...}

  // Load available years
  useEffect(() => {
    if (!dealer?.id) return;
    fetchAllSalesYears(dealer.id)
      .then(yearsData => {
        const years = yearsData.map(y => Number(y.year));
        if (!years.includes(CURRENT_YEAR)) years.push(CURRENT_YEAR);
        setAvailableYears(Array.from(new Set(years)).sort((a, b) => b - a));
      })
      .catch(console.error);
  }, [dealer?.id]);

  useEffect(() => {
    if (!availableYears.includes(selectedYear)) {
      setAvailableYears(prev => Array.from(new Set([...prev, selectedYear])).sort((a, b) => b - a));
    }
  }, [selectedYear, availableYears]);

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
      successAlert("Thành công", `Đã lưu sản lượng năm ${selectedYear} thành công!`);
    } catch (e) {
      console.error(e);
      errorAlert('Lỗi', 'Lỗi khi lưu sản lượng.');
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
      errorAlert('Lỗi', 'Lỗi khi lưu sản phẩm.');
    }
  };

  const handleDeleteProduct = async (productId) => {
    const isConfirmed = await confirmAlert("Xác nhận xóa", "Xóa sản phẩm này?");
    if (!isConfirmed) return;
    try {
      await deleteProduct(dealer.id, productId);
      setProducts(prev => prev.filter(p => p.id !== productId));
    } catch (e) {
      errorAlert('Lỗi', 'Lỗi khi xóa sản phẩm.');
    }
  };

  if (!dealer) return null;

  return (
    <div className="fixed inset-0 z-[4000] bg-gray-900/40 backdrop-blur-md flex items-center justify-center p-4 animate-slide-up">
      <div className="bg-white/85 backdrop-blur-2xl border border-white/50 w-full max-w-4xl rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600/90 to-cyan-500/90 px-8 py-5 flex justify-between items-center shrink-0 border-b border-white/20">
          <div>
            <h2 className="text-xl font-black text-white drop-shadow-md tracking-wide">Quản lý Dữ Liệu Đại lý</h2>
            <p className="text-xs text-blue-100 mt-1 font-medium truncate max-w-md uppercase tracking-wider">{dealer.name}</p>
          </div>
          <button onClick={onClose} className="bg-white/10 hover:bg-red-500 hover:text-white text-blue-100 p-2.5 rounded-full transition-all">
            <FaTimes size={16} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex bg-white/40 backdrop-blur-md border-b border-white/40 shrink-0 px-4">
          <button
            onClick={() => setActiveTab('sales')}
            className={`flex-1 py-4 text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all border-b-2 ${activeTab === 'sales' ? 'text-blue-700 border-blue-600 bg-white/50' : 'text-gray-500 border-transparent hover:text-blue-600 hover:bg-white/20'}`}
          >
            <FaChartBar /> Sản lượng kinh doanh
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`flex-1 py-4 text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all border-b-2 ${activeTab === 'products' ? 'text-blue-700 border-blue-600 bg-white/50' : 'text-gray-500 border-transparent hover:text-blue-600 hover:bg-white/20'}`}
          >
            <FaBoxOpen /> Hàng hóa đang bán
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
          
          {/* ===== SALES TAB ===== */}
          {activeTab === 'sales' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-black text-gray-800 uppercase tracking-wide text-sm">Nhập sản lượng theo từng tháng</h3>
                <div className="flex items-center gap-3">
                  <label className="text-xs text-blue-900/60 font-black uppercase tracking-widest">Năm:</label>
                  <div className="w-32">
                    <CustomSelect
                      value={selectedYear}
                      onChange={e => setSelectedYear(Number(e.target.value))}
                      triggerClassName="px-4 py-2 text-sm font-bold bg-white"
                      options={Array.from({ length: CURRENT_YEAR - 1900 + 1 }, (_, i) => CURRENT_YEAR - i)
                        .concat(availableYears)
                        .filter((v, i, self) => self.indexOf(v) === i)
                        .sort((a, b) => b - a)
                        .map(y => ({ label: y, value: y }))}
                    />
                  </div>
                </div>
              </div>

              {salesLoading ? (
                <div className="flex items-center justify-center h-48 text-blue-600">
                  <FaSpinner className="animate-spin mr-3 text-2xl" /> <span className="font-bold text-sm uppercase tracking-wider">Đang tải dữ liệu...</span>
                </div>
              ) : (
                <>
                  {/* Total Banner */}
                  <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl p-5 text-white flex justify-between items-center mb-6 shadow-[0_10px_30px_rgba(6,182,212,0.3)]">
                    <div>
                      <p className="text-blue-100 text-xs font-black uppercase tracking-widest mb-1 opacity-90">Tổng sản lượng năm {selectedYear}</p>
                      <p className="text-4xl font-black drop-shadow-md">{total.toLocaleString()} <span className="text-lg font-bold opacity-80">Tấn</span></p>
                    </div>
                    <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-sm border border-white/30 shadow-inner">
                      <FaChartBar className="text-3xl" />
                    </div>
                  </div>

                  {/* Monthly Input Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-8">
                    {months.map((val, idx) => (
                      <div key={idx} className="bg-white/50 border border-white/60 shadow-inner rounded-2xl p-4 hover:border-blue-300 transition-colors">
                        <label className="block text-[11px] font-black text-blue-900/60 mb-2 uppercase tracking-wide">{MONTHS[idx]}</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="0"
                            value={val === 0 ? '' : val}
                            placeholder="0"
                            onChange={e => handleMonthChange(idx, e.target.value)}
                            className="w-full bg-white/80 border border-gray-200/50 rounded-xl px-3 py-2 text-sm font-bold text-gray-800 outline-none focus:ring-2 focus:ring-blue-500/50 text-center shadow-sm"
                          />
                          <span className="text-xs font-bold text-gray-400 shrink-0">Tấn</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={handleSaveSales}
                    disabled={salesSaving}
                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-black uppercase tracking-wider rounded-xl text-sm transition-all shadow-[0_10px_20px_rgba(59,130,246,0.3)] hover:shadow-[0_10px_25px_rgba(34,211,238,0.4)] hover:-translate-y-1 flex items-center justify-center gap-3 disabled:opacity-60"
                  >
                    {salesSaving ? <FaSpinner className="animate-spin" /> : <FaSave size={16} />}
                    {salesSaving ? 'Đang lưu...' : `Lưu sản lượng năm ${selectedYear}`}
                  </button>
                </>
              )}
            </div>
          )}

          {/* ===== PRODUCTS TAB ===== */}
          {activeTab === 'products' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-black text-gray-800 uppercase tracking-wide text-sm">Danh mục hàng hóa ({products.length}/10)</h3>
                {products.length < 10 && !editingProduct && (
                  <button
                    onClick={() => setEditingProduct({ ...emptyProduct })}
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-xs font-black uppercase tracking-wider px-5 py-2.5 rounded-xl transition-all shadow-[0_4px_15px_rgba(59,130,246,0.3)] hover:-translate-y-0.5"
                  >
                    <FaPlus /> Thêm hàng hóa
                  </button>
                )}
              </div>

              {editingProduct && !editingProduct.id && (
                <ProductForm
                  product={editingProduct}
                  onSave={handleSaveProduct}
                  onCancel={() => setEditingProduct(null)}
                />
              )}

              {productsLoading ? (
                <div className="flex items-center justify-center h-32 text-blue-600">
                  <FaSpinner className="animate-spin mr-3 text-2xl" /> <span className="font-bold text-sm uppercase tracking-wider">Đang tải sản phẩm...</span>
                </div>
              ) : products.length === 0 && !editingProduct ? (
                <div className="text-center py-16 bg-white/40 border border-white/60 rounded-3xl">
                  <FaBoxOpen className="text-6xl mx-auto mb-4 text-blue-900/20" />
                  <p className="font-black text-blue-900/60 uppercase tracking-wide">Chưa có hàng hóa nào.</p>
                  <p className="text-xs font-medium text-gray-500 mt-2">Nhấn "Thêm hàng hóa" để bắt đầu thiết lập kho.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {products.map(p => (
                    editingProduct?.id === p.id ? (
                      <ProductForm key={p.id} product={editingProduct} onSave={handleSaveProduct} onCancel={() => setEditingProduct(null)} />
                    ) : (
                      <div key={p.id} className="flex items-center gap-5 p-5 rounded-2xl bg-white/60 border border-white/60 hover:bg-white hover:shadow-lg transition-all group">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-blue-50 border border-blue-200 flex items-center justify-center shrink-0 shadow-inner">
                          <FaBoxOpen className="text-blue-500 text-xl" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-black text-sm text-gray-900 truncate">{p.name}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Tồn: <b className="text-blue-700">{Number(p.stock).toLocaleString()}</b> {p.stockUnit} <span className="mx-2 text-gray-300">|</span> Giá: <b className="text-blue-700">{Number(p.price).toLocaleString()}đ</b>/{p.priceUnit}
                          </p>
                        </div>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => setEditingProduct(p)} className="text-xs bg-blue-50 border border-blue-200 text-blue-600 hover:bg-blue-600 hover:text-white px-4 py-2 rounded-xl font-bold uppercase tracking-wider transition-colors shadow-sm">Sửa</button>
                          <button onClick={() => handleDeleteProduct(p.id)} className="text-sm bg-red-50 border border-red-200 text-red-500 hover:bg-red-500 hover:text-white px-3 py-2 rounded-xl font-bold transition-colors shadow-sm"><FaTrash /></button>
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
    if (!form.name.trim()) return errorAlert('Lỗi', 'Vui lòng nhập tên hàng hóa.');
    onSave(form);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white/80 backdrop-blur-md border border-blue-200 shadow-[0_10px_30px_rgba(59,130,246,0.15)] rounded-2xl p-6 mb-5 space-y-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-500 to-cyan-400"></div>
      <p className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-cyan-500 uppercase tracking-wider">{form.id ? 'Chỉnh sửa' : 'Thêm'} hàng hóa</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="text-[11px] font-black text-blue-900/60 uppercase tracking-wide block mb-1.5">Tên hàng hóa *</label>
          <input required name="name" value={form.name} onChange={handleChange} placeholder="VD: Xi măng PCB40" className="w-full bg-white/50 border border-gray-200/80 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-800 outline-none focus:ring-2 focus:ring-blue-500/50 shadow-inner transition-all" />
        </div>
        <div>
          <label className="text-[11px] font-black text-blue-900/60 uppercase tracking-wide block mb-1.5">Tồn kho</label>
          <div className="flex gap-2">
            <input type="number" name="stock" value={form.stock} onChange={handleChange} placeholder="0" className="flex-1 bg-white/50 border border-gray-200/80 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-800 outline-none focus:ring-2 focus:ring-blue-500/50 shadow-inner transition-all" />
            <input name="stockUnit" value={form.stockUnit} onChange={handleChange} placeholder="Bao" className="w-24 bg-white/50 border border-gray-200/80 rounded-xl px-3 py-2.5 text-sm font-bold text-center text-gray-800 outline-none focus:ring-2 focus:ring-blue-500/50 shadow-inner transition-all" />
          </div>
        </div>
        <div>
          <label className="text-[11px] font-black text-blue-900/60 uppercase tracking-wide block mb-1.5">Đơn giá (đ)</label>
          <div className="flex gap-2">
            <input type="number" name="price" value={form.price} onChange={handleChange} placeholder="0" className="flex-1 bg-white/50 border border-gray-200/80 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-800 outline-none focus:ring-2 focus:ring-blue-500/50 shadow-inner transition-all" />
            <input name="priceUnit" value={form.priceUnit} onChange={handleChange} placeholder="Bao" className="w-24 bg-white/50 border border-gray-200/80 rounded-xl px-3 py-2.5 text-sm font-bold text-center text-gray-800 outline-none focus:ring-2 focus:ring-blue-500/50 shadow-inner transition-all" />
          </div>
        </div>
      </div>
      <div className="flex gap-3 justify-end pt-3">
        <button type="button" onClick={onCancel} className="px-5 py-2.5 text-gray-500 font-bold bg-white/50 border border-white/60 hover:bg-white rounded-xl transition-all shadow-sm text-sm">Hủy</button>
        <button type="submit" className="px-6 py-2.5 text-white font-black uppercase tracking-wider bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 rounded-xl transition-all shadow-[0_4px_15px_rgba(59,130,246,0.3)] hover:shadow-[0_4px_20px_rgba(34,211,238,0.4)] hover:-translate-y-0.5 text-sm flex items-center gap-2"><FaSave size={14} /> Lưu Lại</button>
      </div>
    </form>
  );
};

export default DataManagementModal;
