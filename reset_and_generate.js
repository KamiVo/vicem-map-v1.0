import fs from 'fs';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, writeBatch } from 'firebase/firestore';
import ExcelJS from 'exceljs';

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

const danangAdmin = JSON.parse(fs.readFileSync('./src/assets/danang_admin.json', 'utf-8'));
const districtsList = Object.keys(danangAdmin);

const streets = [
  'Nguyễn Văn Linh', 'Lê Duẩn', 'Điện Biên Phủ', 'Hùng Vương', 'Trần Phú', 'Bạch Đằng',
  'Ngô Quyền', 'Tôn Đức Thắng', 'Trường Chinh', 'Hoàng Diệu', 'Ông Ích Khiêm', 'Nguyễn Hữu Thọ'
];

async function run() {
  try {
    console.log("Đang xóa dữ liệu cũ trên Firebase...");
    const snapshot = await getDocs(collection(db, 'dealers'));
    let count = 0;
    
    // Firestore batch có giới hạn 500 document, nếu demo 50 thì an toàn
    const batch = writeBatch(db);
    snapshot.forEach(docSnap => {
      batch.delete(docSnap.ref);
      count++;
    });
    
    if (count > 0) {
      await batch.commit();
    }
    console.log(`Đã xóa thành công ${count} đại lý cũ.`);

    console.log("Đang tạo file Excel Demo mới với địa chỉ và phường chuẩn xác...");
    const dealers = [];
    for (let i = 0; i < 20; i++) { // Rút ngắn lại 20 cửa hàng để test nhanh (tránh chờ 50s API Geocoding)
      const district = districtsList[Math.floor(Math.random() * districtsList.length)];
      const wards = danangAdmin[district];
      const ward = wards[Math.floor(Math.random() * wards.length)];
      const street = streets[Math.floor(Math.random() * streets.length)];
      const houseNum = Math.floor(Math.random() * 200) + 1;

      dealers.push({
        name: `Cửa hàng VLXD Số ${i + 1}`,
        address: `${houseNum} ${street}`,
        ward: ward,
        district: district,
        phone: `09${Math.floor(10000000 + Math.random() * 90000000)}`,
        status: Math.random() > 0.5 ? 'Đã bán' : 'Chưa bán'
      });
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Dealers');

    // Cố tình không có cột Lat, Lng để ép hệ thống tự Geocoding
    worksheet.columns = [
      { header: 'Tên đại lý', key: 'name', width: 30 },
      { header: 'Địa chỉ', key: 'address', width: 30 },
      { header: 'Phường/Xã', key: 'ward', width: 20 },
      { header: 'Quận/Huyện', key: 'district', width: 20 },
      { header: 'Số điện thoại', key: 'phone', width: 15 },
      { header: 'Trạng thái', key: 'status', width: 15 }
    ];

    dealers.forEach(d => worksheet.addRow(d));
    await workbook.xlsx.writeFile('Demo_Dealers_Real_Address.xlsx');
    console.log("Đã tạo file Demo_Dealers_Real_Address.xlsx thành công!");
    
    process.exit(0);
  } catch (err) {
    console.error("Lỗi:", err);
    process.exit(1);
  }
}

run();
