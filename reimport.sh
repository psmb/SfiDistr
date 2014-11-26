#!/bin/sh

ssh dimaip@server.psmb.ru "cd /www/dev.sfi.ru/SfiDistr;./flow site:export --tidy --filename AutoExport/Site.xml;"
cd ~/typo3-app
rsync -avz dimaip@server.psmb.ru:/www/dev.sfi.ru/SfiDistr/AutoExport/ AutoExport
./flow site:prune
./flow site:import --filename Export/Site.xml

