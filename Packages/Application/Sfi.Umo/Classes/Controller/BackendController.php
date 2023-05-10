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
// This is a hackish approximation suitable for our purposes
function arrayIsList(&$arr)
{
    return isset($arr[0]);
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
    public function indexAction()
    {

    }

    protected $output = '';

    function renderRows($rows)
    {
        $text = '';
        $this->output .= "<ul>";
        foreach ($rows as $subCategory => $maybeRows) {
            if (arrayIsList($maybeRows)) {
                $text .= "<strong><em>$subCategory</em></strong><br>";
                $text .= $this->renderRows($maybeRows);
            } else {
                $fileUri = 'https://sfi.ru/umo/' . $maybeRows['filepath'];
                $name = $maybeRows['название'];
                $this->output .= "<li style='list-style-type: initial'>$name</li>";
                $signDate = $maybeRows['дата_подписи'];
                $key = sha1($fileUri);
                $text .= "<a href=\"$fileUri\" data-signature=\"{&quot;signed&quot;:false,&quot;signee&quot;:&quot;Мазуров Алексей Борисович&quot;,&quot;signeePosition&quot;:&quotРектор&quot;,&quot;signDate&quot;:&quot;$signDate&quot;,&quot;signKey&quot;:&quot;$key&quot;}\">$name</a><br>";
            }
        }
        $this->output .= "</ul>";
        return $text;
    }


    /**
     * @return void
     */
    public function importAction()
    {

        $umoPath = '/Users/dimaip/psmb/SfiDistr/umo/W/';

        $subFolders = array_diff(scandir($umoPath), array('..', '.'));

        $contentTree = [];

        $this->output = "";

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
                $row['filepath'] = $subFolder . '/' . $row['файл'];
                if (in_array('о', $forms)) {
                    arrayDeepSet($contentTree, array_merge([$specialityId, 'assetRpdO', $year], $categories), $row);
                }
                if (in_array('оз', $forms)) {
                    arrayDeepSet($contentTree, array_merge([$specialityId, 'assetRpdOZ', $year], $categories), $row);
                }
                if (in_array('з', $forms)) {
                    arrayDeepSet($contentTree, array_merge([$specialityId, 'assetRpdZ', $year], $categories), $row);
                }
            }
        }

        $context = $this->contextFactory->create(array('workspaceName' => 'live'));
        $studyProgramsNode = $context->getNodeByIdentifier('1c3f1916-e48f-a31b-1026-5d0b376297a2');


        foreach ($contentTree as $specialityId => $filesByForm) {
            foreach ($filesByForm as $collectionName => $byYear) {
                $flowQuery = new FlowQuery(array($studyProgramsNode));
                $studyProgram = $flowQuery->find('[instanceof Sfi.Sfi:StudyProgram]')->filter('[specialityId = "' . $specialityId . '"]')->get(0);

                if (!$studyProgram) {
                    $this->output .= "<div style='color: red'>Программа не найдена: " . $specialityId . "</div>";
                    continue;
                }
                
                $this->output .= "<h2>Импортирую программу " . $specialityId . "</h2>";

                $flowQueryStudyProgram = new FlowQuery(array($studyProgram));
                $oldNodes = $flowQueryStudyProgram->find('[instanceof Neos.Neos:Content]')->filter('[umoGenerated = true]')->get();
                foreach ($oldNodes as $oldNode) {
                    $this->output .= "Удаляю старый элемент " . $oldNode->getPath() . "<br>";
                    $oldNode->remove();
                }

                $parentNode = $studyProgram->getNode($collectionName);

                foreach ($byYear as $year => $byCategory) {
                    $categoryNodeTemplate = new \Neos\ContentRepository\Domain\Model\NodeTemplate();
                    $categoryNodeTemplate->setNodeType($this->nodeTypeManager->getNodeType('Sfi.Sfi:Expand'));
                    $categoryNodeTemplate->setProperty('title', "Рабочие программы дисциплин (прием на обучение $year г.)");
                    $categoryNodeTemplate->setProperty('umoGenerated', true);

                    $categoryNode = $parentNode->createNodeFromTemplate($categoryNodeTemplate);

                    $text = '<p>';
                    foreach ($byCategory as $category => $rows) {

                        $text .= "<strong>$category</strong><br>";
                        $text .= $this->renderRows($rows);
                        $text .= "<br>";
                    }
                    $text .= '</p>';

                    $textNodeTemplate = new \Neos\ContentRepository\Domain\Model\NodeTemplate();
                    $textNodeTemplate->setNodeType($this->nodeTypeManager->getNodeType('Neos.NodeTypes:Text'));
                    $textNodeTemplate->setProperty('text', $text);
                    $textNodeTemplate->setProperty('paragraphVariant', 'ParagraphAlt');
                    $textNodeTemplate->setProperty('umoGenerated', true);

                    $categoryNode->createNodeFromTemplate($textNodeTemplate);
                }
            }
        }

        $this->output .= "Готово!";

        $this->view->assign('output', $this->output);
    }

}
