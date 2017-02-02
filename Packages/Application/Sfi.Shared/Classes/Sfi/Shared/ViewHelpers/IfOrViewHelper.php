<?php
namespace Sfi\Shared\ViewHelpers;

use Neos\FluidAdaptor\Core\ViewHelper\AbstractConditionViewHelper;

class IfOrViewHelper extends AbstractConditionViewHelper {

    /**
     * @return void
     */
    public function initializeArguments()
    {
        $this->registerArgument('condition', 'mixed', 'Condition 1', false);
        $this->registerArgument('or', 'mixed', 'Condition 2', false);
    }

    /**
     * renders <f:then> child if $condition or $or is true, otherwise renders <f:else> child.
     *
     * @return string the rendered string
     */
    public function render() {
        if ($this->arguments['condition'] || $this->arguments['or']) {
            return $this->renderThenChild();
        } else {
            return $this->renderElseChild();
        }
    }
}
