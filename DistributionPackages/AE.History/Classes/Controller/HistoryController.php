<?php
namespace AE\History\Controller;

use AE\History\Domain\Repository\NodeEventRepository;
use Neos\Flow\Annotations as Flow;
use Neos\Flow\Mvc\View\ViewInterface;
use Neos\Flow\Security\Context;
use Neos\Fusion\View\FusionView;
use Neos\Neos\Controller\CreateContentContextTrait;
use Neos\Neos\Controller\Module\AbstractModuleController;
use Neos\Neos\Domain\Repository\DomainRepository;
use Neos\Neos\Domain\Repository\SiteRepository;
use Neos\Neos\Domain\Service\UserService;
use Neos\Neos\EventLog\Domain\Model\EventsOnDate;
use Neos\Neos\EventLog\Domain\Model\NodeEvent;

/**
 * Controller for the history module of Neos, displaying the timeline of changes.
 */
class HistoryController extends AbstractModuleController
{
    use CreateContentContextTrait;

    /**
     * @var string
     */
    protected $defaultViewObjectName = FusionView::class;

    /**
     * @Flow\Inject
     * @var DomainRepository
     */
    protected $domainRepository;

    /**
     * @Flow\Inject
     * @var NodeEventRepository
     */
    protected $nodeEventRepository;

    /**
     * @Flow\Inject
     * @var Context
     */
    protected $securityContext;

    /**
     * @Flow\Inject
     * @var SiteRepository
     */
    protected $siteRepository;

    /**
     * @Flow\Inject
     * @var UserService
     */
    protected $userService;

    /**
     * Show event overview.
     *
     * @param int $offset
     * @param int $limit
     * @param string|null $siteIdentifier
     * @param string|null $nodeIdentifier
     * @param string|null $accountIdentifier
     *
     * @return void
     */
    public function indexAction(
        int $offset = 0,
        int $limit = 25,
        string $siteIdentifier = null,
        string $nodeIdentifier = null,
        string $accountIdentifier = null
    ) {
        if ($nodeIdentifier === '') {
            $nodeIdentifier = null;
        }

        $numberOfSites = 0;
        // In case a user can only access a single site, but more sites exists
        $this->securityContext->withoutAuthorizationChecks(function () use (&$numberOfSites) {
            $numberOfSites = $this->siteRepository->countAll();
        });
        $sites = $this->siteRepository->findOnline();
        if ($numberOfSites > 1 && $siteIdentifier === null) {
            $domain = $this->domainRepository->findOneByActiveRequest();
            if ($domain !== null) {
                $siteIdentifier = $this->persistenceManager->getIdentifierByObject($domain->getSite());
            }
        }

        /** @var string[] $accounts */
        $accounts = [];
        $accountIdentifiers = $this->nodeEventRepository->findAccountIdentifiers('live', $siteIdentifier ?: null, $nodeIdentifier ?: null);
        foreach ($accountIdentifiers as $identifier) {
            $user = $this->userService->getUser($identifier);
            $accounts[$identifier] = $user ? $user->getName()->getLastName() . ', ' . $user->getName()->getFirstName() : $identifier;
        }

        /** @var NodeEvent[] $events */
        $events = $this->nodeEventRepository
            ->findRelevantEventsByWorkspace(
                $offset,
                $limit + 1,
                'live',
                $siteIdentifier ?: null,
                $nodeIdentifier,
                $accountIdentifier ?: null
            )
            ->toArray()
        ;

        $nextPage = null;
        if (count($events) > $limit) {
            $events = array_slice($events, 0, $limit);

            $nextPage = $this->controllerContext
                ->getUriBuilder()
                ->setCreateAbsoluteUri(true)
                ->uriFor(
                    'Index',
                    [
                        'accountIdentifier' => $accountIdentifier,
                        'nodeIdentifier' => $nodeIdentifier,
                        'offset' => $offset + $limit,
                        'siteIdentifier' => $siteIdentifier,
                    ]
                )
            ;
        }

        /** @var EventsOnDate[] $eventsByDate */
        $eventsByDate = [];
        foreach ($events as $event) {
            if ($event->getChildEvents()->count() === 0) {
                continue;
            }
            $timestamp = $event->getTimestamp();
            $day = $timestamp->format('Y-m-d');
            if (!isset($eventsByDate[$day])) {
                $eventsByDate[$day] = new EventsOnDate($timestamp);
            }

            $eventsOnThisDay = $eventsByDate[$day];
            $eventsOnThisDay->add($event);
        }

        $firstEvent = current($events);
        if ($firstEvent === false) {
            $node = $this->createContentContext('live')->getNodeByIdentifier($nodeIdentifier);
            if ($node !== null) {
                $firstEvent = [
                    'data' => [
                        'documentNodeLabel' => $node->getLabel(),
                        'documentNodeType' => $node->getNodeType()->getName(),
                    ],
                    'node' => $node,
                    'nodeIdentifier' => $nodeIdentifier,
                ];
            }
        }

        $this->view->assignMultiple([
            'accountIdentifier' => $accountIdentifier,
            'eventsByDate' => $eventsByDate,
            'firstEvent' => $firstEvent,
            'nextPage' => $nextPage,
            'nodeIdentifier' => $nodeIdentifier,
            'siteIdentifier' => $siteIdentifier,
            'sites' => $sites,
            'accounts' => $accounts,
        ]);
    }

    /**
     * Simply sets the Fusion path pattern on the view.
     *
     * @param ViewInterface $view
     *
     * @return void
     */
    protected function initializeView(ViewInterface $view)
    {
        parent::initializeView($view);
        $view->setFusionPathPattern('resource://AE.History/Private/Fusion');
    }
}
