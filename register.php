<?php
// Show PHP errors for debugging (disable in production)
// ini_set('display_errors', 1);
// ini_set('display_startup_errors', 1);
// error_reporting(E_ALL);

// Include DB connection
require_once 'config/db_config.php';

// Tell browser this is JSON
header('Content-Type: application/json');

// Default response
$response = ['success' => false, 'message' => 'Registration unsuccessful.'];

// Only handle POST requests
if ($_SERVER["REQUEST_METHOD"] === "POST") {

    // Collect honeypot fields
    $website = $_POST['website'] ?? '';
    $nickname = $_POST['nickname'] ?? '';
    $form_render_time = $_POST['form_render_time'] ?? 0;

    // Classic CSS-hidden honeypot
    if (!empty($website)) {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "Bot detected (website field)."
        ]);
        exit;
    }

    // JS-injected honeypot
    if (!empty($nickname)) {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "Bot detected (nickname field)."
        ]);
        exit;
    }

    // Time-based honeypot (minimum 3 seconds)
    $min_time_seconds = 3;
    if (time() - ($form_render_time / 1000) < $min_time_seconds) {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "Bot detected (form submitted too fast)."
        ]);
        exit;
    }



    // --- Collect & sanitize user inputs ---
    $firstname = trim($_POST['firstname']);  // First name
    $lastname  = trim($_POST['lastname']);   // Last name
    $email     = trim($_POST['email']);      // Email
    $gender    = trim($_POST['gender']);     // Gender
    $dob       = trim($_POST['dob']);        // Date of birth
    $password  = $_POST['password'];         // Password (will hash)

    // --- Basic validation ---
    if (empty($firstname) || empty($email) || empty($password) || empty($dob)) {
        $response['message'] = 'Please fill all required fields.';
        echo json_encode($response);
        exit;
    }

    // --- Check if email already exists ---
    $stmt = $conn->prepare("SELECT email FROM students WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $stmt->store_result();

    if ($stmt->num_rows > 0) {
        $response['message'] = 'Email already registered.';
        echo json_encode($response);
        exit;
    }
    $stmt->close();

    // --- Hash password ---
    $hashed_password = password_hash($password, PASSWORD_DEFAULT);

    // --- Insert new user into database ---
    $stmt = $conn->prepare(
        "INSERT INTO students (firstname, lastname, email, password, gender, dob) VALUES (?, ?, ?, ?, ?, ?)"
    );
    $stmt->bind_param("ssssss", $firstname, $lastname, $email, $hashed_password, $gender, $dob);

    // --- Execute insert & set response ---
    if ($stmt->execute()) {
        $response['success'] = true;
        $response['message'] = 'Registration successful!';
    } else {
        $response['message'] = 'Registration unsuccessful. Please try again.';
    }

    // --- Clean up ---
    $stmt->close();
    $conn->close();
}

// Return JSON response to JS
echo json_encode($response);
exit;
?>




