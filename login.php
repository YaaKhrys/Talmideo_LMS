<?php
session_start();
require_once 'config/db_config.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
$email = $_POST['email'];
$password = $_POST['password'];



$sql = "SELECT * FROM students WHERE email = '$email'";
$result = $conn->query($sql);


if ($result->num_rows == 1) {
    $row = $result->fetch_assoc();
    if (password_verify($password, $row['password'])) {
        $_SESSION['student_id'] = $row['sid'];
        $_SESSION['firstname'] = $row['firstname'];
        $_SESSION['loggedin'] = true;
        header("Location: dashboard.php");
        exit;
    } else {
        echo "<script>alert('Invalid password'); window.location='login.html';</script>;";
    }

} else {
        echo "<script>alert('Email not found'); window.location='login.html';</script>;";
    }

$_SESSION['firstname'] = $user_firstname; // Fetch from DB

}
?>

