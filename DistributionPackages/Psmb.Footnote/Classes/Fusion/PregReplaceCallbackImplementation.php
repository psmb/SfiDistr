<?php
namespace Psmb\Footnote\Fusion;

use Neos\Flow\Annotations as Flow;
use Neos\Fusion\FusionObjects\AbstractFusionObject;

/**
 * A Fusion Object that wraps preg_replace_callback
 */
class PregReplaceCallbackImplementation extends AbstractFusionObject {
    /**
     * Takes subject, pattern and runs replacementRenderer fusion path for every found match
     * having `matches` and `iterator` in context.
     * @return string
     */
    public function evaluate() {
        $pattern = $this->fusionValue('pattern');
        $subject = $this->fusionValue('subject');
        $index = 0;
        return preg_replace_callback($pattern, function ($matches) use (&$index) {
            $context = [
                'matches' => $matches,
                'iterator' => ['cycle' => $index + 1, 'index' => $index]
            ];
            $this->runtime->pushContextArray($context);
            $result =  $this->runtime->render($this->path . '/replacementRenderer');
            $this->runtime->popContext();
            $index++;
            return $result;
        }, $subject);
    }
}