<?php
session_start();
session_unset();
session_destroy();
// Redirect back to login page with alert flag
header("Location: login.html?logout=1");

exit;

?>
