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

        // /umo/ link (base64 encoded with u: prefix)
        if (strpos($key, 'u:') === 0) {
            $this->handleUmoKey($key);
            return;
        }

        // Node identifier (n: prefix)
        if (strpos($key, 'n:') === 0) {
            $this->handleNodeKey($key);
            return;
        }

        // Asset lookup by SHA1 (inline links)
        $this->handleSha1Key($key);
    }

    /**
     * Handle /umo/ file lookup - parse index.csv for signature metadata
     */
    protected function handleUmoKey(string $key): void
    {
        $path = base64_decode(substr($key, 2), true);
        if ($path === false) {
            $this->addFlashMessage('Неверный формат ключа', '', Message::SEVERITY_ERROR);
            return;
        }
        $filePath = FLOW_PATH_WEB . 'umo/' . $path;
        if (!file_exists($filePath) || !is_file($filePath)) {
            $this->addFlashMessage('Файл не найден', '', Message::SEVERITY_WARNING);
            return;
        }
        $this->view->assign('umoPath', '/umo/' . $path);
        $this->view->assign('fileName', basename($path));

        // Parse index.csv for signature metadata
        $dir = dirname($filePath);
        $indexPath = $dir . '/index.csv';
        if (file_exists($indexPath)) {
            $handle = fopen($indexPath, 'r');
            $head = fgetcsv($handle, 0, ';');
            while (($data = fgetcsv($handle, 0, ';')) !== false) {
                $row = array_combine($head, $data);
                if ($row && $row['файл'] === basename($path)) {
                    $signDate = $row['дата_подписи'] ?? null;
                    if ($signDate) {
                        $signee = 'Мазуров Алексей Борисович';
                        if (strtotime($signDate) > strtotime('2024-04-15')) {
                            $signee = 'Копировский Александр Михайлович';
                        }
                        $this->view->assign('signature', [
                            'signee' => $signee,
                            'signeePosition' => 'Ректор',
                            'signDate' => $signDate,
                        ]);
                    }
                    break;
                }
            }
            fclose($handle);
        }
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
     * Handle asset lookup by SHA1 - check SignatureRecord for metadata
     */
    protected function handleSha1Key(string $key): void
    {
        $sha1 = strtolower($key);
        if (!preg_match('/^[a-f0-9]{40}$/', $sha1)) {
            $this->addFlashMessage('Неверный формат ключа', '', Message::SEVERITY_ERROR);
            return;
        }
        $asset = $this->assetRepository->findOneByResourceSha1($sha1);
        if ($asset === null) {
            $this->addFlashMessage('Файл не найден', '', Message::SEVERITY_WARNING);
            return;
        }
        $this->view->assign('asset', $asset);

        // Look up signature metadata from the registry
        $record = $this->signatureRecordRepository->findOneBySignKey($sha1);
        if ($record !== null) {
            $this->view->assign('signature', [
                'signee' => $record->getSignee(),
                'signeePosition' => $record->getSigneePosition(),
                'signDate' => $record->getSignDate()->format('d.m.Y'),
            ]);
        }
    }

    /**
     * Store signature metadata (requires editor authentication)
     *
     * @param string $signKey
     * @param string $signee
     * @param string $signeePosition
     * @param string $signDate
     * @param string $sourceUrl
     * @return string
     * @Flow\SkipCsrfProtection
     */
    public function storeAction(string $signKey, string $signee, string $signeePosition, string $signDate, string $sourceUrl = '')
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
