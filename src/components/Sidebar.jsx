import React, { useState, useRef } from 'react';
import { batchAddDealersToDB } from '../services/firebase';
import { importFromExcel, exportToExcel } from '../utils/excelHandler';
import danangAdmin from '../assets/danang_admin.json';
import { FaFileExcel, FaFileImport, FaMapMarkedAlt, FaArrowLeft, FaStore, FaMapMarkerAlt, FaPhoneAlt, FaMap, FaTimes, FaSpinner } from 'react-icons/fa';
import SearchBar from './SearchBar';

const districtsList = Object.keys(danangAdmin);

const Sidebar = ({ filters, setFilters, showGeoJSON, setShowGeoJSON, dealers, onDataImported, onOpenAddModal, selectedLocation, onSelectLocation, onClearSelection, onEditDealer, onDeleteDealer, isMobileSidebarOpen, setIsMobileSidebarOpen }) => {
  const fileInputRef = useRef(null);
  const [importProgress, setImportProgress] = useState(null);

  const handleImportExcel = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImportProgress("Đang khởi tạo nhập liệu...");
    try {
      const data = await importFromExcel(file, (msg) => {
         setImportProgress(msg);
      });
      setImportProgress("Đang đẩy dữ liệu lên hệ thống...");
      await batchAddDealersToDB(data);
      alert("Nhập dữ liệu Excel lên hệ thống thành công!");
      onDataImported();
    } catch (error) {
      console.error("Lỗi nhập Excel:", error);
      alert("Có lỗi xảy ra khi nhập file Excel.");
    } finally {
      setImportProgress(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };


  const renderLocationDetails = () => {
    if (selectedLocation.type === 'dealer') {
      const dealer = selectedLocation;
      return (
        <div className="flex-1 overflow-y-auto flex flex-col bg-gray-50">
          <div className="h-48 w-full bg-blue-100 relative">
            <img src="https://images.unsplash.com/photo-1541888086225-ee5b99119ff3?auto=format&fit=crop&q=80&w=800" alt="Cửa hàng" className="w-full h-full object-cover opacity-90" />
            <div className={`absolute bottom-4 left-4 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider text-white shadow-md ${dealer.status === 'Đã bán' ? 'bg-emerald-500' : 'bg-rose-500'}`}>
              {dealer.status}
            </div>
          </div>

          <div className="p-6 bg-white shrink-0">
            <h2 className="text-2xl font-black text-gray-900 mb-2 leading-tight">{dealer.name}</h2>
            <div className="space-y-4 mt-4">
              <div className="flex items-start gap-3 text-gray-700">
                <FaMapMarkerAlt className="mt-1 text-blue-500 shrink-0" size={18} />
                <div>
                  <p className="font-medium text-sm leading-snug">{dealer.address}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{dealer.ward ? `${dealer.ward}, ` : ''}Quận {dealer.district}</p>
                </div>
              </div>

              {dealer.phone && (
                <div className="flex items-center gap-3 text-gray-700">
                  <FaPhoneAlt className="text-blue-500 shrink-0" size={16} />
                  <p className="font-bold text-sm">{dealer.phone}</p>
                </div>
              )}
            </div>
          </div>

          <div className="p-4 flex gap-3 bg-white mt-2 shrink-0 border-t border-gray-100">
            <button
              onClick={() => onEditDealer && onEditDealer(dealer)}
              className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 py-2.5 rounded-xl text-sm font-bold transition-colors shadow-sm"
            >
              Chỉnh Sửa
            </button>
            <button
              onClick={() => {
                if (onDeleteDealer) {
                  onDeleteDealer(dealer.id);
                  onClearSelection();
                }
              }}
              className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 py-2.5 rounded-xl text-sm font-bold transition-colors shadow-sm"
            >
              Xóa Đại Lý
            </button>
          </div>
        </div>
      );
    }

    // Location (Nominatim)
    const loc = selectedLocation;
    const road = loc.details?.road || loc.name;
    const suburb = loc.details?.suburb || loc.details?.neighbourhood || loc.details?.city_district || "";
    const city = loc.details?.city || loc.details?.state || "Đà Nẵng";
    const houseNumber = loc.details?.house_number ? `${loc.details.house_number}, ` : "";

    return (
      <div className="flex-1 overflow-y-auto flex flex-col bg-gray-50">
        <div className="h-48 w-full bg-gray-200 relative flex items-center justify-center">
          <FaMap className="text-gray-400 opacity-50" size={64} />
        </div>

        <div className="p-6 bg-white shrink-0 shadow-sm z-10">
          <h2 className="text-2xl font-black text-gray-900 mb-1 leading-tight">{loc.name}</h2>

          <div className="space-y-4 mt-6">
            <div className="flex items-start gap-3 text-gray-700">
              <FaMapMarkerAlt className="mt-1 text-gray-400 shrink-0" size={18} />
              <div>
                <p className="font-medium text-sm leading-snug">{houseNumber}{road}</p>
                <p className="text-xs text-gray-500 mt-1">{suburb ? `${suburb}, ` : ''}{city}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-white mt-2 shrink-0 border-t border-gray-100">
          <button
            onClick={() => onOpenAddModal({ lat: loc.lat, lng: loc.lng })}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl text-sm font-bold transition-colors shadow-md shadow-blue-500/30 flex items-center justify-center gap-2"
          >
            <FaStore />
            Thêm đại lý tại đây
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className={`absolute top-0 left-0 h-full w-[85%] sm:w-[350px] md:w-[420px] bg-white shadow-2xl z-[2000] flex flex-col transition-transform duration-300 ease-in-out ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 border-r border-gray-200`}>

      {/* Top Search Area */}
      <div className="p-4 bg-white border-b border-gray-100 shrink-0 z-20 flex items-center gap-2">
        {selectedLocation ? (
          <button
            onClick={onClearSelection}
            className="p-2.5 bg-gray-50 hover:bg-gray-100 rounded-full text-gray-600 transition-colors shrink-0"
          >
            <FaArrowLeft />
          </button>
        ) : (
          <button
            onClick={() => setIsMobileSidebarOpen(false)}
            className="md:hidden p-2.5 bg-gray-50 hover:bg-gray-100 rounded-full text-gray-600 transition-colors shrink-0"
          >
            <FaTimes />
          </button>
        )}
        <div className="flex-1">
          <SearchBar dealers={dealers} onSelectLocation={onSelectLocation} />
        </div>
      </div>

      {selectedLocation ? renderLocationDetails() : (
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-6 bg-gray-50">

          <div className="text-center pb-4 border-b border-gray-200/60">
            <h1 className="text-2xl font-black text-blue-900 tracking-tight flex items-center justify-center gap-2">
              <FaStore className="text-blue-600" /> VICEM ĐÀ NẴNG
            </h1>
            <p className="text-xs text-gray-500 font-medium mt-1">Hệ thống GIS quản lý phân phối</p>
          </div>

          {/* Lọc theo Quận & Phường */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 space-y-4">
            <h3 className="text-sm font-bold text-gray-800">Bộ lọc Hiển thị</h3>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase">Quận/Huyện</label>
                <select
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm font-medium text-gray-800"
                  value={filters.district}
                  onChange={(e) => setFilters({ ...filters, district: e.target.value, ward: '' })}
                >
                  <option value="">Tất cả Quận/Huyện</option>
                  {districtsList.map(dist => <option key={dist} value={dist}>{dist}</option>)}
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase">Phường/Xã</label>
                <select
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm font-medium text-gray-800 disabled:opacity-50"
                  value={filters.ward}
                  onChange={(e) => setFilters({ ...filters, ward: e.target.value })}
                  disabled={!filters.district}
                >
                  <option value="">Tất cả Phường/Xã</option>
                  {filters.district && danangAdmin[filters.district]?.map(w => <option key={w} value={w}>{w}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase">Tình trạng bán hàng</label>
              <div className="flex bg-gray-100 p-1 rounded-lg">
                {['Tất cả', 'Đã bán', 'Chưa bán'].map(status => (
                  <button
                    key={status}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all duration-300 ${filters.status === status ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    onClick={() => setFilters({ ...filters, status })}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Toggle GeoJSON */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-gray-800 flex items-center gap-2">
                <FaMapMarkedAlt className="text-blue-500 text-lg" /> Hiện ranh giới phường
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={showGeoJSON}
                  onChange={() => setShowGeoJSON(!showGeoJSON)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>


          {/* Cụm Nút Excel & Thêm thủ công */}
          <div className="mt-auto space-y-2 pt-4 border-t border-gray-200">
            {importProgress && (
              <div className="bg-blue-50 text-blue-700 p-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 animate-pulse border border-blue-200">
                <FaSpinner className="animate-spin" /> {importProgress}
              </div>
            )}
            <input
              type="file"
              accept=".xlsx, .xls"
              ref={fileInputRef}
              className="hidden"
              onChange={handleImportExcel}
            />
            <button
              onClick={onOpenAddModal}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl text-sm font-bold transition-all shadow-md shadow-blue-500/30"
            >
              <FaStore /> Thêm đại lý thủ công
            </button>
            <div className="flex gap-2">
              <button
                onClick={() => fileInputRef.current.click()}
                className="flex-1 flex items-center justify-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 py-2.5 rounded-xl text-sm font-bold transition-all"
              >
                <FaFileImport /> Nhập Excel
              </button>
              <button
                onClick={() => exportToExcel(dealers, "DanhSachDaiLy_Vicem.xlsx")}
                className="flex-1 flex items-center justify-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 py-2.5 rounded-xl text-sm font-bold transition-all"
              >
                <FaFileExcel /> Xuất Excel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
