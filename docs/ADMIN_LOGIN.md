# Login administrativo provisório — StudioCraft

## Escopo

O painel administrativo local usa `sc_admins`, separado de `sc_jogadores`. Não é login SSO da Threeebs nem autenticação dentro do servidor Minecraft.

## Instalação

1. Aplique a nova migration pelo runner da Threeebs no Sandbox e depois na Produção segundo o fluxo de Release.
2. Confirme que o site executa PHP e que `public/` é a única pasta exposta. `app/`, `config/` e `scripts/` não podem ser servidos publicamente.
3. Em um terminal administrativo **do ambiente correto**, com variáveis `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD` fornecidas pela plataforma, rode:

```bash
read -rsp "Senha provisória: " STUDIOCRAFT_INITIAL_ADMIN_PASSWORD; echo
export STUDIOCRAFT_INITIAL_ADMIN_PASSWORD
STUDIOCRAFT_INITIAL_ADMIN_USER=MAHAL php scripts/create-admin.php
unset STUDIOCRAFT_INITIAL_ADMIN_PASSWORD
```

Para o teste solicitado, digite a senha provisória **12345** no prompt (não a coloque no Git ou histórico de shell). A senha fica armazenada somente como hash. Alterar imediatamente após o primeiro login em `/login.php`.

Se a hospedagem Sandbox não permite executar CLI com PDO e acesso ao DB, o bootstrap precisa ser feito por mecanismo administrativo seguro da Threeebs; não exponha um endpoint público para executar seed.

## Cuidados

- HTTPS obrigatório em produção (cookie Secure depende do HTTPS visto pelo PHP).
- Sessões expiram por inatividade após 30 minutos; 5 tentativas falhas bloqueiam conta por 15 minutos.
- Troca da senha provisória é sinalizada no painel; **a navegação do painel ainda é limitada**, e um painel administrativo futuro deverá bloquear operações sensíveis enquanto não houver troca.
- O login não substitui identidade central nem valida jogadores. Expor senha provisória fraca em ambiente público, mesmo com limitação de tentativas, não é recomendado.
- Checklist antes da publicação: testar PHP/PDO, sessão, headers HTTPS/proxy, CSRF, login, logout, lockout, troca de senha e permissões das pastas.
