<?php
namespace Sfi\Sfi\Domain\Model;

use Neos\Flow\Annotations as Flow;
use Doctrine\ORM\Mapping as ORM;

/**
 * @Flow\Entity
 */
class SignatureRecord
{
    /**
     * @var string
     * @ORM\Column(length=255, unique=true)
     */
    protected $signKey;

    /**
     * @var string
     */
    protected $signee;

    /**
     * @var string
     */
    protected $signeePosition;

    /**
     * @var \DateTime
     */
    protected $signDate;

    /**
     * @var string
     * @ORM\Column(length=2048, nullable=true)
     */
    protected $sourceUrl;

    /**
     * @var string
     * @ORM\Column(nullable=true)
     */
    protected $folder;

    public function getSignKey(): string
    {
        return $this->signKey;
    }

    public function setSignKey(string $signKey): void
    {
        $this->signKey = $signKey;
    }

    public function getSignee(): string
    {
        return $this->signee;
    }

    public function setSignee(string $signee): void
    {
        $this->signee = $signee;
    }

    public function getSigneePosition(): string
    {
        return $this->signeePosition;
    }

    public function setSigneePosition(string $signeePosition): void
    {
        $this->signeePosition = $signeePosition;
    }

    public function getSignDate(): \DateTime
    {
        return $this->signDate;
    }

    public function setSignDate(\DateTime $signDate): void
    {
        $this->signDate = $signDate;
    }

    public function getSourceUrl(): ?string
    {
        return $this->sourceUrl;
    }

    public function setSourceUrl(?string $sourceUrl): void
    {
        $this->sourceUrl = $sourceUrl;
    }

    public function getFolder(): ?string
    {
        return $this->folder;
    }

    public function setFolder(?string $folder): void
    {
        $this->folder = $folder;
    }
}
