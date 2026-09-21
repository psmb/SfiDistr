<?php
namespace AE\History\ViewHelpers;

use Doctrine\ORM\EntityNotFoundException;
use Neos\Flow\Annotations as Flow;
use Neos\FluidAdaptor\Core\ViewHelper\AbstractConditionViewHelper;
use Neos\FluidAdaptor\Core\ViewHelper\Exception as ViewHelperException;
use Neos\Media\Domain\Model\AssetInterface;
use TYPO3Fluid\Fluid\Core\Rendering\RenderingContextInterface;

/**
 * Checks if an asset exists.
 */
class AssetExistsViewHelper extends AbstractConditionViewHelper
{
    /**
     * @return void
     *
     * @throws ViewHelperException
     */
    public function initializeArguments() : void
    {
        $this->registerArgument('asset', AssetInterface::class, 'The asset to check for existence.', true);
        $this->registerArgument('then', 'mixed', 'Value to be returned if the asset exists.', false);
        $this->registerArgument('else', 'mixed', 'Value to be returned if the asset doesn\'t exist.', false);
    }

    /**
     * @param array|null $arguments
     * @param RenderingContextInterface $renderingContext
     *
     * @return bool
     */
    protected static function evaluateCondition($arguments = null, RenderingContextInterface $renderingContext) : bool
    {
        try {
            $arguments['asset']->getResource();
        } catch (EntityNotFoundException $exception) {
            return false;
        }

        return true;
    }
}
