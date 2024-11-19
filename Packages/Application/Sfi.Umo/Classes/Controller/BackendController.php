<?php

namespace Sfi\Umo\Controller;

/*
 * This file is part of the Sfi.Umo package.
 */

use Neos\Flow\Annotations as Flow;

use Neos\Neos\Domain\Service\NodeSearchService;
use Neos\Eel\FlowQuery\FlowQuery;

use Neos\Flow\ObjectManagement\ObjectManagerInterface;
use Neos\Flow\ResourceManagement\ResourceManager;
use Neos\Media\Domain\Repository\ImageRepository;
use Neos\Media\Domain\Repository\AssetRepository;

use Neos\Neos\Controller\Module\AbstractModuleController;

function encodeURI($url)
{
    // http://php.net/manual/en/function.rawurlencode.php
    // https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/encodeURI
    $unescaped = array(
        '%2D' => '-',
        '%5F' => '_',
        '%2E' => '.',
        '%21' => '!',
        '%7E' => '~',
        '%2A' => '*',
        '%27' => "'",
        '%28' => '(',
        '%29' => ')'
    );
    $reserved = array(
        '%3B' => ';',
        '%2C' => ',',
        '%2F' => '/',
        '%3F' => '?',
        '%3A' => ':',
        '%40' => '@',
        '%26' => '&',
        '%3D' => '=',
        '%2B' => '+',
        '%24' => '$'
    );
    $score = array(
        '%23' => '#'
    );
    return strtr(rawurlencode($url), array_merge($reserved, $unescaped, $score));
}

function arrayDeepSet(&$array, $path, $value)
{
    $current = &$array;
    foreach ($path as $key) {
        if (!isset($current[$key])) {
            $current[$key] = [];
        }
        $current = &$current[$key];
    }
    $current[] = $value;
}

class BackendController extends AbstractModuleController
{

    /**
     * @Flow\Inject
     * @var ObjectManagerInterface
     */
    protected $objectManager;

    /**
     * @Flow\Inject(lazy = FALSE)
     * @var \Doctrine\Common\Persistence\ObjectManager
     */
    protected $entityManager;


    /**
     * @Flow\Inject
     * @var \Neos\ContentRepository\Domain\Service\NodeTypeManager
     */
    protected $nodeTypeManager;

    /**
     * @var \Neos\ContentRepository\Domain\Service\Context
     */
    protected $context;

    /**
     * @Flow\Inject
     * @var \Neos\ContentRepository\Domain\Service\ContextFactoryInterface
     */
    protected $contextFactory;

    /**
     * @Flow\Inject
     * @var NodeSearchService
     */
    protected $nodeSearchService;

    /**
     * @Flow\Inject
     * @var ResourceManager
     */
    protected $resourceManager;

    /**
     * @Flow\Inject
     * @var ImageRepository
     */
    protected $imageRepository;

    /**
     * @Flow\Inject
     * @var AssetRepository
     */
    protected $assetRepository;

    /**
     * @return void
     */
    public function indexAction() {}

    protected $collectionByType = [
        'W' => 'assetRpd',
        'P' => 'assetsPracticeAnnotations',
        'F' => 'fos',
        'M' => 'assetsMethodical',
        'E' => 'upbringing',
        'O' => 'assetDescriptions',
        'T' => 'assetsPlan',
        'C' => 'schedule',
        // 'A' => 'assetsSubjectAnnotations'
    ];

    protected $titleByType = [
        'W' => 'Рабочие программы дисциплин',
        'P' => 'Практики',
        'F' => 'Фонды оценочных средств',
        'E' => 'Рабочая программа воспитания и календарный план воспитательной работы',
        'M' => 'Методические и иные документы',
        'O' => 'Описание образовательной программы',
        'T' => 'Учебный план',
        'C' => 'Календарный учебный график',
        'A' => 'Аннотации к рабочим программам дисциплин'
    ];

