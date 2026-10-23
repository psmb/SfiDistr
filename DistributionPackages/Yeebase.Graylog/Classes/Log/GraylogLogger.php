<?php
namespace Yeebase\Graylog\Log;

/**
 * This file is part of the Yeebase.Readiness package.
 *
 * (c) 2018 yeebase media GmbH
 *
 * This package is Open Source Software. For the full copyright and license
 * information, please view the LICENSE file which was distributed with this
 * source code.
 */

use Neos\Flow\Annotations as Flow;
use Neos\Flow\Log\Psr\Logger;
use Neos\Flow\ObjectManagement\DependencyInjection\DependencyProxy;
use Yeebase\Graylog\GraylogService;
use Yeebase\Graylog\Log\Backend\GraylogBackend;

class GraylogLogger extends Logger implements GraylogLoggerInterface
{
    /**
     * @Flow\Inject
     * @var GraylogService
     */
    protected $graylogService;

    public function __construct(GraylogBackend $backend)
    {
        parent::__construct([$backend]);
    }

    /**
     * Writes information about the given exception to Graylog including the stacktrace.
     *
     * @param object $error \Exception or \Throwable
     * @param array $additionalData Additional data to log
     * @return void
     */
    public function logError($error, array $additionalData = [])
    {
        $this->getGraylogService()->logException($error);

        $this->error($error->getMessage(), ['exception' => $error] + $additionalData);
    }

    /**
     * Returns an instance of the injected GraylogService (including a fallback to a manually instantiated instance
     * if Dependency Injection is not (yet) available)
     *
     * @return GraylogService
     */
    private function getGraylogService()
    {
        if ($this->graylogService instanceof GraylogService) {
            return $this->graylogService;
        } elseif ($this->graylogService instanceof DependencyProxy) {
            return $this->graylogService->_activateDependency();
        } else {
            return new GraylogService();
        }
    }
}
