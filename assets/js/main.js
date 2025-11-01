/* ===========================================================
   MAIN.JS - JavaScript for the entire project
   Sections:
   1. Home Page (index.html)
   2. Registration Page (register.html)
   3. Login Page (login.html)
   4. Password Reset Page (password.html) [if applicable]
============================================================ */

/* ================================
   1. HOME PAGE SCRIPTS (index.html)
=================================== */
if (document.body.classList.contains("home-page")) {
  // Smooth scroll for homepage anchors
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (e) => {
      e.preventDefault();
      const target = document.querySelector(anchor.getAttribute("href"));
      if (target) target.scrollIntoView({ behavior: "smooth" });
    });
  });
}

// Scroll to top button
const scrollBtn = document.getElementById("scrollTopBtn");
window.onscroll = function () {
  if (
    document.body.scrollTop > 100 ||
    document.documentElement.scrollTop > 100
  ) {
    scrollBtn.style.display = "block";
  } else {
    scrollBtn.style.display = "none";
  }
};

if (scrollBtn) {
  scrollBtn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

/* ================================
   2. PASSWORD
=================================== */

function setupPasswordValidation(passwordInput, confirmInput = null) {
  const wrapper = passwordInput.closest(".password-wrapper");

  // Create popup container
  const popup = document.createElement("div");
  popup.classList.add("password-feedback");

  // Strength bar
  const strengthBar = document.createElement("div");
  strengthBar.classList.add("password-strength-bar");

  // Criteria checks
  const criteriaContainer = document.createElement("div");
  criteriaContainer.classList.add("password-criteria");
  const criteriaLabels = [
    "8+ chars",
    "Uppercase",
    "Lowercase",
    "Number",
    "Symbol",
  ];
  criteriaLabels.forEach((label) => {
    const span = document.createElement("span");
    span.textContent = `❌ ${label}`;
    criteriaContainer.appendChild(span);
  });

  popup.append(strengthBar, criteriaContainer);
  wrapper.appendChild(popup);

  // Show popup on focus, hide on blur
  passwordInput.addEventListener("focus", () => (popup.style.display = "flex"));
  passwordInput.addEventListener("blur", () => (popup.style.display = "none"));

  // Create match message once if confirm password exists
  if (confirmInput) {
    const matchMessage = document.createElement("small");
    matchMessage.classList.add("confirm-message");
    matchMessage.textContent = ""; // empty initially
    matchMessage.style.fontSize = "10px";
    matchMessage.style.color = "#e74c3c";

    // Absolutely position it below the input, independent of flex
    matchMessage.style.position = "absolute";
    matchMessage.style.left = "0";
    matchMessage.style.top = `${confirmInput.offsetHeight + 4}px`; // 4px below input
    matchMessage.style.width = "100%";
    matchMessage.style.pointerEvents = "none"; // so it doesn't block the eye icon

    // Make parent relative so absolute works
    const wrapper = confirmInput.closest(".password-wrapper");
    wrapper.style.position = "relative";

    wrapper.appendChild(matchMessage);

    // Show/hide on focus/blur
    confirmInput.addEventListener(
      "focus",
      () => (matchMessage.style.display = "block")
    );
    confirmInput.addEventListener(
      "blur",
      () => (matchMessage.style.display = "none")
    );

    // Update text while typing
    confirmInput.addEventListener("input", () =>
      checkPasswordMatch(passwordInput, confirmInput)
    );
  }

  // Update on input
  passwordInput.addEventListener("input", () => {
    const value = passwordInput.value;
    const checks = [
      value.length >= 8,
      /[A-Z]/.test(value),
      /[a-z]/.test(value),
      /\d/.test(value),
      /[^A-Za-z0-9]/.test(value),
    ];

    // Update strength bar
    const score = checks.filter(Boolean).length;
    const colors = ["#e74c3c", "#f39c12", "#27ae60", "#2ecc71"];
    const width = (score / checks.length) * 100;
    strengthBar.style.width = `${width}%`;
    strengthBar.style.background =
      score === 0 ? "#ccc" : colors[Math.min(score - 1, colors.length - 1)];

    // Update criteria checkmarks
    const spans = criteriaContainer.querySelectorAll("span");
    spans.forEach((span, index) => {
      span.textContent = `${checks[index] ? "✅" : "❌"} ${
        criteriaLabels[index]
      }`;
      span.style.color = checks[index] ? "#27ae60" : "#666";
    });

    // Update confirm password match while typing
    if (confirmInput && matchMessage) {
      checkPasswordMatch(passwordInput, confirmInput);
    }
  });
}

// Function to check if password and confirm password match
function checkPasswordMatch(passwordInput, confirmInput) {
  const message = confirmInput
    .closest(".password-wrapper")
    .querySelector(".confirm-message");

  if (!confirmInput.value) {
    message.textContent = "";
    return;
  }

  if (passwordInput.value === confirmInput.value) {
    message.textContent = "✅ Match";
    message.style.color = "#27ae60";
  } else {
    message.textContent = "❌ Not a match";
    message.style.color = "#e74c3c";
  }
}

// Toggle password visibility
function togglePassword(inputId, iconElement) {
  const input = document.getElementById(inputId);
  if (!input || !iconElement) return;

  const isHidden = input.type === "password";
  input.type = isHidden ? "text" : "password";

  if (isHidden) {
    iconElement.src = "assets/images/eye-password-show.png";
    iconElement.alt = "Hide password";
    iconElement.classList.add("eye-open");
  } else {
    iconElement.src = "assets/images/eye-password-hidden.png";
    iconElement.alt = "Show password";
    iconElement.classList.remove("eye-open");
  }
}

/* ================================
   2. REGISTRATION PAGE SCRIPTS (register.html)
=================================== */
if (document.body.classList.contains("register-page")) {
  const registerForm = document.getElementById("registerForm");
  const password = document.getElementById("password");
  const confirmPassword = document.getElementById("confirm-password");
  const toggleIcons = document.querySelectorAll(".toggle-password");
  const dobInput = document.getElementById("dob");

  // DOB restriction
  if (dobInput) {
    const today = new Date();
    const minAge = 11;
    const maxDate = new Date(
      today.getFullYear() - minAge,
      today.getMonth(),
      today.getDate()
    );
    dobInput.setAttribute("max", maxDate.toISOString().split("T")[0]);
  }

  // Toggle password visibility
  toggleIcons.forEach((icon) => {
    icon.addEventListener("click", () => {
      const inputId = icon.dataset.target;
      togglePassword(inputId, icon);
    });
  });

  // Initialize password validation
  if (password) setupPasswordValidation(password, confirmPassword);

  // Confirm password match on submit
  if (registerForm) {
    registerForm.addEventListener("submit", (e) => {
      if (password.value !== confirmPassword.value) {
        e.preventDefault();
        alert("Passwords do not match.");
      }
    });
  }
}

/* ================================
   3. LOGIN PAGE SCRIPTS (login.html)
=================================== */

if (document.body.classList.contains("login-page")) {
  const loginForm = document.getElementById("loginForm");
  const password = document.getElementById("password");
  const toggleIcons = document.querySelectorAll(".toggle-password");

  // Show/hide password
  toggleIcons.forEach((icon) => {
    icon.addEventListener("click", () => {
      const inputId = icon.dataset.target;
      togglePassword(inputId, icon);
    });
  });

  // Password validation + strength meter
  if (password) setupPasswordValidation(password);

  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      const username = loginForm.querySelector('input[name="username"]');
      const password = loginForm.querySelector('input[name="password"]');
      if (!username.value.trim() || !password.value.trim()) {
        e.preventDefault();
        alert("Please enter both username and password.");
      }
    });
  }
}

