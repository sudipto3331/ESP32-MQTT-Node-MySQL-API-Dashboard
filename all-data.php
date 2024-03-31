<?php

require __DIR__ . '/vendor/autoload.php'; // Load Composer's autoloader

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

$dbHost = $_ENV['DB_HOST'];
$dbUser = $_ENV['DB_USER'];
$dbPassword = $_ENV['DB_PASSWORD'];
$dbName = $_ENV['DB_NAME'];

$mysqli = new mysqli($dbHost, $dbUser, $dbPassword, $dbName);

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (isset($_GET['room']) && isset($_GET['type'])) {
        $roomNo = $_GET['room'];
        $dataType = $_GET['type'];
        $validDataTypes = ['temperature', 'humidity', 'gas', 'oxygen'];
        if (!in_array($dataType, $validDataTypes)) {
            http_response_code(400);
            echo json_encode(array("error" => "Invalid or missing data type"));
            exit;
        }
        $query = "SELECT id, $dataType, DATE_FORMAT(timestamp, '%Y-%m-%d %H:%i:%s') AS timestamp FROM $roomNo";
        $mysqli = new mysqli($dbHost, $dbUser, $dbPassword, $dbName);
        if ($mysqli->connect_errno) {
            http_response_code(500);
            echo json_encode(array("error" => "Internal server error"));
            exit;
        }
        $result = $mysqli->query($query);
        if (!$result) {
            http_response_code(500);
            echo json_encode(array("error" => "Internal server error"));
            exit;
        }
        if ($result->num_rows === 0) {
            http_response_code(404);
            echo json_encode(array("error" => "Room not found"));
            exit;
        }
        $resultsArray = array();
        while ($row = $result->fetch_assoc()) {
            $resultsArray[] = $row;
        }
        echo json_encode($resultsArray);
        $mysqli->close();
    } else {
        http_response_code(400);
        echo json_encode(array("error" => "Missing room or type parameter"));
    }
} else {
    http_response_code(405);
    echo json_encode(array("error" => "Method Not Allowed"));
}

?>
