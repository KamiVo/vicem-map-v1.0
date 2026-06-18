import React, { useState, useEffect, useRef } from 'react';
import { addDealerToDB, updateDealerInDB, deleteField } from '../../services/firebase';
import danangAdmin from '../../assets/danang_admin.json';
import { geocodeAddress } from '../../utils/geocoding';

const districtsList = Object.keys(danangAdmin);

const ManualAddModal = ({ isOpen, onClose, onDataAdded, initialCoords, editData, onDeleteDealer }) => {
  const defaultState = {
    name: '',
    address: '',
    district: 'Hải Châu',
    ward: danangAdmin['Hải Châu'][0],
    phone: '',
    status: 'Đại lý tốt',
    owner: '',
    founder: '',
    establishedYear: '',
    landStatus: 'Đang thuê'
  };

  const [formData, setFormData] = useState(defaultState);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (editData) {
        setFormData(editData);
      } else if (initialCoords) {
        setFormData({
          ...defaultState,
          lat: initialCoords.lat,
          lng: initialCoords.lng,
          address: initialCoords.address || '',
          district: defaultState.district,
          ward: defaultState.ward,
          resolvedLat: initialCoords.lat,
          resolvedLng: initialCoords.lng
        });
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

      const currentDateStr = new Date().toLocaleDateString('vi-VN');
      let currentOwnerStartDate = editData?.ownerStartDate || currentDateStr;

      if (editData?.owner && editData.owner !== formData.owner) {
        const startDateStr = editData.ownerStartDate || 'Không rõ';
        ownerHistory = [...ownerHistory, `${editData.owner}: ${startDateStr} - ${currentDateStr}`];
        currentOwnerStartDate = currentDateStr; // Cập nhật ngày bắt đầu cho chủ mới
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
        ownerStartDate: currentOwnerStartDate,
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
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-gray-900/40 backdrop-blur-md p-4 transition-opacity animate-slide-up">
      <div className="bg-white/85 backdrop-blur-2xl border border-white/50 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="bg-gradient-to-r from-blue-600/90 to-cyan-500/90 px-8 py-5 shrink-0 border-b border-white/20">
          <h2 className="text-xl md:text-2xl font-black text-white drop-shadow-md tracking-wide">
            {editData ? 'Chỉnh sửa Đại lý' : 'Thêm Đại lý Thủ công'}
          </h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 md:p-8 flex flex-col gap-5 overflow-y-auto custom-scrollbar">

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs md:text-sm font-black text-blue-900/60 mb-1.5 uppercase tracking-wide">Tên đại lý *</label>
              <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full px-4 py-3 bg-white/50 border border-white/60 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 shadow-inner transition-all font-semibold text-gray-800" placeholder="VD: Vật liệu xây dựng Hùng Cường" />
            </div>

            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs md:text-sm font-black text-blue-900/60 mb-1.5 uppercase tracking-wide">Số điện thoại (tùy chọn)</label>
              <input type="text" name="Phone" value={formData.phone} onChange={handleChange} className="w-full px-4 py-3 bg-white/50 border border-white/60 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 shadow-inner transition-all font-semibold text-gray-800" placeholder="VD: 0901234567" />
            </div>

            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs md:text-sm font-black text-blue-900/60 mb-1.5 uppercase tracking-wide">Trạng thái *</label>
              <select name="status" value={formData.status} onChange={handleChange} className="w-full px-4 py-3 bg-white/50 border border-white/60 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 shadow-inner transition-all font-semibold text-gray-800">
                <option value="Đại lý tốt">Đại lý tốt</option>
                <option value="Đại lý chưa bán">Đại lý chưa bán</option>
                <option value="Đại lý rủi ro">Đại lý rủi ro</option>
                <option value="Không chào bán">Không chào bán</option>
              </select>
            </div>

            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs md:text-sm font-black text-blue-900/60 mb-1.5 uppercase tracking-wide">Chủ hiện tại</label>
              <input type="text" name="owner" value={formData.owner || ''} onChange={handleChange} className="w-full px-4 py-3 bg-white/50 border border-white/60 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 shadow-inner transition-all font-semibold text-gray-800" placeholder="VD: Trần Thị B" />
            </div>

            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs md:text-sm font-black text-blue-900/60 mb-1.5 uppercase tracking-wide">Người sáng lập</label>
              <input type="text" name="founder" value={formData.founder || ''} onChange={handleChange} className="w-full px-4 py-3 bg-white/50 border border-white/60 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 shadow-inner transition-all font-semibold text-gray-800" placeholder="VD: Nguyễn Văn A" />
            </div>

            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs md:text-sm font-black text-blue-900/60 mb-1.5 uppercase tracking-wide">Năm thành lập</label>
              <input type="number" name="establishedYear" value={formData.establishedYear || ''} onChange={handleChange} className="w-full px-4 py-3 bg-white/50 border border-white/60 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 shadow-inner transition-all font-semibold text-gray-800" placeholder="VD: 2016" />
            </div>

            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs md:text-sm font-black text-blue-900/60 mb-1.5 uppercase tracking-wide">Tình trạng đất</label>
              <select name="landStatus" value={formData.landStatus || 'Đang thuê'} onChange={handleChange} className="w-full px-4 py-3 bg-white/50 border border-white/60 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 shadow-inner transition-all font-semibold text-gray-800">
                <option value="Đang thuê">Đang thuê</option>
                <option value="Mua trực tiếp">Mua trực tiếp</option>
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-xs md:text-sm font-black text-blue-900/60 mb-1.5 uppercase tracking-wide">Địa chỉ chi tiết (số nhà, đường) *</label>
              <input
                required
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/50 border border-white/60 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 shadow-inner transition-all font-semibold text-gray-800"
                placeholder="VD: 12 Nguyễn Văn Linh"
              />
            </div>

            <div>
              <label className="block text-xs md:text-sm font-black text-blue-900/60 mb-1.5 uppercase tracking-wide">Quận/Huyện *</label>
              <select name="district" value={formData.district} onChange={handleChange} className="w-full px-4 py-3 bg-white/50 border border-white/60 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 shadow-inner transition-all font-semibold text-gray-800">
                {districtsList.map(dist => (
                  <option key={dist} value={dist}>{dist}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs md:text-sm font-black text-blue-900/60 mb-1.5 uppercase tracking-wide">Phường/Xã *</label>
              <select name="ward" value={formData.ward} onChange={handleChange} className="w-full px-4 py-3 bg-white/50 border border-white/60 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 shadow-inner transition-all font-semibold text-gray-800">
                {danangAdmin[formData.district]?.map(w => (
                  <option key={w} value={w}>{w}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-4 pt-6 border-t border-gray-200/50 shrink-0">
            {editData && onDeleteDealer && (
              <button
                type="button"
                onClick={() => onDeleteDealer(editData.id)}
                className="px-6 py-2.5 text-red-500 font-bold bg-white/50 border border-red-200 hover:bg-red-500 hover:text-white rounded-xl transition-all shadow-sm mr-auto"
              >
                Xóa Cửa Hàng
              </button>
            )}
            <button type="button" onClick={onClose} className="px-6 py-2.5 text-gray-500 font-bold bg-white/50 border border-white/60 hover:bg-white rounded-xl transition-all shadow-sm">
              Hủy
            </button>
            <button type="submit" disabled={isLoading} className="px-8 py-2.5 text-white font-black uppercase tracking-wider bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 rounded-xl transition-all shadow-[0_4px_15px_rgba(59,130,246,0.3)] hover:shadow-[0_4px_20px_rgba(34,211,238,0.4)] hover:-translate-y-0.5 disabled:opacity-50">
              {isLoading ? 'Đang lưu...' : (editData ? 'Cập nhật' : 'Thêm mới')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ManualAddModal;
