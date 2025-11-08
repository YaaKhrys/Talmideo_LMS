<?php
// test_json.php
header('Content-Type: application/json');
echo json_encode(['success' => true, 'message' => 'JSON works']);
exit;