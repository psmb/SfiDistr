<?php

use Neos\ContentRepository\Domain\Model\NodeInterface;
use Neos\ContentRepository\Domain\Repository\NodeDataRepository;
use Neos\ContentRepository\Domain\Service\Context;
use Neos\ContentRepository\Domain\Service\ContextFactoryInterface;
use Neos\ContentRepository\Eel\FlowQueryOperations\FindOperation;
use Neos\Flow\Tests\FunctionalTestCase;
use Neos\Eel\FlowQuery\OperationResolver;
use Neos\Flow\ObjectManagement\ObjectManagerInterface;
use Psmb\Newsletter\Service\FusionMailService;
use Psr\Log\LoggerInterface;
use Sfi\Sfi\Command\MailerCommandController;
use Sfi\Sfi\Service\EventStoreApi;

final class FundraisingMailerTest extends FunctionalTestCase
{
    public static function deliveryModes(): array
    {
        return ['dry run' => [true, false], 'delivery' => [false, false], 'delivery failure' => [false, true]];
    }

    /** @dataProvider deliveryModes */
    public function testPendingMailSideEffects(bool $dryRun, bool $deliveryFails): void
    {
        $context = $this->createMock(Context::class);
        $factory = $this->createMock(ContextFactoryInterface::class);
        $factory->method('create')->willReturn($context);
        $mailRoot = $this->createMock(NodeInterface::class);
        $projectRoot = $this->createMock(NodeInterface::class);
        foreach ([$mailRoot, $projectRoot] as $root) {
            $root->method('getContext')->willReturn($context);
        }
        $mailRoot->method('getPath')->willReturn('/mail');
        $projectRoot->method('getPath')->willReturn('/projects');
        $context->method('getNode')->willReturnMap([
            ['/sites/sfi/node-kmbu98co4ps75/node-0tsk22onh4qso', $mailRoot],
            ['/sites/sfi/node-yjlauzt0q408f', $projectRoot],
        ]);
        $newsletter = $this->createMock(NodeInterface::class);
        $newsletter->method('getProperty')->willReturnMap([['interval', 'P1D'], ['uriPathSegment', 'thanks']]);
        $project = $this->createMock(NodeInterface::class);
        $project->method('getProperty')->willReturnMap([
            ['uriPathSegment', 'chapel'], ['title', 'Fixture project'], ['target', 100],
        ]);
        $repository = $this->createMock(NodeDataRepository::class);
        $repository->method('findByParentAndNodeTypeInContext')->willReturnMap([
            ['/mail', 'Sfi.Sfi:AutomatedNewsletter', $context, true, [$newsletter]],
            ['/projects', 'Sfi.Sfi:FundraisingProject', $context, true, [$project]],
        ]);
        $find = $this->objectManager->get(FindOperation::class);
        $this->inject($find, 'nodeDataRepository', $repository);
        $resolver = $this->objectManager->get(OperationResolver::class);
        $property = new ReflectionProperty(OperationResolver::class, 'objectManager');
        $originalManager = $property->getValue($resolver);
        $operationManager = $this->createMock(ObjectManagerInterface::class);
        $operationManager->method('get')->willReturnCallback(fn($class) => $class === FindOperation::class ? $find : $originalManager->get($class));
        $this->inject($resolver, 'objectManager', $operationManager);

        $events = $this->createMock(EventStoreApi::class);
        $subscriber = ['email' => 'fixture@example.invalid', 'date' => '2020-01-01', 'referer' => 'chapel', 'reason' => 'fixture'];
        $events->method('getPending')->with('thanks')->willReturn([
            $subscriber,
            array_replace($subscriber, ['email' => 'invalid']),
            array_replace($subscriber, ['date' => '2999-01-01']),
        ]);
        $order = [];
        $events->expects($dryRun ? self::never() : self::once())->method('registerEmailSent')
            ->with('fixture', 'thanks', 'fixture@example.invalid')
            ->willReturnCallback(function () use (&$order) { $order[] = 'event'; });
        $events->expects(self::never())->method('registerUnsubscribe');
        $mail = $this->createMock(FusionMailService::class);
        $mail->expects($dryRun ? self::once() : self::never())->method('generateSubscriptionLetter')
            ->with(self::callback(fn($value) => $value['projectTitle'] === 'Fixture project' && $value['chapel'] === true), self::anything(), self::anything());
        $mail->expects($dryRun ? self::never() : self::once())->method('generateSubscriptionLetterAndSend')
            ->willReturnCallback(function () use (&$order, $deliveryFails) {
                $order[] = 'delivery';
                if ($deliveryFails) {
                    throw new RuntimeException('Fixture delivery failed');
                }
            });
        $logger = $this->createMock(LoggerInterface::class);
        $logger->expects($deliveryFails ? self::once() : self::never())->method('log')
            ->with('error', 'Fixture delivery failed');
        $controller = $this->getMockBuilder(MailerCommandController::class)
            ->disableOriginalConstructor()->onlyMethods(['outputLine'])->getMock();
        foreach (['contextFactory' => $factory, 'eventStoreApi' => $events, 'fusionMailService' => $mail,
            'systemLogger' => $logger, 'subscriptions' => [['identifier' => 'fundraising_timed']]] as $name => $value) {
            $this->inject($controller, $name, $value);
        }
        try {
            $controller->sendStuffCommand($dryRun);
            self::assertSame($dryRun ? [] : ['event', 'delivery'], $order);
        } finally {
            $this->inject($resolver, 'objectManager', $originalManager);
        }
    }
}
