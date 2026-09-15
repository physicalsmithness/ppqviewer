# Teacher-reviewed clarification channel

This package adds a private anonymous question queue and teacher-published public Q&A to the existing TeacherViewer workbook. The public response contains no pupil identity fields. Teachers must explicitly review the public question and answer for names or private details before publishing. An appropriate original question may be retained unchanged.

## Deployed state — 12 September 2026

The dedicated owner API is live at script version **19**, deployment `AKfycbygTx2TEpXvqECcWT0mbVhn_Jc_emoT3tk1iKD3EkmgJAv__vSW_oixb8RAlEFyjpRt`. The existing TeacherViewer deployment `AKfycby-X_lJrst0JGPpuBQrQ-t4nAERJL8YOAy3DLaGLkkrbr9qvpoySNc7xmsDDG5HOngZ` is at version **20**. The original pupil writer `AKfycbwQ2NxNi-AWGCpBVDa6nT9DDYsS66F53ENZvtZozDwuWkKaivqgLaGUyjSFd_InJ4Kt` remains unchanged at version **1**. The deployed owner URL is `https://script.google.com/macros/s/AKfycbygTx2TEpXvqECcWT0mbVhn_Jc_emoT3tk1iKD3EkmgJAv__vSW_oixb8RAlEFyjpRt/exec`.

Anonymous GET verification returned a successful empty public list, and the **Questions from pupils** button was visible in TeacherViewer 20. No real request POST or teacher publication was performed. The server, teacher panel and pupil journeys were verified with synthetic services; the live write/answer round trip has not been exercised.

The canonical server, HTML and manifest now include this feature. Their original copies are in `canonical-before-20260912-162000/`; the live deployment still uses the downloaded baseline rather than unrelated unpublished canonical work. Physics client build `e55db219ef0bb748` is published and verified at 15:32 UTC on 12 September 2026, commit `fae202def056b155a801fc2492cc1e301bac351f`. That client sends an empty `source_context` object; it sends no image contents. The broader optional context schema documented below remains a server capability, not the current Physics payload.

## Source and deployment boundaries

`remote-before/` is the downloaded live TeacherViewer source. `pupil-v1-before/` is the actual pinned pupil writer, which has only a 17-column append route and a plain GET banner; it has no teacher read functions. The sibling TeacherViewer repository contains unrelated unpublished work, so deploy the isolated `staged/` copy prepared from the live baseline. `canonical-proposed/` separately preserves that unpublished work and is not the deployment source.

`tools/prepare_teacher_clarifications.js` combines the live baseline, `Clarifications.gs` and `teacher-panel.js`. It adds the public routes, reserves all three help tabs in the new writer, denies those tabs through `tvGetRows`, and removes the effective-user fallback from teacher authentication. The deny must use the sanitized sheet name, including aliases such as `ppq/help/requests`.

Use three deployments of the same script:

1. Keep the existing pupil tracking deployment pinned to its current version and URL.
2. Add a dedicated clarification owner deployment: execute as the deploying owner, anonymous access. This handles public list/status, validated private requests and the signed publication relay.
3. Update the existing teacher deployment: execute as the accessing user, Google-account access. Its allowlisted teachers read the private queue and explicitly publish through the owner relay.

Replace `__OWNER_ENDPOINT__` with the dedicated owner web-app URL when preparing the final teacher source. Keep the existing spreadsheet and email scopes and add `https://www.googleapis.com/auth/script.external_request` for the server-side relay. The prepared manifest is role-specific; do not accidentally apply the teacher manifest to the owner deployment or update the pinned pupil deployment.

No credential or signing secret belongs in source files. Deployment and any real submissions/publications remain separate from the synthetic tests in this package.

## Route integration

At the beginning of `doGet(e)`, call `helpPublicGetOutput_(e && e.parameter || {})`; return its output if non-null. Other requests continue through the existing teacher page route with actual active-user authentication only. At the beginning of `doPost`, parse the JSON and call `helpDoPost_(payload)`; return `jsonOut_(result)` if non-null, otherwise continue the existing tracking route. Add the three help names to `RESERVED_TABS` and explicitly deny their sanitized names through `tvGetRows`.

The module uses existing `isAllowlisted_`, `teacherScope_`, `registryMap_` and `RESERVED_TABS` helpers. These exist in the downloaded live baseline; no unpublished TeacherViewer feature is required. Anonymous clarifications are project-scoped, with existing project or registry-subject grants. Pupil/cohort/class records do not define this channel's scope. Raw workbook sharing remains the existing trust boundary: a teacher with workbook access may read its sheets directly.

