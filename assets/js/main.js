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
  // Smooth scroll for all in-page anchor links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (e) => {
      e.preventDefault();
      const target = document.querySelector(anchor.getAttribute("href"));
      if (target) target.scrollIntoView({ behavior: "smooth" });
    });
  });

  // Scroll-to-top button behavior
  const scrollBtn = document.getElementById("scrollTopBtn");

  // Toggle visibility of the scroll button based on scroll position
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

  // Smoothly scroll back to top when button is clicked
  if (scrollBtn) {
    scrollBtn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }
}

/* ================================
   3. PASSWORD UTILITIES
   - Handles password strength, validation,
     match checking, and visibility toggling.
=================================== */
function setupPasswordValidation(passwordInput, confirmInput = null) {
  const wrapper = passwordInput.closest(".password-wrapper");

  // Create password feedback popup container
  const popup = document.createElement("div");
  popup.classList.add("password-feedback");

  // Password strength bar element
  const strengthBar = document.createElement("div");
  strengthBar.classList.add("password-strength-bar");

  // Criteria checklist container
  const criteriaContainer = document.createElement("div");
  criteriaContainer.classList.add("password-criteria");

  // Define password requirements
  const criteriaLabels = [
    "8+ chars",
    "Uppercase",
    "Lowercase",
    "Number",
    "Symbol",
  ];

  // Create checklist items with default ❌ indicators
  criteriaLabels.forEach((label) => {
    const span = document.createElement("span");
    span.textContent = `❌ ${label}`;
    criteriaContainer.appendChild(span);
  });

  // Combine strength bar and checklist into popup
  popup.append(strengthBar, criteriaContainer);
  wrapper.appendChild(popup);

  // Show/hide popup on input focus/blur
  passwordInput.addEventListener("focus", () => (popup.style.display = "flex"));
  passwordInput.addEventListener("blur", () => (popup.style.display = "none"));

  // Add confirm password match checker if applicable
  if (confirmInput) {
    const matchMessage = document.createElement("small");
    matchMessage.classList.add("confirm-message");
    matchMessage.textContent = "";
    matchMessage.style.fontSize = "10px";
    matchMessage.style.color = "#e74c3c";
    matchMessage.style.position = "absolute";
    matchMessage.style.left = "0";
    matchMessage.style.top = `${confirmInput.offsetHeight + 4}px`;
    matchMessage.style.width = "100%";
    matchMessage.style.pointerEvents = "none";

    // Position parent wrapper for absolute placement
    const wrapper = confirmInput.closest(".password-wrapper");
    wrapper.style.position = "relative";
    wrapper.appendChild(matchMessage);

    // Show/hide match message and check in real-time
    confirmInput.addEventListener(
      "focus",
      () => (matchMessage.style.display = "block")
    );
    confirmInput.addEventListener(
      "blur",
      () => (matchMessage.style.display = "none")
    );
    confirmInput.addEventListener("input", () =>
      checkPasswordMatch(passwordInput, confirmInput)
    );
  }

  // Evaluate password strength and update visuals dynamically
  passwordInput.addEventListener("input", () => {
    const value = passwordInput.value;

    // Validate each strength criterion
    const checks = [
      value.length >= 8,
      /[A-Z]/.test(value),
      /[a-z]/.test(value),
      /\d/.test(value),
      /[^A-Za-z0-9]/.test(value),
    ];

    // Calculate overall strength score
    const score = checks.filter(Boolean).length;
    const colors = ["#e74c3c", "#f39c12", "#27ae60", "#2ecc71"];
    const width = (score / checks.length) * 100;

    // Update strength bar color and width
    strengthBar.style.width = `${width}%`;
    strengthBar.style.background =
      score === 0 ? "#ccc" : colors[Math.min(score - 1, colors.length - 1)];

    // Update checklist icons and colors
    const spans = criteriaContainer.querySelectorAll("span");
    spans.forEach((span, index) => {
      span.textContent = `${checks[index] ? "✅" : "❌"} ${
        criteriaLabels[index]
      }`;
      span.style.color = checks[index] ? "#27ae60" : "#666";
    });

    // Recheck password match if confirm input exists
    if (confirmInput) checkPasswordMatch(passwordInput, confirmInput);
  });
}

// Validate if password and confirmation match
function checkPasswordMatch(passwordInput, confirmInput) {
  const message = confirmInput
    .closest(".password-wrapper")
    .querySelector(".confirm-message");

  if (!confirmInput.value) {
    message.textContent = "";
    return;
  }

  // Display match or mismatch feedback
  if (passwordInput.value === confirmInput.value) {
    message.textContent = "✅ Match";
    message.style.color = "#27ae60";
  } else {
    message.textContent = "❌ Not a match";
    message.style.color = "#e74c3c";
  }
}

