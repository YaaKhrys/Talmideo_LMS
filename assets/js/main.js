/* ===========================================================
   MAIN.JS - JavaScript for the entire project
   Sections:
   1. Home Page (index.html)
   2. Registration Page (register.html)
   3. Login Page (login.html)
   4. Password Reset Page (password.html) [if applicable]
   5. Dashboard Page (dashboard.html)
============================================================ */

/* ================================
   1. HOME PAGE SCRIPTS (index.html)
=================================== */

// Example: Smooth scroll for homepage anchors
if (document.body.classList.contains("home-page")) {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (e) => {
      e.preventDefault();
      const target = document.querySelector(anchor.getAttribute("href"));
      if (target) target.scrollIntoView({ behavior: "smooth" });
    });
  });
}

// Show button when scrolled down 100px
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

// Scroll to top on click
scrollBtn.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

/* ================================
   2. REGISTRATION PAGE SCRIPTS (register.html)
=================================== */
// DoB Selection restriction
<script>
  window.addEventListener('DOMContentLoaded', () => {
    const dobInput = document.getElementById('dob');
    const today = new Date();

    // Calculate the latest allowed birthday (today minus 11 years)
    const minAge = 11;
    const maxDate = new Date(
      today.getFullYear() - minAge,
      today.getMonth(),
      today.getDate()
    );

    // Format date to yyyy-mm-dd for input[type=date] max attribute
    const maxDateStr = maxDate.toISOString().split('T')[0];

    // Set the max attribute so user cannot pick a later date (younger than 11)
    dobInput.setAttribute('max', maxDateStr);
  });
</script>

document.querySelector('form').addEventListener('submit', function(e) {
  const dob = new Date(dobInput.value);
  if (dob > maxDate) {
    alert('You must be at least 11 years old to register.');
    e.preventDefault();
  }
});


// Password Confirmation
if (document.body.classList.contains("register-page")) {
  const registerForm = document.getElementById("registerForm");

  if (registerForm) {
    registerForm.addEventListener("submit", (e) => {
      // Basic client-side validation example
      const password = registerForm.querySelector('input[name="password"]');
      const confirmPassword = registerForm.querySelector(
        'input[name="confirm_password"]'
      );

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

  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      // Example: Basic validation - ensure username/email and password are not empty
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
   4. PASSWORD
=================================== */

if (document.body.classList.contains("password-page")) {
  // Add password reset JS here if needed
}

// Confirm if Passwords match
document
  .getElementById("registerForm")
  .addEventListener("submit", function (e) {
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirm-password").value;

    if (password !== confirmPassword) {
      e.preventDefault(); // stop form submission
      alert("Passwords do not match. Please check and try again.");
    }
  });

// Password show/hide toggle function
function togglePassword(inputId, iconElement) {
  const input = document.getElementById(inputId);
  if (!input || !iconElement) return;

  const isHidden = input.type === "password";
  input.type = isHidden ? "text" : "password";

  if (isHidden) {
    iconElement.src = "assets/images/eye-password-show.png";
    iconElement.classList.add("eye-open");
    iconElement.classList.remove("eye-closed");
  } else {
    iconElement.src = "assets/images/eye-password-hidden.png";
    iconElement.classList.add("eye-closed");
    iconElement.classList.remove("eye-open");
  }
}

/* ================================
   5. DASHBOARD PAGE SCRIPTS (dashboard.html)
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
