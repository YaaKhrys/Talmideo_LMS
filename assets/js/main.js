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

(function () {
  // Ensure container exists once
  let alertContainer = null;

  function getAlertContainer() {
    if (!alertContainer) {
      alertContainer = document.createElement("div");
      alertContainer.className = "page-alert-container";

      // Accessibility: announce new alerts to screen readers
      alertContainer.setAttribute("aria-live", "polite");

      // Always fixed, top-centered
      Object.assign(alertContainer.style, {
        position: "fixed",
        top: "1.25rem", // ~20px
        left: "50%",
        transform: "translateX(-50%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "0.75rem", // ~12px vertical space between stacked alerts
        zIndex: "99999",
        pointerEvents: "none", // clicks pass through container
        width: "auto",
        maxWidth: "90%",
      });
      document.body.appendChild(alertContainer);
    }
    return alertContainer;
  }

  // Show alert function
  window.showAlert = function (message, type = "info", duration = 4000) {
    const container = getAlertContainer();

    const alert = document.createElement("div");
    alert.className = `page-alert ${type}`;
    Object.assign(alert.style, {
      pointerEvents: "auto", // allow close button click
      minWidth: "15rem", // ~240px
      maxWidth: "31.25rem", // ~500px
      padding: "1rem 1.5rem", // ~16px vertical, 24px horizontal
      borderRadius: "0.5rem", // ~8px
      boxShadow: "0 0.25rem 0.625rem rgba(0,0,0,0.15)",
      backgroundColor:
        type === "success"
          ? "#7cb066b6"
          : type === "error"
          ? "#c63b3bb5"
          : "#c9d6b3c4",
      color: "#fff",
      fontSize: "0.95rem",
      lineHeight: "1.4",
      textAlign: "left",
      opacity: "0",
      transform: "translateY(-0.625rem)", // ~10px slide animation
      transition: "all 0.3s ease",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: "3rem",
      flexWrap: "wrap", // responsive wrapping for long text
      wordBreak: "break-word",
      position: "relative", // needed for absolute close button
    });

    // Insert alert content with emojis wrapped in spans
    alert.innerHTML = `
      <div class="alert-message" style="
        flex: 1;
        font-weight: 500;
        padding-right: 2rem; /* space for close button */
      ">
        ${message.replace(
          /([\u{1F300}-\u{1F9FF}])/gu,
          '<span class="emoji">$1</span>'
        )}
    </div>
    <button class="alert-close" style="
      position: absolute;
      top: 30%;
      right: 0.75rem; /* distance from right edge */
      transform: translateY(-50%);
      background: transparent;
      border: none;
      color: #fff;
      font-size: 1.25rem;
      line-height: 1;
      cursor: pointer;
    ">&times;</button>
  `;

    // Append first so querySelectorAll finds emojis
    container.appendChild(alert);

    // Apply emoji sizing per alert type
    const emojiStyle = {
      info: "font-size: 1rem;",
      success: "font-size: 1rem;",
      error: "font-size: 0.8rem;",
    };
    alert.querySelectorAll(".emoji").forEach((el) => {
      el.style.cssText = emojiStyle[type] || "font-size: 0.95rem;";
    });

    // Show animation
    setTimeout(() => {
      alert.style.opacity = "1";
      alert.style.transform = "translateY(0)";
    }, 50);

    // Close button
    alert.querySelector(".alert-close").addEventListener("click", () => {
      dismissAlert(alert);
    });

    // Auto-dismiss after duration
    setTimeout(() => dismissAlert(alert), duration);
  };

  // Dismiss function (Smooth fade-out + cleanup)
  function dismissAlert(alert) {
    if (!alert) return;
    alert.style.opacity = "0";
    alert.style.transform = "translateY(-0.625rem)";
    setTimeout(() => {
      if (alert.parentNode) alert.parentNode.removeChild(alert);
    }, 350);
  }
})();

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

  // 1. JavaScript injected ARIA-friendly honeypot
  if (registerForm) {
    const jsHoneypot = document.createElement("input");
    jsHoneypot.type = "text";
    jsHoneypot.name = "nickname"; // arbitrary name
    jsHoneypot.style.position = "absolute";
    jsHoneypot.style.left = "-9999px";
    jsHoneypot.style.width = "1px";
    jsHoneypot.style.height = "1px";
    jsHoneypot.style.opacity = "0";
    jsHoneypot.setAttribute("aria-hidden", "true");
    jsHoneypot.setAttribute("tabindex", "-1");
    jsHoneypot.autocomplete = "off";
    registerForm.appendChild(jsHoneypot);

    // 2. Time-based honeypot
    const timeHoneypot = document.createElement("input");
    timeHoneypot.type = "hidden";
    timeHoneypot.name = "form_render_time";
    timeHoneypot.value = Date.now();
    registerForm.appendChild(timeHoneypot);
  }

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

      // Classic CSS honeypot check
      const honeypot = registerForm.querySelector('input[name="website"]');
      if (honeypot && honeypot.value.trim() !== "") {
        showAlert("❌ Suspicious activity detected.", "error");
        return;
      }

      // JS honeypot check
      const jsHoneypot = registerForm.querySelector('input[name="nickname"]');
      if (jsHoneypot && jsHoneypot.value.trim() !== "") {
        showAlert("❌ Suspicious activity detected.", "error");
        return;
      }

      // Time-based honeypot check
      const timeHoneypot = registerForm.querySelector(
        'input[name="form_render_time"]'
      );
      if (timeHoneypot) {
        const elapsed = Date.now() - parseInt(timeHoneypot.value, 10);
        if (elapsed < 3000) {
          // e.g., submitted too quickly (<3s)
          showAlert("❌ Suspicious activity detected.", "error");
          return;
        }
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
