<?php

declare(strict_types=1);

$required = static function (string $name): string {
    $value = getenv($name);
    if (!is_string($value) || $value === '') {
        throw new RuntimeException('Variável de banco ausente: ' . $name);
    }
    return $value;
};

return new PDO(
    sprintf(
        'mysql:host=%s;port=%s;dbname=%s;charset=utf8mb4',
        $required('DB_HOST'),
        $required('DB_PORT'),
        $required('DB_DATABASE')
    ),
    $required('DB_USERNAME'),
    $required('DB_PASSWORD'),
    [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]
);
