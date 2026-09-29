SUBJECT-SPECIFIC (physics: A.2 Forces and momentum)

# A.2: Smith's rulings, and a re-delivery that carries them. Supersedes the counts in yesterday's packet

From: instinctivelymechanical (A.2 content seat, Architecture) · 2026-09-29 · For: ppqviewer architect-maintainer
**Next:** ppqviewer (fold A.2 into the physics preview as a seventh topic of `ibphysicsppqs`, serving only `serve_under_a2` parts; answers to `C:\Claude (not on Gdrive, nor OneDrive)\instinctivelymechanical\inbox\`)

Read with `2026-09-28_from-instinctivelymechanical_a2-forces-and-momentum-typed-and-ready.md`, which still describes the shape. This packet replaces its counts and its suggestion about mixed parts.

## Smith's rulings (2026-09-29, recorded as our d012)

1. **A.2 opens inside the existing IB Physics past-paper viewer**, as another topic on `ibphysicsppqs`, through your trains. Nothing past-paper is hosted anywhere else.
2. **A part can be both A.1 and A.2.** Dual membership is expected. It is not something to resolve by picking one.
3. **Do not use the A.2 taxonomy to decide which other topic leads a part.** Smith: the taxonomiser "was entirely focussed on A.2 so would have missed other topics leading. Don't trust it on that yet." Its `other_topics` field and its direct/mixed split are one-sided evidence. Treat them as notes, not as a lead-topic ruling under your d030.
4. **No D-topic knowledge under A.2.** Smith: "we can't have D topic knowledge cluttering this. Mostly they won't have met that yet." A part that needs D.1 to D.4 knowledge keeps its A.2 membership but is not served under A.2.

## The re-delivery

`C:\Claude (not on Gdrive, nor OneDrive)\instinctivelymechanical\outputs\viewer\ib-a2-analysis.json`, sha256 `b183b4289a2ab00ac27a7c07a372207a04c6a535e7d39658118756c851e330dc`, 7,883,504 bytes. It has the same shape as yesterday's, plus two fields on every part:

- `serve_under_a2` (true or false). Serve A.2 from this, not from `status`.
- `serve_withheld_by`: the signals that withheld it.

The withholding rule. A part is withheld when any of three independent signals says it needs D-topic knowledge:
- its primary type is in `A2T.17` (field forces): 326 parts;
- the taxonomy lists a D topic among its other topics: 340;
- Physics Categorisation's own syllabus proposals tag a D understanding as central to it: 190.

A twin group is served or withheld as one. Two twins were pulled in because their partner was withheld.

| | parts | twin groups |
| --- | ---: | ---: |
| A.2 members (`status: included`) | 1,750 | 1,292 |
| **served under A.2** (`serve_under_a2: true`) | **1,372** | **992** |
| withheld for D-topic knowledge | 378 | 300 |

- **Years:** the served set runs from 2004 to 2025; 98 served parts are from 2025.
- **Your A.1 input:** 177 served A.2 parts are also `included` there. By ruling 2 they can appear under both.
- **The 45 parts you already serve:**
  - The 32 you serve under A.1 and the 1 under C.1 are all `serve_under_a2: true`, so they can also appear under A.2.
  - The 12 you serve under D.2 are all withheld from A.2, which matches ruling 4.

`report.rulings` in the file restates the three rulings in one line each, so they travel with the data.

## Unchanged from yesterday

The ask is the same: fold A.2 into the physics preview so Smith can look, then his publication ruling. The notes on hard-coded topic lists, test reservations (his 20 A.2 test files) and missing qtype codes still stand.
