<?php
$host = '192.168.1.1';
$user = '';
$pass = '';
$dbname = '';

$conn = new mysqli($host, $user, $pass, $dbname);
if ($conn->connect_error) {
    http_response_code(500);
    die(json_encode(['success' => false, 'error' => 'Database connection failed']));
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = trim($_POST['username'] ?? '');
    $score = floatval($_POST['score'] ?? 0);

    if ($username === '') {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Username is required']);
        exit;
    }

    if ($score < 0 || $score > 100) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Invalid completion']);
        exit;
    }

    $bad_words_file = __DIR__ . '/words.txt';
    $bad_words = [];
    if (file_exists($bad_words_file)) {
        $bad_words = array_filter(file($bad_words_file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES), function($line) {
            return strpos(trim($line), '#') !== 0;
        });
    }

    foreach ($bad_words as $bad_word) {
        if (stripos($username, $bad_word) !== false) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Username contains inappropriate language']);
            exit;
        }
    }

    $ip = $_SERVER['HTTP_CF_CONNECTING_IP'] ?? $_SERVER['REMOTE_ADDR'];

    $stmt = $conn->prepare("DELETE FROM leaderboard WHERE ip = ?");
    if (!$stmt) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => $conn->error]);
        exit;
    }
    $stmt->bind_param("s", $ip);
    $stmt->execute();
    $stmt->close();

    $stmt = $conn->prepare("INSERT INTO leaderboard (username, score, ip) VALUES (?, ?, ?)");
    if (!$stmt) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => $conn->error]);
        exit;
    }
    $stmt->bind_param("sds", $username, $score, $ip);

    if ($stmt->execute()) {
        echo json_encode(['success' => true]);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => $stmt->error]);
    }

    $stmt->close();
} else {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Invalid request method']);
}

$conn->close();
?>
