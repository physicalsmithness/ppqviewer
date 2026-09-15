# A5 analysis provenance and scope

The viewer input is generated from the authored Special Relativity analysis, using exact `ibchem_part_…` source IDs. Source projects are read-only. The generated input records SHA-256 fingerprints for the source files and builder in its `report` field; it is unserved build input and includes audit paths and rejected source IDs.

The authoritative part classifications are `Physics Categorisation/work/a5_dependencies_20260908/analysis_all_years.json`, with the confirmed duplicate maps in the same directory. The analysis defines 14 primary groups and distinguishes directly assessed concepts from supporting concepts. Two common-paper links, Q124 → Q115 and Q244 → Q239, are stated explicitly in the authored row text but absent from the exported map; the builder checks those exact statements before resolving them.

The group method guidance and checks come from `Special Relativity Driller/inbox/2026-09-09_from-codex_A5_common_slips/A5_atom_guidance.json`. This package was authored for the Driller and past-paper viewer. Its evidence ledger supplies source-report/markscheme references. `Special Relativity Driller/data/syllabus_meta.yaml` supplies the 45-atom syllabus tree and explicitly warns that the corpus's 14 concept groups cannot be resolved into those atom subletters. Therefore each part's `atom_codes` stays empty. Group atom links organise general guidance; they do not claim that each part assesses every linked atom or diagnoses each listed slip.

The 14-group bridge follows the analysis's syllabus column. Signal/reception guidance uses the explicitly named messages-and-signals atom A5.H13d and happened-versus-seen atom A5.H15b. General group checks preserve authored wording, with one check per relevant atom before further checks and a maximum of four for a readable group card. No learner-error prevalence or historical examination-frequency percentage is inferred.

## Scope before the new test exclusion intersection

For the 448 A5-tagged parts in the preview inspected on 12 September 2026, exact reviewed mapping yields 290 included, 104 excluded, 51 unmapped and 3 mixed. These are audit counts from that input snapshot, not the final live availability count; test, crop, source-year and other publication gates apply independently afterward.

The initial 157 apparently excluded records included 61 duplicate appearances. Following the authored canonical links restores 53 to current A5 and retains 8 canonical scope exclusions. The resulting 104 exclusions comprise 84 outside-current-A5 tasks and 20 contextual other-topic tasks. Examples include:

- `ibchem_part_c78237e042ebf1d0`: retired relativistic mass/energy/momentum; a gamma step does not make the task current A5.
- `ibchem_part_b7023d1ef3102be7`: legacy Maxwell-theory recall.
- `ibchem_part_122a19eaab307de1`: one-frame distance/speed/time arithmetic with no additional A5 operation.
- Q188 → Q182: the confirmed duplicate remains excluded because the canonical task is a legacy transverse light-clock construction.

The assessment audit inspected all 51 unmapped native parts and found no live assessed A.5.x understanding code. Most have bare/tentative A5 routing; some carry other-topic taxonomy tags. `ibchem_part_9fecfc67c348f76b` has a retired A.5.X tag alongside current other-topic codes. The builder keeps these unmapped and the A5 selection must withhold them. A broad A5 tag is insufficient evidence to assign a group or establish current scope.

Three current-preview source parts contain both current and retired assessed content and must remain withheld until bounded source-part/crop review:

- `ibchem_part_c77d3df1afff751b` and `ibchem_part_0191dec27115f375`: 2005 November HL/SL G1(c)(i), a table combining retired mass with current length/time rows.
- `ibchem_part_a0f4d6f45bec7760`: 2015 May HL Q17, separately labelled special-relativity clock dilation and general-relativity gravitational-potential branches.

The complete input also flags a corrupt-extraction duplicate (Q043 → Q041) as mixed pending source/crop review rather than treating a taxonomy match as asset verification.

## Integration contract

`{schema_version: 1, topic: 'A.5', groups, parts, report}`. Each group has `code`, `label`, `summary`, `checks` and `atom_codes`. Each `parts[source_part_id]` has `status`, authored primary `group_codes`, separate `direct_group_codes`/`used_group_codes`, empty `atom_codes`, reasons and source/canonical row provenance.

Only `status: included` establishes A5 taxonomy eligibility. Preserve primary group counts as distinct served parts. A mixed or excluded A5 classification must not be promoted by the source catalogue's broad A5 tag. Public bundles should contain only the filtered served records and learner-facing group metadata, not the full rejected-ID map, absolute audit paths or historical raw counts.

The existing dashboard facet requires a single-valued parent topic filter; the original physics topic filter is multi-valued. The integration therefore needs the agreed single-topic analysis filter rather than silently attaching a dependent facet to the existing multi-filter.
