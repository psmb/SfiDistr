#!/bin/sh
#Export dump stuff from server, sync and import.

set -e
set -u

# No need to do this, as daily dump is created anyways via cron
#ssh www@server.psmb.ru -p 1122 'cd /data/www/sfi.ru/surf/releases/current/ && ./flow db:export --mode=all --sql-file="Data/Persistent/db.sql"'
rsync -rlhvz -e "ssh -p 2222" www@server.psmb.ru:/data/www/sfi.ru/surf/shared/Data/Persistent/ Data/Persistent/
./flow db:import --sql-file="Data/Persistent/db.sql"
