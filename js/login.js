// Import Firebase functions
import { auth, db } from './firebase-config.js'
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  sendEmailVerification,
} from 'https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js'
import {
  doc,
  getDoc,
  updateDoc,
} from 'https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js'

const togglePassword = document.getElementById('togglePassword')
const passwordInput = document.getElementById('password')

togglePassword.addEventListener('click', function () {
  const type = passwordInput.type === 'password' ? 'text' : 'password'
  passwordInput.type = type

  // Toggle eye icon
  this.classList.toggle('uil-eye')
  this.classList.toggle('uil-eye-slash')
})

// Form validation and submission
const loginForm = document.getElementById('loginForm')
const loginBtn = document.getElementById('loginBtn')
const emailInput = document.getElementById('email')
const emailError = document.getElementById('emailError')
const passwordError = document.getElementById('passwordError')

// Email validation
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

// Show error message
function showError(input, errorElement, message) {
  input.classList.add('error')
  errorElement.textContent = message
  errorElement.classList.add('show')
}

// Hide error message
function hideError(input, errorElement) {
  input.classList.remove('error')
  errorElement.classList.remove('show')
}

// Real-time validation
emailInput.addEventListener('blur', function () {
  const email = this.value.trim()
  if (email && !validateEmail(email)) {
    showError(this, emailError, 'Please enter a valid email address')
  } else {
    hideError(this, emailError)
  }
})

passwordInput.addEventListener('blur', function () {
  const password = this.value
  if (password && password.length < 6) {
    showError(this, passwordError, 'Password must be at least 6 characters')
  } else {
    hideError(this, passwordError)
  }
})

// Form submission
loginForm.addEventListener('submit', async function (e) {
  e.preventDefault()

  const email = emailInput.value.trim()
  const password = passwordInput.value
  let isValid = true

  // Validate email
  if (!email) {
    showError(emailInput, emailError, 'Email is required')
    isValid = false
  } else if (!validateEmail(email)) {
    showError(emailInput, emailError, 'Please enter a valid email address')
    isValid = false
  } else {
    hideError(emailInput, emailError)
  }

  // Validate password
  if (!password) {
    showError(passwordInput, passwordError, 'Password is required')
    isValid = false
  } else if (password.length < 6) {
    showError(
      passwordInput,
      passwordError,
      'Password must be at least 6 characters'
    )
    isValid = false
  } else {
    hideError(passwordInput, passwordError)
  }

  if (isValid) {
    // Show loading state
    loginBtn.classList.add('loading')
    loginBtn.disabled = true

    try {
      console.log('Attempting to sign in...')

      // Sign in with Firebase
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      )
      const user = userCredential.user

      console.log('User signed in successfully:', user.uid)

      // Get user data from Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid))
      if (userDoc.exists()) {
        const userData = userDoc.data()
        console.log('User data retrieved:', userData)

        // Check both Firebase Auth and Firestore email verification
        if (!user.emailVerified || !userData.email_verified) {
          console.log('Email verification status:', {
            firebaseAuth: user.emailVerified,
            firestore: userData.email_verified,
          })

          alert(
            'Please verify your email before signing in. Check your inbox for the verification link.'
          )

          // Optionally resend verification email
          if (confirm('Would you like us to resend the verification email?')) {
            try {
              console.log('Resending verification email...')
              await sendEmailVerification(user, {
                url: window.location.origin + '/verify-email.html',
                handleCodeInApp: true,
              })
              console.log('Verification email sent successfully')
              alert('Verification email sent! Please check your inbox.')
            } catch (error) {
              console.error('Error sending verification email:', error)
              let errorMessage =
                'Failed to send verification email. Please try again.'

              if (error.code === 'auth/too-many-requests') {
                errorMessage =
                  'Too many verification emails sent. Please wait a few minutes before trying again.'
              } else if (error.code === 'auth/network-request-failed') {
                errorMessage =
                  'Network error. Please check your internet connection.'
              }

              alert(errorMessage)
            }
          }

          // Sign out the user since they can't proceed
          await signOut(auth)
          return
        }

        // Store user data in localStorage for dashboard access
        localStorage.setItem(
          'currentUser',
          JSON.stringify({
            uid: user.uid,
            email: user.email,
            full_name: userData.full_name,
            email_verified: userData.email_verified,
          })
        )
      } else {
        console.error('User document not found in Firestore')
        alert('User data not found. Please contact support.')
        await signOut(auth)
        return
      }

      console.log('Navigating to dashboard...')
      window.location.href = 'dashboard/index.html'
    } catch (error) {
      console.error('Login error:', error)
      let errorMessage = 'Login failed. Please try again.'

      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email address.'
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password. Please try again.'
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.'
      } else if (error.code === 'auth/user-disabled') {
        errorMessage = 'This account has been disabled. Please contact support.'
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later.'
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your internet connection.'
      }

      alert(errorMessage)
    } finally {
      loginBtn.classList.remove('loading')
      loginBtn.disabled = false
    }
  }
})

// Check if user is already signed in
onAuthStateChanged(auth, async (user) => {
  if (user) {
    console.log('User is already signed in:', user.uid)

    // Check Firestore email verification status and update if needed
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid))
      if (userDoc.exists()) {
        const userData = userDoc.data()

        // If Firebase Auth says email is verified but Firestore doesn't, update Firestore
        if (user.emailVerified && !userData.email_verified) {
          console.log(
            'Email verified in Firebase Auth but not in Firestore, updating...'
          )
          await updateDoc(doc(db, 'users', user.uid), {
            email_verified: true,
            verified_at: new Date().toISOString(),
          })
          console.log('Firestore email_verified updated to true')
        }

        // Check both Firebase Auth and Firestore email verification
        if (user.emailVerified && userData.email_verified) {
          console.log('Email is verified, redirecting to dashboard...')
          window.location.href = 'dashboard/index.html'
        } else {
          console.log('Email not verified, staying on login page')
          // Sign out the user since they shouldn't be logged in
          await signOut(auth)
        }
      } else {
        console.log('User document not found in Firestore')
        await signOut(auth)
      }
    } catch (error) {
      console.error('Error checking user verification status:', error)
      await signOut(auth)
    }
  } else {
    console.log('No user signed in')
  }
})

// Add focus effects
document.querySelectorAll('.form-input').forEach((input) => {
  input.addEventListener('focus', function () {
    this.parentElement.classList.add('focused')
  })

  input.addEventListener('blur', function () {
    this.parentElement.classList.remove('focused')
  })
})
