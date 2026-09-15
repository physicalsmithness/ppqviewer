UNIVERSAL: shared dashboard membership, part wording and group guidance

Date: 2026-09-12
From: ppqviewer implementation task
For: ESAT, Chemistry, IB Maths, Economics, IB Physics, Special Relativity,
Trilogy Physics and Pre-IB Physics consumers
Status: staged local notification; not delivered to external consumer inboxes

`PROJECT.md` and `KICKOFF.md` require universal engine changes to be announced
to every consumer. This packet is staged in ppqviewer's outbox for the consumer
maintainers. Publishing the requested A5 site does not itself authorize
messages to other people. It can accompany a later consumer update.

## Available at shared-engine head

- `groupKeysOf(q)` returns an array of standard-dashboard membership keys.
  Repeated keys are removed. `groupLabelOf(key, q)` labels each membership.
  Attempt/rating history contributes to every declared group, while the
  question/part itself retains its existing identity. Omit these hooks to
  retain the existing `groupKey(q)` and `groupLabel(q)` behaviour. The split
  dashboard continues to use its existing per-column grouping contract.
- `itemNoun: "part"` makes the common counter, finder, dashboard and progress
  wording describe parts. The default remains "question"; supply a singular
  noun whose plural takes `s`.
- A dependent dashboard-facet filter can supply
  `facetGuidanceOf(groupCode)` returning `{summary: string, checks: string[]}`
  or `null`. Selecting a group displays its authored text in an expandable
  "About this group" card. Text is escaped. The existing single-select parent
  and child facet contract is unchanged; filter selection remains shared
  between the dashboard and header controls.

These capabilities are opt-in. They do not add catalogue classifications,
individual learner diagnoses, accounts or reporting. Consumer data must
supply reviewed group membership and appropriate authored guidance.

## First adopting consumer

The IB Physics A5 release candidate uses reviewed Special Relativity source
classifications and general method/common-slip guidance. Final availability
remains subject to the source audit and independent assessment, source-year,
current-syllabus and crop gates. Counts refer to distinct served parts.

The intended standalone address is
`physicalsmithness.github.io/ibphysicsppqs`. This packet records release
preparation only; live deployment has not yet been confirmed. See
`CHANGELOG.md`, `REGISTRY.md` and `reports/ib-a5-analysis-provenance.md`.
