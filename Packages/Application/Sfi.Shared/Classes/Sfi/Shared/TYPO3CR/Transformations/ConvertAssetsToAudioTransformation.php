<?php
namespace Sfi\Shared\TYPO3CR\Transformations;

/*                                                                        *
 * This script belongs to the TYPO3 Flow package "Sfi.Shared".                *
 *                                                                        */

use Neos\Flow\Annotations as Flow;
use TYPO3\TYPO3CR\Migration\Transformations\AbstractTransformation;

/**
 * Convert AssetList to Sfi.Shared:AudioAsset
 */
class ConvertAssetsToAudioTransformation extends AbstractTransformation {

	/**
	 * @var string
	 */
	protected $sourcePropertyName = 'assets';

	/**
	 * @var string
	 */
	protected $targetPropertyName = 'asset';

	/**
	 * @var string
	 */
	protected $assetType;

	/**
	 * @var string
	 */
	protected $targetNodeType;

	/**
	 * Sets the name of the asset node type.
	 *
	 * @param string $assetType
	 * @return void
	 */
	public function setAssetType($assetType) {
		$this->assetType = $assetType;
	}

	/**
	 * Sets the name of the target node type.
	 *
	 * @param string $targetNodeType
	 * @return void
	 */
	public function setTargetNodeType($targetNodeType) {
		$this->targetNodeType = $targetNodeType;
	}

	/**
	 * @Flow\Inject
	 * @var \TYPO3\TYPO3CR\Domain\Service\NodeTypeManager
	 */
	protected $nodeTypeManager;

	/**
	 * Should only work for nodes with source property and without target property
	 *
	 * @param \TYPO3\TYPO3CR\Domain\Model\NodeData $node
	 * @return boolean
	 */
	public function isTransformable(\TYPO3\TYPO3CR\Domain\Model\NodeData $node) {
		return $node->hasProperty($this->sourcePropertyName) && !$node->hasProperty($this->targetPropertyName);
	}

	/**
	 * If AssetList contains only 1 file, and it's of type Audio, turn it into targetNodeType
	 *
	 * @param \TYPO3\TYPO3CR\Domain\Model\NodeData $node
	 * @return void
	 */
	public function execute(\TYPO3\TYPO3CR\Domain\Model\NodeData $node) {
		$assets = $node->getProperty($this->sourcePropertyName);
		if (count($assets) === 1) {
			$asset = $assets[0];
			if ($asset instanceof $this->assetType) {
				$nodeType = $this->nodeTypeManager->getNodeType($this->targetNodeType);
				$node->setNodeType($nodeType);
				$node->setProperty($this->targetPropertyName, $asset);
				$node->removeProperty($this->sourcePropertyName);
				echo "Converted AssetList with asset of type" . $this->assetType . " to node of type " . $this->targetNodeType . "\n";
			}
		}
	}
}
