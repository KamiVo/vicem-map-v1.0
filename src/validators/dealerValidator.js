import danangAdmin from '../assets/danang_admin.json';

const VALID_STATUSES = ['Đại lý tốt', 'Đại lý chưa bán', 'Đại lý rủi ro', 'Không chào bán'];
const VALID_LAND_STATUSES = ['Đang thuê', 'Sở hữu'];
const VALID_DISTRICTS = Object.keys(danangAdmin);

// Phạm vi tọa độ hợp lệ cho TP Đà Nẵng (mở rộng ra chút cho vùng giáp ranh)
const DA_NANG_BOUNDS = {
  latMin: 15.85,
  latMax: 16.25,
  lngMin: 107.80,
  lngMax: 108.55
};

/**
 * Validate dữ liệu dealer trước khi ghi DB.
 * @param {Object} data - Dữ liệu dealer cần validate
 * @returns {{ valid: boolean, errors: Object }} - Kết quả validate
 */
export const validateDealer = (data) => {
  const errors = {};

  // Tên đại lý
  if (!data.name || data.name.trim().length === 0) {
    errors.name = 'Tên đại lý không được để trống.';
  } else if (data.name.trim().length > 200) {
    errors.name = 'Tên đại lý không được vượt quá 200 ký tự.';
  }

  // Số điện thoại
  if (!data.phone || data.phone.trim().length === 0) {
    errors.phone = 'Số điện thoại không được để trống.';
  } else {
    const phoneClean = data.phone.replace(/[\s.-]/g, '');
    if (!/^0\d{9}$/.test(phoneClean)) {
      errors.phone = 'Số điện thoại phải gồm 10 chữ số và bắt đầu bằng 0.';
    }
  }

  // Trạng thái
  if (!data.status || !VALID_STATUSES.includes(data.status)) {
    errors.status = `Trạng thái phải là một trong: ${VALID_STATUSES.join(', ')}.`;
  }

  // Tình trạng đất
  if (data.landStatus && !VALID_LAND_STATUSES.includes(data.landStatus)) {
    errors.landStatus = `Tình trạng đất phải là: ${VALID_LAND_STATUSES.join(' hoặc ')}.`;
  }

  // Quận/Huyện
  if (!data.district || !VALID_DISTRICTS.includes(data.district)) {
    errors.district = 'Quận/Huyện không hợp lệ.';
  }

  // Phường/Xã
  if (data.district && VALID_DISTRICTS.includes(data.district)) {
    const validWards = danangAdmin[data.district] || [];
    if (!data.ward || !validWards.includes(data.ward)) {
      errors.ward = 'Phường/Xã không hợp lệ hoặc không thuộc Quận/Huyện đã chọn.';
    }
  }

  // Tọa độ
  const lat = parseFloat(data.lat || data.resolvedLat);
  const lng = parseFloat(data.lng || data.resolvedLng);

  if (isNaN(lat) || isNaN(lng)) {
    errors.coords = 'Thiếu tọa độ. Vui lòng click chuột phải trên bản đồ để chọn vị trí.';
  } else if (
    lat < DA_NANG_BOUNDS.latMin || lat > DA_NANG_BOUNDS.latMax ||
    lng < DA_NANG_BOUNDS.lngMin || lng > DA_NANG_BOUNDS.lngMax
  ) {
    errors.coords = 'Tọa độ nằm ngoài phạm vi TP Đà Nẵng.';
  }

  // Địa chỉ
  if (!data.address || data.address.trim().length === 0) {
    errors.address = 'Địa chỉ không được để trống.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validate sản lượng tháng
 * @param {Array} months - Mảng 12 phần tử sản lượng
 * @returns {{ valid: boolean, errors: string|null }}
 */
export const validateSalesData = (months) => {
  if (!Array.isArray(months) || months.length !== 12) {
    return { valid: false, errors: 'Dữ liệu sản lượng phải có đúng 12 tháng.' };
  }
  for (let i = 0; i < months.length; i++) {
    const val = Number(months[i]);
    if (isNaN(val) || val < 0) {
      return { valid: false, errors: `Sản lượng tháng ${i + 1} không hợp lệ (phải >= 0).` };
    }
  }
  return { valid: true, errors: null };
};
