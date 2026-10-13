CREATE TABLE sc_credenciais_jogo (
    jogador_id BIGINT UNSIGNED NOT NULL,
    senha_hash VARCHAR(255) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
    versao BIGINT UNSIGNED NOT NULL DEFAULT 1,
    senha_alterada_em DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    revogada_em DATETIME(6) DEFAULT NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    PRIMARY KEY (jogador_id),
    CONSTRAINT fk_sc_credenciais_jogador FOREIGN KEY (jogador_id)
        REFERENCES sc_jogadores (id),
    CONSTRAINT chk_sc_credenciais_hash CHECK (
        CHAR_LENGTH(senha_hash) BETWEEN 60 AND 255
        AND (senha_hash LIKE '$argon2id$%' OR senha_hash LIKE '$2y$%' OR senha_hash LIKE '$2b$%')
    ),
    CONSTRAINT chk_sc_credenciais_versao CHECK (versao > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
