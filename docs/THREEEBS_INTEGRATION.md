# Contrato de identidade e autorização — implementação seguinte

## Decisão

O parceiro usa a conta Threeebs para comprovar sua identidade no website.
O StudioCraft armazena os dados de jogo em seu banco de projeto e tem senha
própria para autenticação por nick no Minecraft. A senha principal da Threeebs
não é copiada, recebida pelo jogo ou usada como seed.

Esta entrega implementa somente schema e conexão. Nenhum SSO, webhook receptor,
formulário de jogador, envio de e-mail ou mod de autenticação está implementado.

## Fonte confiável

Uma integração autenticada de servidor para servidor deverá comprovar:

- UUID da conta Threeebs e que o usuário está ativo;
- UUID de parceiro com vínculo à mesma conta;
- candidatura aprovada e parceiro ativo;
- e-mail confirmado e data da confirmação.

O backend StudioCraft só aceita esses campos dessa integração. Campos ocultos
de formulário, parâmetros de URL, localStorage e nick declarado pelo navegador
não são prova de identidade ou autorização. Não consulte os bancos internos
com a credencial do projeto; ela só tem acesso ao banco do próprio ambiente.

A API de editor `/api/v1/` existente no Edge não fornece esse contrato de
identidade para jogos. O adapter central ainda precisa ser implementado.
Também será necessário definir o caminho de rede autorizado: o runtime PHP
isolado da Threeebs documenta egress externo indisponível. Não basta adicionar
uma URL ao projeto ou abrir conexão direta ao MySQL interno.

## Criação de jogador

1. Autenticar a pessoa pela Threeebs e obter uma confirmação confiável de parceiro.
2. Receber apenas nick e senha específica do jogo no formulário StudioCraft.
3. Validar o nick inteiro (`[A-Za-z0-9_]{3,16}`), UUIDs, e-mail e senha no backend.
4. Consultar disponibilidade do nick para feedback, sem considerar essa consulta
   uma reserva. No INSERT, tratar a restrição UNIQUE como decisão definitiva,
   inclusive para envios simultâneos. Não revelar e-mail de outro jogador.
5. Em uma transação, inserir ou localizar a conta pelo UUID Threeebs e criar a
   credencial via `password_hash` (Argon2id quando disponível ou bcrypt compatível).
   Não substituir silenciosamente um nick/e-mail de outro usuário em um upsert.
6. Preservar estado `pendente` até cumprir a política de liberação. Aprovação de
   parceiro, definição de senha e liberação local são verificações distintas.

O nick e o e-mail não podem ser reutilizados em outra conta. O mesmo e-mail pode
existir nos dois sistemas por representar a mesma pessoa. Mudança de e-mail
central deve atualizar o registro pelo UUID, não criar um novo jogador; eventual
conflito é tratado pelo backend. A senha do jogo é um segredo separado, nunca um
hash importado da Threeebs. Não devolver `senha_hash` em DTOs, logs ou eventos.

## Acesso e revogação

`sc_jogadores.status`: `pendente`, `ativo`, `suspenso`, `revogado`.
`parceiro_status` registra apenas a última confirmação central:
`nao_verificado`, `ativo`, `inativo`.

Para negar acesso quando o parceiro for desativado, a integração futura deve
atualizar **na mesma operação** `status='revogado'` (ou `suspenso`),
`parceiro_status='inativo'`, `parceiro_verificado_em` e `updated_at`.
Um registro local antigo não concede permissão permanente. Revalide a autorização
ao iniciar sessão; indisponibilidade da confirmação central nega novas sessões.
Sessões existentes também precisam de política de expiração e revogação.

Ao trocar senha, incremente `sc_credenciais_jogo.versao` e atualize explicitamente
`senha_alterada_em` e `updated_at`; a implementação seguinte deverá invalidar
sessões antigas. `revogada_em` preenchido impede autenticação mesmo com hash válido.

## Minecraft em outro servidor

O Compose atual de `threeebs/minecraft-servidor` usa Fabric 26.2 e
`ONLINE_MODE: FALSE`. Um mod compatível no servidor poderá receber o comando de
login por nick e senha própria e consultar uma API HTTPS StudioCraft, autenticando
também o servidor chamador. Até a validação, ações do jogador devem ficar bloqueadas.
Comandos com senha não podem ser divulgados no chat ou registrados em logs;
o transporte cliente-jogo em modo offline também precisa ser protegido/avaliado
antes de liberar esse método. Proteger só mod→API com HTTPS não protege todo o caminho.

Nick e UUID offline não comprovam posse de conta oficial. `minecraft_uuid` só deve
ser preenchido por uma fonte confiável do servidor e não substitui autenticação.
Cada sessão offline precisa de validação. O banco não reserva nicks globalmente.

## Referências inspecionadas

Base Edge: `8133ce3aecb643c76ac9e6b3452604f5d4f3a938`.

- [Scaffold de conexão](https://github.com/threeebs/threeebs-edge/blob/8133ce3aecb643c76ac9e6b3452604f5d4f3a938/modules/core/app/shared/scaffold_project_database.php)
- [Políticas de migrations](https://github.com/threeebs/threeebs-edge/blob/8133ce3aecb643c76ac9e6b3452604f5d4f3a938/modules/core/app/shared/project_migrations.php)
- [Migrations de Produção](https://github.com/threeebs/threeebs-edge/blob/8133ce3aecb643c76ac9e6b3452604f5d4f3a938/docs/PRODUCTION_MIGRATIONS.md)
- [Runtime PHP isolado](https://github.com/threeebs/threeebs-edge/blob/8133ce3aecb643c76ac9e6b3452604f5d4f3a938/docs/PHP_RUNTIME_PHASE5.md)

Essas referências guiam o contrato; não são copiadas para o repositório público.
