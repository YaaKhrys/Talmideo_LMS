<?php
$servername = "localhost";
$username = "u376937047_christabAdmin";
$password = "RIlleb246@#T@";
$dbname = "u376937047_lms_christabDB";


$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    error_log("Database connection error: " . $conn->connect_error);
    die("Something went wrong. Please try again later.");
}

?>