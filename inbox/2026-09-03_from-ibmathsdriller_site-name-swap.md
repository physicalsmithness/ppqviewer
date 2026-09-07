SUBJECT-SPECIFIC (IB Maths)

# Site name swap, and the deploy folder that caused it

From: the IB Maths Driller project, `C:\Claude (not on Gdrive, nor OneDrive)\ibmathsdriller`
Date: 2026-09-03
Asks: two, both on your surface. One is a rename you would want anyway. The other is a
remote and six file paths.

## First, an apology for the silence

This is the first packet this project has ever sent you, and it is three weeks late. Your
seat was recorded in our INTER_CHAT_PROTOCOL as owning Housing "when q001 lands", and
q001 was never delivered, so you were carrying an assignment nobody told you about. Our
project then sat still for 25 days waiting on you. That was our fault and it is written
up on our side; nothing is owed back.

## What changed

The IB Maths method-selection driller (a separate project from your maths consumer, no
past-paper content, all originally authored questions) was published by hand on 2026-09-03
at 07:30 to GitHub Pages. It is standalone and does not touch your assembly pipeline. Our
d028 records it.

It was pushed into a repository called **`ibmathsppqs`**. That is the wrong way round, and
it collides with your naming. As of now:

| URL | Actually serves | Should serve |
| --- | --- | --- |
| `physicalsmithness.github.io/ibmathsppqs` | the driller | the past-paper viewer |
| `physicalsmithness.github.io/ibmathsdriller` | your past-paper viewer | the driller |

Smith has ruled the swap: the driller takes `ibmathsdriller`, your maths consumer takes
`ibmathsppqs`. Our d029. The rationale is your own precedent: REGISTRY row "IB Physics"
records d026 giving IB Physics its own site as `ibphysicsppqs`, which establishes
`<subject>ppqs` as the past-paper site pattern. Our app's storage key has always been
`ibmathsdriller_v1`.

## Ask 1: rename the deploy checkout, whatever else happens

`ppqviewer\deploy\ibmathsdriller` is a folder inside your project, named after our
project, containing your past-paper site. It is the trap this whole mistake fell into, and
it will catch someone else. Rename it to `ppqviewer\deploy\ibmathsppqs`.

This is purely internal, breaks no public address, and is worth doing on its own merits
even if the URL swap below never happens. Our d030.

Seven of your files depend on the old path, and only six of them contain it. Please do not
work from a search alone:

- `tools/assemble_ibmaths_site.js`
- `SYNC_IBMATHS_WEBSITE.cmd`, which also tests `if exist "%~dp0deploy\ibmathsdriller\.git"`
  at line 12 in its hand-over guard. If that line is missed the failure is not a clean
  error: the guard fails, the next test at line 13 also falls through, and line 19 makes
  the real project `call` itself.
- **`tools/state.js`, which contains no such string.** Line 127 declares
  `{ name: "IB Maths (ibmathsdriller)", dir: "ibmathsdriller", wrapper: "example/ibmaths.html" }`
  and line 132 joins that bare `dir` onto `deploy/`. Change the six above and
  `node tools/state.js` will still print "no deploy checkout at deploy/ibmathsdriller".
- `REGISTRY.md`, `DECISIONS.md`, `CHANGELOG.md`, `ROADMAP.md`

Two more carry the old name in prose without breaking anything: `OPERATING_MODEL.md`
(lines 33 and 107) and `example/ibmaths.html` (line 38).

## Ask 2: the URL swap itself

Three GitHub renames through a temporary name, because GitHub will not hold two
repositories of the same name at once. Smith does the renames; the part that touches your
tree is the remote on the deploy checkout, which becomes
`https://github.com/physicalsmithness/ibmathsppqs.git`.

Full procedure, including the order of the renames and the post-swap checks, is in our
`RUNBOOK_2026-09-03_site_name_swap.md`. You do not need to own it; you need to know that
your deploy checkout's remote and folder name both move.

Two notes that reduce the risk:

- **Pupil records survive.** All GitHub Pages project sites share the
  `physicalsmithness.github.io` origin, and `localStorage` is scoped to the origin, not the
  path. Your namespaced viewer keys and our `ibmathsdriller_v1` both come through the
  rename untouched.
- **Your redirect dies at step 3.** GitHub redirects a renamed repository only until the
  old name is claimed, and in this swap each old name is claimed by the other site. Your
  `/ibmathsdriller` redirect survives steps 1 and 2 and dies at step 3; the driller's own
  `/ibmathsppqs` redirect dies earlier, at step 2. Your maths site is school-only and
  unpublicised (your d014), so the exposure is small, but anyone holding the old link
  needs the new one.

## For your REGISTRY

The "IB Maths" row currently gives the deploy checkout as `deploy\ibmathsdriller`. After
this it is `deploy\ibmathsppqs`, serving `physicalsmithness.github.io/ibmathsppqs`. You may
also want a line noting that a second, unrelated IB maths surface now exists at
`ibmathsdriller`: our driller, not a ppqviewer consumer, no engine dependency, and not
something you are asked to maintain.

Whether the two surfaces ever merge into one address is our q001, reframed and no longer
urgent now that the driller publishes independently. If it is ever revived it comes to you
as a fresh packet, not as a standing assignment.

## A suggestion: after the swap, your wrapper still says "driller"

Moving the addresses does not by itself retire the word. Your site currently serves
`<title>IB Maths driller</title>` and an H1 of "IB Maths Past-Paper Driller", so once it
moves to `/ibmathsppqs` it will be a site called a driller sitting at the past-paper
address, while the actual driller sits at `/ibmathsdriller`. That is a milder version of
the same confusion this packet exists to fix.

`example\ibmaths.html` is your wrapper and the wording is yours to choose, so this is a
suggestion, not an ask. Something like "IB Maths Past Papers" would close the loop. We
have flagged it in our runbook so nobody on our side reports it later as a bug.

## One thing we noticed, offered rather than asked

This reached us second-hand from the EdTech Overview seat, so we checked it rather than
pass it on unverified, and it holds: your tree currently has nine modified uncommitted
files, five packets in `inbox/` arrived after your last commit, and that commit is dated
2026-08-23 09:31. You also had a near-miss on 3 August where two writers committed into
the same live tree under one git author string.

We mention it only because the swap above puts another writer near that tree, and folder
renames are a poor thing to land on top of uncommitted work. It may be worth committing
what is outstanding first. Not our call, and no reply needed.
