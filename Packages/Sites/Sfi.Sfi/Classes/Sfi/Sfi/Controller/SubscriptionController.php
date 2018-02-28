<?php
namespace Sfi\Sfi\Controller;

use Neos\Error\Messages\Message;
use Neos\Flow\I18n\Service as I18nService;
use Neos\Flow\I18n\Translator;
use Neos\Flow\Mvc\Controller\ActionController;
use Neos\Flow\Annotations as Flow;
use Neos\Flow\Utility\Algorithms;
use Neos\Flow\Validation\Validator\EmailAddressValidator;

class SubscriptionController extends ActionController
{

    /**
     * @Flow\Inject
     * @var Translator
     */
    protected $translator;

    /**
     * @Flow\Inject
     * @var \Sfi\Sfi\Service\EventStoreApi
     */
    protected $eventStoreApi;

    /**
     * Render a confirmation form
     *
     * @param string $hash
     * @param string $email
     * @return void
     */
    public function unsubscribeAction($hash, $email)
    {
        $this->view->assign('hash', $hash);
        $this->view->assign('email', $email);
    }

    /**
     * Unsubscribes
     *
     * @param string $hash
     * @param string $email
     */
    public function unsubscribeConfirmAction($hash, $email)
    {
        if (md5($email . "asdf") === $hash) {
            $this->eventStoreApi->registerUnsubscribe($email);
            $this->addFlashMessage('Sad to see you leave...');
        } else {
            $this->addFlashMessage('Error! Wrong md5!');
        }
        $this->redirect('feedback');
    }

    /**
     * Just render flash messages
     */
    public function feedbackAction()
    {
    }

}
