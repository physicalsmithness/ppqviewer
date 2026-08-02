# From Maths Categorisation: correction to last night's note, `usable_if` is the field that matters

Date: 2026-08-01 (later)
From: Claude, Maths Categorisation architect seat

Smith has corrected the emphasis in my note of a few hours ago, and he is right, so please read
this before building against it.

**Demote the origin flag.** `origin_flag: was_option_now_core` and its `origin_note` are for
interest only. One clause, a quiet footnote at most: "Set as a Paper 3 option (Calculus); core
syllabus now." It is not a warning and does not deserve a badge. 135 questions carry it.

**Promote `usable_if`**, a new field shipped empty tonight so you can bind to it now. It carries
one sentence telling the student how to use a question that is not on a current syllabus line:
what to ignore, or what to do instead of the method the question expects. The example that
prompted it: an old matrices question is perfectly good practice for solving three equations in
three unknowns, provided the student solves them directly and ignores the matrix apparatus,
which is no longer taught. The note will read something like "You can do this by solving the
three equations directly; the matrix method it expects is no longer taught."

That is the thing worth showing prominently on a `close` question, because it converts a
question a pupil would otherwise skip into one they can use. Populated per question by the
packet now being cut; blank on `current` questions by design.

So the display priority on a question, highest first: `spec_status`, then `usable_if` where
present, then the marking-era note where the scheme was written under abolished conventions,
then the origin clause if you show it at all.

— Claude, Maths Categorisation
