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
     * @Flow\Inject
     * @var \Neos\Flow\Log\SystemLoggerInterface
     */
    protected $systemLogger;

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
        $subscriptionsNode = $context->getNode('/sites/sfi/node-kmbu98co4ps75/node-0tsk22onh4qso');
        $flowQuery = new FlowQuery(array($subscriptionsNode));
        $nodes = $flowQuery->find('[instanceof Sfi.Sfi:AutomatedNewsletter]')->get();

        $projectsNode = $context->getNode('/sites/sfi/node-yjlauzt0q408f');
        $flowQuery = new FlowQuery(array($projectsNode));
        $projectNodes = $flowQuery->find('[instanceof Sfi.Sfi:FundraisingProject]')->get();
        $projects = [];
        foreach ($projectNodes as $node) {
            $projects[$node->getProperty('uriPathSegment')] = $node;
        }

        foreach ($nodes as $node) {
            $interval = new \DateInterval($node->getProperty('interval'));
            $subscripionId = $node->getProperty('uriPathSegment');
            $this->outputLine('Type: %s', [$subscripionId]);
            $pendingLetters = $this->eventStoreApi->getPending($subscripionId);
            foreach($pendingLetters as $subscriber) {
                $reason = $subscriber['reason'];
                if (!(array_key_exists('email', $subscriber) && strpos($subscriber['email'], '@') !== false)) {
                    $this->outputLine('<error>Subscriber must have an "email" field</error>');
                    continue;
                }
                $now = new \DateTime();
                $date = new \DateTime($subscriber['date']);
                if ($date->add($interval) < $now) {
                    $this->outputLine('Sending a letter for %s', [$subscriber['email']]);
                    $project = $projects[$subscriber['referer']];
                    $subscriber['projectTitle'] = $project->getProperty('title');
                    $subscriber[$subscriber['referer']] = true;
                    $subscriber['projectTarget'] = $project->getProperty('target');
                    try {
                        $originalNode = clone $node;
                        // We register sent event before actually sending to prevent double delivery
                        // TODO: make actual delivery more robust
                        $this->eventStoreApi->registerEmailSent($reason, $subscripionId, $subscriber['email']);
                        if (!$dryRun) {
                            $this->fusionMailService->generateSubscriptionLetterAndSend($subscriber, $subscription, $originalNode);
                        }
                        $this->systemLogger->log("Email sent: " . ($dryRun ? "(Dry-run)" : "") . $subscriber['email'] . "; " . $reason . "; " . $subscripionId, \LOG_INFO);
                    } catch (\Exception $e) {
                        $message = $e->getMessage();
                        $invalidEmail = strpos($message, 'does not comply with RFC 2822') !== false;
                        if ($invalidEmail) {
                            // Register even for failed email, so we won't try to send it again
                            $this->eventStoreApi->registerEmailSent($reason, $subscripionId, $subscriber['email']);
                        }
                        $level = $invalidEmail ? \LOG_NOTICE : \LOG_ERR;
                        $this->systemLogger->log($message, $level);
                    }
                } else {
                    $this->outputLine('Not yet time for %s %s', [$subscriber['email'], $subscriber['date']]);
                }
            }
        }
    }
}
