#!/usr/bin/env sh

SQL_DUMP=$1
DATABASE="%db.local.name%"

if [[ -z $SQL_DUMP ]] || [[ ! -e $SQL_DUMP ]]; then
    echo "Usage: $0 DUMP_FILE.sql"
    exit 1
fi

mysql -uroot $DATABASE < $SQL_DUMP

cd bootstrap/db/srdb
HOST="%db.local.host%"
NAME=$DATABASE
USER="%db.local.username%"
PASSWORD="%db.local.password%"
SEARCH="%domain.remote%"
REPLACE="%domain.local%"
VERBOSE=-v
#DRY_RUN=--dry-run

php srdb.cli.php --host $HOST --name $NAME --user $USER --pass $PASSWORD --search $SEARCH --replace $REPLACE $DRY_RUN $VERBOSE