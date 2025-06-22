const togglePassword = document.getElementById("togglePassword");
const passwordInput = document.getElementById("password");

togglePassword.addEventListener("click", function () {
  const type = passwordInput.type === "password" ? "text" : "password";
  passwordInput.type = type;

  // Toggle eye icon
  this.classList.toggle("uil-eye");
  this.classList.toggle("uil-eye-slash");
});

// Form validation and submission
const loginForm = document.getElementById("loginForm");
const loginBtn = document.getElementById("loginBtn");
const emailInput = document.getElementById("email");
const emailError = document.getElementById("emailError");
const passwordError = document.getElementById("passwordError");

// Email validation
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// Show error message
function showError(input, errorElement, message) {
  input.classList.add("error");
  errorElement.textContent = message;
  errorElement.classList.add("show");
}

// Hide error message
function hideError(input, errorElement) {
  input.classList.remove("error");
  errorElement.classList.remove("show");
}

// Real-time validation
emailInput.addEventListener("blur", function () {
  const email = this.value.trim();
  if (email && !validateEmail(email)) {
    showError(this, emailError, "Please enter a valid email address");
  } else {
    hideError(this, emailError);
  }
});

passwordInput.addEventListener("blur", function () {
  const password = this.value;
  if (password && password.length < 6) {
    showError(this, passwordError, "Password must be at least 6 characters");
  } else {
    hideError(this, passwordError);
  }
});

// Form submission
loginForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const email = emailInput.value.trim();
  const password = passwordInput.value;
  let isValid = true;

  // Validate email
  if (!email) {
    showError(emailInput, emailError, "Email is required");
    isValid = false;
  } else if (!validateEmail(email)) {
    showError(emailInput, emailError, "Please enter a valid email address");
    isValid = false;
  } else {
    hideError(emailInput, emailError);
  }

  // Validate password
  if (!password) {
    showError(passwordInput, passwordError, "Password is required");
    isValid = false;
  } else if (password.length < 6) {
    showError(
      passwordInput,
      passwordError,
      "Password must be at least 6 characters"
    );
    isValid = false;
  } else {
    hideError(passwordInput, passwordError);
  }

  if (isValid) {
    // Show loading state
    loginBtn.classList.add("loading");
    loginBtn.disabled = true;

    // Simulate API call
    setTimeout(() => {
      loginBtn.classList.remove("loading");
      loginBtn.disabled = false;
      // alert("Login functionality would be implemented here!");
      window.location.replace("/dashboard/index.html");
    }, 2000);
  }
});

// Add focus effects
document.querySelectorAll(".form-input").forEach((input) => {
  input.addEventListener("focus", function () {
    this.parentElement.classList.add("focused");
  });

  input.addEventListener("blur", function () {
    this.parentElement.classList.remove("focused");
  });
});
