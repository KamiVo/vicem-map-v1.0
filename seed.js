import fs from 'fs';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, writeBatch, doc } from 'firebase/firestore';
import ExcelJS from 'exceljs';

// Đọc file .env
const envConfig = {};
const envFile = fs.readFileSync('.env', 'utf-8');
envFile.split('\n').forEach(line => {
  const [key, ...value] = line.split('=');
  if (key && value) {
    envConfig[key.trim()] = value.join('=').trim();
  }
});

const firebaseConfig = {
  apiKey: envConfig.VITE_FIREBASE_API_KEY,
  authDomain: envConfig.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: envConfig.VITE_FIREBASE_PROJECT_ID,
  storageBucket: envConfig.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: envConfig.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: envConfig.VITE_FIREBASE_APP_ID,
  measurementId: envConfig.VITE_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const districts = ['Hải Châu', 'Thanh Khê', 'Sơn Trà', 'Ngũ Hành Sơn', 'Liên Chiểu', 'Cẩm Lệ'];
const statuses = ['Đã bán', 'Chưa bán', 'Ngừng bán'];

const generateRandomDealer = (index) => {
  const district = districts[Math.floor(Math.random() * districts.length)];
  const status = statuses[Math.floor(Math.random() * statuses.length)];
  // Tọa độ ngẫu nhiên khu vực Đà Nẵng
  const lat = 16.000 + Math.random() * 0.100; // ~ 16.0 to 16.1
  const lng = 108.150 + Math.random() * 0.080; // ~ 108.15 to 108.23

  return {
    name: `Đại lý Vật liệu số ${index + 1}`,
    address: `${Math.floor(Math.random() * 200) + 1} Đường số ${Math.floor(Math.random() * 10) + 1}`,
    ward: 'Phường Demo',
    district: district,
    phone: `09${Math.floor(10000000 + Math.random() * 90000000)}`,
    status: status,
    lat: lat,
    lng: lng
  };
};

const dealers = Array.from({ length: 50 }, (_, i) => generateRandomDealer(i));

async function run() {
  try {
    console.log("Đang tạo file Excel...");
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Dealers');

    worksheet.columns = [
      { header: 'Tên đại lý', key: 'name', width: 30 },
      { header: 'Địa chỉ', key: 'address', width: 30 },
      { header: 'Phường/Xã', key: 'ward', width: 20 },
      { header: 'Quận/Huyện', key: 'district', width: 20 },
      { header: 'Số điện thoại', key: 'phone', width: 15 },
      { header: 'Trạng thái', key: 'status', width: 15 },
      { header: 'Vĩ độ (Lat)', key: 'lat', width: 15 },
      { header: 'Kinh độ (Lng)', key: 'lng', width: 15 }
    ];

    dealers.forEach(d => worksheet.addRow(d));
    await workbook.xlsx.writeFile('Demo_50_Dealers.xlsx');
    console.log("Đã tạo thành công file Demo_50_Dealers.xlsx");

    console.log("Đang upload 50 đại lý lên Firebase Firestore...");
    const batch = writeBatch(db);
    dealers.forEach(dealer => {
      const dealerRef = doc(collection(db, "dealers"));
      batch.set(dealerRef, dealer);
    });
    
    await batch.commit();
    console.log("Upload lên Firebase thành công!");
    process.exit(0);
  } catch (error) {
    console.error("Lỗi:", error);
    process.exit(1);
  }
}

run();
