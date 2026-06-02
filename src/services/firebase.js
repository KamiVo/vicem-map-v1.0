import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, collection, getDocs, writeBatch, doc } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

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

// Khởi tạo Firebase an toàn cho Vite HMR (tránh lỗi duplicate-app khi lưu file)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const analytics = typeof window !== "undefined" ? getAnalytics(app) : null;

export const db = getFirestore(app);

// Hàm tải danh sách đại lý từ Firestore
export const fetchDealersFromDB = async () => {
  const dealersCol = collection(db, "dealers");
  const dealerSnapshot = await getDocs(dealersCol);
  return dealerSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Hàm nhập lô (batch insert) danh sách đại lý vào Firestore (Hỗ trợ > 500 bản ghi)
export const batchAddDealersToDB = async (dealers) => {
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
  const dealerRef = doc(collection(db, "dealers"));
  await writeBatch(db).set(dealerRef, dealer).commit();
};

// Hàm cập nhật 1 đại lý
export const updateDealerInDB = async (id, data) => {
  const dealerRef = doc(db, "dealers", id);
  await writeBatch(db).update(dealerRef, data).commit();
};

// Hàm xóa 1 đại lý
export const deleteDealerFromDB = async (id) => {
  const dealerRef = doc(db, "dealers", id);
  await writeBatch(db).delete(dealerRef).commit();
};

// Hàm xóa toàn bộ đại lý (Dùng cho Load Test)
export const deleteAllDealersFromDB = async () => {
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