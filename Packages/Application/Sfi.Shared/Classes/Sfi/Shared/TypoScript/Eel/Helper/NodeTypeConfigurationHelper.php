<?php
namespace Sfi\Shared\TypoScript\Eel\Helper;

use Neos\Flow\Annotations as Flow;
use TYPO3\Eel\ProtectedContextAwareInterface;
use Neos\Flow\Configuration\ConfigurationManager;

/**
 * Configuration helpers for Eel contexts
 */
class NodeTypeConfigurationHelper implements ProtectedContextAwareInterface {

	/**
	 * @Flow\Inject
	 * @var \TYPO3\TYPO3CR\Domain\Service\NodeTypeManager
	 */
	protected $nodeTypeManager;

	/**
	 * Return nodeTypes
	 *
	 * @return mixed
	 */
	public function getNodeTypes() {
		return $this->nodeTypeManager->getNodeTypes(FALSE);
	}

	/**
	 * Return nodeType
	 *
	 * @param string $nodeTypeName
	 * @return mixed
	 */
	public function getNodeType($nodeTypeName) {
		return $this->nodeTypeManager->getNodeType($nodeTypeName);
	}

	/**
	 * All methods are considered safe
	 *
	 * @param string $methodName
	 * @return boolean
	 */
	public function allowsCallOfMethod($methodName) {
		return TRUE;
	}

}
