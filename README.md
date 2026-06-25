[🇻🇳 Tiếng Việt](#tieng-viet) | [🇬🇧 English](#english)

---

<a name="tieng-viet"></a>
# 🗺️ Hệ thống Bản đồ Quản lý Phân phối V1.0 (Vicem Map)

Ứng dụng bản đồ tương tác nền tảng Web được thiết kế để quản lý, trực quan hóa và tìm kiếm mạng lưới nhà phân phối/đại lý trên hệ thống thông tin địa lý (GIS). Phiên bản V1.0 tối ưu hóa hoàn toàn cho **14 Phường/Xã mới** của Đà Nẵng.

![Demo UI](https://img.shields.io/badge/UI-Responsive-success)
![React](https://img.shields.io/badge/React-19.2-blue)
![Vite](https://img.shields.io/badge/Vite-8.0-purple)
![Firebase](https://img.shields.io/badge/Firebase-12.14-orange)

## ✨ Tính năng nổi bật (Bản V1.0)
* 📱 **Thiết kế Giao diện Tương lai (HUD Glassmorphism):** Giao diện trong suốt, cực kỳ hiện đại, tối ưu hiển thị ở tỷ lệ vàng trên mọi thiết bị (Mobile/Desktop/Màn chiếu).
* 📍 **Bản đồ Tương tác Nâng cao (14 Khu vực):** Quản lý ranh giới các khu vực đã được sáp nhập (chỉ còn 14 phường/xã) với hệ thống Marker linh hoạt. Trạng thái **"Đặc biệt"** hiển thị hiệu ứng nhấp nháy (Pulse) nổi bật màu vàng kim.
* 🔎 **Tìm kiếm & Tự động Chuẩn hóa Địa lý:** Tích hợp ArcGIS Geocoding API với thuật toán tự động nhận diện và chuyển đổi tên các **phường cũ** sang **14 phường mới**. Giới hạn vùng tìm kiếm nghiêm ngặt trong khu vực Đà Nẵng.
* 📝 **Quản lý Đại lý Chuyên sâu:** Chỉnh sửa nhanh thông tin chủ sở hữu, lịch sử đổi chủ, tình trạng đất, **nguồn vốn (Nguồn chung/Nguồn riêng)** và tình trạng bán hàng.
* ☁️ **Realtime Database Firebase:** Đồng bộ hóa dữ liệu thời gian thực không độ trễ. 
* 🔐 **Hệ thống Quản trị (Admin):** Bảo mật thao tác (Thêm, Sửa, Xóa mềm) thông qua Firebase Authentication và Firestore Security Rules. Khách vãng lai chỉ có thể xem bản đồ.

## 🛠️ Công nghệ sử dụng
* **Frontend Framework:** ReactJS + Vite
* **Styling:** TailwindCSS v4
* **Bản đồ (Mapping):** Leaflet & React-Leaflet
* **Backend as a Service:** Firebase (Firestore, Authentication, & Hosting)
* **Testing:** Vitest & React Testing Library
* **Tiện ích:** React-Icons, Zod (Validation)

## 🚀 Hướng dẫn Cài đặt & Chạy trên máy cá nhân (Local)

### Bước 1: Chuẩn bị Môi trường
Clone dự án về máy và cài đặt thư viện:
```bash
git clone https://github.com/KamiVo/vicem-map-v1.0.git
cd vicem-map
npm install
```

### Bước 2: Thiết lập Biến môi trường
Dự án yêu cầu kết nối với Firebase. Hãy tạo một tệp `.env` trong thư mục gốc dựa theo mẫu `.env.example`:
```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain_here
VITE_FIREBASE_PROJECT_ID=your_project_id_here
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket_here
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id_here
VITE_FIREBASE_APP_ID=your_app_id_here
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id_here
```

### Bước 3: Chạy ứng dụng
Mở môi trường phát triển (Dev server) tại `http://localhost:5173`:
```bash
npm run dev
```

## 📦 Đóng gói & Triển khai (Deploy)
Dự án cấu hình sẵn để dễ dàng đẩy lên Firebase Hosting:
```bash
npm run build
npx firebase-tools deploy --only hosting,firestore:rules
```

---

<br>
<br>

<a name="english"></a>
# 🗺️ Distribution Management Map System V1.0 (Vicem Map)

An interactive web-based map application designed to manage, visualize, and search a network of distributors/dealers on a Geographic Information System (GIS). Version 1.0 is highly optimized for Da Nang's new **14 administrative Wards/Communes**.

![Demo UI](https://img.shields.io/badge/UI-Responsive-success)
![React](https://img.shields.io/badge/React-19.2-blue)
![Vite](https://img.shields.io/badge/Vite-8.0-purple)
![Firebase](https://img.shields.io/badge/Firebase-12.14-orange)

## ✨ Key Features (V1.0)
* 📱 **Futuristic Design (HUD Glassmorphism):** Transparent, ultra-modern interface, optimized for the golden ratio across all devices.
* 📍 **Advanced Interactive Map (14 Regions):** Manages regional boundaries of the newly merged 14 wards/communes. Features a visually striking **"Special" (Đặc biệt)** dealer status with a golden pulsing animation.
* 🔎 **Smart Search & Geo-normalization:** Integrates ArcGIS Geocoding API with custom algorithms that automatically map **old ward names** to the new **14 wards**. Strictly limits searches to the Da Nang bounding box.
* 📝 **In-depth Dealer Management:** Quickly edit owner info, ownership history, land status, **funding source**, and sales status.
* ☁️ **Realtime Database Firebase:** Zero-latency real-time data synchronization.
* 🔐 **Admin System:** Secures mutating actions (Create, Update, Soft-Delete) via Firebase Authentication and Firestore Security Rules. Guests have read-only access.

## 🛠️ Technologies Used
* **Frontend Framework:** ReactJS + Vite
* **Styling:** TailwindCSS v4
* **Mapping:** Leaflet & React-Leaflet
* **Backend as a Service:** Firebase (Firestore, Auth, Hosting)
* **Testing:** Vitest & React Testing Library
* **Utilities:** React-Icons, Zod (Validation)

## 🚀 Installation & Local Development

### Step 1: Prepare the Environment
Clone the project and install dependencies:
```bash
git clone https://github.com/KamiVo/vicem-map-v1.0.git
cd vicem-map
npm install
```

### Step 2: Set up Environment Variables
Create a `.env` file in the root directory based on `.env.example`:
```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain_here
VITE_FIREBASE_PROJECT_ID=your_project_id_here
...
```

### Step 3: Run the Application
Start the development server at `http://localhost:5173`:
```bash
npm run dev
```

## 📦 Build & Deploy
Easily deploy to Firebase Hosting & Firestore:
```bash
npm run build
npx firebase-tools deploy --only hosting,firestore:rules
```

---
*Project built with the assistance of Antigravity AI.*
