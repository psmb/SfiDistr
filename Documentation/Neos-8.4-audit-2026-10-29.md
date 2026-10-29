# Neos 8.4 upgrade audit

Audit date: 29 October 2026. Production source at audit start: `4d0355e47f0e7d70137fe519dd12b6becfae5e38`, including the deployed announcement-cache correction in PR #65. The additional changes below are prepared on `dimaip/neos-upgrade-audit`; they are not deployed by this audit.

The announcement incident exposed a gap in the original acceptance checks: publication of an existing page was tested, but publication did not have to invalidate an already-cached list before acceptance. Neos 8.0 explicitly removed legacy cache tags. The code migration converted common handwritten tag strings, but the custom calls to `nodeTypeTag` still omitted the context node. The initial review did not catch that remaining manual requirement. PR #65 corrected all 20 custom calls and added 40 regression cases covering live and editor workspaces.

This follow-up compares the 13 official upgrade guides from Neos 4.3 through 8.4, the 20 available Neos and Flow release-note documents for the intermediate versions, the custom integration code, the current lock file, and live migration/mapping status. It does not treat successful page rendering as proof of editorial or external-integration behavior.

## Additional corrections

### Promo rendering

`Sfi.Sfi:PromoList` still assigned `collection` to `Neos.Neos:ContentCollectionRenderer`. Neos 8.0 removed that compatibility property; the renderer reads `items` and otherwise enumerates the current node's children. The list can therefore ignore promos found elsewhere in the site. The correction uses `items`, consistent with the existing detail-page `content.items` filter.

The functional regression renders the real promo-list prototype with a promo outside an otherwise empty current page. It fails with an empty list before the correction and passes afterward. This proves the rendering defect; it does not establish that a currently visible homepage section uses the promo list.

### Homepage site type

`Sfi.Sfi:PageMain` did not extend `Neos.Neos:Site`, which the Neos 8.4 release instructions require for homepage types. The sites module now uses that marker to select types offered when creating a site. Existing pages can still render without it. Adding the abstract supertype restores recognition of the homepage in that administration workflow without changing stored node data.

The functional regression checks the merged homepage type through the framework's `NodeTypeManager`; it fails before the correction and passes afterward.

### SVG sanitizer security update

