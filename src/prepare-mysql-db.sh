#!/usr/bin/env sh

USERNAME="%db.local.username%"
PASSWORD="%db.local.password%"
DATABASE_NAME="%db.local.name%"

#mysql_secure_installation

mysql -uroot -e "CREATE DATABASE $DATABASE_NAME";
mysql -uroot -D $DATABASE_NAME -e "GRANT ALL PRIVILEGES ON $DATABASE_NAME.* TO \"$USERNAME\"@\"localhost\" IDENTIFIED BY \"$PASSWORD\";"

mysql -uroot -D $DATABASE_NAME -e "FLUSH PRIVILEGES;"