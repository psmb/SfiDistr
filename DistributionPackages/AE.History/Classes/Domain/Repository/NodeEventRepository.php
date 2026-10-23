<?php
namespace AE\History\Domain\Repository;

use Neos\Flow\Annotations as Flow;
use Neos\Flow\Persistence\QueryResultInterface;
use Neos\Neos\EventLog\Domain\Model\NodeEvent;
use Neos\Neos\EventLog\Domain\Repository\EventRepository;

/**
 * The repository for events
 *
 * @Flow\Scope("singleton")
 */
class NodeEventRepository extends EventRepository
{
    const ENTITY_CLASSNAME = NodeEvent::class;

    /**
     * Find all events which are "top-level" and in a given workspace (or are not NodeEvents)
     *
     * @param int $offset
     * @param int $limit
     * @param string $workspaceName
     * @param string|null $siteIdentifier
     * @param string|null $nodeIdentifier
     * @param string|null $accountIdentifier
     *
     * @return QueryResultInterface
     */
    public function findRelevantEventsByWorkspace(
        $offset,
        $limit,
        $workspaceName,
        string $siteIdentifier = null,
        string $nodeIdentifier = null,
        string $accountIdentifier = null
    ) : QueryResultInterface {
        $query = $this->prepareRelevantEventsQuery();
        $queryBuilder = $query->getQueryBuilder();
        $queryBuilder
            ->andWhere('e.workspaceName = :workspaceName AND e.eventType = :eventType')
            ->setParameter('workspaceName', $workspaceName)
            ->setParameter('eventType', 'Node.Published')
        ;
        if ($siteIdentifier !== null) {
            $siteCondition = '%' . trim(json_encode(['site' => $siteIdentifier], JSON_PRETTY_PRINT), "{}\n\t ") . '%';
            $queryBuilder
                ->andWhere('NEOSCR_TOSTRING(e.data) LIKE :site')
                ->setParameter('site', $siteCondition)
            ;
        }
        if ($nodeIdentifier !== null) {
            $queryBuilder
                ->andWhere('e.nodeIdentifier = :nodeIdentifier')
                ->setParameter('nodeIdentifier', $nodeIdentifier)
            ;
        }
        if ($accountIdentifier !== null) {
            $queryBuilder
                ->andWhere('e.accountIdentifier = :accountIdentifier')
                ->setParameter('accountIdentifier', $accountIdentifier)
            ;
        }
        $queryBuilder->setFirstResult($offset);
        $queryBuilder->setMaxResults($limit);

        return $query->execute();
    }

    /**
     * Find all account identifiers that modified a specific site
     *
     * @param string $workspaceName
     * @param string|null $siteIdentifier
     * @param string|null $nodeIdentifier
     *
     * @return array
     */
    public function findAccountIdentifiers(
        string $workspaceName,
        string $siteIdentifier = null,
        string $nodeIdentifier = null
    ) : array {
        $query = $this->prepareRelevantEventsQuery();
        $queryBuilder = $query->getQueryBuilder();
        $queryBuilder
            ->andWhere('e.workspaceName = :workspaceName AND e.eventType = :eventType')
            ->setParameter('workspaceName', $workspaceName)
            ->setParameter('eventType', 'Node.Published')
        ;
        if ($siteIdentifier !== null) {
            $siteCondition = '%' . trim(json_encode(['site' => $siteIdentifier], JSON_PRETTY_PRINT), "{}\n\t ") . '%';
            $queryBuilder
                ->andWhere('NEOSCR_TOSTRING(e.data) LIKE :site')
                ->setParameter('site', $siteCondition)
            ;
        }
        if ($nodeIdentifier !== null) {
            $queryBuilder
                ->andWhere('e.nodeIdentifier = :nodeIdentifier')
                ->setParameter('nodeIdentifier', $nodeIdentifier)
            ;
        }

        $queryBuilder->groupBy('e.accountIdentifier');
        $queryBuilder->orderBy(null);

        $dql = str_replace('SELECT e', 'SELECT e.accountIdentifier', rtrim($queryBuilder->getDql(), ' ORDER BY '));

        $dqlQuery = $this->createDqlQuery($dql);
        $dqlQuery->setParameters($query->getParameters());

        return array_map(function($result) {
            return $result['accountIdentifier'];
        }, $dqlQuery->execute());
    }
}
