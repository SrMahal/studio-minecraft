<?php
declare(strict_types=1);
require dirname(__DIR__) . '/config/admin_auth.php';
sc_session();
if ($_SERVER['REQUEST_METHOD'] !== 'POST' || !sc_valid_csrf()) { http_response_code(400); exit('Solicitação inválida.'); }
$_SESSION = [];
session_destroy();
setcookie(session_name(), '', ['expires' => time() - 3600, 'path' => '/', 'httponly' => true, 'secure' => !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off', 'samesite' => 'Lax']);
header('Location: /login.php'); exit;
