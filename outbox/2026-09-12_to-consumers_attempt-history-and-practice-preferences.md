# Shared viewer: attempt history and practice selection

The IB Physics wrapper opts into compact per-question history and saved
practice preferences. `attemptHistory: {enabled: true, defaultVisible: true}`
adds a small marks/C strip beside the question metadata; missing older ratings
remain unknown. New scale choices are saved to their own attempt row as well as
the existing latest-score map.

`practiceSelection: {enabled: true, defaultMode: "mix"}` enables
Not attempted yet, Complete mix and Previous errors. Errors follow the latest
completed outcome rather than lifetime mistakes. Mode changes apply on the
next question, without discarding current work. Explicit review navigation
remains available.
IB now includes previously completed questions by default, following Patrick's
latest preference. The explicit include checkbox and three practice choices
remain synchronized.

`sideRating: {enabled: true}` moves the existing confidence controls and Next
into a right-hand panel, retaining one set of handlers and the original scale
descriptions. It appears after answering and clears on navigation. The responsive
stylesheet uses a bottom panel on small screens.

`shuffleGroupKeyOf(q)` optionally identifies a whole-question unit. The engine
sorts with the consumer comparator, shuffles these units, and retains child order.
IB enables this with `parent_id`, uses semantic nested Roman part sorting and
starts in Shuffle. Consumers without the hook keep their existing flat shuffle.
The grouped consumer exposes both 'Shuffle questions; keep parts in order' and
'Shuffle all parts', alongside 'In order'.

Other consumers retain their existing defaults. This is a local handover
record; no other consumer has been deployed or externally notified.
