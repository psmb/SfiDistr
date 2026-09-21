<?php

use Neos\ContentRepository\Domain\Model\NodeInterface;
use Neos\Flow\Mvc\View\JsonView;
use Neos\Flow\Security\Cryptography\HashService;
use PHPUnit\Framework\TestCase;
use Psmb\Newsletter\Controller\NewsletterController;
use Psmb\Newsletter\Domain\Model\Subscriber;
use Psmb\Newsletter\Service\FusionMailService;
use Psmb\Newsletter\Service\SubscribersService;

final class MailAndSigningTest extends TestCase
{
    public function testPreviewAndDeliveryUseTheSameFilters(): void
    {
        $controller = new NewsletterController();
        $filters = ['startDate' => '2026-09-01', 'endDate' => '', 'group' => 'chapel'];
        $configuration = ['identifier' => 'fixture', 'dataSourceIdentifier' => 'Json', 'dataSourceOptions' => ['uri' => 'https://example.invalid/subscribers?referer=chapel']];
        $subscribers = $this->createMock(SubscribersService::class);
        $subscribers->expects(self::exactly(2))->method('getSubscribers')
            ->with(self::callback(fn($subscription) => $subscription['dataSourceAdditionalArguments'] === $filters && $subscription['dataSourceOptions'] === $configuration['dataSourceOptions']))
            ->willReturn([['email' => 'fixture@example.invalid']]);
        $mail = $this->createMock(FusionMailService::class);
        $node = $this->createMock(NodeInterface::class);
        $mail->expects(self::once())->method('generateSubscriptionLetterAndSend')
            ->with(['email' => 'fixture@example.invalid'], array_merge($configuration, ['isSendFromUi' => true, 'dataSourceAdditionalArguments' => $filters]), $node);
        foreach (['subscriptions' => [$configuration], 'subscribersService' => $subscribers,
            'fusionMailService' => $mail, 'view' => new JsonView()] as $property => $value) {
            (new ReflectionProperty($controller, $property))->setValue($controller, $value);
        }
        $controller->previewAction('fixture', $filters);
        $controller->sendAction('fixture', $node, $filters);
    }

    public function testTestDeliveryCarriesFiltersAndOnlyUsesTheRequestedRecipient(): void
    {
        $controller = new NewsletterController();
        $filters = ['startDate' => '2026-09-01'];
        $mail = $this->createMock(FusionMailService::class);
        $mail->expects(self::once())->method('generateSubscriptionLetterAndSend')
            ->with(self::callback(fn(Subscriber $subscriber) => $subscriber->getEmail() === 'fixture@example.invalid'),
                ['identifier' => 'fixture', 'isSendFromUi' => true, 'dataSourceAdditionalArguments' => $filters], self::anything());
        $subscribers = $this->createMock(SubscribersService::class);
        $subscribers->expects(self::never())->method('getSubscribers');
        foreach (['subscriptions' => [['identifier' => 'fixture']], 'subscribersService' => $subscribers,
            'fusionMailService' => $mail, 'view' => new JsonView()] as $property => $value) {
            (new ReflectionProperty($controller, $property))->setValue($controller, $value);
        }
        $controller->testSendAction('fixture', $this->createMock(NodeInterface::class), 'fixture@example.invalid', $filters);
    }

    public function testConfiguredKeyAcceptsLegacyTokensAcrossFreshInstances(): void
    {
        $key = 'synthetic-acceptance-key-never-for-production';
        $payload = 'fixture@example.invalid';
        // Flow 5.3 uses this same SHA-1 HMAC construction for existing tokens.
        $legacyToken = hash_hmac('sha1', $payload, $key);
        for ($instance = 0; $instance < 2; $instance++) {
            $hash = new HashService();
            $hash->injectSettings(['security' => ['cryptography' => ['hashingStrategies' => [], 'encryptionKey' => $key]]]);
            self::assertTrue($hash->validateHmac($payload, $legacyToken));
            self::assertFalse($hash->validateHmac('different@example.invalid', $legacyToken));
        }
    }
}
