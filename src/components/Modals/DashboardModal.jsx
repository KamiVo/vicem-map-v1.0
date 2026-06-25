import React, { useState } from 'react';
import { FaTimes, FaSync, FaMapMarkerAlt, FaPhoneAlt, FaBoxOpen, FaSpinner, FaCog, FaEdit } from 'react-icons/fa';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useDealerSalesYears, useDealerSales, useDealerProducts } from '../../hooks/useDealer';
import CustomSelect from '../UI/CustomSelect';

const CURRENT_YEAR = new Date().getFullYear();

const DashboardModal = ({ dealer, onClose, onOpenDataManager, onEditDealer, isAdmin }) => {
  const [selectedYear, setSelectedYear] = useState(CURRENT_YEAR);
  const { data: availableYears = [CURRENT_YEAR] } = useDealerSalesYears(dealer?.id);
  
  // Ensure selectedYear is valid when availableYears changes
  if (availableYears.length > 0 && !availableYears.includes(selectedYear) && selectedYear !== CURRENT_YEAR) {
    setSelectedYear(availableYears[0]);
  }

  const { data: salesData, isLoading: salesLoading } = useDealerSales(dealer?.id, selectedYear);
  const { data: products = [], isLoading: productsLoading } = useDealerProducts(dealer?.id);

  if (!dealer) return null;

  // Build recharts-compatible data from months array
  const chartData = (salesData?.months || Array(12).fill(0)).map((val, idx) => ({
    month: idx + 1,
    value: val,
    name: `T${idx + 1}`,
  }));

  const total = salesData?.total ?? 0;

  return (
    <div className="fixed inset-0 z-[3000] bg-gray-900/40 backdrop-blur-md flex items-center justify-center p-4 md:p-8 animate-slide-up">
      <div className="bg-white/85 backdrop-blur-2xl w-full h-full max-w-7xl rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-white/50 overflow-hidden flex flex-col relative">

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900/90 via-blue-800/90 to-cyan-800/90 backdrop-blur-md border-b border-white/20 p-5 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-blue-400 to-cyan-300 text-blue-900 p-2.5 rounded-xl shadow-inner">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M4 10h3v7H4zM10.5 10h3v7h-3zM2 19h20v3H2zM17 10h3v7h-3zM12 1L2 6v2h20V6z"/></svg>
            </div>
            <div>
              <h1 className="text-xl font-black text-white tracking-wide">HỆ THỐNG ĐIỀU HÀNH VLXD</h1>
              <p className="text-xs text-blue-200 font-medium uppercase tracking-widest mt-0.5">Hồ sơ Cửa hàng v3.0</p>
            </div>
          </div>
          {isAdmin && (
            <div className="flex gap-2 w-full md:w-auto mt-4 md:mt-0">
              <button 
                onClick={() => onEditDealer(dealer)}
                className="flex-1 md:flex-none flex justify-center items-center gap-2 bg-white/50 hover:bg-blue-50 text-blue-700 px-4 py-2 rounded-xl text-sm font-bold border border-blue-200 shadow-sm transition-all whitespace-nowrap"
              >
                <FaEdit />
                Chỉnh sửa
              </button>
              <button 
                onClick={onOpenDataManager}
                className="flex-1 md:flex-none flex justify-center items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all whitespace-nowrap"
              >
                <FaCog className="animate-spin-slow" />
                Quản lý dữ liệu
              </button>
            </div>
          )}
          <div className="flex items-center gap-3">
            <div className="bg-black/30 px-4 py-2 rounded-xl text-xs text-cyan-400 font-bold flex items-center gap-2 border border-cyan-500/30">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span> TRỰC TUYẾN
            </div>
            <button onClick={onClose} className="bg-white/10 hover:bg-red-500 hover:text-white text-blue-100 p-2.5 rounded-full transition-all ml-2">
              <FaTimes size={16} />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-8 flex flex-col lg:flex-row gap-8 custom-scrollbar">

          {/* Left Column */}
          <div className="flex-1 flex flex-col gap-6">

            {/* Info Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Main Info */}
              <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-6 shadow-sm border border-white/60 hover:shadow-md transition-shadow">
                <div className="inline-block bg-blue-100/80 text-blue-800 px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider mb-4 border border-blue-200">ĐẠI LÝ CẤP 1</div>
                <h2 className="text-2xl lg:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-900 to-cyan-700 mb-5 uppercase">{dealer.name}</h2>
                <div className="space-y-3 text-sm text-gray-700 font-medium">
                  <p className="flex items-start gap-3">
                    <FaMapMarkerAlt className="mt-1 text-blue-500 shrink-0 text-lg" />
                    <span className="leading-relaxed">{dealer.address}{dealer.ward ? `, Phường ${dealer.ward}` : ''}, Đà Nẵng</span>
                  </p>
                  <p className="flex items-center gap-3">
                    <FaPhoneAlt className="text-blue-500 shrink-0 text-lg" />
                    <span className="font-bold">{dealer.phone || 'Chưa cập nhật'}</span>
                  </p>
                </div>
              </div>

              {/* Legal Info */}
              <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-6 shadow-sm border border-white/60 hover:shadow-md transition-shadow">
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
                <div className="mt-4 pt-4 border-t border-gray-50 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Tình trạng đất:</span>
                    <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-sm font-bold border border-blue-100">
                      {dealer.landStatus || 'Đang thuê'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Nguồn vốn:</span>
                    <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-lg text-sm font-bold border border-purple-100">
                      {dealer.fundingSource || 'Chưa cập nhật'}
                    </span>
                  </div>
                </div>
                {dealer.ownerHistory && dealer.ownerHistory.length > 0 && (
                  <div className="mt-3 p-3 bg-yellow-50 text-yellow-800 border border-yellow-200 rounded-lg text-xs max-h-28 overflow-y-auto">
                    <span className="font-bold block mb-1">Lịch sử đổi chủ:</span>
                    <ul className="list-disc list-inside space-y-1 ml-1 text-xs md:text-sm">
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
            <div className="bg-white/60 backdrop-blur-xl rounded-2xl shadow-sm border border-white/60 p-6 flex-1 flex flex-col hover:shadow-md transition-shadow">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="font-black text-gray-800 flex items-center gap-3 text-lg uppercase tracking-wide">
                    <div className="p-2 bg-blue-100 text-blue-600 rounded-lg shadow-inner"><FaBoxOpen size={18} /></div>
                    Sản lượng kinh doanh
                  </h3>
                  <p className="text-xs font-bold text-gray-500 mt-2 uppercase tracking-wider">Lũy kế từng tháng & Tổng năm</p>
                </div>
                <div className="flex items-center gap-2 w-32">
                  <CustomSelect
                    value={selectedYear}
                    onChange={e => setSelectedYear(Number(e.target.value))}
                    triggerClassName="px-3 py-1.5 text-sm font-bold bg-white"
                    options={availableYears.map(y => ({ label: y, value: y }))}
                  />
                </div>
              </div>

              {salesLoading ? (
                <div className="flex-1 flex items-center justify-center text-gray-400">
                  <FaSpinner className="animate-spin mr-2" /> Đang tải dữ liệu...
                </div>
              ) : (
                <>
                  {/* Total Banner */}
                  <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl p-6 text-white flex justify-between items-center mb-6 shadow-[0_10px_30px_rgba(6,182,212,0.3)]">
                    <div>
                      <p className="text-blue-100 text-xs font-black uppercase tracking-widest mb-2 opacity-90">Tổng sản lượng năm {selectedYear}</p>
                      <p className="text-5xl font-black drop-shadow-md">{total.toLocaleString()} <span className="text-2xl font-bold opacity-80">Tấn</span></p>
                    </div>
                    <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-sm border border-white/30 shadow-inner">
                      <FaBoxOpen className="text-4xl" />
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
          <div className="w-full lg:w-[400px] flex flex-col bg-white/60 backdrop-blur-xl rounded-2xl shadow-sm border border-white/60 p-6 shrink-0 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-center mb-6 pb-5 border-b border-gray-200/50">
              <div>
                <h3 className="font-black text-gray-800 flex items-center gap-3 text-lg uppercase tracking-wide">
                  <div className="p-2 bg-blue-100 text-blue-600 rounded-lg shadow-inner"><FaBoxOpen size={18} /></div>
                  Hàng hóa
                </h3>
                <p className="text-xs font-bold text-gray-500 mt-2 uppercase tracking-wider">Danh mục sản phẩm</p>
              </div>
              <div className="bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full text-xs font-black border border-blue-200 shadow-inner">
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
              <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                {products.map(product => (
                  <div key={product.id} className="flex items-center gap-4 p-4 rounded-xl bg-white/50 border border-white/60 hover:bg-white hover:shadow-md transition-all group">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform border border-blue-100">
                      <FaBoxOpen className="text-blue-500 text-xl" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm text-gray-900 truncate" title={product.name}>{product.name}</h4>
                      <p className="text-xs text-gray-500 mt-1">Tồn: <b className="text-blue-700">{Number(product.stock).toLocaleString()}</b> {product.stockUnit}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-black text-sm text-gray-900">{Number(product.price).toLocaleString()}đ</p>
                      <p className="text-xs font-bold text-gray-400 uppercase mt-0.5 tracking-wider">{product.priceUnit}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardModal;
