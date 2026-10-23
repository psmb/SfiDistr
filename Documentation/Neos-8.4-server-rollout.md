# Neos 8.4 server rollout and rollback

Prepared on 23 October 2026 for `server.psmb.ru`. This is a proposed command plan, not a record of deployment. The target is Neos 8.4 with the classic content repository. Editors have already been told to pause changes. `/umo` and `/docs` acceptance remains deferred; their existing files and mounts are preserved.

Bring up `next.sfi.ru` with its own database and Redis, using the existing production S3 bucket, prefixes, credentials and shared file mounts. Payment and external API configuration stays as in production. After acceptance, import a fresh production dump into a clean database volume, switch Traefik to the candidate, and keep the original web container stopped for several days. Adopt the tested deployment into Spaas only after the trial succeeds.

This follows the simplified storage and integration scope agreed on 23 October. It replaces the separate S3-copy and payment-sandbox requirements in the earlier go-live plan. Rollback restores the application and database; changes to shared files or S3 remain shared.

## Approvals and verified facts

The only approved server change completed so far is moving `/data/www/Web/db.sql` to `/data/www/Data/Persistent/db-public-20261023.sql` inside `sfidistr-web-1` and setting mode `600`. The file is preserved. Its public URL returns 404; the homepage returns 200.

Review the commands in three batches before execution:

1. **Staging:** build and transfer the candidate, create its database and Redis, reuse shared storage, clone the database, and publish authenticated `next.sfi.ru`. Production routing and database stay in place.
2. **Cutover or rollback:** maintenance routing, stopping/restarting web containers, switching the live hostname and replacing staging containers with the release configuration. This requires a separate go-ahead after staging results.
3. **Spaas adoption and retirement:** publish/merge the final deployment configuration, replace the original Compose services, then remove stopped trial containers. This requires approval after the observation period.

| Item | Observed state |
| --- | --- |
| Production web | `sfidistr-web-1`; PHP 7.2.11; code commit `ce606a6a191e18f125324693a790e8cad29e1209` |
| Original web image | `sha256:131b0a919f6ae5459e844724d4332c4cda32fdecb807904213d10342635a3767`; runtime code has been updated since this image was created |
| Database | `sfidistr-db-1`; MariaDB 10.3.32; database `db`; 38 InnoDB tables, about 3.4 GB; volume `sfidistr_db-data` |
| Redis | `sfidistr-redis-1`; Redis 3.2 |
| Proxy | Traefik 1.7; Docker network `main`; observed proxy address `172.19.0.7` |
| DNS | `sfi.ru`, `www.sfi.ru`, `next.sfi.ru` already resolve to `91.232.135.49` |
| Staging TLS | A trusted certificate for `next.sfi.ru` has not yet been verified |
| Spaas | `/usr/bin/spaas`; cached Compose `/var/cache/spaas/SfiDistr.yml`; environment `/mnt/vol2/docker/secrets/SfiDistr.env` |
| Source | Upgrade worktree `/Users/dimaip/psmb/SfiDistr-neos84`, branch `dimaip/upgrade-neos-8-4`, starting commit `4c4074efa`; branch was not on the remote at inspection |
| Resources | S3 bucket `psmb-neos-resources`; original prefixes `storage/sfi/` and `target/sfi/`; resource records represent about 74.5 GiB of files |

The host has approximately 100 GB free on `/`, 5 TB on `/mnt/vol2`, and 14 GiB available RAM at inspection. Recheck before cloning. Database restore, migrations and cache warmup determine the maintenance window; measure them on staging before committing to a duration. No S3 object copy is needed.

## Resolve these inputs before staging

- Inspect root's scheduled jobs. Passwordless sudo is unavailable, so the read-only command below needs an operator's interactive sudo authentication. Determine whether any job runs Spaas, pulls `master`, updates code, or backs up this site. Before cutover, agree exactly which SFI-specific automation must be suspended. Do not disable unrelated site jobs.
- The legacy startup scripts have been inspected: `DEVELOPMENT` is unset, initial provisioning skips an existing checkout, and database import is confined to development mode. Restarting the preserved container should therefore retain its code and database. Verify this in the maintenance-window rollback rehearsal.

```bash
ssh -t server.psmb.ru 'sudo crontab -l'
ssh server.psmb.ru 'df -h / /mnt/vol2; free -h'
ssh server.psmb.ru 'docker inspect --format "{{json .Config.Entrypoint}} {{json .Config.Cmd}}" sfidistr-web-1'
```

Any required job edit will be shown separately after inspection; this plan does not authorize editing root's crontab.

## Prepare the candidate locally

The recent testimony-card changes on `master` are missing from the upgrade branch. Integrate them before building. Do not publish `master` during staging: its workflow publishes the production image tag, and Spaas reads deployment files from `master`.

These commands run in a Bash shell on the workstation. Stop on conflicts and review the resulting diff. The existing dirty original checkout is not the build source.

```bash
set -euo pipefail
cd /Users/dimaip/psmb/SfiDistr-neos84
test "$(git branch --show-current)" = dimaip/upgrade-neos-8-4
git status --short
git fetch origin master
git merge --no-edit origin/master
```

Before the build, add dump exclusions and an Nginx denial rule as a small reviewed hardening change. The commands below make the exact proposed edits; they have not been executed.

