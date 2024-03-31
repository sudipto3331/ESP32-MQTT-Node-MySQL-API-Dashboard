<?php

require __DIR__ . '/vendor/autoload.php'; // Load Composer's autoloader

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

$dbHost = $_ENV['DB_HOST'];
$dbUser = $_ENV['DB_USER'];
$dbPassword = $_ENV['DB_PASSWORD'];
$dbName = $_ENV['DB_NAME'];

$mysqli = new mysqli($dbHost, $dbUser, $dbPassword, $dbName);

if ($mysqli->connect_errno) {
    die("Failed to connect to MySQL: " . $mysqli->connect_error);
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (isset($_GET['room'])) {
        $roomNo = $_GET['room'];

        $query = "SELECT temperature, humidity, gas, oxygen FROM all_room_data WHERE room_no = ?";
        $stmt = $mysqli->prepare($query);
        $stmt->bind_param("s", $roomNo);

        if (!$stmt->execute()) {
            die("Error executing query: " . $stmt->error);
        }

        $result = $stmt->get_result();

        if ($result->num_rows === 0) {
            http_response_code(404);
            echo json_encode(array("error" => "Room not found"));
        } else {
            $roomData = $result->fetch_assoc();
            echo json_encode($roomData);
        }

        $stmt->close();
    } else {
        http_response_code(400);
        echo json_encode(array("error" => "Missing room parameter"));
    }
} else {
    http_response_code(405);
    echo json_encode(array("error" => "Method Not Allowed"));
}

$mysqli->close();

?>
