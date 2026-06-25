import { z } from 'zod';

export const dealerSchema = z.object({
  name: z.string().min(3, "Tên đại lý phải có ít nhất 3 ký tự").max(100, "Tên đại lý quá dài"),
  phone: z.string().optional().refine(
    (val) => !val || /^[0-9\s\-\+\(\)]{8,15}$/.test(val),
    "Số điện thoại không hợp lệ"
  ),
  ward: z.string().min(1, "Phường/Xã không được để trống"),
  fundingSource: z.enum(["Nguồn riêng", "Nguồn chung"], {
    errorMap: () => ({ message: "Nguồn vốn không hợp lệ" })
  }).optional(),
  status: z.enum([
    "Đại lý tốt",
    "Chưa bán",
    "Tháng này chưa lấy",
    "Rủi ro",
    "Trọng điểm",
    "Đặc biệt"
  ], {
    errorMap: () => ({ message: "Trạng thái không hợp lệ" })
  }),
  lat: z.number({
    required_error: "Tọa độ Vĩ độ (Lat) là bắt buộc",
    invalid_type_error: "Vĩ độ phải là một số hợp lệ"
  }).min(-90).max(90),
  lng: z.number({
    required_error: "Tọa độ Kinh độ (Lng) là bắt buộc",
    invalid_type_error: "Kinh độ phải là một số hợp lệ"
  }).min(-180).max(180),
});

export const validateDealer = (data) => {
  const result = dealerSchema.safeParse({
    ...data,
    lat: Number(data.lat || data.resolvedLat),
    lng: Number(data.lng || data.resolvedLng)
  });
  
  if (!result.success) {
    const errors = result.error.flatten().fieldErrors;
    const firstError = Object.values(errors)[0]?.[0] || "Dữ liệu không hợp lệ";
    return { valid: false, errors: { form: firstError } };
  }
  return { valid: true, data: result.data };
};
