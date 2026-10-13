# Banco do StudioCraft — primeira etapa

Schema de aplicação para o banco de projeto **já provisionado pela Threeebs**.
Compatível com MySQL 8.4. Não cria outro servidor MySQL, database ou usuário.

## Estrutura

- `migrations/`: migrations SQL imutáveis, em ordem `AAAAMMDDHHMMSS_nome.sql`.
- `../config/database.php`: conexão PDO igual ao scaffold de projeto da Threeebs.
- Nenhum seed de pessoa, senha ou parceiro: a primeira etapa cria tabelas vazias.

Somente `public/` deve ser servido pela hospedagem. `config/`, `database/`,
`docs/` e `tests/` ficam fora da raiz pública. O nome físico do database é o
definido pela plataforma para aquele ambiente, não um nome fixo no SQL.

## Tabelas

| Tabela | Responsabilidade |
| --- | --- |
| `sc_jogadores` | Conta de jogo vinculada ao usuário e ao parceiro Threeebs, e-mail confirmado, nick, identificação Minecraft opcional e estado de acesso |
| `sc_credenciais_jogo` | Um hash de senha exclusiva do jogo por jogador, versão e revogação da credencial |

`threeebs_usuario_uuid` e `threeebs_parceiro_uuid` são identificadores externos.
Não há foreign key para `threeebs_identity` ou `threeebs_control`: os bancos
podem estar em servidores diferentes. O vínculo local de credencial usa FK
InnoDB para `sc_jogadores`, com restrição padrão contra remoção de jogador que
ainda tem credencial.

## Regras garantidas pelo banco

- Uma conta de jogador por UUID de usuário e por UUID de parceiro Threeebs.
- Nick único sem distinguir maiúsculas/minúsculas: `Mahal` e `mahal` conflitam.
- Nick de 3 a 16 caracteres ASCII: letras, números e `_`.
- E-mail único conforme a collation usada pelo cadastro central
  (`utf8mb4_0900_ai_ci`). O backend deve aplicar `trim` e normalização para
  minúsculas antes de persistir. Espaços externos são recusados pelo banco.
- UUID local e UUID Minecraft, quando preenchido, únicos. UUIDs devem ser
  validados e normalizados para a forma canônica em minúsculas pelo backend.
- Conta nasce `pendente`, parceiro nasce `nao_verificado`.
- `ativo` exige snapshot de parceiro `ativo` com data de verificação.
- Uma credencial por jogador; somente formato com prefixo de hash suportado
  e comprimento mínimo é aceito. Esse CHECK não comprova a validade criptográfica:
  o backend deve gerar o hash com `password_hash` e validar com `password_verify`.

O schema **não verifica remotamente** a aprovação do parceiro nem a idade do
snapshot. Não autoriza login sozinho: a API futura deve verificar usuário ativo,
candidatura aprovada, parceiro ativo, acesso local ativo, credencial presente e
não revogada, e a senha. Se não conseguir confirmar a autorização central,
deve negar novas sessões.

## Aplicar na Threeebs

1. No projeto StudioCraft, copie `database/migrations/` para a raiz do projeto
   no Sandbox, ao lado de `public/`. Preserve `config/database.php` provisionado
   se ele já seguir o contrato das variáveis abaixo.
2. Confira que está no banco **Sandbox do StudioCraft**, examine tabelas e
   histórico existentes e faça backup antes de aplicar. Estas migrations iniciais
   são destinadas a um schema sem as tabelas `sc_*`; não sobreponha tabelas
   preexistentes com o mesmo nome.
3. Use a área **Migrations** do editor Threeebs para executar os dois arquivos
   em ordem. O runner gerencia `_threeebs_migrations` e checksums; o projeto não
   deve criar ou alterar essa tabela de controle.
4. Verifique as tabelas e o histórico. Não edite migration já aplicada: evoluções
   recebem outro arquivo com nova data/hora.
5. Após validar Sandbox, crie uma Release e use a publicação pela plataforma.
   O operador aplica as migrations da Release no banco próprio de Produção,
   antes de ativar os arquivos. Dados de Sandbox não são copiados para Produção.

As migrations não contêm comentários, `USE`, `CREATE DATABASE`, comandos de
usuário, grants, dados ou operações destrutivas. `updated_at` é atualizado
explicitamente pelo backend futuro: `ON UPDATE CURRENT_TIMESTAMP` seria recusado
pelo scanner aditivo atual da Threeebs.

Não reaplique SQL manualmente: o controle de repetição é do runner e seu checksum.
O DDL MySQL pode fazer commit implícito; não existe rollback automático de banco.

## Conexão

O runtime da plataforma fornece `DB_HOST`, `DB_PORT`, `DB_DATABASE`,
`DB_USERNAME` e `DB_PASSWORD`. Não coloque credenciais em arquivos do projeto,
JavaScript ou Git. Um backend PHP futuro carregará a conexão com:

```php
$pdo = require dirname(__DIR__) . '/config/database.php';
```

Esta etapa não habilita runtime PHP, não cria endpoint e não inicia conexão
durante a navegação: o website público existente continua estático.

## Validação

`python3 tests/test_schema_contract.py` verifica o contrato dos arquivos e a
política aditiva do Edge usada como referência. É uma conferência estática,
não substitui executar o SQL.

`python3 tests/test_database.py` executa SQL e casos de conflito em MySQL 8.4.
Precisa do cliente `mysql` e de servidor **descartável de testes**, com
`TEST_MYSQL_HOST`, `TEST_MYSQL_PORT`, `TEST_MYSQL_USER` e
`TEST_MYSQL_PASSWORD`. O script cria um database aleatório com prefixo
`studiocraft_test_` e o remove ao terminar. Não use credenciais de produção.

O workflow do GitHub executa ambos e o lint PHP contra um serviço MySQL 8.4
descartável. As fixtures usam apenas identidades e hashes sintéticos.