```bash
python3 - <<'PY'
from pathlib import Path
p = Path('.dockerignore')
with p.open('a') as f:
    f.write('\n**/*.sql\n**/*.sql.*\n**/*.dump\n**/*.bak\n')
p = Path('Build/Docker/nginx.conf')
s = p.read_text()
anchor = '        location / { try_files $uri /index.php?$args; }\n'
assert s.count(anchor) == 1
rule = '        location ~* \\.(?:sql(?:\\.(?:gz|bz2|xz))?|dump|bak)$ { return 404; }\n'
p.write_text(s.replace(anchor, anchor + rule))
PY
git diff -- .dockerignore Build/Docker/nginx.conf
export PATH="/opt/homebrew/opt/php@8.3/bin:$PATH"
composer install --prefer-dist --no-interaction
composer test
bash Build/Tests/editor-extensions.sh
git diff --exit-code -- Packages/Sites/Sfi.Sfi/Resources/Public/JavaScript \
  DistributionPackages/Psmb.Footnote/Resources/Public \
  DistributionPackages/Psmb.Newsletter/Resources/Public \
  DistributionPackages/Psmb.CreateNodeButton/Resources/Public \
  DistributionPackages/Psmb.Bookmarklet/Resources/Public \
  DistributionPackages/AE.History/Resources/Public
git add .dockerignore Build/Docker/nginx.conf \
  Documentation/Deployment/Neos84 Documentation/Neos-8.4-server-rollout.md
git commit -m 'Prepare isolated Neos 8.4 rollout and protect database dumps'
SFI_SHA=$(git rev-parse HEAD)
SFI_TAG="sfi-candidate:neos84-$SFI_SHA"
SFI_BUILD=$(mktemp -d /tmp/sfi84-build.XXXXXX)
git archive HEAD | tar -x -C "$SFI_BUILD"
docker buildx build --platform linux/amd64 --load -t "$SFI_TAG" "$SFI_BUILD"
docker run --rm --entrypoint nginx "$SFI_TAG" -t
```

Build only committed source: neither the local database dump nor local development credentials enter this archive. Use this tested image for both staging and live; do not rebuild a different image at cutover.

## Create the candidate deployment

The reviewable templates are in [Deployment/Neos84](Deployment/Neos84/compose.json). JSON is accepted as a Compose configuration. The base file disables proxy exposure; `stage.json` enables the staging hostname and noindex headers, with HTTP authentication supplied separately. `live.json` enables the production hostnames. They are alternative overlays; never combine them. Both use the same S3 configuration, credentials, writable document mounts and existing `_Resources` volume.

Generated `_Resources/Static` links stay local to each container through a temporary mount: Neos rewrites those links to its installed package paths when it starts, and those paths differ between the old and new versions. This avoids replacing production's code-asset links while sharing the persistent resources. Production's `Data` directory currently lives inside its container; the candidate uses one `sfi84_data` runtime volume throughout staging, live trial and Spaas adoption. Its compiled caches are not shared with the old PHP version.

After approval, create the new server directory, transfer the templates and candidate image. These commands fail if the deployment directory already exists, so an interrupted run must be inspected before resuming.

```bash
# Workstation, continuing with SFI_SHA and SFI_TAG from the build.
SFI_RUN=/mnt/vol2/docker/sfi84-20261023
ssh server.psmb.ru 'umask 077; test ! -e /mnt/vol2/docker/sfi84-20261023; mkdir -p /mnt/vol2/docker/sfi84-20261023/backups /mnt/vol2/docker/sfi84-20261023/secrets'
scp Documentation/Deployment/Neos84/* "server.psmb.ru:$SFI_RUN/"
docker image save "$SFI_TAG" | gzip | ssh server.psmb.ru \
  'umask 077; cat > /mnt/vol2/docker/sfi84-20261023/candidate.tar.gz.part'
ssh server.psmb.ru 'gzip -t /mnt/vol2/docker/sfi84-20261023/candidate.tar.gz.part && mv /mnt/vol2/docker/sfi84-20261023/candidate.tar.gz.part /mnt/vol2/docker/sfi84-20261023/candidate.tar.gz'
ssh server.psmb.ru "printf '%s\n' '$SFI_TAG' > '$SFI_RUN/candidate-tag'"
```

The remaining commands run in **one Bash session on the server**, unless marked otherwise. All backups and environment files stay outside web roots. Do not enable shell tracing or paste secret-bearing files into logs.

```bash
ssh server.psmb.ru
bash
set -euo pipefail
umask 077
export SFI_RUN=/mnt/vol2/docker/sfi84-20261023
cd "$SFI_RUN"
docker load < candidate.tar.gz
SFI_TAG=$(cat candidate-tag)
export SFI_IMAGE=$(docker image inspect "$SFI_TAG" --format '{{.Id}}')
test "$(docker image inspect "$SFI_IMAGE" --format '{{.Architecture}}')" = amd64
docker inspect sfidistr-web-1 sfidistr-db-1 sfidistr-redis-1 > backups/original-containers.json
cp /var/cache/spaas/SfiDistr.yml backups/original-spaas.yml
cp /mnt/vol2/docker/secrets/SfiDistr.env backups/original-spaas.env
chmod 600 backups/*
docker cp sfidistr-web-1:/data/www/Configuration backups/original-Configuration
docker cp sfidistr-web-1:/data/www/Data/Persistent/Cache/Data/Flow_Security_Cryptography_HashService/encryptionKey secrets/FLOW_ENCRYPTION_KEY
test "$(wc -c < secrets/FLOW_ENCRYPTION_KEY)" -eq 96
cp secrets/FLOW_ENCRYPTION_KEY backups/original-signing-key
docker run --rm --network none --entrypoint sh \
  -v "$SFI_RUN/secrets:/secrets" "$SFI_IMAGE" -ec \
  'chown -R 80:80 /secrets; chmod 700 /secrets; chmod 400 /secrets/FLOW_ENCRYPTION_KEY'
mkdir redirects.live redirects.stage
chmod 755 redirects.live redirects.stage
docker run --rm --network none --entrypoint tar "$SFI_IMAGE" \
  -C /data/www/server/nginx/conf.d -cf - . | tar -xf - -C redirects.live
cp -a redirects.live/. redirects.stage/
python3 - <<'PY'
from pathlib import Path
for p in Path('redirects.stage').glob('*.conf'):
    p.write_text(p.read_text().replace('https://sfi.ru/', 'https://next.sfi.ru/').replace('http://sfi.ru/', 'https://next.sfi.ru/'))
PY
```

