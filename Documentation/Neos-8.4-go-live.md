# Neos 8.4 validation and go-live plan

Status: planning and source inventory, 21 September 2026. Implementation of the remaining checks is pending. The upgrade remains on Neos 8.4 with the classic content repository. `/umo` and `/docs` file validation is deferred by request and is not a gate for this plan. Existing mounts should remain unchanged.

## Recommendation

Validate an editor's complete save/reload/publish workflow next. The public-site rehearsal proves that existing content renders correctly; it does not prove that editing and saving preserves that content. Prioritize property editors, rich text, itemprop/signature metadata, footnotes and publication before extending public-page sampling.

Use one isolated acceptance environment built from the release image, a disposable database restored from the fresh dump, separate Redis, a writable test resource store, a local mail capture service and simulated external services. Preserve the current read-only comparison database as the reference. Test normal Editor and Fundraiser accounts as well as Administrator. Restore the acceptance database between destructive scenarios; do not repair or clean up production-derived data as part of setup.

## What is already proven

- Fresh dump restoration, eight Doctrine migrations, stock node-type migration and preservation of every live content-node record.
- All 15 disclosure sections: browser-level itemprop values/nesting, tables, document URLs, signature metadata and generated signed links match production.
- Representative Russian/English public pages render; backend login, tree and inline editor have loaded successfully.
- Itemprop/signature and footnote bundles rebuilt for Neos UI 8.4. Actual editing round trips remain unverified.
- Six focused compatibility tests; newsletter HTML generation using a synthetic local subscriber and null mail transport.
- Image build/startup, Redis, Nginx, hourly education refresh, cache-miss fallback and retention of the previous cached page after network/HTTP failures.

See [the disclosure QA report](Neos-8.4-sveden-qa.md) for evidence. None of these checks is a substitute for the pending editor acceptance flows below.

## Findings that affect the next work

1. **Four loaded UI extensions still use old build dependencies.** Effective Neos UI configuration loads NewsletterView, CreateNodeView, Bookmarklet and AE.History's NodeInfoView alongside the two rebuilt rich-text extensions. Their source build dependencies are respectively `1.0.0-beta8`, `@dev`, `^1.3` and `~1.3.0` of the old extensibility package. This is a compatibility risk, not proof that each current bundle is broken. Rebuild against the locked 8.4 adapter and exercise each feature. Keep any package changes in maintained local packages or upstream releases, not untracked edits to Composer-installed files.
2. **The fundraising mailer's dry run has an external write.** `MailerCommandController::sendStuffCommand()` calls `registerEmailSent()` before checking `$dryRun`. A null mail transport does not prevent that write. Make dry run free of external writes and verify it with a fake event API before exercising the command. The earlier successful newsletter test used the separate newsletter generation path; it did not validate this command.
3. **Newsletter recipient filters need specific tests.** NewsletterView's send/test calls do not forward configured additional arguments, and its optional-argument serialization references an undefined `pair` variable. Test `startDate`/`endDate`, selected donor groups and preview/send agreement; fix the paths actually used. Do not infer the runtime result solely from the old source bundle.
4. **Signing-key persistence is a release prerequisite.** The new Docker/Compose setup does not explicitly carry forward Flow's effective signing key. Recover it securely from the current deployment's configuration, legacy `Data/Persistent/EncryptionKey`, or persistent HashService cache, according to which is active. Supply that same key to the new deployment before it serves requests and persist it across container replacement. Verify an old token against the new runtime and again after a restart. The custom fundraising unsubscribe endpoint uses this key; a database-only restore does not preserve it.
5. **Release CI currently only builds/publishes on pushes to `master`.** Add a pull-request check for the compatibility suite and image build, publish an immutable candidate tag/digest for staging, and establish whether anything automatically deploys the mutable `master` tag before merging. Do not use merge/push as an accidental production cutover.
6. **PropsEditor needs identification if it is a separate application.** No package, UI registration or route by that name was found in this distribution or its lock file. Standard Neos property-inspector testing is included below. If a separate PropsEditor is intended, add its repository/URL and its read/write API contract before approving that workflow; do not assume it is covered by the inspector check.

