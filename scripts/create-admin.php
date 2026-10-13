<?php
declare(strict_types=1);
// Executar apenas via CLI no ambiente autorizado, nunca pela web.
if (PHP_SAPI !== 'cli') { http_response_code(403); exit; }
$usuario = getenv('STUDIOCRAFT_INITIAL_ADMIN_USER') ?: 'MAHAL';
$senha = getenv('STUDIOCRAFT_INITIAL_ADMIN_PASSWORD');
if (!is_string($senha) || $senha === '') { fwrite(STDERR, "Defina STUDIOCRAFT_INITIAL_ADMIN_PASSWORD no ambiente CLI.\n"); exit(1); }
if (!preg_match('/^[A-Za-z0-9_]{3,40}$/', $usuario)) { fwrite(STDERR, "Usuário inválido.\n"); exit(1); }
$pdo = require dirname(__DIR__) . '/config/database.php';
$st = $pdo->prepare('SELECT id FROM sc_admins WHERE usuario = ? LIMIT 1');
$st->execute([$usuario]);
if ($st->fetch()) { fwrite(STDERR, "Usuário já existe; não foi sobrescrito.\n"); exit(1); }
$hash = password_hash($senha, PASSWORD_DEFAULT);
$st = $pdo->prepare('INSERT INTO sc_admins (usuario, senha_hash, senha_troca_obrigatoria) VALUES (?, ?, 1)');
$st->execute([$usuario, $hash]);
fwrite(STDOUT, "Administrador criado. Troque a senha no primeiro acesso.\n");
