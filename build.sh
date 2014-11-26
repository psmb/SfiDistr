#!/bin/sh

ssh dimaip@server.psmb.ru "cd /www/dev.sfi.ru/SfiDistr;./flow site:export --tidy --filename AutoExport/Site.xml;"
cd ~/sfi-dev
rsync -avz dimaip@server.psmb.ru:/www/dev.sfi.ru/SfiDistr/AutoExport/ AutoExport
rm -rf Data/Temporary/Development/Cache/
./flow site:prune
./flow site:import --filename AutoExport/Site.xml
rm -rf Data/Temporary/Development/Cache/

