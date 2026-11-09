<?php

use Doctrine\ORM\EntityManagerInterface;
use GuzzleHttp\Psr7\Message;
use GuzzleHttp\Psr7\ServerRequest;
use Neos\ContentRepository\Domain\Model\NodeInterface;
use Neos\ContentRepository\Domain\Model\NodeData;
use Neos\ContentRepository\Domain\Model\Workspace;
use Neos\ContentRepository\Domain\Repository\WorkspaceRepository;
use Neos\ContentRepository\Domain\Service\NodeTypeManager;
use Neos\ContentRepository\Domain\Service\ContextFactoryInterface;
use Neos\ContentRepository\Utility;
use Neos\Flow\Tests\FunctionalTestCase;
use Neos\Flow\Mvc\ActionRequest;
use Neos\Flow\Mvc\ActionResponse;
use Neos\Flow\Mvc\Controller\Arguments;
use Neos\Flow\Mvc\Controller\ControllerContext;
use Neos\Flow\Mvc\Routing\UriBuilder;
use Neos\Flow\Mvc\Routing\Dto\RouteParameters;
use Neos\Flow\Http\ServerRequestAttributes;
use Neos\Flow\Cache\CacheManager;
use Neos\Fusion\Core\Parser;
use Neos\Fusion\Core\Runtime;
use Neos\Neos\Domain\Model\Site;
use Neos\Neos\Domain\Service\FusionService;
use Neos\Neos\Fusion\Cache\ContentCacheFlusher;
use Psr\Http\Message\ResponseInterface;

final class AlmanacEntryBodyTest extends FunctionalTestCase
{
    protected static $testablePersistenceEnabled = true;
    private EntityManagerInterface $entityManager;
    private Workspace $live;

    protected function setUp(): void
    {
        parent::setUp();
        $this->entityManager = $this->objectManager->get(EntityManagerInterface::class);
        $this->live = new Workspace('live');
        $workspaces = $this->objectManager->get(WorkspaceRepository::class);
        $workspaces->add($this->live);
        foreach (['ru', 'en'] as $language) {
            $this->createStoredNode('/sites', $this->live, $language, 'unstructured');
            $this->createStoredNode('/sites/sfi', $this->live, $language, 'Sfi.Sfi:PageMain');
            $issue = $this->createStoredNode('/sites/sfi/issue', $this->live, $language, 'Sfi.Sfi:AlmanacIssuePage');
            $issue->setProperty('title', 'Issue');
            $issue->setProperty('uriPathSegment', 'issue');
            $this->createStoredNode('/sites/sfi/issue/main', $this->live, $language, 'Neos.Neos:ContentCollection');
            $headline = $this->createStoredNode('/sites/sfi/issue/main/heading', $this->live, $language, 'Neos.NodeTypes:Headline');
            $headline->setIndex(100);
            $headline->setProperty('title', 'Issue heading fixture');
            $entry = $this->createStoredNode('/sites/sfi/issue/main/entry', $this->live, $language, 'Sfi.Sfi:AlmanacEntry');
            $entry->setIndex(200);
            $entry->setProperty('title', $language === 'ru' ? 'Статья' : 'Article');
            $entry->setProperty('author', 'Author');
            $entry->setProperty('DOI', '10.1234/fixture');
            $entry->setProperty('annotation', '<p>Abstract</p>');
        }
        $this->persistenceManager->persistAll();
    }

    private function createStoredNode(string $path, Workspace $workspace, string $language, string $type): NodeData
    {
        $node = new NodeData($path, $workspace, Utility::buildAutoCreatedChildNodeIdentifier($path, 'fixture'), ['language' => [$language]]);
        $node->setNodeType($this->objectManager->get(NodeTypeManager::class)->getNodeType($type));
        $this->entityManager->persist($node);
        return $node;
    }

