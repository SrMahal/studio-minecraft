<?php
declare(strict_types=1);
require __DIR__ . '/_internal/admin_auth.php';
$user = sc_require_admin();
if ($_SERVER['REQUEST_METHOD'] !== 'POST' || !sc_valid_csrf()) { http_response_code(400); exit('Solicitação inválida.'); }
$atual = (string)($_POST['atual'] ?? '');
$nova = (string)($_POST['nova'] ?? '');
if (strlen($nova) < 12 || strlen($nova) > 128 || hash_equals($atual, $nova)) { http_response_code(422); exit('Escolha uma nova senha diferente, de 12 a 128 caracteres.'); }
$pdo = sc_db();
$st = $pdo->prepare('SELECT senha_hash FROM sc_admins WHERE id = ? AND ativo = 1');
$st->execute([$user['id']]);
$row = $st->fetch();
if (!$row || !password_verify($atual, $row['senha_hash'])) { http_response_code(403); exit('Senha atual incorreta.'); }
$hash = password_hash($nova, PASSWORD_DEFAULT);
$st = $pdo->prepare('UPDATE sc_admins SET senha_hash = ?, senha_troca_obrigatoria = 0, updated_at = NOW(6) WHERE id = ? AND senha_hash = ?');
$st->execute([$hash, $user['id'], $row['senha_hash']]);
if ($st->rowCount() !== 1) { http_response_code(409); exit('Tente novamente.'); }
session_regenerate_id(true);
header('Location: /painel.php'); exit;
