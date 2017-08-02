<?php

include('db_credentials.php');
$dsn = DB_DSN;
$user = DB_USER;
$password = DB_PASSWORD;

$db = new PDO($dsn, $user, $password);
$sql = file_get_contents('dump.sql');
$qr = $db->exec($sql);
echo $qr;
?>