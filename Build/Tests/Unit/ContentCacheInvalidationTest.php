<?php

use Neos\ContentRepository\Domain\Model\NodeInterface;
use Neos\ContentRepository\Domain\Model\NodeType;
use Neos\ContentRepository\Domain\Model\Workspace;
use Neos\ContentRepository\Domain\Repository\WorkspaceRepository;
use Neos\ContentRepository\Domain\Service\Context;
use Neos\ContentRepository\Domain\Service\NodeTypeManager;
use Neos\Eel\InterpretedEvaluator;
use Neos\Eel\Utility;
use Neos\Fusion\Core\Cache\ContentCache;
use Neos\Neos\Fusion\Cache\ContentCacheFlusher;
use Neos\Neos\Fusion\Helper\CachingHelper;
use PHPUnit\Framework\TestCase;
use Psr\Log\NullLogger;

final class ContentCacheInvalidationTest extends TestCase
{
    public static function configuredNodeTypeTags(): iterable
    {
        $root = dirname(__DIR__, 3);
        foreach (['Packages/Application/Sfi.News', 'Packages/Application/Sfi.Shared', 'Packages/Sites/Sfi.Sfi'] as $package) {
            $files = new RecursiveIteratorIterator(new RecursiveDirectoryIterator(
                $root . '/' . $package . '/Resources/Private/Fusion',
                FilesystemIterator::SKIP_DOTS
            ));
            foreach ($files as $file) {
                if ($file->getExtension() !== 'fusion') {
                    continue;
                }
                preg_match_all('/\$\{Neos\.Caching\.nodeTypeTag\(\'([^\']+)\'[^}]*\)\}/', file_get_contents($file->getPathname()), $matches, PREG_SET_ORDER);
                foreach ($matches as $index => $match) {
                    foreach (['live', 'user-editor'] as $workspace) {
                        yield $package . '/' . $file->getFilename() . ':' . $index . ':' . $workspace => [$match[0], $match[1], $workspace];
                    }
                }
            }
        }
    }

    /** @dataProvider configuredNodeTypeTags */
    public function testNodeChangesInvalidateConfiguredListTags(string $expression, string $nodeTypeName, string $workspaceName): void
    {
        $workspace = $this->createMock(Workspace::class);
        $workspace->method('getName')->willReturn($workspaceName);
        $context = $this->createMock(Context::class);
        $context->method('getWorkspace')->willReturn($workspace);
        $nodeType = $this->createMock(NodeType::class);
        $nodeType->method('getName')->willReturn($nodeTypeName);
        $nodeType->method('getDeclaredSuperTypes')->willReturn([]);
        $node = $this->createMock(NodeInterface::class);
        $node->method('getContext')->willReturn($context);
        $node->method('getWorkspace')->willReturn($workspace);
        $node->method('getNodeType')->willReturn($nodeType);
        $node->method('getIdentifier')->willReturn('12295cdf-e78c-4ef3-bc46-ccea04ce1882');
        $node->method('getDepth')->willReturn(1);

        $tag = Utility::evaluateEelExpression($expression, new InterpretedEvaluator(), [
            'Neos' => ['Caching' => new CachingHelper()],
            'node' => $node,
            'documentNode' => $node,
        ]);
        $cache = $this->createMock(ContentCache::class);
        $cache->expects(self::once())->method('flushByTags')
            ->with(self::callback(fn(array $tags) => in_array($tag, $tags, true)))
            ->willReturn(1);
        $workspaces = $this->getMockBuilder(WorkspaceRepository::class)
            ->disableOriginalConstructor()->addMethods(['findByBaseWorkspace'])->getMock();
        $workspaces->method('findByBaseWorkspace')->willReturn(new ArrayIterator());
        $nodeTypes = $this->createMock(NodeTypeManager::class);
        $nodeTypes->method('getNodeType')->with($nodeTypeName)->willReturn($nodeType);

        $flusher = new ContentCacheFlusher();
        foreach (['contentCache' => $cache, 'workspaceRepository' => $workspaces,
            'nodeTypeManager' => $nodeTypes, 'systemLogger' => new NullLogger()] as $property => $value) {
            (new ReflectionProperty($flusher, $property))->setValue($flusher, $value);
        }
        $flusher->registerNodeChange($node);
        $flusher->shutdownObject();
    }
}
