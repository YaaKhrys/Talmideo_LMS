<?php
// =======================================================================
// register.php - Secure Registration with Email Verification (OTP + Link)
// ======================================================================

// Show PHP errors for debugging (disable in production)
// ini_set('display_errors', 1);
// ini_set('display_startup_errors', 1);
// error_reporting(E_ALL);

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/register_error.log'); // log file in same folder



// Include DB connection
// -------------------------
require_once 'config/db_config.php';


// Include PHPMailer for sending emails
// ----------------------------------------
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
require_once __DIR__ . '/phpmailer/PHPMailer.php';
require_once __DIR__ . '/phpmailer/SMTP.php';
require_once __DIR__ . '/phpmailer/Exception.php';


// Start output buffering to prevent stray HTML
// -------------------------
ob_start();

// Set response type to JSON
// Tell browser this is JSON
// ------------------------------
header('Content-Type: application/json');

// Default JSON response
$response = ['success' => false, 'message' => 'Registration unsuccessful.'];


// Only accept POST requests
// ------------------------------
if ($_SERVER["REQUEST_METHOD"] === "POST") {


    // 🛡️ Honeypot Protection (Anti-bot)
    $website = $_POST['website'] ?? ''; // CSS-hidden field
    $nickname = $_POST['nickname'] ?? ''; //// JS-injected field
    $form_render_time = $_POST['form_render_time'] ?? 0; // Timestamp in ms

    // --- Honeypot Checks ---
    if (!empty($website) || !empty($nickname) || (time() - ($form_render_time / 1000) < 3)) {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "Bot detected."
        ]);
        exit;
    }


    // Collect & Sanitize Inputs
    $firstname = trim($_POST['firstname'] ?? '');
    $lastname  = trim($_POST['lastname'] ?? '');
    $email     = trim($_POST['email'] ?? '');
    $gender    = trim($_POST['gender'] ?? '');
    $dob       = trim($_POST['dob'] ?? '');
    $password  = $_POST['password'] ?? '';


    // Basic Required Field Validation
    if (empty($firstname) || empty($email) || empty($password) || empty($dob)) {
        // Clear any accidental output before sending JSON
        ob_end_clean();
        header('Content-Type: application/json'); // optional if already set
        echo json_encode(["success" => false, "message" => "Please fill in all required fields."]);
        exit;
    }

    // Check for duplicates in pending or main users table
    $stmt = $conn->prepare("SELECT email FROM pending_users WHERE email = ? UNION SELECT email FROM students WHERE email = ?");
    $stmt->bind_param("ss", $email, $email);
    $stmt->execute();
    $stmt->store_result();
    if ($stmt->num_rows > 0) {
        ob_end_clean();
        header('Content-Type: application/json'); // optional if already set
        echo json_encode(["success" => false, "message" => "Email already registered or pending verification."]);
        exit;
    }
    $stmt->close();



    // 🔒 Hash Password Securely
    $hashed_password = password_hash($password, PASSWORD_DEFAULT);


    // Generate OTP and expiration (10 minutes)
    $token = random_int(100000, 999999);
    $token_expires_at = date('Y-m-d H:i:s', strtotime('+10 minutes')); // OTP valid for 10 mins


    // Insert User into pending_users table
    $stmt = $conn->prepare("
    INSERT INTO pending_users (firstname, lastname, email, password, gender, dob, token, token_expires_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
");
$stmt->bind_param(
    "ssssssss",
    $firstname,
    $lastname,
    $email,
    $hashed_password,
    $gender,
    $dob,
    $token,
    $token_expires_at
);

    if (!$stmt->execute()) {
        ob_end_clean();
        header('Content-Type: application/json'); // optional if already set
        echo json_encode(["success" => false, "message" => "Database error. Please try again."]);
        exit;
    }


    $stmt->close();


    // 📧 Email setup - Prepare Verification Email
    $verify_link = "https://christabellowusu.eagletechafrica.com/verify_email.php?email=" . urlencode($email) . "&token=$token";
    $subject = "Verify Your Email - Talmidēo";

    $messageHTML = "
<div style='font-family:Arial,sans-serif; background:#fafafa; padding:20px;'>
  <div style='max-width:600px; margin:auto; background:#ffffff; border-radius:8px; padding:20px;'>
    <h2 style='color:#333;'>Welcome, $firstname!</h2>
    <p>Thank you for registering with <strong>Talmidēo</strong>.</p>
    <p>Please verify your email within <strong>10 minutes</strong> to activate your account.</p>
    <p>Your email verification code is:</p>
    <div style='font-size:22px; font-weight:bold; letter-spacing:4px; color:#333;'>$token</div>
    <p>Or click the button below to verify your account:</p>
    <a href='$verify_link' style='display:inline-block; background:#50623a; color:#fff; padding:10px 16px; text-decoration:none; border-radius:6px;'>Verify Email</a>
    <p style='font-size:12px; color:#777; margin-top:15px;'>If you didn’t request this, you can safely ignore this email.</p>
  </div>
</div>
";


    // 📨 Send Email using PHPMailer
    try {
        $mail = new PHPMailer(true);
        $mail->SMTPDebug = 2;
        $mail->Debugoutput = function($str, $level) {
    file_put_contents(__DIR__ . '/mail_debug.log', date('Y-m-d H:i:s') . " - $str\n", FILE_APPEND);
};

        $mail->isSMTP();
        $mail->Host       = 'smtp.gmail.com';        // Gmail SMTP server
        $mail->SMTPAuth   = true;
        $mail->Username   = 'talmiddeo@gmail.com';   // my Talmidēo Gmail
        $mail->Password   = 'zvqeyotsywizcicx'; // App Password
        $mail->SMTPSecure = 'tls'; // or 'ssl'
        $mail->Port       = 587; // 465 for SSL

        $mail->setFrom('talmiddeo@gmail.com', 'Talmidēo PHPMailer');
        $mail->addAddress($email, "$firstname $lastname");
        $mail->isHTML(true);
        $mail->Subject = $subject;
        $mail->Body    = $messageHTML;
        $mail->send();

        $response['success'] = true;
        $response['message'] = '🎉 Registration successful! Please check your email for the verification code.';
    } catch (Exception $e) {
        // Delete record if email fails
        $conn->query("DELETE FROM pending_users WHERE email = '" . $conn->real_escape_string($email) . "'");
        $response['success'] = false;
        $response['message'] = 'Could not send verification email. Please check your email address and try again.';
    }

    $conn->close();
}


// Return final JSON response (ensure clean JSON only)
ob_end_clean(); // Clear any stray HTML or warnings
header('Content-Type: application/json');
echo json_encode($response);
exit;
?>



