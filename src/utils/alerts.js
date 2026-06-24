import Swal from 'sweetalert2';

// Cấu hình chung cho SweetAlert2 để phù hợp với giao diện Tailwind của dự án
const customSwal = Swal.mixin({
  customClass: {
    container: 'z-[9999]', // Đẩy z-index lên cao nhất để không bị đè bởi các Modal khác (như ManualAddModal đang dùng z-2000, DataManagementModal z-4000)
    popup: 'rounded-[30px] shadow-[0_20px_50px_rgba(0,0,0,0.25)] border border-white/50 bg-white/95 backdrop-blur-xl',
    title: 'text-2xl font-black text-gray-800',
    htmlContainer: 'text-gray-600 font-medium',
    confirmButton: 'bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold py-3 px-8 rounded-2xl mx-2 shadow-[0_10px_20px_rgba(0,0,0,0.1)] transition-all transform hover:scale-105 active:scale-95',
    cancelButton: 'bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 px-8 rounded-2xl mx-2 transition-all transform hover:scale-105 active:scale-95'
  },
  buttonsStyling: false
});

/**
 * Hiển thị thông báo xác nhận (thay thế window.confirm)
 */
export const confirmAlert = async (title, text = "Hành động này không thể hoàn tác!") => {
  const result = await customSwal.fire({
    title,
    text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Đồng ý',
    cancelButtonText: 'Hủy bỏ',
    reverseButtons: true
  });
  return result.isConfirmed;
};

/**
 * Hiển thị thông báo thành công (thay thế alert)
 */
export const successAlert = (title, text = "") => {
  return customSwal.fire({
    icon: 'success',
    title,
    text,
    timer: 2000,
    showConfirmButton: false
  });
};

/**
 * Hiển thị thông báo lỗi (thay thế alert)
 */
export const errorAlert = (title, text = "") => {
  return customSwal.fire({
    icon: 'error',
    title,
    text,
    confirmButtonText: 'Đóng'
  });
};

/**
 * Hiển thị thông báo thông tin (thay thế alert)
 */
export const infoAlert = (title, text = "") => {
  return customSwal.fire({
    icon: 'info',
    title,
    text,
    confirmButtonText: 'Đã hiểu'
  });
};
