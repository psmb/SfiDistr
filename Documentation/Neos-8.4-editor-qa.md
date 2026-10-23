# Neos 8.4 editor and release acceptance

Current server rollout: see [the 23 October staging report](Neos-8.4-staging-2026-10-23.md) and [server command plan](Neos-8.4-server-rollout.md). They supersede the earlier isolated-S3/payment-sandbox requirements below; storage and integrations remain shared as agreed. The upgraded stack uses Redis 7.4.11.

Local acceptance performed on 21 September 2026. Neos 8.4.7 / Flow 8.4.4 / Neos UI 8.4.4, classic content repository. Production was not changed. `/umo` and `/docs` file handling remains deferred.

## Isolation and evidence

The migrated `sfi_neos84_current` comparison database was cloned to `sfi_neos84_acceptance`. All editorial changes, fixture accounts, signatures and uploads were made in that disposable copy. The comparison site on port 8085 remains separate. Development acceptance uses port 8084; the production-context acceptance container uses port 8086 with separate Redis, a test signing key and local resource storage. Email was captured in a local mbox file. Payment calls were intercepted, and external unsubscribe events went to a disposable HTTP fixture.

Raw results, browser scripts, HTML comparisons and fixture data are under the ignored `output/playwright/editor-acceptance/` directory. No real broadcasts or charges were made.

## Fixed and verified

- **Four remaining editor extensions:** NewsletterView, CreateNodeView, Bookmarklet and History NodeInfoView now build with the pinned 8.4.4 adapter and npm lockfiles. The latter three are maintained Composer path packages with upstream provenance. All six custom editor builds pass.
- **Newsletter filters:** send and test-send now forward the same additional arguments as preview, including empty end dates and encoded values. The undefined `pair` reference was corrected. Changing a node to the live workspace now preserves all content dimensions. Controller and JavaScript regression tests verify the request and recipient-selection paths.
- **Fundraising dry run:** renders without sending mail or recording an external sent event. Regression tests cover eligible, invalid-address and future-dated fixtures, normal delivery and a delivery exception. The existing record-before-delivery policy is retained: a failed delivery can already have a sent event, so it requires reconciliation rather than an automatic retry. The scheduled mailer remains disabled.
- **History module:** the old script ran before jQuery was available and referenced removed RequireJS/bootstrap modules. Filters and pagination now use browser APIs, and change details use expandable HTML. Browser checks opened a diff, increased visible events from 11 to 17 with Load More, and filtered by the acceptance account without a JavaScript exception.
- **Bookmarklet:** the legacy `/neos!` address produced an error. The generated bookmarklet now uses `/neos/content` with an encoded node path. Browser execution opened the published fixture article in the correct Russian personal workspace without a JavaScript exception.
- **Restricted editor links:** a Fundraiser following a direct link outside its allowed tree caused a null-document JavaScript crash. A distribution aspect checks the existing node-tree policy before loading that document and returns access denied. The final image returned HTTP 403 for that link while the Editor could still open it. Unit coverage includes default, permitted and denied documents.
- **Signing key (original image verification, superseded by the normal setup below):** production startup requires `FLOW_ENCRYPTION_KEY`, supplied through the environment or a matching Docker secret. Two fresh containers accepted the same synthetic legacy-format unsubscribe token; invalid tokens produced no external writes. The final image was also tested with the key supplied only as a Docker secret: both HTTP token validation and the effective key seen by `sfi-flow` passed. The command loads secrets for maintenance operations because environment variables exported by the entrypoint alone are not inherited by `docker exec`. The final image rejected startup without a key.
- **Release checks:** the workflow is configured to run the PHP compatibility suite, rebuild all six editor bundles, verify committed bundles match the build, run JavaScript regressions and build the production image. Image startup is checked for missing-key rejection. These build/test steps passed locally; the remote workflow has not run for this change. Manual runs can publish a uniquely tagged staging candidate with its digest. Master pushes retain the existing master-tag publication, after checks; confirm whether deployment infrastructure watches that tag before merging. No image has been published remotely by this acceptance run.
- **Image contents:** nested development dependencies are excluded from Docker builds. The release image contains no `node_modules` directories.

## Editorial checks completed

