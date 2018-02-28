<?php
namespace Sfi\Sfi\Command;

use Neos\Flow\Annotations as Flow;
use Psmb\Newsletter\Service\FusionMailService;
use Neos\ContentRepository\Domain\Service\ContextFactoryInterface;
use Neos\Flow\Cli\CommandController;
use Neos\Eel\FlowQuery\FlowQuery;

/**
 * @Flow\Scope("singleton")
 */
class MailerCommandController extends CommandController
{
    /**
     * @Flow\Inject
     * @var ContextFactoryInterface
     */
    protected $contextFactory;

    /**
     * @Flow\Inject
     * @var FusionMailService
     */
    protected $fusionMailService;

    /**
     * @Flow\InjectConfiguration(package="Psmb.Newsletter", path="subscriptions")
     * @var array
     */
    protected $subscriptions;

    /**
     * @Flow\Inject
     * @var \Sfi\Sfi\Service\EventStoreApi
     */
    protected $eventStoreApi;

    /**
     * Selects all subscriptions with given interval and sends a letter to each subscriber
     *
     * @param bool $dryRun DryRun: generate messages but don't send
     * @return void
     */
    public function sendStuffCommand($dryRun = false)
    {
        $pending = json_decode($this->eventStoreApi->getPending(), true);
        $subscriptionName = 'fundraising_timed';
        $subscriptions = array_filter($this->subscriptions, function ($item) use ($subscriptionName) {
            return $item['identifier'] == $subscriptionName;
        });
        $subscription = reset($subscriptions);

        $contextProperties = array(
            'workspaceName' => 'live',
            'dimensions' => ['language' => ['ru']],
            'invisibleContentShown' => false,
            'inaccessibleContentShown' => false
        );
        $context = $this->contextFactory->create($contextProperties);
        $rootNode = $context->getNode('/sites/sfi');
        $flowQuery = new FlowQuery(array($rootNode));
        $nodes = $flowQuery->find('[instanceof Sfi.Sfi:AutomatedNewsletter]')->get();
        foreach ($nodes as $node) {
            $interval = $node->getProperty('interval');
            $subscripionId = $node->getProperty('uriPathSegment');
            $pendingLetters = $pending[$subscripionId];
            foreach($pendingLetters as $reason => $subscriber) {
                if (!(array_key_exists('email', $subscriber) && strpos($subscriber['email'], '@') !== false)) {
                    $this->outputLine('<error>Subscriber must have an "email" field</error>');
                    continue;
                }
                $this->outputLine('Sending a letter for %s', [$subscriber['email']]);
                $this->eventStoreApi->registerEmailSent($reason, $subscripionId, $subscriber['email']);
            }
        }
    }
}
