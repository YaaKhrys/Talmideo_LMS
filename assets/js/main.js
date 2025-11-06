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

  // --- Popup visibility handling ---
  passwordInput.addEventListener("focus", () => (popup.style.display = "flex"));
  passwordInput.addEventListener("blur", () => {
    // small delay to avoid flicker when tabbing quickly
    setTimeout(() => {
      if (
        !passwordInput.matches(":focus") &&
        (!confirmInput || !confirmInput.matches(":focus"))
      ) {
        popup.style.display = "none";
      }
    }, 200);
  });

  // --- Confirm password match message ---
  if (confirmInput) {
    const matchMessage = document.createElement("small");
    matchMessage.classList.add("confirm-message");
    matchMessage.textContent = "";
    Object.assign(matchMessage.style, {
      fontSize: "10px",
      color: "#e74c3c",
      position: "absolute",
      left: "0",
      top: `${confirmInput.offsetHeight + 4}px`,
      width: "100%",
      pointerEvents: "none",
    });

    const confirmWrapper = confirmInput.closest(".password-wrapper");
    confirmWrapper.style.position = "relative";
    confirmWrapper.appendChild(matchMessage);

    confirmInput.addEventListener("focus", () => {
      matchMessage.style.display = "block";
    });
    confirmInput.addEventListener("blur", () => {
      matchMessage.style.display = "none";
    });
    confirmInput.addEventListener("input", () =>
      checkPasswordMatch(passwordInput, confirmInput)
    );
  }

  // --- Debounced strength checker ---
  let debounceTimer;
  passwordInput.addEventListener("input", () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      updatePasswordFeedback(
        passwordInput,
        confirmInput,
        strengthBar,
        criteriaContainer,
        criteriaLabels
      );
    }, 150);
  });
}

// --- Helper: evaluate password strength ---
function updatePasswordFeedback(
  passwordInput,
  confirmInput,
  strengthBar,
  criteriaContainer,
  criteriaLabels
) {
  const value = passwordInput.value;

  const checks = [
    value.length >= 8,
    /[A-Z]/.test(value),
    /[a-z]/.test(value),
    /\d/.test(value),
    /[^A-Za-z0-9]/.test(value),
  ];

  const score = checks.filter(Boolean).length;
  const colors = ["#e74c3c", "#e67e22", "#f1c40f", "#b2cc2eff", "#27ae60"];
  const width = (score / checks.length) * 100;

  strengthBar.style.width = `${width}%`;
  strengthBar.style.background =
    score === 0 ? "#ccc" : colors[Math.min(score - 1, colors.length - 1)];

  const spans = criteriaContainer.querySelectorAll("span");
  spans.forEach((span, index) => {
    span.textContent = `${checks[index] ? "✅" : "❌"} ${
      criteriaLabels[index]
    }`;
    span.style.color = checks[index] ? "#27ae60" : "#666";
  });

  if (confirmInput) checkPasswordMatch(passwordInput, confirmInput);
}

// --- Helper: check match ---
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

// --- Helper: toggle password visibility ---
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
   - Handles form validation, age restriction,
     password validation, and server submission.
