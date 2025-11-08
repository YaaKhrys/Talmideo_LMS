<?php
// =======================================
// CRON SCRIPT: Clean Expired Pending Users
// Purpose: Remove stale/unverified user records from the subdomain database
// =======================================

// Include database connection
require_once __DIR__ . '/../../config/db_config.php';  // Adjust path to my DB connection file

// -----------------------------
// SAFETY CHECK
// -----------------------------
// Ensure the script is connected to the correct database to avoid accidental data loss
$expectedDb = 'u376937047_lms_christabDB'; // My subdomain DB name
$currentDb = $conn->query("SELECT DATABASE()")->fetch_row()[0];

if ($currentDb !== $expectedDb) {
    die("⚠️ Safety check failed: connected to the wrong database!");
}

// -----------------------------
// DELETE EXPIRED PENDING USERS
// -----------------------------
// Removes records where the token has expired (timestamp in token_expires_at column)
$sql = "DELETE FROM pending_users WHERE token_expires_at < NOW()";

if ($conn->query($sql)) {
    // Output success to console/browser
    echo date('Y-m-d H:i:s') . " - Expired pending users cleaned successfully.\n";

    // Log success to file (cron_log.txt) for auditing
    file_put_contents(
        __DIR__ . '/cron_log.txt',
        date('Y-m-d H:i:s') . " - Expired pending users cleaned successfully\n",
        FILE_APPEND
    );
} else {
    // Output error to console/browser
    echo date('Y-m-d H:i:s') . " - ERROR: " . $conn->error . "\n";

    // Log error to file
    file_put_contents(
        __DIR__ . '/cron_log.txt',
        date('Y-m-d H:i:s') . " - ERROR: " . $conn->error . "\n",
        FILE_APPEND
    );
}

// -----------------------------
// CLOSE CONNECTION
// -----------------------------
$conn->close();
