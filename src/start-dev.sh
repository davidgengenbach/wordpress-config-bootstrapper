#!/usr/bin/env sh

./bootstrap/stop-dev.sh

mysql.server start

sudo php-fpm --daemonize

sudo nginx