    protected $output = '';

    function renderRows($maybeRows, $level)
    {
        $text = '';
        if (isset($maybeRows['filepath'])) {
            $fileUri = encodeURI('https://sfi.ru/umo/' . $maybeRows['filepath']);
            $name = $maybeRows['название'];
            $this->output .= "<li style='list-style-type: initial'>$name</li>";
            $signDate = $maybeRows['дата_подписи'];
            $key = sha1($fileUri);

            $signee = 'Мазуров Алексей Борисович';
            if (strtotime($signDate) > strtotime('2024-04-15')) {
                $signee = 'Копировский Александр Михайлович';
            }

            $text .= "<a href=\"$fileUri\" data-signature=\"{&quot;signed&quot;:false,&quot;signee&quot;:&quot;$signee&quot;,&quot;signeePosition&quot;:&quotРектор&quot;,&quot;signDate&quot;:&quot;$signDate&quot;,&quot;signKey&quot;:&quot;$key&quot;}\">$name</a><br>";
        } else {
            if (isset($maybeRows[0]['сортировка'])) {
                usort($maybeRows, function ($a, $b) {
                    $aIsSet = isset($a['сортировка']);
                    $bIsSet = isset($b['сортировка']);

                    if (!$aIsSet && $bIsSet) {
                        return 1;
                    }
                    if ($aIsSet && !$bIsSet) {
                        return -1;
                    }

                    if (!$aIsSet && !$bIsSet) {
                        return 0;
                    }

                    return $a['сортировка'] <=> $b['сортировка'];
                });
            }
            foreach ($maybeRows as $subCategory => $rows) {
                if (!is_numeric($subCategory) && $subCategory) {
                    if ($level == 1) {
                        $text .= "<strong>$subCategory</strong><br>";
                    } else if ($level == 2) {
                        $text .= "<strong><em>$subCategory</em></strong><br>";
                    } else if ($level == 3) {
                        $text .= "<em>$subCategory</em><br>";
                    } else {
                        // This isn't supported. Will get rendered pink so we'll notice it quickly
                        $text .= "<h1>$subCategory</h1><br>";
                    }
                }
                $text .= $this->renderRows($rows, $level + 1);
            }
        }
        return $text;
    }


