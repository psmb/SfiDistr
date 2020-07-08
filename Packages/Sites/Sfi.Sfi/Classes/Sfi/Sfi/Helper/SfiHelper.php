<?php
namespace Sfi\Sfi\Helper;

use Neos\Flow\Annotations as Flow;
use Neos\Eel\ProtectedContextAwareInterface;

class SfiHelper implements ProtectedContextAwareInterface
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
     * @param string $url
     * @return array
     */
    public function fetch($url)
    {
        $raw = file_get_contents($url);
        return json_decode($raw, true);
    }

    public function number_format($number , $decimals = 0, $dec_point = ".", $thousands_sep = ",")
    {
        return number_format($number, $decimals, $dec_point, $thousands_sep);
    }

    public function sortByLastName($nodes)
    {
        \usort($nodes, function ($a, $b) {
            $authorAExploded = explode(' ', $a->getProperty('author'));
            $authorBExploded = explode(' ', $b->getProperty('author'));
            $lastNameA = end($authorAExploded);
            $lastNameB = end($authorBExploded);
            $lastNameA = $lastNameA ? $lastNameA : 'яяя';
            $lastNameB = $lastNameB ? $lastNameB : 'яяя';
            return strcasecmp($lastNameA, $lastNameB);
        });
        return $nodes;
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
