#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/../.."
for extension in \
    Packages/Sites/Sfi.Sfi/Resources/Private/Itemprop \
    DistributionPackages/Psmb.Footnote/Resources/Private/Footnotes \
    DistributionPackages/Psmb.Newsletter/Resources/Private/NewsletterView \
    DistributionPackages/Psmb.CreateNodeButton/Resources/Private/CreateNodeView \
    DistributionPackages/Psmb.Bookmarklet/Resources/Private/Bookmarklet \
    DistributionPackages/AE.History/Resources/Private/JavaScript/NodeInfoView; do
    (cd "$extension" && npm ci --no-audit --no-fund && NODE_ENV=production NODE_OPTIONS=--openssl-legacy-provider npm run build)
done
node --test Build/Tests/JavaScript/newsletter.test.cjs
