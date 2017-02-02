<?php
namespace Sfi\Shared\TypoScript;

use Neos\Flow\Annotations as Flow;
use Neos\Neos\Domain\Exception;
use Neos\Neos\Service\LinkingService;
use Neos\ContentRepository\Domain\Model\NodeInterface;
use TYPO3\TypoScript\TypoScriptObjects\AbstractTypoScriptObject;

/**
 * A TypoScript Object that automatically creates links to tags pages
 */
class ReplaceTagsImplementation extends AbstractTypoScriptObject {

	/**
	 * @Flow\Inject
	 * @var LinkingService
	 */
	protected $linkingService;

	/**
	 * Automatically create links to pages provided in `tags`.
	 * Tag page can have CSV property `replaceVariants` for alternative spelling/cases of tag name.
	 *
	 * @return string
	 * @throws Exception
	 */
	public function evaluate() {
		$text = $this->tsValue('value');
		$tags = $this->tsValue('tags');
		$node = $this->tsValue('node');
		$absolute = $this->tsValue('absolute') ? true : false;
		$documentNode = $this->tsValue('documentNode');
		if ($text === '' || $text === NULL) {
			return '';
		}
		if (!$node instanceof NodeInterface) {
			throw new Exception(sprintf('The current node must be an instance of NodeInterface, given: "%s".', gettype($text)), 1382624087);
		}
		if ($node->getContext()->getWorkspace()->getName() !== 'live') {
			return $text;
		}
		$linkingService = $this->linkingService;
		$controllerContext = $this->tsRuntime->getControllerContext();

		foreach ($tags as $tag) {
			if ($tag->getProperty('replaceVariants') && ($tag != $documentNode)) {
				$replacementVariants = explode(',', $tag->getProperty('replaceVariants'));
				foreach ($replacementVariants as $replacementVariant) {
					$replacementVariant = trim($replacementVariant);
					// Define "plus" as a specila symbol to mark word base
					$replacementVariant = str_replace('+', '\w*?', $replacementVariant);
					// Match any number of spaces
					$replacementVariant = str_replace(' ', '\s*', $replacementVariant);
					if (preg_match('/' . $replacementVariant . '/ui', $text) !== false) {
						$tagUri = $linkingService->createNodeUri($controllerContext, $tag);
						$tagUri = $linkingService->createNodeUri($controllerContext, $tag, null, null, $absolute);

						// Match not within links
						$text = preg_replace('/(?!(?:[^<]+>|[^>]+<\/a>))\b(' . $replacementVariant . ')\b/ui', '<a href="' . $tagUri . '">$1</a>', $text);
					}
				}
			}
		}
		return $text;
	}
}
