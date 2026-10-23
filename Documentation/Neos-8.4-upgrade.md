# Neos 8.4 upgrade

This distribution upgrades Neos 4.3 / Flow 5.3 to Neos **8.4.7**, Flow **8.4.4**, and Neos UI **8.4.4**, using PHP **8.3**. The Composer constraints stay on 8.4. The classic, database-backed content repository remains in use; no event-sourced repository packages, content export/import, or Neos 9 preparation migrations are involved.

## Changes included

- Split Neos/Flow Composer packages replace the old development collections. Existing in-repository packages have explicit root autoload mappings, while maintained compatibility packages install from `DistributionPackages/`.
- Third-party dependencies have compatible versions. The newsletter, term replacement, Mustache templates, grid, styleguide, Graylog integration, footnotes, quick creation, bookmarklet and history have local compatibility ports with upstream origins recorded in `DistributionPackages/README.md`.
- HTTP request creation uses PSR-7 requests and Flow action responses. Logging uses PSR-3, and custom Doctrine access uses the current entity-manager interface.
- Project-owned prototype generators preserve the existing Fluid templates and automatic node-property bindings removed from core. Rewriting these templates in Fusion is not a prerequisite for this upgrade.
- Fusion uses `Join`, `DataStructure`, `Loop`, and `Map`, including the `items` property and inherited collection overrides. The stock node-type names have been updated.
- The built-in Redis backend replaces the old optimized Redis extension.
- Itemprop/signature and footnote editor plugins are rebuilt with the Neos UI 8.4.4 Webpack adapter. Their generated CSS is registered separately.
- S3 configuration explicitly supplies the region required by AWS SDK 3 and uses the current VK Cloud public asset URL.
- The image uses PHP 8.3, current Alpine packages, Nginx and Supervisor. It retains UID/GID 80, `/data/www-provisioned`, `/data/www`, environment-based credentials, existing project redirect rules, optional SSH public-key access and optional database backups. Startup publishes static assets; database migrations remain explicit.

## Deployment

Complete the required checks in the [validation and go-live plan](Neos-8.4-go-live.md) before production cutover. Public-page parity and representative local editor/custom-feature checks have passed; see the [editor QA report](Neos-8.4-editor-qa.md) for coverage and remaining staging gates. `/umo` and `/docs` file validation is currently deferred by request.

Rehearse these steps against a fresh production database copy and the actual asset store before scheduling the production cutover. The local test snapshot is not a substitute for a current production rehearsal.

1. Stop editorial changes and newsletter workers. Back up the database, persistent resources, local configuration and the current image tag/digest. Keep the old deployment available for rollback.
2. Build the new image from this branch, or install the locked dependencies under PHP 8.3 with `composer install --no-dev --prefer-dist --optimize-autoloader`. Do not run `composer update` during deployment. Keep `DistributionPackages/` in the release: Composer links those packages locally.
3. Provide the existing database, S3, SMTP and other integration environment variables. Copy the current deployment's effective Flow signing key, byte for byte, to `Data/Persistent/EncryptionKey` before starting the new application. Keep `Data` on a persistent volume and make the key readable only by the web user. Flow reads this standard file directly; verify that it survives container replacement and validates previously issued tokens. The key may come from configuration, the legacy `Data/Persistent/EncryptionKey` file or the persistent HashService cache, and is not included in the SQL dump. The database volume and credentials do not change. This upgrade does not change the MariaDB or Redis server versions.
4. With the new code and the site still in maintenance, run inside the container as the web user in the production context:

   ```sh
   FLOW_CONTEXT=Production ./flow flow:cache:flush --force
   FLOW_CONTEXT=Production ./flow doctrine:migrate
   FLOW_CONTEXT=Production ./flow node:migrate 20190304111200
   FLOW_CONTEXT=Production ./flow flow:session:destroyall
   FLOW_CONTEXT=Production ./flow resource:publish --collection static
   FLOW_CONTEXT=Production ./flow flow:cache:warmup
   ./cron-hourly
   ```

   Run these commands and the hourly script from `/data/www`. The node migration renames the extracted stock node types. Check `node:migrationstatus` first and run it only if not already applied. Code migrations are already represented in this branch; do not rerun them against the deployed files.
5. Check the homepage, education/program listings, news/article pages, English pages, journal, fundraising, backend login, inline editing, custom editors and newsletter preview. Confirm S3 reads/uploads, SMTP and payment integrations using staging credentials before reopening production editing. Do not trigger real broadcasts or payments for a smoke test.
6. Re-enable traffic, editing and workers after those checks. If rollback is needed, restore the database backup together with the old image and its resources/configuration. Do not run the old application against the upgraded schema.

Do not run `node:repair`, resource cleanup or thumbnail deletion as an automatic upgrade step. They can remove content or assets and need separate assessment.

## Container operations