// Toggle password visibility with eye icon interaction
function togglePassword(inputId, iconElement) {
  const input = document.getElementById(inputId);
  if (!input || !iconElement) return;

  const isHidden = input.type === "password";
  input.type = isHidden ? "text" : "password";

  // Update icon state and alt text
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
   - Handles form validation, age restriction,
     password validation, and server submission.
================================================= */
if (document.body.classList.contains("register-page")) {
  const registerForm = document.getElementById("registerForm");
  const password = document.getElementById("password");
  const confirmPassword = document.getElementById("confirm-password");
  const toggleIcons = document.querySelectorAll(".toggle-password");
  const dobInput = document.getElementById("dob");

  // Restrict date of birth to enforce minimum age
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

  // Enable password visibility toggle for all eye icons
  toggleIcons.forEach((icon) => {
    icon.addEventListener("click", () => {
      togglePassword(icon.dataset.target, icon);
    });
  });

  // Initialize password validation logic
  if (password) setupPasswordValidation(password, confirmPassword);

  // Handle registration form submission with async request
  if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      // Honeypot check
      const honeypot = registerForm.querySelector('input[name="website"]');
      if (honeypot && honeypot.value.trim() !== "") {
        showAlert("❌ Suspicious activity detected.", "error");
        return;
      }

      // Validate password match before submitting
      if (password.value !== confirmPassword.value) {
        showAlert("❌ Passwords do not match.", "error");
        return;
      }

      // Ensure all required fields are completed
      if (!registerForm.checkValidity()) {
        showAlert("⚠️ Please fill in all required fields.", "info");
        return;
      }

      const formData = new FormData(registerForm);

      try {
        // Submit form via AJAX to server
        const response = await fetch("register.php", {
          method: "POST",
          body: formData,
        });
        const result = await response.json();

        // Handle registration response
        if (result.success) {
          showAlert("🎉 Registration successful! Kindly log in.", "success");
          setTimeout(() => {
            window.location.href = "login.html?registered=1";
          }, 2000);
        } else {
          // Fixed syntax for template literal
          showAlert(`❌ Registration failed: ${result.message}`, "error");
        }
      } catch (error) {
        console.error("Registration error:", error);
        showAlert("❌ Network or server error. Please try again.", "error");
      }
    });
  }
}
/* ===================================
   5. LOGIN PAGE SCRIPTS (login.html)
   - Manages login form submission,
     validation, and feedback alerts.
===================================== */
if (document.body.classList.contains("login-page")) {
  const loginForm = document.getElementById("loginForm");
  const password = document.getElementById("password");
  const toggleIcons = document.querySelectorAll(".toggle-password");

  // Enable password visibility toggling
  toggleIcons.forEach((icon) => {
    icon.addEventListener("click", () => {
      const inputId = icon.dataset.target;
      togglePassword(inputId, icon);
    });
  });

  // Initialize strength feedback for password input
  if (password) setupPasswordValidation(password);

  // Handle login submission and response handling
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const emailInput = loginForm.querySelector('input[name="email"]');
      const passwordInput = loginForm.querySelector('input[name="password"]');
      const submitBtn = loginForm.querySelector('button[type="submit"]');

      // Basic field validation before submitting
      if (!emailInput.value.trim() || !passwordInput.value.trim()) {
        showAlert("⚠️ Please enter both email and password.", "info");
        return;
      }

      try {
        submitBtn.disabled = true; // Prevent multiple submissions
        const formData = new FormData(loginForm);
        const response = await fetch("login.php", {
          method: "POST",
          body: formData,
        });
        const result = await response.json();

        // Handle successful login
        if (result.success) {
          const name = result.firstname ? result.firstname : "";
          const message = name
            ? `✅ Login successful! Welcome back, ${name}!`
            : "✅ Login successful!";
          showAlert(message, "success");

          // Redirect to dashboard after short delay
          setTimeout(() => {
            window.location.href = "dashboard.php";
          }, 1500);
        } else {
          // Display server-provided error
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

// ====== LOGIN PAGE URL ALERTS =====
// Handles alerts triggered by URL query parameters
(function () {
  if (!document.body.classList.contains("login-page")) return;

  const urlParams = new URLSearchParams(window.location.search);

  // ✅ Show logout confirmation
  if (urlParams.get("logout") === "1") {
    showAlert("✅ Logged out.", "success");
    const cleanUrl = window.location.href.split("?")[0];
    window.history.replaceState({}, document.title, cleanUrl);
  }

  // 🎉 Registration success message
  if (urlParams.get("registered") === "1") {
    showAlert("🎉 Registration successful! Please log in.", "success");
    const cleanUrl = window.location.href.split("?")[0];
    window.history.replaceState({}, document.title, cleanUrl);
  }

  // ⚠️ Session expired alert
  if (urlParams.get("sessionexpired") === "1") {
    showAlert("⚠️ Your session has expired. Please log in again.", "info");
    const cleanUrl = window.location.href.split("?")[0];
    window.history.replaceState({}, document.title, cleanUrl);
  }
})();

/* ===========================================
   6. DASHBOARD PAGE SCRIPTS (dashboard.html)
   - Handles user greeting, sidebar toggle,
     and dark/light theme management.
============================================== */
document.addEventListener("DOMContentLoaded", () => {
  // Example user greeting (replace with dynamic data in production)
  const userFirstName = "John";
  const firstNameElem = document.getElementById("user-firstname");
  if (firstNameElem && userFirstName) {
    firstNameElem.textContent = userFirstName;
  }
});

// Toggle sidebar collapse/expand state
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

// Theme switcher between light and dark mode
const themeToggleBtn = document.querySelector(".toggle-theme");
if (themeToggleBtn) {
  themeToggleBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark-theme");
    localStorage.setItem(
      "theme",
      document.body.classList.contains("dark-theme") ? "dark" : "light"
    );
  });

  // Apply saved theme preference on page load
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
