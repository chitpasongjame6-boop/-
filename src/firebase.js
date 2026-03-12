import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyAs5itbLHrsM0HAKUaz3d-PadQvhwN5W5o",
  authDomain: "profit-report-lao.firebaseapp.com",
  projectId: "profit-report-lao",
  storageBucket: "profit-report-lao.firebasestorage.app",
  messagingSenderId: "267703711579",
  appId: "1:267703711579:web:3d2782f4cda0b255964c7e"
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
