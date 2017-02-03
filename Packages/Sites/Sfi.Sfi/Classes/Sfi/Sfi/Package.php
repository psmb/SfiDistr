<?php
namespace Sfi\Sfi;
use Neos\Flow\Annotations as Flow;
use Neos\Flow\Package\Package as BasePackage;
use Neos\Flow\Core\Bootstrap;
use Neos\Flow\Persistence\PersistenceManagerInterface;
use Neos\ContentRepository\Domain\Model\Workspace;
/**
 * Psmb.Newsletter
 */
class Package extends BasePackage
{
    /**
     * Capture firstPublicationDateTime property of a node when first publishing to live workspace
     * @param Bootstrap $bootstrap The current bootstrap
     * @return void
     */
    public function boot(Bootstrap $bootstrap)
    {
        $dispatcher = $bootstrap->getSignalSlotDispatcher();
        $dispatcher->connect(Workspace::class, 'beforeNodePublishing', function ($node, $targetWorkspace) use ($bootstrap) {
            if ($targetWorkspace->getName() === 'live' &&
                $node->hasProperty('firstPublicationDateTime') &&
                !$node->getProperty('firstPublicationDateTime')
            ) {
                $node->setProperty('firstPublicationDateTime', new \DateTime());
                $bootstrap->getObjectManager()->get(PersistenceManagerInterface::class)->persistAll();
            }
        });
    }
}
