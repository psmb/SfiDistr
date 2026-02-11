<?php
namespace Sfi\Sfi\Command;

use Neos\Flow\Annotations as Flow;
use Neos\Flow\Cli\CommandController;
use Neos\Flow\ResourceManagement\ResourceManager;
use Neos\ContentRepository\Domain\Service\ContextFactoryInterface;
use Neos\ContentRepository\Domain\Model\NodeInterface;
use Neos\Media\Domain\Repository\AssetRepository;
use Neos\Eel\FlowQuery\FlowQuery;
use Sfi\Sfi\Domain\Repository\SignatureRecordRepository;

/**
 * @Flow\Scope("singleton")
 */
class SignatureCommandController extends CommandController
{
    /**
     * @Flow\Inject
     * @var SignatureRecordRepository
     */
    protected $signatureRecordRepository;

    /**
     * @Flow\Inject
     * @var AssetRepository
     */
    protected $assetRepository;

    /**
     * @Flow\Inject
     * @var ContextFactoryInterface
     */
    protected $contextFactory;

    /**
     * @Flow\Inject
     * @var ResourceManager
     */
    protected $resourceManager;

    /**
     * @Flow\InjectConfiguration(package="Sfi.Sfi", path="watermarkService")
     * @var array
     */
    protected $settings;

    /**
     * Generate watermarked PDFs for all signed files
     *
     * Collects signed files from SignatureRecords (UMO files and inline assets)
     * and from Sfi.Shared:Asset nodes with signee set. For each, calls the
     * watermark service to stamp a signature and saves the result to disk.
     *
     * @param bool $force Force regeneration of existing files
     * @param bool $dryRun Show what would be done without generating files
     * @return void
     */
    public function generateSignedPdfsCommand(bool $force = false, bool $dryRun = false): void
    {
        $outputBasePath = rtrim($this->settings['outputBasePath'], '/');
        $logFile = $outputBasePath . '/generation.log';

        if (!$dryRun && !is_dir($outputBasePath)) {
            mkdir($outputBasePath, 0775, true);
        }

        $items = [];

        // Source A: SignatureRecords
        $this->collectFromSignatureRecords($items);

        // Source B: Sfi.Shared:Asset nodes with signee set
        $this->collectFromAssetNodes($items);

        $total = count($items);
        $this->log($logFile, $dryRun, 'Found %d signed files to process.', [$total]);

        if ($total === 0) {
            $this->log($logFile, $dryRun, 'Nothing to do.');
            return;
        }

        $processed = 0;
        $skipped = 0;
        $errors = 0;

        foreach ($items as $index => $item) {
            $outputPath = $outputBasePath . '/' . $item['relativePath'];
            $progress = sprintf('[%d/%d]', $index + 1, $total);

            if (!$force && file_exists($outputPath)) {
                $this->log($logFile, $dryRun, '%s SKIP (exists): %s', [$progress, $item['relativePath']]);
                $skipped++;
                continue;
            }

            if ($dryRun) {
                $this->log($logFile, $dryRun, '%s DRY-RUN: would generate %s', [$progress, $item['relativePath']]);
                $processed++;
                continue;
            }

            // Build watermark service request
            $jsonPayload = json_encode([
                'url' => $item['url'],
                'signDate' => $item['signDate'],
                'signee' => $item['signee'],
                'signeePosition' => $item['signeePosition'],
                'signKey' => $item['signKey'],
            ], JSON_UNESCAPED_UNICODE);

            $encodedData = base64_encode(rawurlencode($jsonPayload));
            $serviceUrl = rtrim($this->settings['baseUrl'], '/') . '/?data=' . $encodedData;

            try {
                $pdfContent = $this->fetchUrl($serviceUrl, 120);
            } catch (\Exception $e) {
                $this->log($logFile, $dryRun, '%s ERROR: %s -- %s', [$progress, $item['relativePath'], $e->getMessage()]);
                $errors++;
                continue;
            }

            if (strlen($pdfContent) < 5 || substr($pdfContent, 0, 5) !== '%PDF-') {
                $this->log($logFile, $dryRun, '%s ERROR: %s -- Response is not a valid PDF (%d bytes)', [$progress, $item['relativePath'], strlen($pdfContent)]);
                $errors++;
                continue;
            }

            $outputDir = dirname($outputPath);
            if (!is_dir($outputDir)) {
                if (!mkdir($outputDir, 0775, true) && !is_dir($outputDir)) {
                    $this->log($logFile, $dryRun, '%s ERROR: %s -- Could not create directory: %s', [$progress, $item['relativePath'], $outputDir]);
                    $errors++;
                    continue;
                }
            }

            $bytesWritten = file_put_contents($outputPath, $pdfContent);
            if ($bytesWritten === false) {
                $this->log($logFile, $dryRun, '%s ERROR: %s -- Failed to write file', [$progress, $item['relativePath']]);
                $errors++;
                continue;
            }

            $this->log($logFile, $dryRun, '%s OK: %s (%s)', [$progress, $item['relativePath'], $this->formatBytes($bytesWritten)]);
            $processed++;
        }

        $this->log($logFile, $dryRun, '');
        $this->log($logFile, $dryRun, '--- Summary ---');
        $this->log($logFile, $dryRun, 'Total:     %d', [$total]);
        $this->log($logFile, $dryRun, 'Generated: %d', [$processed]);
        $this->log($logFile, $dryRun, 'Skipped:   %d', [$skipped]);
        $this->log($logFile, $dryRun, 'Errors:    %d', [$errors]);

        if ($dryRun) {
            $this->log($logFile, $dryRun, '');
            $this->log($logFile, $dryRun, 'This was a dry run. Remove --dry-run to actually generate files.');
        }
    }

