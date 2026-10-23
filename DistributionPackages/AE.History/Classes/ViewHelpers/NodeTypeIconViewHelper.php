<?php
namespace AE\History\ViewHelpers;

use Neos\Flow\Annotations as Flow;
use Neos\FluidAdaptor\Core\ViewHelper\AbstractViewHelper;
use Neos\ContentRepository\Domain\Service\NodeTypeManager;
use Neos\FluidAdaptor\Core\ViewHelper\Exception as ViewHelperException;

class NodeTypeIconViewHelper extends AbstractViewHelper
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

        $this->registerArgument('nodeType', 'string', 'The name of the NodeType.', true);
    }

    /**
     * @return string
     * @throws \Neos\ContentRepository\Exception\NodeTypeNotFoundException
     */
    public function render() : string
    {
        return $this->nodeTypeManager->getNodeType($this->arguments['nodeType'])->getConfiguration('ui.icon');
    }
}
