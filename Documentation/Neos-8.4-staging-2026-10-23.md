# Neos 8.4 staging acceptance — 23 October 2026

`next.sfi.ru` was deployed on `server.psmb.ru` from a fresh production database copy. The upgrade uses Neos 8.4.7, Flow 8.4.4, Neos UI 8.4.4 and the classic content repository. Production routing, its database, Redis and original web container remain in place. Cutover and subsequent Spaas adoption have not been executed.

## Deployment

- Source: `dimaip/upgrade-neos-8-4`, application commit `56fe7c4e248989cd956e8d7e9120bbb859a4c60e`. Current production changes, including testimony cards, were merged before building.
- Image: native Linux build from a clean Git archive; no development credentials, SQL dump, Git metadata or development dependencies in the build context. The final immutable image is `sha256:0a019e29c79f55359bc5411270c4cfec08e5c910db63381182503d7561eb2053`. Its ID and source commit are recorded in `/mnt/vol2/docker/sfi84-20261023/candidate-image-id` and `source-commit`. The image is available locally on this server; registry publication remains a later step.
- Runtime: PHP 8.3.31, phpredis 6.2.0, MariaDB 10.3.32, Redis 7.4.11. Redis is pinned to `redis@sha256:57e4255cc971b1c8d6f8a6ca283ac01bc3ecdd914273ef6bfaede87aaecd6541`.
- Containers: `sfi84-web-1`, `sfi84-db-1`, `sfi84-redis-1`. Database and Redis have their own volumes and network. Application runtime data uses `sfi84_data`.
- Production S3, resource volume, credentials, `/docs` and `/umo` mounts are shared as agreed. Generated static links use a separate temporary mount in the candidate. Snapshots of production's static symlinks match before and after staging startup and replacement.
- `next.sfi.ru` has trusted HTTPS, HTTP authentication and `X-Robots-Tag: noindex, nofollow, noarchive`. Authentication is host-scoped. The CMS session cookie is secure, HttpOnly, SameSite=Lax and limited to `next.sfi.ru`.
- The original production Flow signing key was transferred without displaying it. Stage mail is captured in `Data/Persistent/acceptance-mail.mbox`. Payment/API configuration is unchanged. No broadcasts, editor notifications or charges were initiated. Root cron inspection was waived and existing jobs were left alone.

The HTTP password and temporary staging QA account are in protected files outside the repository and web roots. Existing editor accounts/passwords were cloned with the database. The temporary QA account exists only in the staging database. One clearly named test news article remains there for reviewing the custom rich-text and image checks. The final production clone excludes both the account and test article.

## Restore and migrations

The container-provided database utilities produced a compressed, checksum-verified dump of 145,529,566 bytes. Dump creation took 95 seconds; import into the empty staging database took 172 seconds. Logs, original configuration and the dump are retained under the protected server `backups/` directory.

Eight pending Doctrine migrations and stock node migration `20190304111200` were applied. Schema status reports 157 available/executed migrations and zero pending. The content count changed from 60,765 to 60,764: record-level comparison identified exactly one removed record, already marked deleted in `user-dimaip`, of type `Neos.NodeTypes:Html`. Every live record was preserved. No content repair, resource cleanup or event-sourced migration was run.

The migration/warmup session lasted 6 minutes 32 seconds, including pauses for investigation and verification. This is not pure execution time or a promised cutover duration. The final maintenance window must also include the fresh dump, restore and smoke checks.

## Issues discovered and corrected

