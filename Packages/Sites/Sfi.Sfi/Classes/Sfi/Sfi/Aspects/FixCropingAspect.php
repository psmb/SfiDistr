<?php
namespace Sfi\Sfi\Aspects;

use Neos\Flow\Annotations as Flow;
use Neos\Flow\Aop\JoinPointInterface;
use Neos\Media\Domain\Model\ImageInterface;

/**
 * @Flow\Aspect
 * @Flow\Scope("singleton")
 */
class FixCropingAspect {

	/**
	 * @param \Neos\Flow\Aop\JoinPointInterface $joinPoint
	 * @Flow\Before("method(Neos\Media\Domain\Model\Adjustment\ResizeImageAdjustment->__construct())")
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
