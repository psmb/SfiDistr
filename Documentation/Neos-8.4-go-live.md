# Neos 8.4 validation and go-live plan

Current server rollout: see [the 23 October staging report](Neos-8.4-staging-2026-10-23.md) and [server command plan](Neos-8.4-server-rollout.md). They supersede the earlier isolated-S3/payment-sandbox requirements below; storage and integrations remain shared as agreed. The upgraded stack uses Redis 7.4.11.

Status: local compatibility fixes and representative editor acceptance completed on 21 September 2026; production-like staging and rollback acceptance remain. The upgrade remains on Neos 8.4 with the classic content repository. `/umo` and `/docs` file validation is deferred by request and is not a gate for this plan. Existing mounts should remain unchanged.

## Recommendation

Move the candidate to production-like staging next. Local acceptance now covers representative save/reload/publish workflows, property editing, rich text, itemprop/signature metadata, footnotes and publication. Broaden those checks with an experienced editor and validate the real storage, proxy and integration arrangements before cutover.

Use one isolated acceptance environment built from the release image, a disposable database restored from the fresh dump, separate Redis, a writable test resource store, a local mail capture service and simulated external services. Preserve the current read-only comparison database as the reference. Test normal Editor and Fundraiser accounts as well as Administrator. Restore the acceptance database between destructive scenarios; do not repair or clean up production-derived data as part of setup.

## What is already proven

- Fresh dump restoration, eight Doctrine migrations, stock node-type migration and preservation of every live content-node record.
- All 15 disclosure sections: browser-level itemprop values/nesting, tables, document URLs, signature metadata and generated signed links match production.
- Representative Russian/English public pages render; backend login, tree and inline editor have loaded successfully.
- All six custom editor bundles rebuilt for Neos UI 8.4; representative itemprop/signature/footnote and disclosure editing round trips verified locally. CKEditor conversion preserved markup in 154 fields across all 15 disclosure pages.
- Fifteen PHP compatibility/regression tests and three JavaScript tests; newsletter HTML generation and a captured editor-triggered fixture message.
- Image build/startup, Redis, Nginx, hourly education refresh, cache-miss fallback and retention of the previous cached page after network/HTTP failures.

See [the disclosure QA report](Neos-8.4-sveden-qa.md) for evidence. None of these checks is a substitute for the pending editor acceptance flows below.

## Local acceptance update

See [the editor and release QA report](Neos-8.4-editor-qa.md) for the concrete results and limits. Four remaining editor extensions have been rebuilt; newsletter filters, fundraising dry-run side effects, History UI compatibility, bookmarklet navigation and restricted editor deep links have been fixed. Production signing-key configuration and checked release builds are now implemented.

A separate acceptance database was used for quick creation, inspector changes, disclosure save/publish, itemprop/footnote commands, signature API authorization, first-publication dates, image upload/crop, a captured newsletter, role checks and simulated payment/unsubscribe flows. The comparison database remains separate. Public-page parity alone is no longer the only evidence.

No separate PropsEditor package, route or application was found. Standard Neos inspector checks are included; an external PropsEditor needs its own URL/repository and acceptance flow.

The next release step is a production-like staging rehearsal, including the real production key, isolated writable S3, actual HTTPS proxy, captured SMTP, external data-source/provider sandboxes, editor sign-off and rollback. Do not merge until the operational effect of publishing the `master` image is known.

## Acceptance matrix

“Required” means before reopening that capability in production. Features marked optional can be postponed only through an explicit decision to leave them unavailable; an untested feature is not a pass.

