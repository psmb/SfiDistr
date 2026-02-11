<?php
namespace Sfi\Sfi\Controller;

use Neos\Flow\Mvc\Controller\ActionController;
use Neos\Flow\Annotations as Flow;
use Neos\Media\Domain\Repository\AssetRepository;
use Neos\ContentRepository\Domain\Service\ContextFactoryInterface;
use Neos\Error\Messages\Message;
use Sfi\Sfi\Domain\Repository\SignatureRecordRepository;
use Sfi\Sfi\Domain\Model\SignatureRecord;

class SignatureRegistryController extends ActionController
{
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
     * @var SignatureRecordRepository
     */
    protected $signatureRecordRepository;

    /**
     * @param string $key
     */
    public function indexAction(string $key = null)
    {
        if ($key === null) {
            return;
        }

        $key = trim($key);
        $this->view->assign('key', $key);

        // Node identifier (n: prefix)
        if (strpos($key, 'n:') === 0) {
            $this->handleNodeKey($key);
            return;
        }

        // SHA1 hash lookup (covers both UMO files and inline asset links)
        $this->handleHashKey($key);
    }

    /**
     * Handle Neos node lookup by identifier - get signature from node properties
     */
    protected function handleNodeKey(string $key): void
    {
        $nodeIdentifier = substr($key, 2);
        if (empty($nodeIdentifier)) {
            $this->addFlashMessage('Неверный формат ключа', '', Message::SEVERITY_ERROR);
            return;
        }

        $context = $this->contextFactory->create(['workspaceName' => 'live']);
        $node = $context->getNodeByIdentifier($nodeIdentifier);

        if ($node === null) {
            $this->addFlashMessage('Файл не найден', '', Message::SEVERITY_WARNING);
            return;
        }

        $asset = $node->getProperty('asset');
        if ($asset) {
            $this->view->assign('asset', $asset);
        }

        $signee = $node->getProperty('signee');
        $signDate = $node->getProperty('signDate');
        if ($signee || $signDate) {
            $this->view->assign('signature', [
                'signee' => $signee,
                'signeePosition' => $node->getProperty('signeePosition'),
                'signDate' => $signDate instanceof \DateTime ? $signDate->format('d.m.Y') : $signDate,
            ]);
        }
    }

    /**
     * Handle hash key lookup - covers both UMO files and inline asset links via SignatureRecord
     */
    protected function handleHashKey(string $key): void
    {
        $hash = strtolower($key);
        if (!preg_match('/^[a-f0-9]{40}$/', $hash)) {
            $this->addFlashMessage('Неверный формат ключа', '', Message::SEVERITY_ERROR);
            return;
        }

        // Look up SignatureRecord (covers UMO files and inline asset links)
        $record = $this->signatureRecordRepository->findOneBySignKey($hash);

        if ($record !== null) {
            $sourceUrl = $record->getSourceUrl();

            // UMO file: sourceUrl starts with /umo/
            if ($sourceUrl && strpos($sourceUrl, '/umo/') === 0) {
                $filePath = FLOW_PATH_WEB . ltrim($sourceUrl, '/');
                if (file_exists($filePath) && is_file($filePath)) {
                    $this->view->assign('umoPath', $sourceUrl);
                    $this->view->assign('fileName', basename($sourceUrl));
                } else {
                    $this->addFlashMessage('Файл не найден', '', Message::SEVERITY_WARNING);
                    return;
                }
            } else {
                // Inline asset link: try asset lookup by SHA1
                $asset = $this->assetRepository->findOneByResourceSha1($hash);
                if ($asset !== null) {
                    $this->view->assign('asset', $asset);
                }
            }

            $this->view->assign('signature', [
                'signee' => $record->getSignee(),
                'signeePosition' => $record->getSigneePosition(),
                'signDate' => $record->getSignDate()->format('d.m.Y'),
            ]);
            return;
        }

        // No SignatureRecord - try direct asset lookup by SHA1
        $asset = $this->assetRepository->findOneByResourceSha1($hash);
        if ($asset !== null) {
            $this->view->assign('asset', $asset);
            return;
        }

        $this->addFlashMessage('Файл не найден', '', Message::SEVERITY_WARNING);
    }

    /**
     * Store signature metadata (requires editor authentication)
     *
     * @param string $signKey
     * @param string $signee
     * @param string $signeePosition
     * @param string $signDate
     * @param string $sourceUrl
     * @param string $folder
     * @return string
     * @Flow\SkipCsrfProtection
     */
    public function storeAction(string $signKey, string $signee, string $signeePosition, string $signDate, string $sourceUrl = '', string $folder = '')
    {
        $record = $this->signatureRecordRepository->findOneBySignKey($signKey);
        if ($record === null) {
            $record = new SignatureRecord();
            $record->setSignKey($signKey);
            $this->signatureRecordRepository->add($record);
        }

        $record->setSignee($signee);
        $record->setSigneePosition($signeePosition);
        $record->setSignDate(new \DateTime($signDate));
        $record->setSourceUrl($sourceUrl);
        $record->setFolder($folder ?: null);
        $this->signatureRecordRepository->update($record);

        return json_encode(['status' => 'ok', 'signKey' => $signKey]);
    }

    /**
     * Resolve asset identifier (UUID) to SHA1
     *
     * @param string $identifier
     * @return string
     * @Flow\SkipCsrfProtection
     */
    public function getAssetSha1Action(string $identifier)
    {
        $asset = $this->assetRepository->findByIdentifier($identifier);
        if ($asset === null) {
            $this->response->setStatusCode(404);
            return json_encode(['error' => 'Asset not found']);
        }
        return json_encode(['sha1' => $asset->getResource()->getSha1()]);
    }
}
