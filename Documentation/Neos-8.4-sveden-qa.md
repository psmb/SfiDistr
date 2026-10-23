# Neos 8.4 disclosure QA — 21 September 2026

## Result

All 15 sections linked from [Основные сведения](https://sfi.ru/about/sveden/common.html) match production after restoring today's dump and migrating to Neos 8.4.7 / Flow 8.4.4. The classic content repository remains in use. Production was not modified.

Browser comparisons match **2,910 `itemprop` elements, 35 tables and 4,498 signed-document link occurrences** inside the main content. Both sites returned HTTP 200 for all 15 pages, and neither produced JavaScript exceptions during the page sweep. No content-template or itemprop-plugin correction was needed for these comparisons.

The rehearsal found and fixed one container regression: the project cron scripts were no longer scheduled after replacing the old base image. This would leave the public cached education page absent or stale. The image now runs the existing minute/hourly scripts as the web user. Education refreshes replace the file atomically and retain the last successful page after an HTTP/network failure. A missing cache temporarily redirects to the dynamic education page. The newsletter command remains commented out.

## Database rehearsal

- Source: `db.sql`, 2,678,070,142 bytes, dump footer `2026-09-21 06:26:14`.
- SHA-256: `bcdecce1bed92b210c94c80525931a7d106460935fcb6c21ce4a3ac901604633`.
- Restored into a new local database, `sfi_neos84_current`; the previous test database and original checkout database were retained.
- Applied eight pending Doctrine migrations and node migration `20190304111200`; no pending Doctrine migrations remain.
- Node records: **60,451 → 60,450**. The sole removed record was already marked `removed=1` in `user-dimaip`, an obsolete `Neos.NodeTypes:Html` node. It was framework cleanup, not lost published content.
- Live-workspace records: **59,898 → 59,898**. A direct join against a separately restored baseline found no changes to any surviving node's properties, path, identifier or workspace. Only the expected stock node-type namespaces changed.
- Signature records: **3,311 → 3,311**. Persistent-resource records: **87,323 → 87,323**.
- Local delivery used PHP 8.3, Nginx and Redis 3.2 in the production subcontext. Mail used the null transport. Public resource URLs pointed at the existing public asset endpoint; resource writes remained local.

## Section coverage

Counts below describe the rendered browser DOM inside `main`, including nested and repeated attributes; they are not counts of distinct itemprop names. Education was checked both at the live cached route and its dynamic source, which matched each other.

| Section | Itemprop elements | Tables | Signature links | Comparison |
|---|---:|---:|---:|---|
| Основные сведения | 26 | 3 | 0 | Match |
| Структура и органы управления образовательной организацией | 197 | 4 | 28 | Match |
| Документы | 24 | 0 | 31 | Match |
| Образование | 1115 | 10 | 4379 | Match |
| Образовательные стандарты и требования | 10 | 0 | 0 | Match |
| Руководство | 25 | 3 | 0 | Match |
| Педагогический состав | 1038 | 3 | 0 | Match |
| Материально-техническое обеспечение и оснащенность образовательного процесса. Доступная среда | 103 | 5 | 12 | Match |
| Стипендии и меры поддержки обучающихся | 10 | 1 | 0 | Match |
| Платные образовательные услуги | 66 | 0 | 43 | Match |
| Финансово-хозяйственная деятельность | 14 | 2 | 3 | Match |
| Вакантные места для приема (перевода) обучающихся | 261 | 1 | 1 | Match |
| Международное сотрудничество | 9 | 1 | 0 | Match |
| Организация питания в образовательной организации | 12 | 2 | 1 | Match |
| Полезная информация | 0 | 0 | 0 | Match |

For every section, the comparison checked:

- Itemprop names, element tags, values, nesting and associated links; raw HTML attributes as well as the browser's parsed DOM.
- Table cell values and order, header/data cells, row/column spans and row counts.
- Full main-content text and document URLs, normalizing only local origins, resource delivery prefixes and whitespace.
- All signature metadata before JavaScript and the decoded `docs.sfi.ru` link payloads and tooltips after JavaScript. All 4,498 occurrences decoded successfully and retained the same sign keys and source URLs.

The sole normalized link difference was `/sveden/education#SubSectionMenu` in Neos 8.4, where production omitted the fragment. The target section exists. Content, documents and microdata are unchanged.

## Browser and document checks

- Common-information screenshots at 1440×1000 and 390×844 were byte-identical to production. Both had no page-level horizontal overflow.
- The mobile education-table screenshot was also byte-identical. A representative disclosure expander opened from height 0 to 2725.5 px at full opacity, then closed again on both sites. Both rendered 172 expanders.
- The visually impaired stylesheet switch activated and restored the normal view on both sites, preserving the common page's 26 itemprop elements. Accessible-view screenshots matched byte for byte.
- Twenty-four sampled source PDFs, including licence/accreditation and one from every UMO document category, returned HTTP 200 with `application/pdf`. One actual signed-document service request also returned HTTP 200 / PDF.
- The upgraded signature registry successfully looked up the charter's node key and displayed the matching signatory and position.
- Six compatibility tests passed, with 15 assertions.

## Cached education route

The rebuilt image's web-user crontab contains both project jobs, and Nginx configuration validation passes. With no cached file, `/sveden/education.html` returns a temporary, relative redirect to the dynamic page, preserving the external scheme and port behind a proxy. Running `./cron-hourly` then creates a readable HTML file and the cached route returns HTTP 200 with the same disclosure markup. Forced connection and HTTP 500 failures return a nonzero exit code, leave the previous file unchanged, and remove the temporary file.

## Limits and existing findings

The dump does not contain the separately mounted `Web/umo` and `Web/docs` files. Their generated URLs and signatures matched, and production downloads were sampled, but a staging deployment must retain those mounts and verify local file access there. This run did not regenerate thousands of signed PDFs or test editing, uploads, SMTP or payments.

Both production and the upgraded site reported the same existing missing Slick assets: `Built/ajax-loader.gif`, `Built/fonts/slick.woff` and `Built/fonts/slick.ttf`. No new JavaScript exceptions appeared. This report establishes parity with the live disclosure sections; it is not an independent review of their statutory content requirements.

## Evidence and repeatability

Local evidence is in `output/playwright/sveden-qa/` (ignored by Git): page inventories, raw HTML, normalized JSON, browser DOM hashes, screenshots, migration logs, database counts, PDF responses and compatibility-test output. `compare.py` captures and compares the 16 HTTP sources; the browser capture scripts cover the 15 visitor-facing sections. The files contain copies of public page content, not the database dump.

The new deployment sequence is documented in [Neos-8.4-upgrade.md](Neos-8.4-upgrade.md), including an explicit initial `./cron-hourly` refresh.
