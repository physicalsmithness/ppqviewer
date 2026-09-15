# Pupil help client validation

The pupil client is optional. A configured host supplies the service endpoint,
project, source label, public source URL and source-only context. No identity or
learner performance is added by these methods. Opening the teacher-help dialog
reads replies but does not submit a question. Sending requires an explicit action
and a nonempty question of at most 4,000 characters, matching the service limit.

Teacher questions receive a locally saved UUID before submission. After an opaque
POST, the client checks the receipt endpoint before saying that a question has
been received. An uncertain response retains the same UUID and text for retry.
Focus changes, reopening the dialog and periodic polling resolve the current
saved request by UUID. Published replies are rendered as text. Saved receipts and
read timestamps restore notifications in the same browser.

Display-problem reports use the separate estate feedback protocol. Their opaque
`no-cors` response cannot establish that a spreadsheet row was saved. The brief
learner-facing response, “Thanks for reporting.”, is shown only after dispatch
resolves; it makes no claim of confirmed receipt. Failure retains the draft.

Validation: `test/test_teacher_help_config.js` has five configuration checks;
`test/test_teacher_help.js` has thirteen pupil journeys; the existing thirteen
Physics usability and seven question-tools checks also pass. JSONP and POST are
simulated in these tests. No real teacher question or display report was sent.
Live verification completed on 12 September 2026 at 15:32 UTC. Owner endpoint
v19 returned an empty public history through the actual browser JSONP path.
TeacherViewer v20 displayed its Questions from pupils tab and loaded the empty
authorized queue (0 questions available). No real question, report or reply was
submitted. Physics supplies an empty source_context and a canonical public
question link; it does not send image contents through the teacher-help service.

IB build e55db219ef0bb748 is public at deployment commit
fae202def056b155a801fc2492cc1e301bac351f. Eight public code/data/style files and
three crops, including the repaired Q7(b)(i) diagram, match that commit. The live
browser opened the target question from its id link, showed both footer tools,
and displayed the complete diagram through its full-size image control. The
local report form fits a 390-by-844 viewport: its Send button is within the
viewport at y=737–781, with no horizontal overflow. The temporary size override
was reset. Opening and closing forms produced no submissions or graded attempts.

Final shared regression gates passed 2,426 assertions; pupil-help/config checks
18, server checks19, teacher panel10, staging integration11, question tools7,
display usability13, identity9, release18 and crop geometry5 also passed.
