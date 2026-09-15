# Shared physics sign-in: PPQ Viewer adoption

Date: 2026-09-12
From: Special Relativity Driller integration work, following Patrick's request
Status: Delivered to the local project inbox. Check the release receipt before treating this as live adoption.

Patrick has asked for one shared physics sign-in across the Driller and PPQ products, so moving between them does not ask for the same name and physics class again. This is same-origin browser identity. Existing progress remains in its existing browser stores; it is not an authenticated account or a cross-device history service.

The selected additive contract is:

- Keep the existing estate key `smithics_fields_identity_v1`, shared `anonymous_id` and `display_name`; add `signed_in: true` and `contexts.physics = { anonymous_id, display_name, cohort }`.
- Accept the physics context only when its name and ID match the current shared identity. An old per-product identity must never override the current shared person. A matching legacy SR sign-in may be adopted automatically; unrelated or stale legacy values are not proof of the current physics class.
- Preserve every unknown field and leave legacy `shared.cohort` unchanged. Physics context is shared by physics products; other subjects retain their own class scope. Do not infer a physics class from whichever subject last wrote a flat cohort.
- Use the transport-free `PhysicsIdentity.create()` helper and its `current`, `signIn`, `subscribe` and `signOut` methods. The canonical handoff is `ppqviewer/example/physics-identity.js`, mirrored in `Special Relativity Driller/app/physics-identity.js`. Use a matching copy; do not write a competing identity implementation or clear the global object directly.
- A quick switch to a different name clears the previous Google email. The same display name keeps the existing ID. A change to a different name creates a new ID for future attempts. This does not partition, migrate, relabel or delete historical progress. Refresh active identity when storage changes before attributing later events.

This adoption introduces no teacher transmission. IB Physics PPQ stays local and does not auto-post on sign-in. Existing reporting products keep their existing reporting behaviour and truthful destination wording; every product must also explain that displayed progress stays in this browser. Verify the deployed copy separately from the local source.

## PPQ Viewer action

IB Physics PPQ's current deployed-tree wrapper mounts with `learnerId: "local"` and loads no shared gate. The older generic `PPQLogin` already preserves unknown shared fields, but requires a separate per-page cohort and its `signIn` sends a session-start pulse. Do not call that reporting sign-in just to reuse physics identity.

Own and version the new transport-free helper, load it before the physics consumer, reuse a valid physics context without a second question, and bind new attempt attribution to the current identity. Keep `physics_ppq_ib_v1` unchanged and keep old `learner_id: "local"` events as historical browser records. Add the shared context option to the reusable gate contract so other physics consumers can adopt it without losing independent chemistry/maths/economics cohorts. Record which consumers use the new helper and which still use page-only classes.

Regression cases: SR → PPQ and PPQ → SR reuse name and class; another subject's cohort/unknown fields survive; stale local identity cannot take over; same-name and different-name switches follow the ID rule; identity adoption sends no fetch/beacon/POST; existing PPQ state remains byte-for-byte unchanged.

## Evidence checked locally

- `deploy/ibphysicsppqs/index.html:48`
- `deploy/ibphysicsppqs/physics-config.js:172`
- `example/ppq-login.js:54-67`
- `example/ppq-login.js:135-154`
