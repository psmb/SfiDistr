#!/bin/sh
#Export dump stuff from server, sync and import.

set -e
set -u

ssh dimaip@server.psmb.ru "cd /www/sfi.ru/SfiDistr;./flow site:export --tidy --filename AutoExport/Site.xml;"
rsync -avz dimaip@server.psmb.ru:/www/sfi.ru/SfiDistr/AutoExport/ AutoExport
rm -rf Data/Temporary/Development/Cache/
./flow site:prune
./flow site:import --filename AutoExport/Site.xml
rm -rf Data/Temporary