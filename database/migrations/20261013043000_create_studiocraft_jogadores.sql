CREATE TABLE sc_jogadores (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    uuid CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
    threeebs_usuario_uuid CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
    threeebs_parceiro_uuid CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
    email VARCHAR(190) NOT NULL,
    email_confirmado_em DATETIME(6) NOT NULL,
    nick VARCHAR(16) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL,
    minecraft_uuid CHAR(36) CHARACTER SET ascii COLLATE ascii_bin DEFAULT NULL,
    status VARCHAR(20) CHARACTER SET ascii COLLATE ascii_bin NOT NULL DEFAULT 'pendente',
    parceiro_status VARCHAR(20) CHARACTER SET ascii COLLATE ascii_bin NOT NULL DEFAULT 'nao_verificado',
    parceiro_verificado_em DATETIME(6) DEFAULT NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    UNIQUE KEY uq_sc_jogadores_uuid (uuid),
    UNIQUE KEY uq_sc_jogadores_usuario (threeebs_usuario_uuid),
    UNIQUE KEY uq_sc_jogadores_parceiro (threeebs_parceiro_uuid),
    UNIQUE KEY uq_sc_jogadores_email (email),
    UNIQUE KEY uq_sc_jogadores_nick (nick),
    UNIQUE KEY uq_sc_jogadores_minecraft_uuid (minecraft_uuid),
    KEY idx_sc_jogadores_status (status, parceiro_status),
    CONSTRAINT chk_sc_jogadores_nick CHECK (
        CHAR_LENGTH(nick) BETWEEN 3 AND 16
        AND NOT REGEXP_LIKE(nick, '[^A-Za-z0-9_]', 'c')
    ),
    CONSTRAINT chk_sc_jogadores_email CHECK (
        CHAR_LENGTH(email) BETWEEN 3 AND 190
        AND OCTET_LENGTH(email) = OCTET_LENGTH(TRIM(email))
    ),
    CONSTRAINT chk_sc_jogadores_status CHECK (
        status IN ('pendente', 'ativo', 'suspenso', 'revogado')
    ),
    CONSTRAINT chk_sc_jogadores_parceiro CHECK (
        parceiro_status IN ('nao_verificado', 'ativo', 'inativo')
    ),
    CONSTRAINT chk_sc_jogadores_acesso CHECK (
        status <> 'ativo'
        OR (parceiro_status = 'ativo' AND parceiro_verificado_em IS NOT NULL)
    )
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
