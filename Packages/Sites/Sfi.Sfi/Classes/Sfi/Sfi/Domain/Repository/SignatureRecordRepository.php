<?php
namespace Sfi\Sfi\Domain\Repository;

use Neos\Flow\Annotations as Flow;
use Neos\Flow\Persistence\Repository;

/**
 * @Flow\Scope("singleton")
 */
class SignatureRecordRepository extends Repository
{
    /**
     * @param string $signKey
     * @return \Sfi\Sfi\Domain\Model\SignatureRecord|null
     */
    public function findOneBySignKey(string $signKey)
    {
        $query = $this->createQuery();
        return $query->matching($query->equals('signKey', $signKey))->execute()->getFirst();
    }
}
