// Import Firebase functions
import { auth } from '../../js/firebase-config.js'
import {
  signOut,
  onAuthStateChanged,
} from 'https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js'

// Navigation functionality
let toggle = document.querySelector('.toggle')
let navigation = document.querySelector('.navigation')
let main = document.querySelector('.main')

const cardBox = document.querySelector('.cardBox')
const transactionTable = document.querySelector('.recentOrders tbody')
const totalPortfolioBox = document.querySelectorAll('.card .numbers')[3] // Last card (Total Portfolio)
const API_URL =
  'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false'

const options = {
  method: 'GET',
  headers: {
    accept: 'application/json',
  },
}

// Check authentication state on page load
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log('User is signed in:', user.uid)
    // Update user info in the dashboard
    updateUserInfo(user)
  } else {
    console.log('No user signed in, redirecting to login...')
    // Redirect to login page if not authenticated
    window.location.href = '../index.html'
  }
})

// Update user information in the dashboard
function updateUserInfo(user) {
  try {
    // Get user data from localStorage
    const userData = JSON.parse(localStorage.getItem('currentUser') || '{}')

    // Update profile information
    const profileName = document.querySelector('.profile-info h2')
    const profileEmail = document.querySelector('.profile-info p strong')

    if (profileName) {
      profileName.textContent = userData.full_name || user.displayName || 'User'
    }

    if (profileEmail) {
      profileEmail.textContent = userData.email || user.email || 'No email'
    }

    // Update form fields
    const fullNameInput = document.getElementById('fullName')
    const emailInput = document.getElementById('email')

    if (fullNameInput) {
      fullNameInput.value = userData.full_name || user.displayName || ''
    }

    if (emailInput) {
      emailInput.value = userData.email || user.email || ''
    }
  } catch (error) {
    console.error('Error updating user info:', error)
  }
}

function fetchCryptoData() {
  fetch(API_URL, options)
    .then((res) => {
      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`)
      }
      return res.json()
    })
    .then((data) => {
      console.log(data) // Displays top 10 coins (name, symbol, price, icon, etc.)
      // Example: show first coin name and icon
      console.log('Example Coin:', data[0].name, data[0].image)
    })
    .catch((err) => {
      console.error('Error fetching CoinGecko data:', err)
    })
}

fetchCryptoData()

function formatPrice(price) {
  return '$' + price.toLocaleString(undefined, { minimumFractionDigits: 2 })
}

function createCardHTML(coin) {
  return `
    <div class="card animated-card">
      <div>
        <div class="numbers">${formatPrice(coin.current_price)}</div>
        <div class="cap_numbers">${formatPrice(coin.market_cap)}</div>
        <div class="cardName">${coin.name}</div>
      </div>
      <div class="iconBx">
        <img src="${coin.image}" alt="${
    coin.name
  }" style="width: 30px; height: 30px;">
      </div>
    </div>
  `
}

function createTransactionRowHTML(coin) {
  return `
    <tr>
      <td>
        <img src="${coin.image}" alt="${
    coin.name
  }" style="width: 20px; vertical-align: middle; margin-right: 6px;">
        ${coin.name} (${coin.symbol.toUpperCase()})
      </td>
      <td>${(coin.total_volume / coin.current_price).toFixed(
        3
      )} ${coin.symbol.toUpperCase()}</td>
    </tr>
  `
}

function updateDashboard() {
  fetch(API_URL)
    .then((res) => res.json())
    .then((data) => {
      // Replace card content
      cardBox.innerHTML = ''
      let totalPortfolio = 0
      data.forEach((coin) => {
        totalPortfolio += coin.current_price
        cardBox.innerHTML += createCardHTML(coin)
      })

      // Add Total Portfolio Card at the end
      cardBox.innerHTML += `
        <div class="card animated-card">
          <div>
            <div class="numbers">${formatPrice(totalPortfolio)}</div>
            <div class="cardName">Total Portfolio</div>
          </div>
          <div class="iconBx">
            <ion-icon name="trending-up-outline"></ion-icon>
          </div>
        </div>
      `

      // Update transaction table
      transactionTable.innerHTML = ''
      data.forEach((coin) => {
        transactionTable.innerHTML += createTransactionRowHTML(coin)
      })
    })
    .catch((err) => {
      console.error('Error fetching crypto data:', err)
    })
}

// Refresh button
const refreshBtn = document.createElement('button')
refreshBtn.textContent = '🔄 Refresh Data'
refreshBtn.className = 'btn refresh-btn'
refreshBtn.onclick = updateDashboard
document.querySelector('.cardHeader').appendChild(refreshBtn)

// Initial load
updateDashboard()

toggle.onclick = function () {
  navigation.classList.toggle('active')
  main.classList.toggle('active')
}

// Add hovered class to selected list item
let list = document.querySelectorAll('.navigation li')
function activeLink() {
  list.forEach((item) => {
    item.classList.remove('hovered')
  })
  this.classList.add('hovered')
}

list.forEach((item) => item.addEventListener('mouseover', activeLink))

// Content switching functionality
function showContent(contentId) {
  // Hide all content sections
  const sections = document.querySelectorAll('.content-section')
  sections.forEach((section) => {
    section.classList.remove('active')
  })

  // Show selected content section
  document.getElementById(contentId).classList.add('active')

  // Update navigation active state
  const navLinks = document.querySelectorAll('.navigation ul li')
  navLinks.forEach((link) => {
    link.classList.remove('hovered')
  })

  // Add active state to clicked nav item
  event.target.closest('li').classList.add('hovered')

  // Close mobile menu if open
  if (window.innerWidth <= 991) {
    navigation.classList.remove('active')
    main.classList.remove('active')
  }
}

// Firebase Logout functionality
async function logout() {
  try {
    console.log('Logout function called')

    if (confirm('Are you sure you want to sign out?')) {
      console.log('User confirmed logout')

      // Check if auth is available
      if (!auth) {
        console.error('Firebase auth not initialized')
        alert('Authentication service not available. Please refresh the page.')
        return
      }

      console.log('Signing out from Firebase...')

      // Sign out from Firebase
      await signOut(auth)

      console.log('User signed out successfully')

      // Clear user data from localStorage
      localStorage.removeItem('currentUser')
      localStorage.removeItem('emailForSignIn')

      console.log('LocalStorage cleared')

      // Show success message
      alert('Signed out successfully!')

      // Redirect to login page
      console.log('Redirecting to login page...')
      window.location.href = '../index.html'
    } else {
      console.log('User cancelled logout')
    }
  } catch (error) {
    console.error('Error during logout:', error)
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack,
    })

    // Show user-friendly error message
    let errorMessage = 'Error signing out. Please try again.'

    if (error.code === 'auth/network-request-failed') {
      errorMessage = 'Network error. Please check your internet connection.'
    } else if (error.code === 'auth/operation-not-allowed') {
      errorMessage = 'Sign out is not allowed. Please contact support.'
    }

    alert(errorMessage)
  }
}

// Make logout function globally accessible
window.logout = logout

// Set dashboard as default active
document.addEventListener('DOMContentLoaded', function () {
  showContent('dashboard')
})

// Handle form submissions
document.addEventListener('submit', function (e) {
  e.preventDefault()
  alert('Settings saved successfully!')
})