This preserves the actual production signing key without displaying it. SQL alone does not contain the key. Stage redirects must stay on `next.sfi.ru` so following a legacy URL does not accidentally send an editor to production.

Generate fresh database passwords and HTTP authentication. Copy the existing S3 and integration credentials directly from the production container into a protected runtime file without displaying them. Staging's mail transport still captures email locally; payment and API configuration is unchanged.

```bash
python3 - <<'PY'
import json, os, pathlib, secrets, subprocess
p = pathlib.Path(os.environ['SFI_RUN'])
values = {
    'SFI_RUN': str(p),
    'SFI_IMAGE': os.environ['SFI_IMAGE'],
    'SFI_DB_IMAGE': 'mariadb@sha256:a25e7c87fe20c6d035fe81003937a8d732574ecf54466d0294da3423b64af80c',
    'SFI_REDIS_IMAGE': 'redis@sha256:7b0a40301bc1567205e6461c5bf94c38e1e1ad0169709e49132cafc47f6b51f3',
    'SFI_DB_ROOT_PASSWORD': secrets.token_hex(24),
    'SFI_DB_PASSWORD': secrets.token_hex(24),
    'SFI_DB_VOLUME': 'sfi84_stage_db',
    'SFI_REDIS_VOLUME': 'sfi84_stage_redis',
    'SFI_DATA_VOLUME': 'sfi84_data',
    'SFI_RESOURCES_VOLUME': '07d9f1a9ffed77be7ed1ec7b9e1bfb0967efe9466dd1784e38dffefac806f2a8',
    'SFI_RUNTIME_ENV': str(p / 'runtime.env'),
    'SFI_SETTINGS_FILE': str(p / 'Settings.stage.yaml'),
    'SFI_REDIRECTS_DIR': str(p / 'redirects.stage'),
}
(p / 'stage.env').write_text(''.join(k+'='+v+'\n' for k,v in values.items()))
original = json.loads(subprocess.check_output(['docker','inspect','sfidistr-web-1']))[0]
env = dict(item.split('=',1) for item in original['Config']['Env'] if '=' in item)
runtime = []
for key in ('AWS_ACCESS_KEY_ID','AWS_SECRET_ACCESS_KEY','SFI_PM_USER','SFI_PM_PASSWORD','SFI_API_AUTH','GA_SECRET','GA_DEVKEY'):
    value = env.get(key, '')
    assert not any(c in value for c in "\r\n'"), 'Secret requires separate env-file escaping'
    runtime.append(key+"='"+value+"'")
(p / 'runtime.env').write_text('\n'.join(runtime)+'\n')
password = secrets.token_hex(20)
hashed = subprocess.check_output(['openssl', 'passwd', '-apr1', '-stdin'], input=password+'\n', text=True).strip()
(p / 'stage-auth.json').write_text(json.dumps({'services': {'web': {'labels': {'traefik.frontend.auth.basic.users': 'acceptance:'+hashed.replace('$', '$$')}}}}, indent=2)+'\n')
(p / 'stage.netrc').write_text('machine next.sfi.ru login acceptance password '+password+'\n')
for name in ('stage.env', 'runtime.env', 'stage-auth.json', 'stage.netrc'):
    (p / name).chmod(0o600)
PY
export SFI_ENV="$SFI_RUN/stage.env"
sfi84() { docker compose --env-file "$SFI_ENV" -p sfi84 -f "$SFI_RUN/compose.json" "$@"; }
sfi84_stage() { sfi84 -f "$SFI_RUN/stage.json" -f "$SFI_RUN/stage-auth.json" "$@"; }
sfi84_live() { sfi84 -f "$SFI_RUN/live.json" "$@"; }
sfi84_flow() { sfi84 run --rm --no-deps --label traefik.enable=false --user 80 --entrypoint /usr/local/bin/sfi-flow web "$@"; }
sfi84_stage_flow() { sfi84_stage run --rm --no-deps --label traefik.enable=false --user 80 --entrypoint /usr/local/bin/sfi-flow web "$@"; }
sfi84_maintenance() { docker compose --env-file "$SFI_ENV" -p sfi84-maintenance -f "$SFI_RUN/maintenance.json" "$@"; }
sfi84_stage config --quiet
docker volume inspect 07d9f1a9ffed77be7ed1ec7b9e1bfb0967efe9466dd1784e38dffefac806f2a8 >/dev/null
for volume in sfi84_stage_db sfi84_stage_redis sfi84_data; do
  if docker volume inspect "$volume" >/dev/null 2>&1; then
    echo "Refusing to reuse existing volume: $volume" >&2; exit 1
  fi
  docker volume create "$volume"
done
sfi84 up -d db redis
```

