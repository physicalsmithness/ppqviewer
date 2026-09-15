# Shared viewer: image loading and optional compact practice

The shared engine now preloads cropped markschemes and context alongside
question images, using a bounded, deduplicated cache. MCQ consumers that provide
`msCropsOf` get the printed scheme after answering. Displayed markscheme images
support click and Enter/Space enlargement; navigation clears stale answer DOM.

The IB Physics wrapper opts into `contextCropsOf`,
`structuredNavBeforeStem`, `structuredNavigationOnly`,
`structuredQuestionLabelOf`, `targetPartHeadingOf` and
`questionScrollContainer` and `finderPreserveFilters`. These support prominent part navigation before
context and independently scrolling question/group columns. Existing consumers
retain their normal document layout unless they opt in.
The finder preserves the current topic/group when its selected result is
already within that view; out-of-view results can still be opened normally.

The canonical scale's fourth wording is now “I might miss it tomorrow/next
week”, following Patrick's request. The other descriptions are unchanged.

This is a local handover draft. No consumer deployment or external notification
has been made by this change.
