<?php
namespace Sfi\Sfi\Command;

use Neos\Flow\Annotations as Flow;
use Neos\ContentRepository\Domain\Service\ContextFactoryInterface;
use Neos\Flow\Cli\CommandController;
use Neos\Eel\FlowQuery\FlowQuery;
use Neos\ContentRepository\Domain\Model\NodeInterface;

/**
 * @Flow\Scope("singleton")
 */
class AlmanacMigrationCommandController extends CommandController
{
    /**
     * @Flow\Inject
     * @var ContextFactoryInterface
     */
    protected $contextFactory;

    /**
     * Migrates category property to categories array for all AlmanacEntry nodes
     *
     * @param bool $dryRun DryRun: show what would be changed but don't actually modify
     * @return void
     */
    public function migrateCategoryToCategoriesCommand($dryRun = false)
    {
        $contextProperties = array(
            'workspaceName' => 'live',
            'dimensions' => ['language' => ['ru']],
            'invisibleContentShown' => true,
            'inaccessibleContentShown' => true
        );
        $context = $this->contextFactory->create($contextProperties);
        $siteNode = $context->getNode('/sites/sfi');
        
        if (!$siteNode) {
            $this->outputLine('<error>Could not find site node</error>');
            return;
        }

        $flowQuery = new FlowQuery(array($siteNode));
        $almanacEntryNodes = $flowQuery->find('[instanceof Sfi.Sfi:AlmanacEntry]')->get();

        $this->outputLine('Found %d AlmanacEntry nodes', [count($almanacEntryNodes)]);

        $processedCount = 0;
        $skippedCount = 0;

        foreach ($almanacEntryNodes as $node) {
            /** @var NodeInterface $node */
            $nodeIdentifier = $node->getIdentifier();
            $nodeLabel = $node->getLabel() ?: $nodeIdentifier;
            
            $category = $node->getProperty('category');
            $categories = $node->getProperty('categories');

            if ($category === null) {
                $this->outputLine('Skipping node "%s" - no category property set', [$nodeLabel]);
                $skippedCount++;
                continue;
            }

            // Check if categories already contains the category
            if ($categories && is_array($categories) && in_array($category, $categories)) {
                $this->outputLine('Skipping node "%s" - categories already contains the category', [$nodeLabel]);
                $skippedCount++;
                continue;
            }

            if ($dryRun) {
                $this->outputLine('Would update node "%s" - setting categories to [%s]', [
                    $nodeLabel,
                    $category->getLabel() ?: $category->getIdentifier()
                ]);
            } else {
                $node->setProperty('categories', [$category]);
                $this->outputLine('Updated node "%s" - set categories to [%s]', [
                    $nodeLabel,
                    $category->getLabel() ?: $category->getIdentifier()
                ]);
            }
            
            $processedCount++;
        }

        $this->outputLine('');
        $this->outputLine('Migration completed:');
        $this->outputLine('- Processed: %d nodes', [$processedCount]);
        $this->outputLine('- Skipped: %d nodes', [$skippedCount]);
        
        if ($dryRun) {
            $this->outputLine('');
            $this->outputLine('<comment>This was a dry run. Use --dry-run=false to actually apply changes.</comment>');
        }
    }
} 