Resources are immediately available from the shared S3 prefixes `storage/sfi/` and `target/sfi/`. No new bucket, prefix, credentials or resource-copy step is needed. Keep resource cleanup outside the upgrade procedure.

## Clone and migrate

The legacy container provides `/data/backupDb.sh` and `/data/syncDb.sh`. Its scripts use shell tracing and a fixed `db.sql` backup name; `syncDb.sh` overwrites the configured database. Use the database tools already inside the containers directly, with a dated output and explicit destination. Never run the legacy restore or `syncAll.sh` against production.

```bash
docker exec sfidistr-db-1 sh -ec '
  export MYSQL_PWD="$MYSQL_ROOT_PASSWORD"
  exec mysqldump -uroot --single-transaction --quick --routines --events --triggers "$MYSQL_DATABASE"
' | gzip > backups/staging-source.sql.gz.part
gzip -t backups/staging-source.sql.gz.part
mv backups/staging-source.sql.gz.part backups/staging-source.sql.gz
sha256sum backups/staging-source.sql.gz > backups/staging-source.sql.gz.sha256

# Wait for the new database, then fail if it is not ready.
for attempt in {1..30}; do
  docker exec sfi84-db-1 sh -ec 'export MYSQL_PWD="$MYSQL_ROOT_PASSWORD"; mysqladmin -uroot ping --silent' >/dev/null 2>&1 && break
  sleep 2
done
docker exec sfi84-db-1 sh -ec 'export MYSQL_PWD="$MYSQL_ROOT_PASSWORD"; mysqladmin -uroot ping --silent'
test "$(docker inspect -f '{{index .Config.Labels "com.docker.compose.project"}}' sfi84-db-1)" = sfi84
test "$(docker inspect -f '{{range .Mounts}}{{if eq .Destination "/var/lib/mysql"}}{{.Name}}{{end}}{{end}}' sfi84-db-1)" = sfi84_stage_db
test "$(docker exec sfi84-db-1 sh -ec 'export MYSQL_PWD="$MYSQL_ROOT_PASSWORD"; mysql -uroot -Nse "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema=DATABASE()" "$MYSQL_DATABASE"')" = 0
gzip -dc backups/staging-source.sql.gz | docker exec -i sfi84-db-1 sh -ec '
  export MYSQL_PWD="$MYSQL_ROOT_PASSWORD"
  exec mysql -uroot "$MYSQL_DATABASE"
'
docker exec sfi84-db-1 sh -ec 'export MYSQL_PWD="$MYSQL_ROOT_PASSWORD"; mysql -uroot -Nse "SELECT COUNT(*) FROM neos_contentrepository_domain_model_nodedata" "$MYSQL_DATABASE"' > backups/stage-node-count-before.txt
sfi84 run --rm --no-deps --label traefik.enable=false --entrypoint sh web -ec \
  'mkdir -p /data/www/Data; chown -R 80:80 /data/www/Data; test -w /data/www/Web/_Resources'
sfi84_stage_flow flow:cache:flush --force
sfi84_stage_flow doctrine:migrate
sfi84_stage_flow node:migrationstatus
# Execute this only when the preceding status shows it is not applied:
sfi84_stage_flow node:migrate 20190304111200
docker exec sfi84-db-1 sh -ec 'export MYSQL_PWD="$MYSQL_ROOT_PASSWORD"; mysql -uroot -Nse "SELECT COUNT(*) FROM neos_contentrepository_domain_model_nodedata" "$MYSQL_DATABASE"' > backups/stage-node-count-after.txt
diff -u backups/stage-node-count-before.txt backups/stage-node-count-after.txt
sfi84_stage_flow flow:session:destroyall
sfi84_stage_flow domain:list
# Confirm the cloned site's node name is sfi, then add the staging binding:
sfi84_stage_flow domain:add sfi next.sfi.ru --scheme https
sfi84_stage_flow resource:publish --collection static
sfi84_stage_flow flow:cache:warmup
sfi84_stage up -d web
docker exec --user 80 sfi84-web-1 /data/www/cron-hourly
```

Capture migration output and timing in protected release logs. Compare table/content-node counts before and after; confirm no pending Doctrine migrations and the node migration's applied status. Do not run `node:repair`, content export/import, resource cleanup, or event-sourced repository commands.

## Acceptance on next.sfi.ru

```bash
# Server: TLS verification must pass without --insecure.
curl --silent --show-error --output /dev/null --write-out '%{http_code}\n' https://next.sfi.ru/
# Expect 401 without authentication.
curl --fail --silent --show-error --netrc-file "$SFI_RUN/stage.netrc" -I https://next.sfi.ru/
curl --fail --silent --show-error --netrc-file "$SFI_RUN/stage.netrc" \
  https://next.sfi.ru/about/sveden/common.html > backups/stage-common.html
docker exec sfi84-web-1 nginx -t
docker exec --user 80 sfi84-web-1 sfi-flow node:migrationstatus
docker logs --since 15m sfi84-web-1 > backups/stage-container.log 2>&1
```

Check HTTPS, HTTP authentication, noindex and mail capture before giving staging access to editors. Store/share the staging HTTP password through the agreed private channel; it is in the protected server netrc file and is not committed or printed in this runbook. Payment widgets and API access keep their production configuration, with no staging CSP or hostname blocking. A separate payment sandbox/rehearsal is not a release gate for this upgrade.

Run these checks and record results before scheduling cutover:

