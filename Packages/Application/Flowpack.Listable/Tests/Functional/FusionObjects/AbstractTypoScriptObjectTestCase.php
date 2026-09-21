<?php
namespace Flowpack\Listable\Tests\Functional\FusionObjects;

use GuzzleHttp\Psr7\ServerRequest;
use Neos\Flow\Mvc\ActionRequest;
use Neos\Flow\Mvc\ActionResponse;
use Neos\Flow\Mvc\Controller\Arguments;
use Neos\Flow\Mvc\Controller\ControllerContext;
use Neos\Flow\Mvc\Routing\UriBuilder;
use Neos\Flow\Tests\FunctionalTestCase;
use Neos\Fusion\View\FusionView;

abstract class AbstractTypoScriptObjectTestCase extends FunctionalTestCase
{
    /**
     * @var ControllerContext
     */
    protected $controllerContext;

    /**
     * Helper to build a Fusion view object
     *
     * @return FusionView
     */
    protected function buildView()
    {
        $view = new FusionView();

        $request = ActionRequest::fromHttpRequest(new ServerRequest('GET', 'http://localhost/'));

        $uriBuilder = new UriBuilder();
        $uriBuilder->setRequest($request);

        $this->controllerContext = new ControllerContext(
            $request,
            new ActionResponse(),
            new Arguments([]),
            $uriBuilder
        );

        $view->setControllerContext($this->controllerContext);
        $view->setPackageKey('Flowpack.Listable');
        $view->setFusionPathPattern(__DIR__ . '/Fixtures/Listable.fusion');

        return $view;
    }
}
