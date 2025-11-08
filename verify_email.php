<?php
// =======================================================================
// verify_email.php - Verifies OTP or Link, activates user
// Moves user from pending_users → students
// =======================================================================

require_once 'config/db_config.php';

// Return JSON if via AJAX, or HTML if accessed directly
header('Content-Type: application/json');

// Default response
$response = ['success' => false, 'message' => 'Invalid or expired verification link.'];

// Get email + token from GET or POST (works for both link or form)
$email = trim($_REQUEST['email'] ?? '');
$token = trim($_REQUEST['token'] ?? '');

if (empty($email) || empty($token)) {
    echo json_encode(['success' => false, 'message' => 'Missing email or token.']);
    exit;
}

// Check pending user record
$stmt = $conn->prepare("SELECT * FROM pending_users WHERE email = ? AND token = ?");
$stmt->bind_param("ss", $email, $token);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(['success' => false, 'message' => 'Invalid verification code or email.']);
    exit;
}

$user = $result->fetch_assoc();

// Move user from pending_users → students
$insert = $conn->prepare("
    INSERT INTO students (firstname, lastname, email, password, gender, dob, email_verified, active)
    VALUES (?, ?, ?, ?, ?, ?, 1, 1)
");
$insert->bind_param(
    "ssssss",
    $user['firstname'],
    $user['lastname'],
    $user['email'],
    $user['password'],
    $user['gender'],
    $user['dob']
);

if ($insert->execute()) {
    // Delete from pending_users after successful transfer
    $delete = $conn->prepare("DELETE FROM pending_users WHERE email = ?");
    $delete->bind_param("s", $email);
    $delete->execute();
    $delete->close();

    $response['success'] = true;
    $response['message'] = '✅ Email verified successfully! You can now log in.';
} else {
    $response['message'] = 'Error moving user to main account table.';
}

$stmt->close();
$insert->close();
$conn->close();

echo json_encode($response);
exit;
?>