| Workflow | Result |
|---|---|
| Quick creation | The custom news control created a Russian article in the correct parent and personal workspace, including seven initial nodes from the configured template. |
| Bookmarklet | The generated bookmarklet opened a public article in the editor, preserving its node and language and selecting the current user's personal workspace. |
| Inspector | Title and navigation-title edits, a boolean change, clearing a field, apply and reload persisted. The published node retained the unrelated tested properties. |
| Disclosure conversion | Across all 15 disclosure pages, 154 editable fields retained all 639 itemprop entries, their nesting, 29 signature attributes and table cells/spans when read through CKEditor. This includes all 17 editable fields on the common-information page. The wider sweep checked editor conversion, not a save/publish cycle on every field. |
| Disclosure save/publish | A controlled text edit remained absent from the visitor page until publication, then appeared immediately. All 28 page itemprop entries and 38 main-content table cells matched after allowing for the intentional text change. This exercises content-cache invalidation too. |
| Rich text | A fixture with paragraph/span/cell itemprops, colspan/rowspan, a signed link and two Unicode footnotes survived save and editor reload. Itemprop change/undo/redo and footnote change/remove/undo passed through the actual registered editor commands. A footnote was also changed through the visible toolbar field. |
| Published rich text | The visitor DOM contained the four expected itemprops, one signature-bearing link, two numbered footnote sources and two corresponding return targets. |
| Signature API | Authenticated metadata storage returned success; an anonymous write redirected to login. Physical signed-file generation was not exercised. |
| First publication | First publish changed the sentinel date to a real timestamp. Publishing later property/image changes preserved that timestamp. |
| Media | A synthetic 640×320 PNG was uploaded through the inspector to local storage, cropped using the UI's fixed ratio, applied and published. The crop selection changed from 94.5946%×100% to 66.996%×70.8244%. This is local-storage coverage, not S3 acceptance. |
| Newsletter | The rebuilt inspector loaded RU/EN subscriptions. Its Test action generated a 15,062-character HTML message with the fixture article and correct subject/recipient, captured locally for `fixture@example.invalid`. No SMTP delivery occurred. |
| Roles | Editor and Fundraiser could log in. Both received HTTP 403 from user administration. The Fundraiser tree contained only the home ancestor, fundraising newsletters and projects; the Editor could open the fixture news article. In the final image, the Fundraiser's direct link to that article returned HTTP 403. |
| Unsubscribe | Invalid tokens produced error feedback and no event. A valid legacy-format token produced one fixture unsubscribe event, including after starting a fresh container with the same key. |
| Donation form | Missing consent prevented invoking the widget. Captured one-off and monthly payloads had the expected project, amount, currency, email and monthly recurrence. The provider widget was replaced before submission; no payment request was sent. |

The education and management pages required a longer wait for the inline editors to initialize in the local development server. Their five and thirteen editable fields respectively are included in the final conversion comparison. Content assembled from other source nodes still needs its representative source-editing workflow checked during editorial acceptance.

One synthetic mixed-header table (`th` and `td` within a `tbody`) was normalized by CKEditor into more header cells. None of the existing disclosure fields in the conversion sweep showed this change. Do not treat arbitrary legacy HTML as a byte-preserving editor format; check other unusual table structures during editorial acceptance.

## Remaining release gates

1. Run the candidate behind the actual HTTPS proxy with production-equivalent database/Redis settings, an isolated writable S3 location, captured SMTP and provider sandbox credentials. Verify upload/crop persistence after container replacement, forwarded URLs/cookies, logging and jobs there.
2. Transfer the **current production** Flow key securely and validate a real previously issued token. The synthetic-key tests establish the mechanism, not possession of the production key.
3. Have an experienced editor complete representative news, disclosure, program/person/journal, RU/EN and reference/layout workflows. Test move/hide/delete/discard and any configured dimension synchronization. No separate PropsEditor application was found; its own repository/URL is needed if that name refers to something outside this distribution.
4. Rehearse a newsletter broadcast to fixture subscribers with the real staging data-source contract, subscription lifecycle/import/export, donor personalization and delivery-failure reconciliation. The local Test action and regression suite do not replace that integration rehearsal.
5. Confirm the active status of legacy Sber and analytics integrations, and validate enabled optional modules. `/umo` and `/docs` remain outside the current gate.
6. Rehearse rollback using the old image **and a restored pre-upgrade database**, establish the release owners and maintenance window, and confirm that publishing `master` cannot accidentally trigger cutover.

Use the [go-live plan](Neos-8.4-go-live.md) and [deployment runbook](Neos-8.4-upgrade.md) for cutover. Public rendering parity and these local checks are strong evidence for staging; they are not production sign-off.

## Standard Flow operations after cutover

The live setup now uses Flow's standard `Data/Persistent/EncryptionKey` file on the existing persistent Data volume. The original 96-byte key was preserved exactly with owner-only permissions. The custom secret loader and `sfi-flow` wrapper were removed. Plain `./flow` configuration, cache flush/warmup and migration-status commands passed without a key environment variable. Native HashService validation using the persistent file matched the original key. All 15 disclosure pages still matched the accepted baseline (2,890 itemprops and 3,565 signed links). See the cutover report for the subsequent legacy-redirect correction.