Use `docker exec --user 80 <container> ./flow ...` for application commands; the image works in `/data/www-provisioned`. `DB_DATABASE`, `DB_HOST`, `DB_USER`, `DB_PASS`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `SFI_PM_USER`, `SFI_PM_PASSWORD`, `SFI_API_AUTH`, `GA_SECRET` and `GA_DEVKEY` retain their roles. Use normal container environment variables for integration credentials and Flow's standard persistent storage for the signing key. CLI commands need no wrapper or secret-loading step. When serving behind Traefik, set `FLOW_HTTP_TRUSTED_PROXIES` to its address or Docker network CIDR so Flow trusts forwarded HTTPS/host/client headers.

`IMPORT_GITHUB_PUB_KEYS` still accepts comma-separated GitHub usernames for SSH access. `DB_AUTO_BACKUP` accepts `hourly`, `daily`, `weekly` or `monthly`; `/data/backupDb.sh` remains available for manual use. No database is imported automatically at startup. Preserve the existing mounts for documents and `Web/umo`, and any deployment-specific cron configuration.

For the development Compose file, install Composer dependencies into the mounted checkout and supply local `Configuration/Settings.yaml` before starting the web service. An example using the Compose database is in `Build/Docker/Settings.yaml`. Local development settings must point to test resources and a mail sink.

The container schedules `cron-hourly` and `cron-minutely` as the web user. The minute job remains inactive unless its commented newsletter command is explicitly enabled. The hourly job refreshes `/sveden/education.html` using an atomic file replacement and keeps the previous page if rendering fails. Before the first successful refresh, that URL temporarily redirects to its dynamic source, `/about/sveden/education.html`.

## Verification and maintenance

Run `composer install`, then `composer test`. Tests use SQLite in the Testing context, file caches and a null mail transport; they do not use the application database. The test runner provides the memory needed for framework compilation. The installed Party package's own tests are excluded from reflection because they target newer PHPUnit attributes; this distribution's tests use PHPUnit 9 with Flow 8.4.

The checked-in editor bundles can be reproduced in each directory with `npm ci` followed by `NODE_ENV=production NODE_OPTIONS=--openssl-legacy-provider npm run build`:

- `Packages/Sites/Sfi.Sfi/Resources/Private/Itemprop`
- `DistributionPackages/Psmb.Footnote/Resources/Private/Footnotes`
- `DistributionPackages/Psmb.Newsletter/Resources/Private/NewsletterView`
- `DistributionPackages/Psmb.CreateNodeButton/Resources/Private/CreateNodeView`
- `DistributionPackages/Psmb.Bookmarklet/Resources/Private/Bookmarklet`
- `DistributionPackages/AE.History/Resources/Private/JavaScript/NodeInfoView`

Run `bash Build/Tests/editor-extensions.sh` to rebuild all six bundles and run the newsletter JavaScript regressions. Use npm and the package lock files. The legacy Webpack adapter still requires the OpenSSL compatibility option on current Node.js. Browser console warnings about the deprecated Plow.js API remain in older UI extensions; they do not prevent the tested editor from loading.

Local checks completed during the upgrade:

- Composer platform validation, dependency installation and PHP syntax checks.
- Fifteen PHP tests and three JavaScript tests covering compatibility, recipient filters, dry-run and failure side effects, signing-key behavior and restricted editor links.
- The initial rehearsal applied eight pending database migrations and the stock node-type migration on a separate database copy, with **52,050 content-node records before and after** and no pending schema migrations. The subsequent fresh-dump rehearsal preserved all **59,898 live records**; its full counts are recorded in the disclosure QA report below.
- Representative Russian/English pages, education listing, journal and fundraising page rendering.
- Backend login, document tree and inline editor loading, including an article containing footnotes.
- Newsletter generation for one synthetic subscriber in dry-run mode; no email sent.
- PHP 8.3 container build, startup and HTTP rendering in Development and a Production subcontext, including initial page rendering with Redis 3.2. The later server publishing test exposed an incompatibility: Neos 8.4 cache invalidation uses `UNLINK`. The upgraded deployment requires Redis 4 or later and now pins tested Redis 7.4.11; Redis 3.2 is unsuitable.

The local asset snapshot is incomplete. Full media validation and real SMTP, payment, PDF-signing, external subscriber-source and Google Analytics integrations require the staging environment and its credentials. Production has not been changed.

The [editor and release QA report](Neos-8.4-editor-qa.md) records the subsequent editorial, fixture-integration and release-image checks.

The [fresh production-dump disclosure QA report](Neos-8.4-sveden-qa.md) records the subsequent rehearsal of all disclosure sections, including browser-level microdata, tables, signatures and the cached education route.

## References

- [Neos upgrade instructions](https://docs.neos.io/api/upgrade-instructions)
- [Neos 8.2 editor-plugin rebuild requirement](https://docs.neos.io/api/upgrade-instructions/8/upgrade-instructions-8-1-8-2)
- [Neos 8.3 build adapter change](https://docs.neos.io/api/upgrade-instructions/8/upgrade-instructions-8-2-8-3)
- [Neos 8.4 upgrade instructions](https://docs.neos.io/api/upgrade-instructions/8/upgrade-instructions-8-3-8-4)
