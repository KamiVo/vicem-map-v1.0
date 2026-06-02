[🇻🇳 Tiếng Việt](#-hệ-thống-bản-đồ-quản-lý-phân-phối-vicem-map) | [🇬🇧 English](#-distribution-management-map-system-vicem-map)

---

# 🗺️ Hệ thống Bản đồ Quản lý Phân phối (Vicem Map)

Ứng dụng bản đồ tương tác nền tảng Web được thiết kế để quản lý, trực quan hóa và tìm kiếm mạng lưới nhà phân phối/đại lý trên hệ thống thông tin địa lý (GIS). 

![Demo UI](https://img.shields.io/badge/UI-Responsive-success)
![React](https://img.shields.io/badge/React-19.2-blue)
![Vite](https://img.shields.io/badge/Vite-8.0-purple)
![Firebase](https://img.shields.io/badge/Firebase-12.14-orange)

## ✨ Tính năng nổi bật
* 📱 **Thiết kế Responsive (Mobile-First):** Giao diện tương thích hoàn hảo trên điện thoại, máy tính bảng với UI ngăn kéo trượt (Drawer) hiện đại.
* 📍 **Bản đồ Tương tác & GeoJSON:** Hiển thị ranh giới các khu vực, quận/huyện kết hợp với hàng ngàn điểm đánh dấu (Markers) siêu mượt nhờ kĩ thuật chống nghẽn (Marker Clustering / Culling).
* 🔎 **Tìm kiếm Thông minh:** Thanh công cụ phong cách Google Maps, gợi ý kết quả tự động và tự động điều hướng góc nhìn bản đồ.
* 📊 **Xử lý Dữ liệu Excel (Import/Export):** Cho phép nạp dữ liệu hàng loạt cực nhanh và an toàn (sử dụng thư viện bảo mật `exceljs`).
* ☁️ **Realtime Database:** Tương tác, cập nhật, đồng bộ hóa dữ liệu thời gian thực (Realtime CRUD) sử dụng Firebase Cloud Firestore (Batching & Chunking cho dữ liệu lớn).
* 🧪 **Kiểm thử tự động (Unit Tests):** Đảm bảo an toàn mã nguồn với 100% Test Coverage các luồng dữ liệu quan trọng bằng Vitest.

## 🛠️ Công nghệ sử dụng
* **Frontend Framework:** ReactJS + Vite
* **Styling:** TailwindCSS v4
* **Bản đồ (Mapping):** Leaflet & React-Leaflet
* **Backend as a Service:** Firebase (Firestore & Hosting)
* **Testing:** Vitest & React Testing Library
* **Tiện ích:** ExcelJS (Xử lý Excel), React-Icons

## 🚀 Hướng dẫn Cài đặt & Chạy trên máy cá nhân (Local)

### Bước 1: Chuẩn bị Môi trường
Clone dự án về máy và cài đặt thư viện:
```bash
git clone https://github.com/KamiVo/vicem-map.git
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

## 🧪 Chạy Kiểm thử (Testing)
Dự án được tích hợp sẵn các Unit Test để kiểm tra độ ổn định khi tương tác với Firebase Mock, Excel Logic, và Responsive UI:
```bash
npm run test
```

## 📦 Đóng gói & Triển khai (Deploy)
Dự án đã được cấu hình sẵn để dễ dàng đẩy lên Firebase Hosting:
```bash
# 1. Đóng gói mã nguồn tĩnh
npm run build

# 2. Đăng nhập vào Firebase CLI (Nếu chưa)
npx firebase-tools login

# 3. Phóng lên Firebase Hosting
npx firebase-tools deploy
```

---

<br>
<br>

# 🗺️ Distribution Management Map System (Vicem Map)

An interactive web-based map application designed to manage, visualize, and search a network of distributors/dealers on a Geographic Information System (GIS).

![Demo UI](https://img.shields.io/badge/UI-Responsive-success)
![React](https://img.shields.io/badge/React-19.2-blue)
![Vite](https://img.shields.io/badge/Vite-8.0-purple)
![Firebase](https://img.shields.io/badge/Firebase-12.14-orange)

## ✨ Key Features
* 📱 **Responsive Design (Mobile-First):** Perfectly adapted for smartphones and tablets featuring a modern sliding Drawer UI.
* 📍 **Interactive Map & GeoJSON:** Displays regional boundaries (districts/wards) combined with thousands of high-performance markers using anti-clogging techniques (Marker Clustering / Culling).
* 🔎 **Smart Search:** Google Maps style toolbar with auto-suggestions and automatic map viewpoint navigation.
* 📊 **Excel Data Handling (Import/Export):** Allows ultra-fast and secure bulk data imports (utilizing the secure `exceljs` library).
* ☁️ **Realtime Database:** Real-time data interaction, updates, and synchronization (Realtime CRUD) using Firebase Cloud Firestore (with Batching & Chunking capabilities for large datasets).
* 🧪 **Automated Testing (Unit Tests):** Ensures codebase safety with 100% Test Coverage for critical data workflows using Vitest.

## 🛠️ Technologies Used
* **Frontend Framework:** ReactJS + Vite
* **Styling:** TailwindCSS v4
* **Mapping:** Leaflet & React-Leaflet
* **Backend as a Service:** Firebase (Firestore & Hosting)
* **Testing:** Vitest & React Testing Library
* **Utilities:** ExcelJS (Excel handling), React-Icons

## 🚀 Installation & Local Development

### Step 1: Prepare the Environment
Clone the project and install dependencies:
```bash
git clone https://github.com/KamiVo/vicem-map.git
cd vicem-map
npm install
```

### Step 2: Set up Environment Variables
The project requires a Firebase connection. Create a `.env` file in the root directory based on the `.env.example` template:
```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain_here
VITE_FIREBASE_PROJECT_ID=your_project_id_here
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket_here
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id_here
VITE_FIREBASE_APP_ID=your_app_id_here
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id_here
```

### Step 3: Run the Application
Start the development server at `http://localhost:5173`:
```bash
npm run dev
```

## 🧪 Testing
The project includes Unit Tests to ensure stability when interacting with Firebase Mocks, Excel Logic, and Responsive UI components:
```bash
npm run test
```

## 📦 Build & Deploy
The project is pre-configured for easy deployment to Firebase Hosting:
```bash
# 1. Build the static source code
npm run build

# 2. Log in to Firebase CLI (if not already)
npx firebase-tools login

# 3. Deploy to Firebase Hosting
npx firebase-tools deploy
```

---
*Project built with the assistance of Antigravity AI.*
