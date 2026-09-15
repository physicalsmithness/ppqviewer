# Physics sign-in recovery — PPQ staged, Driller published

PPQ identity version 2 status: **staged; not published**. The current public
IB Physics release is `74bc30c663ec86cf`, commit
`0c71e82be7db4c782755f3fcde065b15c43e0f2b`, and retains the unchanged version 1
identity helper. Its public bytes were verified at `2026-09-12T19:44:41.529Z`;
version 2 was not included.
The delegated investigation does not authorize publication. Source work is
limited to the helper `staged/physics-identity-v2/physics-identity.js` (version 2), its
independent regression tests and this documentation.

Driller status: **version 2 published by Smith**. The owning Driller task
reported a read-only verification at `2026-09-12T18:30:18Z`: its local HEAD,
GitHub main and six public assets matched commit
`71480bc62458e42fb10297e335c0bf158f6317f5` (v0.20.0). Its public identity
helper matches the frozen version 2 SHA256 below. This supersedes the earlier
receipt that both integrations were staged; it does not publish or authorize
publication of PPQ version 2. The separate Driller v0.20.1 coverage-width work
does not change identity.

## Cause and recovery

Fields/ECM's legacy four-field writer replaces `smithics_fields_identity_v1`
without preserving physics `signed_in` and `contexts.physics`. The previous
helper interpreted that omission as signed out; refreshing its configured SR
identity mirror could then overwrite an existing signed-in state with false.
This can cause the reported repeated sign-in prompts when moving between
participating pages in Smith's estate.

Version 2 remembers a confirmed physics sign-in in the browser-local
`smithics_physics_signin_v1` checkpoint. It recovers omitted metadata only when
the estate record still identifies the same anonymous ID and the same cleaned
display name. Cleaning trims and collapses whitespace; it does not equate
different names or identifiers. A deleted record, changed person, malformed
physics context or the ambiguous flat estate cohort cannot authorize recovery.
An explicit `signed_in: false` is retained, including when an older writer
later drops that property. Existing sign-in compatibility remains available;
the checkpoint does not invent a class or claim ownership of old results.

## Storage and transport boundary

Identity reads may write or recover **only these identity records**:

- `smithics_fields_identity_v1`, retaining existing estate fields while
  restoring permitted physics metadata;
- `smithics_physics_signin_v1`, the exact-person sign-in checkpoint;
- the existing consumer-configured `localKey` identity mirror, when provided.

The helper can read the existing SR identity for its prior compatibility path.
It does not read, migrate, clear, rekey or write progress/attempt stores. It
does not send data, reports or requests over the network, and recovery does not
authenticate a pupil with a password or server account. Local identity storage
is the only intended side effect of the recovery read path.

## Validation status

The original nine identity checks and ten independent recovery journeys pass
against the version 2 helper. The unchanged deployed version 1 fails the
reproduced Fields overwrite regression. Coverage includes a mounted PPQ answer
and subscribed SR mirror, storage/focus/pageshow recovery, reload, explicit
sign-out before/after clobber, mismatched names and IDs, malformed/deleted
identity and physics contexts, denied storage, and five progress stores kept
byte-identical. No test sends a report or request.

The candidate SHA256 is
`0a7ddcc249a304c38728db4affa11af41ad8c5080939d829c07ffbeda0b531b1`.
It is frozen separately so the unrelated Key tips UI update can use the
unchanged published version 1 at `example/physics-identity.js`. The recovery
test defaults to the staged version 2; `PHYSICS_IDENTITY_SOURCE` can override
the helper path for baseline comparisons. Driller owns its matching integration
checks and its publication verification above. No PPQ version 2 deployment or
live recovery is claimed.