| Capability and implementation | Concrete acceptance flow | Release gate / current state |
|---|---|---|
| Property inspector and custom node properties | Edit strings, long text, dates, booleans, selects, node references and asset fields on a news article, study program, person, journal entry and fundraising page. Apply, navigate away, reload, publish and reload in a separate visitor session. Clearing fields must persist too. Verify sibling properties did not change. | Representative news strings/boolean/clear/apply/reload/publish passed. Remaining property types and document families need editorial acceptance. |
| Itemprop and tables (`Sfi.Sfi:Itemprop`) | On a disposable copy of real disclosure content, first focus and save without changing text. Then add/change/remove itemprop on supported elements; edit table text and merged cells; undo/redo; reload and publish. Compare stored HTML and final DOM with the expected attributes, nesting and cell spans. | Common-page round trip and fixture itemprop/merged-cell persistence passed; see the report for table-normalization limits. |
| Signature editor and API (`LinkSignaturePlugin`, `SignatureRegistryController`) | Set signatory, position and date on a test asset link; save/reopen/edit/remove signature. Verify the corresponding registry data and final signed-link payload. Test authorized editor access and rejection of anonymous writes. | Registry read/write authorization and signed-link persistence passed. Full signature-dialog lifecycle remains in staging; physical `/umo` and `/docs` files remain deferred. |
| Footnotes (`Psmb.Footnote`) | Create two footnotes, edit one, reorder surrounding paragraphs, remove one, undo and publish. Check numbering, return anchors, Unicode and persistence after editor reload. | Two-footnote fixture, toolbar edit, command remove/undo, reload and published anchors passed. Paragraph reordering remains for editorial acceptance. |
| Quick creation and templates (`Psmb.CreateNodeButton`, `Flowpack.NodeTemplates`) | Create a news article and announcement from the custom controls. Verify correct parent, node type, language, workspace, generated children and references. Publish/discard and test keyboard submission. | Rebuilt control created a news article with the correct parent, workspace, language and seven template nodes. Other templates remain for editorial acceptance. |
| Publication, history and permissions (`Sfi.Sfi:Package`, `AE.History`, custom policies) | Draft changes stay private; publish updates the visitor page immediately; discard restores it. Verify first publication sets `firstPublicationDateTime` once and later edits preserve it. Move/rename/hide/unhide/delete a disposable page. Check history records/diffs and Editor/Fundraiser restrictions. | Publish visibility/cache and first-publication preservation passed. History details/filter/pagination fixed and tested; representative role checks passed. Move/hide/delete/discard remain in staging. |
| Russian/English content and `Ttree.DimensionKeeper` | Edit a Russian/English pair; verify which properties are configured to synchronize and which remain independent. Check language switching, fallbacks, localized URLs, copy/move and publish in each language. | Required where configured; public language rendering alone passed. |
| Media/S3 and custom crop aspect | Upload a new synthetic image to an isolated S3 prefix or test bucket; crop, recrop, generate thumbnails and replace an asset. Check responsive variants, alt/title and public URL; restart the container and verify persistence. | Local upload/crop/apply/publish passed. Real S3 writes and resource persistence across replacement remain staging gates. |
| Newsletter inspector/module (`Psmb.Newsletter`) | Open on RU/EN articles and newsletters, select the correct subscription, preview recipients, test date/group filters, capture test mail, then capture a send to synthetic subscribers. Check subject/body/images/links and failure feedback. Validate subscribe/confirm/preferences/unsubscribe and CSV import/export with fixture recipients. | Inspector Test action captured a real rendered fixture message; filter parity has controller/JavaScript regressions. Broadcast/data-source/lifecycle acceptance remains required. |
| Fundraising mailer, unsubscribe and external event API | Use a controlled API fixture to check pending-message selection, missing/invalid data, dry-run zero writes, one send event for a completed fixture flow and understandable failure behavior. Verify old/new unsubscribe tokens, a valid unsubscribe and rejection of an invalid token. | Dry-run fixed and tested for zero external writes; failure ordering is tested and documented. Synthetic legacy-token unsubscribe and replacement passed. Real data-source/reconciliation rehearsal remains required. |
| Donation form, CloudPayments and legacy `Sfi.Sber` | Check amount, email, consent validation, project selection and one-off/monthly payloads with an intercepted payment widget. Check success/cancel/failure UI; use provider sandbox for the final integration rehearsal. Determine whether `/sber/*` is still linked/in use before treating it as an active release gate. | Consent blocking and one-off/monthly payloads passed with a replaced widget. Provider sandbox remains required; legacy Sber is conditional on use. |
| Lists, layouts and legacy templates (`Sfi.News`, `Sfi.Shared`, `Sfi.Grid`, `Flowpack.Listable`, local prototype generators) | Create/move nested grid content and references. Exercise pagination, filters, tag/author listings, article dates, study-program tabs, news/search, journal and fundraising layouts on desktop/mobile. Repeat relevant cached views after publishing a change. | Required representative coverage; several rendering paths already passed, interactive/editing flows pending. |
| Terms, Mustache and Registry (`Psmb.Term`, `Flowpack.Mustache`, `Psmb.Registry`) | Edit a term and check replacement without corrupting links/itemprop. Render two different fixture subscribers sequentially and ensure no personalized value leaks between requests or cached renders. Exercise repeated authors in blog listings. | Required in the features that use them; newsletter generation has partial coverage. |
| Bookmarklet (`Psmb.Bookmarklet`) | Open a known public page in the editor through the bookmarklet; verify the selected document, language and personal workspace. | Legacy route fixed; the generated bookmarklet opened a public Russian article in the correct personal workspace. Passed locally. |
| History/styleguide/analytics (`AE.History`, `Sfi.Styleguide`, `Neos.GoogleAnalytics`) | Open each backend module and inspector view, inspect sample events/styleguide entries and confirm failure of an external analytics request does not break the editor. Establish whether the configured analytics reports are still used. | History details/filter/pagination passed after a compatibility fix. Optional styleguide/analytics usage and remaining checks still need sign-off. |
| “Шахты” backend module (`Sfi.Umo`) | Check module loading and role access. | File-dependent import and PDF generation deferred with `/umo` and `/docs`. |
| Redirects, HTTPS, cache, logging and jobs | Test old URLs and renamed-page redirects; correct canonical/asset URLs behind the real TLS proxy; backend cookies/login/logout; Redis separation and invalidation; an observable application error; container restart; backup job and education refresh. | Required operational checks. Local Nginx/Redis/hourly checks passed; actual proxy and production logging remain. |

