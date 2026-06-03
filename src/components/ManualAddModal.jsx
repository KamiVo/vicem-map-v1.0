import React, { useState, useEffect } from 'react';
import { addDealerToDB, updateDealerInDB } from '../services/firebase';
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
    status: 'Đã bán'
  };

  const [formData, setFormData] = useState(defaultState);
  const [isLoading, setIsLoading] = useState(false);

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
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Tự động tìm tọa độ dựa trên địa chỉ
      const coords = await geocodeAddress(formData.address, formData.ward, formData.district);
      
      const dealer = {
        ...formData,
        lat: coords.lat,
        lng: coords.lng
      };

      if (editData && editData.id) {
        // Mode: Edit
        await updateDealerInDB(editData.id, dealer);
        alert("Cập nhật đại lý thành công!");
      } else {
        // Mode: Add
        await addDealerToDB(dealer);
        alert("Thêm đại lý thành công!");
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

            <div className="col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-1">Địa chỉ chi tiết (số nhà, đường) *</label>
              <input required type="text" name="address" value={formData.address} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="VD: 12 Nguyễn Văn Linh" />
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