## Public API

GET `action=ppq_help_list&project=…&item_id=…` returns `{ok:true,replies:[…]}`. GET `action=ppq_help_status&project=…&request_ids=…` accepts 1–50 comma-separated UUIDs and returns `{ok:true,requests:[{request_id,status}],replies:[…]}`. Status is `pending`, `answered` or `not_found`. Pending text and private context are never returned by these public routes.

Both reads support an optional JSONP `callback` consisting of a single valid JavaScript identifier, at most 64 characters. Dotted paths, expressions and reserved keywords are rejected. JSONP is only available for public routes, with JavaScript MIME type and script-safe JSON escaping.

POST a JSON object with exactly these fields:

```json
{
  "action": "ppq_help_request",
  "request_id": "a fresh UUID retained for retries",
  "project": "ibphysics",
  "item_id": "the current stable source ID",
  "question": "the pupil's private question",
  "source_label": "the source reference",
  "source_url": "https://the-viewer-page/",
  "source_context": {}
}
```

Do not send a client `created_at`, pupil names, roles, class identifiers or teacher fields. The server creates the timestamp. Question text is limited to 4,000 characters, source labels to 400 and URLs to 2,048. `source_context` allows only `id`, `parent_id`, `source_part_id`, `source_group_id`, and arrays `question_images`, `context_images`, `markscheme_images`. Each array has at most 24 HTTPS or safe relative image URLs; total context JSON is at most 24,000 characters. IDs and URLs are validated. Identical retries with the same UUID are idempotent; a changed request must use a new UUID. The result is `{ok:true,request_id,status}` or `{ok:false,error}`.

Public reply fields are exactly `id`, `request_id`, `project`, `item_id`, `question`, `answer`, `published_at`, `source_label`, `source_url`. The source label is derived from source IDs. URL fragments and unapproved query parameters are removed. Only the latest publication per request is public; older revisions remain private in the append log. Republishing the current identical text returns its existing reply. Restoring text used before a subsequent revision creates a new current publication.

## Teacher API and relay

`google.script.run.tvHelpInbox()` returns `{ok:true,requests:[…]}`. Each permitted request has its private question/context/source/timestamp, `status`, and either `reply:null` or the latest public reply.

`google.script.run.tvHelpPublish({request_id,question,answer,reviewed_public_question:true})` returns `{ok:true,reply}` only after the owner confirms publication. Answer text is limited to 12,000 characters. The server checks `Session.getActiveUser()` and the allowlist; neither an effective-owner fallback nor browser-supplied teacher identity can authorize a publication. Failures throw and the teacher panel retains its draft.

A view-only teacher need not receive workbook edit access. The authenticated teacher handler sends a server-side signed request to the owner URL. The relay payload includes a timestamp, one-use UUID nonce, actual teacher email, request ID, reviewed question and answer. The owner verifies its HMAC, maximum age of five minutes, future tolerance of 30 seconds, nonce and current allowlist/project scope before writing. It never trusts a pupil's role or teacher field.

## Storage integrity and compatibility

The private tabs are `ppq_help_requests`, `ppq_help_replies` and `ppq_help_nonces`. Every trusted row has a `row_signature` HMAC over the tab name and the exact ordered stored strings. Variable text is JSON-encoded before writing so formula-like text stays text. Verification happens before parsing or serving stored content.

The owner creates `TV_HELP_STORAGE_SECRET` on the first validated real request. It is distinct from `TV_HELP_RELAY_SECRET`, which is lazily created only by an authenticated teacher publication handler. Neither secret is returned to the browser.

The pinned version 1 pupil writer can still append arbitrary positional rows to an existing named sheet. Those writes are **ignored, not prevented**: it cannot mint a valid help-row signature or edit an existing row. Unsigned, copied-and-changed or malformed appended rows are skipped without blocking valid records, including fake nonce rows. Its 17-column rows can pad the help header with empty columns; empty padding is accepted, while altered or additional nonempty headers are rejected. Do not manually change signed cells or headers, and do not import unsigned legacy rows as trusted help records. Initial deployment should confirm the reserved sheet names do not already have unrelated schemas.

## Local verification

Run `node test/test_teacher_clarifications.js`. It uses in-memory Sheets, synthetic accounts and keys, mocked HTTP, and the downloaded actual pupil version 1 append function. It verifies validation, private/public separation, strict teacher identity and scope, explicit review, view-only relay, revisions, signatures, expiry/replay, JSONP, formula safety and legacy append compatibility. No test sends a real question, report, publication or email.
