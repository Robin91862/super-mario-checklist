<?php
$host = '192.168.1.1';
$user = '';
$pass = '';
$dbname = '';

$conn = new mysqli($host, $user, $pass, $dbname);
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$sql = "SELECT username, score FROM leaderboard ORDER BY score DESC LIMIT 20";
$result = $conn->query($sql);
?>
<!DOCTYPE html>
<html>
<head>
    <title>Leaderboard</title>
    <link rel="stylesheet" href="../style.css">
    <style>
        body {
            font-family: Arial, sans-serif;
            transition: background 0.3s, color 0.3s;
        }

        .leaderboard-title {
            text-align: center;
            margin-top: 40px;
            font-size: 2em;
        }

        .leaderboard-table {
            width: 60%;
            margin: 40px auto;
            border-collapse: collapse;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            transition: background 0.3s, color 0.3s;
        }

        .leaderboard-table th, .leaderboard-table td {
            padding: 12px 18px;
            border-bottom: 1px solid #ccc;
            text-align: left;
        }

        .leaderboard-table tr:nth-child(even) {
            transition: background 0.3s;
        }

        .toggle-btn {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 10px 20px;
            cursor: pointer;
            border: none;
            border-radius: 5px;
            background: #007bff;
            color: #fff;
        }

        /* Light mode */
        body.light-mode {
            background-color: #f5f5f5;
            color: #121212;
        }

        body.light-mode .leaderboard-table {
            background-color: #ffffff;
            color: #121212;
        }

        body.light-mode .leaderboard-table th {
            background-color: #e0e0e0;
        }

        body.light-mode .leaderboard-table tr:nth-child(even) {
            background-color: #f0f0f0;
        }

        /* Dark mode */
        body.dark-mode {
            background-color: #121212;
            color: #e0e0e0;
        }

        body.dark-mode .leaderboard-table {
            background-color: #1e1e1e;
            color: #e0e0e0;
        }

        body.dark-mode .leaderboard-table th {
            background-color: #2c2c2c;
        }

        body.dark-mode .leaderboard-table tr:nth-child(even) {
            background-color: #2a2a2a;
        }

        body.dark-mode .leaderboard-table tr:hover {
            background-color: #3a3a3a;
        }
    </style>
</head>
<body>
    <button class="toggle-btn" onclick="toggleTheme()">Toggle Dark/Light Mode</button>

    <div class="leaderboard-title">Leaderboard</div>
    <table class="leaderboard-table">
        <tr>
            <th>Rank</th>
            <th>Username</th>
            <th>Completion (%)</th>
        </tr>
        <?php
        $rank = 1;
        if ($result && $result->num_rows > 0) {
            while($row = $result->fetch_assoc()) {
                echo "<tr>
                        <td>{$rank}</td>
                        <td>".htmlspecialchars($row['username'])."</td>
                        <td>{$row['score']}%</td>
                      </tr>";
                $rank++;
            }
        } else {
            echo "<tr><td colspan='3'>No data available</td></tr>";
        }
        $conn->close();
        ?>
    </table>

    <script>
        const currentTheme = localStorage.getItem('theme') || 'light-mode';
        document.body.classList.add(currentTheme);

        function toggleTheme() {
            const body = document.body;
            if (body.classList.contains('light-mode')) {
                body.classList.remove('light-mode');
                body.classList.add('dark-mode');
                localStorage.setItem('theme', 'dark-mode');
            } else {
                body.classList.remove('dark-mode');
                body.classList.add('light-mode');
                localStorage.setItem('theme', 'light-mode');
            }
        }
    </script>
</body>
</html>
