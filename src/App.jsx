import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { FaBars } from 'react-icons/fa';
import Sidebar from './components/Sidebar/Sidebar';
import MapViewer from './components/Map/MapViewer';
import ManualAddModal from './components/Modals/ManualAddModal';
import { fetchDealersFromDB, subscribeToDealers, deleteDealerFromDB, auth } from './services/firebase';
import DashboardModal from './components/Modals/DashboardModal';
import DataManagementModal from './components/Modals/DataManagementModal';
import LoginModal from './components/Modals/LoginModal';
import { useAuth } from './context/AuthContext';
import { errorAlert } from './utils/alerts';

const App = () => {
  const { isAdmin } = useAuth();
  
  // Master state
  const [dealers, setDealers] = useState([]);
  
  // UI State
  const [showGeoJSON, setShowGeoJSON] = useState(true);
  const [filters, setFilters] = useState({
    ward: '',
    status: 'Tất cả'
  });

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalCoords, setModalCoords] = useState(null);
  const [modalEditData, setModalEditData] = useState(null);
  const [dashboardDealer, setDashboardDealer] = useState(null);
  const [dataManagerDealer, setDataManagerDealer] = useState(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Selected Location State (Dealer or Nominatim Place)
  const [selectedLocation, setSelectedLocation] = useState(null);

  // Responsive State
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleSelectLocation = (loc) => {
    setSelectedLocation(loc);
    setIsSidebarOpen(true); // Mở Sidebar khi click marker
  };

  const loadData = useCallback(async () => {
    // Giữ lại hàm rỗng để các Component khác gọi loadData không bị crash
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToDealers(
      (data) => {
        setDealers(data);
      },
      (error) => {
        errorAlert("Lỗi Kết Nối", "Không thể lắng nghe dữ liệu Firebase. Vui lòng kiểm tra cấu hình.");
        setDealers([]);
      }
    );
    // Cleanup listener when unmounting
    return () => unsubscribe();
  }, []);

  // Tối ưu hóa thuật toán lọc bằng O(N) single-pass với useMemo thay vì useEffect gây double-render
  const filteredDealers = useMemo(() => {
    return dealers.filter(d => {

      if (filters.ward && d.ward && !d.ward.toLowerCase().includes(filters.ward.toLowerCase())) return false;
      if (filters.status !== 'Tất cả' && d.status !== filters.status) return false;
      return true;
    });
  }, [dealers, filters]);

  const openAddModal = useCallback((coords = null, locData = null) => {
    setModalEditData(null);
    setModalCoords({ ...coords, ...locData });
    setIsModalOpen(true);
  }, []);

  const openEditModal = useCallback((dealer) => {
    setModalEditData(dealer);
    setModalCoords(null);
    setIsModalOpen(true);
  }, []);

  const handleDeleteDealer = useCallback(async (id) => {
    const isConfirmed = await confirmAlert("Xóa đại lý", "Bạn có chắc chắn muốn xóa đại lý này không? Hành động này sẽ được ghi vào nhật ký hệ thống.");
    if (isConfirmed) {
      try {
        const { currentUser } = auth ? { currentUser: auth.currentUser } : { currentUser: null };
        await deleteDealerFromDB(id, currentUser);
        loadData();
        successAlert("Đã xóa!", "Đại lý đã được xóa thành công.");
        return true;
      } catch (error) {
        console.error("Lỗi xóa đại lý:", error);
        errorAlert("Lỗi Xóa", "Có lỗi xảy ra khi xóa đại lý.");
        return false;
      }
    }
    return false;
  }, [loadData]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-gray-100 font-sans">
      
      {/* Nút Hamburger hiện góc trên trái màn hình khi Sidebar đóng */}
      <button 
        onClick={() => setIsSidebarOpen(true)}
        className={`absolute top-4 left-4 z-[1500] bg-white p-3 rounded-full shadow-lg border border-gray-200 text-blue-600 hover:bg-gray-50 transition-all ${isSidebarOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
      >
        <FaBars size={20} />
      </button>

      {/* Lớp nền đen mờ khi mở Sidebar trên Mobile */}
      <div 
        className={`md:hidden fixed inset-0 bg-black/40 z-[1900] transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
        onClick={() => setIsSidebarOpen(false)}
      />

      {/* Sidebar overlays the map */}
      <div className="absolute top-0 left-0 h-full z-[2000] pointer-events-none flex">
        <Sidebar 
          filters={filters}
          setFilters={setFilters}
          showGeoJSON={showGeoJSON}
          setShowGeoJSON={setShowGeoJSON}
          dealers={filteredDealers} 
          onDataImported={loadData}
          onOpenAddModal={openAddModal}
          selectedLocation={selectedLocation}
          onSelectLocation={handleSelectLocation}
          onClearSelection={() => setSelectedLocation(null)}
          onEditDealer={openEditModal}
          onDeleteDealer={handleDeleteDealer}
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          isAdmin={isAdmin}
          onOpenLogin={() => setIsLoginModalOpen(true)}
        />
      </div>
      
      {/* Map is absolutely positioned to take the whole screen */}
      <div className="absolute inset-0 z-0">
        {/* Lời chào trên màn chiếu (HUD Glass Ribbon) */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-[1500] pointer-events-none w-full px-6 flex justify-center">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full blur-md opacity-30 group-hover:opacity-60 transition duration-500"></div>
            <h1 className="relative text-[10px] sm:text-xs md:text-base lg:text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-rose-400 uppercase tracking-[0.2em] bg-white/70 backdrop-blur-xl px-10 py-3 rounded-full border border-white/60 shadow-[0_8px_32px_rgba(225,29,72,0.15)] flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0"></span>
              <span className="truncate">NGHỆ GIANG XIN CHÀO VÀ TRAO CHO BẠN MỘT CƠ HỘI</span>
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0"></span>
            </h1>
          </div>
        </div>

        <MapViewer 
          dealers={filteredDealers} 
          showGeoJSON={showGeoJSON}
          filters={filters}
          onAddDealerByClick={openAddModal}
          onEditDealer={openEditModal}
          onDeleteDealer={handleDeleteDealer}
          selectedLocation={selectedLocation}
          onSelectLocation={handleSelectLocation}
          onOpenDashboard={(dealer) => setDashboardDealer(dealer)}
          isAdmin={isAdmin}
        />
      </div>

      <ManualAddModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onDataAdded={() => {
          loadData();
          setSelectedLocation(null);
        }}
        initialCoords={modalCoords}
        editData={modalEditData}
        onDeleteDealer={async (id) => {
          const success = await handleDeleteDealer(id);
          if (success) {
            setIsModalOpen(false);
            setSelectedLocation(null);
          }
        }}
      />
      
      {dashboardDealer && (
        <DashboardModal 
          dealer={dashboardDealer}
          onClose={() => setDashboardDealer(null)}
          onOpenDataManager={() => {
            setDataManagerDealer(dashboardDealer);
            setDashboardDealer(null);
          }}
          onEditDealer={(dealer) => {
            openEditModal(dealer);
            setDashboardDealer(null);
          }}
          isAdmin={isAdmin}
        />
      )}

      {dataManagerDealer && (
        <DataManagementModal
          dealer={dataManagerDealer}
          onClose={() => {
            setDashboardDealer(dataManagerDealer); // Quay lại Dashboard
            setDataManagerDealer(null);
          }}
        />
      )}

      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
      />
    </div>
  );
};

export default App;
