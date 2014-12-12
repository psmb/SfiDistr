<?php
use TYPO3\Surf\Domain\Model\Workflow;
use TYPO3\Surf\Domain\Model\Node;
use TYPO3\Surf\Domain\Model\SimpleWorkflow;

/** @var \TYPO3\Surf\Domain\Model\Deployment $deployment */

$workflow = new \TYPO3\Surf\Domain\Model\SimpleWorkflow();
$deployment->setWorkflow($workflow);


$node = new \TYPO3\Surf\Domain\Model\Node('sfi');
$node->setHostname('sfi.ru');
$node->setOption('username', 'dimaip');

$application = new \TYPO3\Surf\Application\TYPO3\Flow();
$application->setDeploymentPath('/mnt/db/fast_sfi/surf');
$application->setOption('repositoryUrl', 'git@github.com:sfi-ru/SfiDistr.git');
$application->setOption('composerCommandPath', '/usr/local/bin/composer');
$application->addNode($node);

$deployment->addApplication($application);
?>
