#!/usr/bin/env sh

./project.sh dump-db

USER_NAME='%ftp.user%'
PASSWORD='%ftp.password%'
SERVER='%ftp.host%'
SRDB_URL="https://$SERVER/db/srdb"
ADMINER_URL="https://$SERVER/db/adminer.php"
DUMP_FILE=$(ls dumps | sort -r | head -n1)
REMOTE_DUMP_FILE="dump.sql"

REMOTE_DIR="%utils.dbUtilsPath%"

# Upload local dump to ftp server
# and disable basic auth protection temporarily
lftp -d -u $USER_NAME,$PASSWORD $SERVER <<EOF
    set ftp:ssl-allow no
    cd $REMOTE_DIR
    put dumps/$DUMP_FILE  -o $REMOTE_DUMP_FILE
    mv .htaccess .disabled.htaccess
    exit
EOF

# Import database
open "https://$SERVER/db/update_db.php"

sleep 12
#read -p 'Press [Enter] key to continue...'

lftp -d -e "set ftp:ssl-allow no; cd $REMOTE_DIR; mv .disabled.htaccess .htaccess; exit" -u $USER_NAME,$PASSWORD $SERVER

echo

echo "DONT FORGET TO CLEAR CACHE IF FONTS ETC. CAN NOT BE LOADED"