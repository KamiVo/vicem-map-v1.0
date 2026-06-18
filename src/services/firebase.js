import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, collection, getDocs, writeBatch, doc, getDoc, setDoc, updateDoc, deleteField, deleteDoc } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

// Để trống các config theo yêu cầu
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Kiểm tra xem cấu hình Firebase có đầy đủ không (hoặc đang chạy trong môi trường test)
const isConfigValid = !!(firebaseConfig.apiKey && firebaseConfig.projectId) || import.meta.env.MODE === 'test';

let app = null;
let db = null;
let analytics = null;
let auth = null;

if (isConfigValid) {
  try {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    db = getFirestore(app);
    auth = getAuth(app);
    // Chỉ khởi tạo Analytics khi có measurementId và chạy trên client
    if (typeof window !== "undefined" && firebaseConfig.measurementId) {
      analytics = getAnalytics(app);
    }
  } catch (error) {
    console.error("Lỗi khi khởi tạo Firebase:", error);
  }
} else {
  console.warn(
    "⚠️ Firebase Config chưa được cấu hình. " +
    "Vui lòng tạo file .env từ .env.example và điền đầy đủ các thông tin cấu hình Firebase."
  );
}

export { db, auth, deleteField };

// Hàm tải danh sách đại lý từ Firestore
export const fetchDealersFromDB = async () => {
  if (!db) {
    throw new Error("Firebase chưa được cấu hình. Vui lòng kiểm tra file .env.");
  }
  const dealersCol = collection(db, "dealers");
  const dealerSnapshot = await getDocs(dealersCol);
  return dealerSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Hàm nhập lô (batch insert) danh sách đại lý vào Firestore (Hỗ trợ > 500 bản ghi)
export const batchAddDealersToDB = async (dealers) => {
  if (!db) {
    throw new Error("Firebase chưa được cấu hình. Vui lòng kiểm tra file .env.");
  }
  const CHUNK_SIZE = 500;
  for (let i = 0; i < dealers.length; i += CHUNK_SIZE) {
    const chunk = dealers.slice(i, i + CHUNK_SIZE);
    const batch = writeBatch(db);
    chunk.forEach((dealer) => {
      const dealerRef = doc(collection(db, "dealers"));
      batch.set(dealerRef, dealer);
    });
    await batch.commit();
  }
};

// Hàm thêm 1 đại lý thủ công
export const addDealerToDB = async (dealer) => {
  if (!db) {
    throw new Error("Firebase chưa được cấu hình. Vui lòng kiểm tra file .env.");
  }
  const dealerRef = doc(collection(db, "dealers"));
  await setDoc(dealerRef, dealer);
};

// Hàm cập nhật 1 đại lý
export const updateDealerInDB = async (id, data) => {
  if (!db) {
    throw new Error("Firebase chưa được cấu hình. Vui lòng kiểm tra file .env.");
  }
  const dealerRef = doc(db, "dealers", id);
  await updateDoc(dealerRef, data);
};

// Hàm xóa 1 đại lý
export const deleteDealerFromDB = async (id) => {
  if (!db) {
    throw new Error("Firebase chưa được cấu hình. Vui lòng kiểm tra file .env.");
  }
  const dealerRef = doc(db, "dealers", id);
  await deleteDoc(dealerRef);
};

// Hàm xóa toàn bộ đại lý (Dùng cho Load Test)
export const deleteAllDealersFromDB = async () => {
  if (!db) {
    throw new Error("Firebase chưa được cấu hình. Vui lòng kiểm tra file .env.");
  }
  const dealersCol = collection(db, "dealers");
  const snapshot = await getDocs(dealersCol);
  
  const CHUNK_SIZE = 500;
  for (let i = 0; i < snapshot.docs.length; i += CHUNK_SIZE) {
    const chunk = snapshot.docs.slice(i, i + CHUNK_SIZE);
    const batch = writeBatch(db);
    chunk.forEach((docSnap) => {
      batch.delete(docSnap.ref);
    });
    await batch.commit();
  }
};

// ============================================================
// SUB-COLLECTION: SALES DATA (Sản lượng)
// Cấu trúc: dealers/{dealerId}/sales/{year}
// Document: { year, months: [t1,t2,...t12], total, unit, updatedAt }
// ============================================================

export const fetchSalesData = async (dealerId, year) => {
  if (!db) throw new Error("Firebase chưa được cấu hình.");
  const salesRef = doc(db, "dealers", dealerId, "sales", String(year));
  const snapshot = await getDoc(salesRef);
  if (snapshot.exists()) return snapshot.data();
  // Trả về cấu trúc rỗng nếu chưa có dữ liệu cho năm này
  return { year: Number(year), months: Array(12).fill(0), total: 0, unit: 'Tấn' };
};

export const saveSalesData = async (dealerId, year, monthlyData) => {
  if (!db) throw new Error("Firebase chưa được cấu hình.");
  const months = monthlyData.map(v => Number(v) || 0);
  const total = months.reduce((sum, v) => sum + v, 0);
  const salesRef = doc(db, "dealers", dealerId, "sales", String(year));
  await setDoc(salesRef, {
    year: Number(year),
    months,
    total,
    unit: 'Tấn',
    updatedAt: new Date().toISOString()
  });
  return total;
};
// Thắng sửa
export const fetchAllSalesYears = async (dealerId) => {
  if (!db) throw new Error("Firebase chưa được cấu hình.");
  const salesCol = collection(db, "dealers", dealerId, "sales");
  const snapshot = await getDocs(salesCol);
  return snapshot.docs
    .map(d => ({ year: d.id, ...d.data() }))
    .sort((a, b) => Number(b.year) - Number(a.year));
};

// ============================================================
// SUB-COLLECTION: PRODUCTS (Hàng hóa)
// Cấu trúc: dealers/{dealerId}/products/{productId}
// Document: { name, stock, stockUnit, price, priceUnit }
// ============================================================

export const fetchProducts = async (dealerId) => {
  if (!db) throw new Error("Firebase chưa được cấu hình.");
  const productsCol = collection(db, "dealers", dealerId, "products");
  const snapshot = await getDocs(productsCol);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const saveProduct = async (dealerId, product) => {
  if (!db) throw new Error("Firebase chưa được cấu hình.");
  const { id, ...data } = product;
  if (id) {
    // Cập nhật sản phẩm đã có
    await setDoc(doc(db, "dealers", dealerId, "products", id), data);
  } else {
    // Thêm mới, Firestore tự tạo ID
    await setDoc(doc(collection(db, "dealers", dealerId, "products")), data);
  }
};

export const deleteProduct = async (dealerId, productId) => {
  if (!db) throw new Error("Firebase chưa được cấu hình.");
  const ref = doc(db, "dealers", dealerId, "products", productId);
  await deleteDoc(ref);
};