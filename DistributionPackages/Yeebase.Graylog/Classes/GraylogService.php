<?php
namespace Yeebase\Graylog;

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
use Gelf\Publisher;
use Gelf\Logger;
use Gelf\Transport\UdpTransport;
use Neos\Flow\Core\Bootstrap;
use Neos\Flow\Exception as FlowException;
use Neos\Flow\Http\HttpRequestHandlerInterface;
use GuzzleHttp\Psr7\Response;
use Neos\Flow\Http\ServerRequestAttributes;
use Neos\Flow\Http\Helper\RequestInformationHelper;
use Neos\Flow\ObjectManagement\ObjectManagerInterface;
use Neos\Flow\Persistence\PersistenceManagerInterface;
use Neos\Flow\Security\Context;
use Neos\Party\Domain\Model\Person;
use Neos\Party\Domain\Service\PartyService;

/**
 * Service that can be used to report exceptions to a Graylog server using the official gelf-php library
 *
 * @Flow\Scope("singleton")
 */
class GraylogService
{

    /**
     * @Flow\Inject
     * @var Context
     */
    protected $securityContext;

    /**
     * @Flow\Inject
     * @var ObjectManagerInterface
     */
    protected $objectManager;

    /**
     * @Flow\Inject
     * @var PersistenceManagerInterface
     */
    protected $persistenceManager;

    /**
     * @var array
     */
    protected $settings;

    /**
     * @param array $settings
     * @return void
     */
    public function injectSettings(array $settings)
    {
        $this->settings = $settings;
    }

    /**
     * @param \Exception||\Throwable $exception
     * @return void
     */
    public function logException($exception)
    {
        $statusCode = 500;
        if ($exception instanceof FlowException) {
            $statusCode = $exception->getStatusCode();
        }

        // skip exceptions with status codes matching "skipStatusCodes" setting
        if (isset($this->settings['skipStatusCodes']) && in_array($statusCode, $this->settings['skipStatusCodes'])) {
            return;
        }

        // set logLevel depending on http status code
        $logLevel = 4; // warning
        if ($statusCode === 500) {
            $logLevel = 3; // error
        }

        // build message context
        $messageContext = array(
            'exception' => $exception,
            'reference_code' => $exception instanceof FlowException ? $exception->getReferenceCode() : null,
            'response_status_code' => $statusCode,
            'response_status_message' => sprintf('%d %s', $statusCode, (new Response($statusCode))->getReasonPhrase()),
            'code' => $exception->getCode(),
            'file' => $exception->getFile(),
            'line' => $exception->getLine()
        );

        if ($this->securityContext !== null && $this->securityContext->isInitialized()) {
            $account = $this->securityContext->getAccount();
            if ($account !== null) {
                $messageContext['authenticated_account'] = $account->getAccountIdentifier() . ' (' . $this->persistenceManager->getIdentifierByObject($account) . ')';
                $messageContext['authenticated_roles'] = implode(', ', array_keys($this->securityContext->getRoles()));
                if ($this->objectManager->isRegistered(PartyService::class)) {
                    /** @var PartyService $partyService */
                    $partyService = $this->objectManager->get(PartyService::class);
                    $person = $partyService->getAssignedPartyOfAccount($account);
                    if ($person instanceof Person) {
                        $messageContext['authenticated_person'] = (string)$person->getName() . ' (' . $this->persistenceManager->getIdentifierByObject($person) . ')';
                    }
                }
            }
        }

        // prepare request details
        if (Bootstrap::$staticObjectManager instanceof ObjectManagerInterface) {
            $bootstrap = Bootstrap::$staticObjectManager->get(Bootstrap::class);
            /* @var Bootstrap $bootstrap */
            $requestHandler = $bootstrap->getActiveRequestHandler();
            if ($requestHandler instanceof HttpRequestHandlerInterface) {
                $request = $requestHandler->getHttpRequest();
                $requestData = array(
                    'request_domain' => $request->getHeaderLine('Host'),
                    'request_remote_addr' => $request->getAttribute(ServerRequestAttributes::CLIENT_IP),
                    'request_path' => RequestInformationHelper::getRelativeRequestPath($request),
                    'request_uri' => $request->getUri()->getPath(),
                    'request_user_agent' => $request->getHeaderLine('User-Agent'),
                    'request_method' => $request->getMethod(),
                    'request_port' => $request->getUri()->getPort()
                );
                $messageContext = array_merge($messageContext, $requestData);
            }
        }

        $this->logMessageToGraylogServer($exception->getMessage(), $messageContext, $logLevel);
    }

    /**
     * @param $rawMessage
     * @param array $messageContext
     * @param int $logLevel
     */
    public function logMessage($rawMessage, array $messageContext, $logLevel = LOG_INFO)
    {
        $this->logMessageToGraylogServer($rawMessage, $messageContext, $logLevel);
    }

    protected function logMessageToGraylogServer($rawMessage, $messageContext, $logLevel = LOG_INFO)
    {
        if (!isset($this->settings['host']) || strlen($this->settings['host']) === 0) {
            return;
        }

        // Extend the message context with configured values from Settings.yaml
        if (array_key_exists('messageContext', $this->settings)) {
            $additionalMessageContext = $this->settings['messageContext'];
            $messageContext = array_merge($messageContext, $additionalMessageContext);
        }

        $host = $this->settings['host'];
        $port = isset($this->settings['port']) ? $this->settings['port'] : UdpTransport::DEFAULT_PORT;

        // set chunk size option to wan (default) or lan
        if (isset($this->settings['chunksize']) && strtolower($this->settings['chunksize']) === 'lan') {
            $chunkSize = UdpTransport::CHUNK_SIZE_LAN;
        } else {
            $chunkSize = UdpTransport::CHUNK_SIZE_WAN;
        }

        // setup connection to graylog server
        $transport = new UdpTransport($host, $port, $chunkSize);
        $publisher = new Publisher();
        $publisher->addTransport($transport);

        // send message to graylog server
        $logger = new Logger($publisher);
        $logger->log($logLevel, $rawMessage, $messageContext);
    }
}
