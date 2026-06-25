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
* 📱 **Thiết kế Giao diện Tương lai (HUD Glassmorphism):** Giao diện trong suốt, cực kỳ hiện đại, tối ưu hiển thị ở tỷ lệ vàng trên mọi thiết bị (Mobile/Desktop/Màn chiếu). Banner lời chào thông minh được đẩy xuống góc dưới tránh che khuất Popup.
* 📍 **Bản đồ Tương tác Nâng cao (14 Khu vực):** Quản lý ranh giới các khu vực đã được sáp nhập. Các đại lý được phân loại màu sắc: Xanh (Tốt), Đỏ (Chưa bán), Vàng (Rủi ro), Đen (Không chào bán) và trạng thái **"Đặc biệt"** với hiệu ứng nhấp nháy (Pulse) neon nổi bật.
* 🔎 **Tìm kiếm Thông minh & Tự động Chuẩn hóa Địa lý:** Tích hợp ArcGIS Geocoding API với thuật toán tự động nhận diện và chuyển đổi tên các **phường cũ** sang **14 phường mới**.
* 🎯 **Trải nghiệm Tự động (Automation):** Tìm kiếm và chọn cửa hàng sẽ tự động cuộn bản đồ (Auto-Pan) trượt xuống 1 khoảng 150px và tự động bung (Auto-Open) thẻ Popup thông tin vô cùng mượt mà.
* 📝 **Quản lý Đại lý Chuyên sâu:** Chỉnh sửa nhanh thông tin chủ sở hữu, lịch sử đổi chủ, tình trạng đất (Đang thuê/Sở hữu), **nguồn vốn (Nguồn chung/Nguồn riêng)** và tình trạng bán hàng.
* 🔐 **Hệ thống Quản trị (Admin Role):** Bảo mật thao tác (Thêm, Sửa, Xóa mềm) thông qua Firebase Authentication và Firestore Security Rules. Khách vãng lai (Guest) chỉ có thể xem bản đồ.

## 🚀 Tối ưu hóa Hiệu năng & Băng thông (0 Đồng)
Dự án được tối ưu cực kỳ sâu để tiết kiệm tuyệt đối chi phí vận hành (hoàn toàn miễn phí):
* **Firestore Offline Persistence:** Dữ liệu tự động được Cache (lưu trữ) thẳng vào ổ cứng trình duyệt. Lần truy cập sau tốc độ tải là **0 mili-giây** (0 ms latency).
* **Real-time Listener (`onSnapshot`):** Dữ liệu truyền tải là luồng Socket chỉ đồng bộ hóa đúng 1 bản ghi bị thay đổi, giúp tiết kiệm 99% băng thông so với việc tải lại toàn bộ danh sách.
* **Vite Chunk Splitting:** Mã nguồn khổng lồ đã được chia nhỏ tự động. Trình duyệt sẽ Cache vĩnh viễn Firebase, React, Leaflet riêng lẻ. Các lần truy cập sau gần như không tốn băng thông tải JS.
* **Nén Brotli GeoJSON:** File ranh giới địa lý được Firebase Hosting tự động nén Brotli theo chuẩn mới nhất, giảm từ ~900KB xuống còn vỏn vẹn ~100KB trên đường truyền.
* **Debounce API:** Thuật toán chống Spam (0.5s Timeout) khi người dùng gõ tìm kiếm, giúp ArcGIS API luôn an toàn, không bao giờ lo bị chặn IP do rate-limiting.

## 🛠️ Công nghệ sử dụng
* **Frontend Framework:** ReactJS + Vite 8
* **Styling:** TailwindCSS v4
* **Bản đồ (Mapping):** Leaflet & React-Leaflet
* **Backend as a Service:** Firebase (Firestore, Authentication, & Hosting)

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
* 📱 **Futuristic Design (HUD Glassmorphism):** Transparent, ultra-modern interface, optimized for the golden ratio across all devices. The HUD welcome banner is perfectly positioned at the bottom to avoid blocking popups.
* 📍 **Advanced Interactive Map (14 Regions):** Manages regional boundaries of the newly merged 14 wards/communes. Visual classification of dealers: Green (Good), Red (Not selling), Yellow (Risk), Black (Not offering), and a **"Special" (Đặc biệt)** status with a golden neon pulsing animation.
* 🔎 **Smart Search & Geo-normalization:** Integrates ArcGIS Geocoding API with custom algorithms that automatically map **old ward names** to the new **14 wards**.
* 🎯 **Automated UX:** Selecting a store will automatically pan the map (with a 150px downward offset) and auto-open the info popup seamlessly.
* 📝 **In-depth Dealer Management:** Quickly edit owner info, ownership history, land status (Renting/Owning), **funding source**, and sales status.
* 🔐 **Admin Role System:** Secures mutating actions (Create, Update, Soft-Delete) via Firebase Authentication and Firestore Security Rules. Guests have read-only access.

## 🚀 Performance & Bandwidth Optimization (0-Cost Architecture)
Designed to be 100% free with advanced optimizations to minimize API and bandwidth consumption:
* **Firestore Offline Persistence:** Data is cached directly in the browser's IndexedDB. Subsequent loads achieve **0 ms latency**.
* **Real-time Listener (`onSnapshot`):** Employs live sockets that only sync data diffs, reducing DB bandwidth consumption by 99% compared to full-list polling.
* **Vite Chunk Splitting:** The JavaScript bundle is split into cached chunks (Firebase, React, Leaflet), allowing users to download only the application logic (~500KB) on future visits.
* **Brotli GeoJSON Compression:** The geographic boundary file is automatically Brotli-compressed by Firebase Hosting, reducing transit size from ~900KB to ~100KB.
* **Debounce API:** A 0.5s timeout prevents spamming the ArcGIS Geocode API during typing, completely eliminating rate-limiting risks.

## 🛠️ Technologies Used
* **Frontend Framework:** ReactJS + Vite 8
* **Styling:** TailwindCSS v4
* **Mapping:** Leaflet & React-Leaflet
* **Backend as a Service:** Firebase (Firestore, Auth, Hosting)

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
*Project optimized and structured for zero-cost operation & maximum efficiency.*
