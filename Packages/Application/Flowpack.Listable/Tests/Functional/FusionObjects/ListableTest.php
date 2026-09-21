<?php
namespace Flowpack\Listable\Tests\Functional\FusionObjects;

use Neos\ContentRepository\Domain\Model\NodeInterface;

class ListableTest extends AbstractTypoScriptObjectTestCase
{
    /**
     * @test
     */
    public function basicListingWorks()
    {
        $newNode1 = $this->getMockBuilder(NodeInterface::class)->getMock();
        $newNode1->method('getProperties')->willReturn(['title' => 'Hello world']);
        $newNode2 = $this->getMockBuilder(NodeInterface::class)->getMock();
        $newNode2->method('getProperties')->willReturn(['title' => 'Another hello world!']);

        $view = $this->buildView();
        $view->setFusionPath('listable/basicListing');
        $view->assign('collection', [$newNode1, $newNode2]);
        $this->assertXmlStringEqualsXmlString(
          '<ul class="">
            <li class="">Hello world</li>
            <li class="">Another hello world!</li>
          </ul>',
          $view->render()
        );
    }
}
