#!/usr/bin/env sh

DATABASE="%db.local.name%"
DATE=`date +"%y%m%d_%H%M%S"`
FILENAME="${DATE}_dump.sql"
USER="%db.local.username%"

mysqldump $DATABASE -u$USER > dumps/$FILENAME
