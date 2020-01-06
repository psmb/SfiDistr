<?php

namespace Sfi\Sfi\TypoScript;

use Neos\Flow\Annotations as Flow;
use Neos\Flow\Log\SystemLoggerInterface;
use Neos\Fusion\FusionObjects\AbstractFusionObject;
use Neos\Neos\Exception as NeosException;

/**
 * Create a link to a node
 */
class RedirectImplementation extends AbstractFusionObject
{

	/**
	 * Url for redirect
	 *
	 * @return string
	 */
	public function getUrl()
	{
		return $this->fusionValue('url');
	}

	/**
	 * Render the redirect.
	 *
	 */
	public function evaluate()
	{
		$url = $this->getUrl();
		if ($url) {
			header('Location: ' . $url, true, 301);
			die("Redirect successful: " . $url);
		} else {
			die("Ссылка не предоставлена (Redirect)");
		}
	}
}
