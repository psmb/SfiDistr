<?php
use TYPO3\Surf\Domain\Model\Workflow;
use TYPO3\Surf\Domain\Model\Node;
use TYPO3\Surf\Domain\Model\SimpleWorkflow;

/** @var \TYPO3\Surf\Domain\Model\Deployment $deployment */

$workflow = new \TYPO3\Surf\Domain\Model\SimpleWorkflow();

// Cherry-pick Media Package fix
$workflow->defineTask('sfi.sfi:cherry-pick',
        'typo3.surf:shell',
        array('command' => 'cd {releasePath} && cd Packages/Application/TYPO3.Media/ && git fetch http://review.typo3.org/Packages/TYPO3.Media refs/changes/11/36411/1 && git cherry-pick FETCH_HEAD')
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
$application->setOption('gitPostCheckoutCommands', array(
        'Packages/Application/TYPO3.Media/' => array('git fetch http://review.typo3.org/Packages/TYPO3.Media refs/changes/11/36411/1 && git cherry-pick FETCH_HEAD')
));
$application->addNode($node);

$workflow->addTask('sfi.sfi:cherry-pick', 'migrate', $application);
$workflow->addTask('sfi.sfi:initialize', 'migrate', $application);
$workflow->addTask('sfi.sfi:smoketest', 'test', $application);
$workflow->setEnableRollback(FALSE);

$deployment->setWorkflow($workflow);
$deployment->addApplication($application);

?>