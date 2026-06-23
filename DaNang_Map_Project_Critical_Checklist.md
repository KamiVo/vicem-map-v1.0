# Tài Liệu Phân Tích Yêu Cầu & Critical Checklist

## Mục tiêu dự án

Xây dựng Web App bản đồ quản lý đại lý VLXD, công ty xây dựng và nhà thầu trên địa bàn TP Đà Nẵng phục vụ trình chiếu trong các cuộc họp và quản lý dữ liệu kinh doanh.

---

# 1. Các câu hỏi bắt buộc phải làm rõ trước khi phát triển

## 1.1 Dữ liệu bản đồ

### Cần xác nhận

- Sử dụng địa giới hành chính năm nào?
- Sử dụng dữ liệu Đà Nẵng trước hay sau thay đổi địa giới?
- Có cần cập nhật khi địa giới hành chính thay đổi không?
- Khách hàng có cung cấp GeoJSON/Shapefile không?

### Rủi ro

- Không thể vẽ ranh giới chính xác.
- Không thể xác định cửa hàng thuộc phường nào.
- Không thể thống kê theo khu vực.

### Yêu cầu kỹ thuật

- Lưu dữ liệu GIS dưới dạng GeoJSON.
- Hỗ trợ hiển thị ranh giới phường.
- Hỗ trợ tô màu khu vực.

---

## 1.2 Định vị cửa hàng

Không được chỉ lưu địa chỉ dạng text.

### Bắt buộc lưu

```json
{
  "name": "VLXD ABC",
  "address": "123 Nguyễn Văn Linh",
  "lat": 16.054,
  "lng": 108.202
}
```

### Rủi ro nếu chỉ lưu địa chỉ

- Không hiện đúng marker.
- Không tìm kiếm theo vị trí.
- Không thống kê địa lý.

---

## 1.3 Phân loại đối tượng

### Các loại đối tượng

- Đại lý VLXD
- Công ty xây dựng
- Nhà thầu

### Khuyến nghị

Tạo trường:

```text
entityType
```

Giá trị:

```text
DEALER
CONSTRUCTION_COMPANY
CONTRACTOR
```

---

# 2. Quy tắc trạng thái và màu sắc

## Trạng thái

```text
GOOD
WARNING
NOT_SELLING
HIGH_RISK
```

## Mapping màu sắc

| Trạng thái | Màu |
|------------|------|
| GOOD | Xanh |
| NOT_SELLING | Đỏ |
| WARNING | Vàng |
| HIGH_RISK | Đen |

## Lưu ý

Một đối tượng chỉ được có duy nhất một trạng thái.

---

# 3. Thiết kế dữ liệu

## 3.1 Dealer

```text
id
name
entityType
status
phone
address
ward
district
lat
lng
establishedYear
landOwnershipType
createdAt
updatedAt
deletedAt
```

---

## 3.2 Chủ sở hữu hiện tại

```text
id
dealerId
ownerName
fromDate
toDate
isCurrent
```

---

## 3.3 Lịch sử chủ sở hữu

Bắt buộc lưu lịch sử.

Ví dụ:

```text
2015 - Ông A
2020 - Ông B
2024 - Ông C
```

Không được ghi đè dữ liệu cũ.

---

## 3.4 Sản phẩm

Không hardcode giới hạn 10 sản phẩm.

```text
id
dealerId
productName
```

Frontend có thể giới hạn hiển thị 10.

Database không giới hạn.

---

## 3.5 Sản lượng bán hàng

Lưu theo tháng.

Ví dụ:

```text
2026-01 = 50
2026-02 = 30
2026-03 = 70
```

Không lưu duy nhất tổng năm.

### Bảng đề xuất

```text
id
dealerId
year
month
quantity
```

---

# 4. Chức năng hệ thống

## 4.1 Bản đồ

### Bắt buộc

- Hiển thị bản đồ Đà Nẵng.
- Hiển thị ranh giới phường.
- Hiển thị marker.
- Zoom.
- Pan.
- Fullscreen.

### Hiệu năng

Hỗ trợ Marker Clustering.

Mục tiêu:

- 100 marker.
- 500 marker.
- 1000 marker.
- 3000 marker.

Không được lag.

---

## 4.2 Popup / Side Panel

Khi click marker:

Hiển thị:

- Tên đại lý.
- Chủ hiện tại.
- Điện thoại.
- Địa chỉ.
- Sản phẩm.
- Sản lượng.
- Trạng thái.

Khuyến nghị dùng Side Panel thay vì Popup nhỏ.

---

## 4.3 Tìm kiếm

### Tìm theo

- Tên đại lý.
- Chủ đại lý.
- Phường.
- Loại đối tượng.
- Trạng thái.

---

## 4.4 Bộ lọc

### Filter màu

- Xanh.
- Đỏ.
- Vàng.
- Đen.

### Filter loại

- Đại lý.
- Công ty xây dựng.
- Nhà thầu.

---

# 5. Quản trị hệ thống

## Vai trò

Mặc dù hiện tại chỉ có 1 admin nhưng vẫn thiết kế:

### Admin

- Thêm.
- Sửa.
- Xóa.
- Import.
- Export.

### Viewer

- Chỉ xem.

---

# 6. Audit Log

Bắt buộc triển khai.

## Lưu

- Ai sửa.
- Thời gian sửa.
- Trường nào bị sửa.
- Giá trị cũ.
- Giá trị mới.

Ví dụ:

```text
2026-08-12 10:20

status

OLD: NOT_SELLING
NEW: GOOD
```

---

# 7. Backup & Khôi phục

## Bắt buộc

- Daily Backup.
- Restore Backup.
- Soft Delete.

Không xóa vật lý dữ liệu.

---

# 8. Security

## Authentication

- JWT.
- Refresh Token.

## Bảo mật

- XSS Protection.
- SQL Injection Protection.
- CSRF Protection.
- Rate Limiting.

---

# 9. QA Test Cases

## Bản đồ

- Zoom In.
- Zoom Out.
- Pan.
- Fullscreen.

## Marker

- Click.
- Hover.
- Cluster.

## CRUD

- Create.
- Update.
- Delete.
- Restore.

## Dữ liệu

- Trùng số điện thoại.
- Trùng địa chỉ.
- Thiếu tọa độ.
- Thiếu tên.

## Security

- Session hết hạn.
- Truy cập trái phép.
- XSS.
- SQL Injection.

---

# 10. Kiến trúc đề xuất

## Frontend

- React
- TypeScript
- Leaflet hoặc Mapbox GL

## Backend

- NestJS

## Database

- PostgreSQL
- PostGIS

## Authentication

- JWT

## Hosting

- Linux VPS

## Backup

- Daily Backup

---

# 11. Definition of Done

Dự án chỉ được xem là hoàn thành khi:

- Hiển thị đúng bản đồ.
- Hiển thị đúng ranh giới phường.
- CRUD đầy đủ.
- Có audit log.
- Có backup.
- Có phân quyền.
- Có tìm kiếm.
- Có bộ lọc.
- Chạy ổn định trên màn hình máy chiếu.
- Test QA đạt 100% các test case quan trọng.
