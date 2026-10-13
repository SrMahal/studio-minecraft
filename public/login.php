<?php
declare(strict_types=1);
require __DIR__ . '/_internal/admin_auth.php';
sc_session();
if (sc_admin() !== null) { header('Location: /painel.php'); exit; }
header('Cache-Control: no-store');
$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!sc_valid_csrf()) {
        http_response_code(400);
        $error = 'Sessão expirada. Recarregue a página.';
    } else {
        $usuario = trim((string)($_POST['usuario'] ?? ''));
        $senha = (string)($_POST['senha'] ?? '');
        try {
            $db = sc_db();
            $st = $db->prepare('SELECT * FROM sc_admins WHERE usuario = ? LIMIT 1');
            $st->execute([$usuario]);
            $admin = $st->fetch();
            $locked = $admin && $admin['bloqueado_ate'] !== null && strtotime($admin['bloqueado_ate']) > time();
            $valid = $admin && !$locked && (int)$admin['ativo'] === 1 && password_verify($senha, $admin['senha_hash']);
            if ($valid) {
                $st = $db->prepare('UPDATE sc_admins SET tentativas_falhas = 0, bloqueado_ate = NULL, ultimo_login_em = NOW(6), updated_at = NOW(6) WHERE id = ?');
                $st->execute([$admin['id']]);
                session_regenerate_id(true);
                $_SESSION['admin_id'] = (int)$admin['id'];
                $_SESSION['last_activity'] = time();
                header('Location: /painel.php'); exit;
            }
            if ($admin && !$locked) {
                $st = $db->prepare('UPDATE sc_admins SET tentativas_falhas = tentativas_falhas + 1, bloqueado_ate = CASE WHEN tentativas_falhas + 1 >= 5 THEN DATE_ADD(NOW(6), INTERVAL 15 MINUTE) ELSE NULL END, updated_at = NOW(6) WHERE id = ?');
                $st->execute([$admin['id']]);
            }
            usleep(250000);
            $error = 'Usuário ou senha inválidos, ou acesso temporariamente bloqueado.';
        } catch (Throwable $e) {
            error_log('StudioCraft login indisponível: ' . get_class($e));
            http_response_code(503);
            $error = 'Login indisponível no momento.';
        }
    }
}
$csrf = sc_csrf();
?>
<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Entrar • Studio Minecraft</title><link rel="stylesheet" href="/assets/css/styles.css"><link rel="stylesheet" href="/assets/css/admin.css"></head>
<body><main class="auth-wrap"><section class="auth-card"><a class="auth-back" href="/">← Studio Minecraft</a><p class="eyebrow">ACESSO RESTRITO</p><h1>Entrar no painel.</h1><p>Use as credenciais administrativas do StudioCraft.</p>
<?php if ($error !== ''): ?><div class="auth-error" role="alert"><?=sc_html($error)?></div><?php endif; ?>
<form method="post" action="/login.php"><input type="hidden" name="csrf" value="<?=sc_html($csrf)?>"><label>Usuário<input name="usuario" maxlength="40" autocomplete="username" required autofocus></label><label>Senha<input name="senha" type="password" autocomplete="current-password" required></label><button class="button primary" type="submit">Entrar</button></form>
</section></main></body></html>
