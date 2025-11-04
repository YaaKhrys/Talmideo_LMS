<?php
// --- Secure headers and session setup ---
header('Content-Type: application/json; charset=utf-8');
session_set_cookie_params([
    'secure'   => true,
    'httponly' => true,
    'samesite' => 'Strict'
]);
session_start();

require_once 'config/db_config.php'; // <-- your existing MySQLi connection ($conn)

// --- Only accept POST requests ---
if ($_SERVER["REQUEST_METHOD"] === "POST") {

    $email    = trim($_POST['email'] ?? '');
    $password = trim($_POST['password'] ?? '');

    // --- Basic validation ---
    if (empty($email) || empty($password)) {
        echo json_encode([
            'success' => false,
            'message' => 'Please enter both email and password.'
        ]);
        exit;
    }

    // --- Prepare SQL to prevent SQL injection ---
    $sql = $conn->prepare("SELECT sid, firstname, password FROM students WHERE email = ?");
    $sql->bind_param("s", $email);
    $sql->execute();
    $result = $sql->get_result();

    if ($result && $result->num_rows === 1) {
        $row = $result->fetch_assoc();

        // --- Verify password securely ---
        if (password_verify($password, $row['password'])) {
            session_regenerate_id(true); // prevent session fixation
            $_SESSION['student_id'] = $row['sid'];
            $_SESSION['firstname']  = $row['firstname'];
            $_SESSION['loggedin']   = true;

            echo json_encode([
                'success'    => true,
                'firstname'  => $row['firstname'], // for personalized welcome
                'message'    => 'Login successful!'
            ]);
        } else {
            // unified message (don’t reveal which field failed)
            echo json_encode([
                'success' => false,
                'message' => 'Invalid email or password.'
            ]);
        }
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Invalid email or password.'
        ]);
    }

    // --- Close DB resources ---
    if (isset($sql))  $sql->close();
    if (isset($conn)) $conn->close();
    exit;
}
?>