1. Fresh browser comparison of all 15 disclosure sections against production, with particular attention to `common.html`. Compare ordered `itemprop` attributes, values and nesting; `itemscope`/`itemtype`; table cells and spans; document URLs; `data-signature` payloads; and the cached education route. Normalize only expected site-hostname changes; S3 resource URLs should remain unchanged. The earlier comparison script caches production HTML and hardcodes localhost: adapt it for authenticated `next.sfi.ru` and recapture production rather than reusing September results.
2. Standard inspector/property editing on representative news, study-program, person, journal and fundraising pages. No separate PropsEditor application was found; if one exists outside this repository, its URL/repository remains an input.
3. Save/reload/publish/discard on a disposable disclosure page: no-change save must preserve existing markup; add/change/remove itemprop, signatures and footnotes; verify stored values and visitor DOM. Include paste, table spans and undo/redo.
4. Quick creation, templates, History, bookmarklet, Russian/English dimensions, roles, media upload/crop/replace, newsletter preview and captured fixture mail. Use the editorial checks in the existing [acceptance matrix](Neos-8.4-go-live.md) and [editor QA evidence](Neos-8.4-editor-qa.md), with the simplified storage and payment scope above.
5. Restart/recreate the staging web container and verify uploaded resources, signing-key behavior, login and published content survive. Confirm the hourly education refresh. Check redirects, canonical URLs, cookies, logs and proxy headers.
6. Verify one previously issued signed link/token locally without invoking a real unsubscribe/payment mutation. `/umo` and `/docs` file-dependent checks remain deferred, as requested.

```bash
# Approved staging replacement test, retaining all its volumes:
sfi84_stage up -d --force-recreate --no-deps web
curl --fail --silent --show-error --netrc-file "$SFI_RUN/stage.netrc" \
  https://next.sfi.ru/about/sveden/common.html > backups/stage-common-after-recreate.html
```

An editor should complete one real news workflow and one disclosure edit on staging. Prepare the invitation and cutover notice; sending messages requires separate explicit authorization. Editors have already been told not to change production.

## Cutover after approval

Keep the exact tested candidate and runtime credentials. A fresh database volume prevents staging test content/accounts from becoming live; Redis gets a clean volume too. Reuse the same application data and shared resource mounts. The original production database remains untouched.

```bash
python3 - <<'PY'
import pathlib
p = pathlib.Path.cwd()
values = dict(line.split('=', 1) for line in (p / 'stage.env').read_text().splitlines() if line)
values.update(SFI_DB_VOLUME='sfi84_release_db', SFI_REDIS_VOLUME='sfi84_release_redis', SFI_SETTINGS_FILE=str(p/'Settings.live.yaml'), SFI_REDIRECTS_DIR=str(p/'redirects.live'))
(p/'release.env').write_text(''.join(k+'='+v+'\n' for k,v in values.items()))
(p/'release.env').chmod(0o600)
PY
sfi84_maintenance up -d
test "$(curl --silent --show-error --output /dev/null --write-out '%{http_code}' https://sfi.ru/)" = 503

# Preserve the tested staging database before replacing its containers.
docker exec sfi84-db-1 sh -ec 'export MYSQL_PWD="$MYSQL_ROOT_PASSWORD"; exec mysqldump -uroot --single-transaction --quick --routines --events --triggers "$MYSQL_DATABASE"' | gzip > backups/stage-accepted.sql.gz
gzip -t backups/stage-accepted.sql.gz
sfi84_stage stop
docker update --restart=no sfidistr-web-1
docker stop sfidistr-web-1
docker exec sfidistr-db-1 sh -ec 'export MYSQL_PWD="$MYSQL_ROOT_PASSWORD"; exec mysqldump -uroot --single-transaction --quick --routines --events --triggers "$MYSQL_DATABASE"' | gzip > backups/cutover.sql.gz.part
gzip -t backups/cutover.sql.gz.part
mv backups/cutover.sql.gz.part backups/cutover.sql.gz
sha256sum backups/cutover.sql.gz > backups/cutover.sql.gz.sha256

export SFI_ENV="$SFI_RUN/release.env"
sfi84_live config --quiet
for volume in sfi84_release_db sfi84_release_redis; do
  if docker volume inspect "$volume" >/dev/null 2>&1; then
    echo "Refusing to reuse existing volume: $volume" >&2; exit 1
  fi
  docker volume create "$volume"
done
sfi84 up -d --force-recreate db redis
for attempt in {1..30}; do
  docker exec sfi84-db-1 sh -ec 'export MYSQL_PWD="$MYSQL_ROOT_PASSWORD"; mysqladmin -uroot ping --silent' >/dev/null 2>&1 && break
  sleep 2
done
docker exec sfi84-db-1 sh -ec 'export MYSQL_PWD="$MYSQL_ROOT_PASSWORD"; mysqladmin -uroot ping --silent'
test "$(docker inspect -f '{{range .Mounts}}{{if eq .Destination "/var/lib/mysql"}}{{.Name}}{{end}}{{end}}' sfi84-db-1)" = sfi84_release_db
test "$(docker exec sfi84-db-1 sh -ec 'export MYSQL_PWD="$MYSQL_ROOT_PASSWORD"; mysql -uroot -Nse "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema=DATABASE()" "$MYSQL_DATABASE"')" = 0
gzip -dc backups/cutover.sql.gz | docker exec -i sfi84-db-1 sh -ec 'export MYSQL_PWD="$MYSQL_ROOT_PASSWORD"; exec mysql -uroot "$MYSQL_DATABASE"'
sfi84 run --rm --no-deps --label traefik.enable=false --entrypoint sh web -ec \
  'mkdir -p /data/www/Data; chown -R 80:80 /data/www/Data; test -w /data/www/Web/_Resources'
sfi84_flow flow:cache:flush --force
sfi84_flow doctrine:migrate
sfi84_flow node:migrationstatus
# Only if not already applied:
sfi84_flow node:migrate 20190304111200
sfi84_flow flow:session:destroyall
sfi84_flow domain:list
# This is a fresh production clone: confirm sfi.ru/www.sfi.ru resolve to the existing site.
sfi84_flow resource:publish --collection static
sfi84_flow flow:cache:warmup
sfi84_live up -d --force-recreate --no-deps web
docker exec --user 80 sfi84-web-1 /data/www/cron-hourly
```

