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
     * @return void
     */
    public function registerAction($amount, $email, $name = '')
    {
        $endpointUrl = $this->options['endpointUrl'];
        $params = [
            'userName' => $this->options['userName'],
            'password' => $this->options['password'],
            'returnUrl' => $this->options['returnUrl'],
            'orderNumber' => \uniqid(),
            'amount' => $amount,
            'jsonParams' => json_encode(['name' => $name, 'email' => $email])
        ];
        $request = $endpointUrl . "?" . http_build_query($params);

        try {
            $response = file_get_contents($request);
            $json = json_decode($response);
            $redirect = $json->formUrl;
            header("Location: $redirect");
        } catch (Exception $e) {
            $this->view->assign('error', 'Извините, что-то пошло не так! Попробуйте повторить ваш платеж.');
        }
    }
}
