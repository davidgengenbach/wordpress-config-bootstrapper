var ftp = require('ftp');
var R = require('ramda');
var Bluebird = require('bluebird');
var ftpsync = require('ftpsync');
var ftpConfig = require('./config.json');
var fs = require('fs');

var ftpClient;

var encoding = {
    encoding: 'utf-8'
};

module.exports = {
    getLocalFiles: function() {
        return getFiles(LOCAL);
    },
    getRemoteFiles: function() {
        return getFiles(REMOTE);
    },
    writeJSONFileSync: R.curry(function(filename, data) {
        fs.writeFileSync(filename, JSON.stringify(data, null, '\t'), encoding);
    }),
    readJSONFileSync: R.pipe(R.curry(fs.readFileSync)(R.__, encoding), JSON.parse),
    getFTPClient: getFTPClient,
    putOnServer: putOnServer,
    getChangedFiles: function(filesA, filesB) {
        filesA = prepareFiles(filesA);
        filesB = prepareFiles(filesB);

        return R.reduce(function(acc, fileName) {
            var filesBFile = filesB[fileName],
                filesAFile = filesA[fileName];

            var existsOnfilesB = !!filesBFile,
                existsfilesBButChanged = existsOnfilesB && filesBFile.size === filesAFile.size;

            // File exists on filesA, but not on filesB
            if (!existsOnfilesB || !existsfilesBButChanged) {
                acc[fileName] = filesAFile;
            }

            return acc;
        }, {}, R.keys(filesA));
    },
    closeFTPClient: function() {
        if (ftpClient && ftpClient.end)
            ftpClient.end();
    },
    normalizeFilename: function(str) {
        var replacements = [];

        return R.reduce(function(acc, replacement) {
            return acc.replace(replacement[0], replacement[1]);
        }, str, replacements);
    },
    putFilesOnServer: function(fileNames) {
        var preparedFilenames = prepareFilenames(fileNames);
        return new Bluebird(function(res, rej) {
            getFTPClient(ftpConfig, function() {
                var index = 1;

                Bluebird
                    .map(preparedFilenames, function(file, fileIndex, count) {
                        console.log('Uploading file ', index + 1, '/', count, '(', file.remote, ')');
                        index++;
                        return putOnServer(file.local, file.remote);
                    }, {
                        concurrency: 1
                    })
                    .then(res)
                    .catch(console.error)
                    .catch(rej);
            });
        });
    },
    prepareFilenames: prepareFilenames
};

function prepareFiles(t) {
    return R.reduce(function(acc, file) {
        acc[file.id] = file;
        return acc;
    }, {}, t);
}

function prepareFilenames(files, localPrefix, remotePrefix) {
    localPrefix = localPrefix || ftpConfig.local;
    remotePrefix = remotePrefix || ftpConfig.remote;

    files = R.reduce(function(acc, filename) {
        acc.push(filename);
        return acc;
    }, [], R.keys(files));

    return R.map(function(file) {
        return {
            local: localPrefix + file,
            remote: remotePrefix + file
        };
    }, files);
}

function getFTPClient(settings, cb) {
    ftpClient = new ftp();
    ftpClient.on('ready', function() {
        cb(ftpClient);
    });

    ftpClient.on('error', function(err) {
        console.error('Error at getting ftp client:', err);
    });

    ftpClient.connect(settings);
}

function createFolder(folder) {
    return new Bluebird(function(resolve, reject) {
        ftpClient.mkdir(folder, true, function(err) {
            if (err) {
                console.error("Error creating folder:", err);
                reject(err);
            }
            else resolve();
        });
    });
}


function putOnServer(local, remote) {
    var CODE_DIR_NOT_EXISTENT = 550;
    return new Bluebird(function(resolve, reject) {
        ftpClient.put(local, remote, function(err) {
            if (err && err.code === CODE_DIR_NOT_EXISTENT) {
                var directory = R.init(remote.split('/')).join('/');
                console.info("CREATING DIRECTORY", directory);
                return createFolder(directory)
                    .then(putOnServer.bind(null, local, remote))
                    .then(resolve);
            }

            if(err) {
                console.error('Error put on server', err);
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

var REMOTE = 0,
    LOCAL = 1;

function getFiles(mode) {
    var path = mode === REMOTE ? ftpsync.settings.remote : ftpsync.settings.local,
        walkFn = mode === REMOTE ? ftpsync.utils.walkRemote : ftpsync.utils.walkLocal;

    walkFn = walkFn.bind(ftpsync.utils);
    return new Bluebird(function(res, rej) {
        ftpsync.setup(function() {
            walkFn(path, function(err, files) {
                if (err) rej(err);
                else res(files);
            });
        });
    });
}
