// file: addUser.js
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "[GCP_API_KEY]",
  authDomain: "webcement-f5861.firebaseapp.com",
  projectId: "webcement-f5861"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

createUserWithEmailAndPassword(auth, 'admin@vicem.vn', '0123456789')
  .then((userCredential) => {
    console.log("SUCCESS:", userCredential.user.email);
    process.exit(0);
  })
  .catch((error) => {
    console.error("ERROR:", error.message);
    process.exit(1);
  });
