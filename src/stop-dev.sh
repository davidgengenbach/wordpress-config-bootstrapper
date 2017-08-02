#!/usr/bin/env sh

sudo nginx -s stop

mysql.server stop

sudo killall php-fpm
