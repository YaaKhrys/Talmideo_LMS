<?php
// Show PHP errors (for debugging only – remove in production!)
//ini_set('display_errors', 1);
//ini_set('display_startup_errors', 1);
//error_reporting(E_ALL);


// Check Connection
require_once 'config/db_config.php';

// Tell the browser we're sending JSON, not HTML
header('Content-Type: application/json');

// Default response (in case something unexpected happens)
$response = ['success' => false, 'message' => 'Registration unsuccessful.'];


// Collect & clean the form
if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $firstname = trim($_POST['firstname']);
    $lastname = trim($_POST['lastname']);
    $email = trim($_POST['email']);
    $gender = trim($_POST['gender']);
    $dob = trim($_POST['dob']);
    $password = $_POST['password']; // Will hash it later

    // Basic validation
    if (empty($firstname) || empty($email) || empty($password) || empty($dob)) {
        $response['message'] = 'Please fill all required fields.';
        echo json_encode($response);
        exit;
    }

    // Check if email already exists
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

    // Hash password and insert
    $hashed_password = password_hash($password, PASSWORD_DEFAULT);

    // Insert new user record into the database
    $stmt = $conn->prepare("INSERT INTO students (firstname, lastname, email, password, gender, dob) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("ssssss", $firstname, $lastname, $email, $hashed_password, $gender, $dob);

   // Execute the insert and build the response
    if ($stmt->execute()) {
        $response['success'] = true;
        $response['message'] = 'Registration successful!';
    } else {
        $response['message'] = 'Registration unsuccessful. Please try again.';
    }

    // Clean up
    $stmt->close();
    $conn->close();
}
// Return JSON result to JS frontend
echo json_encode($response);
exit;

?>





