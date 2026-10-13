<?php
declare(strict_types=1);
require dirname(__DIR__) . '/config/admin_auth.php';
$user = sc_require_admin();
header('Cache-Control: private, no-store');
$csrf = sc_csrf();
?>
<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Painel • Studio Minecraft</title><link rel="stylesheet" href="/assets/css/styles.css"><link rel="stylesheet" href="/assets/css/admin.css"></head>
<body><main class="auth-wrap"><section class="auth-card"><a class="auth-back" href="/">← Voltar ao site</a><p class="eyebrow">ADMINISTRAÇÃO</p><h1>Olá, <?=sc_html($user['usuario'])?>.</h1>
<p>Você está autenticado no painel administrativo do StudioCraft.</p>
<?php if ((int)$user['senha_troca_obrigatoria'] === 1): ?><div class="auth-error">Senha provisória detectada. Troque sua senha agora.</div><?php endif; ?>
<h2>Alterar senha</h2><form method="post" action="/alterar-senha.php"><input type="hidden" name="csrf" value="<?=sc_html($csrf)?>"><label>Senha atual<input type="password" name="atual" autocomplete="current-password" required></label><label>Nova senha (mínimo 12 caracteres)<input type="password" name="nova" minlength="12" maxlength="128" autocomplete="new-password" required></label><button class="button primary" type="submit">Atualizar senha</button></form>
<form method="post" action="/logout.php" class="auth-secondary"><input type="hidden" name="csrf" value="<?=sc_html($csrf)?>"><button class="button secondary" type="submit">Sair</button></form>
</section></main></body></html>
