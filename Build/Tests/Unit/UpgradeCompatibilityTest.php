<?php

use Doctrine\DBAL\DriverManager;
use Doctrine\ORM\EntityManagerInterface;
use Neos\ContentRepository\Domain\Model\NodeType;
use Neos\Flow\Http\Helper\RequestInformationHelper;
use PHPUnit\Framework\TestCase;
use Psmb\Newsletter\Service\FusionMailService;
use Sfi\Sfi\LegacyContentPrototypeGenerator;
use Sfi\Sfi\LegacyDocumentPrototypeGenerator;
use Sfi\Sfi\TypoScript\CooluriDecodeImplementation;
use Yeebase\Graylog\Log\Backend\GraylogBackend;
use Yeebase\Graylog\Log\GraylogLogger;
use Yeebase\Graylog\Log\GraylogLoggerInterface;

final class UpgradeCompatibilityTest extends TestCase
{
    public function testLegacyNewsRedirectResolvesAStoredUrlContainingAQuote(): void
    {
        $connection = DriverManager::getConnection(['driver' => 'pdo_sqlite', 'memory' => true]);
        $connection->executeStatement('CREATE TABLE link_cache (url TEXT, params TEXT)');
        $connection->insert('link_cache', [
            'url' => "www.sfi.ru@statja/legacy-'article/",
            'params' => serialize(['tx_ttnews[tt_news]' => '42']),
        ]);
        $entityManager = $this->createMock(EntityManagerInterface::class);
        $entityManager->method('getConnection')->willReturn($connection);
        $decoder = $this->getMockBuilder(CooluriDecodeImplementation::class)
            ->disableOriginalConstructor()->onlyMethods(['getUrl'])->getMock();
        $decoder->method('getUrl')->willReturn("legacy-'article");
        (new ReflectionProperty($decoder, 'entityManager'))->setValue($decoder, $entityManager);

        self::assertSame('42', $decoder->evaluate());
    }

    public function testNewsletterRequestPreservesHostPortAndInstallationPath(): void
    {
        $service = new FusionMailService();
        $reflection = new ReflectionClass($service);
        $reflection->getProperty('baseUri')->setValue($service, 'https://example.invalid:8443/site/');
        $request = $reflection->getMethod('createRequest')->invoke($service);

        self::assertSame('html', $request->getFormat());
        self::assertSame('https://example.invalid:8443/site/', (string) RequestInformationHelper::generateBaseUri($request->getHttpRequest()));
        self::assertSame('GET', $request->getHttpRequest()->getMethod());
    }

    public function testLegacyGeneratorsKeepFluidTemplatesAndLinkConversion(): void
    {
        $nodeType = $this->createMock(NodeType::class);
        $nodeType->method('getName')->willReturn('Sfi.Sfi:Example');
        $nodeType->method('getProperties')->willReturn([
            'text' => ['type' => 'string', 'ui' => ['inlineEditable' => true]],
            '_hidden' => ['type' => 'boolean'],
        ]);

        $content = (new LegacyContentPrototypeGenerator())->generate($nodeType);
        self::assertStringContainsString('prototype(Sfi.Sfi:Example) < prototype(Neos.Neos:Content)', $content);
        self::assertStringContainsString('resource://Sfi.Sfi/Private/Templates/NodeTypes/Example.html', $content);
        self::assertStringContainsString('text.@process.convertUris = Neos.Neos:ConvertUris', $content);
        self::assertStringNotContainsString('_hidden =', $content);

        $document = (new LegacyDocumentPrototypeGenerator())->generate($nodeType);
        self::assertStringContainsString('prototype(Neos.Neos:Document)', $document);
        self::assertStringContainsString('resource://Sfi.Sfi/Private/Templates/NodeTypes/Example.html', $document);
    }

    public function testGraylogKeepsItsInterfaceAndAcceptsPsrLogLevels(): void
    {
        $backend = $this->getMockBuilder(GraylogBackend::class)
            ->disableOriginalConstructor()
            ->onlyMethods(['open', 'append'])
            ->getMock();
        $backend->expects(self::once())->method('open');
        $backend->expects(self::once())->method('append')
            ->with('Upgrade check', LOG_INFO, ['check' => true], null, null, null);

        $logger = new GraylogLogger($backend);
        self::assertInstanceOf(GraylogLoggerInterface::class, $logger);
        $logger->info('Upgrade check', ['check' => true]);
    }
}