    /**
     * @return void
     */
    public function importAction()
    {

        $umoPaths = '/data/www-provisioned/Web/umo/';
        // $umoPaths = '/Users/dimaip/psmb/SfiDistr/umo/';

        $typeSubFolders = array_diff(scandir($umoPaths), array('..', '.'));

        $contentTree = [];

        $collectionToName = [];

        $this->output = "";

        foreach ($typeSubFolders as $type) {
            if (!array_key_exists($type, $this->collectionByType)) {
                $this->output .= "<div style='color: red'>Не поддерживаемый тип: " . $type . "</div>";
                continue;
            }
            $umoPath = $umoPaths . $type . '/';

            $subFolders = array_diff(scandir($umoPath), array('..', '.'));

            foreach ($subFolders as $subFolder) {
                $indexPath = $umoPath . $subFolder . '/index.csv';
                if (!file_exists($indexPath)) {
                    $this->output .= "Файл не найден: " . $indexPath . "<br>";
                    continue;
                }
                $handle = fopen($indexPath, 'r');
                $head = fgetcsv($handle, 0, ';');

                while (($data = fgetcsv($handle, 0, ';')) !== FALSE) {
                    $row = array_combine($head, $data);
                    $specialityId = $row['код'];
                    $year = $row['год'];
                    $forms = explode('_', $row['формы_обучения']);
                    $categories = explode('_', $row['категории']);
                    $row['filepath'] = $type . '/' . $subFolder . '/' . $row['файл'];
                    $row['type'] = $type;

                    $collectionPrefix = $this->collectionByType[$type];

                    if (in_array('о', $forms)) {
                        $collectionToName[$collectionPrefix . 'O'] = $this->titleByType[$type];
                        arrayDeepSet($contentTree, array_merge([$specialityId, $collectionPrefix . 'O', $year], $categories), $row);
                    }
                    if (in_array('оз', $forms)) {
                        $collectionToName[$collectionPrefix . 'OZ'] = $this->titleByType[$type];
                        arrayDeepSet($contentTree, array_merge([$specialityId, $collectionPrefix . 'OZ', $year], $categories), $row);
                    }
                    if (in_array('з', $forms)) {
                        $collectionToName[$collectionPrefix . 'Z'] = $this->titleByType[$type];
                        arrayDeepSet($contentTree, array_merge([$specialityId, $collectionPrefix . 'Z', $year], $categories), $row);
                    }
                }
            }
        }

        $context = $this->contextFactory->create(array('workspaceName' => 'live', 'invisibleContentShown' => true));
        $studyProgramsNode = $context->getNodeByIdentifier('1c3f1916-e48f-a31b-1026-5d0b376297a2');


        foreach ($contentTree as $specialityId => $filesByForm) {
            foreach ($filesByForm as $collectionName => $byYear) {
                $flowQuery = new FlowQuery(array($studyProgramsNode));
                $studyProgram = $flowQuery->find('[instanceof Sfi.Sfi:StudyProgram]')->filter('[specialityIdInternal = "' . $specialityId . '"]')->get(0);

                if (!$studyProgram) {
                    $this->output .= "<div style='color: red'>Программа не найдена: " . $specialityId . "</div>";
                    continue;
                }

                $this->output .= "<h2>Импортирую программу " . $specialityId . "=>" . $collectionName . "</h2>";

                $flowQueryStudyProgram = new FlowQuery(array($studyProgram));
                $oldNodes = $flowQueryStudyProgram->find('[instanceof Neos.Neos:Content]')->filter('[umoGenerated = true]')->get();
                foreach ($oldNodes as $oldNode) {
                    $this->output .= "Удаляю старый элемент " . $oldNode->getPath() . "<br>";
                    $oldNode->remove();
                }

                $parentNode = $studyProgram->getNode($collectionName);

                foreach ($byYear as $year => $byCategory) {
                    $text = "<p style='margin-bottom: 0'>" . $this->renderRows($byCategory, 1) . "</p>";

                    $textNodeTemplate = new \Neos\ContentRepository\Domain\Model\NodeTemplate();
                    $textNodeTemplate->setNodeType($this->nodeTypeManager->getNodeType('Neos.NodeTypes:Text'));
                    $textNodeTemplate->setProperty('text', $text);
                    $textNodeTemplate->setProperty('paragraphVariant', 'ParagraphAlt');
                    $textNodeTemplate->setProperty('umoGenerated', true);

                    // Don't create an Expand node if less than 3 items
                    if (
                        is_array($byCategory) && (
                            (isset($byCategory[0]) && count($byCategory) < 3) ||
                            (isset($byCategory[''][0]) && count($byCategory) === 1 && count($byCategory['']) < 3)
                        )
                    ) {
                        $parentNode->createNodeFromTemplate($textNodeTemplate);
                    } else {
                        $categoryNodeTemplate = new \Neos\ContentRepository\Domain\Model\NodeTemplate();
                        $categoryNodeTemplate->setNodeType($this->nodeTypeManager->getNodeType('Sfi.Sfi:Expand'));
                        $title = $collectionToName[$collectionName];
                        $categoryNodeTemplate->setProperty('title', "$title (прием на обучение $year г.)");
                        $categoryNodeTemplate->setProperty('umoGenerated', true);

                        $categoryNode = $parentNode->createNodeFromTemplate($categoryNodeTemplate);
                        $categoryNode->createNodeFromTemplate($textNodeTemplate);
                    }
                }
            }
        }

        $this->output .= "Готово!";

        $this->view->assign('output', $this->output);
    }
}
