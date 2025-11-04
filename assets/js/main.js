/* ===========================================================
   MAIN.JS - JavaScript for the entire project
   Sections:
   1. Universal Alert System
   2. Home Page (index.html)
   3. Registration Page (register.html)
   4. Login Page (login.html)
   5. Password Utilities
   6. Dashboard Page (dashboard.html)
   7. Google Analytics
============================================================ */

/* ===========================================================
   1. UNIVERSAL ALERT SYSTEM
   - Handles notifications throughout the site
   - Can be called from ANY page, anytime.
============================================================ */
function showAlert(message, type = "info", duration = 4000) {
  // Find the container
  let alertContainer = document.querySelector(".page-alert-container");

  // If container doesn't exist, create it at top of body
  if (!alertContainer) {
    alertContainer = document.createElement("div");
    alertContainer.className = "page-alert-container";
    alertContainer.style.position = "fixed";
    alertContainer.style.top = "20px";
    alertContainer.style.left = "50%";
    alertContainer.style.transform = "translateX(-50%)";
    alertContainer.style.display = "flex";
    alertContainer.style.flexDirection = "column";
    alertContainer.style.alignItems = "center";
    alertContainer.style.gap = "12px";
    alertContainer.style.zIndex = "9999";
    alertContainer.style.pointerEvents = "none"; // allow clicks to pass through
    document.body.appendChild(alertContainer);
  }

  // Create alert element
  const alert = document.createElement("div");
  alert.className = `page-alert ${type}`;
  alert.style.pointerEvents = "auto"; // enable click on close button
  alert.innerHTML = `
    <div class="alert-message">${message}</div>
    <button class="alert-close">&times;</button>
  `;

  alertContainer.appendChild(alert);

  // Trigger CSS animation
  setTimeout(() => alert.classList.add("show"), 50);

  // Close button handler
  alert.querySelector(".alert-close").addEventListener("click", () => {
    dismissAlert(alert);
  });

  // Auto dismiss after duration
  setTimeout(() => dismissAlert(alert), duration);
}

function dismissAlert(alert) {
  alert.classList.remove("show");
  alert.classList.add("fade-out");
  setTimeout(() => {
    if (alert && alert.parentNode) alert.parentNode.removeChild(alert);
  }, 600);
}

/* ================================
    2. HOME PAGE SCRIPTS (index.html)
=================================== */
if (document.body.classList.contains("home-page")) {
  // Smooth scroll for anchors
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (e) => {
      e.preventDefault();
      const target = document.querySelector(anchor.getAttribute("href"));
      if (target) target.scrollIntoView({ behavior: "smooth" });
    });
  });

  // Scroll-to-top button
  const scrollBtn = document.getElementById("scrollTopBtn");
  window.onscroll = () => {
    if (scrollBtn) {
      if (
        document.body.scrollTop > 100 ||
        document.documentElement.scrollTop > 100
      ) {
        scrollBtn.style.display = "block";
      } else {
        scrollBtn.style.display = "none";
      }
    }
  };

  if (scrollBtn) {
    scrollBtn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }
}

/* ================================
  3. PASSWORD UTILITIES (used on register/login pages)
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

/* ==============================================
    4. REGISTRATION PAGE SCRIPTS (register.html)
================================================= */
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

  // Password toggle
  toggleIcons.forEach((icon) => {
    icon.addEventListener("click", () => {
      togglePassword(icon.dataset.target, icon);
    });
  });

  // Initialize password validation
  if (password) setupPasswordValidation(password, confirmPassword);

  // Form submission via AJAX
  if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      if (password.value !== confirmPassword.value) {
        showAlert("❌ Passwords do not match.", "error");
        return;
      }

      if (!registerForm.checkValidity()) {
        showAlert("⚠️ Please fill in all required fields.", "info");
        return;
      }

      const formData = new FormData(registerForm);

      try {
        const response = await fetch("register.php", {
          method: "POST",
          body: formData,
        });
        const result = await response.json();

        if (result.success) {
          showAlert("🎉 Registration successful! Kindly log in.", "success");
          setTimeout(() => {
            window.location.href = "login.html?registered=1";
          }, 2000);
        } else {
          showAlert("❌ Registration failed: " + result.message, "error");
        }
      } catch (error) {
        console.error("Registration error:", error);
        showAlert("❌ Network or server error. Please try again.", "error");
      }

      if (!registerForm.checkValidity()) {
        e.preventDefault();
        showAlert("⚠️ Please fill in all required fields.", "info");
        return;
      }

      // If you connect to backend later (PHP), you can handle:
      // success or error from backend response here
      // Example (temporary demo):
      e.preventDefault();
      showAlert("🎉 Registration successful! Welcome aboard.", "success");
    });
  }
}

