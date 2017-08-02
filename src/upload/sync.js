// TODO: resource managment - see https://github.com/petkaantonov/bluebird/blob/master/API.md#resource-management
var helper = require('./helper'),
    Bluebird = require('bluebird'),
    R = require('ramda');

module.exports = {
    syncLocalChangesWithRemote: syncLocalChangesWithRemote,
    getServerDiff: getServerDiff,
    syncFromRemoteDiff: syncFromRemoteDiff,
    sync: sync
};

function sync() {
    return getServerDiff().then(syncFromRemoteDiff);
}

function syncFromRemoteDiff() {
    console.log('syncFromRemoteDiff');
    return Bluebird
        .all([helper.getLocalFiles(), require('./output/remote-files.json')])
        .spread(uploadFileDiff)
        // Update remote-files store - remote is now synced with local again
        .then(helper.getLocalFiles)
        .then(R.prop('files'))
        .then(helper.writeJSONFileSync('output/remote-files.json'));
}

function syncLocalChangesWithRemote() {
    console.log('syncLocalChangesWithRemote');
    return Bluebird
        .all([helper.getLocalFiles(), require('./output/local-files.json')])
        .spread(uploadFileDiff);
}

function getServerDiff() {
    console.log('getServerDiff');
    return Bluebird
        .all([helper.getLocalFiles(), helper.getRemoteFiles()])
        .spread(function(localFiles, remoteFiles) {
            helper.writeJSONFileSync('output/local-files.json', localFiles);
            helper.writeJSONFileSync('output/remote-files.json', remoteFiles);
        })
        .finally(helper.closeFTPClient);
}

function uploadFileDiff(filesA, filesB) {
    console.log('uploadFileDiff');
    return Bluebird
        .resolve([filesA, filesB])
        .then(R.pluck('files'))
        .spread(helper.getChangedFiles)
        .tap(helper.writeJSONFileSync('./output/changed-files.json'))
        .then(helper.putFilesOnServer)
        .catch(console.error)
        .then(helper.getLocalFiles)
        // Save changes back
        .then(helper.writeJSONFileSync('./output/local-files.json'))
        .finally(helper.closeFTPClient);
}
