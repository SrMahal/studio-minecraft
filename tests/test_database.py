"""Execute schema invariants in a disposable MySQL 8.4 database.

Requires the mysql CLI; use TEST_MYSQL_* only with a disposable test server.
Never connects to the Threeebs production database.
"""

import concurrent.futures
import os
import pathlib
import re
import shutil
import subprocess
import uuid

ROOT = pathlib.Path(__file__).resolve().parents[1]


def literal(value):
    return "'" + value.replace("'", "''") + "'"


def main():
    if not shutil.which('mysql'):
        raise RuntimeError('Cliente mysql ausente; execute em ambiente de testes MySQL 8.4.')
    required = ('TEST_MYSQL_HOST', 'TEST_MYSQL_PORT', 'TEST_MYSQL_USER', 'TEST_MYSQL_PASSWORD')
    if any(not os.environ.get(name) for name in required):
        raise RuntimeError('Defina TEST_MYSQL_HOST, TEST_MYSQL_PORT, TEST_MYSQL_USER e TEST_MYSQL_PASSWORD.')
    command = [
        'mysql', '--protocol=TCP', '--connect-timeout=5', '--batch', '--raw',
        '--skip-column-names', '--default-character-set=utf8mb4',
        '--host=' + os.environ['TEST_MYSQL_HOST'],
        '--port=' + os.environ['TEST_MYSQL_PORT'],
        '--user=' + os.environ['TEST_MYSQL_USER'],
    ]
    environment = os.environ.copy()
    environment['MYSQL_PWD'] = os.environ['TEST_MYSQL_PASSWORD']
    database = 'studiocraft_test_' + uuid.uuid4().hex
    created = False
    passed = 0

    def raw(sql, use_database=True):
        args = command + (['--database=' + database] if use_database else [])
        return subprocess.run(args, input=sql, text=True, capture_output=True, env=environment, timeout=30)

    def execute(sql, use_database=True):
        result = raw(sql, use_database)
        if result.returncode:
            # Do not print submitted SQL, credentials or connection environment.
            raise AssertionError('MySQL falhou: ' + result.stderr.strip())
        return result.stdout.strip()

    def rejects(label, sql, code):
        nonlocal passed
        result = raw(sql)
        if result.returncode == 0 or not re.search(r'\bERROR ' + str(code) + r'\b', result.stderr):
            raise AssertionError(label + ': esperava erro MySQL ' + str(code) + '; ' + result.stderr.strip())
        passed += 1
        print('PASS:', label)

    def equal(label, sql, expected):
        nonlocal passed
        if execute(sql) != expected:
            raise AssertionError(label)
        passed += 1
        print('PASS:', label)

    def player(nick='Mahal', email='mahal@example.invalid', **overrides):
        values = {
            'uuid': str(uuid.uuid4()), 'threeebs_usuario_uuid': str(uuid.uuid4()),
            'threeebs_parceiro_uuid': str(uuid.uuid4()), 'email': email,
            'email_confirmado_em': '2026-10-13 04:30:00.000000', 'nick': nick,
        }
        values.update(overrides)
        sql = 'INSERT INTO sc_jogadores (' + ','.join(values) + ') VALUES ('
        sql += ','.join(literal(v) for v in values.values()) + ');'
        return values, sql

    try:
        version = execute('SELECT VERSION();', False)
        if not re.match(r'^8\.4\.', version):
            raise RuntimeError('Este teste requer MySQL 8.4; recebido ' + version)
        execute('CREATE DATABASE `' + database + '` CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;', False)
        created = True
        for path in sorted((ROOT / 'database' / 'migrations').glob('*.sql')):
            execute(path.read_text())
        equal('tres tabelas criadas', 'SELECT COUNT(*) FROM information_schema.tables WHERE table_schema=DATABASE();', '3')

        first, sql = player()
        execute(sql)
        equal('conta inicia sem acesso', 'SELECT CONCAT(status,",",parceiro_status) FROM sc_jogadores;', 'pendente,nao_verificado')
        _, sql = player(nick='mahal', email='other@example.invalid')
        rejects('nick sem distinguir caixa', sql, 1062)
        _, sql = player(nick='Outro', email='MAHAL@example.invalid')
        rejects('email duplicado', sql, 1062)
        for field in ('uuid', 'threeebs_usuario_uuid', 'threeebs_parceiro_uuid'):
            _, sql = player(nick='Outro', email='other@example.invalid', **{field: first[field]})
            rejects('vinculo unico: ' + field, sql, 1062)
        for nick in ('ab', 'a-b', 'nome com espaco', 'abc!', 'abc\n'):
            _, sql = player(nick=nick, email='invalid@example.invalid')
            rejects('nick invalido ' + repr(nick), sql, 3819)
        _, sql = player(nick='a' * 17, email='long@example.invalid')
        rejects('nick acima de 16 caracteres', sql, 1406)
        _, sql = player(nick='Outro', email=' other@example.invalid')
        rejects('email com espaco externo', sql, 3819)
        rejects('email confirmado obrigatorio', 'INSERT INTO sc_jogadores (uuid,threeebs_usuario_uuid,threeebs_parceiro_uuid,email,nick) VALUES (' + ','.join(literal(str(uuid.uuid4())) for _ in range(3)) + ",'other@example.invalid','Outro');", 1364)
        rejects('estado invalido', "UPDATE sc_jogadores SET status='qualquer';", 3819)
        rejects('parceiro invalido', "UPDATE sc_jogadores SET parceiro_status='qualquer';", 3819)
        rejects('ativo exige parceiro verificado', "UPDATE sc_jogadores SET status='ativo';", 3819)
        rejects('ativo exige data de verificacao', "UPDATE sc_jogadores SET status='ativo',parceiro_status='ativo';", 3819)
        execute("UPDATE sc_jogadores SET status='ativo',parceiro_status='ativo',parceiro_verificado_em='2026-10-13 04:30:00';")
        rejects('parceiro inativo impede acesso ativo', "UPDATE sc_jogadores SET parceiro_status='inativo';", 3819)
        execute("UPDATE sc_jogadores SET status='revogado',parceiro_status='inativo';")
        equal('revogacao conjunta aceita', 'SELECT status FROM sc_jogadores;', 'revogado')

        jogador_id = execute('SELECT id FROM sc_jogadores;')
        # Synthetic format only: never used as a real credential or seed.
        password_hash = '$2y$12$' + 'A' * 53
        rejects('senha em texto puro recusada', 'INSERT INTO sc_credenciais_jogo (jogador_id,senha_hash) VALUES (' + jogador_id + ",'senha-plana');", 3819)
        rejects('hash sem algoritmo recusado', 'INSERT INTO sc_credenciais_jogo (jogador_id,senha_hash) VALUES (' + jogador_id + ',' + literal('A' * 60) + ');', 3819)
        rejects('hash curto recusado', 'INSERT INTO sc_credenciais_jogo (jogador_id,senha_hash) VALUES (' + jogador_id + ",'$2y$12$curto');", 3819)
        rejects('credencial orfa recusada', 'INSERT INTO sc_credenciais_jogo (jogador_id,senha_hash) VALUES (999999,' + literal(password_hash) + ');', 1452)
        execute('INSERT INTO sc_credenciais_jogo (jogador_id,senha_hash) VALUES (' + jogador_id + ',' + literal(password_hash) + ');')
        rejects('uma credencial por jogador', 'INSERT INTO sc_credenciais_jogo (jogador_id,senha_hash) VALUES (' + jogador_id + ',' + literal(password_hash) + ');', 1062)
        rejects('versao de credencial positiva', 'UPDATE sc_credenciais_jogo SET versao=0;', 3819)
        rejects('integridade jogador credencial', 'DELETE FROM sc_jogadores;', 1451)
        execute('UPDATE sc_credenciais_jogo SET revogada_em=CURRENT_TIMESTAMP(6);')
        equal('revogacao de credencial persistida', 'SELECT COUNT(*) FROM sc_credenciais_jogo WHERE revogada_em IS NOT NULL;', '1')

        _, sql = player(nick='abc', email='minimum@example.invalid')
        execute(sql)
        _, sql = player(nick='A' * 15 + '_', email='maximum@example.invalid')
        execute(sql)
        equal('limites de nick aceitos', 'SELECT COUNT(*) FROM sc_jogadores;', '3')
        execute("UPDATE sc_jogadores SET minecraft_uuid='11111111-1111-4111-8111-111111111111' WHERE id=" + jogador_id + ';')
        rejects('uuid Minecraft unico', "UPDATE sc_jogadores SET minecraft_uuid='11111111-1111-4111-8111-111111111111' WHERE nick='abc';", 1062)

        race = [player(nick='Corrida', email='race' + str(i) + '@example.invalid')[1] for i in range(2)]
        with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
            results = list(pool.map(raw, race))
        if sorted(r.returncode == 0 for r in results) != [False, True]:
            raise AssertionError('Envios simultaneos devem criar apenas um nick.')
        failed = next(r for r in results if r.returncode)
        if not re.search(r'\bERROR 1062\b', failed.stderr):
            raise AssertionError('Conflito simultaneo deve ser de unicidade.')
        passed += 1
        print('PASS: nick unico em envios simultaneos')
        print(str(passed) + ' verificacoes MySQL 8.4 passaram.')
    finally:
        if created:
            execute('DROP DATABASE `' + database + '`;', False)


if __name__ == '__main__':
    main()