The deployed lock file selected `enshrined/svg-sanitize` 0.22.0. The production dependency audit reports three medium-severity advisories affecting that version: [stored XSS through DTD entities](https://github.com/darylldoyle/svg-sanitizer/security/advisories/GHSA-9rjx-3jch-6vjf), [SVG reference nesting denial of service](https://github.com/darylldoyle/svg-sanitizer/security/advisories/GHSA-m9xh-6747-9r6f), and [DTD attribute declaration denial of service](https://github.com/darylldoyle/svg-sanitizer/security/advisories/GHSA-v383-3rw5-q8rf). Upstream identifies 1.0.0 as the patched version. The stored-XSS case requires inline rendering of sanitized SVG; this audit establishes an affected dependency, not exploitation of the site.

The lock update uses sanitizer 1.0.0 and the compatible Neos 8.4.8 patch released on 5 October 2026. The Neos packages require matching patch versions, so 15 Neos packages move from 8.4.7 to 8.4.8. Flow remains 8.4.4 and Neos UI remains 8.4.4. The root constraint now requires at least Neos 8.4.8. There is no Neos 9 or event-sourced repository migration.

The sanitizer regression reproduces the published entity-resolution bypass against 0.22.0 and passes against 1.0.0; a separate case preserves ordinary SVG geometry. `composer audit --locked --no-dev --abandoned=ignore` reports no security advisories for the new lock file and is now a required CI step. Abandoned-package notices for Swiftmailer, Doctrine annotations/cache, and Behat transliterator remain maintenance items; the audit command does not suppress security advisories for them.

Neos 8.4.8's own tests use PHPUnit 10 attributes. Testing configuration excludes those upstream test namespaces from reflection while continuing to run this distribution's PHPUnit 9 suite. Production class inclusion is unchanged.

## Release compatibility checks

| Upgrade area | Result |
| --- | --- |
| Neos 4.3 to 5.0 prototype generators and extracted stock node types | Local content/document generators are present; migration `20190304111200` is recorded as applied on production. |
| Flow 6 HTTP transition | Custom request construction uses PSR-7 and `ActionRequest::fromHttpRequest`; the newsletter host/port/base-path regression passes. No remaining uses of removed HTTP request/response classes or component-chain APIs were found in custom source. |
| Flow 6 logging and Doctrine object management | Custom logging uses PSR-3; entity-manager injections use the canonical ORM interface. Logger resolution and legacy redirect-query regressions pass. |
| Neos 5.1 and 5.2 asset-source interface changes | No custom asset-source or tagging-interface implementation needs the added methods. Event-sourced repository interface changes do not apply. |
| Neos 5.3 persistence and HTTP browser argument changes | The custom publication signal still uses persistence explicitly; earlier editor acceptance covered first publication. No custom `Browser` request-argument adaptation was found. Newsletter regressions remain in the suite. |
| Neos 7 prototype-generator and Aloha removals | Project-owned generators replace removed defaults. Active node definitions use `inline.editorOptions`; no remaining legacy `aloha` configuration was found. |
| Flow 7 middleware, routing and interface changes | No custom HTTP components, password-hashing strategy, value object, persistence-interface implementation, or parameter-aware route handler requires manual replacement. Custom URI generation still uses supported interfaces. |
| Flow 7.1 rewrite defaults and cookies | The container explicitly enables rewritten URLs. The recorded HTTPS acceptance confirms secure, HttpOnly, SameSite=Lax CMS cookies; that authenticated browser test was not repeated in this read-only follow-up. |
| Flow 7.2 configuration and AOP changes | No custom configuration-loader registration or AOP property introduction uses the changed interfaces. Existing aspects compile in the functional suite. |
| Neos 7.3 breadcrumb and class-array changes | No reverse-order breadcrumb workaround or string processor on the changed collection/body class arrays was found. Explicit class strings remain supported. |
| Neos 8 Fusion parser and renderer changes | No namespace aliases remain. The remaining deprecated `Neos.Fusion:Array` and `Collection` aliases in the History integration still exist in 8.4 and are a later-version maintenance item. The promo renderer's removed `collection` override is corrected here. |
| Neos and Flow 8 cache changes | No handwritten legacy content tags remain in custom Fusion. The 20 node-type tags have workspace context. Redis 7.4 is deployed with the built-in backend; this satisfies the `UNLINK` requirement that Redis 3.2 did not meet. The live/editor invalidation regressions pass. |
| Neos 8.1 and 8.2 renderer and UI changes | Existing raw-content and lazy-prop behavior requires no additional custom API adaptation. All six custom editor bundles were already rebuilt with the 8.4.4 Webpack adapter; the existing CI bundle-reproducibility checks remain required. |
| Neos 8.3 parser, UI and session deprecations | No custom parser subclass or session garbage-collector override depends on removed behavior. Plow.js and PluginViews deprecations concern Neos 9; they are not treated as current failures. |
| Neos 8.4 defaults and site marker | The missing site marker is corrected here. Workspace-preview behavior and hidden legacy site import/creation options are documented new defaults, not silently reset. Optional Neos 9 preparation commands remain out of scope. |
| DBAL 3 and JSON mapping | No custom `json_array` column mapping or remaining removed `Statement::fetchAll` call was found. The legacy redirect resolver already uses the current result API. Live ORM mapping validation passes. |
| Schema and content migration status | Production reports 157 executed and available Doctrine migrations, zero unavailable or new migrations, and the required stock-node migration applied. No migration, repair, resource cleanup, or content mutation was run during the audit. |
| Deployment, signing key and background work | The existing persistent-key, scoped deployment, hourly education refresh, and disabled minute-mailer arrangements are retained. Previous cutover evidence covers key preservation and proxy acceptance; this audit does not repeat real email, payment, or signed-file generation. |

## Validation and limits

The isolated PHP 8.3 installation uses the proposed lock file and runs 52 unit tests with 67 assertions and 8 functional tests with 18 assertions. Each new defect test was first shown to fail against the affected implementation or dependency. Test services use mocks, SQLite, file caches, and a null mail transport; functional execution has no network access. ORM mapping validation also passes in an isolated Production context with the patched dependencies and local test storage/cache settings.

The live checks in this audit are read-only. Database/mapping results above are current; previous browser, disclosure, role, storage and integration results remain in the [editor QA](Neos-8.4-editor-qa.md), [staging](Neos-8.4-staging-2026-10-23.md), and [cutover](Neos-8.4-cutover-2026-10-23.md) reports. Real SMTP delivery, payment callbacks, writable S3 operations, the complete move/hide/delete/discard and language-synchronization workflows, and `/docs` or `/umo` file generation have not been newly exercised. They must not be reported as passed by this audit.

Deploying this branch requires installing its locked dependencies or deploying its tested image, followed by the normal Production cache rebuild. A source-only pull would leave sanitizer 0.22.0 installed. Keep the classic repository and existing data/signing-key volumes. Verify the final installed package versions and affected pages after deployment.

## Official sources

- [Neos upgrade instructions](https://docs.neos.io/api/upgrade-instructions), including every listed step from [4.3 to 5.0](https://docs.neos.io/api/upgrade-instructions/4/upgrade-instructions-4-3-5-0) through [8.3 to 8.4](https://docs.neos.io/api/upgrade-instructions/8/upgrade-instructions-8-3-8-4).
- [Neos 8.0 release notes](https://neos.readthedocs.io/en/8.4/Appendixes/ReleaseNotes/800.html), especially removal of legacy cache tags; [7.3 to 8.0 instructions](https://docs.neos.io/api/upgrade-instructions/7/upgrade-instructions-7-3-8-0), including the removed collection-renderer property.
- Neos release-note sources on the official 8.4 branch: [5.2](https://github.com/neos/neos-development-collection/blob/8.4/Neos.Neos/Documentation/Appendixes/ReleaseNotes/520.rst), [7.0](https://github.com/neos/neos-development-collection/blob/8.4/Neos.Neos/Documentation/Appendixes/ReleaseNotes/700.rst), [7.1](https://github.com/neos/neos-development-collection/blob/8.4/Neos.Neos/Documentation/Appendixes/ReleaseNotes/710.rst), [7.2](https://github.com/neos/neos-development-collection/blob/8.4/Neos.Neos/Documentation/Appendixes/ReleaseNotes/720.rst), [7.3](https://github.com/neos/neos-development-collection/blob/8.4/Neos.Neos/Documentation/Appendixes/ReleaseNotes/730.rst), [8.0](https://github.com/neos/neos-development-collection/blob/8.4/Neos.Neos/Documentation/Appendixes/ReleaseNotes/800.rst), [8.1](https://github.com/neos/neos-development-collection/blob/8.4/Neos.Neos/Documentation/Appendixes/ReleaseNotes/810.rst), [8.2](https://github.com/neos/neos-development-collection/blob/8.4/Neos.Neos/Documentation/Appendixes/ReleaseNotes/820.rst), [8.3](https://github.com/neos/neos-development-collection/blob/8.4/Neos.Neos/Documentation/Appendixes/ReleaseNotes/830.rst), and [8.4](https://github.com/neos/neos-development-collection/blob/8.4/Neos.Neos/Documentation/Appendixes/ReleaseNotes/840.rst).
- [Flow release-note sources](https://github.com/neos/flow-development-collection/tree/8.4/Neos.Flow/Documentation/TheDefinitiveGuide/PartV/ReleaseNotes): 6.2, 7.0 through 7.3, and 8.0 through 8.4. The 4.3-to-5.0 Neos guide includes the Flow 6.0 manual changes.
- [Neos 8.4.8 release](https://github.com/neos/neos-development-collection/releases/tag/8.4.8), [changelog](https://github.com/neos/neos-development-collection/blob/8.4/Neos.Neos/Documentation/Appendixes/ChangeLogs/848.rst), and the linked sanitizer advisories.
