<?php
namespace Sfi\Sber\Controller;

use Neos\Flow\Annotations as Flow;
use Neos\Flow\Mvc\Controller\ActionController;

class PaymentController extends ActionController
{
    /**
     * @Flow\InjectConfiguration(path="options")
     * @var array
     */
    protected $options;

    /**
     * @param int $amount
     * @param string $email
     * @param string $name
     * @param string $agreeOffer
     * @param string $agreeRf
     * @return void
     */
    public function registerAction($amount = null, $email = null, $name = '', $agreeOffer = null, $agreeRf = null)
    {
        if (!isset($this->options['userName'])) {
            $this->addFlashMessage('userName not set');
        } else if (!isset($this->options['password'])) {
            $this->addFlashMessage('password not set');
        } else if ($amount === null) {
            $this->addFlashMessage('Вы не указали сумму пожертвования');
        } else if ($email === null) {
            $this->addFlashMessage('Вы не указали ваш Email');
        } else if ($agreeOffer === null) {
            $this->addFlashMessage('Вы не согласились с договором-оффертой');
        } else if ($agreeRf === null) {
            $this->addFlashMessage('Вы не подтвердили, что являетесь гражданином Российской Федерации');
        } else {
            $endpointUrl = $this->options['endpointUrl'];
            $params = [
                'userName' => $this->options['userName'],
                'password' => $this->options['password'],
                'returnUrl' => $this->options['returnUrl'],
                'orderNumber' => \uniqid(),
                'amount' => $amount,
                'jsonParams' => json_encode(['name' => $name, 'email' => $email])
            ];
            $requestUrl = $endpointUrl . "?" . http_build_query($params);

            $response = file_get_contents($requestUrl);
            $json = json_decode($response);
            $redirect = $json->formUrl;
            header("Location: $redirect");
        }
    }
}