While maintenance is active, test the candidate directly from inside its container with the production Host and forwarded HTTPS headers. For a full browser pass before opening traffic, use an SSH tunnel to the candidate's current private IP; do not publish a new server port. Confirm the HTTPS/proxy behavior during staging and repeat immediately after maintenance is removed.

```bash
docker exec sfi84-web-1 curl --fail --silent --show-error \
  -H 'Host: sfi.ru' -H 'X-Forwarded-Proto: https' \
  http://127.0.0.1/about/sveden/common.html > backups/release-common.html
docker exec sfi84-web-1 nginx -t
docker logs --since 10m sfi84-web-1 > backups/cutover-container.log 2>&1

# Rollback rehearsal while public traffic still sees maintenance.
sfi84_live stop web
docker start sfidistr-web-1
curl --fail --silent --show-error --retry 15 --retry-connrefused --retry-delay 2 --retry-max-time 60 \
  -H 'Host: sfi.ru' -H 'X-Forwarded-Proto: https' \
  http://127.0.0.1:32784/about/sveden/common.html > backups/rollback-rehearsal-common.html
docker stop sfidistr-web-1
sfi84_live start web
# Wait for successful internal HTTP checks, then remove maintenance:
docker exec sfi84-web-1 curl --fail --silent --show-error -H 'Host: sfi.ru' \
  http://127.0.0.1/about/sveden/common.html > backups/release-common-after-rehearsal.html
sfi84_maintenance stop
curl --fail --silent --show-error -I https://sfi.ru/
curl --fail --silent --show-error https://sfi.ru/about/sveden/common.html > backups/live-common.html
curl --silent --show-error -I https://www.sfi.ru/
```

Confirm the new container receives the public requests, the hostname redirect is correct, no staging authentication/noindex policy is present on production, and existing resources/signed links work. Repeat the disclosure and representative page checks. Keep the editorial pause for these initial checks. If any gate fails, execute the rollback branch below rather than opening editing.

## Preserve the exact old runtime

With `sfidistr-web-1` stopped, snapshot its writable layer. The original image alone is insufficient because live code was updated inside this container. Docker commit excludes mounted volumes, so separately archive the shared `_Resources` volume at this point. Existing `/docs` and `/umo` bind directories remain in place.

```bash
test "$(docker inspect -f '{{.State.Running}}' sfidistr-web-1)" = false
docker commit sfidistr-web-1 sfi-rollback:pre-neos84-20261023
docker image save sfi-rollback:pre-neos84-20261023 | gzip > backups/original-runtime.tar.gz.part
gzip -t backups/original-runtime.tar.gz.part
mv backups/original-runtime.tar.gz.part backups/original-runtime.tar.gz
docker run --rm --network none --entrypoint tar \
  -v 07d9f1a9ffed77be7ed1ec7b9e1bfb0967efe9466dd1784e38dffefac806f2a8:/source:ro \
  "$SFI_IMAGE" -C /source -czf - . > backups/original-web-resources.tar.gz
gzip -t backups/original-web-resources.tar.gz
sha256sum backups/original-runtime.tar.gz backups/original-web-resources.tar.gz > backups/original-runtime.sha256
```

The runtime archive contains secrets and the preserved database files; keep it private. Make an independent off-host copy before deleting the original containers. A concrete option is copying `backups/` to an owner-only directory on the workstation, with sufficient free space, and checking the recorded hashes there:

```bash
# Workstation:
umask 077
mkdir -p "$HOME/sfi84-private-backup-20261023"
rsync -a server.psmb.ru:/mnt/vol2/docker/sfi84-20261023/backups/ \
  "$HOME/sfi84-private-backup-20261023/"
```

## Rollback during the trial

These are the proposed emergency commands, to be executed after the approved rollback decision. The old database is still original. S3 and mounted files remain shared; this rollback does not undo changes to them. Preserve the upgraded database first, even with the editorial pause; do not import it into the old application.

```bash
export SFI_ENV="$SFI_RUN/release.env"
sfi84_maintenance up -d
sfi84_live stop web
SFI_ROLLBACK_TIME=$(date -u +%Y%m%dT%H%M%SZ)
docker exec sfi84-db-1 sh -ec 'export MYSQL_PWD="$MYSQL_ROOT_PASSWORD"; exec mysqldump -uroot --single-transaction --quick --routines --events --triggers "$MYSQL_DATABASE"' \
  | gzip > "backups/upgrade-before-rollback-$SFI_ROLLBACK_TIME.sql.gz"
gzip -t "backups/upgrade-before-rollback-$SFI_ROLLBACK_TIME.sql.gz"
docker start sfidistr-web-1
curl --fail --silent --show-error --retry 15 --retry-connrefused --retry-delay 2 --retry-max-time 60 \
  -H 'Host: sfi.ru' -H 'X-Forwarded-Proto: https' \
  http://127.0.0.1:32784/about/sveden/common.html > backups/rollback-common.html
docker update --restart=always sfidistr-web-1
sfi84_maintenance stop
curl --fail --silent --show-error -I https://sfi.ru/
```

