<?php
namespace Flowpack\Mustache\Fusion;

use Neos\Flow\Annotations as Flow;
use Neos\Fusion\FusionObjects\AbstractArrayFusionObject;
use Mustache_Engine as Mustache;

/**
 * Mustache template Fusion object
 */
class TemplateImplementation extends AbstractArrayFusionObject
{
    /**
     * Override prototype name
     *
     * @return string
     */
    public function getOverridePrototypeName()
    {
        return $this->fusionValue('overridePrototypeName');
    }

    /**
     * Render the Uri.
     *
     * @return string The rendered URI or NULL if no URI could be resolved for the given node
     * @throws NeosException
     */
    public function evaluate()
    {
        $prototypeName = $this->getOverridePrototypeName() ?: $this->fusionObjectName;
        list($packageKey, $relativeName) = explode(':', $prototypeName, 2);
        if (strpos($relativeName, '.') !== false) {
            list($namespace, $namespacedName) = explode('.', $relativeName, 2);
            $templatePath = 'resource://' . $packageKey . '/Private/Fusion/' . $namespace . '/' . $namespacedName . '/' . $namespacedName . '.html';
        } else {
            $templatePath = 'resource://' . $packageKey . '/Private/Fusion/' . $relativeName . '/' . $relativeName . '.html';
        }
        $template = file_get_contents($templatePath);

        $variables = [];
        foreach ($this->properties as $key => $value) {
            if (in_array($key, $this->ignoreProperties)) {
                continue;
            }
            $evaluatedValue = $this->fusionValue($key);
            $variables[$key] = $evaluatedValue;
        }

        $m = new Mustache;
        return $m->render($template, $variables);
    }
}
