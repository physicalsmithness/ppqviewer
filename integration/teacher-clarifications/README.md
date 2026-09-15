# Teacher-reviewed public questions and answers

This integration adds **Questions from pupils** to TeacherViewer. Pupils submit a question without an identity field. An authorised teacher sees the private wording, prepares the public question and answer, confirms that both are free of pupil names and personal details, and explicitly publishes. Only the latest reviewed revision is public. A failed publication preserves the draft.

For API contracts and signed-storage details, see [INTEGRATION.md](INTEGRATION.md).

## Live deployment record — 12 September 2026

| Role | Script version | Deployment ID |
| --- | --- | --- |
| Clarification owner, anonymous public API | 19 | `AKfycbygTx2TEpXvqECcWT0mbVhn_Jc_emoT3tk1iKD3EkmgJAv__vSW_oixb8RAlEFyjpRt` |
| Signed-in TeacherViewer | 20 | `AKfycby-X_lJrst0JGPpuBQrQ-t4nAERJL8YOAy3DLaGLkkrbr9qvpoySNc7xmsDDG5HOngZ` |
| Original pupil attempt writer, unchanged | 1 | `AKfycbwQ2NxNi-AWGCpBVDa6nT9DDYsS66F53ENZvtZozDwuWkKaivqgLaGUyjSFd_InJ4Kt` |

The [owner API](https://script.google.com/macros/s/AKfycbygTx2TEpXvqECcWT0mbVhn_Jc_emoT3tk1iKD3EkmgJAv__vSW_oixb8RAlEFyjpRt/exec) returned a successful empty public list on an anonymous GET. The **Questions from pupils** button was seen in [TeacherViewer version 20](https://script.google.com/macros/s/AKfycby-X_lJrst0JGPpuBQrQ-t4nAERJL8YOAy3DLaGLkkrbr9qvpoySNc7xmsDDG5HOngZ/exec). No real clarification POST, teacher publication or test reply was sent; write behavior is covered by local synthetic tests.

The canonical server, HTML and manifest were installed with their prior copies retained in `canonical-before-20260912-162000/`. This preserves local unpublished TeacherViewer work separately from the live-baseline deployment. Physics client build `e55db219ef0bb748` was published and verified at 15:32 UTC on 12 September 2026, commit `fae202def056b155a801fc2492cc1e301bac351f`. Its clarification payload uses `source_context: {}` and sends no image contents.

## Sources and boundaries

- `remote-before/` is the downloaded TeacherViewer source used for the live release. Its page has Grid, Misconceptions and Ticker tabs.
- `pupil-v1-before/` is the downloaded original pupil deployment version. It is a write endpoint with a plain status banner; it has no teacher readers. Keep that deployment pinned to its existing version and URL.
- `staged/` is the deployable copy made from `remote-before/` plus this feature and the authentication/storage guards.
- `canonical-proposed/` contains the same additions over the local TeacherViewer source and has been installed in that canonical project with the backup recorded above. Its unrelated unpublished changes, including Records/open-row work, are **not part of this deployment**. Do not deploy this directory.
- `Clarifications.gs` contains the request/public-read routes and teacher publication relay; `teacher-panel.js` is the independent tab UI.

The preparation helper reads the source files and writes only the isolated staged/proposed copies and `staging-receipt.json`. It does not push code, create/update deployments, alter the original source project, or change the old pupil endpoint. The receipt binds the source and generated file hashes.

It can be rerun after the canonical feature is installed. The known initial installation is recognised exactly; subsequent generated copies mark the server module and panel boundaries explicitly. A rerun replaces those blocks and keeps each existing routing and authentication guard once. Unknown legacy edits or ambiguous boundaries stop preparation for review. The deployable `staged/` copy continues to come from `remote-before/`.

## Before deployment

Record the current teacher deployment ID and pinned version, the existing pupil deployment ID/version, and the client configuration commit. The downloaded source backup is not a substitute for the deployment-version record. Preserve these for rollback.

After the server module and panel are frozen, run these local checks from the ppqviewer workspace:

```text
node test/test_teacher_clarifications.js
node test/test_teacher_clarifications_panel.js
node test/test_teacher_clarifications_integration.js
node test/test_teacher_help.js
node test/test_teacher_help_config.js
```

The integration suite executes the preparation helper with captured in-memory writes using the complete downloaded source. It verifies the two manifest roles, anonymous access, private-storage isolation, preserved original pupil version, and bounded outputs. It reports when saved staging is older than the current source; regenerate it after the final edits.

## Deployment sequence

Use the existing Apps Script project/workbook so the teacher and dedicated publisher share Script Properties and storage. Create a **new, dedicated clarification owner deployment**. Do not repurpose or update the existing pupil deployment.

1. Prepare the owner copy with `node tools/prepare_teacher_clarifications.js __OWNER_ENDPOINT__ owner`. Push **only `staged/`**, create a version, and create the new web-app deployment. Its manifest must be exactly `executeAs: USER_DEPLOYING`, `access: ANYONE_ANONYMOUS`.
2. Record the new owner `/exec` URL. Regenerate with `node tools/prepare_teacher_clarifications.js OWNER_EXEC_URL owner`, replacing `OWNER_EXEC_URL` with that exact URL. Push the regenerated staged copy, create a new version, and update **only the new clarification owner deployment** to that version. The placeholder version cannot publish answers.
3. Regenerate with `node tools/prepare_teacher_clarifications.js OWNER_EXEC_URL teacher`. Verify `executeAs: USER_ACCESSING`, `access: ANYONE`, then push the staged copy, create a version, and update the existing teacher deployment to that version. Its signed-in account must be on the workbook allowlist and within the authorised project scope.
4. Preserve each role's generated hashes, manifest and deployed version in the deployment record. The helper overwrites `staged/` and its receipt on each run; never assume the previous role's manifest remains there.
5. Configure the pupil viewer's clarification endpoint with the new owner URL only after both deployments are verified. Keep the existing attempt-reporting endpoint unchanged.

The public endpoint must return only public answers/status; an anonymous request for the teacher page must receive the plain endpoint banner. Verify the teacher tab using the actual signed-in teacher deployment. Use the local synthetic suites for publication checks; no real pupil request or public answer is needed for deployment verification.

The relay and signed-storage secrets live only in Script Properties. Keep them across code updates and rollback: replacing the storage secret would make existing signed records unreadable. Never put secrets in client code, source control or receipts.

## Rollback

1. Disable or restore the pupil clarification client configuration to its recorded previous commit. Leave attempt reporting unchanged.
2. Repoint the existing teacher deployment to its recorded previous version. Do not create a replacement teacher URL or deploy `canonical-proposed/` as a rollback.
3. Disable the newly created clarification owner deployment if necessary. Keep the original pupil deployment pinned to its original version.
4. Retain the clarification sheets and Script Properties so requests and published answers can be recovered. Rollback does not require deleting records, rotating secrets, or modifying source questions.

Inspect the recorded manifests and deployment IDs before updating a deployment: the owner publisher and signed-in teacher page are deliberately separate versions of the same project.
