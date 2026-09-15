TeacherViewer clarification integration audit — 12 September 2026

Deployment update: the clarification owner API is now live at version **19**, deployment `AKfycbygTx2TEpXvqECcWT0mbVhn_Jc_emoT3tk1iKD3EkmgJAv__vSW_oixb8RAlEFyjpRt`. TeacherViewer is at version **20**, retaining deployment `AKfycby-X_lJrst0JGPpuBQrQ-t4nAERJL8YOAy3DLaGLkkrbr9qvpoySNc7xmsDDG5HOngZ`. The original pupil writer remains unchanged at version **1**, deployment `AKfycbwQ2NxNi-AWGCpBVDa6nT9DDYsS66F53ENZvtZozDwuWkKaivqgLaGUyjSFd_InJ4Kt`. Anonymous public-list GET returned an empty successful response, and the Questions from pupils button was observed in TeacherViewer 20. No real clarification POST or teacher publication was sent; the live write/answer round trip remains untested.

The canonical server, HTML and manifest were installed after preserving their previous bytes in `integration/teacher-clarifications/canonical-before-20260912-162000/`. Deployment was based on the downloaded live source, retaining unrelated unpublished canonical work locally. Physics client build `e55db219ef0bb748` was published and verified at 15:32 UTC on 12 September 2026, commit `fae202def056b155a801fc2492cc1e301bac351f`; its request payload has `source_context: {}` and no image contents. See [the integration record](../integration/teacher-clarifications/README.md) and [API/storage documentation](../integration/teacher-clarifications/INTEGRATION.md) for the implemented design and verification.

The findings below describe the **initial read-only investigation before implementation**. At that stage no source corpus, TeacherViewer file, workbook, deployment, report or reply was modified or transmitted. No AGENTS.md or README was present in `C:/Claude (not on Gdrive, nor OneDrive)/TeacherViewer`; PROJECT.md, REPORTING_FORMATS.md, TEACHER_LOGIN_GUIDE.md and deployment notes were read first. Initial source line numbers and hashes are historical evidence, not current deployment fingerprints.

The latest user decision is that teacher-published questions and replies are public, with no pupil names. Pending submissions remain a private teacher queue. This supersedes any earlier design for private reply retrieval.

Verified capabilities at the initial investigation:

- Canonical server: `shared_script/teacher-tracking.gs`. `doPost(e)` at line95 parses one JSON object, routes by project, appends a row and returns `{ok:true}` or `{ok:false,error}`. Arbitrary row types and extra fields are accepted. A clarification record can be received without counting as an attempt. The existing append route does not authenticate its sender or make retries idempotent.
- Reader: `tvGetRows(project,since,rowType)` at line330, plus `tvListProjects`, `tvGetRoster`, `tvGetClasses` and `tvWhoAmI`. Teacher calls use `google.script.run`; rows are filtered by project/cohort/class and private email fields are stripped recursively.
- UI: `app/teacherviewer.html`. The project chooser and Coverage/Misconceptions/Ticker/Records tabs are at120–126; cohort/class/topic/time/auto/learner/anonymise controls at143–165; Records/detail containers at200–204. `loadWorkbook`863–877 requests every authorised row type. `showRecord`753 and `renderRecords`763 display escaped record fields. They do not offer reply authoring.
- No teacher reply, publication, browser notification or public Q&A retrieval route exists. `doGet()`272 currently takes no routing parameters and serves either a banner or the teacher HTML.
- Shared browser identity in the PPQ login shim is `smithics_fields_identity_v1`; its `anonymous_id` is an identifier, not proof of ownership. Existing pulse writes use `mode:no-cors`, so they cannot prove acceptance or read a reply.

Security and permission constraints:

