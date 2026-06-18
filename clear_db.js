import fs from 'fs';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, writeBatch } from 'firebase/firestore';

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

async function run() {
  try {
    console.log("Đang xóa dữ liệu trên Firebase...");
    const snapshot = await getDocs(collection(db, 'dealers'));
    let count = 0;
    
    // Xóa theo lô (batch)
    const batches = [];
    let currentBatch = writeBatch(db);
    let opCount = 0;

    snapshot.forEach(docSnap => {
      currentBatch.delete(docSnap.ref);
      opCount++;
      count++;

      // Giới hạn Firestore là 500 operation mỗi batch
      if (opCount === 450) {
        batches.push(currentBatch.commit());
        currentBatch = writeBatch(db);
        opCount = 0;
      }
    });

    if (opCount > 0) {
      batches.push(currentBatch.commit());
    }

    await Promise.all(batches);
    console.log(`Đã xóa thành công ${count} đại lý khỏi cơ sở dữ liệu.`);
    process.exit(0);
  } catch (err) {
    console.error("Lỗi:", err);
    process.exit(1);
  }
}

run();
