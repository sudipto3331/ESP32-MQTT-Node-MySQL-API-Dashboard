<?php

require __DIR__ . '/vendor/autoload.php'; // Load Composer's autoloader

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

$dbHost = $_ENV['DB_HOST'];
$dbUser = $_ENV['DB_USER'];
$dbPassword = $_ENV['DB_PASSWORD'];
$dbName = $_ENV['DB_NAME'];

$mysqli = new mysqli($dbHost, $dbUser, $dbPassword, $dbName);

if ($mysqli->connect_error) {
    die("Connection failed: " . $mysqli->connect_error);
}

// Define API endpoint
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $room_no = $_GET['room_no'];
    $timestamp = $_GET['timestamp'];
    $stmt = $mysqli->prepare("SELECT * FROM day_all_data WHERE room_no = ? AND DATE(last_updated) = ?");
    $stmt->bind_param("ss", $room_no, $timestamp);
    $stmt->execute();
    $result = $stmt->get_result();
    $data = array();
    while ($row = $result->fetch_assoc()) {
        $data[] = $row;
    }
    $stmt->close();
    header('Content-Type: application/json');
    echo json_encode($data);
}

$mysqli->close();
?>
