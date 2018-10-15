<?php
namespace Sfi\Sfi\TypoScript;

/*
 * Borrowed from: https://raw.githubusercontent.com/neos/neos-development-collection/e4e9180b075055a2e47b9024f9c2d467f80da94a/Neos.Fusion/Classes/FusionObjects/ReductionImplementation.php
 */

use Neos\Flow\Annotations as Flow;
use Neos\Fusion\Exception as FusionException;
use Neos\Fusion\FusionObjects\AbstractFusionObject;

/**
 * Reduce an array to a single value.
 */
class ReduceImplementation extends AbstractFusionObject
{
	/**
	 * The number of rendered nodes, filled only after evaluate() was called.
	 *
	 * @var integer
	 */
	protected $numberOfRenderedNodes;

	/**
	 * The list items that shall be reduced to a single value
	 *
	 * @return iterable
	 */
	public function getItems()
	{
		return $this->fusionValue('items');
	}

	/**
	 * @return string
	 */
	public function getItemName()
	{
		return $this->fusionValue('itemName');
	}

	/**
	 * @return string
	 */
	public function getItemKey()
	{
		return $this->fusionValue('itemKey');
	}

	/**
	 * @return string
	 */
	public function getCarryName()
	{
		return $this->fusionValue('carryName');
	}

	/**
	 * @return string
	 */
	public function getInitialValue()
	{
		return $this->fusionValue('initialValue');
	}

	/**
	 * If set iteration data (index, cycle, isFirst, isLast) is available in context with the name given.
	 *
	 * @return string
	 */
	public function getIterationName()
	{
		return $this->fusionValue('iterationName');
	}

	/**
	 * Reduce the given items to a single value
	 *
	 * @return mixed
	 * @throws FusionException
	 */
	public function evaluate()
	{
		$items = $this->getItems();
		$value = $this->getInitialValue();

		if ($items === null) {
			return $value;
		}
		$this->numberOfRenderedNodes = 0;
		$itemName = $this->getItemName();
		if ($itemName === null) {
			throw new FusionException('The Reduction needs an itemName to be set.', 1537890155);
		}
		$carryName = $this->getCarryName();
		if ($carryName === null) {
			throw new FusionException('The Reduction needs an carryName to be set.', 1537890148);
		}
		$itemKeyName = $this->getItemKey();
		$iterationName = $this->getIterationName();
		$collectionTotalCount = count($items);
		foreach ($items as $itemKey => $item) {
			$context = $this->runtime->getCurrentContext();
			$context[$itemName] = $item;
			$context[$carryName] = $value;
			if ($itemKeyName !== null) {
				$context[$itemKeyName] = $itemKey;
			}
			if ($iterationName !== null) {
				$context[$iterationName] = $this->prepareIterationInformation($collectionTotalCount);
			}
			$this->runtime->pushContextArray($context);
			$value = $this->runtime->render($this->path . '/itemRenderer');
			$this->runtime->popContext();
			$this->numberOfRenderedNodes++;
		}
		return $value;
	}

	/**
	 * @param integer $collectionCount
	 * @return array
	 */
	protected function prepareIterationInformation($collectionCount)
	{
		$iteration = array(
			'index' => $this->numberOfRenderedNodes,
			'cycle' => ($this->numberOfRenderedNodes + 1),
			'isFirst' => false,
			'isLast' => false,
			'isEven' => false,
			'isOdd' => false
		);

		if ($this->numberOfRenderedNodes === 0) {
			$iteration['isFirst'] = true;
		}
		if (($this->numberOfRenderedNodes + 1) === $collectionCount) {
			$iteration['isLast'] = true;
		}
		if (($this->numberOfRenderedNodes + 1) % 2 === 0) {
			$iteration['isEven'] = true;
		} else {
			$iteration['isOdd'] = true;
		}

		return $iteration;
	}
}
