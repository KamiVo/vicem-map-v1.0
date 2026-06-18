import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, writeBatch, doc } from "firebase/firestore";
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '.env') });

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const migrateStatus = async () => {
  console.log("Bắt đầu kết nối Database...");
  const dealersCol = collection(db, "dealers");
  const dealerSnapshot = await getDocs(dealersCol);
  
  let updateCount = 0;
  let batch = writeBatch(db);

  dealerSnapshot.docs.forEach((document) => {
    const data = document.data();
    let newStatus = null;

    if (data.status === 'Đã bán') {
      newStatus = 'Đại lý tốt';
    } else if (data.status === 'Chưa bán') {
      newStatus = 'Đại lý chưa bán';
    }

    if (newStatus) {
      const dealerRef = doc(db, "dealers", document.id);
      batch.update(dealerRef, { status: newStatus });
      updateCount++;
    }
  });

  if (updateCount > 0) {
    console.log(`Đang cập nhật ${updateCount} đại lý với trạng thái mới...`);
    await batch.commit();
    console.log("Cập nhật thành công!");
  } else {
    console.log("Không có đại lý nào cần cập nhật trạng thái.");
  }
};

migrateStatus().catch(console.error);
