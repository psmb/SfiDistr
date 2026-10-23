<?php

use Neos\ContentRepository\Domain\Model\NodeInterface;
use Neos\Flow\Aop\JoinPointInterface;
use Neos\Flow\Security\Exception\AccessDeniedException;
use Neos\Neos\Ui\Service\NodePolicyService;
use PHPUnit\Framework\TestCase;
use Sfi\Sfi\Aspects\BackendNodeAccessAspect;

final class BackendNodeAccessTest extends TestCase
{
    public static function contexts(): array
    {
        return ['default document' => [false, true], 'allowed document' => [true, true], 'restricted document' => [true, false]];
    }

    /** @dataProvider contexts */
    public function testDeepLinksRespectExistingNodeTreePolicy(bool $explicitNode, bool $granted): void
    {
        $node = $explicitNode ? $this->createMock(NodeInterface::class) : null;
        $joinPoint = $this->createMock(JoinPointInterface::class);
        $joinPoint->method('getMethodArgument')->with('node')->willReturn($node);
        $policy = $this->createMock(NodePolicyService::class);
        $policy->expects($explicitNode ? self::once() : self::never())->method('isNodeTreePrivilegeGranted')->with($node)->willReturn($granted);
        $aspect = new BackendNodeAccessAspect();
        (new ReflectionProperty($aspect, 'nodePolicyService'))->setValue($aspect, $policy);
        if (!$granted) {
            $this->expectException(AccessDeniedException::class);
        }
        $aspect->enforceNodeTreeAccess($joinPoint);
    }
}