1. **Redis 3.2 silently failed to invalidate cached content.** Publishing updated the database but visitors retained old HTML. The Neos 8.4 Redis backend uses `UNLINK`, which is [available from Redis 4.0](https://redis.io/docs/latest/commands/unlink/). Even a cache-flush command could report success with the old server. Staging was upgraded to Redis 7.4.11 and both Compose files now pin the tested image. A new publish and subsequent revert both updated the visitor page without manual cache flushing. Original production Redis was not upgraded.
2. **History displayed a PHP deprecation warning.** Its asset-existence view helper declared an optional argument before a required argument. The signature now matches the framework's condition helper. The corrected source was rebuilt into a new immutable candidate. The final browser check confirms History loads with no deprecation text.
3. **PECL download failed during the first native image build.** Redis extension installation now uses the official phpredis 6.2.0 source archive with its SHA-256 pinned. The successful build retains the same extension version.
4. **Execution details were corrected in the runbook.** Compose one-off commands now disconnect stdin when driven through SSH. Database readiness uses an authenticated SQL query, because `mysqladmin ping` can succeed before the intended account is ready. HTTP readiness is checked before invoking the education refresh.

## Browser and editorial evidence

Fresh Chrome comparison against production covered all 15 disclosure sections and was repeated successfully after the final image replacement and common-page edit/revert. All returned HTTP 200 with no JavaScript exceptions. After normalizing the site hostname and equivalent resource URL forms, ordered itemprop attributes/values/nesting, microdata attributes, table structure/text/spans and signature payloads matched across every section:

- 2,890 itemprop attributes;
- 36 tables;
- 3,565 signed document links, with matching metadata and decoded signing payloads;
- zero invalid signature payloads.

The common-information page has 26 public itemprops and three tables. Its 17 editable fields contain 33 itemprops, including fields in hidden content groups; conversion through CKEditor preserved their attributes, nesting and table structure. A controlled edit was saved and published on staging, then reverted and republished. After the Redis correction, public content changed immediately in both directions. No test marker is intended to remain on the common page.

The 390×844 mobile common-page screenshot was pixel-identical to production. The desktop page was visually inspected at 1440×1000.

Other checks completed:

- Russian/English homepages, study-program index, journal and fundraising landing pages returned HTTP 200. The English homepage throws an `appendChild` JavaScript error on both production and staging at the same inline-script location; this is pre-existing, not an upgrade regression.
- Backend login, document tree, inspector and HTTPS session settings.
- Custom quick-create control created a Russian news article with seven template nodes under the correct news parent.
- A synthetic 640×320 PNG uploaded through the inspector to the shared S3 storage. The crop changed from 94.5946%×100% to 84.5946%×89.4286%, was applied, and the image variant was saved and published. First publication assigned the real publication timestamp.
- After replacement, the published fixture retained four itemprops, one signature-bearing link and two footnote sources/return targets. The registered itemprop command passed change/undo/redo. The footnote command passed update/remove/undo, including Unicode text. A fixture combines nested itemprops, table spans, signature metadata and two footnotes.
- History opened a change detail, loaded additional entries (13 → 19), and accepted the QA-user filter with no JavaScript exception.
- Newsletter inspector and the RU/EN subscription-list endpoint loaded successfully. The read-only recipient preview returned HTTP 200 with 652 entries; no recipient details were included in the report. Earlier local acceptance covers its test-mail/filter behavior; a real broadcast was not part of this run.
- PHP suite: 15 tests, 39 assertions passed. All six editor bundles rebuilt; three JavaScript tests passed. No generated bundle changes were necessary.

Evidence is under ignored `output/playwright/next-qa/` in the upgrade worktree and the protected server `backups/` directory. Network errors for two third-party Yandex endpoints were observed in the headless editor; they did not block these workflows. The new-article tag selector also emitted an existing null-to-empty-array warning.

## Replacement result and remaining boundary

The final image was recreated successfully. The session remained valid; the image loaded from S3, the persisted crop remained 541×286, and both its image-variant reference and first-publication timestamp were unchanged. The bookmarklet reopened the fixture in the correct Russian personal workspace. The original signing key remained byte-identical. The hourly education refresh completed, Nginx validation passed, and the application System log contained no warning/error entries. Production home/common pages still return 200 and its exposed-dump URL returns 404. Dump/backup extensions on staging return 404; the legacy common-page redirect stays on `next.sfi.ru`. 

An experienced editor should now try a normal news workflow and a representative disclosure edit. Existing local acceptance remains useful for roles, newsletter fixture delivery and less common layouts; this run does not claim a repeat of every historical matrix row. `/umo`, `/docs`, payment rehearsal and cron inspection remain outside the agreed scope. A real previously issued unsubscribe token has not been submitted to the production integration.

Before live cutover, take a fresh database copy so test accounts/content do not become production. Use the exact tested image and Redis version. Keep the original web container and database for rollback, and rehearse switching back during maintenance. Spaas adoption and removal of the old container follow the observation period and require their own approval. The executable sequence is in the [server rollout runbook](Neos-8.4-server-rollout.md).
