<?php
namespace Sfi\Shared\ViewHelpers;

/*                                                                        *
 * This script belongs to the TYPO3 Flow package "Neos.FluidAdaptor".           *
 *                                                                        *
 * It is free software; you can redistribute it and/or modify it under    *
 * the terms of the GNU Lesser General Public License, either version 3   *
 * of the License, or (at your option) any later version.                 *
 *                                                                        *
 * The TYPO3 project - inspiring people to share!                         *
 *                                                                        */

use Neos\FluidAdaptor\Core\ViewHelper\AbstractConditionViewHelper;

class IfOrViewHelper extends AbstractConditionViewHelper {

    /**
     * renders <f:then> child if $condition or $or is true, otherwise renders <f:else> child.
     *
     * @param boolean $condition View helper condition
     * @param boolean $or View helper condition
     * @return string the rendered string
     */
    public function render($condition, $or) {
        if ($condition || $or) {
            return $this->renderThenChild();
        } else {
            return $this->renderElseChild();
        }
    }
}
