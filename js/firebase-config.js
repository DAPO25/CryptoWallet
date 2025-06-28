// Import the functions you need from the SDKs you need
import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js'
import { getAnalytics } from 'https://www.gstatic.com/firebasejs/11.9.1/firebase-analytics.js'
import { getAuth } from 'https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js'
import { getFirestore } from 'https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js'

// Your web app's Firebase configuration
// Replace this with your actual Firebase project configuration
// You can find this in Firebase Console → Project Settings → General → Your apps
// const firebaseConfig = {
//   apiKey: 'YOUR_API_KEY_HERE',
//   authDomain: 'YOUR_PROJECT_ID.firebaseapp.com',
//   projectId: 'YOUR_PROJECT_ID',
//   storageBucket: 'YOUR_PROJECT_ID.appspot.com',
//   messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
//   appId: 'YOUR_APP_ID',
// }
const firebaseConfig = {
  apiKey: 'AIzaSyDnymY93h4wgWkj4ww1E3CjdTuU2Shmz4I',
  authDomain: 'cryptowallet-bde34.firebaseapp.com',
  projectId: 'cryptowallet-bde34',
  storageBucket: 'cryptowallet-bde34.firebasestorage.app',
  messagingSenderId: '256173240791',
  appId: '1:256173240791:web:4e136680523a91f3459b92',
  measurementId: 'G-SPZKH1ERSC',
}

console.log('Firebase config:', firebaseConfig)

// Initialize Firebase with error handling
let app, analytics, auth, db

try {
  console.log('Initializing Firebase app...')
  app = initializeApp(firebaseConfig)
  console.log('Firebase app initialized successfully')

  console.log('Initializing Analytics...')
  analytics = getAnalytics(app)
  console.log('Analytics initialized successfully')

  console.log('Initializing Auth...')
  auth = getAuth(app)
  console.log('Auth initialized successfully')

  console.log('Initializing Firestore...')
  db = getFirestore(app)
  console.log('Firestore initialized successfully')

  console.log('All Firebase services initialized successfully')

  // Test Firebase connectivity
  console.log('Testing Firebase connectivity...')
  console.log('App name:', app.name)
  console.log('Project ID:', app.options.projectId)
  console.log('Auth domain:', app.options.authDomain)
} catch (error) {
  console.error('Firebase initialization error:', error)
  console.error('Error details:', {
    message: error.message,
    code: error.code,
    stack: error.stack,
  })
  throw error
}

// Export Firebase instances
export { auth, db }
