#!/usr/bin/env node

var commander = require('commander'),
    sync = require('./sync');

function exitOnReturn(fn) {
    return function() {
        fn().then(process.exit).catch(function(err) {
            console.error("Err", err);
            process.exit(1);
        });
    };
}

commander
    .version('0.0.0.0.0.1');

commander
    .command('sync')
    .description('sync remote with all local changes (diffs and uploads diffs from remote and local)')
    .action(exitOnReturn(sync.sync));

commander
    .command('sync-local')
    .description('uploads local changes (diff local remote repo with local)')
    .action(exitOnReturn(sync.syncLocalChangesWithRemote));

commander
    .command('sync-remote-from-local')
    .description('this doesn\'t make sense anymore')
    .action(exitOnReturn(sync.syncFromRemoteDiff));

commander
    .command('sync-remote')
    .description('gets diff from remote to local and saves to local repo')
    .action(exitOnReturn(sync.getServerDiff));

commander.parse(process.argv);