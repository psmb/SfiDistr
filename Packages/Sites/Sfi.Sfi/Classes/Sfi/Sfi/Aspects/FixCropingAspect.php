<?php
namespace Sfi\Sfi\Aspects;

use TYPO3\Flow\Annotations as Flow;
use TYPO3\Flow\Aop\JoinPointInterface;
use TYPO3\Media\Domain\Model\ImageInterface;

/**
 * @Flow\Aspect
 * @Flow\Scope("singleton")
 */
class FixCropingAspect {

	/**
	 * @param \TYPO3\Flow\AOP\JoinPointInterface $joinPoint
	 * @Flow\Before("method(TYPO3\Media\Domain\Model\Adjustment\ResizeImageAdjustment->__construct())")
	 * @return void
	 */
	public function fixThumbnailerBehavior(JoinPointInterface $joinPoint) {
		$options = $joinPoint->getMethodArgument('options');

		if (
			isset($options['ratioMode'])
			&& $options['ratioMode'] == ImageInterface::RATIOMODE_OUTBOUND
			&& !isset($options['width'])
			&& isset($options['maximumWidth'])
			&& !isset($options['height'])
			&& isset($options['maximumHeight'])
		){
				$options['height'] = $options['maximumHeight'];
				unset($options['maximumHeight']);

				$options['width'] = $options['maximumWidth'];
				unset($options['maximumWidth']);
		}

		$joinPoint->setMethodArgument('options', $options);
	}

}
