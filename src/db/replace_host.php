<?php

include('db_credentials.php');

// php 5.3 date timezone requirement, shouldn't affect anything
date_default_timezone_set( 'Europe/London' );

// include the srdb class
require_once( realpath( dirname( __FILE__ ) ) . '/srdb/srdb.class.php' );

$args = array(
    'verbose' => 1,
    'dry_run' => false,
    'host' => DB_HOST,
    'name' => DB_NAME,
    'user' => DB_USER,
    'port' => DB_PORT,
    'pass' => DB_PASSWORD,
    'search' => '%domain.local%',
    'replace' => '%domain.remote%'
);


// modify the log output
class icit_srdb_cli extends icit_srdb {

    public function log( $type = '' ) {

        $args = array_slice( func_get_args(), 1 );

        $output = "";

        switch( $type ) {
            case 'error':
                list( $error_type, $error ) = $args;
                $output .= "$error_type: $error";
                break;
            case 'search_replace_table_start':
                list( $table, $search, $replace ) = $args;
                $output .= "{$table}: replacing {$search} with {$replace}";
                break;
            case 'search_replace_table_end':
                list( $table, $report ) = $args;
                $time = number_format( $report[ 'end' ] - $report[ 'start' ], 8 );
                $output .= "{$table}: {$report['rows']} rows, {$report['change']} changes found, {$report['updates']} updates made in {$time} seconds";
                break;
            case 'search_replace_end':
                list( $search, $replace, $report ) = $args;
                $time = number_format( $report[ 'end' ] - $report[ 'start' ], 8 );
                $dry_run_string = $this->dry_run ? "would have been" : "were";
                $output .= "
Replacing {$search} with {$replace} on {$report['tables']} tables with {$report['rows']} rows
{$report['change']} changes {$dry_run_string} made
{$report['updates']} updates were actually made
It took {$time} seconds";
                break;
            case 'update_engine':
                list( $table, $report, $engine ) = $args;
                $output .= $table . ( $report[ 'converted' ][ $table ] ? ' has been' : 'has not been' ) . ' converted to ' . $engine;
                break;
            case 'update_collation':
                list( $table, $report, $collation ) = $args;
                $output .= $table . ( $report[ 'converted' ][ $table ] ? ' has been' : 'has not been' ) . ' converted to ' . $collation;
                break;
        }

        if ( $this->verbose )
            echo $output . "\n";

    }

}

$report = new icit_srdb_cli( $args );
?>