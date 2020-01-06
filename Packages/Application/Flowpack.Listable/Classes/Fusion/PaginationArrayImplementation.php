<?php

namespace Flowpack\Listable\Fusion;

use Neos\Flow\Annotations as Flow;
use Neos\Fusion\FusionObjects\AbstractFusionObject;

class PaginationArrayImplementation extends AbstractFusionObject
{
	/**
	 * @return Array
	 */
	public function evaluate()
	{
		$maximumNumberOfLinks = $this->fusionValue('maximumNumberOfLinks') - 2;
		$itemsPerPage = $this->fusionValue('itemsPerPage');
		$count = $this->fusionValue('count');
		$currentPage = $this->fusionValue('currentPage');
		if ($count > 0 !== true) {
			return [];
		}
		$numberOfPages = ceil($count / $itemsPerPage);
		if ($maximumNumberOfLinks > $numberOfPages) {
			$maximumNumberOfLinks = $numberOfPages;
		}
		$delta = floor($maximumNumberOfLinks / 2);
		$displayRangeStart = $currentPage - $delta;
		$displayRangeEnd = $currentPage + $delta + ($maximumNumberOfLinks % 2 === 0 ? 1 : 0);
		if ($displayRangeStart < 1) {
			$displayRangeEnd -= $displayRangeStart - 1;
		}
		if ($displayRangeEnd > $numberOfPages) {
			$displayRangeStart -= ($displayRangeEnd - $numberOfPages);
		}
		$displayRangeStart = (int) max($displayRangeStart, 1);
		$displayRangeEnd = (int) min($displayRangeEnd, $numberOfPages);
		$links = \range($displayRangeStart, $displayRangeEnd);
		if ($displayRangeStart > 2) {
			array_unshift($links, "...");
			array_unshift($links, 1);
		}
		if ($displayRangeEnd + 1 < $numberOfPages) {
			$links[] = "...";
			$links[] = $numberOfPages;
		}
		return $links;
	}
}
