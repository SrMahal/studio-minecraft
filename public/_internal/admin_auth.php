<?php
declare(strict_types=1);

// Arquivo interno: não é um endpoint HTTP.
if (isset($_SERVER['SCRIPT_FILENAME']) && realpath((string) $_SERVER['SCRIPT_FILENAME']) === __FILE__) {
    http_response_code(404);
    exit;
}
function sc_db(): PDO { return require dirname(__DIR__) . '/config/database.php'; }
function sc_session(): void {
    if (session_status() === PHP_SESSION_ACTIVE) return;
    if (!headers_sent()) {
        ini_set('session.use_strict_mode', '1');
        ini_set('session.use_only_cookies', '1');
        ini_set('session.cookie_httponly', '1');
        ini_set('session.cookie_samesite', 'Lax');
        session_name('studiocraft_admin');
        session_set_cookie_params([
            'lifetime' => 0, 'path' => '/', 'secure' => !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off',
            'httponly' => true, 'samesite' => 'Lax'
        ]);
    }
    session_start();
}
function sc_csrf(): string {
    sc_session();
    if (empty($_SESSION['csrf'])) $_SESSION['csrf'] = bin2hex(random_bytes(32));
    return $_SESSION['csrf'];
}
function sc_valid_csrf(): bool {
    return isset($_POST['csrf']) && is_string($_POST['csrf']) && hash_equals(sc_csrf(), $_POST['csrf']);
}
function sc_admin(): ?array {
    sc_session();
    if (!isset($_SESSION['admin_id'], $_SESSION['last_activity'])) return null;
    if (time() - (int)$_SESSION['last_activity'] > 1800) {
        $_SESSION = []; return null;
    }
    $stmt = sc_db()->prepare('SELECT id, usuario, senha_troca_obrigatoria FROM sc_admins WHERE id = ? AND ativo = 1 LIMIT 1');
    $stmt->execute([(int)$_SESSION['admin_id']]);
    $user = $stmt->fetch();
    if (!$user) { $_SESSION = []; return null; }
    $_SESSION['last_activity'] = time();
    return $user;
}
function sc_require_admin(): array {
    $user = sc_admin();
    if ($user === null) { header('Location: /login.php'); exit; }
    return $user;
}
function sc_html(string $value): string { return htmlspecialchars($value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8'); }
