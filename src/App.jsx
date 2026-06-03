import React, { useState, useEffect } from 'react';
import { FaBars } from 'react-icons/fa';
import Sidebar from './components/Sidebar';
import MapViewer from './components/Map/MapViewer';
import ManualAddModal from './components/ManualAddModal';
import { fetchDealersFromDB, deleteDealerFromDB } from './services/firebase';

const App = () => {
  // Master state
  const [dealers, setDealers] = useState([]);
  const [filteredDealers, setFilteredDealers] = useState([]);
  
  // UI State
  const [showGeoJSON, setShowGeoJSON] = useState(false);
  const [filters, setFilters] = useState({
    district: '',
    ward: '',
    status: 'Tất cả'
  });

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalCoords, setModalCoords] = useState(null);
  const [modalEditData, setModalEditData] = useState(null);

  // Selected Location State (Dealer or Nominatim Place)
  const [selectedLocation, setSelectedLocation] = useState(null);

  // Mobile Responsive State
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const handleSelectLocation = (loc) => {
    setSelectedLocation(loc);
    setIsMobileSidebarOpen(true); // Tự động mở Sidebar trên mobile khi click marker
  };

  const loadData = async () => {
    try {
      const data = await fetchDealersFromDB();
      setDealers(data);
    } catch (error) {
      console.error("Lỗi tải Database Firebase:", error);
      alert("Không thể kết nối đến dữ liệu Firebase. Vui lòng kiểm tra kết nối mạng hoặc cấu hình máy chủ.");
      setDealers([]);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Observer lắng nghe Filter thay đổi (Marker Clutter logic)
  useEffect(() => {
    let result = dealers;

    if (filters.district) {
      result = result.filter(d => d.district === filters.district);
    }
    if (filters.ward) {
      result = result.filter(d => d.ward && d.ward.toLowerCase().includes(filters.ward.toLowerCase()));
    }
    if (filters.status !== 'Tất cả') {
      result = result.filter(d => d.status === filters.status);
    }

    setFilteredDealers(result);
  }, [dealers, filters]);

  const openAddModal = (coords = null) => {
    setModalEditData(null);
    setModalCoords(coords);
    setIsModalOpen(true);
  };

  const openEditModal = (dealer) => {
    setModalEditData(dealer);
    setModalCoords(null);
    setIsModalOpen(true);
  };

  const handleDeleteDealer = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa đại lý này không?")) {
      try {
        await deleteDealerFromDB(id);
        loadData();
      } catch (error) {
        console.error("Lỗi xóa đại lý:", error);
        alert("Có lỗi xảy ra khi xóa.");
      }
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-gray-100 font-sans flex">
      
      {/* Nút Hamburger nổi trên Map (chỉ hiện trên Mobile) */}
      <button 
        onClick={() => setIsMobileSidebarOpen(true)}
        className="md:hidden absolute top-4 left-4 z-[1500] bg-white p-3 rounded-full shadow-lg border border-gray-200 text-blue-600 hover:bg-gray-50 transition-all"
      >
        <FaBars size={20} />
      </button>

      {/* Lớp nền đen mờ khi mở Sidebar trên Mobile */}
      {isMobileSidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/40 z-[1900] transition-opacity"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      <Sidebar 
        filters={filters}
        setFilters={setFilters}
        showGeoJSON={showGeoJSON}
        setShowGeoJSON={setShowGeoJSON}
        dealers={filteredDealers} 
        onDataImported={loadData}
        onOpenAddModal={() => openAddModal()}
        selectedLocation={selectedLocation}
        onSelectLocation={handleSelectLocation}
        onClearSelection={() => setSelectedLocation(null)}
        onEditDealer={openEditModal}
        onDeleteDealer={handleDeleteDealer}
        isMobileSidebarOpen={isMobileSidebarOpen}
        setIsMobileSidebarOpen={setIsMobileSidebarOpen}
      />
      
      <div className="flex-1 relative h-full">
        <MapViewer 
          dealers={filteredDealers} 
          showGeoJSON={showGeoJSON}
          filters={filters}
          onAddDealerByClick={openAddModal}
          onEditDealer={openEditModal}
          onDeleteDealer={handleDeleteDealer}
          selectedLocation={selectedLocation}
          onSelectLocation={handleSelectLocation}
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
      />
    </div>
  );
};

export default App;
