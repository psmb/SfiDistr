# Yeebase.Graylog

The Yeebase.Graylog Flow package logs your exceptions as well as single messages to a central Graylog server. This
package also provides a simple backend to log message of Flows Logger classes to a Graylog server.

It depends on the official GELF php package https://github.com/bzikarsky/gelf-php

## Installation & configuration

Just add "yeebase/graylog" as dependency to your composer.json and run a "composer update" in your project's root folder
or simply execute:
```
composer require yeebase/graylog
```
from your project's root.

Configure your Graylog Server:
```yaml
Yeebase:
  Graylog:
    host: '127.0.0.1'
    port: 12201
    chunksize: 'wan'
```

### Logging backend

To configure GraylogBackend as the default logging backend, put this in your Settings.yaml:

```
Neos:
  Flow:
    log:
      systemLogger:
        backend: Yeebase\Graylog\Log\Backend\GraylogBackend
      securityLogger:
        backend: Yeebase\Graylog\Log\Backend\GraylogBackend
      sqlLogger:
        backend: Yeebase\Graylog\Log\Backend\GraylogBackend
      i18nLogger:
        backend: Yeebase\Graylog\Log\Backend\GraylogBackend
```

### Log exceptions


Activate the exception handler and configure the connection to your graylog server in your Settings.yaml:

```yaml
Neos:
  Flow:
    error:
      exceptionHandler:
        className: 'Yeebase\Graylog\Error\GraylogExceptionHandler'
```
Now all Exceptions that are shown to the Web or CLI are logged to graylog.

*Note:* For `Development` context, the `Neos.Flow` package overrides this setting. Make sure to add this configuration
in the right context Settings.yaml.

If you want to log additionally *all* Exceptions to graylog you should replace the systemLogger as well. This will
log all errors that are logged with the SystemLogger to Graylog as well to the disk. By default Flow will only log
a single line to the system log aka "See also ... .txt". The GraylogLogger will also log the full Exception.

```yaml
Neos:
  Flow:
    log:
      systemLogger:
        logger: Yeebase\Graylog\Log\GraylogLogger
```


#### Filter exceptions

To skip certain exceptions from being logged you can either use the `skipStatusCodes` setting:

```yaml
Yeebase:
  Graylog:
     # don't log any exceptions that would result in a HTTP status 403 (access denied) / 404 (not found)
    skipStatusCodes: [403, 404]
```

Since version 2.1 you can alternatively use the `renderingGroups` Flow setting, i.e. to exclude certain Exception
*classes* from being logged:

```yaml
Neos:
  Flow:
    error:
      exceptionHandler:
        className: 'Yeebase\Graylog\Error\GraylogExceptionHandler'
        renderingGroups:
          'accessDeniedExceptions':
            matchingExceptionClassNames: ['Neos\Flow\Security\Exception\AccessDeniedException']
            options:
              logException: false
```

### Manual logging


If you wish to log normal log messages to your Graylog server just use the provided `GraylogLoggerInterface`:

```php
use Neos\Flow\Annotations as Flow;
use Yeebase\Graylog\Log\GraylogLoggerInterface;

class SomeClass
{
    /**
     * @Flow\Inject
     * @var GraylogLoggerInterface
     */
    protected $graylogLogger;

    public function yourMethod()
    {
      $this->graylogLogger->log('Your Message')
    }
}

```

By default messages will also be logged to the `SystemLoggerInterface` when Flow runs in `Development` context. You
can enable or disable this function with a setting:

```yaml
Yeebase:
  Graylog:
    Logger:
      backendOptions:
        alsoLogWithSystemLogger: true
```


### Extend the message context
By default this package will send a bunch of values to graylog you can use to filter on. A Exception for instance has
some fields like `reference_code`, `response_status_code` and so on.
You can extend those values via Settings.yaml. Just pass an array of values to `Yeebase.Graylog.messageContext`.
This is useful to pass some static values to your logs to filter on in Graylog.

```yaml
Yeebase:
  Graylog:
    messageContext:
      app_context: 'stage'
```
