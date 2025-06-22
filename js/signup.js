// Form elements
const signupForm = document.getElementById("signupForm");
const signupBtn = document.getElementById("signupBtn");
const fullNameInput = document.getElementById("fullName");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const confirmPasswordInput = document.getElementById("confirmPassword");
const agreeTermsCheckbox = document.getElementById("agreeTerms");

// Error elements
const nameError = document.getElementById("nameError");
const emailError = document.getElementById("emailError");
const emailSuccess = document.getElementById("emailSuccess");
const passwordError = document.getElementById("passwordError");
const confirmPasswordError = document.getElementById("confirmPasswordError");
const confirmPasswordSuccess = document.getElementById(
  "confirmPasswordSuccess"
);

// Password strength elements
const passwordStrength = document.getElementById("passwordStrength");
const strengthFill = document.getElementById("strengthFill");
const strengthText = document.getElementById("strengthText");

// Password toggle functionality
const togglePassword = document.getElementById("togglePassword");
const toggleConfirmPassword = document.getElementById("toggleConfirmPassword");

togglePassword.addEventListener("click", function () {
  togglePasswordVisibility(passwordInput, this);
});

toggleConfirmPassword.addEventListener("click", function () {
  togglePasswordVisibility(confirmPasswordInput, this);
});

function togglePasswordVisibility(input, toggle) {
  const type = input.type === "password" ? "text" : "password";
  input.type = type;
  toggle.classList.toggle("uil-eye");
  toggle.classList.toggle("uil-eye-slash");
}

// Validation functions
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function validatePassword(password) {
  return password.length >= 8;
}

function calculatePasswordStrength(password) {
  let score = 0;
  let feedback = "";

  if (password.length >= 8) score++;
  if (password.match(/[a-z]/)) score++;
  if (password.match(/[A-Z]/)) score++;
  if (password.match(/[0-9]/)) score++;
  if (password.match(/[^a-zA-Z0-9]/)) score++;

  switch (score) {
    case 0:
    case 1:
      return { strength: "weak", text: "Weak password" };
    case 2:
      return { strength: "fair", text: "Fair password" };
    case 3:
    case 4:
      return { strength: "good", text: "Good password" };
    case 5:
      return { strength: "strong", text: "Strong password" };
    default:
      return { strength: "weak", text: "Weak password" };
  }
}

function showError(input, errorElement, message) {
  input.classList.add("error");
  input.classList.remove("success");
  errorElement.textContent = message;
  errorElement.classList.add("show");
}

function showSuccess(input, successElement) {
  input.classList.add("success");
  input.classList.remove("error");
  if (successElement) {
    successElement.classList.add("show");
  }
}

function hideError(input, errorElement) {
  input.classList.remove("error");
  errorElement.classList.remove("show");
}

function hideSuccess(successElement) {
  if (successElement) {
    successElement.classList.remove("show");
  }
}

// Real-time validation
fullNameInput.addEventListener("blur", function () {
  const name = this.value.trim();
  if (!name) {
    showError(this, nameError, "Please enter your full name");
  } else if (name.length < 2) {
    showError(this, nameError, "Name must be at least 2 characters");
  } else {
    hideError(this, nameError);
    showSuccess(this);
  }
});

emailInput.addEventListener("blur", function () {
  const email = this.value.trim();
  if (!email) {
    showError(this, emailError, "Email is required");
    hideSuccess(emailSuccess);
  } else if (!validateEmail(email)) {
    showError(this, emailError, "Please enter a valid email address");
    hideSuccess(emailSuccess);
  } else {
    hideError(this, emailError);
    showSuccess(this, emailSuccess);
  }
});

passwordInput.addEventListener("input", function () {
  const password = this.value;

  if (password.length > 0) {
    passwordStrength.classList.add("show");
    const result = calculatePasswordStrength(password);

    strengthFill.className = `strength-fill ${result.strength}`;
    strengthText.className = `strength-text ${result.strength}`;
    strengthText.textContent = result.text;

    if (validatePassword(password)) {
      hideError(this, passwordError);
      showSuccess(this);
    } else {
      showError(this, passwordError, "Password must be at least 8 characters");
    }
  } else {
    passwordStrength.classList.remove("show");
    hideError(this, passwordError);
    this.classList.remove("success");
  }

  // Revalidate confirm password if it has a value
  if (confirmPasswordInput.value) {
    validateConfirmPassword();
  }
});

function validateConfirmPassword() {
  const password = passwordInput.value;
  const confirmPassword = confirmPasswordInput.value;

  if (!confirmPassword) {
    showError(
      confirmPasswordInput,
      confirmPasswordError,
      "Please confirm your password"
    );
    hideSuccess(confirmPasswordSuccess);
    return false;
  } else if (password !== confirmPassword) {
    showError(
      confirmPasswordInput,
      confirmPasswordError,
      "Passwords do not match"
    );
    hideSuccess(confirmPasswordSuccess);
    return false;
  } else {
    hideError(confirmPasswordInput, confirmPasswordError);
    showSuccess(confirmPasswordInput, confirmPasswordSuccess);
    return true;
  }
}

confirmPasswordInput.addEventListener("blur", validateConfirmPassword);
confirmPasswordInput.addEventListener("input", validateConfirmPassword);

// Form submission
signupForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const fullName = fullNameInput.value.trim();
  const email = emailInput.value.trim();
  const password = passwordInput.value;
  const confirmPassword = confirmPasswordInput.value;
  const agreeTerms = agreeTermsCheckbox.checked;

  let isValid = true;

  // Validate full name
  if (!fullName) {
    showError(fullNameInput, nameError, "Please enter your full name");
    isValid = false;
  } else if (fullName.length < 2) {
    showError(fullNameInput, nameError, "Name must be at least 2 characters");
    isValid = false;
  }

  // Validate email
  if (!email) {
    showError(emailInput, emailError, "Email is required");
    hideSuccess(emailSuccess);
    isValid = false;
  } else if (!validateEmail(email)) {
    showError(emailInput, emailError, "Please enter a valid email address");
    hideSuccess(emailSuccess);
    isValid = false;
  }

  // Validate password
  if (!password) {
    showError(passwordInput, passwordError, "Password is required");
    isValid = false;
  } else if (!validatePassword(password)) {
    showError(
      passwordInput,
      passwordError,
      "Password must be at least 8 characters"
    );
    isValid = false;
  }

  // Validate confirm password
  if (!validateConfirmPassword()) {
    isValid = false;
  }

  // Validate terms agreement
  if (!agreeTerms) {
    alert("Please agree to the Terms of Service and Privacy Policy");
    isValid = false;
  }

  if (isValid) {
    // Show loading state
    signupBtn.classList.add("loading");
    signupBtn.disabled = true;

    // Simulate account creation
    setTimeout(() => {
      signupBtn.classList.remove("loading");
      signupBtn.disabled = false;

      // In a real app, you would integrate with Firebase here
      alert(
        "Account created successfully! Please check your email for verification."
      );

      // Redirect to login page or dashboard
      window.location.href = "login.html";
    }, 2500);
  }
});

// Google signup
document.getElementById("googleSignup").addEventListener("click", function (e) {
  e.preventDefault();
  // In a real app, this would trigger Google OAuth
  alert("Google signup would be implemented here with Firebase Auth!");
});

// Check terms agreement to enable/disable submit button
function updateSubmitButton() {
  const agreeTerms = agreeTermsCheckbox.checked;
  signupBtn.disabled = !agreeTerms;
}

agreeTermsCheckbox.addEventListener("change", updateSubmitButton);

// Initial state
updateSubmitButton();
