<?php
namespace Sfi\Sfi\Service;

use Neos\Flow\Annotations as Flow;

class EventStoreApi {
    /**
     * @Flow\InjectConfiguration(package="Sfi.Sfi", path="apiAuth")
     * @var string
     */
    protected $apiAuth;

    public function getPending($type) {
        return json_decode($this->callAPI('GET', 'http://paymentssfi-node-1/projection/' . $type, null, true), true) ?? [];
    }

    public function registerEmailSent($reason, $type, $email)
    {
        $data = [
            'reason' => $reason,
            'type' => $type,
            'email' => $email
        ];
        return $this->callAPI('POST', 'http://paymentssfi-node-1/publish-event/EmailSent', $data, true);
    }

    public function registerUnsubscribe($email)
    {
        $data = [
            'email' => $email
        ];
        return $this->callAPI('POST', 'http://paymentssfi-node-1/publish-event/SubscriberUnsubscribed', $data, true);
    }

    protected function callAPI($method, $url, $data = false, $auth = false)
    {
        $curl = curl_init();

        switch ($method)
        {
            case "POST":
                curl_setopt($curl, CURLOPT_CUSTOMREQUEST, "POST");
                if ($data) {
                    $dataString = json_encode($data);
                    curl_setopt($curl, CURLOPT_POSTFIELDS, $dataString);
                    curl_setopt($curl, CURLOPT_HTTPHEADER, array(
                        'Content-Length: ' . strlen($dataString))
                    );
                }
                break;
            case "PUT":
                curl_setopt($curl, CURLOPT_PUT, 1);
                break;
            default:
                if ($data) {
                    $url = sprintf("%s?%s", $url, http_build_query($data));
                }
        }

        curl_setopt($curl, CURLOPT_URL, $url);
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
        if ($auth) {
            curl_setopt($curl, CURLOPT_HTTPAUTH, CURLAUTH_BASIC);
            curl_setopt($curl, CURLOPT_USERPWD, $this->apiAuth);
        }

        $result = curl_exec($curl);

        if ($result === false) {
            throw new \Exception("CURL Error: " . curl_error($curl));
        }

        $responseCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
        if ($responseCode >= 400) {
            throw new \Exception("HTTP Error: " . $responseCode . " Body: " . $result);
        }

        curl_close($curl);

        return $result;
    }
}
