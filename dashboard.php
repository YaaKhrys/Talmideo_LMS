<?php
session_start();

// Prevent unauthorized access
if (!isset($_SESSION['loggedin']) || $_SESSION['loggedin'] !== true) {
    header("Location: login.html?sessionexpired=1"); // redirect with alert
    exit;
}

// Retrieve user's first name safely
$firstname = isset($_SESSION['firstname']) ? $_SESSION['firstname'] : 'User';
?>
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Dashboard - Talmidēo</title>
    <link rel="stylesheet" href="assets/css/dashboard.css" />

    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=Fondamento:ital@0;1&family=Inter:wght@400;500;600;700&display=swap"
      rel="stylesheet"
    />

    <!-- Favicon -->
    <link rel="icon" type="image/png" sizes="90x90" href="assets/images/favicon.png" />

    <!-- Google Analytics -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-KGV5ZELN62"></script>
    <script src="assets/js/analytics.js"></script>
  </head>

  <body class="dashboard-page">
    <!-- 🌍 Global Alert Container -->
    <div class="page-alert-container"></div>

    <!-- 🧭 Dashboard Container -->
    <div class="dashboard-container">
      <!-- Sidebar -->
      <aside class="sidebar expanded">
        <div class="sidebar-header">
          <img src="assets/images/Talmidēo Logo.png" alt="Logo" class="logo-img" />
          <span class="logo-text">Talmidēo</span>

          <!-- Collapse (←) -->
          <button class="collapse-btn" onclick="toggleSidebar()" aria-label="Collapse sidebar">
            <img src="assets/images/previous-page-17.png" alt="Collapse" />
          </button>

          <!-- Expand (→) -->
          <button class="expand-btn" onclick="toggleSidebar()" aria-label="Expand sidebar" style="display: none">
            <img src="assets/images/next-page-17.png" alt="Expand" />
          </button>
        </div>

        <nav class="sidebar-menu">
          <a href="#"><i class="icon"><img src="assets/images/dashboard icon.png" alt="Home" /></i><span>Dashboard</span></a>
          <a href="#"><i class="icon"><img src="assets/images/Holy-Bible-icon.png" alt="Bible" /></i><span>In the Word</span></a>
          <a href="#"><i class="icon"><img src="assets/images/study.png" alt="Study & Quizzes" /></i><span>Study & Quizzes</span></a>
          <a href="#"><i class="icon"><img src="assets/images/community3.png" alt="Community" /></i><span>Community</span></a>
          <a href="#"><i class="icon"><img src="assets/images/publish.png" alt="Publish" /></i><span>Publish</span></a>
        </nav>

        <div class="sidebar-footer">
          <a href="#"><i class="icon"><img src="assets/images/Settings.png" alt="Settings" /></i><span>Settings</span></a>
          <a href="logout.php"><i class="icon"><img src="assets/images/logout_icon_184325.png" alt="Logout" /></i><span>Logout</span></a>
          <div class="theme-toggle">
            <label class="switch">
              <input type="checkbox" id="theme-toggle" />
              <span class="slider"></span>
            </label>
          </div>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="main-content">
        <!-- Topbar -->
        <header class="topbar">
          <!-- 👋 Personalized greeting -->
          <div class="welcome-text">
            Welcome, <strong><?php echo htmlspecialchars($firstname); ?></strong> <span class="wave">👋</span>
          </div>

          <div class="topbar-actions">
            <div class="search-box">
              <input type="text" placeholder="Search..." />
              <i class="icon"><img src="assets/images/search-icon-png-5.png" alt="Search" /></i>
            </div>
            <div class="streak">
              <i class="icon"><img src="assets/images/streak vector-pngtree.png" alt="Streak" /></i>
              <span>2 days</span>
            </div>
            <i class="icon"><img src="assets/images/notification-vector.png" alt="Notifications" /></i>
            <div class="profile-pic">
              <img src="assets/images/Lifesavers - Avatar (1).png" alt="Profile" />
            </div>
          </div>
        </header>

        <!-- Dashboard Content -->
        <section class="workspace">
          <div class="main-boxes">
            <div class="announcement-box inactive">
              <img src="assets/images/announcement-3d-icon.webp" alt="Announcement" />
              <div class="box-text">Announcement</div>
            </div>
            <div class="focus-box inactive">
              <img src="assets/images/user activity.webp" alt="User Focus" />
              <div class="box-text">User Focus</div>
            </div>
          </div>

          <div class="info-boxes">
            <div class="bible-verse-box inactive">
              <img src="assets/images/random bible verses.png" alt="Bible Verse" />
              <div class="box-text">Random Bible Verse</div>
            </div>
            <div class="stats-box inactive">
              <img src="assets/images/user stats.png" alt="User Stats" />
              <div class="box-text">User Stats</div>
            </div>
            <div class="tips-box inactive">
              <img src="assets/images/light-bulb-icon-on-transparent-background-PNG.png" alt="Platform Tips" />
              <div class="box-text">Platform Tips</div>
            </div>
          </div>
        </section>
      </main>
    </div>

    <!-- JavaScript -->
    <script>
        const script = document.createElement('script');
        script.src = 'assets/js/main.js?v=' + new Date().getTime();
        document.head.appendChild(script);
    </script>
  </body>
</html>



