<?php

use Neos\Flow\Tests\FunctionalTestCase;
use Neos\Flow\Cache\CacheManager;
use Yeebase\Graylog\Log\GraylogLoggerInterface;

final class UpgradeServicesTest extends FunctionalTestCase
{
    public function testContentCacheSupportsTagInvalidation(): void
    {
        $cache = $this->objectManager->get(CacheManager::class)->getCache('Neos_Fusion_Content');
        $cache->set('upgrade_compatibility', 'cached content', ['upgrade_compatibility']);
        self::assertSame('cached content', $cache->get('upgrade_compatibility'));
        $cache->flushByTag('upgrade_compatibility');
        self::assertFalse($cache->has('upgrade_compatibility'));
    }

    public function testGraylogInterfaceResolvesThroughFlowObjectManagement(): void
    {
        $logger = $this->objectManager->get(GraylogLoggerInterface::class);
        self::assertInstanceOf(GraylogLoggerInterface::class, $logger);
        $logger->info('Neos 8.4 compatibility test');
    }
}