If the new database is unavailable, preserve its volume and logs and decide whether immediate old-site recovery takes precedence over obtaining the logical dump; do not let a failed dump silently prevent recovery. Resume only the old deployment's reviewed automation. Any content created after editors resume needs reconciliation before an old-version rollback; no automatic reverse migration or database replay is assumed.

## Observe for several days

Check errors, disclosure markup, login/publishing, resource generation, education refresh and the enabled integrations after launch and after the first editorial session. Keep both database generations, all backups and the stopped original web container. Monitoring is a release activity; this plan has not created a recurring automation.

Take dated backups of the upgraded database using the same in-container dump pattern. Do not inherit the old fixed S3 backup destination. Verify a restore into a disposable volume before retiring the old runtime; schedule the new backup command through the existing site-specific backup mechanism once that mechanism has been identified. This is a required retirement gate, not a reason to turn on the legacy `syncAll.sh` job.

The restore rehearsal uses a standalone database with no network or application attached. After approval, create its uniquely named volume and leave it available for inspection; cleanup can be included in the later retirement list.

```bash
docker exec sfi84-db-1 sh -ec 'export MYSQL_PWD="$MYSQL_ROOT_PASSWORD"; exec mysqldump -uroot --single-transaction --quick --routines --events --triggers "$MYSQL_DATABASE"' | gzip > backups/restore-rehearsal.sql.gz
gzip -t backups/restore-rehearsal.sql.gz
python3 - <<'PY'
from pathlib import Path
p = Path.cwd()
values = dict(line.split('=',1) for line in (p/'release.env').read_text().splitlines() if line)
(p/'restore-check.env').write_text('MYSQL_DATABASE=db\nMYSQL_ROOT_PASSWORD='+values['SFI_DB_ROOT_PASSWORD']+'\n')
(p/'restore-check.env').chmod(0o600)
PY
if docker volume inspect sfi84_restore_check_db >/dev/null 2>&1; then
  echo 'Restore-check volume already exists; inspect before proceeding' >&2; exit 1
fi
docker volume create sfi84_restore_check_db
docker run -d --name sfi84-restore-check --network none --label traefik.enable=false \
  --env-file "$SFI_RUN/restore-check.env" -v sfi84_restore_check_db:/var/lib/mysql \
  mariadb@sha256:a25e7c87fe20c6d035fe81003937a8d732574ecf54466d0294da3423b64af80c
for attempt in {1..30}; do
  docker exec sfi84-restore-check sh -ec 'export MYSQL_PWD="$MYSQL_ROOT_PASSWORD"; mysqladmin -uroot ping --silent' >/dev/null 2>&1 && break
  sleep 2
done
docker exec sfi84-restore-check sh -ec 'export MYSQL_PWD="$MYSQL_ROOT_PASSWORD"; mysqladmin -uroot ping --silent'
gzip -dc backups/restore-rehearsal.sql.gz | docker exec -i sfi84-restore-check sh -ec 'export MYSQL_PWD="$MYSQL_ROOT_PASSWORD"; exec mysql -uroot "$MYSQL_DATABASE"'
docker exec sfi84-restore-check sh -ec 'export MYSQL_PWD="$MYSQL_ROOT_PASSWORD"; mysqlcheck -uroot --check "$MYSQL_DATABASE"'
docker stop sfi84-restore-check
```

Compare restored table/content counts with the backup snapshot. Repeat the same restore with the off-host copy before deleting the only original runtime. The restored test database must never be connected to production web traffic.

## Adopt into Spaas after the trial

`spaas` has no per-project argument parser: invoking `spaas SfiDistr` would still process its configured repository set. It reads `master/docker-compose.yml`, compares cached file text, and uses Compose with `--force-recreate`; it does not explicitly pull the image. Use the scoped Compose command below for this handoff and leave its cache equal to the reviewed canonical repository file.

First publish the **existing tested image**, under a unique candidate tag, and pin its registry digest. Registry access is a prerequisite; do not overwrite the `master` tag as a staging shortcut.

```bash
# Server, after registry-push approval and authentication:
SFI_TAG=$(cat candidate-tag)
SFI_REGISTRY_TAG="ghcr.io/psmb/sfidistr:${SFI_TAG#sfi-candidate:}"
docker tag "$SFI_IMAGE" "$SFI_REGISTRY_TAG"
docker push "$SFI_REGISTRY_TAG"
docker pull "$SFI_REGISTRY_TAG"
SFI_DIGEST=$(docker image inspect "$SFI_REGISTRY_TAG" --format '{{index .RepoDigests 0}}')
test -n "$SFI_DIGEST"
export SFI_DIGEST

# Generate a secret-free, standalone Compose document for master/docker-compose.yml.
python3 - <<'PY'
import json, os, pathlib
p = pathlib.Path.cwd()
base = json.loads((p/'compose.json').read_text())
live = json.loads((p/'live.json').read_text())
base['services']['web']['labels'].update(live['services']['web']['labels'])
base['services']['web']['image'] = os.environ['SFI_DIGEST']
(p/'spaas-candidate.yml').write_text(json.dumps(base, indent=2)+'\n')
PY
docker compose --env-file "$SFI_RUN/release.env" -p sfidistr -f "$SFI_RUN/spaas-candidate.yml" config --quiet
```

