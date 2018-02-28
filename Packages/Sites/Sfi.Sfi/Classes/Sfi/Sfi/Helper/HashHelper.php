<?php
namespace Sfi\Sfi\Helper;

use Neos\Flow\Annotations as Flow;
use Neos\Eel\ProtectedContextAwareInterface;
use Mustache_Engine as Mustache;

class HashHelper implements ProtectedContextAwareInterface
{
    /**
     * @Flow\Inject
     * @var \Neos\Flow\Security\Cryptography\HashService
     */
    protected $hashService;

    /**
     * @param string $template
     * @param array $variables
     * @return string
     */
    public function generateHmac($content)
    {
        return $this->hashService->generateHmac($content);
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