If PropsEditor is external, its additional flow must cover login/authorization, reading existing properties, saving each supported shape, clearing values, preserving unrelated properties, workspace/language selection, publishing visibility, cache invalidation and handling a rejected save without reporting success.

## Test method and evidence

1. Keep the existing comparison site read-only. Create a second acceptance database and resource store with disposable test accounts/content. Restore between scenarios that alter content structure or subscriber data.
2. Keep all six custom extension builds reproducible against the locked UI version, with emitted CSS registered. The four previously outstanding bundles are now rebuilt. Fail early on missing assets or JavaScript exceptions, then test behavior rather than considering bundle loading a pass.
3. Use repeatable browser flows for editor interactions. For each important property/HTML edit, check the UI, persisted node value and published DOM after a fresh reload. A screenshot or successful HTTP response alone is insufficient.
4. Use fixture services for donor data, event writes and payment-widget calls, plus local mail capture. Do not connect the copied subscriber database to real delivery. Test mail addressed to a real mailbox requires a separately authorized recipient; none is needed for local acceptance.
5. Test storage uploads in an isolated writable S3 location, with no production resource deletion or cleanup. Read-only access to existing assets is not proof that upload/crop works.
6. Add focused regression tests for any discovered compatibility bugs, especially stripped markup, recipient filters, dry-run external writes, preserved signing keys and cache invalidation after publication. Retain browser traces and before/after data for failed scenarios.
7. Rerun the disclosure comparison after the editorial round trips and any template/plugin fixes. Record pass, fixed-and-retested, deferred or blocked for every matrix row.

## Sequence to release

### 1. Finish local acceptance

The known mailer/filter/build issues and representative local editor checks are complete; use the linked QA report to distinguish tested coverage from remaining scenarios. Identify PropsEditor if separate and carry the remaining matrix into staging. Do not count unit coverage as external integration acceptance.

### 2. Run a production-like staging rehearsal

Use a candidate published by the checked manual workflow and pinned by digest, with a fresh database copy, production-equivalent MariaDB/Redis versions, the real HTTPS/proxy arrangement and an isolated writable S3 location. Validate signing-key persistence securely, role permissions, scheduled jobs, logs and restarts. Use sandbox payment credentials and fixture/captured mail. Record restore/migration/cache-warmup durations to size the maintenance window; do not promise downtime before measuring it.

Ask an experienced editor to complete one realistic news/publication workflow and one disclosure-property change on staging. This complements the automated checks and confirms the new UI still supports the team's working process.

### 3. Establish release and rollback artifacts

- Keep the old production image by immutable digest, with its configuration, signing key and resource access recorded securely.
- The workflow now checks PHP compatibility, editor bundles and image startup before publication. Publish a tested candidate and deploy its immutable digest. Confirm whether the current `master` image is automatically consumed by deployment infrastructure.
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