Neos documents the need to rebuild older UI extensions in its [8.2–8.3 upgrade instructions](https://docs.neos.io/api/upgrade-instructions/8/upgrade-instructions-8-2-8-3).

## Acceptance matrix

“Required” means before reopening that capability in production. Features marked optional can be postponed only through an explicit decision to leave them unavailable; an untested feature is not a pass.

| Capability and implementation | Concrete acceptance flow | Release gate / current state |
|---|---|---|
| Property inspector and custom node properties | Edit strings, long text, dates, booleans, selects, node references and asset fields on a news article, study program, person, journal entry and fundraising page. Apply, navigate away, reload, publish and reload in a separate visitor session. Clearing fields must persist too. Verify sibling properties did not change. | Required; save/publish not yet tested. |
| Itemprop and tables (`Sfi.Sfi:Itemprop`) | On a disposable copy of real disclosure content, first focus and save without changing text. Then add/change/remove itemprop on supported elements; edit table text and merged cells; undo/redo; reload and publish. Compare stored HTML and final DOM with the expected attributes, nesting and cell spans. | Required; frontend parity and bundle build passed, round trip pending. |
| Signature editor and API (`LinkSignaturePlugin`, `SignatureRegistryController`) | Set signatory, position and date on a test asset link; save/reopen/edit/remove signature. Verify the corresponding registry data and final signed-link payload. Test authorized editor access and rejection of anonymous writes. | Required for metadata editing; registry reads passed. Physical `/umo` and `/docs` files remain deferred. |
| Footnotes (`Psmb.Footnote`) | Create two footnotes, edit one, reorder surrounding paragraphs, remove one, undo and publish. Check numbering, return anchors, Unicode and persistence after editor reload. | Required; existing footnotes load, editing pending. |
| Quick creation and templates (`Psmb.CreateNodeButton`, `Flowpack.NodeTemplates`) | Create a news article and announcement from the custom controls. Verify correct parent, node type, language, workspace, generated children and references. Publish/discard and test keyboard submission. | Required; old UI build needs verification. |
| Publication, history and permissions (`Sfi.Sfi:Package`, `AE.History`, custom policies) | Draft changes stay private; publish updates the visitor page immediately; discard restores it. Verify first publication sets `firstPublicationDateTime` once and later edits preserve it. Move/rename/hide/unhide/delete a disposable page. Check history records/diffs and Editor/Fundraiser restrictions. | Publication and permissions required. History display may be deferred only if explicitly disabled. |
| Russian/English content and `Ttree.DimensionKeeper` | Edit a Russian/English pair; verify which properties are configured to synchronize and which remain independent. Check language switching, fallbacks, localized URLs, copy/move and publish in each language. | Required where configured; public language rendering alone passed. |
| Media/S3 and custom crop aspect | Upload a new synthetic image to an isolated S3 prefix or test bucket; crop, recrop, generate thumbnails and replace an asset. Check responsive variants, alt/title and public URL; restart the container and verify persistence. | Required for editorial go-live; real S3 writes and crop processing pending. |
| Newsletter inspector/module (`Psmb.Newsletter`) | Open on RU/EN articles and newsletters, select the correct subscription, preview recipients, test date/group filters, capture test mail, then capture a send to synthetic subscribers. Check subject/body/images/links and failure feedback. Validate subscribe/confirm/preferences/unsubscribe and CSV import/export with fixture recipients. | Required before newsletter controls are reopened. No real recipients or external subscriber data for local tests. |
| Fundraising mailer, unsubscribe and external event API | Use a controlled API fixture to check pending-message selection, missing/invalid data, dry-run zero writes, one send event for a completed fixture flow and understandable failure behavior. Verify old/new unsubscribe tokens, a valid unsubscribe and rejection of an invalid token. | Required before the fundraising mailer is enabled. Dry-run write needs fixing. Existing send-before-delivery ordering also needs an explicit failure/retry check. |
| Donation form, CloudPayments and legacy `Sfi.Sber` | Check amount, email, consent validation, project selection and one-off/monthly payloads with an intercepted payment widget. Check success/cancel/failure UI; use provider sandbox for the final integration rehearsal. Determine whether `/sber/*` is still linked/in use before treating it as an active release gate. | Donation UI is required; no real charges. Legacy Sber is conditional on actual use. |
| Lists, layouts and legacy templates (`Sfi.News`, `Sfi.Shared`, `Sfi.Grid`, `Flowpack.Listable`, local prototype generators) | Create/move nested grid content and references. Exercise pagination, filters, tag/author listings, article dates, study-program tabs, news/search, journal and fundraising layouts on desktop/mobile. Repeat relevant cached views after publishing a change. | Required representative coverage; several rendering paths already passed, interactive/editing flows pending. |
| Terms, Mustache and Registry (`Psmb.Term`, `Flowpack.Mustache`, `Psmb.Registry`) | Edit a term and check replacement without corrupting links/itemprop. Render two different fixture subscribers sequentially and ensure no personalized value leaks between requests or cached renders. Exercise repeated authors in blog listings. | Required in the features that use them; newsletter generation has partial coverage. |
| Bookmarklet (`Psmb.Bookmarklet`) | Open a known public page in the editor through the bookmarklet; verify the selected document, language and personal workspace. | Optional convenience feature; old bundle pending. |
| History/styleguide/analytics (`AE.History`, `Sfi.Styleguide`, `Neos.GoogleAnalytics`) | Open each backend module and inspector view, inspect sample events/styleguide entries and confirm failure of an external analytics request does not break the editor. Establish whether the configured analytics reports are still used. | Optional modules may be deferred explicitly; history and analytics need real UI verification. |
| “Шахты” backend module (`Sfi.Umo`) | Check module loading and role access. | File-dependent import and PDF generation deferred with `/umo` and `/docs`. |
| Redirects, HTTPS, cache, logging and jobs | Test old URLs and renamed-page redirects; correct canonical/asset URLs behind the real TLS proxy; backend cookies/login/logout; Redis separation and invalidation; an observable application error; container restart; backup job and education refresh. | Required operational checks. Local Nginx/Redis/hourly checks passed; actual proxy and production logging remain. |

If PropsEditor is external, its additional flow must cover login/authorization, reading existing properties, saving each supported shape, clearing values, preserving unrelated properties, workspace/language selection, publishing visibility, cache invalidation and handling a rejected save without reporting success.

## Test method and evidence

1. Keep the existing comparison site read-only. Create a second acceptance database and resource store with disposable test accounts/content. Restore between scenarios that alter content structure or subscriber data.
2. Rebuild the four remaining legacy extension bundles against the locked UI version and retain reproducible builds for all six loaded extensions. Register any emitted CSS. Reuse the already rebuilt itemprop/footnote bundles unless fixes require rebuilding them. Fail early on missing assets or JavaScript exceptions, then test behavior rather than considering bundle loading a pass.
3. Use repeatable browser flows for editor interactions. For each important property/HTML edit, check the UI, persisted node value and published DOM after a fresh reload. A screenshot or successful HTTP response alone is insufficient.
4. Use fixture services for donor data, event writes and payment-widget calls, plus local mail capture. Do not connect the copied subscriber database to real delivery. Test mail addressed to a real mailbox requires a separately authorized recipient; none is needed for local acceptance.
5. Test storage uploads in an isolated writable S3 location, with no production resource deletion or cleanup. Read-only access to existing assets is not proof that upload/crop works.
6. Add focused regression tests for any discovered compatibility bugs, especially stripped markup, recipient filters, dry-run external writes, preserved signing keys and cache invalidation after publication. Retain browser traces and before/after data for failed scenarios.
7. Rerun the disclosure comparison after the editorial round trips and any template/plugin fixes. Record pass, fixed-and-retested, deferred or blocked for every matrix row.

## Sequence to release

### 1. Finish local acceptance

Resolve PropsEditor identity if separate. Address the known mailer/filter issues and test isolation, rebuild the remaining UI bundles, and run the required matrix. Start with inspector → itemprop/signatures → footnotes → quick-create → publish/discard, because these establish whether normal editorial work is safe.

### 2. Run a production-like staging rehearsal

Use the immutable candidate image, a fresh database copy, production-equivalent MariaDB/Redis versions, the real HTTPS/proxy arrangement and an isolated writable S3 location. Validate signing-key persistence securely, role permissions, scheduled jobs, logs and restarts. Use sandbox payment credentials and fixture/captured mail. Record restore/migration/cache-warmup durations to size the maintenance window; do not promise downtime before measuring it.

Ask an experienced editor to complete one realistic news/publication workflow and one disclosure-property change on staging. This complements the automated checks and confirms the new UI still supports the team's working process.

### 3. Establish release and rollback artifacts

- Keep the old production image by immutable digest, with its configuration, signing key and resource access recorded securely.
- Produce a tested candidate image by immutable digest; run checks before publishing/promoting it. Confirm whether the current `master` image is automatically consumed by deployment infrastructure.
- Rehearse restoring the pre-upgrade database and starting the old image on that restored copy. An image-only downgrade is not the rollback procedure.
- Preserve the existing production signing key, relevant persistent data and credentials. Do not transplant a generated development key.
- Decide explicitly which optional capabilities, if any, will remain disabled. All capabilities that stay enabled must have their applicable required checks passed.

### 4. Cut over with application writes paused

Pause editorial changes, CMS-side subscription writes and relevant send/import workers. Put dynamic traffic into maintenance before migrating the production database. Take and verify a final backup; retain the old image and configuration. Start the candidate, run the migration/cache/resource/session steps in [the upgrade runbook](Neos-8.4-upgrade.md), and generate the initial education cache.

Before reopening writes, check the homepage, disclosure pages, one RU/EN article, journal, donation form without charging, login/roles, old-token validation, asset delivery, redirect behavior and logs. Restore the pre-upgrade database and old image if this gate fails. Do not run old and new application versions against the migrated database simultaneously.

### 5. Reopen and observe

Reopen visitors and editors after the smoke checks; enable only the tested newsletter/integration capabilities. Watch errors, response times, login/publishing, background jobs, donor/subscriber events and media generation closely during the first editorial session and the next day. Arrange named release/rollback owners and a decision window when scheduling the cutover; no monitoring automation is established by this document.

Once production writes resume, a rollback must first preserve those new writes and plan reconciliation. Blindly restoring the pre-upgrade dump would lose new editorial or subscriber changes.

## Completion criteria

Go live when the required enabled workflows pass, no editor save strips markup or changes unrelated properties, external effects are correct in isolated tests, the production signing key survives container replacement, and a full database-plus-image rollback has been rehearsed. Passing public rendering alone is not sufficient.

Neos 8.4 is an appropriate intermediate release for keeping the classic repository. The [official release announcement](https://www.neos.io/blog/neos-and-flow-8-4-lts-release.html) states patch support through the end of 2026 and security fixes through the end of 2027; plan the later repository migration separately from this release.
