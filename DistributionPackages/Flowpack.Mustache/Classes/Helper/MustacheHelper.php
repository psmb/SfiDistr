<?php
namespace Flowpack\Mustache\Helper;

use Neos\Flow\Annotations as Flow;
use Neos\Eel\ProtectedContextAwareInterface;
use Mustache_Engine as Mustache;

/**
 * Mustache template helper
 */
class MustacheHelper implements ProtectedContextAwareInterface
{
    /**
     * Render mustache template
     *
     * @param string $template
     * @param array $variables
     * @return string
     */
    public function render($template, $variables = [])
    {
        $m = new Mustache;
        return $m->render($template, $variables);
    }

    /**
     * All methods are considered safe
     *
     * @param string $methodName
     * @return boolean
     */
    public function allowsCallOfMethod($methodName)
    {
        return true;
    }
}