/* ===================================
   5. LOGIN PAGE SCRIPTS (login.html)
===================================== */

if (document.body.classList.contains("login-page")) {
  const loginForm = document.getElementById("loginForm");
  const password = document.getElementById("password");
  const toggleIcons = document.querySelectorAll(".toggle-password");

  // --- Show/hide password  ---
  toggleIcons.forEach((icon) => {
    icon.addEventListener("click", () => {
      const inputId = icon.dataset.target;
      togglePassword(inputId, icon);
    });
  });

  // --- Password validation + strength meter  ---
  if (password) setupPasswordValidation(password);

  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const emailInput = loginForm.querySelector('input[name="email"]'); // unified field name
      const passwordInput = loginForm.querySelector('input[name="password"]');
      const submitBtn = loginForm.querySelector('button[type="submit"]');

      // --- Validate required fields ---
      if (!emailInput.value.trim() || !passwordInput.value.trim()) {
        showAlert("⚠️ Please enter both email and password.", "info");
        return;
      }

      try {
        submitBtn.disabled = true; // prevent multiple submissions

        const formData = new FormData(loginForm);
        const response = await fetch("login.php", {
          method: "POST",
          body: formData,
        });

        const result = await response.json();

        if (result.success) {
          // --- Personalized success message ---
          const name = result.firstname ? result.firstname : "";
          const message = name
            ? `✅ Login successful! Welcome back, ${name}!`
            : "✅ Login successful!";

          showAlert(message, "success");

          // --- Redirect after short delay ---
          setTimeout(() => {
            window.location.href = "dashboard.php";
          }, 1500);
        } else {
          showAlert(`❌ ${result.message}`, "error");
        }
      } catch (error) {
        console.error("Login error:", error);
        showAlert("❌ Network or server error. Please try again.", "error");
      } finally {
        submitBtn.disabled = false;
      }
    });
  }
}

/* ====== LOGIN PAGE URL ALERTS ===== */

(function () {
  if (!document.body.classList.contains("login-page")) return;

  const urlParams = new URLSearchParams(window.location.search);

  // ✅ Logout alert
  if (urlParams.get("logout") === "1") {
    showAlert("✅ Logged out.", "success");
    const cleanUrl = window.location.href.split("?")[0];
    window.history.replaceState({}, document.title, cleanUrl);
  }

  // 🎉 Registration success
  if (urlParams.get("registered") === "1") {
    showAlert("🎉 Registration successful! Please log in.", "success");
    const cleanUrl = window.location.href.split("?")[0];
    window.history.replaceState({}, document.title, cleanUrl);
  }

  // ⚠️ Session expired
  if (urlParams.get("sessionexpired") === "1") {
    showAlert("⚠️ Your session has expired. Please log in again.", "info");
    const cleanUrl = window.location.href.split("?")[0];
    window.history.replaceState({}, document.title, cleanUrl);
  }
})();
/* ===========================================
   6. DASHBOARD PAGE SCRIPTS (dashboard.html)
============================================== */

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

/* ================================
   7. Google analytics track Tag
=================================== */
window.dataLayer = window.dataLayer || [];
function gtag() {
  dataLayer.push(arguments);
}
gtag("js", new Date());

gtag("config", "G-KGV5ZELN62");