    /**
     * Collect items from SignatureRecords
     */
    protected function collectFromSignatureRecords(array &$items): void
    {
        $sourceUrlPrefix = rtrim($this->settings['sourceUrlPrefix'], '/');

        foreach ($this->signatureRecordRepository->findAll() as $record) {
            $sourceUrl = $record->getSourceUrl();
            $signKey = $record->getSignKey();

            if ($sourceUrl && strpos($sourceUrl, '/umo/') === 0) {
                // UMO file: check if file still exists on disk
                $filePath = FLOW_PATH_WEB . ltrim($sourceUrl, '/');
                if (!file_exists($filePath) || !is_file($filePath)) {
                    continue;
                }
                $relativePath = substr($sourceUrl, strlen('/umo/'));
                $url = self::encodeURI($sourceUrlPrefix . $sourceUrl);
            } else {
                // Inline asset link: signKey is resource SHA1
                $asset = $this->assetRepository->findOneByResourceSha1($signKey);
                if ($asset === null) {
                    continue;
                }
                $resource = $asset->getResource();
                $url = $this->resourceManager->getPublicPersistentResourceUri($resource);
                if (!$url) {
                    continue;
                }
                $filename = $resource->getFilename() ?: $signKey . '.pdf';
                $relativePath = 'assets/' . $signKey . '_' . $filename;
            }

            $signDate = $record->getSignDate();
            $items[] = [
                'relativePath' => $relativePath,
                'url' => $url,
                'signDate' => $signDate ? $signDate->format('d.m.Y') : '',
                'signee' => $record->getSignee(),
                'signeePosition' => $record->getSigneePosition(),
                'signKey' => $signKey,
            ];
        }
    }

    /**
     * Collect items from Sfi.Shared:Asset nodes with signee property set
     */
    protected function collectFromAssetNodes(array &$items): void
    {
        $context = $this->contextFactory->create([
            'workspaceName' => 'live',
            'dimensions' => ['language' => ['ru']],
            'invisibleContentShown' => true,
            'inaccessibleContentShown' => true,
        ]);
        $siteNode = $context->getNode('/sites/sfi');
        if (!$siteNode) {
            $this->outputLine('<comment>Warning: Could not find site node, skipping Asset nodes</comment>');
            return;
        }

        $flowQuery = new FlowQuery([$siteNode]);
        $nodes = $flowQuery->find('[instanceof Sfi.Shared:Asset]')->get();

        foreach ($nodes as $node) {
            /** @var NodeInterface $node */
            $signee = $node->getProperty('signee');
            if (empty($signee)) {
                continue;
            }

            $asset = $node->getProperty('asset');
            if ($asset === null) {
                continue;
            }
            // In CLI context, the property may return a string identifier instead of an Asset object
            if (is_string($asset)) {
                $asset = $this->assetRepository->findByIdentifier($asset);
                if ($asset === null) {
                    continue;
                }
            }

            $resource = $asset->getResource();
            $url = $this->resourceManager->getPublicPersistentResourceUri($resource);
            if (!$url) {
                continue;
            }

            $filename = $resource->getFilename() ?: $node->getIdentifier() . '.pdf';
            $relativePath = 'nodes/' . $node->getIdentifier() . '_' . $filename;

            $signDate = $node->getProperty('signDate');

            $items[] = [
                'relativePath' => $relativePath,
                'url' => $url,
                'signDate' => $signDate instanceof \DateTime ? $signDate->format('d.m.Y') : '',
                'signee' => $signee,
                'signeePosition' => $node->getProperty('signeePosition') ?: '',
                'signKey' => 'n:' . $node->getIdentifier(),
            ];
        }
    }

    /**
     * Fetch URL content via cURL
     */
    protected function fetchUrl(string $url, int $timeout): string
    {
        $curl = curl_init();
        curl_setopt($curl, CURLOPT_URL, $url);
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($curl, CURLOPT_TIMEOUT, $timeout);
        curl_setopt($curl, CURLOPT_FOLLOWLOCATION, true);

        $result = curl_exec($curl);

        if ($result === false) {
            $error = curl_error($curl);
            curl_close($curl);
            throw new \Exception('cURL error: ' . $error);
        }

        $httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
        curl_close($curl);

        if ($httpCode >= 400) {
            throw new \Exception('HTTP ' . $httpCode . ': ' . substr($result, 0, 200));
        }

        return $result;
    }

    /**
     * Log message to both stdout and log file
     */
    protected function log(string $logFile, bool $dryRun, string $format, array $args = []): void
    {
        $message = vsprintf($format, $args);
        $this->outputLine($message);
        if (!$dryRun && $logFile) {
            file_put_contents($logFile, date('Y-m-d H:i:s') . ' ' . $message . "\n", FILE_APPEND);
        }
    }

    /**
     * PHP equivalent of JavaScript's encodeURI()
     */
    protected static function encodeURI(string $url): string
    {
        $unescaped = [
            '%2D' => '-', '%5F' => '_', '%2E' => '.', '%21' => '!',
            '%7E' => '~', '%2A' => '*', '%27' => "'", '%28' => '(', '%29' => ')',
        ];
        $reserved = [
            '%3B' => ';', '%2C' => ',', '%2F' => '/', '%3F' => '?', '%3A' => ':',
            '%40' => '@', '%26' => '&', '%3D' => '=', '%2B' => '+', '%24' => '$',
        ];
        $score = ['%23' => '#'];
        return strtr(rawurlencode($url), array_merge($reserved, $unescaped, $score));
    }

    protected function formatBytes(int $bytes): string
    {
        if ($bytes >= 1048576) {
            return round($bytes / 1048576, 1) . ' MB';
        }
        if ($bytes >= 1024) {
            return round($bytes / 1024, 1) . ' KB';
        }
        return $bytes . ' B';
    }
}
