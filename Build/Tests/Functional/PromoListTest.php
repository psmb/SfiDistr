<?php

use GuzzleHttp\Psr7\ServerRequest;
use Neos\ContentRepository\Domain\Model\Node;
use Neos\ContentRepository\Domain\Model\NodeInterface;
use Neos\ContentRepository\Domain\Model\Workspace;
use Neos\ContentRepository\Domain\Repository\NodeDataRepository;
use Neos\ContentRepository\Domain\Projection\Content\TraversableNodes;
use Neos\ContentRepository\Eel\FlowQueryOperations\FindOperation;
use Neos\Eel\FlowQuery\OperationResolver;
use Neos\Flow\Mvc\ActionRequest;
use Neos\Flow\Mvc\ActionResponse;
use Neos\Flow\Mvc\Controller\Arguments;
use Neos\Flow\Mvc\Controller\ControllerContext;
use Neos\Flow\Mvc\Routing\UriBuilder;
use Neos\Flow\ObjectManagement\ObjectManagerInterface;
use Neos\Flow\Tests\FunctionalTestCase;
use Neos\Fusion\View\FusionView;
use Neos\Neos\Domain\Service\ContentContext;

final class PromoListTest extends FunctionalTestCase
{
    public function testPromoListRendersPromosFoundAcrossTheSite(): void
    {
        $workspace = $this->createMock(Workspace::class);
        $workspace->method('getName')->willReturn('live');
        $context = $this->createMock(ContentContext::class);
        $context->method('getWorkspace')->willReturn($workspace);
        $context->method('getWorkspaceName')->willReturn('live');
        $site = $this->createMock(Node::class);
        $site->method('getContext')->willReturn($context);
        $site->method('getPath')->willReturn('/sites/fixture');
        $site->method('findChildNodes')->willReturn(TraversableNodes::fromArray([]));
        $promo = $this->createMock(NodeInterface::class);
        $promo->method('getProperties')->willReturn(['title' => 'Promo outside the current page']);
        $repository = $this->createMock(NodeDataRepository::class);
        $repository->method('findByParentAndNodeTypeInContext')
            ->with('/sites/fixture', 'Sfi.Sfi:Promo', $context, true)->willReturn([$promo]);
        $find = $this->objectManager->get(FindOperation::class);
        $this->inject($find, 'nodeDataRepository', $repository);
        $resolver = $this->objectManager->get(OperationResolver::class);
        $originalManager = (new ReflectionProperty(OperationResolver::class, 'objectManager'))->getValue($resolver);
        $operationManager = $this->createMock(ObjectManagerInterface::class);
        $operationManager->method('get')->willReturnCallback(fn($class) => $class === FindOperation::class ? $find : $originalManager->get($class));
        $this->inject($resolver, 'objectManager', $operationManager);

        $request = ActionRequest::fromHttpRequest(new ServerRequest('GET', 'http://localhost/'));
        $uriBuilder = new UriBuilder();
        $uriBuilder->setRequest($request);
        $view = new FusionView();
        $view->setControllerContext(new ControllerContext($request, new ActionResponse(), new Arguments([]), $uriBuilder));
        $view->setFusionPathPattern(__DIR__ . '/Fixtures/PromoList.fusion');
        $view->setFusionPath('promoList');
        $view->assignMultiple(['node' => $site, 'documentNode' => $site, 'site' => $site]);

        try {
            self::assertXmlStringEqualsXmlString('<div class="PromoList">Promo outside the current page</div>', $view->render());
        } finally {
            $this->inject($resolver, 'objectManager', $originalManager);
        }
    }
}