All volume names are explicit: the release database and Redis, the candidate's existing application-data volume, and the shared production resource volume. Paths for settings, credentials and redirects are absolute through `SFI_RUN`; they remain valid when Spaas reads the file from `/var/cache/spaas`. Copy the generated file to the upgrade branch as `docker-compose.yml`, review and commit it, then push the branch and obtain merge approval. Do not merge while Spaas or another updater could consume an intermediate configuration. Verify the approved file on `master` is byte-identical to the one installed in the cache.

```bash
# Workstation, after reviewing the generated deployment file:
cd /Users/dimaip/psmb/SfiDistr-neos84
scp server.psmb.ru:/mnt/vol2/docker/sfi84-20261023/spaas-candidate.yml docker-compose.yml
git diff -- docker-compose.yml
git add docker-compose.yml
git commit -m 'Deploy the tested Neos 8.4 image with persistent release volumes'
git push -u origin dimaip/upgrade-neos-8-4
# Merge through the reviewed repository process after explicit approval.
```

The final master merge uses the repository's reviewed merge process; its PR identity and exact merge command depend on the PR created at that point. The deployment image stays pinned to the already tested registry digest, even if the master workflow builds another image.

Only after the rollback archive and off-host backup are verified, install the approved Compose/environment files. These writes and the following `--force-recreate` replace the original `sfidistr` services and are the final destructive approval boundary. Renaming containers would not avoid replacement because Compose identifies them by project/service labels.

```bash
# Server: use the operator's approved sudo access for root-owned configuration.
cp /var/cache/spaas/SfiDistr.yml backups/spaas-before-adoption.yml
cp /mnt/vol2/docker/secrets/SfiDistr.env backups/spaas-before-adoption.env
sfi84_maintenance up -d
docker exec sfi84-db-1 sh -ec 'export MYSQL_PWD="$MYSQL_ROOT_PASSWORD"; exec mysqldump -uroot --single-transaction --quick --routines --events --triggers "$MYSQL_DATABASE"' | gzip > backups/before-spaas-adoption.sql.gz
gzip -t backups/before-spaas-adoption.sql.gz

# Stop the trial database before another MariaDB process mounts the same volume.
sfi84_live stop web db redis
sudo install -m 600 "$SFI_RUN/release.env" /mnt/vol2/docker/secrets/SfiDistr.env
sudo install -m 644 "$SFI_RUN/spaas-candidate.yml" /var/cache/spaas/SfiDistr.yml
sudo docker compose -f /var/cache/spaas/SfiDistr.yml \
  --env-file /mnt/vol2/docker/secrets/SfiDistr.env -p sfidistr up -d --force-recreate
docker inspect -f '{{range .Mounts}}{{if eq .Destination "/var/lib/mysql"}}{{.Name}}{{end}}{{end}}' sfidistr-db-1
# Must print sfi84_release_db. Confirm sfi84-db-1 remains stopped.
docker exec --user 80 sfidistr-web-1 sfi-flow node:migrationstatus
docker exec sfidistr-web-1 curl --fail --silent --show-error -H 'Host: sfi.ru' \
  http://127.0.0.1/about/sveden/common.html > backups/spaas-common.html
docker exec --user 80 sfidistr-web-1 /data/www/cron-hourly
sfi84_maintenance stop
curl --fail --silent --show-error -I https://sfi.ru/
```

If adoption fails, keep maintenance active, stop the new canonical `sfidistr` services, and restart `sfi84` using `release.env` and `live.json`. Those stopped trial containers remain available and use the same upgraded volumes. Never start both database containers against the same volume. Revert the Spaas cache to the reviewed safe configuration and keep its automation suspended until the failure is understood.

```bash
# Adoption-failure branch only:
sudo docker compose -f /var/cache/spaas/SfiDistr.yml \
  --env-file /mnt/vol2/docker/secrets/SfiDistr.env -p sfidistr stop web db redis
sfi84_live start db redis
# Wait for database readiness, then:
sfi84_live start web
docker exec sfi84-web-1 curl --fail --silent --show-error -H 'Host: sfi.ru' \
  http://127.0.0.1/about/sveden/common.html > backups/adoption-rollback-common.html
sfi84_maintenance stop
```

After successful adoption, repeat browser/login/publish/asset/disclosure checks and enable the reviewed SFI backup/automation arrangement. Keep the trial containers until this verification passes. Remove only their stopped containers, without volumes:

```bash
test "$(docker inspect -f '{{.State.Running}}' sfi84-web-1)" = false
test "$(docker inspect -f '{{.State.Running}}' sfi84-db-1)" = false
test "$(docker inspect -f '{{.State.Running}}' sfi84-redis-1)" = false
docker rm sfi84-web-1 sfi84-db-1 sfi84-redis-1
```

The canonical Compose replacement already retired the original `sfidistr` containers. Retain `sfidistr_db-data`, the rollback image/archive and dated backups for an agreed period; 30 days is proposed. Their later deletion needs a separate exact list and approval. The shared resource volume, S3 prefixes and document directories remain active production storage and are not retirement targets. Never use `down -v`, `docker system prune`, delete shared document directories, or run unrestricted S3 deletion as part of this rollout.

Traefik routing, authentication and header labels follow the [Traefik 1.7 Docker backend documentation](https://doc.traefik.io/traefik/v1.7/configuration/backends/docker/). No DNS change or global proxy restart is required.
