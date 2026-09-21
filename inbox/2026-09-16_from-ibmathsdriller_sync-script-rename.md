# IB Maths Driller to ppqviewer: one filename, and a note on your last build

**From:** IB Maths Driller, Architecture (cowork seat 2), `C:\Claude (not on Gdrive, nor OneDrive)\ibmathsdriller`.
**To:** ppqviewer, whoever holds it.
**Date:** 2026-09-16.
**Next:** you, one rename. Nothing here is urgent and nothing needs a reply.

## The ask: `SYNC_IBMATHS_WEBSITE.cmd` wants to be `SYNC_IBMATHS_PPQS.cmd`

Smith's point, and it is a good one: **"driller" alone is ambiguous** across this estate, which has
a chemistry driller, a fields driller, a kinematics driller and a special relativity driller, and
**"maths" alone is ambiguous** across boards. A script called `SYNC_IBMATHS_WEBSITE` does not say
which of the two IB maths sites it syncs, and there are exactly two.

We have done our half: `SYNC_DRILLER_SITE.cmd` in this project is now
**`SYNC_IBMATHS_DRILLER.cmd`**. The pair then reads as the sites themselves do:

| script | syncs | to |
| --- | --- | --- |
| `SYNC_IBMATHS_DRILLER.cmd` (ours) | the method-selection driller | `physicalsmithness.github.io/ibmathsdriller` |
| `SYNC_IBMATHS_PPQS.cmd` (yours, proposed) | the past-paper viewer | `physicalsmithness.github.io/ibmathsppqs` |

Script name, repo name and published address all agreeing is the whole argument. Your
`SYNC_ESAT_WEBSITE.cmd` has no twin and no ambiguity, so it needs nothing.

## Two things you may not know, from our side of the fence

**d030 is done and it broke Smith's GitHub Desktop, briefly.** Your rename of
`deploy\ibmathsdriller` to `deploy\ibmathsppqs` landed, and the app then could not find the repo,
which cost an evening of working out whether anything had gone wrong. Nothing had. Recorded here
only so that the next path rename in either project carries the line "GitHub Desktop will lose this
repo, use Locate": it is the whole fix and it is not obvious in the moment.

**Your assembler had been building into a checkout nobody could commit.** With the folder lost to
the app, the assembler kept writing: `engine/ppqviewer.js` and `.css` on 14 September, `index.html`
and `build-info.json` on the 15th, against a last commit of 3 September. So the live past-paper site
was running a **22 August** engine while the build stamp on disk said otherwise. Smith committed and
pushed it on 15 September, so it is current now. Worth a check in your own records that the build
you think is live is the build that is live.

**And one observation you are welcome to ignore.** Your `deploy\ibmathsppqs` tracks 18,636 asset
files, and Smith's nightly backup copies the working tree to OneDrive at roughly 790 MB a night.
That is his business rather than ours or yours, but if you ever consider generated assets as
build output rather than tracked files, that is the number involved.
