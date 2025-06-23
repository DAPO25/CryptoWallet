// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCtcbVWiTH8lwUMbn_lwLJBQfAS8JQvZFQ",
  authDomain: "crypto-18dea.firebaseapp.com",
  projectId: "crypto-18dea",
  storageBucket: "crypto-18dea.firebasestorage.app",
  messagingSenderId: "1048137170280",
  appId: "1:1048137170280:web:3354360e6e19a54d99eadd",
  measurementId: "G-JFVFJTKGDN",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
