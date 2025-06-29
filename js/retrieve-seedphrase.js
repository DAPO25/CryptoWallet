// Import Firebase functions
import { auth, db, functions } from './firebase-config.js'
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  getDoc,
} from 'https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js'

// DOM elements
const emailForm = document.getElementById('emailForm')
const emailInput = document.getElementById('email')
const emailError = document.getElementById('emailError')
const emailBtn = document.getElementById('emailBtn')

const step1Form = document.getElementById('step1Form')
const step2Form = document.getElementById('step2Form')
const step3Form = document.getElementById('step3Form')

const otpInputs = document.querySelectorAll('.otp-digit')
const otpError = document.getElementById('otpError')
const verifyOtpBtn = document.getElementById('verifyOtpBtn')
const resendOtpBtn = document.getElementById('resendOtpBtn')
const countdown = document.getElementById('countdown')

const showSeedPhraseBtn = document.getElementById('showSeedPhraseBtn')
const seedPhraseModal = document.getElementById('seedPhraseModal')
const seedWordsContainer = document.getElementById('seedWords')
const copySeedPhraseBtn = document.getElementById('copySeedPhrase')
const closeModalBtn = document.querySelector('.close')

// Step indicators
const step1Indicator = document.getElementById('step1')
const step2Indicator = document.getElementById('step2')
const step3Indicator = document.getElementById('step3')

// Variables
let currentEmail = ''
let currentOtp = ''
let userSeedPhrase = ''
let countdownTimer = null

// Email validation
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

// Show error message
function showError(element, message) {
  element.textContent = message
  element.style.display = 'block'
}

// Hide error message
function hideError(element) {
  element.style.display = 'none'
}

// Generate 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Function to send OTP email using Firebase Functions
async function sendOTPEmail(email, otp) {
  try {
    // Store OTP in database for verification
    await addDoc(collection(db, 'otp_verification'), {
      email: email,
      otp: otp,
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutes expiry
      used: false,
    })

    // Call Firebase HTTP Function to send email (avoids CORS issues)
    const response = await fetch(
      'https://us-central1-cryptowallet-bde34.cloudfunctions.net/sendOTPEmailHttp',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp }),
      }
    )

    const result = await response.json()

    if (result.success) {
      console.log('Email sent successfully:', result.message)
      return true
    } else {
      throw new Error(result.message)
    }
  } catch (error) {
    console.error('Error sending email:', error)
    // Fallback to alert for testing
    alert(
      `OTP Code: ${otp}\n\nNote: In production, this would be sent via email.`
    )
    return true
  }
}

// Verify OTP
async function verifyOTP(email, otp) {
  try {
    const q = query(
      collection(db, 'otp_verification'),
      where('email', '==', email),
      where('otp', '==', otp),
      where('used', '==', false)
    )

    const querySnapshot = await getDocs(q)

    if (!querySnapshot.empty) {
      const otpDoc = querySnapshot.docs[0]
      const otpData = otpDoc.data()

      // Check if OTP is expired
      const now = new Date()
      const expiresAt = new Date(otpData.expires_at)

      if (now > expiresAt) {
        return {
          success: false,
          message: 'OTP has expired. Please request a new one.',
        }
      }

      // Mark OTP as used
      await deleteDoc(doc(db, 'otp_verification', otpDoc.id))

      return { success: true }
    } else {
      return { success: false, message: 'Invalid OTP. Please try again.' }
    }
  } catch (error) {
    console.error('Error verifying OTP:', error)
    return { success: false, message: 'Error verifying OTP. Please try again.' }
  }
}

// Get user seed phrase
async function getUserSeedPhrase(email) {
  try {
    const q = query(collection(db, 'users'), where('email', '==', email))

    const querySnapshot = await getDocs(q)

    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0]
      const userData = userDoc.data()

      if (userData.seedphrase) {
        return { success: true, seedphrase: userData.seedphrase }
      } else {
        return {
          success: false,
          message: 'No seed phrase found for this account.',
        }
      }
    } else {
      return {
        success: false,
        message: 'No account found with this email address.',
      }
    }
  } catch (error) {
    console.error('Error getting user seed phrase:', error)
    return {
      success: false,
      message: 'Error retrieving seed phrase. Please try again.',
    }
  }
}

// Start countdown timer
function startCountdown(seconds) {
  let timeLeft = seconds

  const updateCountdown = () => {
    const minutes = Math.floor(timeLeft / 60)
    const secs = timeLeft % 60
    countdown.textContent = `Resend available in ${minutes}:${secs
      .toString()
      .padStart(2, '0')}`

    if (timeLeft <= 0) {
      clearInterval(countdownTimer)
      countdown.textContent = ''
      resendOtpBtn.disabled = false
    }
    timeLeft--
  }

  updateCountdown()
  countdownTimer = setInterval(updateCountdown, 1000)
}

// Update step indicators
function updateStepIndicators(step) {
  // Reset all steps
  step1Indicator.className = 'step'
  step2Indicator.className = 'step'
  step3Indicator.className = 'step'

  // Set active and completed steps
  switch (step) {
    case 1:
      step1Indicator.classList.add('active')
      break
    case 2:
      step1Indicator.classList.add('completed')
      step2Indicator.classList.add('active')
      break
    case 3:
      step1Indicator.classList.add('completed')
      step2Indicator.classList.add('completed')
      step3Indicator.classList.add('active')
      break
  }
}

