<?
define("DB_USER", '%db.remote.username%');
define("DB_PASSWORD", '%db.remote.password%');
define("DB_NAME", '%db.remote.name%');
define("DB_HOST", '%db.remote.host%');
define("DB_PORT", '%db.remote.port%');

define("DB_DSN", 'mysql:host='. DB_HOST .';port=' . DB_PORT . ';dbname='.DB_NAME);
