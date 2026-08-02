# ESAT teaching-catalogue integration

The pupil-facing hierarchy is `Subject -> Topic -> Family / subtopic` for all
738 Maths/Physics questions.

- `canonical_primary_family` is the main teaching family. Fallback is allowed
  only when canonical is absent and the candidate is not a boundary label.
- Historical placement and labels such as `Not Electricity` remain audit data;
  they are never the main teaching home.
- Each question is counted once in progress under its resolved teaching topic
  and once under its main family.
- Other canonical families appear as `Also relevant to`; fine syllabus labels
  and other teaching topics remain searchable detail rather than extra progress
  homes.
- Technique tags, representations, reasoning/calculation style and extra
  retrieval terms feed the finder for every question.

`test/test_categorisation_integration.js` executes the real wrapper against the
authoritative catalogue, classification trace and current 720-record analysis
bundle. It proves each of the 738 family/topic choices, the 75 repaired feed
mismatches, the 117-family/23-topic visible set, search coverage, hierarchy and
progress consistency. It also pins the polygon option-testing routes, scanner
ordered-options bounds routes and the distinct `knew_but_did_not_need` state.
