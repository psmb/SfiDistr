#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/../.."
export PHP_INI_SCAN_DIR="${PHP_INI_SCAN_DIR:-}:$(pwd)/Build/Tests/PhpIni"
php bin/phpunit --bootstrap Packages/Libraries/autoload.php Build/Tests/Unit
php bin/phpunit -c Build/Tests/FunctionalTests.xml
