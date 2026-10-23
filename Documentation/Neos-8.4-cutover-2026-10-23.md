# Neos 8.4 live cutover — 23 October 2026

`https://sfi.ru` now runs the accepted Neos 8.4 build with the classic content repository. The original web container is stopped, and its database and Redis remain available for rollback. Spaas adoption, registry publication, merging the upgrade branch and retirement have not been performed.

## Running deployment

- Image used at cutover (later in-place code updates are recorded below): `sha256:7c86ebeba31e33acf3a8f79ac8c01a424d4f12a23f0a21336f4cbeab4df1e84f`, tagged `sfi-candidate:neos84-4f4230bf6fe1cdc15eb59451b00799f66979589e`. It derives from the accepted image `sha256:0a019e29c79f55359bc5411270c4cfec08e5c910db63381182503d7561eb2053` (source `56fe7c4e248989cd956e8d7e9120bbb859a4c60e`), adding only the two-line almanac fix from `4f4230bf6fe1cdc15eb59451b00799f66979589e`. The derivation Dockerfile and exact input are retained under `hotfix-4f4230bf6/`; candidate metadata and `release.env` point to the final image.
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

The fresh education page was generated successfully. Russian and English homepages, the study index, journal and projects page returned HTTP 200. The English homepage retains the previously documented `appendChild` JavaScript error, also observed on production before the upgrade. The common page's two stylesheets and three header/content images loaded successfully.

Six route-resolution warnings appeared after public traffic resumed, coinciding with requests for an older conference page (`/science/nauchno-praktichieskiie-konfierientsii/tradiciya-svyatootecheskoj-katehizacii-tema-cheloveka-na-osnovnom-etape-oglasheniya-2014/izbrannye-doklady.html`) and article (`/lektsii-diskussii-interviu/vospitatel-ne-chinovnik.html`). Both subsequently returned HTTP 200 in under half a second; their rendered anchors all have nonempty targets. The log does not identify the unresolved node, so its underlying link-generation cause remains a follow-up rather than a claim of full resolution. These warnings were not present during the focused disclosure/editor checks.

Public routing checks confirm the homepage and CMS login return 200, `www.sfi.ru` redirects to `https://sfi.ru/`, HTTP redirects to HTTPS, `/sveden/common` redirects to the common-information page, and `/sveden/education` redirects to its generated HTML page. Staging HTTP authentication and noindex headers are absent. `/db.sql` returns 404.

Two operational checks were corrected during execution: Docker reassigns the original container's automatic host port on restart, so rollback health checks now use `docker exec`; and the first immediate proxy probe after stopping maintenance timed out, so the runbook allows configuration propagation and retries transient failures. Subsequent public browser/HTTP checks passed.

Evidence is in ignored `output/playwright/cutover/` in the upgrade worktree and the protected server `backups/` directory. Broader custom-plugin acceptance remains documented in the staging report. `/docs`, `/umo`, payment rehearsal and root cron inspection remain outside the agreed scope.

## Almanac correction during live verification

A crawler exposed a server error at `/science/nauchnyj-zhurnal/vypusk-23-leto-2017.html?article=node-27iq7medihz02`: the requested article no longer resolved, but the template selected its detail view and replaced the current node with null. The language menu then called `Array.first()` with null. The template now requires an existing article node before selecting the detail view and article title; otherwise it shows the issue page.

The fix was built as an immutable image derived from the accepted image. An isolated validation container used the release database for read-only HTTP checks, its own file caches, no scheduler, and no public proxy route. The stale URL returned 200 with byte-identical output to the issue page. The normal issue page and a valid article were byte-for-byte unchanged from the live pre-fix output.

The release container was replaced during a second maintenance window, 16:45:22–16:48:31 Moscow time (3 minutes 9 seconds). The targeted Fusion cache flush was insufficient; a full `flow:cache:flush --force` and cache warmup picked up the new template. Keep the full cache rebuild as the replacement procedure. The generated education page was preserved across replacement, and its generator was rerun successfully afterward. The corrected stale/valid article cases and all 15 disclosure pages were checked again publicly; the same 2,890 itemprops, 36 tables and 3,565 signatures match the pre-upgrade baseline. The original failed request and diagnostic reproductions remain in historical exception logs; final log verification is measured from the patched reopening timestamp in `backups/hotfix-live-opened.txt`. No new application warning/error/critical entry or HTTP 5xx response appeared in that verification window. The original signing key still matches.

The stopped `sfi84-hotfix-check` container remains available for inspection. No database migration or schema change was needed for this correction. The old runtime and original database remain preserved. Include the later in-place changes below in the release used for Spaas adoption.

## Standard setup and in-place updates

After cutover, the operational setup was simplified at the owner's request. Source commit `d38c42fd2` removes the custom secret loader and `sfi-flow` wrapper. The existing signing key is now in Flow's standard `Data/Persistent/EncryptionKey` file on `sfi84_data`, owned by UID 80 with mode 600. It matches the original key byte for byte; native HashService validation passed with no key environment variable. No database content or schema was changed.

The running container now has a clean Git checkout tracking `origin/dimaip/upgrade-neos-8-4`. That branch was published without merging into `master` or triggering its deployment workflow. Installed packages, shared mounts and generated files were preserved. The host-specific, bind-mounted `server/nginx/conf.d/default-sfi.ru.conf` is marked `skip-worktree` in this checkout; review it separately if changing routing. Local runtime configuration and generated files are excluded through `.git/info/exclude`. The source image remains the cutover image; the current application revision is available through `git rev-parse HEAD` and the server's `live-source-commit` file. Include the current checkout and standard key storage in the eventual Spaas release before recreating the container.

Routine updates now use `git pull --ff-only && ./flow flow:cache:flush` inside `/data/www` as UID 80. The inherited context is still `Production/Upgrade`. Its live HTTP settings were also copied into standard `Production/Settings.yaml`, so explicit Production CLI commands load the same settings; flush the inherited context for the running website. No maintenance routing, container restart, image build or image transfer was used for this simplification. Flow briefly returned 503 during cache recompilation; subsequent public checks passed.

Plain CLI cache flush/warmup and migration-status commands passed (157 applied migrations, none pending). All 15 disclosure pages retained identical itemprop, table, microdata and signature hashes. The homepage, login, common-information page, education page and corrected almanac URL returned 200.

Live log review exposed an additional upgrade compatibility error in the old-news redirect resolver: it called the removed Doctrine `Statement::fetchAll()` method. Commit `730e8fc70` uses a parameterized query and the supported result API. It was delivered with an actual fast-forward pull, ordinary Flow cache flush and warmup. Ten unit tests passed, including a regression resolving a stored legacy URL containing a quote. A known legacy news URL returned 301, while missing legacy URLs returned 404 instead of 500. No new HTTP 5xx response appeared in the focused verification after that fix.

Protected pre-change files and the checkout diff are retained under `backups/before-normal-setup.tar` and `backups/before-checkout-normalization.patch`. Additional verification evidence is under `output/playwright/cutover/normal-setup-*` in the upgrade worktree. The original rollback container, database and backups remain unchanged.

## Trial and next steps

The site is ready for the editorial trial. Keep the original container, database, Redis, rollback image and backups during the observation period. No editor notification or recurring monitoring task has been created.

After successful use for a few days, approve Spaas adoption separately. That step publishes the tested image, installs the reviewed persistent-volume configuration, verifies backup restoration/off-host preservation and only then retires the old containers. Follow the [rollout and rollback commands](Neos-8.4-server-rollout.md); do not run a global Spaas update or remove volumes during the trial. If rollback becomes necessary after editing resumes, new content needs reconciliation with the preserved old database.
