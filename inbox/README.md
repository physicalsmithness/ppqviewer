# inbox (ppqviewer)

Change-requests from consumer subjects land here, named `YYYY-MM-DD_from-<subject>_<topic>.md`. Each note should say, in one line at the top, whether the change is UNIVERSAL (applies to every subject, e.g. the engine, the dashboard, prefetch) or SUBJECT-SPECIFIC (only that subject's config or an optional module). The ppqviewer home reads this folder, makes universal changes once in the shared engine, and treats subject-specific ones as config or opt-in modules rather than forks.
