<?php
namespace Sfi\Sfi\Aspects;

use Neos\Flow\Annotations as Flow;
use Neos\Flow\Aop\JoinPointInterface;
use Neos\Flow\Security\Exception\AccessDeniedException;
use Neos\Neos\Ui\Service\NodePolicyService;

/**
 * @Flow\Aspect
 * @Flow\Scope("singleton")
 */
class BackendNodeAccessAspect
{
    /**
     * @Flow\Inject
     * @var NodePolicyService
     */
    protected $nodePolicyService;

    /**
     * Reject restricted deep links before the UI receives a null document node.
     *
     * @Flow\Before("method(Neos\Neos\Ui\Controller\BackendController->indexAction())")
     */
    public function enforceNodeTreeAccess(JoinPointInterface $joinPoint): void
    {
        $node = $joinPoint->getMethodArgument('node');
        if ($node !== null && !$this->nodePolicyService->isNodeTreePrivilegeGranted($node)) {
            throw new AccessDeniedException('You do not have access to this page in the editor.', 1790000001);
        }
    }
}
