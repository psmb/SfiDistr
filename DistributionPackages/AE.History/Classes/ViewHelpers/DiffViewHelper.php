<?php
namespace AE\History\ViewHelpers;

use Neos\ContentRepository\Domain\Model\NodeType;
use Neos\ContentRepository\Domain\Service\NodeTypeManager;
use Neos\Diff\Diff;
use Neos\Diff\Renderer\Html\HtmlArrayRenderer;
use Neos\Flow\Annotations as Flow;
use Neos\FluidAdaptor\Core\ViewHelper\AbstractViewHelper;
use Neos\FluidAdaptor\Core\ViewHelper\Exception as ViewHelperException;
use Neos\Media\Domain\Model\AssetInterface;
use Neos\Media\Domain\Model\ImageInterface;
use Neos\Neos\EventLog\Domain\Model\NodeEvent;

/**
 * Renders the difference between the original and the changed content of the given node and returns it, along with meta
 * information, in an array.
 */
class DiffViewHelper extends AbstractViewHelper
{
    /**
     * @var boolean
     */
    protected $escapeOutput = false;

    /**
     * @Flow\Inject
     * @var NodeTypeManager
     */
    protected $nodeTypeManager;

    /**
     * @return void
     *
     * @throws ViewHelperException
     */
    public function initializeArguments() : void
    {
        parent::initializeArguments();

        $this->registerArgument('nodeEvent', NodeEvent::class, 'The NodeEvent to extract the diff from.', true);
    }

    /**
     * @return string
     * @throws \Neos\ContentRepository\Exception\NodeTypeNotFoundException
     */
    public function render() : string
    {
        $data = $this->arguments['nodeEvent']->getData();
        $old = $data['old'];
        $new = $data['new'];
        $nodeType = $this->nodeTypeManager->getNodeType($data['nodeType']);
        $changeNodePropertiesDefaults = $nodeType->getDefaultValuesForProperties();

        $renderer = new HtmlArrayRenderer();
        $changes = [];
        foreach ($new as $propertyName => $changedPropertyValue) {
            if (($old === null && empty($changedPropertyValue))
                || (isset($changeNodePropertiesDefaults[$propertyName])
                    && $changedPropertyValue === $changeNodePropertiesDefaults[$propertyName]
                )
            ) {
                continue;
            }

            $originalPropertyValue = ($old === null ? null : $old[$propertyName]);

            if (!is_object($originalPropertyValue) && !is_object($changedPropertyValue)) {
                $originalSlimmedDownContent = $this->renderSlimmedDownContent($originalPropertyValue);
                $changedSlimmedDownContent = $this->renderSlimmedDownContent($changedPropertyValue);

                $diff = new Diff(
                    explode("\n", $originalSlimmedDownContent),
                    explode("\n", $changedSlimmedDownContent),
                    ['context' => 1]
                );
                /** @var array $diffArray */
                $diffArray = $diff->render($renderer);
                $this->postProcessDiffArray($diffArray);
                if ($diffArray !== []) {
                    $changes[$propertyName] = [
                        'diff' => $diffArray,
                        'propertyLabel' => $this->getPropertyLabel($propertyName, $nodeType),
                        'type' => 'text',
                    ];
                }
            } elseif ($originalPropertyValue instanceof ImageInterface
                || $changedPropertyValue instanceof ImageInterface
            ) {
                $changes[$propertyName] = [
                    'changed' => $changedPropertyValue,
                    'original' => $originalPropertyValue,
                    'propertyLabel' => $this->getPropertyLabel($propertyName, $nodeType),
                    'type' => 'image',
                ];
            } elseif ($originalPropertyValue instanceof AssetInterface
                || $changedPropertyValue instanceof AssetInterface
            ) {
                $changes[$propertyName] = [
                    'changed' => $changedPropertyValue,
                    'original' => $originalPropertyValue,
                    'propertyLabel' => $this->getPropertyLabel($propertyName, $nodeType),
                    'type' => 'asset',
                ];
            } elseif ($originalPropertyValue instanceof \DateTimeInterface
                && $changedPropertyValue instanceof \DateTimeInterface
            ) {
                if ($changedPropertyValue->getTimestamp() !== $originalPropertyValue->getTimestamp()) {
                    $changes[$propertyName] = [
                        'changed' => $changedPropertyValue,
                        'original' => $originalPropertyValue,
                        'propertyLabel' => $this->getPropertyLabel($propertyName, $nodeType),
                        'type' => 'datetime',
                    ];
                }
            }
        }
        $this->templateVariableContainer->add('changes', $changes);
        $content = $this->renderChildren();
        $this->templateVariableContainer->remove('changes');
        return $content;
    }

    /**
     * Tries to determine a label for the specified property
     *
     * @param string $propertyName
     * @param NodeType $nodeType
     *
     * @return string
     */
    protected function getPropertyLabel(string $propertyName, NodeType $nodeType) : string
    {
        return $nodeType->getProperties()[$propertyName]['ui']['label'] ?? $propertyName;
    }

    /**
     * Renders a slimmed down representation of a property of the given node. The output will be HTML, but does not
     * contain any markup from the original content.
     *
     * Note: It's clear that this method needs to be extracted and moved to a more universal service at some point.
     * However, since we only implemented diff-view support for this particular controller at the moment, it stays
     * here for the time being. Once we start displaying diffs elsewhere, we should refactor the diff rendering part.
     *
     * @param mixed $propertyValue
     *
     * @return string
     */
    protected function renderSlimmedDownContent($propertyValue) : string
    {
        $content = '';
        if (is_string($propertyValue)) {
            $contentSnippet = str_replace('&nbsp;', ' ', $propertyValue);
            $contentSnippet = preg_replace('/<br[^>]*>/', "\n", $contentSnippet);
            $contentSnippet = preg_replace(['/<[^>]*>/', '/ {2,}/'], ' ', $contentSnippet);
            $content = trim($contentSnippet);
        }
        return $content;
    }

    /**
     * A workaround for some missing functionality in the Diff Renderer:
     *
     * This method will check if content in the given diff array is either completely new or has been completely
     * removed and wraps the respective part in <ins> or <del> tags, because the Diff Renderer currently does not
     * do that in these cases.
     *
     * @param array $diffArray
     *
     * @return void
     */
    protected function postProcessDiffArray(array &$diffArray)
    {
        foreach ($diffArray as $index => $blocks) {
            foreach ($blocks as $blockIndex => $block) {
                $baseLines = trim(implode('', $block['base']['lines']), " \t\n\r\0\xC2\xA0");
                $changedLines = trim(implode('', $block['changed']['lines']), " \t\n\r\0\xC2\xA0");
                if ($baseLines === '') {
                    foreach ($block['changed']['lines'] as $lineIndex => $line) {
                        $diffArray[$index][$blockIndex]['changed']['lines'][$lineIndex] = '<ins>' . $line . '</ins>';
                    }
                }
                if ($changedLines === '') {
                    foreach ($block['base']['lines'] as $lineIndex => $line) {
                        $diffArray[$index][$blockIndex]['base']['lines'][$lineIndex] = '<del>' . $line . '</del>';
                    }
                }
            }
        }
    }
}
