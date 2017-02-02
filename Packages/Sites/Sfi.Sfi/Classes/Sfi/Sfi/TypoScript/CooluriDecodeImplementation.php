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
class CooluriDecodeImplementation extends AbstractTypoScriptObject {

	/**
	 * Doctrine's Entity Manager. Note that "ObjectManager" is the name of the related
	 * interface ...
	 *
	 * @Flow\Inject
	 * @var \Doctrine\Common\Persistence\ObjectManager
	 */
	protected $entityManager;

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
	 * @return string The rendered URI or NULL if no URI could be resolved for the given node
	 * @throws NeosException
	 */
	public function evaluate() {
		$url = $this->getUrl();
		if ($url) {
			if (substr($url, -1) != "/") {
				$url = $url . "/";
			}
			$url = "www.sfi.ru@statja/".$url;
			$sql = "SELECT params FROM link_cache WHERE url='".$url."'";

		    $statement = $this->entityManager->getConnection()->prepare($sql);
		    $statement->execute();
		    $result = $statement->fetchAll();
		    if($result){
		    	$params = unserialize($result[0]['params']);
			    if($params['tx_ttnews[tt_news]']){
			    	return $params['tx_ttnews[tt_news]'];
			    } else {
			    	header("HTTP/1.0 404 Not Found");
			    	die('Ссылка не найдена! Мы переехали на новый сайт, что-то могло потеряться по дороге... <a href="http://sfi.ru">Вернуться на главную страницу</a> <span style="color:white">(no param found)</span>');
			    }
		    } else {
		    	header("HTTP/1.0 404 Not Found");
		    	die('Ссылка не найдена! Мы переехали на новый сайт, что-то могло потеряться по дороге... <a href="http://sfi.ru">Вернуться на главную страницу</a> <span style="color:white">(no sql result)</span>');
		    }
		}
		header("HTTP/1.0 404 Not Found");
		die('Ссылка не найдена! Мы переехали на новый сайт, что-то могло потеряться по дороге... <a href="http://sfi.ru">Вернуться на главную страницу</a> <span style="color:white">(url not provided)</span>');
	}

}