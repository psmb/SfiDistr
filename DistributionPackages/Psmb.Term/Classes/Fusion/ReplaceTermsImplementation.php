<?php
namespace Psmb\Term\Fusion;

use Neos\Flow\Annotations as Flow;
use Neos\Neos\Domain\Exception;
use Neos\Neos\Service\LinkingService;
use Neos\ContentRepository\Domain\Model\NodeInterface;
use Neos\Fusion\FusionObjects\AbstractFusionObject;

/**
 * A Fusion Object that automatically creates links to term pages
 */
class ReplaceTermsImplementation extends AbstractFusionObject {

	/**
	 * @Flow\Inject
	 * @var LinkingService
	 */
	protected $linkingService;

	/**
	 * Automatically create links to pages provided in `terms`.
	 * Term node can have CSV property `replaceVariants` for alternative spelling/cases of term name.
	 *
	 * @return string
	 * @throws Exception
	 */
	public function evaluate() {
		$terms = $this->fusionValue('terms');
		$text = $this->fusionValue('value');
		$node = $this->fusionValue('node');
		$absolute = $this->fusionValue('absolute') ? true : false;
		$documentNode = $this->fusionValue('documentNode');
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
		$controllerContext = $this->runtime->getControllerContext();
		foreach ($terms as $term) {
			if ($term->getProperty('replaceVariants') && ($term != $documentNode)) {
				$replacementVariants = explode(',', $term->getProperty('replaceVariants'));
				foreach ($replacementVariants as $replacementVariant) {
					$replacementVariant = trim($replacementVariant);
					if ($replacementVariant) {
						// Escape .
						$replacementVariant = str_replace('.', '\.', $replacementVariant);
						// Escape ()
						$replacementVariant = str_replace('(', '\(', $replacementVariant);
						$replacementVariant = str_replace(')', '\)', $replacementVariant);
						// Turn [] into ()
						$replacementVariant = str_replace('[', '(', $replacementVariant);
						$replacementVariant = str_replace(']', ')', $replacementVariant);
						// Define "plus" as a specila symbol to mark word base
						$replacementVariant = str_replace('+', '\w*?', $replacementVariant);
						// Match any number of spaces
						$replacementVariant = str_replace(' ', '\s*', $replacementVariant);
						if (preg_match('/' . $replacementVariant . '/ui', $text)) {
							$termUri = $linkingService->createNodeUri($controllerContext, $term, null, null, $absolute);
							// Match not within links
							$text = preg_replace(
								'/
									(?<!\w)(?=[\w\(])
										(' . $replacementVariant . ')
									(?<=[\w\)])(?!\w)
									(?!
										[^<]*<\/a>
									)
								/xmui',
								'<a href="' . $termUri . '">$1</a>',
								$text
							);
						}
					}
				}
			}
		}
		return $text;
	}
}
