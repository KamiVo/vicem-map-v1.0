[🇻🇳 Tiếng Việt](#tieng-viet) | [🇬🇧 English](#english)

---

<a name="tieng-viet"></a>
# 🗺️ Hệ thống Bản đồ Quản lý Phân phối (Vicem Map)

Ứng dụng bản đồ tương tác nền tảng Web được thiết kế để quản lý, trực quan hóa và tìm kiếm mạng lưới nhà phân phối/đại lý trên hệ thống thông tin địa lý (GIS). 

![Demo UI](https://img.shields.io/badge/UI-Responsive-success)
![React](https://img.shields.io/badge/React-19.2-blue)
![Vite](https://img.shields.io/badge/Vite-8.0-purple)
![Firebase](https://img.shields.io/badge/Firebase-12.14-orange)

## ✨ Tính năng nổi bật
* 📱 **Thiết kế Giao diện Tương lai (HUD Glassmorphism):** Giao diện trong suốt, cực kỳ hiện đại, tối ưu hiển thị ở tỷ lệ vàng trên mọi thiết bị (Mobile/Desktop/Màn chiếu).
* 📍 **Bản đồ Tương tác Nâng cao:** Quản lý ranh giới các khu vực, quận/huyện (chuẩn 2024 đổ về trước) với hệ thống Marker hiển thị linh hoạt theo mức độ Zoom.
* 🔎 **Tìm kiếm & Auto-fill Thông minh:** Tích hợp bộ máy tìm kiếm địa lý, tự động phân tích và điền form (Số nhà, Tên đường) khi thêm đại lý mới.
* 📝 **Quản lý Đại lý Chuyên sâu:** Chỉnh sửa nhanh chóng các thông tin chủ sở hữu, lịch sử đổi chủ (theo nhiệm kỳ), tình trạng đất, tình trạng bán hàng.
* ☁️ **Realtime Database Firebase:** Đồng bộ hóa dữ liệu thời gian thực không độ trễ, tối ưu hóa băng thông bằng cách gộp state React.
* 🧪 **Kiểm thử tự động (Unit Tests):** Đảm bảo an toàn mã nguồn với 100% Test Coverage các luồng dữ liệu quan trọng bằng Vitest.

## 🛠️ Công nghệ sử dụng
* **Frontend Framework:** ReactJS + Vite
* **Styling:** TailwindCSS v4
* **Bản đồ (Mapping):** Leaflet & React-Leaflet
* **Backend as a Service:** Firebase (Firestore & Hosting)
* **Testing:** Vitest & React Testing Library
* **Tiện ích:** React-Icons

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
Dự án được tích hợp sẵn các Unit Test để kiểm tra độ ổn định khi tương tác với Firebase Mock, và Responsive UI:
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

<a name="english"></a>
# 🗺️ Distribution Management Map System (Vicem Map)

An interactive web-based map application designed to manage, visualize, and search a network of distributors/dealers on a Geographic Information System (GIS).

![Demo UI](https://img.shields.io/badge/UI-Responsive-success)
![React](https://img.shields.io/badge/React-19.2-blue)
![Vite](https://img.shields.io/badge/Vite-8.0-purple)
![Firebase](https://img.shields.io/badge/Firebase-12.14-orange)

## ✨ Key Features
* 📱 **Futuristic Design (HUD Glassmorphism):** Transparent, ultra-modern interface, optimized for the golden ratio across all devices (Mobile/Desktop/Projectors).
* 📍 **Advanced Interactive Map:** Manages regional boundaries with dynamic Marker display based on Zoom levels.
* 🔎 **Smart Search & Auto-fill:** Integrated geocoding search engine that automatically parses and fills forms (House number, Street) when adding new dealers.
* 📝 **In-depth Dealer Management:** Quickly edit owner information, track ownership history (by terms), land status, and sales status.
* ☁️ **Realtime Database Firebase:** Zero-latency real-time data synchronization, bandwidth-optimized via React state merging.
* 🧪 **Automated Testing (Unit Tests):** Ensures codebase safety with 100% Test Coverage for critical data workflows using Vitest.

## 🛠️ Technologies Used
* **Frontend Framework:** ReactJS + Vite
* **Styling:** TailwindCSS v4
* **Mapping:** Leaflet & React-Leaflet
* **Backend as a Service:** Firebase (Firestore & Hosting)
* **Testing:** Vitest & React Testing Library
* **Utilities:** React-Icons

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
The project includes Unit Tests to ensure stability when interacting with Firebase Mocks, and Responsive UI components:
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
