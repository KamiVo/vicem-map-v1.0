import React, { useState, useEffect } from 'react';
import { FaTimes, FaSync, FaMapMarkerAlt, FaPhoneAlt, FaBoxOpen, FaSpinner, FaCog } from 'react-icons/fa';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { fetchSalesData, fetchProducts } from '../services/firebase';

const CURRENT_YEAR = new Date().getFullYear();

const DashboardModal = ({ dealer, onClose, onOpenDataManager }) => {
  const [selectedYear, setSelectedYear] = useState(CURRENT_YEAR);

  const [salesData, setSalesData] = useState(null);
  const [salesLoading, setSalesLoading] = useState(false);

  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);

  // Load sales on year switch
  useEffect(() => {
    if (!dealer?.id) return;
    setSalesLoading(true);
    fetchSalesData(dealer.id, selectedYear)
      .then(setSalesData)
      .catch(console.error)
      .finally(() => setSalesLoading(false));
  }, [dealer?.id, selectedYear]);

  // Load products once
  useEffect(() => {
    if (!dealer?.id) return;
    setProductsLoading(true);
    fetchProducts(dealer.id)
      .then(setProducts)
      .catch(console.error)
      .finally(() => setProductsLoading(false));
  }, [dealer?.id]);

  if (!dealer) return null;

  // Build recharts-compatible data from months array
  const chartData = (salesData?.months || Array(12).fill(0)).map((val, idx) => ({
    month: idx + 1,
    value: val,
    name: `T${idx + 1}`,
  }));

  const total = salesData?.total ?? 0;

  return (
    <div className="fixed inset-0 z-[3000] bg-gray-900/50 backdrop-blur-md flex items-center justify-center p-4 md:p-8">
      <div className="bg-slate-50 w-full h-full max-w-7xl rounded-2xl shadow-2xl overflow-hidden flex flex-col relative">

        {/* Header */}
        <div className="bg-[#1a2332] text-white p-4 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-orange-500 text-white p-2 rounded-lg">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M4 10h3v7H4zM10.5 10h3v7h-3zM2 19h20v3H2zM17 10h3v7h-3zM12 1L2 6v2h20V6z"/></svg>
            </div>
            <div>
              <h1 className="text-lg font-bold">Hệ Thống Quản Lý VLXD</h1>
              <p className="text-xs text-gray-400">Phiên bản Số hóa Chuỗi Cung Ứng v2.1</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-slate-800 px-3 py-1.5 rounded-full text-xs text-emerald-400 flex items-center gap-2 border border-slate-700">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Trực tuyến
            </div>
            {onOpenDataManager && (
              <button
                onClick={onOpenDataManager}
                className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
              >
                <FaCog /> Quản lý Số Liệu
              </button>
            )}
            <button onClick={onClose} className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors ml-1">
              <FaTimes />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col lg:flex-row gap-6">

          {/* Left Column */}
          <div className="flex-1 flex flex-col gap-6">

            {/* Info Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Main Info */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="inline-block bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs font-bold mb-3">ĐẠI LÝ CẤP 1</div>
                <h2 className="text-2xl font-black text-gray-900 mb-4 uppercase">{dealer.name}</h2>
                <div className="space-y-2 text-sm text-gray-600">
                  <p className="flex items-start gap-2">
                    <FaMapMarkerAlt className="mt-1 text-gray-400 shrink-0" />
                    <span>{dealer.address}{dealer.ward ? `, ${dealer.ward}` : ''}, Quận {dealer.district}, Đà Nẵng</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <FaPhoneAlt className="text-gray-400 shrink-0" />
                    <span>{dealer.phone || 'Chưa cập nhật'}</span>
                  </p>
                </div>
              </div>

              {/* Legal Info */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-50">
                  <h3 className="font-bold text-gray-800 text-sm uppercase">Hồ sơ pháp lý & Đất đai</h3>
                  <span className="text-xs text-gray-400">Cập nhật: {CURRENT_YEAR}</span>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Thành lập năm</p>
                    <p className="text-xl font-bold text-gray-900">{dealer.establishedYear || '—'}</p>
                    <p className="text-sm text-gray-600 mt-1">Sáng lập: {dealer.founder || 'Chưa cập nhật'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Chủ hiện tại</p>
                    <p className="text-xl font-bold text-gray-900">{dealer.owner || 'Chưa cập nhật'}</p>
                    <p className="text-sm text-gray-600 mt-1">Đại diện pháp luật</p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-50 flex justify-between items-center">
                  <span className="text-sm text-gray-500">Tình trạng đất:</span>
                  <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-sm font-bold border border-blue-100">
                    {dealer.landStatus || 'Đang thuê'}
                  </span>
                </div>
                {dealer.ownerHistory && dealer.ownerHistory.length > 0 && (
                  <div className="mt-3 p-3 bg-yellow-50 text-yellow-800 border border-yellow-200 rounded-lg text-xs max-h-28 overflow-y-auto">
                    <span className="font-bold block mb-1">Lịch sử đổi chủ:</span>
                    <ul className="list-disc list-inside space-y-1 ml-1 text-[11px]">
                      {dealer.ownerHistory.map((old, idx) => <li key={idx}>{old}</li>)}
                    </ul>
                  </div>
                )}
                {/* Fallback for legacy oldOwner string */}
                {(!dealer.ownerHistory || dealer.ownerHistory.length === 0) && dealer.oldOwner && (
                  <div className="mt-3 p-2 bg-yellow-50 text-yellow-800 border border-yellow-200 rounded-lg text-xs">
                    <span className="font-bold">Chủ cũ:</span> {dealer.oldOwner}
                  </div>
                )}
              </div>
            </div>

            {/* Sales Chart */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex-1 flex flex-col">
              <div className="flex justify-between items-center mb-5">
                <div>
                  <h3 className="font-bold text-gray-800 flex items-center gap-2">
                    <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" /></svg>
                    Sản lượng kinh doanh đã bán
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">Ghi nhận tổng từng tháng và cộng lũy kế năm</p>
                </div>
                <div className="flex gap-2">
                  {[CURRENT_YEAR - 1, CURRENT_YEAR].map(y => (
                    <button
                      key={y}
                      onClick={() => setSelectedYear(y)}
                      className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${selectedYear === y ? 'bg-orange-500 text-white shadow-md shadow-orange-500/30' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                      {y}
                    </button>
                  ))}
                </div>
              </div>

              {salesLoading ? (
                <div className="flex-1 flex items-center justify-center text-gray-400">
                  <FaSpinner className="animate-spin mr-2" /> Đang tải dữ liệu...
                </div>
              ) : (
                <>
                  {/* Total Banner */}
                  <div className="bg-gradient-to-r from-orange-500 to-orange-400 rounded-xl p-5 text-white flex justify-between items-center mb-5 shadow-lg shadow-orange-500/20">
                    <div>
                      <p className="text-orange-100 text-sm font-bold uppercase tracking-wider mb-1">Tổng sản lượng tích lũy năm {selectedYear}</p>
                      <p className="text-4xl font-black">{total.toLocaleString()} Tấn</p>
                    </div>
                    <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                      <FaBoxOpen className="text-3xl" />
                    </div>
                  </div>

                  {/* Chart */}
                  <div className="h-56 w-full mb-6">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 11 }} dy={8} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 11 }} />
                        <Tooltip
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgb(0 0 0 / 0.1)' }}
                          formatter={(v) => [`${v} Tấn`, 'Sản lượng']}
                          labelFormatter={(l) => `Tháng ${l.replace('T','')}`}
                        />
                        <Area type="monotone" dataKey="value" stroke="#ea580c" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Monthly Table */}
                  <div>
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Chi tiết sản lượng từng tháng (Tấn)</h4>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                      {chartData.map((item, idx) => (
                        <div key={idx} className="bg-gray-50 border border-gray-100 rounded-lg p-3 text-center">
                          <p className="text-xs text-gray-500 mb-1">Tháng {item.month}</p>
                          <p className="font-bold text-gray-900 text-sm">{item.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Right Column - Products */}
          <div className="w-full lg:w-[380px] flex flex-col bg-white rounded-xl shadow-sm border border-gray-100 p-6 shrink-0">
            <div className="flex justify-between items-center mb-5 pb-4 border-b border-gray-100">
              <div>
                <h3 className="font-bold text-gray-800 flex items-center gap-2"><FaBoxOpen className="text-orange-500" /> Hàng hóa đang bán</h3>
                <p className="text-xs text-gray-500 mt-1">Danh mục sản phẩm chính thức</p>
              </div>
              <div className="bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-xs font-bold border border-orange-100">
                {products.length} / 10 SP
              </div>
            </div>

            {productsLoading ? (
              <div className="flex-1 flex items-center justify-center text-gray-400">
                <FaSpinner className="animate-spin mr-2" /> Đang tải...
              </div>
            ) : products.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400 text-center">
                <FaBoxOpen className="text-5xl mb-3 opacity-20" />
                <p className="font-medium text-sm">Chưa có hàng hóa nào.</p>
                <p className="text-xs mt-1">Nhấn "Quản lý Số Liệu" để thêm.</p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {products.map(product => (
                  <div key={product.id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-orange-200 hover:shadow-md transition-all group">
                    <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <FaBoxOpen className="text-orange-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm text-gray-900 truncate" title={product.name}>{product.name}</h4>
                      <p className="text-xs text-gray-500 mt-0.5">Tồn: <b>{Number(product.stock).toLocaleString()} {product.stockUnit}</b></p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-sm text-gray-900">{Number(product.price).toLocaleString()}đ</p>
                      <p className="text-[10px] text-gray-400 uppercase">{product.priceUnit}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-5 pt-4 border-t border-gray-100">
              <button
                onClick={onOpenDataManager}
                className="w-full py-3 bg-[#1a2332] hover:bg-black text-white rounded-xl font-bold text-sm transition-colors shadow-lg flex items-center justify-center gap-2"
              >
                <FaCog /> Quản lý hàng hóa & sản lượng
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardModal;
