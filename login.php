<?php
session_start();
require_once 'config/db_config.php';

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $email = trim($_POST['email']);
    $password = trim($_POST['password']);

    // Basic validation
    if (empty($email) || empty($password)) {
        header("Location: login.html?missing=1");
        exit;
    }

    // Use prepared statement to find user by email
    $sql = $conn->prepare("SELECT * FROM students WHERE email = ?");
    $sql->bind_param("s", $email);
    $sql->execute();
    $result = $sql->get_result();

    // Check if user exists
    if ($result->num_rows === 1) {
        $row = $result->fetch_assoc();

        // Verify password
        if (password_verify($password, $row['password'])) {
            // Set session variables
            $_SESSION['student_id'] = $row['sid'];
            $_SESSION['firstname'] = $row['firstname'];
            $_SESSION['loggedin'] = true;

            // Redirect to dashboard
            header("Location: dashboard.php");
            exit;
        } else {
            // Wrong password
            header("Location: login.html?invalid=1");
            exit;
        }
    } else {
        // Email not found
        header("Location: login.html?notfound=1");
        exit;
    }

    $sql->close();
    $conn->close();
}
?>
