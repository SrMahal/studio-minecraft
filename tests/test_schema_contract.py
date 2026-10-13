"""Static checks against the initial Threeebs project migration contract."""

import pathlib
import re
import unittest

ROOT = pathlib.Path(__file__).resolve().parents[1]
MIGRATIONS = ROOT / 'database' / 'migrations'


def validate_policy(sql):
    # Mirrors project_migration_validate_policy and the additive production
    # classifier at the Edge revision recorded in THREEEBS_INTEGRATION.md.
    blocked = [
        r'\b(?:CREATE|DROP|ALTER)\s+(?:DATABASE|SCHEMA|USER)\b',
        r'\b(?:GRANT|REVOKE)\b', r'\bUSE\s+[`a-z0-9_]+',
        r'\bSET\s+(?:GLOBAL|PERSIST)\b', r'\bLOAD\s+DATA\b',
        r'\bINTO\s+(?:OUTFILE|DUMPFILE)\b',
        r'\bINSTALL\s+(?:PLUGIN|COMPONENT)\b',
        r'(?:^|\n)\s*(?:SOURCE|DELIMITER)\b', r'(?:--|#|/\*)',
    ]
    for pattern in blocked:
        if re.search(pattern, sql, re.I):
            raise ValueError('instruction outside project policy')
    statements = [s.strip() for s in sql.split(';') if s.strip()]
    if not statements:
        raise ValueError('empty migration')
    for statement in statements:
        normalized = re.sub(r'\s+', ' ', statement)
        danger = re.sub(r'\bON\s+DELETE\s+(?:CASCADE|RESTRICT|SET\s+NULL|NO\s+ACTION)\b', '', normalized, flags=re.I)
        if re.search(r'\b(?:DROP|TRUNCATE|RENAME|DELETE|UPDATE|REPLACE|MODIFY|CHANGE)\b', danger, re.I):
            raise ValueError('destructive operation')
        if not (
            re.match(r'^CREATE\s+TABLE\b', normalized, re.I)
            or re.match(r'^CREATE\s+(?:UNIQUE\s+)?INDEX\b', normalized, re.I)
            or re.match(r'^ALTER\s+TABLE\s+(?:`[a-z0-9_]+`|[a-z][a-z0-9_]*)\s+ADD\s+(?:COLUMN\s+|INDEX\s+|KEY\s+|CONSTRAINT\s+)?', normalized, re.I)
        ):
            raise ValueError('non-additive operation')


class SchemaContractTest(unittest.TestCase):
    def test_manifest_and_production_policy(self):
        files = sorted(MIGRATIONS.iterdir())
        self.assertEqual(len(files), 2)
        for path in files:
            with self.subTest(path=path.name):
                self.assertRegex(path.name, r'^[0-9]{14}_[a-z0-9][a-z0-9_]{0,80}\.sql$')
                self.assertFalse(path.is_symlink())
                data = path.read_bytes()
                self.assertTrue(1 <= len(data) <= 1048576)
                sql = data.decode('utf-8')
                validate_policy(sql)
                self.assertNotIn('_threeebs_migrations', sql)
                self.assertNotIn('threeebs_control.', sql)
                self.assertNotIn('threeebs_identity.', sql)

    def test_policy_rejects_provisioning_and_automatic_update(self):
        for sql in (
            'CREATE DATABASE other;', 'USE other;',
            'CREATE TABLE t (updated_at DATETIME ON UPDATE CURRENT_TIMESTAMP);',
            'DELETE FROM t;', '-- comment\nCREATE TABLE t (id INT);',
        ):
            with self.subTest(sql=sql):
                with self.assertRaises(ValueError):
                    validate_policy(sql)

    def test_private_paths_and_connection_contract(self):
        self.assertFalse((ROOT / 'public' / 'database').exists())
        self.assertFalse((ROOT / 'public' / 'config').exists())
        source = (ROOT / 'config' / 'database.php').read_text()
        for name in ('DB_HOST', 'DB_PORT', 'DB_DATABASE', 'DB_USERNAME', 'DB_PASSWORD'):
            self.assertIn("$required('" + name + "')", source)
        self.assertIn('PDO::ATTR_EMULATE_PREPARES => false', source)


if __name__ == '__main__':
    unittest.main()
