<?php
use TYPO3\Surf\Domain\Model\Workflow;
use TYPO3\Surf\Domain\Model\Node;
use TYPO3\Surf\Domain\Model\SimpleWorkflow;

/** @var \TYPO3\Surf\Domain\Model\Deployment $deployment */

$workflow = new \TYPO3\Surf\Domain\Model\SimpleWorkflow();

$workflow->defineTask('sfi.sfi:beard',
        'typo3.surf:localshell',
        array('command' => 'cd /home/ubuntu/SfiDistr && git config --global user.email "dimaip@gmail.com" &&  git config --global user.name "Dmitri Pisarev (CircleCI)" && ./beard patch')
);
$workflow->defineTask('sfi.sfi:initialize',
        'typo3.surf:shell',
        array('command' => 'cd {releasePath} && cp Configuration/Production/Settings.yaml Configuration/Settings.yaml && FLOW_CONTEXT=Production ./flow flow:cache:flush --force && chmod g+rwx -R . && FLOW_CONTEXT=Production ./flow cache:warmup')
);
$smokeTestOptions = array(
        'url' => 'http://next.sfi.ru',
        'remote' => TRUE,
        'expectedStatus' => 200,
        'expectedRegexp' => '/Page--Main/'
);
$workflow->defineTask('sfi.sfi:smoketest', 'typo3.surf:test:httptest', $smokeTestOptions);

$node = new \TYPO3\Surf\Domain\Model\Node('sfi');
$node->setHostname('server.psmb.ru');
$node->setOption('username', 'dimaip');

$application = new \TYPO3\Surf\Application\TYPO3\Flow();
$application->setDeploymentPath('/www/sfi.ru/surf');
$application->setOption('repositoryUrl', 'git@github.com:sfi-ru/SfiDistr.git');
$application->setOption('composerCommandPath', '/usr/local/bin/composer');
$application->setOption('keepReleases', 10);

// Use rsync for transfer instead of composer
$application->setOption('transferMethod', 'rsync');
//$application->setOption('packageMethod', 'git');
$application->setOption('updateMethod', NULL);
$application->setOption('rsyncFlags', "--recursive --omit-dir-times --perms --links --delete --delete-excluded --exclude '.git'");

$application->addNode($node);

$workflow->afterStage('package', 'sfi.sfi:beard', $application);
$workflow->addTask('sfi.sfi:initialize', 'migrate', $application);
$workflow->addTask('sfi.sfi:smoketest', 'test', $application);
$workflow->setEnableRollback(FALSE);

$deployment->setWorkflow($workflow);
$deployment->addApplication($application);

?>