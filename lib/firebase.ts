import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"

const firebaseConfig = {
  apiKey: "AIzaSyDNEmIjn_NXkOr5tRDStQBo-arwIHDYGtY",
  authDomain: "nagaskills-8cc58.firebaseapp.com",
  projectId: "nagaskills-8cc58",
  storageBucket: "nagaskills-8cc58.firebasestorage.app",
  messagingSenderId: "1049521985430",
  appId: "1:1049521985430:web:e7f709b6257a8fa5d42fb7",
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase services
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)

export default app