/* ================================
   7. DASHBOARD PAGE SCRIPTS (dashboard.html)
=================================== */

// Display user first name
document.addEventListener("DOMContentLoaded", () => {
  // Example: you get the user's first name (hardcoded here for demo)
  const userFirstName = "John"; // Replace with real data fetch or localStorage retrieval

  // Select the element with the placeholder
  const firstNameElem = document.getElementById("user-firstname");

  if (firstNameElem && userFirstName) {
    firstNameElem.textContent = userFirstName;
  }
});

// Menu(SideBar) toggle (light/dark)
function toggleSidebar() {
  const sidebar = document.querySelector(".sidebar");
  const collapseBtn = document.querySelector(".collapse-btn");
  const expandBtn = document.querySelector(".expand-btn");

  sidebar.classList.toggle("collapsed");

  if (sidebar.classList.contains("collapsed")) {
    collapseBtn.style.display = "none";
    expandBtn.style.display = "inline-block";
  } else {
    collapseBtn.style.display = "inline-block";
    expandBtn.style.display = "none";
  }
}

// Theme toggle (light/dark)
const themeToggleBtn = document.querySelector(".toggle-theme");
if (themeToggleBtn) {
  themeToggleBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark-theme");
    // Optionally store preference in localStorage
    if (document.body.classList.contains("dark-theme")) {
      localStorage.setItem("theme", "dark");
    } else {
      localStorage.setItem("theme", "light");
    }
  });

  // On page load: apply stored theme preference
  window.addEventListener("DOMContentLoaded", () => {
    const storedTheme = localStorage.getItem("theme");
    if (storedTheme === "dark") {
      document.body.classList.add("dark-theme");
    }
  });
}
