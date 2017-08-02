<?php 
include('db_credentials.php');
include_once('mysqldump-php/src/Ifsnop/Mysqldump/Mysqldump.php');

$dump = new Ifsnop\Mysqldump\Mysqldump(DB_DSN, DB_USER, DB_PASSWORD);
$SQL_FILENAME = 'dumps/'. DB_NAME.'_'.date("Ymd-His", time()).'.sql';
$dump->start($SQL_FILENAME);
#echo 'Exported to: ' . dirname(__FILE__) . $SQL_FILENAME;
echo 'Exported to: ' . $SQL_FILENAME;
?>