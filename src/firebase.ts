import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDMP-NcTcNADUL7ip8fVhIBV7XYDkSqoV8",
  authDomain: "lib-system-92934.firebaseapp.com",
  projectId: "lib-system-92934",
  storageBucket: "lib-system-92934.firebasestorage.app",
  messagingSenderId: "1027083564607",
  appId: "1:1027083564607:web:0d4afefb0c4a64a597ea8a"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
