#!/usr/bin/env sh

cd bootstrap/upload && ./cli.js sync-local && cd ../..

./project.sh dump-db
./project.sh update-server-db

# Warm up cache
#./project crawl