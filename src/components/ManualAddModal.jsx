import React, { useState, useEffect, useRef } from 'react';
import { addDealerToDB, updateDealerInDB, deleteField } from '../services/firebase';
import danangAdmin from '../assets/danang_admin.json';
import { geocodeAddress } from '../utils/geocoding';

const districtsList = Object.keys(danangAdmin);

const ManualAddModal = ({ isOpen, onClose, onDataAdded, initialCoords, editData }) => {
  const defaultState = {
    name: '',
    address: '',
    district: 'Hải Châu',
    ward: danangAdmin['Hải Châu'][0],
    phone: '',
    status: 'Đã bán',
    owner: '',
    founder: '',
    establishedYear: '',
    landStatus: 'Đang thuê'
  };

  const [formData, setFormData] = useState(defaultState);
  const [isLoading, setIsLoading] = useState(false);
  
  // Autocomplete states
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [showAddressDropdown, setShowAddressDropdown] = useState(false);
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    // Only search if typing manually (not just selected) and length > 3
    if (!formData.address || formData.resolvedLat || formData.address.length < 3) {
      setAddressSuggestions([]);
      return;
    }

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(async () => {
      setIsSearchingAddress(true);
      try {
        const searchQuery = formData.address.toLowerCase().includes('đà nẵng') ? formData.address : formData.address + ' Đà Nẵng';
        const res = await fetch(`https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates?f=json&singleLine=${encodeURIComponent(searchQuery)}&outFields=Match_addr&maxLocations=5`);
        const apiData = await res.json();
        
        const uniqueMatches = [];
        const seen = new Set();
        if (apiData.candidates) {
          apiData.candidates.forEach(item => {
            const addressStr = item.address;
            if (!seen.has(addressStr) && addressStr.toLowerCase().includes('đà nẵng')) {
              seen.add(addressStr);
              uniqueMatches.push({
                name: addressStr.split(',')[0], // Extract just the street part
                address: addressStr,
                lat: item.location.y,
                lng: item.location.x
              });
            }
          });
        }
        setAddressSuggestions(uniqueMatches);
      } catch (err) {
        console.error("ArcGIS Search Error", err);
        setAddressSuggestions([]);
      }
      setIsSearchingAddress(false);
    }, 500);

    return () => clearTimeout(timeoutRef.current);
  }, [formData.address, formData.resolvedLat]);

  const handleSelectSuggestion = (suggestion) => {
    let newDistrict = formData.district;
    let newWard = formData.ward;
    
    // Attempt to parse District
    districtsList.forEach(dist => {
      if (suggestion.address.toLowerCase().includes(dist.toLowerCase())) {
        newDistrict = dist;
      }
    });

    // Attempt to parse Ward
    if (danangAdmin[newDistrict]) {
      let foundWard = false;
      danangAdmin[newDistrict].forEach(w => {
         if (suggestion.address.toLowerCase().includes(w.toLowerCase())) {
           newWard = w;
           foundWard = true;
         }
      });
      if (!foundWard) newWard = danangAdmin[newDistrict][0];
    }

    setFormData(prev => ({
      ...prev,
      address: suggestion.name,
      district: newDistrict,
      ward: newWard,
      resolvedLat: suggestion.lat,
      resolvedLng: suggestion.lng
    }));
    setShowAddressDropdown(false);
  };

  useEffect(() => {
    if (isOpen) {
      if (editData) {
        setFormData(editData);
      } else if (initialCoords) {
        setFormData({ ...defaultState, lat: initialCoords.lat, lng: initialCoords.lng });
      } else {
        setFormData(defaultState);
      }
    }
  }, [isOpen, initialCoords, editData]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'district') {
      setFormData(prev => ({ 
        ...prev, 
        district: value, 
        ward: danangAdmin[value][0] // Reset ward when district changes
      }));
    } else if (name === 'address') {
      setFormData(prev => ({ ...prev, address: value, resolvedLat: null, resolvedLng: null }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      let lat = formData.resolvedLat;
      let lng = formData.resolvedLng;

      // Nếu không chọn từ gợi ý, mới phải gọi Geocoding Fallback
      if (!lat || !lng) {
        const coords = await geocodeAddress(formData.address, formData.ward, formData.district);
        lat = coords.lat;
        lng = coords.lng;
      }
      
      let ownerHistory = editData?.ownerHistory || [];
      // Hỗ trợ tương thích ngược với dữ liệu cũ (khi oldOwner là chuỗi)
      if (editData?.oldOwner && typeof editData.oldOwner === 'string' && ownerHistory.length === 0) {
        ownerHistory = [editData.oldOwner];
      }
      
      if (editData?.owner && editData.owner !== formData.owner) {
        // Có thể thêm timestamp sau này nếu cần: `${editData.owner} (Đến ${new Date().toLocaleDateString()})`
        const dateStr = new Date().toLocaleDateString('vi-VN');
        ownerHistory = [...ownerHistory, `${editData.owner} (Cập nhật ngày ${dateStr})`];
      }

      const dealerBase = {
        name: formData.name,
        address: formData.address,
        district: formData.district,
        ward: formData.ward,
        phone: formData.phone,
        status: formData.status,
        lat,
        lng,
        owner: formData.owner || '',
        founder: formData.founder || '',
        establishedYear: formData.establishedYear || '',
        landStatus: formData.landStatus || 'Đang thuê',
        ownerHistory: ownerHistory,
      };

      if (editData && editData.id) {
        // Mode: Edit - gửi thêm deleteField để xóa trường oldOwner cũ khỏi Firebase
        await updateDealerInDB(editData.id, { ...dealerBase, oldOwner: deleteField() });
        alert("Cập nhật đại lý thành công!");
      } else {
        // Mode: Add - không có trường rác nào cả
        await addDealerToDB(dealerBase);
        alert("Đã thêm đại lý thành công!");
      }
      
      onDataAdded(); // Yêu cầu map tải lại
      onClose(); // Đóng modal
    } catch (error) {
      console.error("Lỗi khi lưu đại lý:", error);
      alert("Có lỗi xảy ra, vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="bg-blue-600 px-6 py-4 shrink-0">
          <h2 className="text-xl font-bold text-white">
            {editData ? 'Chỉnh sửa Đại lý' : 'Thêm Đại lý Thủ công'}
          </h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4 overflow-y-auto">
          
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-1">Tên đại lý *</label>
              <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="VD: Vật liệu xây dựng Hùng Cường" />
            </div>

            <div className="col-span-2 sm:col-span-1">
              <label className="block text-sm font-bold text-gray-700 mb-1">Số điện thoại (tùy chọn)</label>
              <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="VD: 0901234567" />
            </div>

            <div className="col-span-2 sm:col-span-1">
              <label className="block text-sm font-bold text-gray-700 mb-1">Trạng thái *</label>
              <select name="status" value={formData.status} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                <option value="Đã bán">Đã bán</option>
                <option value="Chưa bán">Chưa bán</option>
              </select>
            </div>

            {/* CHỨC NĂNG THÊM VÀ HIỂN THỊ LỊCH SỬ CÁC CHỦ SỞ HỮU Thắng */}
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-sm font-bold text-gray-700 mb-1">Chủ hiện tại</label>
              <input type="text" name="owner" value={formData.owner || ''} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="VD: Trần Thị B" />
            </div>

            <div className="col-span-2 sm:col-span-1">
              <label className="block text-sm font-bold text-gray-700 mb-1">Người sáng lập</label>
              <input type="text" name="founder" value={formData.founder || ''} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="VD: Nguyễn Văn A" />
            </div>

            <div className="col-span-2 sm:col-span-1">
              <label className="block text-sm font-bold text-gray-700 mb-1">Năm thành lập</label>
              <input type="number" name="establishedYear" value={formData.establishedYear || ''} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="VD: 2016" />
            </div>

            <div className="col-span-2 sm:col-span-1">
              <label className="block text-sm font-bold text-gray-700 mb-1">Tình trạng đất</label>
              <select name="landStatus" value={formData.landStatus || 'Đang thuê'} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                <option value="Đang thuê">Đang thuê</option>
                <option value="Mua trực tiếp">Mua trực tiếp</option>
              </select>
            </div>

            {/* //////////////////////////////////////////////////////////////////////////////// */}
            <div className="col-span-2 relative">
              <label className="block text-sm font-bold text-gray-700 mb-1">Địa chỉ chi tiết (số nhà, đường) *</label>
              <input 
                required 
                type="text" 
                name="address" 
                value={formData.address} 
                onChange={handleChange} 
                onFocus={() => setShowAddressDropdown(true)}
                onBlur={() => setTimeout(() => setShowAddressDropdown(false), 200)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                placeholder="VD: 12 Nguyễn Văn Linh" 
                autoComplete="off"
              />
              
              {showAddressDropdown && (isSearchingAddress || addressSuggestions.length > 0) && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-xl max-h-60 overflow-y-auto z-[2500]">
                  {isSearchingAddress && <div className="p-3 text-sm text-gray-500 text-center">Đang tìm địa chỉ...</div>}
                  {!isSearchingAddress && addressSuggestions.map((sug, i) => (
                    <div 
                      key={i} 
                      onClick={() => handleSelectSuggestion(sug)}
                      className="p-3 hover:bg-blue-50 cursor-pointer border-b last:border-b-0"
                    >
                      <div className="font-bold text-sm text-gray-800">{sug.name}</div>
                      <div className="text-xs text-gray-500 truncate">{sug.address}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Quận/Huyện *</label>
              <select name="district" value={formData.district} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                {districtsList.map(dist => (
                  <option key={dist} value={dist}>{dist}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Phường/Xã *</label>
              <select name="ward" value={formData.ward} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                {danangAdmin[formData.district]?.map(w => (
                  <option key={w} value={w}>{w}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-2 pt-4 border-t shrink-0">
            <button type="button" onClick={onClose} className="px-5 py-2 text-gray-600 font-bold bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
              Hủy
            </button>
            <button type="submit" disabled={isLoading} className="px-5 py-2 text-white font-bold bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50">
              {isLoading ? 'Đang lưu...' : (editData ? 'Cập nhật' : 'Thêm mới')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ManualAddModal;
