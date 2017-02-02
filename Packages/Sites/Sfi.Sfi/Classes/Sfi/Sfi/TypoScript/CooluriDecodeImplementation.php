<?php
namespace Sfi\Sfi\TypoScript;

use Neos\Flow\Annotations as Flow;
use Neos\Flow\Log\SystemLoggerInterface;
use Neos\Fusion\FusionObjects\AbstractFusionObject;
use Neos\Neos\Exception as NeosException;

/**
 * Create a link to a node
 */
class CooluriDecodeImplementation extends AbstractFusionObject {

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
