# Optional shared viewer improvements

IB Physics adopted these features in build `19069d1cf2b1158a`, publicly verified
12 September 2026 at 14:07 UTC. Other deployments have not been changed.

- `questionTools: {dock:true, resetInPreferences:true}` wraps the question
  scroller in a column with a separate tool footer and puts confirmed Reset
  under Preferences. A minimal consumer still gets access to Preferences.
- `problemReport: {endpoint,project,sourceLabelOf,contextOf}` adds explicit issue
  reporting to a host-supplied real service. The form snapshots source context,
  keeps failed drafts in memory, prevents duplicate pending submits and never
  assumes that an opaque response proves receipt. This is separate from
  learner attempt reporting. IB's callback includes no learner performance.
- Facet `focusGuidanceOnSelect:true` names and focuses the selected guidance
  card. Its own analysis scroll resets on explicit selection, not on grading.
- `learnerLevel: {enabled:true,defaultValue:'HL'}` saves a learner's course.
  `timing.targetOf(q,{learnerLevel})` receives the captured visit value and
  returns seconds before extra-time scaling. The visit retains its allocation,
  level and timer settings when Preferences changes. Attempt rows include
  `learner_level`; it does not overwrite source level.
- `questionBadgesOf(q)` returns escaped `{label,title}` descriptors. Current
  syllabus eligibility and original source-paper level should stay distinct.

Validation: eight shared suites, 2,426 assertions; new learner9, pacing9,
question-tools7 and report/usability11 journeys; public release17. Desktop
footer geometry and phone report layout were reviewed in the browser. No real
feedback was submitted during testing.
