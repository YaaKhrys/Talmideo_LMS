<?php
// Show PHP errors (for debugging only – remove in production!)
//ini_set('display_errors', 1);
//ini_set('display_startup_errors', 1);
//error_reporting(E_ALL);


// Check Connection
require_once 'config/db_config.php';

// Collect & clean the form
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $firstname = trim($_POST['firstname']);
    $lastname = trim($_POST['lastname']);
    $email = trim($_POST['email']);
    $gender = trim($_POST['gender']);
    $dob = trim($_POST['dob']);
    $password = $_POST['password']; // Will hash it later

    // Basic validation
    if (empty($firstname) || empty($email) || empty($password) || empty($dob)) {
       header("Location: register.html?missing=1");
        exit;
    }

    // Check if email already exists
    $check_email = $conn->prepare("SELECT email FROM students WHERE email = ?");
    $check_email->bind_param("s", $email);
    $check_email->execute();
    $check_email->store_result();

    if ($check_email->num_rows > 0) {
        header("Location: register.html?exists=1");
        exit;
    }

    $check_email->close();

    // Hash password
    $hashed_password = password_hash($password, PASSWORD_DEFAULT);

    // Insert into the database
    $sql = $conn->prepare("INSERT INTO students (firstname, lastname, email, password, gender, dob) VALUES (?, ?, ?, ?, ?, ?)");
    $sql->bind_param("ssssss", $firstname, $lastname, $email, $hashed_password, $gender, $dob);

    if ($sql->execute()) {
       header("Location: login.html?registered=1");
    } else {
        header("Location: register.html?error=1");
    }

    $sql->close();
    $conn->close();
}
?>