- `signedInEmail_()`786 falls back from active-user email to effective-user email. A synthetic, entirely local test with blank active email and an allowlisted effective owner served the teacher HTML. Do not reuse this fallback as teacher authentication on an owner-executed anonymous route. Live deployment behavior was not tested.
- New teacher writes must require the actual active Google account and independently check the allowlist and relevant project scope. Never trust client-supplied teacher email, role or `row_type:teacher_reply`: the current anonymous append endpoint accepts those fields as data.
- The existing teacher deployment runs as `USER_ACCESSING`, and the project documents grant colleagues Viewer access to the workbook. Patrick as owner can write; view-only colleagues cannot. A new tab in the bound workbook does not change that ACL. A separate writable spreadsheet also requires its own edit grant and a change from the manifest's `spreadsheets.currentonly` scope.
- Class-scoped `tvGetRows` excludes unrostered requests. An anonymous clarification queue needs an explicit project-level visibility rule if class membership cannot be established.

Extension proposed at the initial investigation (subsequently implemented):

1. Receive an idempotent clarification request with request ID, exact project/item/source reference and pupil message into a private reserved queue. Preserve pending text privately; exclude the queue from public responses.
2. Add authenticated teacher queue and publication methods, with a dedicated Clarifications tab or Records action. Publishing should store explicit reviewed `public_question` and `public_answer` fields; merely dropping the name column cannot remove names embedded in pupil text.
3. Add a public GET returning only published records through an explicit whitelist: public ID, project, item reference, approved public question/answer and publication timestamp. No pupil name, cohort, email, browser token, unpublished text or arbitrary record tail should be projected. A bearer token is unnecessary for these public answers.
4. The pupil browser can retain its own request IDs and last-seen publication IDs locally, poll the public feed, notify when a matching request has a published answer, and show earlier public answers for the current source part. This requires a verified readable transport; the existing no-cors pulse cannot provide it.

Deployment facts:

- Apps Script project ID: `1eEhqf-sdvuuD0dtWke608DuJv9vHGYuI2sKcmqhagHpRZWWiHZlyICXn` in `clasp_project/.clasp.json`.
- `deploy_teacher.bat` copies canonical server, HTML and manifest to `clasp_project`, stamps the HTML build, runs `clasp push -f`, then `clasp deploy -i AKfycby-X_lJrst0JGPpuBQrQ-t4nAERJL8YOAy3DLaGLkkrbr9qvpoySNc7xmsDDG5HOngZ -d "TeacherViewer update"`. This targets the existing teacher deployment only.
- The separate anonymous pupil endpoint is the existing `AKfycbwQ2NxNi-AWGCpBVDa6nT9DDYsS66F53ENZvtZozDwuWkKaivqgLaGUyjSFd_InJ4Kt` deployment. Project deployment instructions require changing its code version through the Apps Script deployment UI while retaining `USER_DEPLOYING`/`ANYONE_ANONYMOUS`. Applying the teacher manifest to it would change access behavior.
- Clasp is installed at `C:/Users/patri/AppData/Roaming/npm/clasp.ps1`; `.clasprc.json` exists and was last modified 8 September. Credentials were not read and live authentication was not tested.
- Source and staging were byte-identical for server, HTML and manifest. Source SHA256: server `401c8bce11a560d6fca78c8c30e490669836b66cf487482384aecaae70e43f74`; HTML `3b0e225ab2d112da2cf30c2a666541ecf11377e96a2b8659f84c9410f09aa5ac`; manifest `696170eaff4d3025d0cf6bc2e8aace5bff1ebecb3dc8655345b47320d86baf92`.
- `shared_script/DEPLOY_NOTES.md` says the latest receiver fixes were locally tested but not deployed by that task. A local source hash does not prove the live version.

Validation: the existing `client-reception.test.cjs` and `server-reception.test.cjs` passed 34 tests, with one optional real-export test skipped. They use synthetic in-memory services and made no live calls. New integration checks should cover forged teacher roles, blank active-user identity, strict public-field projection, idempotent requests/publications, permission failures, pending-versus-published state and same-browser notifications.
