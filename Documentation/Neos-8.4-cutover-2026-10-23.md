# Neos 8.4 live cutover — 23 October 2026

`https://sfi.ru` now runs the accepted Neos 8.4 build with the classic content repository. The original web container is stopped, and its database and Redis remain available for rollback. Spaas adoption, registry publication, merging the upgrade branch and retirement have not been performed.

## Running deployment

- Application source: `56fe7c4e248989cd956e8d7e9120bbb859a4c60e`, with the same tested image `sha256:0a019e29c79f55359bc5411270c4cfec08e5c910db63381182503d7561eb2053`.
- Neos 8.4.7, Flow 8.4.4, Neos UI 8.4.4, PHP 8.3.31 and Redis 7.4.11. No event-sourced repository migration.
- Compose project `sfi84`: `sfi84-web-1`, `sfi84-db-1`, `sfi84-redis-1` are running with `unless-stopped` restart policies.
- Database volume `sfi84_release_db`; Redis volume `sfi84_release_redis`; existing candidate runtime volume `sfi84_data`.
- Settings and Compose files are under `/mnt/vol2/docker/sfi84-20261023`. Use `release.env` and `live.json`; `ops.sh` now defaults to `release.env`.
- Shared S3, persistent resources, `/docs` and `/umo` mounts remain as agreed. Generated package static links stay in the candidate's temporary mount. The original static link targets survived the rollback rehearsal.
- Production SMTP configuration is active, and the original signing key is unchanged. No email broadcast, editor notification or payment transaction was initiated.
- `next.sfi.ru` has been replaced by the live deployment. Its accepted database remains in `sfi84_stage_db` and a protected dump.

The cutover window began at 15:58:27 Moscow time (12:58:27 UTC). Final public reopening was recorded at 16:24:22 (13:24:22 UTC), a 25 minute 55 second window including the rollback rehearsal and browser acceptance checks. There was a brief earlier reopening for public verification.

## Database and rollback preservation

The fresh production dump was taken after stopping the original web container. It was restored into an empty release volume, and every source content record matched before migration. The original database volume `sfidistr_db-data` was not restored into or migrated.

- Dump: 94 seconds, 145,529,566 compressed bytes; gzip and SHA-256 verified.
- Restore: 189 seconds.
- Schema/node migration and cache preparation: 210 seconds. Doctrine reports 157 executed/available migrations and zero pending; node migration `20190304111200` was applied.
- Content records: 60,765 → 60,764. The only missing record was the already-deleted `user-dimaip` draft `74038a1c-a9f4-4579-8fd6-6281beac282b`, exactly as in staging. All live records survived; 580 node type names were migrated.
- Staging's test article and QA account were absent from the fresh clone. The temporary cutover editor and workspace were deleted after checks; sessions were cleared. Final content count is 60,764, with no temporary account or test article.

The exact stopped original runtime was committed as `sfi-rollback:pre-neos84-20261023`, image `sha256:656d7798102bb2445d2a8c3a2b49a12d9f091aab644ae1993e0983f6743996af`. Its compressed archive is 1,078,212,202 bytes. The shared resource-link archive, original configuration, signing key, container metadata, original/staging database dumps and checksums are retained in the protected server `backups/` directory. An accepted upgraded-database dump is also retained there as `release-accepted.sql.gz`.

The original runtime was restarted during maintenance and successfully served the common-information page with its expected markup. It was then stopped and the candidate restarted. `sfidistr-web-1` now has restart policy `no`; the original database and Redis remain running. No old container or volume was deleted. An independent off-host copy and a restore rehearsal of the upgraded backup remain gates before retirement.

## Acceptance evidence

All 15 disclosure sections were compared with a fresh pre-cutover production browser baseline, both through a private connection during maintenance and again through public HTTPS. Every page returned HTTP 200 with no JavaScript exception. Ordered itemprop attributes/text/nesting, microdata attributes, table structures/spans/text, and decoded signature payloads matched:

- 2,890 itemprops;
- 36 tables;
- 3,565 signed links, with no invalid signature payloads.

A temporary user with the ordinary `Neos.Neos:Editor` role logged in, edited the common-information page, published a marker, and restored/published the original text. Public content reflected the publication without a manual cache flush. The final comparison matches the original content and confirms no marker remains. Login was repeated through the real public HTTPS route; the `Neos_Session` cookie is secure, HttpOnly, SameSite=Lax and scoped to `sfi.ru`.

The fresh education page was generated successfully. Russian and English homepages, the study index, journal and projects page returned HTTP 200. The English homepage retains the previously documented `appendChild` JavaScript error, also observed on production before the upgrade. No new application warning/error was found in the System log.

Public routing checks confirm the homepage and CMS login return 200, `www.sfi.ru` redirects to `https://sfi.ru/`, HTTP redirects to HTTPS, `/sveden/common` redirects to the common-information page, and `/sveden/education` redirects to its generated HTML page. Staging HTTP authentication and noindex headers are absent. `/db.sql` returns 404.

Two operational checks were corrected during execution: Docker reassigns the original container's automatic host port on restart, so rollback health checks now use `docker exec`; and the first immediate proxy probe after stopping maintenance timed out, so the runbook allows configuration propagation and retries transient failures. Subsequent public browser/HTTP checks passed.

Evidence is in ignored `output/playwright/cutover/` in the upgrade worktree and the protected server `backups/` directory. Broader custom-plugin acceptance remains documented in the staging report. `/docs`, `/umo`, payment rehearsal and root cron inspection remain outside the agreed scope.

## Trial and next steps

The site is ready for the editorial trial. Keep the original container, database, Redis, rollback image and backups during the observation period. No editor notification or recurring monitoring task has been created.

After successful use for a few days, approve Spaas adoption separately. That step publishes the tested image, installs the reviewed persistent-volume configuration, verifies backup restoration/off-host preservation and only then retires the old containers. Follow the [rollout and rollback commands](Neos-8.4-server-rollout.md); do not run a global Spaas update or remove volumes during the trial. If rollback becomes necessary after editing resumes, new content needs reconciliation with the preserved old database.