================================================= */
if (document.body.classList.contains("register-page")) {
  const registerForm = document.getElementById("registerForm");
  const password = document.getElementById("password");
  const confirmPassword = document.getElementById("confirm-password");
  const toggleIcons = document.querySelectorAll(".toggle-password");
  const dobInput = document.getElementById("dob");

  // JavaScript injected ARIA-friendly honeypot
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

    // Time-based honeypot
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

      // Capture the submit button and its original label ===
      const submitBtn = registerForm.querySelector(".signup-btn");
      const originalBtnText = submitBtn.innerHTML;
      const now = Date.now();

      // Prevent multiple rapid submissions (3-second throttle) ===
      if (
        registerForm.dataset.lastSubmitTime &&
        now - registerForm.dataset.lastSubmitTime < 3000
      ) {
        showAlert("⏳ Please wait a moment before submitting again.", "info");
        return;
      }

      // Disable submit button & display loading spinner
      // Disable submit button & display loading spinner
      submitBtn.disabled = true;
      submitBtn.classList.add("btn-disabled");
      submitBtn.innerHTML = `
      <span class="spinner"></span> Submitting...
`;

      // Honeypot validation to prevent spam/bot submissions ===
      const honeypot = registerForm.querySelector('input[name="website"]');
      if (honeypot && honeypot.value.trim() !== "") {
        showAlert("❌ Suspicious activity detected.", "error");
        resetButton();
        return;
      }

      const jsHoneypot = registerForm.querySelector('input[name="nickname"]');
      if (jsHoneypot && jsHoneypot.value.trim() !== "") {
        showAlert("❌ Suspicious activity detected.", "error");
        resetButton();
        return;
      }

      const timeHoneypot = registerForm.querySelector(
        'input[name="form_render_time"]'
      );
      if (timeHoneypot) {
        const elapsed = Date.now() - parseInt(timeHoneypot.value, 10);
        if (elapsed < 3000) {
          // Form submitted suspiciously fast (<3s)
          showAlert("❌ Suspicious activity detected.", "error");
          resetButton();
          return;
        }
      }

      // Ensure passwords match before submission
      if (password.value !== confirmPassword.value) {
        showAlert("❌ Passwords do not match.", "error");
        resetButton();
        return;
      }

      // Check that all required form fields are valid
      if (!registerForm.checkValidity()) {
        showAlert("⚠️ Please fill in all required fields.", "info");
        resetButton();
        return;
      }

      // Prepare data for AJAX submission
      const formData = new FormData(registerForm);

      try {
        // Submit form data asynchronously to register.php
        const response = await fetch("register.php", {
          method: "POST",
          body: formData,
        });

        // Expecting a JSON response { success: true/false, message: "..." }
        const result = await response.json();

        // === 9. Handle success or error feedback ===
        if (result.success) {
          showAlert("🎉 Registration successful! Kindly log in.", "success");
          registerForm.dataset.lastSubmitTime = now;

          // Redirect to login after a short delay
          setTimeout(() => {
            window.location.href = "login.html?registered=1";
          }, 2000);
        } else {
          showAlert(`❌ Registration failed: ${result.message}`, "error");
        }
      } catch (error) {
        // Handle unexpected network/server errors
        console.error("Registration error:", error);
        showAlert("❌ Network or server error. Please try again.", "error");
      } finally {
        // Re-enable button and restore original text
        resetButton();
        registerForm.dataset.lastSubmitTime = now;
      }
      // Helper: Restore button to normal interactive state
      function resetButton() {
        submitBtn.disabled = false;
        submitBtn.classList.remove("btn-disabled");
        submitBtn.innerHTML = originalBtnText;
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
  const toggleIcons = document.querySelectorAll(".toggle-password");

  // Enable password visibility toggle for all eye icons
  toggleIcons.forEach((icon) => {
    icon.addEventListener("click", () => {
      togglePassword(icon.dataset.target, icon);
    });
  });

  // Handle login form submission with async request
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const emailInput = loginForm.querySelector('input[name="email"]');
      const passwordInput = loginForm.querySelector('input[name="password"]');
      const submitBtn = loginForm.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn.innerHTML;
      const now = Date.now();

      // Prevent rapid multiple submissions (3-second throttle)
      if (
        loginForm.dataset.lastSubmitTime &&
        now - loginForm.dataset.lastSubmitTime < 3000
      ) {
        showAlert("⏳ Please wait a moment before submitting again.", "info");
        return;
      }

      // Trim whitespace from inputs
      const email = emailInput.value.trim();
      const password = passwordInput.value.trim();

      // Basic field validation
      if (!email || !password) {
        showAlert("⚠️ Please enter both email and password.", "info");
        return;
      }

      // Disable submit button + show spinner
      submitBtn.disabled = true;
      submitBtn.classList.add("btn-disabled");
      submitBtn.innerHTML = `<span class="spinner"></span> Signing in...`;

      // Prepare form data
      const formData = new FormData(loginForm);
      formData.set("email", email);
      formData.set("password", password);

      try {
        const response = await fetch("login.php", {
          method: "POST",
          body: formData,
        });
        const result = await response.json();

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
          showAlert(`❌ ${result.message}`, "error");
        }
      } catch (error) {
        console.error("Login error:", error);
        showAlert("❌ Network or server error. Please try again.", "error");
      } finally {
        // Restore button state
        submitBtn.disabled = false;
        submitBtn.classList.remove("btn-disabled");
        submitBtn.innerHTML = originalBtnText;
        loginForm.dataset.lastSubmitTime = now;
      }
    });
  }

  // ====== LOGIN PAGE URL ALERTS =====
  // Handles alerts triggered by URL query parameters
  (function () {
    const urlParams = new URLSearchParams(window.location.search);

    const showUrlAlert = (param, message, type) => {
      if (urlParams.get(param) === "1") {
        showAlert(message, type);
        const cleanUrl = window.location.href.split("?")[0];
        window.history.replaceState({}, document.title, cleanUrl);
      }
    };

    showUrlAlert("logout", "✅ Logged out.", "success");
    showUrlAlert(
      "registered",
      "🎉 Registration successful! Please log in.",
      "success"
    );
    showUrlAlert(
      "sessionexpired",
      "⚠️ Your session has expired. Please log in again.",
      "info"
    );
  })();
}

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
