<?php
namespace Psmb\Footnote\Fusion;

use Neos\Flow\Annotations as Flow;
use Neos\Fusion\FusionObjects\AbstractFusionObject;

/**
 * A Fusion Object that wraps preg_replace_callback
 */
class PregMatchAllImplementation extends AbstractFusionObject {
    /**
     * Takes subject, pattern and runs replacementRenderer fusion path for every found match
     * having `matches` and `iterator` in context.
     * @return string
     */
    public function evaluate() {
        $pattern = $this->fusionValue('pattern');
        $subject = $this->fusionValue('subject');
        preg_match_all($pattern, $subject, $out, PREG_SET_ORDER);
        return $out;
    }
}