    public function testBodyRendersOnlyAtTheExistingArticleUrlAndUpdatesAfterEditing(): void
    {
        $cache = $this->objectManager->get(CacheManager::class)->getCache('Neos_Fusion_Content');
        $cache->flush();
        $site = new Site('sfi');
        $site->setSiteResourcesPackageKey('Sfi.Sfi');
        $site->setState(Site::STATE_ONLINE);
        $this->entityManager->persist($site);
        $this->persistenceManager->persistAll();

        $contexts = $this->objectManager->get(ContextFactoryInterface::class);
        $ru = $contexts->create([
            'workspaceName' => 'live', 'dimensions' => ['language' => ['ru']],
            'targetDimensions' => ['language' => 'ru'], 'currentSite' => $site,
        ]);
        $issue = $ru->getNode('/sites/sfi/issue');
        $article = $issue->getNode('main/entry');
        $arguments = ['article' => 'entry'];
        $beforeBackfill = $this->renderNode($site, $issue, $arguments);
        self::assertSame(200, $beforeBackfill->getStatusCode());
        self::assertStringContainsString('Abstract', (string)$beforeBackfill->getBody());

        $nodeTypes = $this->objectManager->get(NodeTypeManager::class);
        $collection = $article->createNode(
            'body',
            $nodeTypes->getNodeType('Neos.Neos:ContentCollection'),
            Utility::buildAutoCreatedChildNodeIdentifier('body', $article->getIdentifier())
        );
        $text = $collection->createNode('text', $nodeTypes->getNodeType('Neos.NodeTypes:Text'));
        $text->setProperty('text', '<p>Full article body fixture.</p>');
        $this->persistenceManager->persistAll();
        $cache->flush();

        $issuePage = (string)$this->renderNode($site, $issue)->getBody();
        self::assertStringContainsString('Issue heading fixture', $issuePage);
        self::assertStringContainsString('?article=entry', $issuePage);
        self::assertStringNotContainsString('Full article body fixture.', $issuePage);
        $fullPage = $this->renderNode($site, $issue, $arguments);
        self::assertSame(200, $fullPage->getStatusCode());
        self::assertStringContainsString('Full article body fixture.', (string)$fullPage->getBody());
        self::assertStringNotContainsString('Issue heading fixture', (string)$fullPage->getBody());

        $en = $contexts->create([
            'workspaceName' => 'live', 'dimensions' => ['language' => ['en']],
            'targetDimensions' => ['language' => 'en'], 'currentSite' => $site,
        ]);
        $englishPage = $this->renderNode($site, $en->getNode('/sites/sfi/issue'), $arguments);
        self::assertSame(200, $englishPage->getStatusCode());
        self::assertStringNotContainsString('Full article body fixture.', (string)$englishPage->getBody());

        $text->setProperty('text', '<p>Updated article body fixture.</p>');
        $this->persistenceManager->persistAll();
        $this->objectManager->get(ContentCacheFlusher::class)->shutdownObject();
        self::assertStringContainsString(
            'Updated article body fixture.',
            (string)$this->renderNode($site, $issue, $arguments)->getBody()
        );
    }

    private function renderNode(Site $site, NodeInterface $node, array $arguments = []): ResponseInterface
    {
        $httpRequest = (new ServerRequest('GET', 'http://localhost/'))->withAttribute(
            ServerRequestAttributes::ROUTING_PARAMETERS,
            RouteParameters::createEmpty()->withParameter('requestUriHost', 'localhost')
        );
        self::$bootstrap->getActiveRequestHandler()->setHttpRequest($httpRequest);
        $request = ActionRequest::fromHttpRequest($httpRequest);
        $request->setFormat('html');
        $request->setArguments($arguments);
        $uriBuilder = new UriBuilder();
        $uriBuilder->setRequest($request);
        $controller = new ControllerContext($request, new ActionResponse(), new Arguments([]), $uriBuilder);
        $configuration = $this->objectManager->get(FusionService::class)->createFusionConfigurationFromSite($site)->toArray();
        $configuration = (new Parser())->parse(<<<'FUSION'
prototype(Sfi.Sfi:AlmanacLayout).renderer = afx`<div><h2>{props.title}</h2>{props.linkToIssue}{props.content}</div>`
FUSION, null, $configuration);
        $runtime = new Runtime($configuration, $controller);
        $runtime->setEnableContentCache(true);
        $runtime->pushContextArray([
            'node' => $node, 'documentNode' => $node,
            'site' => $node->getContext()->getCurrentSiteNode(), 'request' => $request,
        ]);
        try {
            return Message::parseResponse($runtime->render('root'));
        } finally {
            $runtime->popContext();
        }
    }
}
