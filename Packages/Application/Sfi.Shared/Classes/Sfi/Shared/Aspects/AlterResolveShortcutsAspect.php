<?php
namespace Sfi\Shared\Aspects;

use TYPO3\Flow\Annotations as Flow;
use TYPO3\Flow\Aop\JoinPointInterface;
use TYPO3\TYPO3CR\Domain\Model\NodeInterface;

/**
 * @Flow\Scope("singleton")
 * @Flow\Aspect
 */
class AlterResolveShortcutsAspect {

	protected $legitShortcutTargets = array('parentNode', 'firstChildNode', 'selectedTarget');

	/**
	 * @Flow\Before("method(TYPO3\Neos\Service\LinkingService->createNodeUri())")
	 * @param \TYPO3\Flow\Aop\JoinPointInterface $joinPoint The current join point
	 * @return void
	 */
	public function dontResolveShortcuts(JoinPointInterface $joinPoint) {
		$node = $joinPoint->getMethodArgument('node');
		
		if ($node instanceof NodeInterface) {
			if (!in_array($node->getProperty('targetMode'), $this->legitShortcutTargets)) {
				$joinPoint->setMethodArgument('resolveShortcuts', FALSE);
			}
		} else {
			$joinPoint->setMethodArgument('resolveShortcuts', FALSE);
		}
	}

	/**
	 * @Flow\Around("method(TYPO3\Neos\Controller\Frontend\NodeController->handleShortcutNode())")
	 * @param \TYPO3\Flow\Aop\JoinPointInterface $joinPoint The current join point
	 * @return void
	 */
	public function dontResolveShortcutsInFrontend(JoinPointInterface $joinPoint) {
		$node = $joinPoint->getMethodArgument('node');
		if ($node instanceof NodeInterface) {
			if (in_array($node->getProperty('targetMode'), $this->legitShortcutTargets)) {
				$joinPoint->getAdviceChain()->proceed($joinPoint);
			}
		}
	}
}