// Show step
function showStep(stepNumber) {
  // Hide all steps
  step1Form.classList.remove('active')
  step2Form.classList.remove('active')
  step3Form.classList.remove('active')

  // Show current step
  switch (stepNumber) {
    case 1:
      step1Form.classList.add('active')
      break
    case 2:
      step2Form.classList.add('active')
      break
    case 3:
      step3Form.classList.add('active')
      break
  }

  updateStepIndicators(stepNumber)
}

// Email form submission
emailForm.addEventListener('submit', async (e) => {
  e.preventDefault()

  const email = emailInput.value.trim()

  // Validate email
  if (!email) {
    showError(emailError, 'Email is required')
    return
  }

  if (!validateEmail(email)) {
    showError(emailError, 'Please enter a valid email address')
    return
  }

  hideError(emailError)

  // Check if user exists and has seed phrase
  const userCheck = await getUserSeedPhrase(email)
  if (!userCheck.success) {
    showError(emailError, userCheck.message)
    return
  }

  // Store email and seed phrase
  currentEmail = email
  userSeedPhrase = userCheck.seedphrase

  // Generate and send OTP
  const otp = generateOTP()
  currentOtp = otp

  emailBtn.disabled = true
  emailBtn.textContent = 'Sending...'

  const otpSent = await sendOTPEmail(email, otp)

  if (otpSent) {
    // Move to step 2
    showStep(2)

    // Start countdown
    startCountdown(300) // 5 minutes

    // Focus first OTP input
    otpInputs[0].focus()
  } else {
    showError(emailError, 'Failed to send OTP. Please try again.')
    emailBtn.disabled = false
    emailBtn.textContent = 'Send OTP'
  }
})

// OTP input handling
otpInputs.forEach((input, index) => {
  input.addEventListener('input', (e) => {
    const value = e.target.value

    if (value.length === 1) {
      input.classList.add('filled')

      // Move to next input
      if (index < otpInputs.length - 1) {
        otpInputs[index + 1].focus()
      }
    } else {
      input.classList.remove('filled')
    }

    // Check if all inputs are filled
    const allFilled = Array.from(otpInputs).every(
      (input) => input.value.length === 1
    )
    verifyOtpBtn.disabled = !allFilled
  })

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Backspace' && !input.value && index > 0) {
      otpInputs[index - 1].focus()
    }
  })
})

// Verify OTP button
verifyOtpBtn.addEventListener('click', async () => {
  const enteredOtp = Array.from(otpInputs)
    .map((input) => input.value)
    .join('')

  verifyOtpBtn.disabled = true
  verifyOtpBtn.textContent = 'Verifying...'

  const verification = await verifyOTP(currentEmail, enteredOtp)

  if (verification.success) {
    // Move to step 3
    showStep(3)
    hideError(otpError)
  } else {
    showError(otpError, verification.message)
    verifyOtpBtn.disabled = false
    verifyOtpBtn.textContent = 'Verify OTP'
  }
})

// Resend OTP button
resendOtpBtn.addEventListener('click', async () => {
  const otp = generateOTP()
  currentOtp = otp

  resendOtpBtn.disabled = true

  const otpSent = await sendOTPEmail(currentEmail, otp)

  if (otpSent) {
    // Clear OTP inputs
    otpInputs.forEach((input) => {
      input.value = ''
      input.classList.remove('filled')
    })

    // Reset verify button
    verifyOtpBtn.disabled = true
    verifyOtpBtn.textContent = 'Verify OTP'

    // Start countdown again
    startCountdown(300)

    // Focus first input
    otpInputs[0].focus()

    hideError(otpError)
  } else {
    showError(otpError, 'Failed to resend OTP. Please try again.')
    resendOtpBtn.disabled = false
  }
})

// Show seed phrase button
showSeedPhraseBtn.addEventListener('click', () => {
  // Display seed phrase in modal
  const seedWords = userSeedPhrase.split(' ')

  seedWordsContainer.innerHTML = ''
  seedWords.forEach((word, index) => {
    const wordElement = document.createElement('div')
    wordElement.className = 'seed-word'
    wordElement.innerHTML = `
      <span class="word-number">${index + 1}</span>
      ${word}
    `
    seedWordsContainer.appendChild(wordElement)
  })

  // Show modal
  seedPhraseModal.style.display = 'block'
})

// Copy seed phrase button
copySeedPhraseBtn.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(userSeedPhrase)

    // Show success feedback
    const originalText = copySeedPhraseBtn.innerHTML
    copySeedPhraseBtn.innerHTML =
      '<ion-icon name="checkmark-outline"></ion-icon> Copied!'
    copySeedPhraseBtn.style.background = '#28a745'

    setTimeout(() => {
      copySeedPhraseBtn.innerHTML = originalText
      copySeedPhraseBtn.style.background = '#6c757d'
    }, 2000)
  } catch (error) {
    console.error('Failed to copy:', error)
    alert('Failed to copy to clipboard. Please copy manually.')
  }
})

// Close modal button
closeModalBtn.addEventListener('click', () => {
  seedPhraseModal.style.display = 'none'
  // Navigate back to login page
  window.location.href = 'index.html'
})

// Close modal when clicking outside
window.addEventListener('click', (event) => {
  if (event.target === seedPhraseModal) {
    seedPhraseModal.style.display = 'none'
    // Navigate back to login page
    window.location.href = 'index.html'
  }
})

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  // Focus email input
  emailInput.focus()
})
