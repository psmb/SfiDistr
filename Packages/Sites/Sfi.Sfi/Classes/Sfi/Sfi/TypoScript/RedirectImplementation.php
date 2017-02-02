<?php
namespace Sfi\Sfi\TypoScript;

/*                                                                        *
 * This script belongs to the TYPO3 Flow package "TYPO3.Neos".            *
 *                                                                        *
 * It is free software; you can redistribute it and/or modify it under    *
 * the terms of the GNU General Public License, either version 3 of the   *
 * License, or (at your option) any later version.                        *
 *                                                                        *
 * The TYPO3 project - inspiring people to share!                         *
 *                                                                        */

use Neos\Flow\Annotations as Flow;
use Neos\Flow\Log\SystemLoggerInterface;
use TYPO3\TypoScript\TypoScriptObjects\AbstractTypoScriptObject;
use TYPO3\Neos\Exception as NeosException;

/**
 * Create a link to a node
 */
class RedirectImplementation extends AbstractTypoScriptObject {

	/**
	 * Url for redirect
	 *
	 * @return string
	 */
	public function getUrl() {
		return $this->tsValue('url');
	}

	/**
	 * Render the redirect.
	 *
	 */
	public function evaluate() {
		$url = $this->getUrl();
		if ($url) {
			header('Location: ' . $url, true, 301);
			die("Redirect successful: ".$url);
		} else {
			die("Ссылка не предоставлена (Redirect)");
		}
	}

}
