import React, { useState, useEffect } from 'react';
import danangAdmin from '../../assets/danang_admin.json';
import { FaMapMarkedAlt, FaArrowLeft, FaStore, FaMapMarkerAlt, FaPhoneAlt, FaMap, FaTimes, FaLock, FaUnlock, FaExpand, FaCompress } from 'react-icons/fa';
import SearchBar from './SearchBar';
import CustomSelect from '../UI/CustomSelect';
import { useAuth } from '../../context/AuthContext';

const districtsList = Object.keys(danangAdmin);

const Sidebar = ({ filters, setFilters, showGeoJSON, setShowGeoJSON, dealers, onOpenAddModal, selectedLocation, onSelectLocation, onClearSelection, onEditDealer, onDeleteDealer, isSidebarOpen, setIsSidebarOpen, isAdmin, onOpenLogin }) => {
  const { logout } = useAuth();
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      if (document.exitFullscreen) document.exitFullscreen();
    }
  };
  const renderLocationDetails = () => {
    // If the location is a dealer, we don't need to show it in the sidebar
    // because the Map popup and Dashboard handle dealer details.
    if (selectedLocation.type === 'dealer') {
      return null;
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

        {isAdmin && (
          <div className="p-4 bg-white mt-2 shrink-0 border-t border-gray-100">
            <button
              onClick={() => onOpenAddModal(
                { lat: loc.lat, lng: loc.lng }, 
                { address: loc.name, fullAddress: loc.address }
              )}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl text-sm font-bold transition-colors shadow-md shadow-blue-500/30 flex items-center justify-center gap-2"
            >
              <FaStore />
              Thêm đại lý tại đây
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`pointer-events-auto fixed md:relative top-0 left-0 h-full md:h-[calc(100vh-2rem)] md:my-4 md:ml-4 w-[85%] sm:w-[350px] md:w-[400px] bg-white/85 dark:bg-slate-900/85 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.1)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)] border border-white/50 dark:border-slate-700/50 z-[2000] flex flex-col transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${isSidebarOpen ? 'translate-x-0 md:translate-x-0 md:ml-4' : '-translate-x-full md:-translate-x-full md:-ml-[420px]'} rounded-r-2xl md:rounded-3xl overflow-hidden shrink-0`}>

      {/* Top Search Area */}
      <div className="p-5 bg-white/40 dark:bg-slate-800/40 backdrop-blur-md border-b border-white/30 dark:border-slate-700/50 shrink-0 z-20 flex items-center gap-3">
        {selectedLocation ? (
          <button
            onClick={onClearSelection}
            className="p-2.5 bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full text-gray-600 dark:text-gray-300 transition-colors shrink-0"
          >
            <FaArrowLeft />
          </button>
        ) : (
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="p-2.5 bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full text-gray-600 dark:text-gray-300 transition-colors shrink-0"
          >
            <FaTimes />
          </button>
        )}
        <div className="flex-1">
          <SearchBar dealers={dealers} onSelectLocation={onSelectLocation} />
        </div>

        <button 
          onClick={toggleFullscreen}
          className="p-2.5 bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full text-gray-600 dark:text-gray-300 transition-colors shrink-0"
          title={isFullscreen ? "Thu nhỏ" : "Toàn màn hình"}
        >
          {isFullscreen ? <FaCompress /> : <FaExpand />}
        </button>
        <button 
          onClick={isAdmin ? logout : onOpenLogin} 
          className={`p-2.5 rounded-full transition-colors shrink-0 ${isAdmin ? 'bg-red-50 text-red-500 hover:bg-red-100 dark:bg-red-900/30 dark:hover:bg-red-900/50' : 'bg-gray-50 dark:bg-slate-800 text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-blue-500 dark:hover:text-cyan-400'}`} 
          title={isAdmin ? "Đăng xuất Quản trị" : "Đăng nhập Quản trị"}
        >
          {isAdmin ? <FaUnlock /> : <FaLock />}
        </button>
      </div>

      {selectedLocation && selectedLocation.type !== 'dealer' ? renderLocationDetails() : (
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 bg-transparent">

          <div className="text-center pb-5 border-b border-gray-300/30">
            <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-cyan-500 tracking-tight flex items-center justify-center gap-2 drop-shadow-sm">
              <FaStore className="text-blue-600" /> VICEM ĐÀ NẴNG
            </h1>
            <p className="text-xs text-gray-500 font-semibold mt-1 uppercase tracking-widest">Hệ thống Điều hành GIS</p>
          </div>

          {/* Lọc theo Quận & Phường */}
          <div className="bg-white/60 backdrop-blur-xl p-5 rounded-2xl shadow-sm border border-white/60 space-y-5 hover:shadow-md transition-shadow">
            <h3 className="text-sm font-black text-gray-800 flex items-center gap-2"><span className="w-1.5 h-4 bg-blue-500 rounded-full inline-block"></span> Bộ lọc Hiển thị</h3>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-xs md:text-sm font-bold text-gray-500 mb-1 uppercase">Quận/Huyện</label>
                <CustomSelect
                  value={filters.district}
                  onChange={(e) => setFilters({ ...filters, district: e.target.value, ward: '' })}
                  triggerClassName="px-4 py-2.5 text-sm"
                  placeholder="Tất cả Quận/Huyện"
                  options={[
                    { label: 'Tất cả Quận/Huyện', value: '' },
                    ...districtsList.map(dist => ({ label: dist, value: dist }))
                  ]}
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs md:text-sm font-bold text-blue-900/60 mb-1.5 uppercase tracking-wide">Phường/Xã</label>
                <CustomSelect
                  value={filters.ward}
                  onChange={(e) => setFilters({ ...filters, ward: e.target.value })}
                  disabled={!filters.district}
                  triggerClassName="px-4 py-2.5 text-sm"
                  placeholder="Tất cả Phường/Xã"
                  options={[
                    { label: 'Tất cả Phường/Xã', value: '' },
                    ...(filters.district && danangAdmin[filters.district] ? danangAdmin[filters.district].map(w => ({ label: w, value: w })) : [])
                  ]}
                />
              </div>
            </div>

            <div className="pt-2">
              <label className="block text-xs md:text-sm font-bold text-blue-900/60 mb-2 uppercase tracking-wide">Tình trạng bán hàng</label>
              <div className="grid grid-cols-2 gap-1.5 bg-gray-200/50 p-1.5 rounded-xl shadow-inner">
                {['Tất cả', 'Đại lý tốt', 'Đại lý chưa bán', 'Đại lý rủi ro', 'Không chào bán'].map(status => (
                  <button
                    key={status}
                    className={`col-span-1 ${status === 'Tất cả' ? 'col-span-2' : ''} py-2 text-xs md:text-sm font-bold rounded-lg transition-all duration-300 ${filters.status === status ? 'bg-white shadow-md text-blue-600 scale-[1.02]' : 'text-gray-600 hover:bg-white/40'}`}
                    onClick={() => setFilters({ ...filters, status })}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Toggle GeoJSON */}
          <div className="bg-white/60 backdrop-blur-xl p-5 rounded-2xl shadow-sm border border-white/60 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-gray-800 flex items-center gap-3">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><FaMapMarkedAlt size={16} /></div> 
                Lưới ranh giới Phường
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


        </div>
      )}
    </div>
  );
};

export default Sidebar;
