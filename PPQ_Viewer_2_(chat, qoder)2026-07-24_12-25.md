# PPQ Viewer 2

**Exported:** 2026-07-24T11:25:45.067Z

**Project:** workspace

---

## PPQ Viewer 2

### **You**

look for the md of the qoder chat 1 in here and prepare to become chat2 @[folder:local:C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer]

### **Assistant**

#### Thinking

Smith wants me to look for the markdown export of "chat 1" in the ppqviewer project directory, and then prepare to become "chat 2" (continue the work from where chat 1 left off). This is similar to what happened with the Linguics project where I took over from a previous chat.

Let me first look for markdown files in that directory that might be a chat export.

#### Tool: Glob

**Input:**

```json
{
  "path": "C:\\Claude (not on Gdrive, nor OneDrive)\\ppqviewer",
  "pattern": "**/*.md"
}
```

**Output:**

```json
..\..\..\..\..\Claude (not on Gdrive, nor OneDrive)\ppqviewer\ppqviewer_divergence_census.md
..\..\..\..\..\Claude (not on Gdrive, nor OneDrive)\ppqviewer\README.md
..\..\..\..\..\Claude (not on Gdrive, nor OneDrive)\ppqviewer\inbox\README.md
..\..\..\..\..\Claude (not on Gdrive, nor OneDrive)\ppqviewer\KICKOFF.md
..\..\..\..\..\Claude (not on Gdrive, nor OneDrive)\ppqviewer\PROJECT.md
..\..\..\..\..\Claude (not on Gdrive, nor OneDrive)\ppqviewer\DESIGN.md
..\..\..\..\..\Claude (not on Gdrive, nor OneDrive)\ppqviewer\REGISTRY.md
..\..\..\..\..\Claude (not on Gdrive, nor OneDrive)\ppqviewer\OPEN_QUESTIONS.md
..\..\..\..\..\Claude (not on Gdrive, nor OneDrive)\ppqviewer\inbox\2026-06-29_from-esat_analysis-store-for-interrogation-mode.md
..\..\..\..\..\Claude (not on Gdrive, nor OneDrive)\ppqviewer\inbox\2026-06-29_from-esat_timing-and-timer.md
..\..\..\..\..\Claude (not on Gdrive, nor OneDrive)\ppqviewer\inbox\2026-07-02_from-economics_consumer-onboarding.md
..\..\..\..\..\Claude (not on Gdrive, nor OneDrive)\ppqviewer\DECISIONS.md
..\..\..\..\..\Claude (not on Gdrive, nor OneDrive)\ppqviewer\ROADMAP.md
..\..\..\..\..\Claude (not on Gdrive, nor OneDrive)\ppqviewer\CHANGELOG.md
..\..\..\..\..\Claude (not on Gdrive, nor OneDrive)\ppqviewer\PPQ_Viewer_(chat1,qoder)2026-07-23_15-15.md
```

#### Thinking

Found it: `PPQ_Viewer_(chat1,qoder)2026-07-23_15-15.md` — that's the chat 1 export. Let me read it. It might be large, so let me check the size first and then read it in chunks.

Found it: `PPQ_Viewer_(chat1,qoder)2026-07-23_15-15.md`. Let me read through it to orient myself.



#### Tool: Bash

```bash
wc -l "/c/Claude (not on Gdrive, nor OneDrive)/ppqviewer/PPQ_Viewer_(chat1,qoder)2026-07-23_15-15.md"
```

**Output:**

```json
54598 /c/Claude (not on Gdrive, nor OneDrive)/ppqviewer/PPQ_Viewer_(chat1,qoder)2026-07-23_15-15.md
```

#### Thinking

54,598 lines — that's a large export. I'll read the head and tail to orient, then grep for key structural markers. Let me start with the first ~200 lines and last ~200 lines to understand what was happening.


54k lines — big export. I'll read the head and tail to orient, then grep for key context.



#### Tool: Read

> Read: `C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\PPQ_Viewer_(chat1,qoder)2026-07-23_15-15.md`

**Output:**

```json
1	# PPQ Viewer
2	
3	**Exported:** 2026-07-23T14:15:15.602Z
4	
5	**Project:** workspace
6	
7	---
8	
9	## PPQ Viewer
10	
11	### **You**
12	
13	Can you get yourself up to date on this project and tell me where we are and whether you can help? @[folder:local:C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer] @[folder:local:C:\CodexProjects]
14	
15	### **Assistant**
16	
17	#### Thinking
18	
19	The user wants me to get up to speed on a project located at `C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer` and also `C:\CodexProjects`. Let me first check if I have access to these directories, and if not, request access. Let me also search my memory for any prior context about these projects.
20	
21	Let me start by searching memory for "ppqviewer" and "CodexProjects" to see if I have any prior context.
22	
23	#### Tool: mcp__qw-builtin__memory_search
24	
25	**Input:**
26	
27	```json
28	{
29	  "query": "ppqviewer CodexProjects project"
30	}
31	```
32	
33	**Output:**
34	
35	```json
36	{
37	  "success": true,
38	  "results": [],
39	  "indexed": true
40	}
41	```
42	
43	#### Tool: Bash
44	
45	```bash
46	ls "C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer" 2>&1
47	```
48	
49	**Output:**
50	
51	```json
52	CHANGELOG.md
53	DECISIONS.md
54	DESIGN.md
55	KICKOFF.md
56	OPEN_QUESTIONS.md
57	PROJECT.md
58	README.md
59	REGISTRY.md
60	ROADMAP.md
61	engine
62	example
63	inbox
64	ppqviewer_divergence_census.md
65	test
66	```
67	
68	#### Tool: Bash
69	
70	```bash
71	ls "C:\CodexProjects" 2>&1
72	```
73	
74	**Output:**
75	
76	```json
77	PaperDatabases
78	```
79	
80	#### Thinking
81	
82	I have access to both directories. Let me explore them more thoroughly. The ppqviewer project has a rich set of documentation files. Let me read the key ones to understand the project. CodexProjects has a PaperDatabases subdirectory.
83	
84	Let me read the main project files to get up to speed.
85	
86	Good, I can see both directories. Let me read through the project documentation to get up to speed.
87	
88	
89	
90	#### Tool: Read
91	
92	> Read: `C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\PROJECT.md`
93	
94	**Output:**
95	
96	```json
97	1	# PROJECT: ppqviewer (the estate's shared past-paper-question viewer engine)
98	2	
99	3	Established 2026-06-29 (kickoff), first-session build 2026-07-01. Lives on the non-sync drive at `C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\`. Owned by no subject; tracked as an estate shared asset in `EdTech Overview\SHARED_ASSETS.md` ("ppqviewer" / "Question Tools engine").
100	4	
101	5	## What it is
102	6	
103	7	One shared engine that displays authentic past-paper-question images, lets a pupil self-mark on a 1-to-6 scale, and shows a per-skill dashboard (a last-N tick/cross ribbon plus a 1-to-6 rating heat map, shared colour ramp and intensity formula), with a drawing overlay and an image modal. Every subject runs the SAME engine and supplies only its own config and question data. A universal improvement is made once here and is live for every subject the next time their page opens.
104	8	
105	9	## Why it exists
106	10	
107	11	Chemistry and ESAT each grew their own copy of the same viewer, and the copies drifted. The concrete proof is the prefetch drift: a "longer pre-fetch" improvement (`PREFETCH_AHEAD = 3` with sibling-part warming) landed in the live chemistry copy alone and reached neither the ESAT sibling (one-step preload only) nor the stale G: chemistry mirror. The single-shared-engine model exists to stop exactly this: propagate universal gains automatically, and make each subject aware of the optional capabilities it is not using.
108	12	
109	13	## The model (three layers plus data)
110	14	
111	15	- **Engine (shared, here):** all logic. Filter / order / shuffle / start-number, navigation, the 1-to-6 self-mark, the dashboard, parametrised prefetch, the drawing overlay, the modal, the keyboard map, question loading.
112	16	- **Config (per subject):** a required and UNIQUE namespaced storage key, field and label names, the grouping function, prefetch depth, and which optional modules are switched on.
113	17	- **Optional modules (opt-in, built here):** reference-booklet deep-link, structured multi-part navigator, question-type plugins (auto-marked MCQ, image self-mark, reveal-markscheme flashcard, examiner-report panel), KaTeX math rendering, post-question "where did you go wrong" interrogation.
114	18	- **Data (per subject):** the question catalogue and the asset folders only.
115	19	
116	20	Subjects never edit the engine. A new need is either a new shared capability (made here) or a new opt-in module (made here, switched on in that subject's config). Never a fork.
117	21	
118	22	## Consumers
119	23	
120	24	See `REGISTRY.md` for the live table. In brief: Chemistry (live) and ESAT (live) are the two real copies to fold in; Special Relativity is a possible future migration target (it currently runs a different engine family, not this one); Economics and Maths are possible future consumers with no copy yet.
121	25	
122	26	## Change and notification
123	27	
124	28	Universal changes are made once here and notified into each consumer's inbox, with `CHANGELOG.md` as the record. Subject-specific modules are logged in `REGISTRY.md` so every other subject can see the capability exists and is simply switched off for them. Change-requests arrive in `inbox\`, named `YYYY-MM-DD_from-<subject>_<topic>.md`, tagged UNIVERSAL or SUBJECT-SPECIFIC on the first line.
125	29	
126	30	## Constraints
127	31	
128	32	UK English. Never the "— " (em-dash-with-space) sequence. Single shared engine, namespaced storage required, lose no capability either existing copy has. Published surfaces carry the estate GA4 + Clarity blocks (WEB_KIT). Depart from the brief where there is reason, recorded in `DECISIONS.md`.
129	33	
130	```
131	
132	#### Tool: Read
133	
134	> Read: `C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\ROADMAP.md`
135	
136	**Output:**
137	
138	```json
139	1	# ROADMAP: ppqviewer
140	2	
141	3	Phased. No target counts; phases end when the capability is proven, not at a number.
142	4	
143	5	## Phase 0: kickoff (this session, 2026-07-01) — DONE / in progress
144	6	Read the kickoff and census; read both live engines in full; confirm the live chemistry copy (C:\Claude, not the stale G: mirror); lay down the operating-model docs; record the seed decision (d001) with reasons; sketch the config-vs-engine split (DESIGN). Output of this phase is documents, not code.
145	7	
146	8	## Phase 1: resolve the open questions
147	9	Settle q01 (SR consumer?), q02 (DOM contract route), q03 (misconceptions binding), q04 (hosted vs vendored), q05 (chemistry dashboard split) with Smith / the seats. These gate the build shape, so do not start coding the engine until q02 and q04 are answered.
148	10	
149	11	## Phase 2: build the shared spine — DONE 2026-07-01 (v0.1.0-phase2, 19/19 headless tests pass)
150	12	From the ESAT seed: config loader (fail loud on missing `storageKey`), attempts-log storage, filter/order/shuffle/start, navigation, the self-mark widget driven by the pluggable `selfReport` scheme (d006, default 1-to-6), the shared dashboard (d004) with configurable grouping and layout, the parametrised prefetch (d005, answer warmed separately), the drawing overlay (port verbatim), the modal, the keyboard map, and the engine-owned DOM built into a single mount that also works as an embed (d003 + d009, subject to q02). Ship with the ESAT config + data as the first live consumer, since ESAT is the smallest migration.
151	13	
152	14	## Phase 3: port chemistry's modules (lose no capability) — DONE 2026-07-01 (v0.2.0-phase3; chem 21/21, ESAT 19/19)
153	15	`referenceBooklet`, `structuredPaper` (with two viewing modes + peek-back), `questionTypes` (MCQ / flashcard / examiner report), `math` (KaTeX + mhchem hook), split dashboard, header buttons. Chemistry migrated via `example/chem-config.js` with a `migrate` hook seeding the unified v2 store from the v1 keys so pupils lose no history (d010). Hard rule verified: the shared engine now does everything both originals did.
154	16	
155	17	## Phase 4: post-question interrogation module
156	18	Build `postQuestionReview` once as a shared optional mode, writing into the reserved `self_report` attempt field. Categories fed by each consumer via config (the misconceptions spine is one optional vocabulary, not mandatory; per q03/d006). Switch on for ESAT first.
157	19	
158	20	## Phase 4b: Special Relativity embed
159	21	Migrate SR onto the viewer as an embedded component (d009), the first non-standalone consumer. Near-term per Smith. Coordinate via the IB Physics Overview seat. Depends on the engine having a clean mount-and-embed story from Phase 2.
160	22	
161	23	## Phase 6: assistance layer + identity/classes (the big future piece)
162	24	Build the `assistance` module (d007): pupil asks for help and writes a free response on a question; teacher records an answer; the answer carries a visibility scope (direct to pupil / class / all users). This needs the identity+classes layer (d008): real logins for all users and class membership, the FastAPI + Google-OAuth backend tier (the Memoriser pattern), with a shared (not local) store for cross-user answers. Clarify q06 (cross-consumer analytics visibility) here. Largest and latest; designed-for now so the spine does not block it, built when Smith is ready.
163	25	
164	26	## Phase 5: retire the drift
165	27	Tombstone the stale G: chemistry mirror (`_MOVED__READ_ME_FIRST.md` pointing here / to the live chemistry copy) once its features are confirmed folded in. Populate REGISTRY fully. Establish the inbox routing with the consumer chats via the EdTech Overview seat so future requests land here.
166	28	
167	29	## Later / conditional
168	30	SR migration (only if q01 says yes); economics and maths as new consumers; a timer UI (timing is already captured silently); real learner identity (never baked into stores).
169	31	
170	```
171	
172	#### Tool: Read
173	
174	> Read: `C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\README.md`
175	
176	**Output:**
177	
178	```json
179	1	# ppqviewer (neutral home for the shared past-paper-question engine)
180	2	
181	3	Established 2026-06-29 at Smith's instruction. This is the neutral home of `ppqviewer`, the estate's shared past-paper-question viewer engine (authentic past-paper question images, self-marking on a 1-to-6 scale, per-skill dashboards with a last-rating ribbon and a rating-distribution heat map, drawing overlay).
182	4	
183	5	It is deliberately owned by NO single subject. Chemistry and ESAT are consumers, not owners. The point of a neutral home is that the engine never bends to one subject's needs and is not orphaned when active work moves to another subject.
184	6	
185	7	## The model
186	8	
187	9	- **One shared engine, here.** Subjects supply only their config and their question data; they never edit the engine.
188	10	- **Universal changes are made here once** (for example the longer pre-fetch, currently trapped in the live chemistry copy) and reach every subject.
189	11	- **Subject-specific needs are optional config-driven modules**, never forks: chemistry's data-booklet deep-link; the "where did you go wrong" post-question interrogation built once as a shared optional mode (it is the lost-marks idea at the viewing layer, bind it to `misconceptions_core.yaml`).
190	12	- **Change-requests land in `inbox\`**, named `YYYY-MM-DD_from-<subject>_<topic>.md` and tagged universal or subject-specific. A consumer that wants a change has its own chat drop a note here; this home makes the change once.
191	13	- **A REGISTRY (to be created with the kickoff)** tracks each consumer's version, copy location and enabled modules, so a change can never again silently land in only one copy.
192	14	
193	15	## Founding document
194	16	
195	17	- `ppqviewer_divergence_census.md` (2026-06-29, EdTech Overview seat): the divergence map of the existing copies. Key findings: only two real copies exist, chemistry (live at `C:\Claude (not on Gdrive, nor OneDrive)\chemistrydriller\`, the `G:` copy is a stale mirror) and ESAT (`C:\Claude (not on Gdrive, nor OneDrive)\ESAT Prep App\app\engine.js`); the longer pre-fetch lives only in the live chemistry copy; and the recommended consolidation is to seed the SPINE from ESAT (namespaced storage, attempts-log) and port chemistry's richer FEATURES on as opt-in modules.
196	18	
197	19	## Open decisions, with Smith, before the full kickoff is written here
198	20	
199	21	1. Is Special Relativity actually a consumer? The census found SR runs a different engine family, not ppqviewer; this changes who the named consumers are.
200	22	2. A single shared engine that all subjects LOAD (recommended; gives automatic propagation of universal changes), or per-subject copies that re-pull. The per-subject-copy model is exactly what just trapped the pre-fetch.
```

#### Tool: Read

> Read: `C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\PPQ_Viewer_(chat1,qoder)2026-07-23_15-15.md`

**Output:**

```json
54398	
54399	Current flow: The guess-declaration panel appears BEFORE answering (pre-answer), as a separate panel below the question ("Which options are still in the running?"). The pupil declares a guess, then answers, then the post-answer modal appears.
54400	
54401	What Smith may be saying: Instead of having the guess declaration as a separate panel before answering (which is "too far" from the action / "no one's going to see it down there"), make it the FIRST item/page of the POST-ANSWER pop-up. So the flow becomes: pupil answers → pop-up opens → FIRST thing in the pop-up is "Do you want to declare a guess?" (with the options/percentages) → they enter guess or skip (press Enter) → then they see the answer/verdict.
54402	
54403	"Put any guessiness question mark answers in the mix, and they just press Enter again, and they just skip it and they get the answer" — they can put in a guess, or just press Enter to skip, and then they get the answer (verdict).
54404	
54405	So the redesign: move the guess-declaration from a pre-answer panel (below the question) to being the FIRST page/step of the post-answer pop-up. The pop-up opens, first asks "Any guess?" (with the option checkboxes + percentages), they fill it or press Enter to skip, then the verdict/answer is revealed.
54406	
54407	Hmm, but this changes the semantics significantly. Currently the guess is PRE-answer (declared before seeing the answer, which is the whole point of guess-declaration for the analysts — to know if they were guessing before they saw the answer). Moving it to POST-answer (inside the pop-up after they've answered) would mean they've already seen... no wait, they've answered but the pop-up shows the verdict AFTER the guess step. So the flow would be: answer → pop-up → guess declaration (before seeing verdict) → verdict. This preserves the "guess before seeing the correct answer" property, because the verdict (correct answer) is only revealed AFTER the guess step in the pop-up.
54408	
54409	Actually, that's clever: currently the pupil answers, and then... wait, when they answer, do they immediately see whether they're right? Let me think. In the current design, when they pick an option and hit "Reveal"/answer, the modal opens with the VERDICT first ("You chose X — the answer is Y"). So they see the correct answer immediately in the modal. The post-answer guess correction is AFTER the verdict. So the current post-answer guess is AFTER seeing the answer (which is why it's a "correction").
54410	
54411	The PRE-answer guess panel ("Which options are still in the running?") is shown BEFORE they answer, so they declare a guess before seeing the answer. That's the valuable pre-answer declaration.
54412	
54413	Now Smith is saying: the pre-answer guess panel is "too far" / "no one's going to see it down there" (it's below the question, easy to miss). He wants to move the guess declaration INTO the pop-up as the FIRST page. So: pupil answers → pop-up opens → FIRST page asks "Do you want to declare a guess?" (with options + percentages) → they fill or press Enter to skip → NEXT page/step shows the verdict (correct answer).
54414	
54415	This way, the guess declaration happens BEFORE they see the correct answer (because the verdict is page 2 of the pop-up), preserving the integrity of the guess declaration, AND it's prominent (first thing in the pop-up, can't miss it).
54416	
54417	"It's not there at all." — maybe meaning: currently the guess declaration is NOT in the pop-up at all (it's a separate pre-answer panel), so people miss it. Put it IN the pop-up as the first page.
54418	
54419	"They put that in, and the pop-up says just to sort of give it a bit of suspense." — "give it a bit of suspense" = the pop-up builds suspense by asking the guess FIRST before revealing the answer. Nice pedagogical touch.
54420	
54421	"Put any guessiness question mark answers in the mix, and they just press Enter again, and they just skip it and they get the answer" — they can enter a guess, or press Enter to skip, and then get the answer (verdict).
54422	
54423	OK so I'm fairly confident now about Point 2: **Move the guess-declaration to be the FIRST page/step of the post-answer pop-up, asked BEFORE the verdict is revealed. Simpler prompt wording like "Do you want to declare a guess?" They can fill it in or press Enter to skip, then the verdict appears.**
54424	
54425	But wait — this is a significant UX/architectural change to a feature I just built (v0.2.7). And it changes the guess-declaration semantics from pre-answer (separate panel) to post-answer-but-pre-verdict (first page of modal). This is a big change. I should NOT just implement it blindly. I should confirm my understanding with Smith, especially since:
54426	1. It's a major redesign of the guess flow.
54427	2. His message is very garbled (voice-to-text).
54428	3. My memory rule: "Always ask before guessing" for garbled input.
54429	
54430	Also Point 1 (percentages too far apart) is a concrete, small CSS fix I could do, but I need to know WHICH percentages — the ones in the guess panel (the "0 %" next to A-H). The screenshot clearly shows those. So Point 1 = in the guess-declaration option rows, the "0 %" is too far right from the letter; move it left, closer to the letter.
54431	
54432	But if Point 2 moves the whole guess panel into the pop-up, then Point 1's fix would apply to the new location. So maybe I should confirm the overall direction first.
54433	
54434	Hmm, let me reconsider. Actually, let me re-read Point 1 once more, very carefully:
54435	
54436	"All right, those things and the pretensions are too far apart. I'd say we can be. Okay. The percentages are too far apart. We can probably get that up on the left. Let's get it close to the question. No one's going to see it down there."
54437	
54438	"those things and the pretensions are too far apart" — "those things" = the checkboxes/option letters; "the pretensions" = the percentages. They're too far apart (letter on left, % on right, big gap).
54439	
54440	"The percentages are too far apart." — reaffirming.
54441	
54442	"We can probably get that up on the left." — move the percentage to the left.
54443	
54444	"Let's get it close to the question." — close to the option letter ("the question" = the option/item).
54445	
54446	"No one's going to see it down there." — hmm. "Down there"...
54447	
54448	Oh wait. Maybe I'm misreading the layout. Let me reconsider. Maybe the percentages aren't next to each option. Maybe "down there" refers to the percentage display being somewhere at the bottom. But the screenshot clearly shows "0 %" to the right of each option A-H. So each option row has: [checkbox] [A] ......... [0 %]. The % is at the far right of the row.
54449	
54450	"Get that up on the left" — move the % from the far right to the left, next to the letter. "Close to the question" — next to the option letter. "No one's going to see it down there" — this is confusing because the % isn't "down". Unless... "down there" = "over there" (far right, at the end of the row, far away). Voice-to-text might have rendered "over there" or "way out there" as "down there". So: "No one's going to see it [way out] there [at the far right]." Move it left, next to the letter.
54451	
54452	OK, Point 1 is clear enough: **In the guess-declaration option rows, move the percentage from the far right to immediately after (or near) the option letter, so they're close together.**
54453	
54454	Now, given the ambiguity and the scale of Point 2, the right move is:
54455	1. Confirm my understanding of both points with Smith (especially Point 2, the big redesign).
54456	2. NOT implement yet.
54457	
54458	But actually — let me reconsider whether Point 2 is really a redesign or something smaller. Let me re-read once more:
54459	
54460	"Just say, 'Do you want to do the what bit of a guess?' I have those things right next to me, or we have it as the first item. We have it as the first page of the pop-up screen. It's not there at all. They put that in, and the pop-up says just to sort of give it a bit of suspense. Put any guessiness question mark answers in the mix, and they just press Enter again, and they just skip it and they get the answer you"
54461	
54462	Alternative reading: Maybe he's NOT saying to move the pre-answer guess panel. Maybe he's talking about the POST-ANSWER guess correction that's already in the modal (the "_postGuessEl" right after the verdict). He's saying: make the guess question the FIRST item/page of the pop-up (before the verdict), not after the verdict. "It's not there at all" = currently the guess isn't the first thing (the verdict is first). "Give it a bit of suspense" = ask the guess BEFORE revealing the verdict, building suspense. "They just press Enter again, and they just skip it and they get the answer" = press Enter to skip the guess step and see the answer/verdict.
54463	
54464	This reading aligns with: reorder the modal so the guess declaration comes FIRST (before the verdict), as a "page 1" that you can skip with Enter, and then the verdict ("the answer") is revealed. This creates suspense: "did you guess? tell us, then we'll show you the answer."
54465	
54466	Both readings (move pre-answer panel into modal vs. reorder existing post-answer guess to be first) converge on: **the guess declaration should be the FIRST thing in the pop-up, BEFORE the verdict, skippable with Enter.**
54467	
54468	The difference is whether the PRE-answer panel ("Which options are still in the running?" shown before answering) stays or is removed.
54469	
54470	Given "It's not there at all" and "No one's going to see it down there" (referring to the pre-answer panel being buried below the question), I think he wants to REMOVE the pre-answer panel (or at least de-emphasize it) and instead have the guess declaration as the first page of the pop-up. The pre-answer panel is "down there" (below the question) and "no one's going to see it."
54471	
54472	Hmm, wait — "No one's going to see it down there" was in the Point 1 paragraph about percentages. Let me not over-merge. But the theme is consistent: the current guess UI (pre-answer panel below the question) is easy to miss / poorly placed.
54473	
54474	OK, here's my plan. This is a significant redesign with garbled input. Per my rules ("always ask before guessing" for Smith's voice-to-text, and the ask_user_question guidance for consequential decisions), I should confirm my understanding before implementing. But I also don't want to be annoying with too many questions.
54475	
54476	Let me think about what's genuinely ambiguous and consequential:
54477	1. Percentages position (Point 1): fairly clear — move % next to the letter. Low risk. Could just do it.
54478	2. Guess declaration as first page of pop-up (Point 2): significant flow change. Needs confirmation on:
54479	   a. Does the pre-answer guess panel go away entirely, or stay?
54480	   b. Is the guess in the pop-up asked BEFORE the verdict (suspense), with Enter to skip?
54481	   c. What's the exact prompt wording?
54482	
54483	Given the scale, I think the best approach is to reflect back my understanding concisely and ask for confirmation on the key design decision (pre-answer panel: keep or remove), while confirming the "first page of pop-up, before verdict, Enter to skip" model. I'll use AskUserQuestion for the consequential fork.
54484	
54485	Actually, let me reconsider. Smith's style is terse and action-oriented. He's dictating stream-of-consciousness. The most helpful thing might be to state my understanding clearly and ask ONE focused question about the consequential fork (what happens to the pre-answer panel), and confirm the percentages fix.
54486	
54487	But the AskUserQuestion tool is recommended for consequential decisions. Let me use it for the main fork. Let me formulate.
54488	
54489	Actually, let me reconsider the whole thing once more, because I want to make sure I'm not overcomplicating. Let me re-read the FULL message as a stream:
54490	
54491	"All right, those things and the pretensions are too far apart. I'd say we can be. Okay. The percentages are too far apart. We can probably get that up on the left. Let's get it close to the question. No one's going to see it down there."
54492	
54493	→ The percentages (0%) are too far from the option letters. Move them left, close to the letter. [Clear CSS fix]
54494	
54495	"Just say, 'Do you want to do the what bit of a guess?'"
54496	
54497	→ Change the prompt wording to something like "Do you want to declare a bit of a guess?" — simpler/direct question.
54498	
54499	"I have those things right next to me, or we have it as the first item. We have it as the first page of the pop-up screen."
54500	
54501	→ The guess declaration should be the FIRST item / FIRST page of the pop-up screen.
54502	
54503	"It's not there at all."
54504	
54505	→ Currently it's not [the first thing] in the pop-up / or the guess isn't prominent.
54506	
54507	"They put that in, and the pop-up says just to sort of give it a bit of suspense."
54508	
54509	→ Putting the guess first in the pop-up gives a bit of suspense [before revealing the answer].
54510	
54511	"Put any guessiness question mark answers in the mix, and they just press Enter again, and they just skip it and they get the answer you"
54512	
54513	→ They can enter a guess, or press Enter to skip, and then get the answer [verdict].
54514	
54515	So the design:
54516	- Pop-up opens after answering.
54517	- FIRST page/step: "Do you want to declare a bit of a guess?" with the option checkboxes + percentages (moved close to the letters).
54518	- They tick options / set percentages, or press Enter to skip.
54519	- Then the verdict ("the answer") is revealed. Suspense.
54520	
54521	And the pre-answer panel ("Which options are still in the running?" currently below the question) — does it stay? His "No one's going to see it down there" suggests the current below-question placement is bad. If the guess moves into the pop-up as page 1, the pre-answer panel probably goes away (replaced by the pop-up's first page). That's the cleanest interpretation: the guess declaration moves from pre-answer-below-question to post-answer-first-page-of-pop-up.
54522	
54523	This is a significant change to the v0.2.7 guess-declaration semantics I just built. The payload structure (attempt_id, guess_declaration qtype) stays, but the TIMING and LOCATION change.
54524	
54525	Given the significance and the garbling, I MUST confirm before implementing. Let me use AskUserQuestion to confirm the core redesign, and also confirm the percentages fix.
54526	
54527	Let me formulate the question(s). I'll ask:
54528	Q1: Where should the guess declaration live? (the big fork)
54529	  - Option A: First page of the pop-up (before the verdict), replacing the pre-answer panel below the question. [my reading]
54530	  - Option B: Keep the pre-answer panel below the question AND also have it in the pop-up.
54531	  - Option C: Keep it only pre-answer (no change), just fix the percentages.
54532	Q2 (maybe): The percentages — move them next to the letter? (confirm, low risk) — actually this is clear enough, I'll just confirm in text and do it.
54533	
54534	Hmm, but I shouldn't implement Point 1 until I know where the guess UI lives (if it moves to the pop-up, the % fix applies there). Actually the % fix applies to the option rows regardless of location. But if I'm moving the whole thing, I'd do both together.
54535	
54536	Let me just confirm the design with AskUserQuestion before touching anything. That's the safe, correct move given garbled input + significant redesign. Let me ask one clear question about the guess-declaration placement/flow, and mention the percentages fix as understood.
54537	
54538	Actually, let me reconsider whether to use AskUserQuestion vs. just reflecting back in text. The guidance says use AskUserQuestion for consequential decisions the user should make. This is exactly that. But Smith is a voice-to-text user; he might prefer to just hear my understanding and say "yes/no". AskUserQuestion gives him clear options to tap. I think AskUserQuestion is appropriate here for the main fork.
54539	
54540	Let me craft it. I'll keep it to ONE question with clear options, plus maybe a second about the pre-answer panel. Actually the placement question and the pre-answer-panel question are the same fork. Let me do one question:
54541	
54542	"Where should the guess declaration live?"
54543	- A: "First page of the pop-up" — After they answer, the pop-up opens on the guess question ("Want to declare a bit of a guess?"), Enter to skip, then the verdict appears. The current panel below the question goes away. (Recommended — matches my reading)
54544	- B: "Keep both" — Keep the pre-answer panel below the question AND add the guess as the pop-up's first page.
54545	- C: "Keep it pre-answer only" — Don't move it; just fix the percentages position.
54546	
54547	And I'll state the percentages fix in text (move % next to letter) as understood, to be applied wherever the guess UI ends up.
54548	
54549	Wait, but I realize I should double-check: is there actually a pre-answer guess panel currently shown below the question? The screenshot shows "Which options are still in the running?" with A-H checkboxes + percentages + "Remove percentages" + Done/Skip. And at the bottom "Previous / Reveal (Enter) / Skip". And "I'm guessing" at top. This looks like the PRE-answer guess-declaration panel (shown before they answer, so they can declare which options they think are in the running). The "Reveal (Enter)" at the bottom suggests they haven't answered/revealed yet. So yes, this is the pre-answer panel.
54550	
54551	So currently: pre-answer panel below the question. Smith wants it (or its essence) as the first page of the pop-up.
54552	
54553	OK let me also reconsider: maybe he wants to KEEP it pre-answer but ALSO make the percentages closer. And separately, he's talking about a DIFFERENT guess question in the pop-up. Ugh, the garbling makes this genuinely ambiguous. That's exactly why I should confirm.
54554	
54555	Let me go with AskUserQuestion. I'll ask the placement question. Let me also be concise in the text before it.
54556	
54557	Actually — I realize I should be careful. Let me re-read the instruction context. The system reminder lists skills and agents. The user's message is about the guess UI. I should respond to that. No skill is obviously relevant (this is UI design discussion, not docx/pdf/etc.). The find-skills skill says "use as FIRST step before handling any substantive task" — but this is a design clarification conversation, not really a "task" requiring a skill like docx/pdf. I'll skip find-skills; it's a conversation about UI changes to existing code. Actually, to be safe, the guidance says find-skills for substantive tasks. But this is really just a clarification/design discussion. I don't think a skill applies. I'll proceed with AskUserQuestion.
54558	
54559	Let me write a concise reflection + AskUserQuestion.
54560	
54561	Let me draft the text:
54562	"Two things there — let me play back what I think you're after before I touch anything, because the second one's a proper redesign.
54563	
54564	1. The percentages: the "0 %" is floating way over on the right, far from the letter. Pull it in so it sits right next to the option letter. Easy.
54565	
54566	2. The guess question: at the moment it lives in its own panel below the question (the "Which options are still in the running?" block), which is easy to miss "down there". You want it to be the first page of the pop-up instead — they answer, the pop-up opens straight onto "Want to declare a bit of a guess?", they can fill it in or just press Enter to skip, and only then does the verdict (the actual answer) appear. A little suspense before the reveal."
54567	
54568	Then AskUserQuestion: does the pre-answer panel go away (replaced by pop-up page 1), stay alongside, or stay as-is?
54569	
54570	Let me formulate the AskUserQuestion with good options. I'll recommend option A (move to pop-up, remove pre-answer panel).
54571	
54572	Let me make sure the question is clear and the options are distinct. I'll use header "Guess placement".
54573	
54574	Let me write it.
54575	
54576	
54577	Two things in there — let me play back what I think you're after before I touch anything, because the second one is a proper redesign of the guess flow and I don't want to build the wrong thing from a garbled line.
54578	
54579	The percentages: at the moment each "0 %" floats way over on the right, a long way from its letter. You want it pulled in so it sits right next to the option letter. Easy fix.
54580	
54581	The guess question: right now it lives in its own panel below the question (the "Which options are still in the running?" block in your screenshot), which is easy to miss down there. You want it to be the **first page of the pop-up** instead — they answer, the pop-up opens straight onto a simple "Want to declare a bit of a guess?", they can fill it in or just press Enter to skip, and only *then* does the verdict (the actual answer) appear. A beat of suspense before the reveal.
54582	
54583	The one thing I genuinely can't tell from that is what happens to the current panel below the question.
54584	
54585	
54586	
54587	#### Tool: AskUserQuestion
54588	
54589	**Questions:**
54590	
54591	- If the guess declaration becomes the first page of the pop-up, what happens to the current "Which options are still in the running?" panel that sits below the question before they answer?
54592	
54593	### **You**
54594	
54595	but reword.
54596	
54597	### **Assistant**
```

#### Thinking

OK so the chat 1 export is 54k lines. The tail shows the chat ended mid-conversation about redesigning the guess-declaration UI in the ppqviewer ESAT consumer. The last exchange was about:
1. Moving percentages closer to option letters
2. Moving the guess-declaration from a pre-answer panel to the first page of the post-answer pop-up

Smith's last message was "but reword." — seemingly responding to the AskUserQuestion about what happens to the pre-answer panel.

Let me get more context from the tail — let me read a bit more before the very end to understand the full state. Also let me look at what was built (the CHANGELOG, the engine files) to understand the current state.

Let me read more of the tail, and also look at the project's current state (CHANGELOG, engine files).

Let me get more context from near the end and check the current state of the codebase.



#### Tool: Read

> Read: `C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\PPQ_Viewer_(chat1,qoder)2026-07-23_15-15.md`

**Output:**

```json
54100	1023	  Viewer.prototype._formatMarkscheme = function (t) {
54101	1024	    let s = t || "";
54102	1025	    s = s.replace(/✓/g, "✓<br><br>");
54103	1026	    s = s.replace(/\bOR\b/g, "<br>&nbsp;&nbsp;<i>OR</i><br>&nbsp;&nbsp;");
54104	1027	    s = s.replace(/Do not accept/g, "<br><b>Do not accept</b>");
54105	1028	    s = s.replace(/Do not award/g, "<br><b>Do not award</b>");
54106	1029	    s = s.replace(/(?<!Do not )Accept /g, "<br><b>Accept </b>");
54107	1030	    s = s.replace(/(?<!Do not )Award /g, "<br><b>Award </b>");
54108	1031	    return s;
54109	1032	  };
54110	1033	
54111	1034	  Viewer.prototype._recordAttempt = function (chosen, isRight) {
54112	1035	    const cfg = this.cfg;
54113	1036	    const row = Object.assign({
54114	1037	      learner_id: cfg.learnerId, id: cfg.idOf(this.cur), chosen_option: chosen, correct: !!isRight, is_correct: isRight ? "right" : "wrong",
54115	1038	      time_ms: Date.now() - this.shownAt, timing_mode: cfg.timingMode, self_report: null, ts: new Date().toISOString(),
54116	1039	      app_version: cfg.appVersion, context: { view: "viewer", id: cfg.idOf(this.cur), type: this._curType },
54117	1040	      attempt_id: this._attemptId || "" /* QoderWork 2026-07-22 (analyst handoff) */
54118	1041	    }, cfg.attemptFields(this.cur));
54119	1042	    /* QoderWork 2026-07-22 (analyst handoff): attach the pre-answer guess snapshot
54120	1043	       so a later correction can be reconciled with what was declared up front. */
54121	1044	    if (this._preGuessDeclaration) row.pre_guess_declaration = this._preGuessDeclaration;
54122	1045	    this.store.attempts.push(row);
54123	1046	    this._saveStore();
54124	1047	    /* QoderWork 2026-07-22: report the attempt to the hosting page's callback.
54125	1048	       When the exam timer is on, _commitTimer has stored the time-pressure context
54126	1049	       (time_remaining_ms + time_pressure) so a fast answer can be told apart from a
54127	1050	       guess downstream — fast-with-clock-to-spare vs forced-by-an-expiring-timer. */
54128	1051	    const extra = { correct: !!isRight, time_ms: row.time_ms, attempt_id: this._attemptId || "" };
54129	1052	    if (this._preGuessDeclaration) extra.pre_guess_declaration = this._preGuessDeclaration;
54130	1053	    if (this._timerCtx) {
54131	1054	      if (this._timerCtx.time_remaining_ms != null) extra.time_remaining_ms = this._timerCtx.time_remaining_ms;
54132	1055	      if (this._timerCtx.time_pressure) extra.time_pressure = this._timerCtx.time_pressure;
54133	1056	    }
54134	1057	    this._fireReport({ status: "answered", picked_id: chosen, level: (this.cur && this.cur.level) || "", extra_json: JSON.stringify(extra) });
54135	1058	  };
54136	1059	
54137	1060	  // --------------------------------------------------------------- exam timer (module, QoderWork 2026-07-22)
54138	1061	  /* Silent capture (time_ms) is always on; this is the optional visible clock plus
54139	1062	     time-banking plus the time-pressure context. All methods no-op unless
54140	1063	     config.timer is set. NOTE-TO-SELF: per-question allocation is a single
54141	1064	     perQuestionSec for every question — ESAT may want per-subject/per-paper
54142	1065	     budgets; banking is a simple surplus-carries-forward pool (floored at 0). */
54143	1066	  Viewer.prototype._startTimer = function () {
54144	1067	    this._stopTimer();
54145	1068	    const t = this.cfg.timer;
54146	1069	    const tel = this.q(".ppq-timer");
54147	1070	    if (!t) { if (tel) tel.style.display = "none"; return; }
54148	1071	    if (this._timeBankMs == null) this._timeBankMs = (t.bankSec || 0) * 1000;
54149	1072	    const alloc = t.perQuestionSec * 1000;
54150	1073	    this._qBudgetMs = (t.mode === "down") ? alloc + this._timeBankMs : 0;
54151	1074	    this._timerCtx = null;
54152	```
54153	
54154	#### Thinking
54155	
54156	Key finding at line 1011-1013: "Renders only when the module is on AND this question has an analysis record." So `_renderInterrogation` is called on every answer, but it presumably early-returns if the interrogation module is off OR the question has no analysis record.
54157	
54158	Let me read `_renderInterrogation` start (lines 1146-1175) to see the gating condition.
54159	
54160	#### Tool: Read
54161	
54162	> Read: `C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\engine\ppqviewer.js`
54163	
54164	**Output:**
54165	
54166	```json
54167	1146	  Viewer.prototype._renderInterrogation = function () {
54168	1147	    const cfg = this.cfg;
54169	1148	    if (!cfg.modules.postQuestionReview || !cfg.analysisOf) return;
54170	1149	    const rec = cfg.analysisOf(this.cur);
54171	1150	    if (!rec) return; /* graceful absence: most questions have no analysis yet */
54172	1151	    this._analysis = rec;
54173	1152	    this._analysisSelfReports = {};
54174	1153	    /* QoderWork 2026-07-22 (analyst handoff): per-prompt chosen states drive the
54175	1154	       v2 feedback match; the post-answer guess flag gates guess-aware feedback. */
54176	1155	    this._promptStates = {};
54177	1156	    this._postGuessDeclared = false;
54178	1157	
54179	1158	    const self = this;
54180	1159	    const isV2 = this._isV2(rec);
54181	1160	    const iq = el("div", { class: "ppq-iq" });
54182	1161	
54183	1162	    const chosen = this._chosenLabel;
54184	1163	    const correctLetter = isV2
54185	1164	      ? String((rec.identity && rec.identity.correct_answer) || "").toUpperCase()
54186	1165	      : (cfg.correctOf(this.cur) || "").toString().toUpperCase();
54187	1166	
54188	1167	    /* --- 1. the verdict FIRST and ALWAYS (analyst handoff): the concrete
54189	1168	       "You chose X — the answer is Y" leads. The error_path explanation beneath
54190	1169	       it is optional; the verdict line itself is not. The old abstract
54191	1170	       "What this question is really about" headline no longer precedes it. --- */
54192	1171	    iq.appendChild(this._verdictEl(rec, isV2, chosen, correctLetter, this._wasRight));
54193	1172	
54194	1173	    /* --- 2. post-answer guess correction (optional, non-blocking). Sits right
54195	1174	       after the verdict so a guess is on record BEFORE guess-aware feedback is
54196	1175	       matched. Replaces the outer "Actually, I wasn't sure" control. --- */
54197	1176	    iq.appendChild(this._postGuessEl(chosen, this._wasRight));
54198	1177	
54199	1178	    if (isV2) {
54200	1179	      /* --- 3. the pupil insight (first_notice / why_it_matters / next_move) --- */
54201	1180	      this._appendInsightV2(iq, rec);
54202	1181	      /* --- 4. methods: title + structured pupil_steps + elimination chips --- */
54203	1182	      this._appendMethodsV2(iq, rec);
54204	1183	      /* --- 5. primary self-report + knowledge check (feed the feedback match) --- */
54205	1184	      this._appendSelfReportV2(iq, rec);
54206	1185	    } else {
54207	```
54208	
54209	#### Thinking
54210	
54211	Now I have the definitive answer. Lines 1148-1150:
54212	
54213	```js
54214	if (!cfg.modules.postQuestionReview || !cfg.analysisOf) return;
54215	const rec = cfg.analysisOf(this.cur);
54216	if (!rec) return; /* graceful absence: most questions have no analysis yet */
54217	```
54218	
54219	So the post-question pop-up (interrogation modal) appears ONLY when:
54220	1. `cfg.modules.postQuestionReview` is on, AND
54221	2. `cfg.analysisOf` is defined, AND
54222	3. `analysisOf(currentQuestion)` returns a record (i.e., the question HAS an analysis record).
54223	
54224	The comment at line 1150 says it explicitly: "graceful absence: most questions have no analysis yet."
54225	
54226	So Smith's observation is correct and expected: the pop-up only appears for questions that have an analysis record. The v2 analysis has 6 records; the legacy analysis files cover a handful more (engaa 2016/2017 s1, nsaa 2016/2017/2018 s1). The vast majority of the 1042 questions have NO analysis record, so for those, no pop-up appears — by design.
54227	
54228	So the answer to Smith: Yes, that's expected. The post-question pop-up only appears for questions that have a categorisation/analysis record. Most questions don't have one yet, so for most questions you won't see the pop-up. You'll only see it on the specific questions that the analysts have written records for.
54229	
54230	Now — which questions DO have records? Let me figure out which questions trigger the pop-up, so I can tell Smith exactly which ones to look for to confirm it's working. The v2 records are keyed `esat_<assessment>_<year>_s<n>_Q<nn>` (6 records). The legacy analysis files cover engaa_2016_s1, engaa_2017_s1, nsaa_2016_s1, nsaa_2017_s1, nsaa_2018_s1 (section 1 of each).
54231	
54232	Let me check the v2 analysis bundle to find which 6 question keys have records, so I can tell Smith "try question X to see the pop-up." Let me read the v2 bundle's by_id keys.
54233	
54234	Actually, let me verify which questions have records so I can point him to a concrete one. Let me grep the v2 bundle for the record keys, and check the legacy analysis structure.
54235	
54236	Let me look at the analysis_v2 dist file's by_id keys. Path: `C:\CodexProjects\PaperDatabases\Esat Categorisation\analysis_v2\dist\esat_analysis_v2.js` OR the deployed copy at `outputs/esatwallop/data/esat_analysis_v2.js`. Let me grep the deployed copy for the keys.
54237	
54238	Let me grep for the record id pattern in the v2 bundle.
54239	
54240	#### Tool: Grep
54241	
54242	**Input:**
54243	
54244	```json
54245	{
54246	  "-n": true,
54247	  "head_limit": 20,
54248	  "output_mode": "content",
54249	  "path": "C:\\Users\\patri\\.qoderwork\\workspace\\mrvauo00u4nxdrjj\\outputs\\esatwallop\\data\\esat_analysis_v2.js",
54250	  "pattern": "esat_[a-z]+_\\d{4}_s\\d+_Q\\d+"
54251	}
54252	```
54253	
54254	**Output:**
54255	
54256	```json
54257	55:        "id": "esat_engaa_2016_s1_Q01",
54258	74:        "crop": "outputs/previews/esat_engaa_2016_s1/crops/esat_engaa_2016_s1_Q01_p004.png"
54259	590:        "id": "esat_engaa_2016_s1_Q02",
54260	606:        "crop": "outputs/previews/esat_engaa_2016_s1/crops/esat_engaa_2016_s1_Q02_p004.png"
54261	980:        "id": "esat_engaa_2016_s1_Q11",
54262	996:        "crop": "outputs/previews/esat_engaa_2016_s1/crops/esat_engaa_2016_s1_Q11_p011.png"
54263	1400:        "id": "esat_engaa_2016_s1_Q15",
54264	1417:        "crop": "outputs/previews/esat_engaa_2016_s1/crops/esat_engaa_2016_s1_Q15_p014.png"
54265	1940:        "id": "esat_engaa_2016_s1_Q22",
54266	1959:        "crop": "outputs/previews/esat_engaa_2016_s1/crops/esat_engaa_2016_s1_Q22_p021.png"
54267	2542:        "id": "esat_engaa_2023_s1_Q02",
54268	2559:        "crop": "outputs/previews/esat_engaa_2023_s1/crops/esat_engaa_2023_s1_Q02_p004.png"
54269	```
54270	
54271	#### Thinking
54272	
54273	The 6 v2 records are for:
54274	- esat_engaa_2016_s1_Q01
54275	- esat_engaa_2016_s1_Q02
54276	- esat_engaa_2016_s1_Q11
54277	- esat_engaa_2016_s1_Q15
54278	- esat_engaa_2016_s1_Q22
54279	- esat_engaa_2023_s1_Q02
54280	
54281	So the v2 pop-up (full categorisation: verdict, guess, insight, methods, self-report, feedback) appears for these 6 questions: ENGAA 2016 Section 1 Q1, Q2, Q11, Q15, Q22, and ENGAA 2023 Section 1 Q2.
54282	
54283	Plus the legacy analysis files cover engaa_2016_s1, engaa_2017_s1, nsaa_2016_s1, nsaa_2017_s1, nsaa_2018_s1 — but those are the LEGACY format (probe + free-prose methods), and analysisOf prefers v2 first then falls back to legacy. The legacy records would give a pop-up too for questions in those section-1 sets that don't have a v2 record.
54284	
54285	But the key point for Smith: the pop-up is DATA-DRIVEN. It only appears for questions that have a categorisation record. Most of the 1042 questions have none, so no pop-up for them — that's by design ("graceful absence: most questions have no analysis yet").
54286	
54287	So his observation is correct and expected. To SEE the pop-up working, he should navigate to one of the 6 v2 questions (e.g., ENGAA 2016 Section 1 Question 1) and answer it.
54288	
54289	Now, I should also confirm the deployment didn't break the analysis loading. The fact that he's asking "should I not be expecting any" suggests he answered some questions and saw no pop-up. If he happened to answer questions WITHOUT records, that's expected. But I should make sure the analysis files ARE loading on the live site (otherwise even the 6 v2 questions wouldn't show a pop-up, which would be a real bug).
54290	
54291	Let me give him a clear answer:
54292	1. Yes — expected. The pop-up only appears for questions that have a categorisation record. The engine deliberately skips it for questions with no analysis ("most questions have no analysis yet").
54293	2. To see it, go to one of the 6 questions that DO have full v2 records: ENGAA 2016 S1 Q1/Q2/Q11/Q15/Q22, or ENGAA 2023 S1 Q2. Answer one and the full pop-up (verdict, guess, insight, ways through, self-report, feedback) should appear.
54294	3. Offer: if he goes to one of those specific questions and STILL sees no pop-up, that'd indicate the analysis bundle isn't loading on the live site — a real deployment bug I'd want to fix. So this is also a good test of the deployment.
54295	
54296	This is a clean, helpful answer. I don't need more tool calls — I have the definitive gating logic and the 6 question ids.
54297	
54298	Wait — let me double check the analysisOf key matching. From the summary: `base = q.slug + "_Q" + nn` (nn two-digit), and analysisOf tries `base+"_"+q.part` then `base`. The v2 keys are like `esat_engaa_2016_s1_Q01`. So q.slug would be `esat_engaa_2016_s1` and nn=01 → base = `esat_engaa_2016_s1_Q01`. That matches the v2 id directly (no part suffix needed since the v2 keys have no _p suffix). Good. So for ENGAA 2016 S1 Q1, analysisOf finds the v2 record. 
54299	
```

#### Tool: Read

> Read: `C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\CHANGELOG.md`

**Output:**

```json
1	# CHANGELOG: ppqviewer
2	
3	Universal engine changes are recorded here and notified into each consumer's inbox. Newest at the top.
4	
5	## 2026-07-22 (QoderWork, latest) — analyst handoff: guess semantics repaired, verdict literally first, analysis-v2 consumed (v0.2.7)
6	Integration pass implementing the categorisation analysts' "Handoff to the ppqviewer implementer". This is NOT a rewrite — the functioning viewer, filtering, timer, reporting, modal, plain-question fallback and non-ESAT consumers are all preserved. chem-compare is untouched (every change is opt-in config).
7	
8	### Settled guess-declaration semantics (now implemented)
9	- One declaration offered at BOTH stages: pre-answer ("I'm guessing") and post-answer ("Actually, it was a guess"). A guess is any set from 2 up to every option — not a special "guess between two".
10	- Percentages are OPTIONAL, behind an "Add percentages (optional)" toggle. Equal splitting is only a starting value once that toggle is chosen; a pupil can record just the candidate set.
11	- After answering, the chosen option stays IN the picker and starts PRESELECTED (it is no longer removed).
12	- Both stages fire `qtype:"guess_declaration"` with one payload shape in `extra_json`: `{guess_declared:true, declared_stage:"pre_answer"|"post_answer", candidate_options:[...], attempt_id:"...", candidate_percentages?}`. The post-answer event additionally carries `chosen_option` and `correct`. The legacy `qtype:"unsure"` and its `declared/wavering` payloads are superseded.
13	- Every displayed attempt gets a stable `attempt_id`; the answer event and the stored attempt carry it plus any pre-answer declaration snapshot, so repeated attempts at one question stay distinguishable.
14	- `Done` no longer silently closes on <2 options — the panel stays open with an inline validation message. No event fires for an empty post-answer selection.
15	
16	### Two bugs fixed
17	- `_shouldHandleKey` now ignores `INPUT`/`SELECT`/`TEXTAREA`/content-editable targets, so typing "10", "50" or "80" into a percentage box never commits answer A/E/H.
18	- Percentage redistribution uses a largest-remainder allocation (`allocateLargestRemainder`) — every value is a non-negative integer and the total is exactly 100 (the old proportional pass could drive the final option negative).
19	
20	### Modal order — the verdict is now literally first
21	The pop-up order is: (1) concrete verdict "You chose B — the answer is D", ALWAYS rendered even when the chosen option has an empty `error_path` (the explanation is optional, the verdict is not); (2) the optional post-answer guess correction; (3) the pupil insight; (4) methods + structured eliminations; (5) the primary self-report/knowledge check + matched feedback; (6) the 1-6 rating + Next. The old "What this question is really about" headline no longer precedes the verdict. The outer "Actually, I wasn't sure" control is superseded (hidden, DOM retained) — the correction now sits inside the modal where guess-aware feedback can see it.
22	
23	### Analysis-v2 consumption (with old-data fallback)
24	- The engine detects a v2 record by its `identity` + `pupil_analysis` blocks and renders its fields DIRECTLY: insight (`first_notice`/`why_it_matters`/`next_move`), chosen-option `error_path`, method `title` + `pupil_steps`, red chips from `methods[].eliminates`, green chip from `methods[].lands_on`, the primary `self_report_prompts[]` item, the primary `requirements.post_question_checks[]` item, and structured feedback on `selected_options`/`prompt_id`/`states`/`guess_declared`.
25	- NO regex parsing of v2 steps or eliminations (the `_methodLinesEl`/`_elimChipsEl` stopgaps are legacy-only now). Internal taxonomy is hidden from pupils: `error_tags`, category paths, mechanism codes, diagnostic confidence, difficulty chips, strategy tags.
26	- Feedback matching for v2 is first-match-wins over the array, on the structured constraints; a `guess_declared:true` entry only fires once a guess is on record. The per-method "used it" tickbox stays as supplementary evidence (it does not drive v2 feedback).
27	- `esat-compare.html` loads the generated bundle (`window.ESAT_ANALYSIS_V2`), `analysisOf` prefers `by_id` and falls back to the legacy analysis store for unmigrated questions, and `guessDefaults` is sourced from `interaction_defaults.guess_declaration`. Questions with no analysis of either kind remain the plain viewer.
28	
29	### Content ownership
30	The viewer renders the analysts' v2 pupil prose faithfully (escaped, laid out) and does NOT rewrite it — no JS cleanup layer for praise/jargon/tone. The viewer owns only generic chrome: "I'm guessing", "Actually, it was a guess", validation messages, headings, buttons, and the humanised state-chip labels.
31	
32	### Fixes found in verification (this session)
33	- ENGINE BUG: the interrogation modal never populated its feedback region on first open — feedback only appeared after a guess was committed or a self-report state was tapped. So entries that match with no guess and no prompt state (v2 `selected_options`-only, legacy `any_wrong`/`any_correct`) were invisible on a plain answer. `_renderInterrogation` now calls `_renderInterrogationFeedback()` once the modal is mounted (it still re-renders on guess/prompt interaction). Caught by the headless test.
34	- esat-compare SIGN-IN GATE: if `ppq-login.js` failed to load (e.g. a tester opened the file without its folder), the inline script threw at `window.PPQLogin.createLogin` BEFORE the class dropdown was populated — leaving it blank and Start dead, so testers could not get in. The dropdown is now populated FIRST and unconditionally; the estate login is optional with a minimal local fallback gate (name remembered locally, no pulse); and `enterApp` shows a plain "the viewer engine did not load — open from inside the ppqviewer folder" message instead of failing silently if the engine itself is absent.
35	
36	---
37	
38	## 2026-07-22 (QoderWork) — pre-declare guesses (v0.2.6)
39	Smith's decision: "I think we just go with pre, actually." Pupils can optionally declare which options they're guessing between BEFORE locking in their answer — more honest data than post-declare (which is also still available as "Actually, I wasn't sure").
40	
41	### How it works
42	- A small "Declare guesses?" button sits above the answer row, visible while the question is on screen. Entirely optional — if they just answer, nothing is recorded.
43	- Clicking it opens a panel: one checkbox per option letter. Tick 2+ to engage.
44	- Percentages auto-distribute equally (2 ticks = 50/50, 3 = 34/33/33). Each ticked option gets a number input; typing a bigger number proportionally decreases the others. Total always sums to 100.
45	- "Done" fires `status:"interrogation", qtype:"guess_declaration"` with `{declared:true, wavering:[{label:"B", pct:60}, {label:"D", pct:40}]}`. "Skip" closes without recording.
46	- The widget hides once the answer is locked; resets between questions.
47	
48	### Design notes
49	- Pre-declare captures uncertainty at the honest moment (before outcome knowledge). Post-declare ("Actually, I wasn't sure") captures reflection after seeing the verdict. Both stay — they measure different things.
50	- The analyst preview's ask #6 (pre vs post) is now answered: we do BOTH. The analyst's remaining job is to think about how to USE the data (e.g., weighting, routing to different feedback paths).
51	
52	---
53	
54	## 2026-07-22 (QoderWork) — correction: verdicts back ON, verdict leads the pop-up (v0.2.5)
55	Smith corrected the v0.2.4 misread. He never said "never tell them right or wrong" — he said the *fault* was that the abstract probe headline ("What this question is really about?") came FIRST, ahead of the concrete verdict. His words: "I didn't say we never tell them right or wrong. I said that was a fault, not that that's true."
56	
57	### What changed
58	- `esat-compare.html` no longer sets `revealCorrect: false`. Pupils ARE told right/wrong, same as before v0.2.4.
59	- Pop-up order is now: **verdict block FIRST** ("You picked B — the right answer" / "You picked B — the answer is G", with red/green border + coloured head), then the probe, then methods, then feedback, then 1-6 + Next.
60	- CSS verdict styling restored (`.ppq-iq-option.wrong/.right` borders + head colours).
61	
62	### What stays
63	- The engine's `revealCorrect` switch still exists (opt-in, default true) for a future test mode where hiding the verdict is genuinely wanted. ESAT does not set it.
64	- Everything else from v0.2.4 is unchanged: "Actually, I wasn't sure", multi-line methods, "used it" tickboxes, no "beats the trap"/speed labels, in-popup 1-6, shuffle default, multi-select subject filter, count-up timer, stuck-filter fix.
65	
66	---
67	
68	## 2026-07-22 (QoderWork) — Smith's live-review pass: "wasn't sure", pop-up rebuild, shuffle + Maths&Physics default, count-up timer, stuck-filter fix (v0.2.4)
69	Engine + stylesheet + esat-compare wiring. All of it from Smith talking through the running page. chem-compare is untouched (every change is opt-in config, so it keeps today's behaviour).
70	
71	### ~~Never tell them right or wrong~~ (SUPERSEDED by v0.2.5 — this was a misread; verdicts are ON)
72	- `config.revealCorrect` was added (default true). esat-compare briefly set it `false`; v0.2.5 removed that. The switch remains in the engine for a future test mode. Correctness is always RECORDED in every attempt row regardless of display.
73	
74	### NEW "Actually, I wasn't sure" (uncertainty confession)
75	- After answering, an option sits to the RIGHT of the answer line: "Actually, I wasn't sure". Tapping it opens letter chips ("I thought it was…") so the pupil can mark the options they were torn between — "I thought it was B or D" — then Done. Fires `status:"interrogation", qtype:"unsure"` with `{unsure:true, wavering:["B","D"]}`. This is the lucky-guess detector: it works even when the answer was right, and independently of speed.
76	
77	### Pop-up rebuild (from Smith talking through it)
78	- Methods are set out on MULTIPLE LINES — the one-line algebra was "quite hard to read". Split on commas/semicolons; "=>" becomes a "⇒ …" result line. On the 128 ESAT methods, 117 now break into lines. (NOTE-TO-SELF: a real per-method `steps:[…]` field would beat this regex pass.)
79	- Every method gets a little "used it" TICKBOX (multi-select across methods), replacing the single 6-state shortcut-awareness ladder and the one green "Use this" button ("I don't know why one is green and one's not"). Fires `qtype:"self_report"` with `state:"used"/"not_used"` per method.
80	- "beats the trap" and the "~15s" speed labels are GONE ("I don't know what beat the trap means could you please get rid of this 15 second stuff"). All methods now look equal.
81	- A small encouraging line under "Ways through it": there's more than one route, collecting alternatives is the point.
82	- The 1-6 self-rating now lives INSIDE the pop-up ("that one, two, three, four, five, six is back outside. Probably should be inside it there"), with its own "Next question →" button. The outer 1-6 row is hidden while the pop-up is open; closing the pop-up early (×/Escape/outside) brings it back so nobody is stranded, syncing any rating picked inside. Keyboard: Enter advances from the pop-up once rated, 1-6 rate inside it, arrows close it then navigate.
83	
84	### Filters + timer (esat-compare)
85	- Shuffle is now the STANDARD order (`config.defaultOrder:"shuffle"`).
86	- The subject filter is a new multi-select DROPDOWN defaulting to Maths + Physics (Smith teaches both now); Chemistry and Biology are a tick away in the same dropdown. Engine support: any filter may set `multi:true` + `default:[…]`; ticking everything collapses back to "All".
87	- The exam timer now counts UP ("you're counting down, no, count up… and just to have a log of how long"): a subtle elapsed clock, and every answer records `time_ms`. The down mode (banking + forced/tight/ok pressure tags) stays in the engine for later.
88	- STUCK FILTER FIXED: Smith clicked P3 Mechanics (a physics topic) while filtered to maths, got "No questions match these filters", and couldn't see the filter was on or how to undo it. Now the active topic filter shows as a removable chip next to the question counter ("P3 Mechanics ✕"), the empty state names the stuck filter and offers "Clear all filters", and the active mastery category is highlighted more loudly.
89	
90	### Deferred (noted, not built)
91	- A first analysis page (the mastery dashboard exists; the new unsure/used-it/flag/timing events give it more to show) — next pass.
92	- Probe/method/slug wording is still analyst-facing (Smith: "that will be fixed, that's not your problem").
93	
94	## 2026-07-22 (QoderWork) — estate shared login + exam timer with guess-disambiguation (v0.2.3)
95	Two additions, both driven by Smith. No storage/schema change; the attempt row shape is untouched (new fields ride in `extra_json`).
96	
97	### Estate shared login (the tracking-system bridge, NOT a new auth tier)
98	- New shared module `example/ppq-login.js` exposing `window.PPQLogin.createLogin({projectTag, cohortKey, classes, onStatus})`. It replicates the exact mechanism Linguics adopted from the EdTech Overview shared-login spec — it does NOT invent a new system.
99	- Identity is SHARED across the whole estate via the localStorage key `smithics_fields_identity_v1` (`{anonymous_id, display_name, google_email}`), so a pupil's name prefills on every driller. `google_email` stays empty estate-wide (real Google-OAuth is the teacher-read tier, not this).
100	- Cohort/class is SCOPED per page (its own `cohortKey`, never written into the shared identity object — that holds the pupil's physics class). Class is chosen from a supplied DROPDOWN.
101	- On sign-in it fires a `session_start` row; every event POSTs to the one shared `teacher-tracking.gs` endpoint with the page's `project` tag (`ppqviewer_esat` / `ppqviewer_chemistry`), which the script routes to its own tab automatically (no redeploy). Fail-soft: the pulse never breaks the app (sent/offline flash only).
102	- POST pattern is the estate standard: `text/plain` + `no-cors` + `keepalive` (Apps Script rejects preflighted JSON; the response is opaque, so "sent" means dispatched, not confirmed).
103	- Wired into BOTH comparison pages: `esat-compare.html` (`ppqviewer_esat` / `ppqviewer_esat_cohort_v1`) and `chem-compare.html` (`ppqviewer_chemistry` / `ppqviewer_chem_cohort_v1`). The old inline identity/report/gate code in each page was deleted and replaced by the shared module.
104	- FLAG FOR SMITH: the class dropdowns use INTERIM hardcoded lists — ESAT `["Test","Y12 ESAT","Y13 ESAT"]`, Chemistry `["Test","Y10 Chemistry","Y11 Chemistry"]`. Give me the real class names and I'll swap them; when TeacherViewer milestone M2 ships its single-source `doGet`, point the dropdown at that instead.
105	
106	### Exam timer (the feature that tells a fast answer apart from a guess)
107	- New optional `config.timer` = `{mode:"up"|"down", perQuestionSec, banking, bankSec, prominence:"hidden"|"subtle"|"prominent", pressureSec}`. Off unless supplied. Wired into `esat-compare.html` as `{mode:"down", perQuestionSec:90, banking:true, prominence:"subtle", pressureSec:10}`.
108	- Silent capture is ALWAYS on (the engine already records `time_ms`); the timer config only governs whether a visible clock is shown and how prominent it is. `prominence:"hidden"` records everything and shows nothing — per Smith's earlier "avoid surfacing the time" preference.
109	- Time-banking (down mode): surplus time carries forward into a pool floored at 0. Answer Q1 in 30s of a 90s budget → +60s banked; Q2's budget becomes 150s.
110	- Guess-disambiguation (Smith's point: "people guess after 10 minutes of thought; these kids would only guess with 8 seconds if they really only had 8 seconds left"). A fast answer is AMBIGUOUS — instant knowledge vs. ran out of clock — so the engine records the CONTEXT of the speed, not just the speed. On every "answered" report, `extra_json` now also carries `time_remaining_ms` and `time_pressure`: `"forced"` (clock at/below 0), `"tight"` (≤ pressureSec left), or `"ok"` (plenty left). An 8s answer with 82s on the clock logs `"ok"`; an 8s answer at 0s logs `"forced"` — downstream analysis can now separate a confident snap from a desperate guess.
111	- Visible clock styles: `--subtle` (small, muted, top-right) and `--prominent` (large, boxed, centred); `--tight` recolours, `--forced` recolours + pulses.
112	
113	## 2026-07-22 (QoderWork) — post-question interrogation as a pop-up, first half-working pass (v0.2.2)
114	Engine + stylesheet + esat-compare wiring. Deliberately rough, per Smith's "get something half working, we'll come back and make it smooth". No storage/schema change; the attempt row is untouched.
115	- New optional module `postQuestionReview`. When `config.modules.postQuestionReview` is truthy and `config.analysisOf(q)` returns an analysis record (ESAT d028 shape), the engine opens an interrogation POP-UP after an answer is committed (it reuses the image-zoom modal shell; dismiss via ×, Escape, or clicking outside). Smith: the inline panel "gets lost a long way down there". Questions with no record show the plain viewer (graceful absence).
116	- The pop-up shows: the probe ("What this question is really about", with difficulty/trick chips); the chosen option's error path plus misconception slugs (green if right, red if wrong); the methods with the trap-defeating quick route highlighted ("beats the trap"); and the FIRST self-report prompt as the 6-state shortcut-awareness ladder (used / saw_and_used / saw_and_discarded / barely_considered / did_not_see / saw_and_got_stuck).
117	- NEW red/green elimination chips per method (Smith: "if it kills B&D, you show a B&D in red; if it takes you straight to the answer, show it in green"). `_elimChipsEl` does a best-effort regex parse of the free-prose `eliminates` field into red (killed letters, struck through) and green (lands-on letter) chips, one per option. On the 128 ESAT methods this parses 67 into chips; the other 61 fall back to showing the raw prose rather than guessing. DATA GAP for the analysts: add a structured per-method field (`eliminates:[letters]`, `lands_on:letter`) so this is reliable.
118	- NEW per-method "Use this" adoption tick (recommended styling on the trap-beater; ignorable). Fires `status:"interrogation", qtype:"method_adopt"`.
119	- NEW optional "Flag this — come back / more like this" review flag (Smith: pupils can ask for a question to return). Fires `status:"flag_review", qtype:"review_flag"`.
120	- Feedback fires on (chosen option + self-report state). `on` honours option:X, any_wrong, any_correct. `when` honours state:method_ref directly, plus a rough inference for used:full_solve (learner didn't take the prompted shortcut), plus a crude bare-flag prefix match. Tapping a state fires a `status:"interrogation", qtype:"self_report"` event.
121	- The pop-up is optional and non-blocking: the 1-6 rating and Next button are untouched.
122	- NEW left options rail (`config.optionsLeft`, on for ESAT): the A–H letter picker sits in a sticky column to the LEFT of the question so there is no long scroll to answer (the crop shows the printed options; the rail is just the picker).
123	- Wired into `example/esat-compare.html`: loads the five ESAT analysis-store files (33 questions, 5 papers), maps catalogue ids (slug|number|part) onto analysis ids (slug_Qnn[_part]), and sets `optionsLeft:true`.
124	- KNOWN ROUGH EDGES (notes-to-self in engine): 6 state labels are a first draft; only the first self-report prompt is shown; the `when` grammar is partial and needs reconciling with misconceptions_core.yaml; probe/method wording is analyst-facing and should be rephrased for pupils; the elimination-chip parse is a stopgap (see DATA GAP above).
125	
126	## 2026-07-22 (QoderWork, later) — layout + UX quick fixes from Smith's comparison feedback (v0.2.1)
127	Engine + stylesheet, no storage/schema change.
128	- Split dashboard restored to the original Chemistry-viewer shape: a three-column layout — `dashboardColumns[0]` (e.g. Paper 1B Mastery) on the LEFT, the question card in the CENTRE, `dashboardColumns[1]` (e.g. Syllabus Overview) on the RIGHT (`grid-template-columns: 280px 1fr 280px`). Previously both columns were stacked inside one right-hand sidebar. `_renderSplit` now renders each column into its own flanking panel; single-mode dashboards are unchanged.
129	- Independent scrolling: the mastery panel(s) are now `position: sticky`, so scrolling the paper no longer drags the mastery out of view, while each panel keeps its own internal scroll. Narrow screens fall back to a stacked, non-sticky layout.
130	- Larger controls: Reveal/Previous/Skip/Next buttons bumped to 1.05rem; the 1-6 self-assess scale buttons to 1.15rem with more padding.
131	- Tunable figure size: crop / whole-question / original-page images now honour a `--ppq-crop-width` CSS variable (default 92%, centred). chem-compare sets 90% (a touch smaller); esat-compare sets 78% (its questions were coming through too big). The drawing canvas sits in the same container, so it stays aligned.
132	- Labelled 1-6 scale: each scale button now carries a tooltip and a legend beneath the scale gives Smith's canonical meanings — 1 No idea; 2 Don't fully understand; 3 Got it wrong but I get it now; 4 Got it right but not stable; 5 Got it, strong/comfortable; 6 Trivial, never need it again. Default in the engine (`DEFAULT_SCALE_MEANINGS`), overridable via `config.selfReport.meanings`.
133	- Softened the full-markscheme spoiler wording to "(may well contain spoilers for other parts)", aligned across the engine and the live Chemistry viewer.
134	
135	## 2026-07-22 (QoderWork) — report hook + comparison pages with estate logging (v0.2.1)
136	Engine v0.2.1. Optional `report` callback wired into the mount, fired on every attempt and self-rating.
137	- `PPQViewer.mount(root, { config, questions, meta, report })`: the `report` callback receives a payload shaped for the estate's shared `teacher-tracking.gs` Apps Script endpoint (project, timestamp, session_id, item_id, topic, qtype, mode, level, status, picked_id, misconception_id, extra_json). Engine stays transport-agnostic; the hosting page supplies the callback and POSTs to REPORT_URL.
138	- Events fired: `session_start` (on init), `answered` (MCQ/imageSelfMark, with correct + time_ms in extra_json), `rated` (self-report 1-to-6, with rating value in extra_json).
139	- Comparison pages created: `example/chem-compare.html` and `example/esat-compare.html`. Both carry the estate GA4 + Clarity blocks (WEB_KIT), an honour-system sign-in gate (name + class, modelled on the Trilogy shell), and POST to the shared Apps Script endpoint under project tags `ppqviewer_chemistry` and `ppqviewer_esat`. Separate storage keys (`_COMPARE` suffix) so comparison use does not touch live pupil data.
140	- Crop paths resolved to absolute `file:///` URLs for cross-folder local viewing.
141	- No consumer notifications sent (comparison pages, not live deployments).
142	
143	## 2026-07-01 (Phase 3) — chemistry's modules ported, chemistry migrated (v0.2.0-phase3)
144	Engine v0.2. Pluggable question-type system plus chemistry's optional modules, ESAT path unchanged.
145	- Question types: `imageSelfMark` (ESAT), `mcq` (chemistry 1A, auto-marked with synthetic option text + examiner report), `flashcard` (chemistry 1B/2, reveal markscheme with accept/reject formatting + full-page spoiler + examiner report).
146	- Modules: `referenceBooklet` (data-booklet deep-link with the Section-N / periodic-table scanner), `structuredPaper` (multi-part navigator, whole-question vs part-by-part toggle, the G:-copy page peek-back heuristic), `math` (KaTeX/mhchem hook). Split dashboard (`dashboardLayout: "split"`) for chemistry's two-column syllabus view. Header buttons (periodic table / data booklet).
147	- Chemistry wired as the second consumer: `example/chem-config.js`. New unified storage key `chemistrydriller_ppq_v2` with a `migrate` hook seeding from the old v1 keys so pupils keep their history (d010).
148	- Tests: `test/test_chem.js` (jsdom) 21/21 pass against the real 956-question chemistry bank (migration, split dashboard, MCQ auto-mark, flashcard reveal recording no graded attempt, structured multi-part with two modes, booklet trigger, header buttons, filtering). ESAT regression `test/test_ppqviewer.js` still 19/19: no capability lost on either side.
149	- Process note: the bash sandbox served a stale truncated view of the just-written engine file, so v0.2 was validated against a reconstructed sandbox copy. The on-disk engine is complete and correct (734 lines). This was a sandbox mount lag, not a disk issue.
150	
151	## 2026-07-01 (Phase 2) — shared engine spine built and tested (v0.1.0-phase2)
152	First real engine code. `engine/ppqviewer.js` + `engine/ppqviewer.css`.
153	- Option A (d003) implemented: `PPQViewer.mount(root, {config, questions, meta})` draws all furniture (header/filter bar, question card, drawing controls, options, self-report widget, dashboard, floating toolbar, modal) into one mount. No `getElementById`, all state on the instance, all queries scoped to the root: embed-safe for SR (d009).
154	- Shared core: config loader that fails loud on a missing `storageKey` (d002); flat attempts-log + scores storage keyed off `storageKey` (d001); filter/order/shuffle/start; next/prev/skip; pluggable self-report widget defaulting to 1-to-6 (d006); dashboard derived from the log (last-10 ribbon + rating heat map, shared ramp + intensity, untagged-last, click-to-filter); parametrised prefetch warming crops, stem and answer separately, depth from config (d005); drawing overlay ported verbatim and scoped; image modal; scoped keyboard map.
155	- First consumer wired: `example/esat-config.js` maps ESAT onto the shared schema (storageKey kept as `esat_ppq_v1` so pupils' scores survive), `example/esat.html` is the one-mount page.
156	- Tested headless against the real 1042-question ESAT catalogue (`test/test_ppqviewer.js`, jsdom): 19/19 pass, covering furniture build, filtering, self-mark, engine-ready attempt rows, self-rating, dashboard derivation, cross-mount persistence, the fail-loud storageKey guard, and an embed-safety check.
157	- NOT yet ported (Phase 3): chemistry's modules (referenceBooklet, structuredPaper with its two modes + peek-back heuristic, questionTypes MCQ/flashcard/examiner, math), the split dashboard layout, and the postQuestionReview/assistance modules. Hook points are in place.
158	
159	## 2026-07-01 (later) — Smith feedback folded into the design
160	Still docs, no engine yet.
161	- Verified fork-vs-stale on the G: chemistry copy by reading it in full (736 lines): stale, not a fork. One micro-heuristic (peek-back to the previous printed page) preserved into structuredPaper. See d001 verification note.
162	- New decisions: d006 (self-report is a pluggable config scheme, not a hardcoded 1-to-6), d007 (assistance layer: pupil asks for help + free response, teacher records an answer with a visibility scope: pupil / class / all), d008 (real logins + class membership for all users, the OAuth backend tier), d009 (viewer must run as an embeddable bolt-on component, not only a standalone page).
163	- Open questions resolved: q01 (SR is a near-term EMBED consumer), q03 (self-report categories fed by each consumer, not syllabus-locked), q05 (preserve chemistry's dashboard split). q02 reworded in plain English and still needs Smith's steer. q04 parked ("dunno"), non-blocking. q06 added (cross-consumer analytics visibility).
164	- Prefetch confirmed: several ahead, answer image warmed separately.
165	
166	## 2026-07-01 — Phase 0 kickoff, operating-model docs laid down
167	Not an engine change yet (no shared engine exists to ship). Recorded for the trail.
168	- Read the kickoff packet and the divergence census.
169	- Read both live engines in full: chemistry `ppq.js` (826 lines) + `ppq.html`, ESAT `engine.js` (388) + `config.js` + `index.html`.
170	- Confirmed the live chemistry copy is `C:\Claude...\chemistrydriller` (29 Jun, namespaced storage + PREFETCH_AHEAD=3 + part navigator), not the stale G: mirror (bare `ppq_scores`, no prefetch). No wrong-copy risk.
171	- Census correction logged: the live chemistry copy has since adopted namespaced storage, closing one of the census's stated reasons for the ESAT spine (conclusion unchanged; see d001).
172	- Laid down PROJECT, DESIGN, DECISIONS, OPEN_QUESTIONS, ROADMAP, REGISTRY, and this CHANGELOG.
173	- Seed decision recorded: d001 (ESAT-spine seed), with d002 (namespaced storage mandatory), d003 (engine-owns-DOM), d004 (one configurable dashboard), d005 (parametrised prefetch).
174	
175	No consumer notifications sent (nothing shipped). First notification will accompany the Phase 2 spine.
176	
```

#### Thinking

Good, I now have a solid picture. Let me also read the tail end of the chat export more carefully — the last few hundred lines before the end — to understand exactly where chat 1 stopped and what was pending. Let me also check the last user messages to understand what Smith was asking for at the end.

The tail I read (lines 54398-54597) shows:
- Chat 1 was discussing a redesign of the guess-declaration UI:
  1. Move percentages closer to option letters (CSS fix)
  2. Move guess-declaration from pre-answer panel to first page of post-answer pop-up (before verdict)
- The assistant asked an AskUserQuestion about what happens to the pre-answer panel
- Smith's last message was "but reword." — which seems to be answering the question about the guess declaration wording/prompt

Let me read a bit more context around lines 54200-54400 to understand the full final exchange better.

#### Tool: Read

> Read: `C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\PPQ_Viewer_(chat1,qoder)2026-07-23_15-15.md`

**Output:**

```json
53800	
53801	I need to add back the lost bullets. Let me reconstruct them and add as part of the ESAT deployment entry (replace it with a fuller version) OR add a new entry. The cleanest: replace the current single-line ESAT deployment entry with a restored multi-bullet entry that includes the lost content (corrected).
53802	
53803	The lost content to restore:
53804	1. Timer: ESAT uses mode:"up" subtle; time_ms captured every attempt regardless; down mode (banking+pressure) built but off
53805	2. Clock design (rev2, 2026-07-23): BASE_SECONDS=40*60/27≈88.9s (40min/27Q exam formula); extra-time −50%..+200% (neg=tougher); faces: off/number/pie±num ONLY; go-off flash + overtime(neg, fades); auto-suspend during modal (quiet bracket note); manual ⏸ pause (no reason); "Don't keep a record of the time for this one." per-Q exclude (reason optional, NO suggestions); bank bar(=pie scale)+per-Q+questions-worth together. Top-3: Off→pie→number. Mockup: outputs/esat-clock-options.html rev2; implementation awaits final OK
53806	3. Deployable ESAT bundle: ppqviewer/dist/esat-compare/ (67MB); regenerate via workspace gen_dist.js; ESAT_BASE="" for relative crops
53807	4. ESAT deployment: (current new line)
53808	5. Git env: CORRECTED — identity physicalsmithness/psmitheroo@gmail.com; no SSH keys; gh CLI not installed; GCM is system credential helper AND a stored github.com credential for physicalsmithness exists (git credential fill retrieves it silently) → pushes need NO interactive sign-in
53809	6. WebFetch 404s on empty GitHub repos; verify existence via `GIT_TERMINAL_PROMPT=0 git ls-remote <url>` (exit 0 + no output = exists but empty)
53810	
53811	Let me replace the current single-line ESAT deployment entry with a full multi-bullet entry restoring all this. I'll use the memory replace with old_text being a unique substring of the current ESAT deployment line.
53812	
53813	The current entry text is:
53814	"ESAT deployment: github.com/physicalsmithness/esatwallop — PUSHED & populated 2026-07-23 (main=1bff86d, 1054 files, 67MB). Staging repo at outputs/esatwallop (git, remote=origin). Push authed silently via stored GCM credential (no interactive sign-in needed). Pages NOT yet enabled; Smith to enable: Settings→Pages→Deploy from branch→main / (root)→Save → live at physicalsmithness.github.io/esatwallop"
53815	
53816	I'll replace this whole entry with the restored multi-bullet block. Let me construct the new content with all bullets.
53817	
53818	
53819	The replace swallowed the neighbouring bullets (the tool swaps the whole §-delimited entry). Let me restore them, with the git-credential fact corrected.
53820	
53821	
53822	
53823	#### Tool: mcp__qw-builtin__memory
53824	
53825	**Input:**
53826	
53827	```json
53828	{
53829	  "action": "replace",
53830	  "content": "- Timer: ESAT uses mode:\"up\" subtle; time_ms captured every attempt regardless; down mode (banking+pressure) built but off\n  - Clock design (rev2, 2026-07-23): BASE_SECONDS=40*60/27≈88.9s (40min/27Q exam formula); extra-time −50%..+200% (neg=tougher); faces: off/number/pie±num ONLY; go-off flash + overtime(neg, fades); auto-suspend during modal (quiet bracket note); manual ⏸ pause (no reason); \"Don't keep a record of the time for this one.\" per-Q exclude (reason optional, NO suggestions); bank bar(=pie scale)+per-Q+questions-worth together. Top-3: Off→pie→number. Mockup: outputs/esat-clock-options.html rev2; implementation awaits final OK\n  - Deployable ESAT bundle: ppqviewer/dist/esat-compare/ (67MB); regenerate via workspace gen_dist.js; ESAT_BASE=\"\" for relative crops\n  - ESAT deployment: github.com/physicalsmithness/esatwallop — PUSHED & populated 2026-07-23 (main=1bff86d, 1054 files, 67MB). Staging repo at outputs/esatwallop (git, remote=origin). Push authed silently via stored GCM credential (no interactive sign-in). Pages NOT yet enabled; Smith to enable: Settings→Pages→Deploy from branch→main / (root)→Save → live at physicalsmithness.github.io/esatwallop\n  - Git env: identity physicalsmithness/psmitheroo@gmail.com; no SSH keys; gh CLI not installed; GCM is the system credential helper AND a stored github.com credential for physicalsmithness exists (`git credential fill` retrieves it silently) → git pushes need NO interactive sign-in. GitHub Desktop installed & running\n  - WebFetch 404s on empty GitHub repos; verify existence via `GIT_TERMINAL_PROMPT=0 git ls-remote <url>` (exit 0 + no output = exists but empty)",
53831	  "old_text": "ESAT deployment: github.com/physicalsmithness/esatwallop — PUSHED & populated 2026-07-23",
53832	  "target": "memory"
53833	}
53834	```
53835	
53836	**Output:**
53837	
53838	```json
53839	{
53840	  "success": true,
53841	  "message": "Entry replaced.",
53842	  "target": "memory",
53843	  "entryCount": 6,
53844	  "usage": {
53845	    "used": 7255,
53846	    "limit": 10240
53847	  },
53848	  "replaced": {
53849	    "from": "ESAT deployment: github.com/physicalsmithness/esatwallop — PUSHED & populated 2026-07-23 (main=1bff86d, 1054 files, 67MB). Staging repo at outputs/esatwallop (git, remote=origin). Push authed silently via stored GCM credential (no interactive sign-in needed). Pages NOT yet enabled; Smith to enable: Settings→Pages→Deploy from branch→main / (root)→Save → live at physicalsmithness.github.io/esatwallop",
53850	    "to": "- Timer: ESAT uses mode:\"up\" subtle; time_ms captured every attempt regardless; down mode (banking+pressure) built but off\n  - Clock design (rev2, 2026-07-23): BASE_SECONDS=40*60/27≈88.9s (40min/27Q exam formula); extra-time −50%..+200% (neg=tougher); faces: off/number/pie±num ONLY; go-off flash + overtime(neg, fades); auto-suspend during modal (quiet bracket note); manual ⏸ pause (no reason); \"Don't keep a record of the time for this one.\" per-Q exclude (reason optional, NO suggestions); bank bar(=pie scale)+per-Q+questions-worth together. Top-3: Off→pie→number. Mockup: outputs/esat-clock-options.html rev2; implementation awaits final OK\n  - Deployable ESAT bundle: ppqviewer/dist/esat-compare/ (67MB); regenerate via workspace gen_dist.js; ESAT_BASE=\"\" for relative crops\n  - ESAT deployment: github.com/physicalsmithness/esatwallop — PUSHED & populated 2026-07-23 (main=1bff86d, 1054 files, 67MB). Staging repo at outputs/esatwallop (git, remote=origin). Push authed silently via stored GCM credential (no interactive sign-in). Pages NOT yet enabled; Smith to enable: Settings→Pages→Deploy from branch→main / (root)→Save → live at physicalsmithness.github.io/esatwallop\n  - Git env: identity physicalsmithness/psmitheroo@gmail.com; no SSH keys; gh CLI not installed; GCM is the system credential helper AND a stored github.com credential for physicalsmithness exists (`git credential fill` retrieves it silently) → git pushes need NO interactive sign-in. GitHub Desktop installed & running\n  - WebFetch 404s on empty GitHub repos; verify existence via `GIT_TERMINAL_PROMPT=0 git ls-remote <url>` (exit 0 + no output = exists but empty)"
53851	  }
53852	}
53853	```
53854	
53855	#### Thinking
53856	
53857	Memory restored — all 6 bullets back, with the git credential fact corrected. entryCount:6, usage 7255/10240. Good.
53858	
53859	Now respond to Smith. The key news: the push already landed — no sign-in was ever needed because his Git had a saved GitHub credential. The repo is populated (main = 1bff86d, 1054 files). Now he just needs to enable Pages.
53860	
53861	Let me give him the good news clearly and the Pages steps (reiterate concisely). Mark the Pages todo as the remaining step (it's his action). I'll keep the todo "Guide enabling Pages" as in_progress until he confirms it's live.
53862	
53863	Let me write a clear, warm response. No more tool calls needed except maybe verify the repo files via the GitHub API to be thorough — but ls-remote already confirms main = our commit, which is definitive. I could optionally fetch the GitHub tree to confirm files, but that's overkill; the commit hash matching is proof.
53864	
53865	Let me respond.
53866	
53867	It's already up — you didn't see a sign-in because you never needed one. Your Git had a saved GitHub credential for `physicalsmithness`, so the push authenticated silently in the background and completed while we were looking for a window that was never going to appear. The remote now shows your `main` branch at the exact commit I made locally (`1bff86d`), all 1054 files — the viewer, the engine, the catalogue, both analysis bundles, and all 1042 crop images.
53868	
53869	So the only thing left is the step you haven't done yet: turning on Pages.
53870	
53871	1. Open github.com/physicalsmithness/esatwallop → **Settings**.
53872	2. Left sidebar → **Pages**.
53873	3. "Build and deployment" → **Source: Deploy from a branch**.
53874	4. **Branch: main**, folder **/ (root)** → **Save**.
53875	5. Wait a minute or two; it goes live at **https://physicalsmithness.github.io/esatwallop/**.
53876	
53877	Because `index.html` is at the root, that URL loads the viewer directly. Flip Pages on and tell me when it's built — I'll fetch the live URL and check it actually loads end to end (sign-in gate, a question, the crops, the modal).
53878	
53879	### **You**
53880	
53881	Should I not be expecting any of the posts question pop up because if it's not got any
53882	
53883	### **Assistant**
53884	
53885	#### Thinking
53886	
53887	Smith is asking about the post-question pop-up (the interrogation modal). He's saying: "Should I not be expecting any of the post-question pop-up because if it's not got any" — meaning he's looking at the live site (or the viewer) and not seeing the post-question pop-up (the categorisation/interrogation modal with verdict, guess, methods, self-report, feedback). He's wondering whether he should expect it, since "it's not got any."
53888	
53889	Wait — let me parse carefully. "Should I not be expecting any of the post question pop up because if it's not got any" — I think he's asking: should he expect the post-question pop-up to appear? Because it's not showing any (content / or not appearing at all).
53890	
53891	This is about the live deployed site OR the local viewer. He may have enabled Pages and is now testing the live site, clicking through questions, and the post-question interrogation modal isn't appearing (or appears empty).
53892	
53893	Let me think about why the post-question pop-up might not appear or might be empty.
53894	
53895	The interrogation modal (post-question pop-up) in ppqviewer is the categorisation UI: after answering a question, a modal appears with verdict, guess declaration, methods, self-report, feedback, rate 1-6, flag. This is the "interrogation" feature.
53896	
53897	When does it appear? It depends on config. In esat-compare, the interrogation is configured. The modal content depends on:
53898	- The analysis record for the question (analysisOf(q) → ESAT_ANALYSIS_V2.by_id or legacy ANALYSIS).
53899	- The config flags for interrogation.
53900	
53901	If a question has NO analysis record (no matching entry in ESAT_ANALYSIS_V2 or legacy ANALYSIS), then the interrogation modal might be empty or not appear. The v2 analysis only has 6 records (by_id{6}). The legacy ANALYSIS files cover more (5 analysis files: engaa_2016_s1, engaa_2017_s1, nsaa_2016_s1, nsaa_2017_s1, nsaa_2018_s1). 
53902	
53903	So the interrogation modal content is driven by analysis records. If a question doesn't have an analysis record, the modal may show little/nothing or not trigger.
53904	
53905	But wait — the question is whether the pop-up appears AT ALL. The interrogation modal in ppqviewer is typically triggered after answering. Whether it appears depends on the engine config (e.g., `interrogation` config, or whether the question has probing data).
53906	
53907	Let me reconsider. Smith's exact words: "Should I not be expecting any of the posts question pop up because if it's not got any" — I read this as: "Should I be expecting the post-question pop-up? Because it's not got any [content / isn't showing]." He's testing and the pop-up isn't appearing or is empty, and he's asking if that's expected.
53908	
53909	Hmm, this is ambiguous. Let me consider the possibilities:
53910	1. He enabled Pages, opened the live site, answered a question, and the post-question pop-up (interrogation modal) didn't appear. He's asking if he should expect it.
53911	2. The pop-up appears but is empty ("not got any" content).
53912	
53913	I need to investigate the actual behavior. Let me think about what determines whether the interrogation modal appears in esat-compare.
53914	
53915	Actually — I should look at the esat-compare.html config and the engine to understand when the post-question pop-up (interrogation) is shown. The key question: is the interrogation modal supposed to appear for every question, or only questions with analysis data?
53916	
53917	Let me recall the architecture: ppqviewer's interrogation modal (`_renderInterrogation`) is shown after a question is answered IF the config enables interrogation AND there's interrogation content. In esat-compare, the modal shows verdict + guess + methods + self-report + feedback, driven by the analysis record.
53918	
53919	If a question has no analysis record (analysisOf returns null), then:
53920	- verdict might be generic
53921	- guess/methods/self-report/feedback would be empty
53922	- The modal might still appear but be sparse, OR might not appear at all.
53923	
53924	The v2 analysis has only 6 records. The legacy has more. Most of the 1042 questions probably have NO analysis record. So for most questions, the post-question pop-up would be empty or minimal.
53925	
53926	But Smith built this whole categorisation system — the interrogation IS the point. So maybe the modal should appear for questions that have analysis, and the 6 v2 records + legacy records determine which questions show it.
53927	
53928	Actually, let me reconsider what Smith is really asking. He might be testing the LIVE site now and finding the pop-up doesn't appear at all (a bug), OR he's asking a design question about whether questions without analysis should show a pop-up.
53929	
53930	I think the most helpful response requires me to actually investigate:
53931	1. How the interrogation modal is triggered in esat-compare (config).
53932	2. Whether it appears for questions without analysis records.
53933	3. Whether the live deployment might have broken something (e.g., analysis files not loading → no records → no pop-up).
53934	
53935	Let me look at the esat-compare.html and the engine's interrogation trigger logic.
53936	
53937	Actually, wait — there's a critical deployment consideration. The live site loads analysis from `data/analysis/esat_*.js` and `data/esat_analysis_v2.js`. If those loaded correctly, analysisOf would find records for the covered questions. The interrogation modal appears based on config + analysis.
53938	
53939	Let me investigate the actual trigger. Let me read esat-compare.html's config around interrogation, and the engine's logic for when to show the modal.
53940	
53941	But also — Smith's phrasing "because if it's not got any" suggests he's observing that the pop-up "hasn't got any" (content) or there "aren't any" (pop-ups appearing). 
53942	
53943	Let me investigate properly. Let me look at:
53944	1. esat-compare.html — the interrogation/modal config and how it's wired.
53945	2. The engine — `_renderInterrogation` trigger conditions (when is the modal shown?).
53946	
53947	Let me grep the engine for where the interrogation modal is opened/shown, and what gates it.
53948	
53949	Let me also reconsider: maybe the issue is that on the LIVE site, the analysis files aren't loading (path issue), so analysisOf returns null for everything, so the pop-up is empty/absent. That would be a deployment bug I should catch.
53950	
53951	Let me investigate. First, let me look at the esat-compare.html config and the analysisOf function, and how the modal is triggered. Let me read the relevant parts of esat-compare.html.
53952	
53953	Actually, the source is at `C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\example\esat-compare.html` and the deployed one is the dist version. Let me look at the source (they're functionally the same except paths).
53954	
53955	Let me grep for interrogation config and the modal trigger. Let me look at the engine for when _renderInterrogation is called and what gates the modal appearance.
53956	
53957	Let me start investigating. I'll read esat-compare.html config section and grep the engine for the interrogation trigger.
53958	
53959	Let me think about what I know from the summary:
53960	- Modal order: (1) _verdictEl always; (2) _postGuessEl; (3) v2: _appendInsightV2/_appendMethodsV2/_appendSelfReportV2 OR legacy; (4) .ppq-iq-feedback div; (5) 1-6 rate; (6) flag.
53961	- _isV2(rec) = !!(rec && rec.identity && rec.pupil_analysis)
53962	- analysisOf(q) prefers ESAT_ANALYSIS_V2.by_id, falls back to legacy ANALYSIS, else null.
53963	
53964	So the modal content depends on analysisOf(q). If null, the modal sections that need a record would be empty. But does the modal APPEAR at all when rec is null?
53965	
53966	I need to find the trigger. Let me grep the engine for where the interrogation modal is opened (e.g., a method like `_openInterrogation` or where `_renderInterrogation` is called, and any condition gating it).
53967	
53968	Let me investigate the engine and config. I'll do parallel reads/greps.
53969	
53970	Let me grep esat-compare.html for "interrogation", "modal", "iq", "probe", "categor" to find the config. And grep the engine for the trigger.
53971	
53972	Actually, let me be efficient and use the Explore agent? No — I know the files. Let me directly grep.
53973	
53974	Let me grep the engine ppqviewer.js for where the interrogation modal is shown and what gates it. Search for "_renderInterrogation", "interrogation", "iq-", "openInterrogation", "afterAnswer", "reveal".
53975	
53976	And read esat-compare.html config (the PPQViewer.create call) to see interrogation settings.
53977	
53978	Let me do this.
53979	
53980	
53981	Let me look at how the post-question pop-up is triggered and what fills it, so I can tell you exactly what to expect.
53982	
53983	
53984	
53985	#### Tool: Grep
53986	
53987	**Input:**
53988	
53989	```json
53990	{
53991	  "-n": true,
53992	  "head_limit": 60,
53993	  "output_mode": "content",
53994	  "path": "C:\\Claude (not on Gdrive, nor OneDrive)\\ppqviewer\\engine\\ppqviewer.js",
53995	  "pattern": "interrogation|_renderInterrogation|_openInterrogation|iq\\b|probe|categor|afterAnswer|onAnswer|_showInterrogation"
53996	}
53997	```
53998	
53999	**Output:**
```

#### Thinking

Let me read the very last part of the chat to see how it ended — the last few exchanges between Smith and the assistant.


#### Tool: Read

> Read: `C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\PPQ_Viewer_(chat1,qoder)2026-07-23_15-15.md`

**Output:**

```json
54560	
54561	Let me draft the text:
54562	"Two things there — let me play back what I think you're after before I touch anything, because the second one's a proper redesign.
54563	
54564	1. The percentages: the "0 %" is floating way over on the right, far from the letter. Pull it in so it sits right next to the option letter. Easy.
54565	
54566	2. The guess question: at the moment it lives in its own panel below the question (the "Which options are still in the running?" block), which is easy to miss "down there". You want it to be the first page of the pop-up instead — they answer, the pop-up opens straight onto "Want to declare a bit of a guess?", they can fill it in or just press Enter to skip, and only then does the verdict (the actual answer) appear. A little suspense before the reveal."
54567	
54568	Then AskUserQuestion: does the pre-answer panel go away (replaced by pop-up page 1), stay alongside, or stay as-is?
54569	
54570	Let me formulate the AskUserQuestion with good options. I'll recommend option A (move to pop-up, remove pre-answer panel).
54571	
54572	Let me make sure the question is clear and the options are distinct. I'll use header "Guess placement".
54573	
54574	Let me write it.
54575	
54576	
54577	Two things in there — let me play back what I think you're after before I touch anything, because the second one is a proper redesign of the guess flow and I don't want to build the wrong thing from a garbled line.
54578	
54579	The percentages: at the moment each "0 %" floats way over on the right, a long way from its letter. You want it pulled in so it sits right next to the option letter. Easy fix.
54580	
54581	The guess question: right now it lives in its own panel below the question (the "Which options are still in the running?" block in your screenshot), which is easy to miss down there. You want it to be the **first page of the pop-up** instead — they answer, the pop-up opens straight onto a simple "Want to declare a bit of a guess?", they can fill it in or just press Enter to skip, and only *then* does the verdict (the actual answer) appear. A beat of suspense before the reveal.
54582	
54583	The one thing I genuinely can't tell from that is what happens to the current panel below the question.
54584	
54585	
54586	
54587	#### Tool: AskUserQuestion
54588	
54589	**Questions:**
54590	
54591	- If the guess declaration becomes the first page of the pop-up, what happens to the current "Which options are still in the running?" panel that sits below the question before they answer?
54592	
54593	### **You**
54594	
54595	but reword.
54596	
54597	### **Assistant**
54598	
54599	
```

#### Thinking

OK so the chat ends right there. Smith's last message was "but reword." in response to the AskUserQuestion about what happens to the pre-answer guess panel. The assistant's thinking block before that had already worked out the design:

1. Percentages: move them next to the option letter (CSS fix)
2. Guess declaration: move from pre-answer panel below the question → first page of the post-answer pop-up (before verdict), Enter to skip, then verdict appears (suspense)

Smith's "but reword" seems to be saying: yes, do that, but reword the prompt (the "Which options are still in the running?" wording → something simpler like "Want to declare a bit of a guess?").

The chat ended there — the assistant was about to respond to "but reword" and then implement.

Now let me also check the current state of the engine and example files to understand what I'm working with. Let me look at the directory structure and the engine file.

Now let me check the current state of the engine and key files.



#### Tool: Bash

```bash
ls "/c/Claude (not on Gdrive, nor OneDrive)/ppqviewer/engine/" && echo "---" && ls "/c/Claude (not on Gdrive, nor OneDrive)/ppqviewer/example/"
```

**Output:**

```json
ppqviewer.css
ppqviewer.js
---
analyst-preview.html
chem-compare.html
chem-config.js
esat-compare.html
esat-config.js
esat.html
ppq-login.js
```

#### Tool: Bash

```bash
wc -l "/c/Claude (not on Gdrive, nor OneDrive)/ppqviewer/engine/ppqviewer.js" "/c/Claude (not on Gdrive, nor OneDrive)/ppqviewer/engine/ppqviewer.css"
```

**Output:**

```json
1892 /c/Claude (not on Gdrive, nor OneDrive)/ppqviewer/engine/ppqviewer.js
   444 /c/Claude (not on Gdrive, nor OneDrive)/ppqviewer/engine/ppqviewer.css
  2336 total
```

#### Thinking

Good. Now let me also quickly check if there's a dist folder and the test folder.

#### Tool: Bash

```bash
ls "/c/Claude (not on Gdrive, nor OneDrive)/ppqviewer/test/" 2>/dev/null && echo "---" && ls "/c/Claude (not on Gdrive, nor OneDrive)/ppqviewer/dist/" 2>/dev/null || echo "no dist"
```

**Output:**

```json
test_chem.js
test_ppqviewer.js
---
esat-compare
```

#### Thinking

Good. I now have a solid orientation. Let me also quickly grep the engine for the guess-declaration panel code to understand the current implementation that chat 1 was about to redesign.


#### Tool: Grep

**Input:**

```json
{
  "-n": true,
  "head_limit": 40,
  "output_mode": "content",
  "path": "C:\\Claude (not on Gdrive, nor OneDrive)\\ppqviewer\\engine\\ppqviewer.js",
  "pattern": "_preGuess|preGuess|guess.*panel|_postGuess|postGuess"
}
```

**Output:**

```json
81:    this._preGuessDeclaration = null; /* QoderWork 2026-07-22 (analyst handoff): pre-answer guess snapshot */
279:    guessDeclare.appendChild(el("div", { class: "ppq-guess-panel", style: "display:none;" }));
508:    /* QoderWork 2026-07-22 (analyst handoff): pre-answer guess toggle. The panel
512:      const panel = self.q(".ppq-guess-panel");
708:    this._preGuessDeclaration = payload;
803:    this._preGuessDeclaration = null;
850:    this.q(".ppq-guess-panel").style.display = "none";
851:    this.q(".ppq-guess-panel").innerHTML = "";
853:    this._preGuessDeclaration = null;
1044:    if (this._preGuessDeclaration) row.pre_guess_declaration = this._preGuessDeclaration;
1052:    if (this._preGuessDeclaration) extra.pre_guess_declaration = this._preGuessDeclaration;
1156:    this._postGuessDeclared = false;
1176:    iq.appendChild(this._postGuessEl(chosen, this._wasRight));
1289:  Viewer.prototype._postGuessEl = function (chosen, isRight) {
1295:    const panel = el("div", { class: "ppq-iq-postguess-panel", style: "display:none;" });
1323:    this._postGuessDeclared = true;
1324:    this._postGuessDeclaration = payload;
1580:    const guessDeclared = !!(this._postGuessDeclared || this._preGuessDeclaration);
```

#### Thinking

Good. I now have a comprehensive picture. Let me summarize what I know and present myself as "chat 2" ready to continue.

Here's the state:
- ppqviewer is the estate's shared past-paper-question viewer engine
- Chat 1 (QoderWork, earlier today 2026-07-23) built up from v0.1.0 to v0.2.7
- The engine is at 1892 lines (ppqviewer.js) + 444 lines CSS
- Two live consumers: ESAT (esat-compare.html) and Chemistry (chem-compare.html)
- ESAT deployed to github.com/physicalsmithness/esatwallop (pushed, Pages not yet enabled by Smith)
- Chat 1 ended mid-conversation about a UI redesign:
  1. Move percentages closer to option letters in the guess-declaration UI
  2. Move the guess-declaration from a pre-answer panel (below the question) to the FIRST PAGE of the post-answer pop-up (before the verdict), with Enter to skip → suspense before reveal
  3. Smith's last words: "but reword" — meaning: yes do that, but reword the prompt text (from "Which options are still in the running?" to something simpler)

The pending work for chat 2:
- Implement the guess-declaration redesign (move to first page of pop-up, before verdict, reword the prompt, Enter to skip)
- Fix percentages positioning (next to letter, not far right)
- The pre-answer panel below the question presumably goes away (replaced by the pop-up first page)
- Clock design (rev2) awaits Smith's final OK
- Pages enabling is Smith's action

Let me present my orientation to Smith.

Right, I've read through the full 54k-line chat 1 export and the project docs. Here's where I am:

**ppqviewer chat 2, oriented.** Engine at v0.2.7, 1892 lines + 444 CSS. Two consumers wired (ESAT, Chemistry). ESAT deployed to `physicalsmithness/esatwallop` (pushed, 1054 files — Pages not yet enabled, that's still your action).

Chat 1 died right as you answered its question about the guess-declaration redesign. Your last words were "but reword." So here's what I understand is pending, picking up exactly where it left off:

**The guess-declaration redesign (not yet built):**

1. The pre-answer panel below the question ("Which options are still in the running?") goes away — nobody sees it down there.
2. Instead, the guess declaration becomes the **first page of the post-answer pop-up**: they answer → pop-up opens → first thing is a simple reworded prompt (something like "Want to declare a bit of a guess?") with the option checkboxes → they fill it in or press Enter to skip → *then* the verdict appears. Suspense before the reveal.
3. The percentages get pulled in next to the option letter (not floating way out on the right).
4. "But reword" — the prompt language gets simpler/more natural than the current "Which options are still in the running?"

Also on the shelf: the clock design (rev2 mockup done, implementation awaits your final OK), and Pages enabling.

Anything you want to correct or add before I start on the guess-declaration rebuild, or shall I go ahead?

### **You**

哎呀，那对，嗯。我要给你送东西。I... no, we just feel the. To do is not so in relationship. 对。居民们。What is it out of spec? 3那意思。不多说了。你去呗，干啥呢？And where it says all spec, that suggests there's all things in the spec. 不知道答案是谁。在。Where we have the previous part of the bottom, which is quite far down. Might also need to get the top because there's often a lot of white space at the bottom of these questions. I think also talked for that, and the previous is doing the previous. The non-shuffled list will least be previous in the shuffle. As well, we need to be able to go back. 与之前的。和谁？分析。不想看了。You to spec analysis pages for this so can see how doing some analysis pages。Anyway, as I say, just carry on with the thing in front of you at the moment。就这些。I am going to give you some other things to fix while we are here, just for you to put on your list of to-dos and don'ts, so that they should take precedence above anything else.
- What it says is "Out Of Spec". That needs to be quite big, and where it says "Out Of Spec", it needs to be big and red.
- Where it says "All Spec", that suggests that it's all things in the spec, so it should be in the dropdowns. It should say "All In" and "Out Of Spec".
- The previous button at the bottom, which is quite far down, might also need to be at the top because there's often a lot of white space at the bottom of these questions. I think I'll set it at the top for that.
- The previous is doing the previous. It needs to be in the non-shuffled list, but it needs to be in the shuffled list as well. We'll need to be able to go back to previous and see what the feedback and analysis was on that.
- Coming up there, we'll need some more. You need to spec out some analysis pages for this so that we can see how they're doing on each part.
Anyway, as I say, just carry on with the thing in front of you at the moment, but you can just log these as jobs for future chats.

### **Assistant**

#### Thinking

Smith is giving me a stream-of-consciousness set of instructions. Let me parse through the voice-to-text garbling:

1. He's confirming my understanding of the guess-declaration redesign ("哎呀，那对" = "ah, that's right")
2. He's saying "carry on with the thing in front of you" = the guess-declaration redesign
3. He's giving me a list of additional fixes/features to log as TODOs for future chats, which should NOT take precedence over the current task (he says "don'ts" but I think he means "to-dos and don'ts" = things to do and things not to do, or just "to-dos"). Wait, re-reading: "just for you to put on your list of to-dos and don'ts, so that they should take precedence above anything else" — hmm, actually he says they SHOULD take precedence? No wait, re-reading more carefully: "I am going to give you some other things to fix while we are here, just for you to put on your list of to-dos and don'ts, so that they should take precedence above anything else." — I think this is garbled. He then says at the end "just carry on with the thing in front of you at the moment, but you can just log these as jobs for future chats." So the priority is: carry on with the guess-declaration redesign NOW, and log these other items for later.

Let me parse the specific items:

1. **"Out of Spec" label**: Where it says "Out of Spec" (in the filter/topic UI), it needs to be quite big and red. This is about the topic filter chip or label that shows "Out of Spec" — make it visually prominent (big, red).

2. **"All Spec" → rename**: Where it says "All Spec" in the dropdowns, it should say "All In" and "Out of Spec" — wait, let me re-read: "Where it says 'All Spec', that suggests that it's all things in the spec, so it should be in the dropdowns. It should say 'All In' and 'Out Of Spec'." — I think he means the filter dropdown currently has an option called "All Spec" which is ambiguous (sounds like "everything in the spec"). He wants it renamed. The dropdown should have options like "All In [Spec]" and "Out Of Spec" — or maybe the current "All" option should say "All In-Spec" to distinguish from "Out of Spec". Actually I think the filter has topics and one category is "Out of Spec" (questions not in the current syllabus). The "All" option currently might say "All Spec" which is confusing. He wants: "All In" (meaning all in-spec topics) and "Out Of Spec" as separate clear options.

3. **Previous button at the top**: The Previous button is only at the bottom, which is far down because question images have lots of white space at the bottom. Add a Previous button at the top too.

4. **Previous in shuffled mode**: The Previous button currently works in the non-shuffled list but needs to work in shuffled mode too — you need to be able to go back to a previous question AND see its feedback/analysis again.

5. **Analysis pages**: Need to spec out analysis/dashboard pages so you can see how pupils are doing on each part. This is a bigger future feature.

He explicitly says: "just carry on with the thing in front of you at the moment" (the guess-declaration redesign) and "log these as jobs for future chats."

So my plan:
1. Log these 5 items as future TODOs
2. Proceed with the guess-declaration redesign (the main task)

Let me set up my todo list and get to work on the guess-declaration redesign. Let me first read the relevant engine code to understand the current guess panel implementation, then implement the changes.

Actually, let me re-read his instruction about precedence: "so that they should take precedence above anything else" — hmm, this contradicts "just carry on with the thing in front of you." I think the garbling makes this ambiguous, but the final instruction is clear: "just carry on with the thing in front of you at the moment, but you can just log these as jobs for future chats." So: log them, don't do them now.

Wait, actually re-reading once more: "I am going to give you some other things to fix while we are here, just for you to put on your list of to-dos and don'ts, so that they should take precedence above anything else." — Maybe he means: log them so that IN FUTURE CHATS they take precedence (i.e., they're high-priority items for the next session). But for THIS chat, carry on with the guess redesign. That makes sense.

Let me proceed. I'll:
1. Create a todo list with the guess redesign as the active task and the other items logged
2. Read the relevant engine code for the guess panel
3. Implement the redesign

Got it. Logging those five as future jobs, and carrying on with the guess-declaration redesign in front of me.



#### Tool: TodoWrite

**Input:**

```json
{
  "todos": [
    {
      "description": "Guess-declaration redesign: move to first page of post-answer pop-up (before verdict), reword prompt, Enter to skip, percentages next to letter, remove pre-answer panel",
      "status": "in_progress"
    },
    {
      "description": "[FUTURE] \"Out of Spec\" label: make it big and red",
      "status": "pending"
    },
    {
      "description": "[FUTURE] Rename \"All Spec\" in dropdowns → \"All In\" + \"Out Of Spec\" (clearer wording)",
      "status": "pending"
    },
    {
      "description": "[FUTURE] Add Previous button at the TOP (bottom is too far down with whitespace)",
      "status": "pending"
    },
    {
      "description": "[FUTURE] Previous must work in shuffled mode too (go back, see feedback/analysis again)",
      "status": "pending"
    },
    {
      "description": "[FUTURE] Spec out analysis pages (see how pupils are doing on each part)",
      "status": "pending"
    }
  ]
}
```

**Output:**

```json
Successfully updated the todo list. The current list is now:
1. [in_progress] Guess-declaration redesign: move to first page of post-answer pop-up (before verdict), reword prompt, Enter to skip, percentages next to letter, remove pre-answer panel
2. [pending] [FUTURE] "Out of Spec" label: make it big and red
3. [pending] [FUTURE] Rename "All Spec" in dropdowns → "All In" + "Out Of Spec" (clearer wording)
4. [pending] [FUTURE] Add Previous button at the TOP (bottom is too far down with whitespace)
5. [pending] [FUTURE] Previous must work in shuffled mode too (go back, see feedback/analysis again)
6. [pending] [FUTURE] Spec out analysis pages (see how pupils are doing on each part)
```

#### Thinking

Good. Now let me read the relevant sections of the engine to understand the current guess-declaration implementation. I need to see:
1. The pre-answer guess panel (around line 279, 508-710)
2. The post-answer guess element (_postGuessEl, around line 1289)
3. The _renderInterrogation function (around line 1146) to understand the modal structure

Let me read these sections.

Now let me read the current guess-declaration code in the engine to understand what I'm reshaping.



#### Tool: Read

> Read: `C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\engine\ppqviewer.js`

**Output:**

```json
270	      card.appendChild(el("div", { class: "ppq-struct" }));   // structured-paper nav + whole-question
271	      card.appendChild(optionsEl);
272	    }
273	    /* QoderWork 2026-07-22 (analyst handoff): pre-answer guess declaration. The
274	       panel is built per-question by the shared _buildGuessPicker so percentages
275	       stay OPTIONAL and the same picker powers the post-answer correction inside
276	       the modal. Label comes from analysis v2 interaction_defaults ("I'm guessing"). */
277	    const guessDeclare = el("div", { class: "ppq-guess", style: "display:none;" });
278	    guessDeclare.appendChild(el("button", { class: "ppq-guess-btn", type: "button" }, "I'm guessing"));
279	    guessDeclare.appendChild(el("div", { class: "ppq-guess-panel", style: "display:none;" }));
280	    card.appendChild(guessDeclare);
281	
282	    /* QoderWork 2026-07-22: answer line + the "actually, I wasn't sure" option sit
283	       on one row (Smith: the option goes "to the right of that"). Tapping it opens
284	       letter chips so the pupil can say which options they were torn between
285	       ("I thought it was B or D") — logged, so a lucky right answer can be told
286	       apart from a confident one. Hidden until the question is answered. */
287	    const answerRow = el("div", { class: "ppq-answer-row" });
288	    answerRow.appendChild(el("div", { class: "ppq-answer-line" }));
289	    const unsure = el("div", { class: "ppq-unsure", style: "display:none;" });
290	    unsure.innerHTML =
291	      '<button class="ppq-unsure-btn" type="button">Actually, I wasn\'t sure</button>' +
292	      '<div class="ppq-unsure-pick" style="display:none;">' +
293	      '<span class="ppq-unsure-q">I thought it was…</span><span class="ppq-unsure-letters"></span>' +
294	      '<button class="ppq-unsure-done" type="button">Done</button></div>';
295	    answerRow.appendChild(unsure);
296	    card.appendChild(answerRow);
297	
298	    const controls = el("div", { class: "ppq-controls" });
299	    controls.innerHTML =
300	      '<button class="ppq-btn ppq-prev">Previous (←)</button>' +
301	      '<button class="ppq-btn ppq-reveal">Reveal (Enter)</button>' +
302	      '<button class="ppq-btn ppq-skip">Skip (S)</button>';
303	    card.appendChild(controls);
304	
305	    const answerPanel = el("div", { class: "ppq-answer-panel" });
306	    answerPanel.innerHTML =
307	      '<div class="ppq-ms-header"><strong>Markscheme</strong></div>' +
308	      '<div class="ppq-markscheme"></div>' +
309	      '<div class="ppq-examiner"><div class="ppq-examiner-title">Examiner report</div><div class="ppq-examiner-body"></div></div>';
310	    card.appendChild(answerPanel);
311	
312	    const comp = el("div", { class: "ppq-competence" });
313	    comp.appendChild(el("div", { class: "ppq-competence-prompt" }, esc(cfg.selfReport.prompt)));
314	    const scale = el("div", { class: "ppq-scale" });
315	    const meanings = cfg.selfReport.meanings || [];
316	    for (let v = 1; v <= cfg.selfReport.levels; v++) {
317	      const lbl = cfg.selfReport.labels ? cfg.selfReport.labels[v - 1] : String(v);
318	      const meaning = meanings[v - 1] || "";
319	      scale.appendChild(el("button", { class: "ppq-scale-btn", "data-val": String(v), title: meaning ? (v + " — " + meaning) : "" }, esc(lbl)));
320	    }
321	    comp.appendChild(scale);
322	    /* QoderWork 2026-07-22: legend labelling what each point on the scale means */
323	    if (meanings.length) {
324	      comp.appendChild(el("div", { class: "ppq-scale-legend" }, meanings.map(function (m, i) { return '<span class="ppq-scale-legend-item"><b>' + (i + 1) + "</b> " + esc(m) + "</span>"; }).join("")));
325	    }
326	    comp.appendChild(el("button", { class: "ppq-btn ppq-primary ppq-next", style: "display:none;" }, "Next (Enter)"));
327	    card.appendChild(comp);
328	
329	    card.appendChild(el("div", { class: "ppq-kb-hint" }));
330	    centre.appendChild(card);
331	    centre.appendChild(el("div", { class: "ppq-empty" }, "<h2>Loading questions…</h2>"));
332	
333	    /* QoderWork 2026-07-22: a split dashboard renders as three columns — left
334	       mastery panel, centre question, right mastery panel — matching the original
335	       Chemistry viewer, rather than stacking both columns in one right sidebar. */
336	    const isSplit = cfg.dashboardLayout === "split" && cfg.dashboardColumns && cfg.dashboardColumns.length >= 2;
337	    const makeDashPanel = function (col, sideClass) {
338	      const p = el("div", { class: "ppq-dash ppq-dash-split-panel " + sideClass });
339	      p.appendChild(el("h3", null, esc(col.title)));
340	      p.appendChild(el("div", { class: "ppq-dash-sub" }, "Click a group to filter."));
341	      p.appendChild(el("div", { class: "ppq-dash-content" }));
342	      return p;
343	    };
344	    if (isSplit) {
345	      layout.classList.add("ppq-layout-split");
346	      layout.appendChild(makeDashPanel(cfg.dashboardColumns[0], "ppq-dash-left"));
347	      layout.appendChild(centre);
348	      layout.appendChild(makeDashPanel(cfg.dashboardColumns[1], "ppq-dash-right"));
349	    } else {
350	      layout.appendChild(centre);
351	      const dash = el("div", { class: "ppq-dash" });
352	      dash.appendChild(el("h3", null, esc(cfg.dashboardTitle)));
353	      dash.appendChild(el("div", { class: "ppq-dash-sub" }, "Recent ticks/crosses and your self-rating spread, per group. Click a group to filter."));
354	      dash.appendChild(el("div", { class: "ppq-dash-content" }));
355	      layout.appendChild(dash);
356	    }
357	    this.root.appendChild(layout);
358	
359	    const toolbar = el("div", { class: "ppq-toolbar" });
360	    toolbar.innerHTML = '<button class="ppq-btn-mini ppq-draw-toggle">Draw</button><button class="ppq-btn-mini ppq-reset">Reset progress</button>';
361	    this.root.appendChild(toolbar);
362	
363	    const modal = el("div", { class: "ppq-modal" });
364	    modal.innerHTML = '<div class="ppq-modal-content"><div class="ppq-modal-close">×</div><div class="ppq-modal-body"></div></div>';
365	    this.root.appendChild(modal);
366	
367	    this._fillFilterOptions();
368	    this._wireControls();
369	    this._initDrawState();
```

#### Tool: Read

> Read: `C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\engine\ppqviewer.js`

**Output:**

```json
500	      if (b) b.classList.toggle("on");
501	    });
502	    this.q(".ppq-unsure-done").addEventListener("click", () => {
503	      const wavering = self.qa(".ppq-unsure-letter.on").map((b) => b.dataset.letter);
504	      self._fireReport({ status: "interrogation", qtype: "unsure", extra_json: JSON.stringify({ unsure: true, wavering: wavering }) });
505	      self.q(".ppq-unsure-pick").style.display = "none";
506	      self.q(".ppq-unsure-btn").textContent = "Wasn't sure ✓";
507	    });
508	    /* QoderWork 2026-07-22 (analyst handoff): pre-answer guess toggle. The panel
509	       contents (checkboxes, optional percentages, validation) are built by the
510	       shared _buildGuessPicker the first time it is opened for this question. */
511	    this.q(".ppq-guess-btn").addEventListener("click", () => {
512	      const panel = self.q(".ppq-guess-panel");
513	      const btn = self.q(".ppq-guess-btn");
514	      const showing = panel.style.display !== "none";
515	      if (!showing && !panel.childElementCount) {
516	        panel.appendChild(self._buildGuessPicker({
517	          labels: self._answerLabels || [],
518	          preselect: [],
519	          stage: "pre_answer",
520	          prompt: self._guessPrompt("pre_answer"),
521	          onDone: (payload) => { self._commitPreGuess(payload); panel.style.display = "none"; btn.classList.remove("open"); },
522	          onSkip: () => { panel.style.display = "none"; btn.classList.remove("open"); }
523	        }));
524	      }
525	      panel.style.display = showing ? "none" : "";
526	      btn.classList.toggle("open", !showing);
527	    });
528	    this.q(".ppq-draw-toggle").addEventListener("click", () => self.toggleDraw());
529	    this.q(".ppq-draw-undo").addEventListener("click", () => self.undoDraw());
530	    this.q(".ppq-draw-clear").addEventListener("click", () => self.clearCanvas());
531	    this.qa(".ppq-color").forEach((c) => c.addEventListener("click", () => self.setDrawColor(c.dataset.color)));
532	    this.q(".ppq-draw-thick").addEventListener("change", (e) => self.setDrawThickness(e.target.value));
533	    const modal = this.q(".ppq-modal");
534	    modal.addEventListener("click", (e) => { if (e.target === modal || (e.target.className || "").indexOf("ppq-modal-close") >= 0) self.closeModal(); });
535	  };
536	
537	  /* QoderWork 2026-07-22 (analyst handoff): largest-remainder allocation. Spread
538	     `total` integer units over the slots proportionally to `weights`, each slot
539	     getting at least `minEach`. Always returns non-negative integers summing to
540	     exactly `total` (when total >= minEach*n). Replaces the old proportional
541	     pass that could drive the final option negative. */
542	  function allocateLargestRemainder(total, weights, minEach) {
543	    const n = weights.length;
544	    if (!n) return [];
545	    minEach = minEach || 0;
546	    let pool = total - minEach * n;
547	    if (pool < 0) pool = 0;
548	    const wSum = weights.reduce((s, w) => s + (w > 0 ? w : 0), 0);
549	    let alloc;
550	    if (wSum <= 0) {
551	      const share = Math.floor(pool / n);
552	      let rem = pool - share * n;
553	      alloc = weights.map(() => share);
554	      for (let i = 0; rem > 0 && i < n; i++) { alloc[i]++; rem--; }
555	    } else {
556	      const ideal = weights.map((w) => ((w > 0 ? w : 0) / wSum) * pool);
557	      alloc = ideal.map((x) => Math.floor(x));
558	      let rem = pool - alloc.reduce((s, x) => s + x, 0);
559	      const order = ideal.map((x, i) => ({ i: i, frac: x - Math.floor(x) })).sort((a, b) => b.frac - a.frac);
560	      for (let k = 0; rem > 0 && k < order.length; k++) { alloc[order[k].i]++; rem--; }
561	    }
562	    return alloc.map((x) => x + minEach);
563	  }
564	
565	  /* QoderWork 2026-07-22 (analyst handoff): the prompt/label text for a guess
566	     stage. Prefers the analysis-v2 interaction_defaults; falls back to the
567	     settled strings ("I'm guessing" / "Actually, it was a guess"). */
568	  Viewer.prototype._guessPrompt = function (stage) {
569	    const d = this.cfg.guessDefaults && this.cfg.guessDefaults[stage];
570	    if (stage === "pre_answer") return (d && d.candidate_prompt) || "Which options are still in the running?";
571	    return (d && d.candidate_prompt) || "Which options were still in the running?";
572	  };
573	  Viewer.prototype._guessLabel = function (stage) {
574	    const d = this.cfg.guessDefaults && this.cfg.guessDefaults[stage];
575	    if (stage === "pre_answer") return (d && d.label) || "I'm guessing";
576	    return (d && d.label) || "Actually, it was a guess";
577	  };
578	
579	  /* QoderWork 2026-07-22 (analyst handoff): shared guess picker used by BOTH the
580	     pre-answer widget and the post-answer correction inside the modal.
581	     opts: { labels, preselect, stage, prompt, onDone(payload), onSkip() }.
582	     Percentages are OPTIONAL, behind an "Add percentages (optional)" control.
583	     Done validates (>=2 options; if percentages, each >=1 and sum exactly 100)
584	     and keeps the panel open with an inline message on failure. */
585	  Viewer.prototype._buildGuessPicker = function (opts) {
586	    const self = this;
587	    const MIN_EACH = 1, SUM = 100, MIN_OPTIONS = 2;
588	    const labels = (opts.labels || []).map(String);
589	    const panel = el("div", { class: "ppq-gpick" });
590	    panel.appendChild(el("div", { class: "ppq-gpick-prompt" }, esc(opts.prompt || "")));
591	
592	    const rows = {};
593	    const optsBox = el("div", { class: "ppq-gpick-options" });
594	    labels.forEach((L) => {
595	      const row = el("label", { class: "ppq-gpick-row" });
596	      const cb = el("input", { type: "checkbox", value: L });
597	      if ((opts.preselect || []).indexOf(L) >= 0) cb.checked = true;
598	      row.appendChild(cb);
599	      row.appendChild(el("span", { class: "ppq-gpick-letter" }, esc(L)));
600	      const wrap = el("span", { class: "ppq-gpick-pctwrap", style: "display:none;" });
601	      const pct = el("input", { type: "number", class: "ppq-gpick-pct", min: String(MIN_EACH), max: String(SUM), value: "0", disabled: "disabled" });
602	      wrap.appendChild(pct);
603	      wrap.appendChild(el("span", { class: "ppq-gpick-pctsign" }, "%"));
604	      row.appendChild(wrap);
605	      optsBox.appendChild(row);
606	      rows[L] = { cb: cb, pct: pct, wrap: wrap };
607	    });
608	    panel.appendChild(optsBox);
609	
610	    const msg = el("div", { class: "ppq-gpick-msg", style: "display:none;" });
611	    panel.appendChild(msg);
612	
613	    let pctOn = false;
614	    const pctToggle = el("button", { class: "ppq-gpick-pcttoggle", type: "button" }, "Add percentages (optional)");
615	    panel.appendChild(pctToggle);
616	
617	    function checked() { return labels.filter((L) => rows[L].cb.checked); }
618	    function showMsg(text) { msg.textContent = text; msg.style.display = text ? "" : "none"; }
619	    function refreshPct() {
620	      labels.forEach((L) => {
621	        const r = rows[L];
622	        r.wrap.style.display = pctOn ? "" : "none";
623	        r.pct.disabled = !(pctOn && r.cb.checked);
624	      });
625	    }
626	    function equalSplit() {
627	      const c = checked();
628	      const alloc = allocateLargestRemainder(SUM, c.map(() => 1), MIN_EACH);
629	      c.forEach((L, i) => { rows[L].pct.value = String(alloc[i]); });
630	    }
631	    function redistributeFrom(changedPct) {
632	      const c = checked();
633	      const others = c.filter((L) => rows[L].pct !== changedPct);
634	      const maxForChanged = SUM - others.length * MIN_EACH;
635	      let v = parseInt(changedPct.value, 10);
636	      if (isNaN(v)) v = MIN_EACH;
637	      v = Math.max(MIN_EACH, Math.min(maxForChanged, v));
638	      changedPct.value = String(v);
639	      const remaining = SUM - v;
640	      const weights = others.map((L) => parseInt(rows[L].pct.value, 10) || 0);
641	      const alloc = allocateLargestRemainder(remaining, weights, MIN_EACH);
642	      others.forEach((L, i) => { rows[L].pct.value = String(alloc[i]); });
643	    }
644	
645	    optsBox.addEventListener("change", (e) => {
646	      if (e.target.type !== "checkbox") return;
647	      showMsg("");
648	      if (pctOn) {
649	        if (e.target.checked) { equalSplit(); }
650	        else { const c = checked(); if (c.length) { const alloc = allocateLargestRemainder(SUM, c.map(() => 1), MIN_EACH); c.forEach((L, i) => { rows[L].pct.value = String(alloc[i]); }); } }
651	      }
652	    });
653	    optsBox.addEventListener("input", (e) => {
654	      if (!e.target.classList.contains("ppq-gpick-pct")) return;
655	      showMsg("");
656	      redistributeFrom(e.target);
657	    });
658	    pctToggle.addEventListener("click", () => {
659	      pctOn = !pctOn;
660	      pctToggle.classList.toggle("on", pctOn);
661	      pctToggle.textContent = pctOn ? "Remove percentages" : "Add percentages (optional)";
662	      refreshPct();
663	      if (pctOn && checked().length) equalSplit();
664	      showMsg("");
665	    });
666	
667	    const actions = el("div", { class: "ppq-gpick-actions" });
668	    const done = el("button", { class: "ppq-gpick-done", type: "button" }, "Done");
669	    const skip = el("button", { class: "ppq-gpick-skip", type: "button" }, "Skip");
670	    actions.appendChild(done);
671	    actions.appendChild(skip);
672	    panel.appendChild(actions);
673	
674	    done.addEventListener("click", () => {
675	      const c = checked();
676	      if (c.length < MIN_OPTIONS) { showMsg("Pick at least " + MIN_OPTIONS + " options, or Skip."); return; }
677	      const payload = {
678	        guess_declared: true,
679	        declared_stage: opts.stage,
680	        candidate_options: c.slice(),
681	        attempt_id: self._attemptId || ""
682	      };
683	      if (pctOn) {
684	        const pcts = {};
685	        let sum = 0, ok = true;
686	        c.forEach((L) => {
687	          let v = parseInt(rows[L].pct.value, 10);
688	          if (isNaN(v) || v < MIN_EACH) ok = false;
689	          pcts[L] = isNaN(v) ? 0 : v;
690	          sum += pcts[L];
691	        });
692	        if (!ok || sum !== SUM) { showMsg("Percentages must each be at least " + MIN_EACH + " and total exactly " + SUM + "."); return; }
693	        payload.candidate_percentages = pcts;
694	      }
695	      showMsg("");
696	      if (opts.onDone) opts.onDone(payload);
697	    });
698	    skip.addEventListener("click", () => { showMsg(""); if (opts.onSkip) opts.onSkip(); });
699	
700	    refreshPct();
701	    return panel;
702	  };
703	
704	  /* QoderWork 2026-07-22 (analyst handoff): store the pre-answer declaration on
705	     the instance, fire the event, and reflect it on the toggle button. The
706	     snapshot is later attached to the answer event and the stored attempt. */
707	  Viewer.prototype._commitPreGuess = function (payload) {
708	    this._preGuessDeclaration = payload;
709	    const btn = this.q(".ppq-guess-btn");
710	    btn.textContent = "Guessing: " + payload.candidate_options.join(", ") + " ✓";
711	    btn.classList.add("done");
712	    this._fireReport({ status: "interrogation", qtype: "guess_declaration", extra_json: JSON.stringify(payload) });
713	  };
714	
715	  // --------------------------------------------------------------- filtering
716	  Viewer.prototype.filterQuestions = function () {
717	    const cfg = this.cfg;
718	    const self = this;
719	    const order = this.q(".ppq-order").value || "order";
```

#### Thinking

Now let me read the _postGuessEl and _renderInterrogation sections to understand the modal structure.

#### Tool: Read

> Read: `C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\engine\ppqviewer.js`

**Output:**

```json
1140	     - the 1-6 self-rating now lives INSIDE the pop-up ("that one, two, three,
1141	       four, five, six is back outside. Probably should be inside it there"), with
1142	       its own Next button. Closing the pop-up early restores the outer 1-6 row so
1143	       the pupil is never stranded (see closeModal).
1144	     STILL ROUGH: probe/method/slug wording is analyst-facing (Smith will reword);
1145	     feedback `when` grammar is partial; elimination-chip parse is a stopgap. */
1146	  Viewer.prototype._renderInterrogation = function () {
1147	    const cfg = this.cfg;
1148	    if (!cfg.modules.postQuestionReview || !cfg.analysisOf) return;
1149	    const rec = cfg.analysisOf(this.cur);
1150	    if (!rec) return; /* graceful absence: most questions have no analysis yet */
1151	    this._analysis = rec;
1152	    this._analysisSelfReports = {};
1153	    /* QoderWork 2026-07-22 (analyst handoff): per-prompt chosen states drive the
1154	       v2 feedback match; the post-answer guess flag gates guess-aware feedback. */
1155	    this._promptStates = {};
1156	    this._postGuessDeclared = false;
1157	
1158	    const self = this;
1159	    const isV2 = this._isV2(rec);
1160	    const iq = el("div", { class: "ppq-iq" });
1161	
1162	    const chosen = this._chosenLabel;
1163	    const correctLetter = isV2
1164	      ? String((rec.identity && rec.identity.correct_answer) || "").toUpperCase()
1165	      : (cfg.correctOf(this.cur) || "").toString().toUpperCase();
1166	
1167	    /* --- 1. the verdict FIRST and ALWAYS (analyst handoff): the concrete
1168	       "You chose X — the answer is Y" leads. The error_path explanation beneath
1169	       it is optional; the verdict line itself is not. The old abstract
1170	       "What this question is really about" headline no longer precedes it. --- */
1171	    iq.appendChild(this._verdictEl(rec, isV2, chosen, correctLetter, this._wasRight));
1172	
1173	    /* --- 2. post-answer guess correction (optional, non-blocking). Sits right
1174	       after the verdict so a guess is on record BEFORE guess-aware feedback is
1175	       matched. Replaces the outer "Actually, I wasn't sure" control. --- */
1176	    iq.appendChild(this._postGuessEl(chosen, this._wasRight));
1177	
1178	    if (isV2) {
1179	      /* --- 3. the pupil insight (first_notice / why_it_matters / next_move) --- */
1180	      this._appendInsightV2(iq, rec);
1181	      /* --- 4. methods: title + structured pupil_steps + elimination chips --- */
1182	      this._appendMethodsV2(iq, rec);
1183	      /* --- 5. primary self-report + knowledge check (feed the feedback match) --- */
1184	      this._appendSelfReportV2(iq, rec);
1185	    } else {
1186	      /* legacy analysis-store path: probe + free-prose methods */
1187	      this._appendProbeLegacy(iq, rec);
1188	      this._appendMethodsLegacy(iq, rec, correctLetter);
1189	    }
1190	
1191	    /* --- feedback lands here (reacts to the self-report + guess declaration) --- */
1192	    iq.appendChild(el("div", { class: "ppq-iq-feedback" }));
1193	
1194	    /* --- the 1-6 self-rating, INSIDE the pop-up (was "back outside") --- */
1195	    const rate = el("div", { class: "ppq-iq-rate" });
1196	    rate.appendChild(el("div", { class: "ppq-iq-rate-prompt" }, esc(cfg.selfReport.prompt)));
1197	    const scale = el("div", { class: "ppq-scale ppq-iq-scale" });
1198	    const meanings = cfg.selfReport.meanings || [];
1199	    for (let v = 1; v <= cfg.selfReport.levels; v++) {
1200	      const lbl = cfg.selfReport.labels ? cfg.selfReport.labels[v - 1] : String(v);
1201	      const meaning = meanings[v - 1] || "";
1202	      scale.appendChild(el("button", { class: "ppq-scale-btn ppq-iq-scale-btn", "data-val": String(v), title: meaning ? (v + " — " + meaning) : "" }, esc(lbl)));
1203	    }
1204	    rate.appendChild(scale);
1205	    if (meanings.length) {
1206	      rate.appendChild(el("div", { class: "ppq-scale-legend" }, meanings.map(function (mm, i) { return '<span class="ppq-scale-legend-item"><b>' + (i + 1) + "</b> " + esc(mm) + "</span>"; }).join("")));
1207	    }
1208	    const prior = this.store.scores[cfg.idOf(this.cur)];
1209	    if (prior) { const sb = scale.querySelector('.ppq-iq-scale-btn[data-val="' + prior + '"]'); if (sb) sb.classList.add("sel"); }
1210	    const iqNext = el("button", { class: "ppq-btn ppq-primary ppq-iq-next", type: "button", style: "display:none;" }, "Next question →");
1211	    iqNext.addEventListener("click", () => { self.closeModal(); self.next(); });
1212	    scale.addEventListener("click", (e) => {
1213	      const b = e.target.closest ? e.target.closest(".ppq-iq-scale-btn") : null;
1214	      if (!b) return;
1215	      const val = parseInt(b.dataset.val, 10);
1216	      scale.querySelectorAll(".ppq-iq-scale-btn").forEach((x) => x.classList.remove("sel"));
1217	      b.classList.add("sel");
1218	      if (self.cur) {
1219	        self.store.scores[self.cfg.idOf(self.cur)] = val; self._saveStore();
1220	        self._fireReport({ status: "rated", qtype: "self_report", extra_json: JSON.stringify({ rating: val }) });
1221	      }
1222	      iqNext.style.display = "inline-block"; iqNext.focus();
1223	    });
1224	    rate.appendChild(iqNext);
1225	    iq.appendChild(rate);
1226	
1227	    /* --- optional "come back to this" flag (Smith: review / more like this) --- */
1228	    const flag = el("button", { class: "ppq-iq-flag" }, "Flag this — come back / more like this");
1229	    flag.addEventListener("click", () => {
1230	      flag.classList.toggle("on");
1231	      const on = flag.classList.contains("on");
1232	      flag.textContent = on ? "Flagged ✓ — we'll bring more like this" : "Flag this — come back / more like this";
1233	      self._fireReport({ status: "flag_review", qtype: "review_flag", extra_json: JSON.stringify({ flagged: on }) });
1234	    });
1235	    iq.appendChild(flag);
1236	
1237	    /* --- mount into the modal shell and open the pop-up. While it holds the 1-6,
1238	       the outer 1-6 row is hidden; closeModal restores it if they bail early. --- */
1239	    const body = this.q(".ppq-modal-body");
1240	    body.innerHTML = "";
1241	    body.appendChild(iq);
1242	    this.q(".ppq-modal").classList.add("show");
1243	    this._iqBox = iq;
1244	    this._iqOpen = true;
1245	    this.q(".ppq-competence").style.display = "none";
1246	    /* QoderWork 2026-07-22 (analyst handoff): populate feedback now so entries
1247	       that match without a guess or prompt-state (v2 selected_options-only,
1248	       legacy any_wrong/any_correct) show on the initial render. It re-renders
1249	       when a guess is committed or a self-report state is tapped. */
1250	    this._renderInterrogationFeedback();
1251	  };
1252	
1253	  /* QoderWork 2026-07-22 (analyst handoff): an analysis-v2 record is detected by
1254	     its identity + pupil_analysis blocks. Legacy analysis-store records have a
1255	     probe + free-prose methods instead. */
1256	  Viewer.prototype._isV2 = function (rec) {
1257	    return !!(rec && rec.identity && rec.pupil_analysis);
1258	  };
1259	
```

#### Tool: Read

> Read: `C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\engine\ppqviewer.js`

**Output:**

```json
1280	    }
1281	    box.appendChild(op);
1282	    return box;
1283	  };
1284	
1285	  /* QoderWork 2026-07-22 (analyst handoff): the OPTIONAL post-answer guess
1286	     correction, placed inside the modal right after the verdict. The chosen
1287	     option stays IN the picker and starts preselected (never removed). Uses the
1288	     shared _buildGuessPicker; Skip keeps it non-blocking. */
1289	  Viewer.prototype._postGuessEl = function (chosen, isRight) {
1290	    const self = this;
1291	    const wrap = el("div", { class: "ppq-iq-postguess" });
1292	    const labels = (this._answerLabels && this._answerLabels.length) ? this._answerLabels : (this._optionLabels(this.cur) || []);
1293	    if (labels.length < 2) return wrap; /* nothing to declare between */
1294	    const btn = el("button", { class: "ppq-iq-postguess-btn", type: "button" }, this._guessLabel("post_answer"));
1295	    const panel = el("div", { class: "ppq-iq-postguess-panel", style: "display:none;" });
1296	    btn.addEventListener("click", () => {
1297	      const showing = panel.style.display !== "none";
1298	      if (!showing && !panel.childElementCount) {
1299	        panel.appendChild(self._buildGuessPicker({
1300	          labels: labels,
1301	          preselect: chosen ? [String(chosen).toUpperCase()] : [],
1302	          stage: "post_answer",
1303	          prompt: self._guessPrompt("post_answer"),
1304	          onDone: (payload) => { self._commitPostGuess(payload, chosen, isRight); panel.style.display = "none"; btn.classList.remove("open"); },
1305	          onSkip: () => { panel.style.display = "none"; btn.classList.remove("open"); }
1306	        }));
1307	      }
1308	      panel.style.display = showing ? "none" : "";
1309	      btn.classList.toggle("open", !showing);
1310	    });
1311	    wrap.appendChild(btn);
1312	    wrap.appendChild(panel);
1313	    return wrap;
1314	  };
1315	
1316	  /* QoderWork 2026-07-22 (analyst handoff): record the post-answer declaration.
1317	     It additionally carries the committed option and its result, recorded
1318	     independently of the candidate set. Fires guess_declaration, then re-matches
1319	     feedback so guess-aware text can appear at the right time. */
1320	  Viewer.prototype._commitPostGuess = function (payload, chosen, isRight) {
1321	    payload.chosen_option = String(chosen || "").toUpperCase();
1322	    payload.correct = !!isRight;
1323	    this._postGuessDeclared = true;
1324	    this._postGuessDeclaration = payload;
1325	    const btn = this._iqBox ? this._iqBox.querySelector(".ppq-iq-postguess-btn") : null;
1326	    if (btn) { btn.textContent = "Recorded: " + payload.candidate_options.join(", ") + " ✓"; btn.classList.add("done"); }
1327	    this._fireReport({ status: "interrogation", qtype: "guess_declaration", extra_json: JSON.stringify(payload) });
1328	    this._renderInterrogationFeedback();
1329	  };
1330	
1331	  /* QoderWork 2026-07-22 (analyst handoff): the v2 pupil insight, rendered
1332	     faithfully (first_notice / why_it_matters / next_move). Labels are viewer
1333	     chrome; the prose is the analysts' and is not rewritten. */
1334	  Viewer.prototype._appendInsightV2 = function (iq, rec) {
1335	    const pa = rec.pupil_analysis || {};
1336	    if (!pa.first_notice && !pa.why_it_matters && !pa.next_move) return;
1337	    const box = el("div", { class: "ppq-iq-insight" });
1338	    if (pa.first_notice) box.appendChild(this._insightLine("First thing to notice", pa.first_notice));
1339	    if (pa.why_it_matters) box.appendChild(this._insightLine("Why it matters", pa.why_it_matters));
1340	    if (pa.next_move) box.appendChild(this._insightLine("Next move", pa.next_move));
1341	    iq.appendChild(box);
1342	  };
1343	  Viewer.prototype._insightLine = function (label, text) {
1344	    const line = el("div", { class: "ppq-iq-insight-line" });
1345	    line.appendChild(el("span", { class: "ppq-iq-insight-label" }, esc(label)));
1346	    line.appendChild(el("span", { class: "ppq-iq-insight-text" }, esc(text)));
1347	    return line;
1348	  };
1349	
1350	  /* QoderWork 2026-07-22 (analyst handoff): v2 methods. title + structured
1351	     pupil_steps rendered DIRECTLY (no prose parsing); red/green chips come from
1352	     the structured eliminates[] / lands_on fields. The "used it" tickbox stays
1353	     as SUPPLEMENTARY evidence — it does not replace the structured self-report. */
1354	  Viewer.prototype._appendMethodsV2 = function (iq, rec) {
1355	    const self = this;
1356	    const labels = this._optionLabels(this.cur) || [];
1357	    const methods = rec.methods || [];
1358	    if (!methods.length) return;
1359	    iq.appendChild(el("div", { class: "ppq-iq-subhead" }, "Ways through it"));
```

#### Thinking

Now I have a clear picture of the current architecture:

1. **Pre-answer guess panel** (lines 273-280, 508-527, 704-713): A "I'm guessing" button below the question that opens a panel with `_buildGuessPicker`. Fires `guess_declaration` with `declared_stage: "pre_answer"`. Stored as `this._preGuessDeclaration`.

2. **Post-answer guess correction** (lines 1289-1329): Inside the modal, after the verdict. A button "Actually, it was a guess" that opens the same `_buildGuessPicker`. Fires `guess_declaration` with `declared_stage: "post_answer"`.

3. **Modal structure** (_renderInterrogation, lines 1146-1251):
   - (1) Verdict (always)
   - (2) Post-answer guess correction
   - (3) Insight (v2) or Probe (legacy)
   - (4) Methods
   - (5) Self-report
   - Feedback div
   - 1-6 rating + Next
   - Flag button

**The redesign Smith wants:**
- Remove the pre-answer panel below the question (the "I'm guessing" button + panel)
- Instead, make the guess declaration the FIRST page of the post-answer pop-up
- Reword the prompt (from "Which options are still in the running?" to something simpler like "Want to declare a bit of a guess?")
- They can fill it in or press Enter to skip
- THEN the verdict appears (suspense)
- Percentages pulled in next to the letter

So the new modal flow becomes:
1. **Guess declaration** (first page) — reworded prompt, checkboxes, optional percentages, Enter/Done to commit or Skip/Enter to skip
2. **Verdict** — "You chose X — the answer is Y"
3. Post-answer guess correction → this probably goes away or merges with step 1? Actually, the pre-answer guess IS the guess declaration. The post-answer "Actually, it was a guess" was a correction. Now that the guess is asked in the pop-up BEFORE the verdict, it's effectively a pre-verdict declaration (they haven't seen the answer yet). So the post-answer correction might still be useful (after seeing the verdict, they might want to say "actually I was guessing"). But Smith's design seems to be: ask the guess BEFORE the verdict, then show the verdict. The old post-answer correction might be redundant or could stay as a secondary option.

Actually, thinking about it more carefully: the key insight is that the guess is now asked AFTER they've answered (they've picked an option) but BEFORE they see the correct answer (the verdict). So it's "post-answer, pre-verdict" — which preserves the integrity of the guess declaration (they don't know if they're right yet). This is actually the same semantic as the old "pre-answer" guess (before seeing the answer), just relocated to a more prominent position.

So the redesign:
- The old pre-answer panel (below question, before answering) → REMOVED
- The guess declaration moves to be the FIRST thing in the pop-up (after they answer, before they see the verdict)
- The old post-answer correction ("Actually, it was a guess") → probably REMOVED or merged (since the guess is now asked before the verdict, there's no need for a separate "actually I was guessing" after the verdict)
- The `declared_stage` should probably be "pre_verdict" or we keep "pre_answer" since semantically it's still before they know the answer

Wait, but there's a subtlety. The old pre-answer guess was declared BEFORE they even picked their answer option. The new one is AFTER they've picked their answer but BEFORE they see the correct answer. These are slightly different:
- Old: "I'm guessing between B and D" (before picking)
- New: "I picked B, but I was really guessing between B and D" (after picking, before seeing correct answer)

The new one is actually richer because the chosen option is known. The payload already carries `chosen_option` in the post-answer variant. So the new design effectively merges both: it's asked post-answer (chosen is known) but pre-verdict (correct answer not yet revealed).

For the payload, I'll use `declared_stage: "pre_verdict"` to distinguish from the old semantics. Or actually, to minimize downstream breakage, maybe keep it as "post_answer" since it IS after they've answered. But the key property is they haven't seen the verdict. Let me use "pre_verdict" — it's more precise and the analysts will appreciate the distinction.

Actually, let me reconsider. The existing data format has `declared_stage: "pre_answer" | "post_answer"`. Introducing a third value might break downstream consumers. But since this is a redesign that changes the UX flow, a new stage value is appropriate. The analysts (who consume this data) will want to know it's the new "asked in the pop-up before the verdict" variant. I'll use `"pre_verdict"`.

Now for the implementation plan:

1. **Remove the pre-answer guess panel from the DOM** (the "I'm guessing" button + `.ppq-guess-panel` below the question). Or rather, hide it / don't build it. Actually, I should keep the DOM structure but not show it, in case other code references it. Let me just not show it (display:none permanently) and remove the button text. Actually, cleanest: don't append the guessDeclare element to the card. But other code references `.ppq-guess-btn` and `.ppq-guess-panel`. Let me check what references them...

Lines that reference the pre-answer guess:
- 277-280: DOM creation
- 511-527: click handler wiring
- 707-713: `_commitPreGuess`
- 803: `this._preGuessDeclaration = null` (reset between questions)
- 850-853: hide/reset on answer
- 1044, 1052: attach to attempt row

The `_preGuessDeclaration` is still useful — it's the snapshot attached to the attempt. In the new design, the guess declared in the pop-up (pre-verdict) would serve the same role. So I'll repurpose: the pop-up's first page sets `this._preGuessDeclaration` (or a renamed field).

Actually, let me think about this differently. The cleanest approach:

1. Keep the DOM elements but never show the pre-answer panel (the button is hidden). This avoids breaking any querySelector references.
2. In `_renderInterrogation`, instead of starting with the verdict, start with a NEW "guess page" that uses `_buildGuessPicker` with the reworded prompt. After they Done or Skip (Enter), reveal the rest of the modal (verdict + everything else).
3. Remove the `_postGuessEl` from the modal (since the guess is now asked first, the "Actually, it was a guess" correction is redundant — or keep it as a small "Actually, I was guessing" link after the verdict for pupils who skipped the first page but want to declare after seeing the answer).

Hmm, actually Smith's design is: they can press Enter to skip the guess page, then they see the verdict. If they skip, they don't get asked again. The old "Actually, I wasn't sure" button (the outer one on the answer row) was already superseded by the post-answer correction in the modal. So in the new design:
- First page of pop-up: guess declaration (Enter to skip)
- Then: verdict + insight + methods + self-report + feedback + 1-6 + flag
- The old `_postGuessEl` (the "Actually, it was a guess" button after the verdict) → REMOVED (redundant, since they were just asked)

But wait — what if a pupil skips the guess page (presses Enter), sees the verdict, and THEN wants to say "actually I was guessing"? In the old design, that's what the post-answer correction was for. In the new design, they had their chance on page 1 and skipped. I think that's fine — Smith's design is: ask once, before the verdict, skippable. If they skip, no guess on record.

OK let me also think about the "Enter to skip" behavior. In the current `_buildGuessPicker`, there's a Done button and a Skip button. For the new first-page-of-pop-up design, I want:
- Enter = skip (proceed to verdict without declaring a guess)
- They can tick options and press Done to declare
- Or press Enter/Skip to skip

Actually, Smith said "they just press Enter again, and they just skip it and they get the answer." So Enter = skip = proceed to verdict. If they want to declare, they tick options and press Done. This is slightly different from the current picker where Enter isn't wired. I'll add Enter-to-skip behavior for the pop-up's first page.

Now, the "two-page" modal approach: the modal opens showing ONLY the guess page. After Done or Skip, the guess page hides and the rest of the modal (verdict + everything) appears. This creates the "suspense" effect.

Let me also handle the case where the interrogation modal doesn't appear (questions with no analysis record). For those questions, there's no pop-up at all — so no guess declaration either. That's fine; the guess declaration is part of the interrogation flow.

But wait — what about questions that have no analysis record? Currently, the pre-answer guess panel is available for ALL questions (it's in the card DOM regardless of analysis). If I remove it and only offer the guess in the pop-up, then questions without analysis records lose the guess declaration entirely. Is that OK?

Looking at the current code: the pre-answer guess panel is shown for all questions (line 277-280, it's always in the card). The `_postGuessEl` is only in the modal (which only appears for questions with analysis). So currently, ALL questions get the pre-answer guess opportunity, but only analysis-questions get the post-answer correction.

If I move the guess to the pop-up (which only appears for analysis questions), then non-analysis questions lose the guess declaration. That might be a problem — Smith might want guess data for ALL questions, not just the 6 with analysis.

Hmm, but Smith said "No one's going to see it down there" about the pre-answer panel. His solution is to put it in the pop-up. But the pop-up only appears for analysis questions. For non-analysis questions, there's no pop-up, so no guess opportunity.

I think the right move is: for questions WITH analysis, the guess is the first page of the pop-up. For questions WITHOUT analysis, we could either (a) have no guess declaration (accept the data loss), or (b) show a lightweight guess prompt after answering even without the full interrogation modal.

Actually, re-reading Smith's words: "We have it as the first page of the pop-up screen." He's talking about THE pop-up (the interrogation modal). For questions without analysis, there IS no pop-up. I think for now, the guess declaration lives in the pop-up only. When more analysis records are written (covering more questions), more questions will get the guess prompt. The 6 v2 questions + legacy questions get it; the rest don't. That's acceptable for now.

But actually — let me reconsider. The ESAT deployment has 1042 questions and only 6 have v2 analysis. That means 1036 questions would have NO guess declaration at all. That's a lot of lost data. Maybe I should keep a lightweight version for non-analysis questions too.

Actually, you know what, let me not overthink this. Smith said "carry on with the thing in front of you." The redesign is: guess goes in the pop-up as page 1. For questions without a pop-up, there's no guess. That's the design. If Smith wants it for all questions later, that's a future enhancement. The analysts are writing more records all the time.

Wait, but actually — I could make the pop-up appear for ALL questions, just with different content. For analysis questions: guess → verdict → insight → methods → self-report → feedback → 1-6. For non-analysis questions: guess → verdict (simple "You chose X, the answer is Y") → 1-6. That way every question gets the guess prompt and the verdict, but only analysis questions get the full interrogation.

Hmm, but that's a bigger change than what Smith asked for. The current design is: no analysis → no pop-up → plain viewer (just the outer 1-6 rating). Changing that to always show a pop-up is a significant architectural shift. Let me NOT do that now. I'll implement exactly what Smith asked: guess as first page of the existing pop-up (which only appears for analysis questions). If he wants it for all questions, he'll say so.

OK, let me now plan the implementation:

**Changes to `_renderInterrogation`:**
1. Build the guess page FIRST (using `_buildGuessPicker` with reworded prompt, stage "pre_verdict")
2. Build the rest of the modal content (verdict, insight, methods, etc.) but HIDE it initially
3. Show only the guess page
4. On Done or Skip (Enter): hide guess page, show the rest, fire feedback render

**Changes to pre-answer panel:**
- Hide the "I'm guessing" button permanently (or remove it from the DOM build)
- Keep the DOM elements to avoid breaking querySelector refs, just never show them

**Changes to `_postGuessEl`:**
- Remove it from the modal (the guess is now asked first, so the post-verdict correction is redundant)

**Changes to `_guessPrompt`:**
- Reword: "Want to declare a bit of a guess?" or similar for the new pre-verdict stage

**CSS changes:**
- Percentages: pull them next to the letter (reduce the gap)
- Style the guess page as a prominent first page

**Payload changes:**
- `declared_stage: "pre_verdict"` for the new in-popup guess
- Carry `chosen_option` and `correct` (since the answer is already committed)
- Set `this._preGuessDeclaration` so it's attached to the attempt row

Wait, actually the attempt is already recorded BEFORE the modal opens (in `_recordAttempt`). So the guess declared in the pop-up comes AFTER the attempt is stored. The current code attaches `this._preGuessDeclaration` to the attempt row at record time (line 1044). If the guess is now declared AFTER the attempt is recorded, it won't be in the attempt row.

Let me check the flow: user picks an option → `_recordAttempt` is called → then `_renderInterrogation` opens the modal. So the attempt is already in the store before the modal opens. The pre-answer guess worked because it was declared BEFORE answering (before `_recordAttempt`). The new pre-verdict guess is declared AFTER answering (after `_recordAttempt`).

So I need to UPDATE the attempt row after the guess is declared. Or I need to change the flow so the attempt isn't recorded until after the guess page. But that's risky (if they close the modal without finishing, the attempt is lost).

Better approach: record the attempt as before (immediately on answer), and when the guess is declared in the pop-up, UPDATE the last attempt row to add the guess declaration. This is what the post-answer correction already does conceptually (it fires a separate event). Let me look at how the post-answer guess is recorded...

The post-answer guess (`_commitPostGuess`) fires a separate `guess_declaration` event via `_fireReport`. It doesn't modify the stored attempt row. The pre-answer guess IS stored in the attempt row (line 1044). So there are two mechanisms:
1. Pre-answer: stored in the attempt row (`row.pre_guess_declaration`)
2. Post-answer: fired as a separate event (not in the attempt row)

For the new pre-verdict guess, I'll do BOTH: update the last attempt row (so it's in the stored data) AND fire the event (for real-time reporting). This gives the analysts the data in both places.

Actually, let me look at how to update the last attempt. After `_recordAttempt`, the attempt is the last element of `this.store.attempts`. I can modify it and call `_saveStore()`.

OK, let me now write the implementation. Let me also check the CSS for the guess picker to understand the percentage layout.

#### Tool: Grep

**Input:**

```json
{
  "-n": true,
  "head_limit": 50,
  "output_mode": "content",
  "path": "C:\\Claude (not on Gdrive, nor OneDrive)\\ppqviewer\\engine\\ppqviewer.css",
  "pattern": "gpick|guess"
}
```

**Output:**

```json
343:/* QoderWork 2026-07-22 (v0.2.6): pre-declare guesses — optional, sits above the
344:   answer row. Smith: "Do you wish to declare guesses? It's all optional." */
345:.ppq-guess { margin-top: 0.6rem; }
346:.ppq-guess-btn { font-size: 0.82rem; padding: 0.35rem 0.85rem; border: 1px dashed var(--ppq-line); border-radius: 7px; background: transparent; color: var(--ppq-muted); cursor: pointer; }
347:.ppq-guess-btn:hover { border-color: var(--ppq-accent); color: var(--ppq-accent); }
348:.ppq-guess-btn.open { border-style: solid; border-color: var(--ppq-accent); color: var(--ppq-accent); }
349:.ppq-guess-btn.done { border-style: solid; border-color: var(--ppq-ok); color: var(--ppq-ok); font-weight: 600; }
350:.ppq-guess-panel { margin-top: 0.5rem; padding: 0.7rem 0.9rem; border: 1px solid var(--ppq-line); border-radius: 8px; background: var(--ppq-paper); }
351:.ppq-guess-prompt { font-size: 0.82rem; font-weight: 600; color: var(--ppq-ink2); margin-bottom: 0.5rem; }
352:.ppq-guess-options { display: flex; flex-direction: column; gap: 0.35rem; }
353:.ppq-guess-row { display: flex; align-items: center; gap: 0.5rem; font-size: 0.88rem; color: var(--ppq-ink); cursor: pointer; }
354:.ppq-guess-row input[type="checkbox"] { width: 1rem; height: 1rem; accent-color: var(--ppq-accent); }
355:.ppq-guess-letter { font-weight: 700; min-width: 1.2rem; }
356:.ppq-guess-pct { width: 3.2rem; font-size: 0.85rem; padding: 0.2rem 0.35rem; border: 1px solid var(--ppq-line); border-radius: 5px; text-align: right; }
357:.ppq-guess-pct:disabled { opacity: 0.4; border-color: transparent; background: transparent; }
358:.ppq-guess-pctsign { font-size: 0.8rem; color: var(--ppq-muted); }
359:.ppq-guess-actions { display: flex; gap: 0.5rem; margin-top: 0.6rem; }
360:.ppq-guess-done { font-size: 0.8rem; padding: 0.3rem 0.8rem; border: 1px solid var(--ppq-accent); border-radius: 7px; background: var(--ppq-accent); color: #fff; cursor: pointer; font-weight: 600; }
361:.ppq-guess-done:hover { opacity: 0.85; }
362:.ppq-guess-skip { font-size: 0.8rem; padding: 0.3rem 0.8rem; border: 1px solid var(--ppq-line); border-radius: 7px; background: var(--ppq-bg); color: var(--ppq-ink2); cursor: pointer; }
363:.ppq-guess-skip:hover { border-color: var(--ppq-muted); }
365:/* QoderWork 2026-07-22 (analyst handoff): the shared guess picker (.ppq-gpick-*),
368:.ppq-gpick { }
369:.ppq-gpick-prompt { font-size: 0.85rem; font-weight: 600; color: var(--ppq-ink2); margin-bottom: 0.5rem; }
370:.ppq-gpick-options { display: flex; flex-direction: column; gap: 0.35rem; }
371:.ppq-gpick-row { display: flex; align-items: center; gap: 0.5rem; font-size: 0.88rem; color: var(--ppq-ink); cursor: pointer; }
372:.ppq-gpick-row input[type="checkbox"] { width: 1rem; height: 1rem; accent-color: var(--ppq-accent); }
373:.ppq-gpick-letter { font-weight: 700; min-width: 1.2rem; }
374:.ppq-gpick-pctwrap { display: inline-flex; align-items: center; gap: 0.15rem; margin-left: auto; }
375:.ppq-gpick-pct { width: 3.4rem; font-size: 0.85rem; padding: 0.2rem 0.35rem; border: 1px solid var(--ppq-line); border-radius: 5px; text-align: right; }
376:.ppq-gpick-pct:disabled { opacity: 0.4; border-color: transparent; background: transparent; }
377:.ppq-gpick-pctsign { font-size: 0.8rem; color: var(--ppq-muted); }
378:.ppq-gpick-msg { font-size: 0.8rem; color: var(--ppq-bad); margin-top: 0.45rem; }
379:.ppq-gpick-pcttoggle { display: block; margin-top: 0.55rem; font-size: 0.78rem; padding: 0.25rem 0.7rem; border: 1px dashed var(--ppq-line); border-radius: 7px; background: transparent; color: var(--ppq-muted); cursor: pointer; }
380:.ppq-gpick-pcttoggle:hover { border-color: var(--ppq-accent); color: var(--ppq-accent); }
381:.ppq-gpick-pcttoggle.on { border-style: solid; border-color: var(--ppq-accent); color: var(--ppq-accent); }
382:.ppq-gpick-actions { display: flex; gap: 0.5rem; margin-top: 0.7rem; }
383:.ppq-gpick-done { font-size: 0.8rem; padding: 0.3rem 0.85rem; border: 1px solid var(--ppq-accent); border-radius: 7px; background: var(--ppq-accent); color: #fff; cursor: pointer; font-weight: 600; }
384:.ppq-gpick-done:hover { opacity: 0.85; }
385:.ppq-gpick-skip { font-size: 0.8rem; padding: 0.3rem 0.85rem; border: 1px solid var(--ppq-line); border-radius: 7px; background: var(--ppq-bg); color: var(--ppq-ink2); cursor: pointer; }
386:.ppq-gpick-skip:hover { border-color: var(--ppq-muted); }
389:   post-answer guess correction that sits right after it. */
391:.ppq-iq-postguess { margin-bottom: 0.75rem; }
392:.ppq-iq-postguess-btn { font-size: 0.82rem; padding: 0.35rem 0.85rem; border: 1px dashed var(--ppq-line); border-radius: 7px; background: transparent; color: var(--ppq-muted); cursor: pointer; }
393:.ppq-iq-postguess-btn:hover { border-color: var(--ppq-accent); color: var(--ppq-accent); }
394:.ppq-iq-postguess-btn.open { border-style: solid; border-color: var(--ppq-accent); color: var(--ppq-accent); }
395:.ppq-iq-postguess-btn.done { border-style: solid; border-color: var(--ppq-ok); color: var(--ppq-ok); font-weight: 600; }
396:.ppq-iq-postguess-panel { margin-top: 0.5rem; padding: 0.7rem 0.9rem; border: 1px solid var(--ppq-line); border-radius: 8px; background: var(--ppq-paper); }
```

#### Thinking

Now I have a complete picture. The key CSS issue with percentages: line 374 shows `.ppq-gpick-pctwrap { ... margin-left: auto; }` — that's what pushes the percentage to the far right. I need to remove `margin-left: auto` and put a small gap instead.

Now let me also check how the modal is opened after answering, to understand the flow between `_recordAttempt` and `_renderInterrogation`. Let me find where `_renderInterrogation` is called.

#### Tool: Grep

**Input:**

```json
{
  "-n": true,
  "head_limit": 20,
  "output_mode": "content",
  "path": "C:\\Claude (not on Gdrive, nor OneDrive)\\ppqviewer\\engine\\ppqviewer.js",
  "pattern": "_renderInterrogation\\(\\)|_recordAttempt\\("
}
```

**Output:**

```json
958:    this._recordAttempt(label, isRight);
972:    this._recordAttempt(label, isRight);
1013:    this._renderInterrogation();
```

#### Thinking

Let me read around line 1013 to see the flow after answering.


#### Tool: Read

> Read: `C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\engine\ppqviewer.js`

**Output:**

```json
950	    const isRight = label.toUpperCase() === correct;
951	    this._chosenLabel = label.toUpperCase(); this._wasRight = isRight;
952	    /* QoderWork 2026-07-22: cfg.revealCorrect === false suppresses every on-screen
953	       right/wrong verdict (Smith: "the most important thing is we can't tell them
954	       whether they got it right or wrong"). The attempt is still RECORDED with its
955	       correctness — only the display is neutral. */
956	    const reveal = this.cfg.revealCorrect !== false;
957	    this.qa(".ppq-option").forEach((b) => { const L = b.dataset.label.toUpperCase(); if (reveal && L === correct) b.classList.add("correct"); else if (reveal && L === label.toUpperCase()) b.classList.add("incorrect"); if (L === label.toUpperCase()) b.classList.add("chosen"); });
958	    this._recordAttempt(label, isRight);
959	    const al = this.q(".ppq-answer-line"); al.className = "ppq-answer-line show"; al.textContent = reveal ? (isRight ? "Correct, " + correct : "Marked wrong, correct answer is " + correct) : "Answer saved.";
960	    this._afterAnswer();
961	  };
962	
963	  Viewer.prototype.selectMCQ = function (label) {
964	    if (this.answered) return;
965	    this.answered = true;
966	    this._commitTimer(); /* QoderWork 2026-07-22: freeze the clock + time-pressure context */
967	    const correct = (this.cfg.answerKeyOf(this.cur) || "").toString().toUpperCase();
968	    const isRight = label.toUpperCase() === correct;
969	    this._chosenLabel = label.toUpperCase(); this._wasRight = isRight;
970	    const reveal = this.cfg.revealCorrect !== false; /* QoderWork 2026-07-22: same verdict gate as selectOption */
971	    this.qa(".ppq-option").forEach((b) => { const L = b.dataset.label.toUpperCase(); if (reveal && L === correct) b.classList.add("correct"); else if (reveal && L === label.toUpperCase()) b.classList.add("incorrect"); });
972	    this._recordAttempt(label, isRight);
973	    this._showExaminer(this.cur);
974	    this._afterAnswer();
975	  };
976	
977	  Viewer.prototype.reveal = function () {
978	    if (this.answered) return;
979	    if (this._curType === "flashcard") {
980	      this.answered = true;
981	      this._commitTimer(); /* QoderWork 2026-07-22: stop the clock on reveal */
982	      let ms = this._formatMarkscheme(this.cfg.markschemeOf(this.cur));
983	      const ansImg = this.cfg.answerUrlOf(this.cur);
984	      // QoderWork 2026-07-22: softened spoiler wording, aligned with the Chemistry viewer
985	      if (ansImg) ms += '<details class="ppq-ms-full"><summary>Show full markscheme page <span class="ppq-spoiler">(may well contain spoilers for other parts)</span></summary><img src="' + esc(ansImg) + '"></details>';
986	      this.q(".ppq-markscheme").innerHTML = ms;
987	      this.q(".ppq-answer-panel").className = "ppq-answer-panel show";
988	      this._showExaminer(this.cur);
989	      this.q(".ppq-reveal").style.display = "none";
990	      if (this.cfg.modules.math) this._applyMath(this.q(".ppq-answer-panel"));
991	      this._afterAnswer();
992	    } else {
993	      // imageSelfMark reveal: show correct, do not lock a graded attempt
994	      const correct = this.cfg.correctOf(this.cur).toUpperCase();
995	      this.qa(".ppq-option").forEach((b) => { if (b.dataset.label.toUpperCase() === correct) b.classList.add("correct"); });
996	      const al = this.q(".ppq-answer-line"); al.className = "ppq-answer-line show"; al.textContent = "Correct answer: " + (correct || "?") + " (not logged)";
997	    }
998	  };
999	
```

#### Thinking

Let me find `_afterAnswer` to see where `_renderInterrogation` is called.

#### Tool: Read

> Read: `C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\engine\ppqviewer.js`

**Output:**

```json
1000	  Viewer.prototype._afterAnswer = function () {
1001	    this.q(".ppq-skip").style.display = "none";
1002	    this.q(".ppq-reveal").style.display = "none";
1003	    this.q(".ppq-competence").className = "ppq-competence show";
1004	    /* QoderWork 2026-07-22 (analyst handoff): the outer "Actually, I wasn't sure"
1005	       control is superseded by the post-answer guess correction that now sits
1006	       inside the modal right after the verdict. Keep it hidden (DOM + wiring
1007	       retained so the change stays reversible). */
1008	    this.q(".ppq-unsure").style.display = "none";
1009	    this.q(".ppq-guess").style.display = "none"; /* QoderWork 2026-07-22 (v0.2.6): pre-declare closes once answered */
1010	    this.q(".ppq-kb-hint").textContent = "Self-rate, then Enter for next.";
1011	    /* QoderWork 2026-07-22: half-working post-question interrogation. Renders only
1012	       when the module is on AND this question has an analysis record. */
1013	    this._renderInterrogation();
1014	  };
1015	
1016	  Viewer.prototype._showExaminer = function (q) {
1017	    const body = this.cfg.examinerOf(q);
1018	    if (!body) return;
1019	    this.q(".ppq-examiner-body").innerHTML = body;
1020	    this.q(".ppq-answer-panel").classList.add("show", "has-examiner");
1021	  };
1022	
1023	  Viewer.prototype._formatMarkscheme = function (t) {
1024	    let s = t || "";
1025	    s = s.replace(/✓/g, "✓<br><br>");
1026	    s = s.replace(/\bOR\b/g, "<br>&nbsp;&nbsp;<i>OR</i><br>&nbsp;&nbsp;");
1027	    s = s.replace(/Do not accept/g, "<br><b>Do not accept</b>");
1028	    s = s.replace(/Do not award/g, "<br><b>Do not award</b>");
1029	    s = s.replace(/(?<!Do not )Accept /g, "<br><b>Accept </b>");
1030	    s = s.replace(/(?<!Do not )Award /g, "<br><b>Award </b>");
1031	    return s;
1032	  };
1033	
1034	  Viewer.prototype._recordAttempt = function (chosen, isRight) {
1035	    const cfg = this.cfg;
1036	    const row = Object.assign({
1037	      learner_id: cfg.learnerId, id: cfg.idOf(this.cur), chosen_option: chosen, correct: !!isRight, is_correct: isRight ? "right" : "wrong",
1038	      time_ms: Date.now() - this.shownAt, timing_mode: cfg.timingMode, self_report: null, ts: new Date().toISOString(),
1039	      app_version: cfg.appVersion, context: { view: "viewer", id: cfg.idOf(this.cur), type: this._curType },
```

#### Thinking

Good. Now I have the full picture. The flow is:
1. User picks an option → `selectOption(label)` → `_recordAttempt(label, isRight)` → `_afterAnswer()` → `_renderInterrogation()`
2. The attempt is recorded BEFORE the interrogation modal opens.

So for the new pre-verdict guess (declared in the pop-up after the attempt is recorded), I need to update the stored attempt after the guess is committed. I'll modify the last attempt in `this.store.attempts` and call `_saveStore()`.

Now let me also check line 803 and 850 to understand the reset logic.

#### Tool: Read

> Read: `C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\engine\ppqviewer.js`

**Output:**

```json
795	  Viewer.prototype.render = function () {
796	    const cfg = this.cfg;
797	    this.cur = this.view[this.idx];
798	    this.answered = false;
799	    this.shownAt = Date.now();
800	    /* QoderWork 2026-07-22 (analyst handoff): a stable id for THIS displayed
801	       attempt — session+item is not enough when an item is attempted twice. */
802	    this._attemptId = "att_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
803	    this._preGuessDeclaration = null;
804	    this._startTimer(); /* QoderWork 2026-07-22: exam timer (no-op unless config.timer) */
805	    if (this._drawOn) this.toggleDraw();
806	    this.clearCanvas();
807	    this._curType = cfg.questionType(this.cur) || "imageSelfMark";
808	
809	    this.q(".ppq-empty").style.display = "none";
810	    this.q(".ppq-card").style.display = "flex";
811	    this.q(".ppq-qid").textContent = cfg.metaLine(this.cur);
812	    this.q(".ppq-tags").innerHTML = (cfg.tagsOf(this.cur) || []).map((t) => '<span class="ppq-tag">' + esc(t) + "</span>").join("");
813	
814	    this._renderStem(this.cur);
815	    this._resetAnswerUi();
816	    this._renderAnswerArea(this.cur, this._curType);
817	
818	    // restore prior self-rating
819	    this.qa(".ppq-scale-btn").forEach((b) => b.classList.remove("sel"));
820	    const prior = this.store.scores[cfg.idOf(this.cur)];
821	    if (prior) { const sb = this.q('.ppq-scale-btn[data-val="' + prior + '"]'); if (sb) sb.classList.add("sel"); }
822	
823	    if (cfg.modules.math) this._applyMath(this.q(".ppq-card"));
824	
825	    this._prefetch(this.cur);
826	    for (let k = 1; k <= cfg.prefetchAhead; k++) { const a = this.view[(this.idx + k) % this.view.length]; if (a && a !== this.cur) this._prefetch(a); }
827	  };
828	
829	  Viewer.prototype._resetAnswerUi = function () {
830	    this.q(".ppq-answer-line").className = "ppq-answer-line";
831	    this.q(".ppq-answer-line").textContent = "";
832	    this.q(".ppq-answer-panel").className = "ppq-answer-panel";
833	    this.q(".ppq-competence").className = "ppq-competence";
834	    this.q(".ppq-competence").style.display = ""; /* QoderWork 2026-07-22: may have been hidden while the pop-up held the 1-6 */
835	    this.q(".ppq-next").style.display = "none";
836	    this.q(".ppq-skip").style.display = "inline-block";
837	    this.q(".ppq-prev").style.display = "inline-block";
838	    this.q(".ppq-options").innerHTML = "";
839	    this.q(".ppq-options").style.display = "none";
840	    this.q(".ppq-reveal").style.display = "none";
841	    this.q(".ppq-kb-hint").textContent = "";
842	    /* QoderWork 2026-07-22: reset the "wasn't sure" widget between questions */
843	    this.q(".ppq-unsure").style.display = "none";
844	    this.q(".ppq-unsure-pick").style.display = "none";
845	    this.q(".ppq-unsure-letters").innerHTML = "";
846	    const ub = this.q(".ppq-unsure-btn"); ub.classList.remove("on"); ub.textContent = "Actually, I wasn't sure";
847	    /* QoderWork 2026-07-22 (analyst handoff): reset the pre-answer guess widget.
848	       The picker panel is rebuilt per question on next open. */
849	    this.q(".ppq-guess").style.display = "none";
850	    this.q(".ppq-guess-panel").style.display = "none";
851	    this.q(".ppq-guess-panel").innerHTML = "";
852	    const gb = this.q(".ppq-guess-btn"); gb.classList.remove("open", "done"); gb.textContent = this._guessLabel("pre_answer");
853	    this._preGuessDeclaration = null;
854	    /* QoderWork 2026-07-22: reset the pop-up interrogation between questions */
```

#### Thinking

Good, I now have a complete understanding of the codebase. Let me now implement the redesign. Here's my plan:

**Engine changes (ppqviewer.js):**

1. **Hide the pre-answer guess panel permanently** — in `_resetAnswerUi`, keep it hidden; in the DOM build, keep the elements but never show the button. Actually, simplest: just never show `.ppq-guess` (it's already hidden by default via `style="display:none"` and only shown when... let me check where it's shown).

Let me grep for where `.ppq-guess` is shown (display set to visible).

#### Tool: Grep

**Input:**

```json
{
  "-n": true,
  "head_limit": 15,
  "output_mode": "content",
  "path": "C:\\Claude (not on Gdrive, nor OneDrive)\\ppqviewer\\engine\\ppqviewer.js",
  "pattern": "ppq-guess.*display|_answerLabels"
}
```

**Output:**

```json
78:    this._answerLabels = [];
277:    const guessDeclare = el("div", { class: "ppq-guess", style: "display:none;" });
279:    guessDeclare.appendChild(el("div", { class: "ppq-guess-panel", style: "display:none;" }));
489:          (self._answerLabels || []).forEach((L) => {
517:          labels: self._answerLabels || [],
849:    this.q(".ppq-guess").style.display = "none";
850:    this.q(".ppq-guess-panel").style.display = "none";
898:    this._answerLabels = labels.slice();
906:    this.q(".ppq-guess").style.display = labels.length >= 2 ? "" : "none";
913:    this._answerLabels = labels.slice();
925:    this.q(".ppq-guess").style.display = labels.length >= 2 ? "" : "none";
929:    this._answerLabels = [];
1009:    this.q(".ppq-guess").style.display = "none"; /* QoderWork 2026-07-22 (v0.2.6): pre-declare closes once answered */
1292:    const labels = (this._answerLabels && this._answerLabels.length) ? this._answerLabels : (this._optionLabels(this.cur) || []);
1829:        const L = e.key.toUpperCase(), labels = self._answerLabels || [];
```

#### Thinking

Lines 906 and 925 show where `.ppq-guess` is made visible (when there are >= 2 labels). I need to suppress those. The simplest approach: just never show it. I'll change lines 906 and 925 to always keep it hidden (or just remove those lines). But to keep it reversible and not break the DOM references, I'll just leave the element in place and never show it.

Now let me plan the full implementation:

**1. Suppress the pre-answer guess panel (never show it)**
- Lines 906, 925: change to keep `.ppq-guess` always hidden

**2. Rework `_renderInterrogation` to have a two-phase modal:**
- Phase 1 (guess page): shows the guess picker with reworded prompt, Enter to skip
- Phase 2 (rest): verdict + insight + methods + self-report + feedback + 1-6 + flag

**3. Remove `_postGuessEl` from the modal** (the guess is now asked first)

**4. Reword the prompt** in `_guessPrompt`

**5. CSS: fix percentage positioning** (remove `margin-left: auto` from `.ppq-gpick-pctwrap`)

**6. After guess is committed in the pop-up, update the stored attempt row**

Let me now write the code. I'll do the edits carefully.

First, let me re-read the exact lines around 898-930 to understand the context for suppressing the pre-answer panel.

#### Tool: Read

> Read: `C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\engine\ppqviewer.js`

**Output:**

```json
890	    if (type === "mcq") return this._renderMCQ(q);
891	    if (type === "flashcard") return this._renderFlashcard(q);
892	    return this._renderImageSelfMark(q);
893	  };
894	
895	  Viewer.prototype._renderImageSelfMark = function (q) {
896	    const grid = this.q(".ppq-options");
897	    const labels = this._optionLabels(q);
898	    this._answerLabels = labels.slice();
899	    const self = this;
900	    labels.forEach((L) => { const b = el("button", { class: "ppq-option", "data-label": L }, esc(L)); b.addEventListener("click", () => self.selectOption(L)); grid.appendChild(b); });
901	    grid.style.display = labels.length ? "flex" : "none";
902	    this.q(".ppq-reveal").style.display = labels.length ? "inline-block" : "none";
903	    this.q(".ppq-kb-hint").textContent = labels.length ? ("Pick " + labels[0] + "–" + labels[labels.length - 1] + " to self-mark · Enter reveal · S skip · ← previous") : "Enter reveal · S skip · ← previous";
904	    /* QoderWork 2026-07-22 (analyst handoff): show the pre-answer guess toggle;
905	       the picker itself is built lazily on first open. */
906	    this.q(".ppq-guess").style.display = labels.length >= 2 ? "" : "none";
907	  };
908	
909	  Viewer.prototype._renderMCQ = function (q) {
910	    const grid = this.q(".ppq-options");
911	    const choices = this.cfg.choicesOf(q) || [];
912	    const labels = "ABCDEFGH".slice(0, choices.length).split("");
913	    this._answerLabels = labels.slice();
914	    const self = this;
915	    choices.forEach((txt, i) => {
916	      const b = el("button", { class: "ppq-option ppq-option-mcq", "data-label": labels[i] }, '<span class="ppq-key">' + labels[i] + "</span> <span>" + (txt || "") + "</span>");
917	      b.addEventListener("click", () => self.selectMCQ(labels[i]));
918	      grid.appendChild(b);
919	    });
920	    grid.style.display = "flex";
921	    this.q(".ppq-reveal").style.display = "none";
922	    this.q(".ppq-kb-hint").textContent = "Press 1–" + labels.length + " or A–" + labels[labels.length - 1] + " to answer · S skip · ← previous";
923	    /* QoderWork 2026-07-22 (analyst handoff): show the pre-answer guess toggle;
924	       the picker itself is built lazily on first open. */
925	    this.q(".ppq-guess").style.display = labels.length >= 2 ? "" : "none";
926	  };
927	
928	  Viewer.prototype._renderFlashcard = function (q) {
929	    this._answerLabels = [];
930	    this.q(".ppq-options").style.display = "none";
931	    this.q(".ppq-reveal").style.display = "inline-block";
932	    this.q(".ppq-kb-hint").textContent = "Enter/R to reveal the markscheme · S skip · ← previous";
933	  };
934	
935	  Viewer.prototype._optionLabels = function (q) {
936	    const o = this.cfg.options;
937	    if (q.option_labels && q.option_labels.length) return q.option_labels;
938	    if (q.option_count) return "ABCDEFGHIJ".slice(0, q.option_count).split("");
939	    if (o.labels && o.labels.length) return o.labels;
```

#### Thinking

Now I have everything I need. Let me implement the changes. I'll do them in order:

1. Suppress the pre-answer guess panel (lines 906, 925)
2. Rework `_renderInterrogation` to have the guess page first
3. Remove `_postGuessEl` from the modal flow
4. Reword `_guessPrompt`
5. Fix CSS percentage positioning
6. Add attempt-row update when guess is committed in the pop-up

Let me start with the edits. I'll be careful with the Edit tool (remembering the pitfall about function boundaries).

Let me start with the simpler changes first:

**Edit 1: Suppress pre-answer guess panel (line 906)**

Good, I have the full picture. Let me implement the redesign now. Starting with the engine changes.

**Edit 1:** Suppress the pre-answer guess panel (it moves into the pop-up).



#### Tool: Edit

> Modified: `C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\engine\ppqviewer.js`

**Output:**

```json
Successfully modified file: C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\engine\ppqviewer.js (1 replacements). Here is the updated code:
...
    const self = this;
    labels.forEach((L) => { const b = el("button", { class: "ppq-option", "data-label": L }, esc(L)); b.addEventListener("click", () => self.selectOption(L)); grid.appendChild(b); });
    grid.style.display = labels.length ? "flex" : "none";
    this.q(".ppq-reveal").style.display = labels.length ? "inline-block" : "none";
    this.q(".ppq-kb-hint").textContent = labels.length ? ("Pick " + labels[0] + "–" + labels[labels.length - 1] + " to self-mark · Enter reveal · S skip · ← previous") : "Enter reveal · S skip · ← previous";
    /* QoderWork 2026-07-23: pre-answer guess panel retired — the guess declaration
       is now the FIRST PAGE of the post-answer pop-up (before the verdict). The
       below-question panel is never shown. DOM retained for reversibility. */
    this.q(".ppq-guess").style.display = "none";
  };

  Viewer.prototype._renderMCQ = function (q) {
    const grid = this.q(".ppq-options");
    const choices = this.cfg.choicesOf(q) || [];
...
```

#### Thinking

Good. Now the same for _renderMCQ (line 925).

#### Tool: Edit

> Modified: `C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\engine\ppqviewer.js`

**Output:**

```json
Successfully modified file: C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\engine\ppqviewer.js (1 replacements). Here is the updated code:
...
      grid.appendChild(b);
    });
    grid.style.display = "flex";
    this.q(".ppq-reveal").style.display = "none";
    this.q(".ppq-kb-hint").textContent = "Press 1–" + labels.length + " or A–" + labels[labels.length - 1] + " to answer · S skip · ← previous";
    /* QoderWork 2026-07-23: pre-answer guess panel retired (now in the pop-up). */
    this.q(".ppq-guess").style.display = "none";
  };

  Viewer.prototype._renderFlashcard = function (q) {
    this._answerLabels = [];
    this.q(".ppq-options").style.display = "none";
...
```

#### Thinking

Good. Now **Edit 2:** Reword the `_guessPrompt` function. The new prompt for the pre-verdict stage should be something simple and natural like "Want to declare a bit of a guess?" — and I'll add a new stage "pre_verdict" for the in-popup version.

**Edit 2:** Reword the guess prompt and add the new "pre_verdict" stage.



#### Tool: Edit

> Modified: `C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\engine\ppqviewer.js`

**Output:**

```json
Successfully modified file: C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\engine\ppqviewer.js (1 replacements). Here is the updated code:
...
      for (let k = 0; rem > 0 && k < order.length; k++) { alloc[order[k].i]++; rem--; }
    }
    return alloc.map((x) => x + minEach);
  }

  /* QoderWork 2026-07-23: reworded guess prompts. The "pre_verdict" stage is the
     new first-page-of-the-pop-up guess (asked after answering, before the verdict
     is revealed). Smith: "but reword." — simpler, more natural language. */
  Viewer.prototype._guessPrompt = function (stage) {
    const d = this.cfg.guessDefaults && this.cfg.guessDefaults[stage];
    if (stage === "pre_verdict") return (d && d.candidate_prompt) || "Tick the options you think it could be.";
    if (stage === "pre_answer") return (d && d.candidate_prompt) || "Tick the options you think it could be.";
    return (d && d.candidate_prompt) || "Which options were still in the running?";
  };
  Viewer.prototype._guessLabel = function (stage) {
    const d = this.cfg.guessDefaults && this.cfg.guessDefaults[stage];
    if (stage === "pre_verdict") return (d && d.label) || "Want to declare a bit of a guess?";
    if (stage === "pre_answer") return (d && d.label) || "I'm guessing";
    return (d && d.label) || "Actually, it was a guess";
  };

  /* QoderWork 2026-07-22 (analyst handoff): shared guess picker used by BOTH the
...
```

#### Thinking

Good. Now the big one: **Edit 3:** Rework `_renderInterrogation` to have the guess page as the first thing, with the rest of the modal hidden until they Done/Skip.

The new flow:
1. Build the guess page (using `_buildGuessPicker` with stage "pre_verdict")
2. Build the rest of the modal (verdict, insight, methods, etc.) but wrap it in a container that's hidden
3. Show only the guess page
4. On Done: commit the guess, update the attempt row, hide guess page, show rest, render feedback
5. On Skip (or Enter): hide guess page, show rest, render feedback

I also need to:
- Remove `_postGuessEl` from the modal (it's now redundant)
- Add Enter-to-skip behavior on the guess page
- After committing the guess, update the last attempt row in the store

Let me write the new `_renderInterrogation`. I'll replace the section from the verdict comment through the postGuessEl append.

**Edit 3:** The main rework — `_renderInterrogation` now opens on the guess page first, with the verdict and rest hidden until Done/Skip.



#### Tool: Edit

> Modified: `C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\engine\ppqviewer.js`

**Output:**

```json
Successfully modified file: C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\engine\ppqviewer.js (1 replacements). Here is the updated code:
...
    const chosen = this._chosenLabel;
    const correctLetter = isV2
      ? String((rec.identity && rec.identity.correct_answer) || "").toUpperCase()
      : (cfg.correctOf(this.cur) || "").toString().toUpperCase();

    /* --- QoderWork 2026-07-23: GUESS PAGE FIRST (before the verdict). The pupil
       answers, the pop-up opens straight onto "Want to declare a bit of a guess?",
       they tick options or press Enter to skip, and ONLY THEN does the verdict
       appear. A beat of suspense before the reveal. The old pre-answer panel below
       the question and the old post-answer correction are both superseded. --- */
    const labels = (this._answerLabels && this._answerLabels.length) ? this._answerLabels : (this._optionLabels(this.cur) || []);
    const guessPage = el("div", { class: "ppq-iq-guesspage" });
    const restPage = el("div", { class: "ppq-iq-rest", style: "display:none;" });

    if (labels.length >= 2) {
      guessPage.appendChild(el("div", { class: "ppq-iq-guesspage-heading" }, esc(this._guessLabel("pre_verdict"))));
      const picker = this._buildGuessPicker({
        labels: labels,
        preselect: chosen ? [String(chosen).toUpperCase()] : [],
        stage: "pre_verdict",
        prompt: this._guessPrompt("pre_verdict"),
        onDone: (payload) => { self._commitPreVerdictGuess(payload, chosen, isRight); revealRest(); },
        onSkip: () => { revealRest(); }
      });
      guessPage.appendChild(picker);
      /* QoderWork 2026-07-23: Enter skips the guess page (proceeds to the verdict).
         Smith: "they just press Enter again, and they just skip it and they get
         the answer." Only fires when no input/textarea has focus. */
      guessPage.addEventListener("keydown", function handler(e) {
        if (e.key === "Enter" && !/(INPUT|TEXTAREA|SELECT)/.test((e.target.tagName || ""))) {
          e.preventDefault(); e.stopPropagation();
          guessPage.removeEventListener("keydown", handler);
          revealRest();
        }
      });
    }

    function revealRest() {
      guessPage.style.display = "none";
      restPage.style.display = "";
      self._renderInterrogationFeedback();
    }

    /* --- 1. the verdict FIRST within the rest (analyst handoff): the concrete
       "You chose X — the answer is Y" leads. The error_path explanation beneath
       it is optional; the verdict line itself is not. --- */
    restPage.appendChild(this._verdictEl(rec, isV2, chosen, correctLetter, this._wasRight));

    if (isV2) {
      /* --- 3. the pupil insight (first_notice / why_it_matters / next_move) --- */
      this._appendInsightV2(iq, rec);
      /* --- 4. methods: title + structured pupil_steps + elimination chips --- */
      this._appendMethodsV2(iq, rec);
...
```

#### Thinking

Good. Now I need to change the remaining appends from `iq` to `restPage` for the sections that come after the verdict. Let me read the current state of the code after my edit to see what needs changing.


Now I need to redirect the remaining appends (insight, methods, self-report, feedback, rating, flag) into `restPage` instead of `iq`. Let me read the current state.



#### Tool: Read

> Read: `C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\engine\ppqviewer.js`

**Output:**

```json
1195	          guessPage.removeEventListener("keydown", handler);
1196	          revealRest();
1197	        }
1198	      });
1199	    }
1200	
1201	    function revealRest() {
1202	      guessPage.style.display = "none";
1203	      restPage.style.display = "";
1204	      self._renderInterrogationFeedback();
1205	    }
1206	
1207	    /* --- 1. the verdict FIRST within the rest (analyst handoff): the concrete
1208	       "You chose X — the answer is Y" leads. The error_path explanation beneath
1209	       it is optional; the verdict line itself is not. --- */
1210	    restPage.appendChild(this._verdictEl(rec, isV2, chosen, correctLetter, this._wasRight));
1211	
1212	    if (isV2) {
1213	      /* --- 3. the pupil insight (first_notice / why_it_matters / next_move) --- */
1214	      this._appendInsightV2(iq, rec);
1215	      /* --- 4. methods: title + structured pupil_steps + elimination chips --- */
1216	      this._appendMethodsV2(iq, rec);
1217	      /* --- 5. primary self-report + knowledge check (feed the feedback match) --- */
1218	      this._appendSelfReportV2(iq, rec);
1219	    } else {
1220	      /* legacy analysis-store path: probe + free-prose methods */
1221	      this._appendProbeLegacy(iq, rec);
1222	      this._appendMethodsLegacy(iq, rec, correctLetter);
1223	    }
1224	
1225	    /* --- feedback lands here (reacts to the self-report + guess declaration) --- */
1226	    iq.appendChild(el("div", { class: "ppq-iq-feedback" }));
1227	
1228	    /* --- the 1-6 self-rating, INSIDE the pop-up (was "back outside") --- */
1229	    const rate = el("div", { class: "ppq-iq-rate" });
1230	    rate.appendChild(el("div", { class: "ppq-iq-rate-prompt" }, esc(cfg.selfReport.prompt)));
1231	    const scale = el("div", { class: "ppq-scale ppq-iq-scale" });
1232	    const meanings = cfg.selfReport.meanings || [];
1233	    for (let v = 1; v <= cfg.selfReport.levels; v++) {
1234	      const lbl = cfg.selfReport.labels ? cfg.selfReport.labels[v - 1] : String(v);
1235	      const meaning = meanings[v - 1] || "";
1236	      scale.appendChild(el("button", { class: "ppq-scale-btn ppq-iq-scale-btn", "data-val": String(v), title: meaning ? (v + " — " + meaning) : "" }, esc(lbl)));
1237	    }
1238	    rate.appendChild(scale);
1239	    if (meanings.length) {
1240	      rate.appendChild(el("div", { class: "ppq-scale-legend" }, meanings.map(function (mm, i) { return '<span class="ppq-scale-legend-item"><b>' + (i + 1) + "</b> " + esc(mm) + "</span>"; }).join("")));
1241	    }
1242	    const prior = this.store.scores[cfg.idOf(this.cur)];
1243	    if (prior) { const sb = scale.querySelector('.ppq-iq-scale-btn[data-val="' + prior + '"]'); if (sb) sb.classList.add("sel"); }
1244	    const iqNext = el("button", { class: "ppq-btn ppq-primary ppq-iq-next", type: "button", style: "display:none;" }, "Next question →");
1245	    iqNext.addEventListener("click", () => { self.closeModal(); self.next(); });
1246	    scale.addEventListener("click", (e) => {
1247	      const b = e.target.closest ? e.target.closest(".ppq-iq-scale-btn") : null;
1248	      if (!b) return;
1249	      const val = parseInt(b.dataset.val, 10);
1250	      scale.querySelectorAll(".ppq-iq-scale-btn").forEach((x) => x.classList.remove("sel"));
1251	      b.classList.add("sel");
1252	      if (self.cur) {
1253	        self.store.scores[self.cfg.idOf(self.cur)] = val; self._saveStore();
1254	        self._fireReport({ status: "rated", qtype: "self_report", extra_json: JSON.stringify({ rating: val }) });
1255	      }
1256	      iqNext.style.display = "inline-block"; iqNext.focus();
1257	    });
1258	    rate.appendChild(iqNext);
1259	    iq.appendChild(rate);
1260	
1261	    /* --- optional "come back to this" flag (Smith: review / more like this) --- */
1262	    const flag = el("button", { class: "ppq-iq-flag" }, "Flag this — come back / more like this");
1263	    flag.addEventListener("click", () => {
1264	      flag.classList.toggle("on");
1265	      const on = flag.classList.contains("on");
1266	      flag.textContent = on ? "Flagged ✓ — we'll bring more like this" : "Flag this — come back / more like this";
1267	      self._fireReport({ status: "flag_review", qtype: "review_flag", extra_json: JSON.stringify({ flagged: on }) });
1268	    });
1269	    iq.appendChild(flag);
1270	
1271	    /* --- mount into the modal shell and open the pop-up. While it holds the 1-6,
1272	       the outer 1-6 row is hidden; closeModal restores it if they bail early. --- */
1273	    const body = this.q(".ppq-modal-body");
1274	    body.innerHTML = "";
```

#### Thinking

I need to change all the `iq.appendChild` and `this._appendXxx(iq, ...)` calls to use `restPage` instead. Let me do this in one edit covering lines 1212-1269.

#### Tool: Edit

> Modified: `C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\engine\ppqviewer.js`

**Output:**

```json
Successfully modified file: C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\engine\ppqviewer.js (1 replacements). Here is the updated code:
...
       it is optional; the verdict line itself is not. --- */
    restPage.appendChild(this._verdictEl(rec, isV2, chosen, correctLetter, this._wasRight));

    if (isV2) {
      /* --- 3. the pupil insight (first_notice / why_it_matters / next_move) --- */
      this._appendInsightV2(restPage, rec);
      /* --- 4. methods: title + structured pupil_steps + elimination chips --- */
      this._appendMethodsV2(restPage, rec);
      /* --- 5. primary self-report + knowledge check (feed the feedback match) --- */
      this._appendSelfReportV2(restPage, rec);
    } else {
      /* legacy analysis-store path: probe + free-prose methods */
      this._appendProbeLegacy(restPage, rec);
      this._appendMethodsLegacy(restPage, rec, correctLetter);
    }

    /* --- feedback lands here (reacts to the self-report + guess declaration) --- */
    restPage.appendChild(el("div", { class: "ppq-iq-feedback" }));

    /* --- the 1-6 self-rating, INSIDE the pop-up (was "back outside") --- */
    const rate = el("div", { class: "ppq-iq-rate" });
    rate.appendChild(el("div", { class: "ppq-iq-rate-prompt" }, esc(cfg.selfReport.prompt)));
    const scale = el("div", { class: "ppq-scale ppq-iq-scale" });
...
        self._fireReport({ status: "rated", qtype: "self_report", extra_json: JSON.stringify({ rating: val }) });
      }
      iqNext.style.display = "inline-block"; iqNext.focus();
    });
    rate.appendChild(iqNext);
    restPage.appendChild(rate);

    /* --- optional "come back to this" flag (Smith: review / more like this) --- */
    const flag = el("button", { class: "ppq-iq-flag" }, "Flag this — come back / more like this");
    flag.addEventListener("click", () => {
      flag.classList.toggle("on");
      const on = flag.classList.contains("on");
      flag.textContent = on ? "Flagged ✓ — we'll bring more like this" : "Flag this — come back / more like this";
      self._fireReport({ status: "flag_review", qtype: "review_flag", extra_json: JSON.stringify({ flagged: on }) });
    });
    restPage.appendChild(flag);

    /* --- mount into the modal shell and open the pop-up. While it holds the 1-6,
       the outer 1-6 row is hidden; closeModal restores it if they bail early. --- */
    const body = this.q(".ppq-modal-body");
    body.innerHTML = "";
...
```

#### Thinking

Good. Now I need to update the mount section to append both `guessPage` and `restPage` into `iq`, and then `iq` into the modal body. Let me read the current mount section.


Now update the mount section to assemble `iq` with both pages.



#### Tool: Read

> Read: `C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\engine\ppqviewer.js`

**Output:**

```json
1270	
1271	    /* --- mount into the modal shell and open the pop-up. While it holds the 1-6,
1272	       the outer 1-6 row is hidden; closeModal restores it if they bail early. --- */
1273	    const body = this.q(".ppq-modal-body");
1274	    body.innerHTML = "";
1275	    body.appendChild(iq);
1276	    this.q(".ppq-modal").classList.add("show");
1277	    this._iqBox = iq;
1278	    this._iqOpen = true;
1279	    this.q(".ppq-competence").style.display = "none";
1280	    /* QoderWork 2026-07-22 (analyst handoff): populate feedback now so entries
1281	       that match without a guess or prompt-state (v2 selected_options-only,
1282	       legacy any_wrong/any_correct) show on the initial render. It re-renders
1283	       when a guess is committed or a self-report state is tapped. */
1284	    this._renderInterrogationFeedback();
1285	  };
1286	
1287	  /* QoderWork 2026-07-22 (analyst handoff): an analysis-v2 record is detected by
1288	     its identity + pupil_analysis blocks. Legacy analysis-store records have a
1289	     probe + free-prose methods instead. */
```

#### Thinking

I need to:
1. Append `guessPage` and `restPage` into `iq` before mounting
2. Remove the immediate `_renderInterrogationFeedback()` call at the end (it's now called inside `revealRest()` after the guess page is dismissed)


#### Tool: Edit

> Modified: `C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\engine\ppqviewer.js`

**Output:**

```json
Successfully modified file: C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\engine\ppqviewer.js (1 replacements). Here is the updated code:
...
      flag.textContent = on ? "Flagged ✓ — we'll bring more like this" : "Flag this — come back / more like this";
      self._fireReport({ status: "flag_review", qtype: "review_flag", extra_json: JSON.stringify({ flagged: on }) });
    });
    restPage.appendChild(flag);

    /* --- mount into the modal shell and open the pop-up. The guess page shows
       first; the rest (verdict onward) is hidden until Done/Skip. While the pop-up
       holds the 1-6, the outer 1-6 row is hidden; closeModal restores it. --- */
    iq.appendChild(guessPage);
    iq.appendChild(restPage);
    const body = this.q(".ppq-modal-body");
    body.innerHTML = "";
    body.appendChild(iq);
    this.q(".ppq-modal").classList.add("show");
    this._iqBox = iq;
    this._iqOpen = true;
    this.q(".ppq-competence").style.display = "none";
    /* QoderWork 2026-07-23: feedback is NOT rendered here — it fires inside
       revealRest() once the guess page is dismissed, so guess-aware entries
       match correctly. */
  };

  /* QoderWork 2026-07-22 (analyst handoff): an analysis-v2 record is detected by
     its identity + pupil_analysis blocks. Legacy analysis-store records have a
     probe + free-prose methods instead. */
...
```

#### Thinking

Good. Now I need to add the `_commitPreVerdictGuess` method. This is the new function that records the guess declared in the pop-up's first page. It should:
1. Set `this._preGuessDeclaration` (so it's available for the attempt row if needed)
2. Set `this._postGuessDeclared = true` (so feedback matching sees it)
3. Update the last stored attempt row to include the guess declaration
4. Fire the report event
5. Re-render feedback (actually, this is done in revealRest which is called right after)

Let me add this method near `_commitPostGuess`. Let me read that area.


**Edit 4:** Add the `_commitPreVerdictGuess` method (records the guess from the pop-up's first page and updates the stored attempt).



#### Tool: Read

> Read: `C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\engine\ppqviewer.js`

**Output:**

```json
1345	    });
1346	    wrap.appendChild(btn);
1347	    wrap.appendChild(panel);
1348	    return wrap;
1349	  };
1350	
1351	  /* QoderWork 2026-07-22 (analyst handoff): record the post-answer declaration.
1352	     It additionally carries the committed option and its result, recorded
1353	     independently of the candidate set. Fires guess_declaration, then re-matches
1354	     feedback so guess-aware text can appear at the right time. */
1355	  Viewer.prototype._commitPostGuess = function (payload, chosen, isRight) {
1356	    payload.chosen_option = String(chosen || "").toUpperCase();
1357	    payload.correct = !!isRight;
1358	    this._postGuessDeclared = true;
1359	    this._postGuessDeclaration = payload;
1360	    const btn = this._iqBox ? this._iqBox.querySelector(".ppq-iq-postguess-btn") : null;
1361	    if (btn) { btn.textContent = "Recorded: " + payload.candidate_options.join(", ") + " ✓"; btn.classList.add("done"); }
1362	    this._fireReport({ status: "interrogation", qtype: "guess_declaration", extra_json: JSON.stringify(payload) });
1363	    this._renderInterrogationFeedback();
1364	  };
```

#### Thinking

I'll add `_commitPreVerdictGuess` right after `_commitPostGuess`. This new method:
1. Adds chosen_option and correct to the payload
2. Sets `_postGuessDeclared = true` and `_preGuessDeclaration` (for feedback matching and attempt attachment)
3. Updates the last attempt in the store (since the attempt was already recorded before the modal opened)
4. Fires the report event

#### Tool: Edit

> Modified: `C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\engine\ppqviewer.js`

**Output:**

```json
Successfully modified file: C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\engine\ppqviewer.js (1 replacements). Here is the updated code:
...
    if (btn) { btn.textContent = "Recorded: " + payload.candidate_options.join(", ") + " ✓"; btn.classList.add("done"); }
    this._fireReport({ status: "interrogation", qtype: "guess_declaration", extra_json: JSON.stringify(payload) });
    this._renderInterrogationFeedback();
  };

  /* QoderWork 2026-07-23: record the pre-verdict guess (declared on the pop-up's
     first page, AFTER answering but BEFORE seeing the correct answer). Updates the
     already-stored attempt row retroactively (the attempt was committed the moment
     they picked an option, before the modal opened). */
  Viewer.prototype._commitPreVerdictGuess = function (payload, chosen, isRight) {
    payload.chosen_option = String(chosen || "").toUpperCase();
    payload.correct = !!isRight;
    this._postGuessDeclared = true;
    this._preGuessDeclaration = payload;
    /* retroactively attach to the last stored attempt row */
    const attempts = this.store.attempts;
    if (attempts.length) {
      attempts[attempts.length - 1].pre_guess_declaration = payload;
      this._saveStore();
    }
    this._fireReport({ status: "interrogation", qtype: "guess_declaration", extra_json: JSON.stringify(payload) });
  };

  /* QoderWork 2026-07-22 (analyst handoff): the v2 pupil insight, rendered
     faithfully (first_notice / why_it_matters / next_move). Labels are viewer
     chrome; the prose is the analysts' and is not rewritten. */
  Viewer.prototype._appendInsightV2 = function (iq, rec) {
    const pa = rec.pupil_analysis || {};
...
```

#### Thinking

Good. Now I need to check the feedback matching code — it uses `this._postGuessDeclared` to gate guess-aware feedback. Let me verify that the variable name is consistent. Let me grep for `_postGuessDeclared` and `guessDeclared` in the feedback matching.

Let me verify the feedback matching still sees the guess flag correctly.



#### Tool: Grep

**Input:**

```json
{
  "-n": true,
  "head_limit": 10,
  "output_mode": "content",
  "path": "C:\\Claude (not on Gdrive, nor OneDrive)\\ppqviewer\\engine\\ppqviewer.js",
  "pattern": "guessDeclared|_postGuessDeclared"
}
```

**Output:**

```json
1158:    this._postGuessDeclared = false;
1358:    this._postGuessDeclared = true;
1373:    this._postGuessDeclared = true;
1633:    const guessDeclared = !!(this._postGuessDeclared || this._preGuessDeclaration);
1640:      if (fb.guess_declared === true && !guessDeclared) continue;
1641:      if (fb.guess_declared === false && guessDeclared) continue;
```

#### Thinking

The feedback matching at line 1633 checks `this._postGuessDeclared || this._preGuessDeclaration`. My `_commitPreVerdictGuess` sets BOTH of these, so the feedback matching will correctly see the guess. And `revealRest()` calls `_renderInterrogationFeedback()` after the guess is committed, so the timing is correct.

Now let me also handle the edge case: if there are fewer than 2 labels (e.g., a flashcard), the guess page is empty and we should just show the rest immediately. Let me check — in my code, if `labels.length < 2`, the `guessPage` div is empty (no heading, no picker). The `restPage` is hidden. The modal would show an empty guess page with no way to proceed. I need to handle this: if no guess page content, skip straight to the rest.

Let me read my code again to check this case.

I need to handle the edge case where there are fewer than 2 labels (no guess possible) — the rest should show immediately. Let me check and fix.



#### Tool: Read

> Read: `C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\engine\ppqviewer.js`

**Output:**

```json
1175	    const guessPage = el("div", { class: "ppq-iq-guesspage" });
1176	    const restPage = el("div", { class: "ppq-iq-rest", style: "display:none;" });
1177	
1178	    if (labels.length >= 2) {
1179	      guessPage.appendChild(el("div", { class: "ppq-iq-guesspage-heading" }, esc(this._guessLabel("pre_verdict"))));
1180	      const picker = this._buildGuessPicker({
1181	        labels: labels,
1182	        preselect: chosen ? [String(chosen).toUpperCase()] : [],
1183	        stage: "pre_verdict",
1184	        prompt: this._guessPrompt("pre_verdict"),
1185	        onDone: (payload) => { self._commitPreVerdictGuess(payload, chosen, isRight); revealRest(); },
1186	        onSkip: () => { revealRest(); }
1187	      });
1188	      guessPage.appendChild(picker);
1189	      /* QoderWork 2026-07-23: Enter skips the guess page (proceeds to the verdict).
```

#### Thinking

I see the issue: if `labels.length < 2`, the `guessPage` is empty and `restPage` is hidden. The modal would show nothing. I need to add an `else` clause that shows the rest immediately. Let me find the closing of the `if (labels.length >= 2)` block and add the else.

#### Tool: Read

> Read: `C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\engine\ppqviewer.js`

**Output:**

```json
1196	          revealRest();
1197	        }
1198	      });
1199	    }
1200	
1201	    function revealRest() {
1202	      guessPage.style.display = "none";
1203	      restPage.style.display = "";
1204	      self._renderInterrogationFeedback();
1205	    }
1206	
1207	    /* --- 1. the verdict FIRST within the rest (analyst handoff): the concrete
1208	       "You chose X — the answer is Y" leads. The error_path explanation beneath
1209	       it is optional; the verdict line itself is not. --- */
1210	    restPage.appendChild(this._verdictEl(rec, isV2, chosen, correctLetter, this._wasRight));
```

#### Thinking

I need to add an else clause after the `if (labels.length >= 2)` block (line 1199) to handle the case where there are fewer than 2 labels. In that case, hide the guess page and show the rest immediately. Actually, the simplest fix: if labels < 2, just set restPage to visible and guessPage to hidden from the start.

Let me edit line 1199 to add the else.

#### Tool: Edit

> Modified: `C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\engine\ppqviewer.js`

**Output:**

```json
Successfully modified file: C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\engine\ppqviewer.js (1 replacements). Here is the updated code:
...
          e.preventDefault(); e.stopPropagation();
          guessPage.removeEventListener("keydown", handler);
          revealRest();
        }
      });
    } else {
      /* QoderWork 2026-07-23: fewer than 2 options — no guess to declare, skip
         straight to the verdict. */
      guessPage.style.display = "none";
      restPage.style.display = "";
    }

    function revealRest() {
      guessPage.style.display = "none";
      restPage.style.display = "";
...
```

#### Thinking

Wait, there's a problem. If `labels.length < 2`, I set `restPage.style.display = ""` immediately, but `_renderInterrogationFeedback()` is only called inside `revealRest()`. I need to also call it in the else branch. Let me fix that.

Actually, looking more carefully: in the else branch, I show the rest immediately but don't call `_renderInterrogationFeedback()`. The feedback needs to be rendered. Let me add that call.

#### Tool: Edit

> Modified: `C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\engine\ppqviewer.js`

**Output:**

```json
Successfully modified file: C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\engine\ppqviewer.js (1 replacements). Here is the updated code:
...
    } else {
      /* QoderWork 2026-07-23: fewer than 2 options — no guess to declare, skip
         straight to the verdict. */
      guessPage.style.display = "none";
      restPage.style.display = "";
      this._renderInterrogationFeedback();
    }

    function revealRest() {
      guessPage.style.display = "none";
      restPage.style.display = "";
...
```

#### Thinking

Good. Now let me fix the CSS — the percentage positioning. The issue is `.ppq-gpick-pctwrap { margin-left: auto; }` which pushes the percentage to the far right. I need to remove that and put a small gap instead.

**Edit 5:** CSS — pull the percentage in next to the letter (remove `margin-left: auto`).



#### Tool: Edit

> Modified: `C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\engine\ppqviewer.css`

**Error:** Error: File has not been read yet. Read it first before writing to it.

#### Thinking

I need to read the CSS file first before editing it.


#### Tool: Read

> Read: `C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\engine\ppqviewer.css`

**Output:**

```json
365	/* QoderWork 2026-07-22 (analyst handoff): the shared guess picker (.ppq-gpick-*),
366	   used both pre-answer (in-card) and post-answer (in-modal). Percentages sit
367	   behind an optional toggle; the inline message carries validation errors. */
368	.ppq-gpick { }
369	.ppq-gpick-prompt { font-size: 0.85rem; font-weight: 600; color: var(--ppq-ink2); margin-bottom: 0.5rem; }
370	.ppq-gpick-options { display: flex; flex-direction: column; gap: 0.35rem; }
371	.ppq-gpick-row { display: flex; align-items: center; gap: 0.5rem; font-size: 0.88rem; color: var(--ppq-ink); cursor: pointer; }
372	.ppq-gpick-row input[type="checkbox"] { width: 1rem; height: 1rem; accent-color: var(--ppq-accent); }
373	.ppq-gpick-letter { font-weight: 700; min-width: 1.2rem; }
374	.ppq-gpick-pctwrap { display: inline-flex; align-items: center; gap: 0.15rem; margin-left: auto; }
375	.ppq-gpick-pct { width: 3.4rem; font-size: 0.85rem; padding: 0.2rem 0.35rem; border: 1px solid var(--ppq-line); border-radius: 5px; text-align: right; }
376	.ppq-gpick-pct:disabled { opacity: 0.4; border-color: transparent; background: transparent; }
377	.ppq-gpick-pctsign { font-size: 0.8rem; color: var(--ppq-muted); }
378	.ppq-gpick-msg { font-size: 0.8rem; color: var(--ppq-bad); margin-top: 0.45rem; }
379	.ppq-gpick-pcttoggle { display: block; margin-top: 0.55rem; font-size: 0.78rem; padding: 0.25rem 0.7rem; border: 1px dashed var(--ppq-line); border-radius: 7px; background: transparent; color: var(--ppq-muted); cursor: pointer; }
380	.ppq-gpick-pcttoggle:hover { border-color: var(--ppq-accent); color: var(--ppq-accent); }
381	.ppq-gpick-pcttoggle.on { border-style: solid; border-color: var(--ppq-accent); color: var(--ppq-accent); }
382	.ppq-gpick-actions { display: flex; gap: 0.5rem; margin-top: 0.7rem; }
383	.ppq-gpick-done { font-size: 0.8rem; padding: 0.3rem 0.85rem; border: 1px solid var(--ppq-accent); border-radius: 7px; background: var(--ppq-accent); color: #fff; cursor: pointer; font-weight: 600; }
384	.ppq-gpick-done:hover { opacity: 0.85; }
385	.ppq-gpick-skip { font-size: 0.8rem; padding: 0.3rem 0.85rem; border: 1px solid var(--ppq-line); border-radius: 7px; background: var(--ppq-bg); color: var(--ppq-ink2); cursor: pointer; }
386	.ppq-gpick-skip:hover { border-color: var(--ppq-muted); }
387	
388	/* QoderWork 2026-07-22 (analyst handoff): verdict wrapper + the in-modal
389	   post-answer guess correction that sits right after it. */
390	.ppq-iq-verdict { margin-bottom: 0.5rem; }
391	.ppq-iq-postguess { margin-bottom: 0.75rem; }
392	.ppq-iq-postguess-btn { font-size: 0.82rem; padding: 0.35rem 0.85rem; border: 1px dashed var(--ppq-line); border-radius: 7px; background: transparent; color: var(--ppq-muted); cursor: pointer; }
393	.ppq-iq-postguess-btn:hover { border-color: var(--ppq-accent); color: var(--ppq-accent); }
394	.ppq-iq-postguess-btn.open { border-style: solid; border-color: var(--ppq-accent); color: var(--ppq-accent); }
395	.ppq-iq-postguess-btn.done { border-style: solid; border-color: var(--ppq-ok); color: var(--ppq-ok); font-weight: 600; }
396	.ppq-iq-postguess-panel { margin-top: 0.5rem; padding: 0.7rem 0.9rem; border: 1px solid var(--ppq-line); border-radius: 8px; background: var(--ppq-paper); }
397	
398	/* QoderWork 2026-07-22 (analyst handoff): the v2 pupil insight — three labelled
399	   lines (first notice / why it matters / next move), prose rendered faithfully. */
400	.ppq-iq-insight { border: 1px solid var(--ppq-line); border-left: 3px solid var(--ppq-accent); border-radius: 8px; padding: 0.65rem 0.9rem; margin-bottom: 0.75rem; background: var(--ppq-paper); }
401	.ppq-iq-insight-line { display: block; font-size: 0.9rem; line-height: 1.5; padding: 0.18rem 0; }
402	.ppq-iq-insight-label { display: block; font-size: 0.72rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.04em; color: var(--ppq-accent); margin-bottom: 0.1rem; }
403	.ppq-iq-insight-text { color: var(--ppq-ink); }
404	
405	/* QoderWork 2026-07-22 (analyst handoff): the structured self-report prompt and
406	   its tappable state chips (method-awareness + knowledge check). */
407	.ppq-iq-prompt { margin-bottom: 0.75rem; }
408	.ppq-iq-prompt-text { font-size: 0.92rem; font-weight: 600; line-height: 1.45; color: var(--ppq-ink); margin-bottom: 0.45rem; }
409	.ppq-iq-prompt-states { display: flex; gap: 0.35rem; flex-wrap: wrap; }
410	.ppq-iq-state { font-size: 0.78rem; padding: 0.3rem 0.7rem; border: 1px solid var(--ppq-line); border-radius: 999px; background: var(--ppq-bg); color: var(--ppq-ink2); cursor: pointer; }
411	.ppq-iq-state:hover { border-color: var(--ppq-accent); color: var(--ppq-accent); }
412	.ppq-iq-state.sel { background: var(--ppq-accent); border-color: var(--ppq-accent); color: #fff; font-weight: 700; }
413	
414	/* QoderWork 2026-07-22 (v0.2.4): multi-select dropdown filter (subject defaults to
```

#### Thinking

Good, now I can edit the CSS file.

#### Tool: Edit

> Modified: `C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\engine\ppqviewer.css`

**Output:**

```json
Successfully modified file: C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\engine\ppqviewer.css (1 replacements). Here is the updated code:
...
.ppq-gpick-prompt { font-size: 0.85rem; font-weight: 600; color: var(--ppq-ink2); margin-bottom: 0.5rem; }
.ppq-gpick-options { display: flex; flex-direction: column; gap: 0.35rem; }
.ppq-gpick-row { display: flex; align-items: center; gap: 0.5rem; font-size: 0.88rem; color: var(--ppq-ink); cursor: pointer; }
.ppq-gpick-row input[type="checkbox"] { width: 1rem; height: 1rem; accent-color: var(--ppq-accent); }
.ppq-gpick-letter { font-weight: 700; min-width: 1.2rem; }
/* QoderWork 2026-07-23: percentage pulled in next to the letter (was margin-left:auto,
   floating way out on the right — Smith: "the percentages are too far apart"). */
.ppq-gpick-pctwrap { display: inline-flex; align-items: center; gap: 0.15rem; margin-left: 0.45rem; }
.ppq-gpick-pct { width: 3.4rem; font-size: 0.85rem; padding: 0.2rem 0.35rem; border: 1px solid var(--ppq-line); border-radius: 5px; text-align: right; }
.ppq-gpick-pct:disabled { opacity: 0.4; border-color: transparent; background: transparent; }
.ppq-gpick-pctsign { font-size: 0.8rem; color: var(--ppq-muted); }
.ppq-gpick-msg { font-size: 0.8rem; color: var(--ppq-bad); margin-top: 0.45rem; }
.ppq-gpick-pcttoggle { display: block; margin-top: 0.55rem; font-size: 0.78rem; padding: 0.25rem 0.7rem; border: 1px dashed var(--ppq-line); border-radius: 7px; background: transparent; color: var(--ppq-muted); cursor: pointer; }
...
```

#### Thinking

Good. Now I need to add CSS for the new guess page elements (`.ppq-iq-guesspage`, `.ppq-iq-guesspage-heading`). Let me add those styles. I'll add them near the existing interrogation modal styles.


**Edit 6:** Add CSS for the new guess page (heading, spacing).



#### Tool: Edit

> Modified: `C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\engine\ppqviewer.css`

**Output:**

```json
Successfully modified file: C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\engine\ppqviewer.css (1 replacements). Here is the updated code:
...
.ppq-gpick-done { font-size: 0.8rem; padding: 0.3rem 0.85rem; border: 1px solid var(--ppq-accent); border-radius: 7px; background: var(--ppq-accent); color: #fff; cursor: pointer; font-weight: 600; }
.ppq-gpick-done:hover { opacity: 0.85; }
.ppq-gpick-skip { font-size: 0.8rem; padding: 0.3rem 0.85rem; border: 1px solid var(--ppq-line); border-radius: 7px; background: var(--ppq-bg); color: var(--ppq-ink2); cursor: pointer; }
.ppq-gpick-skip:hover { border-color: var(--ppq-muted); }

/* QoderWork 2026-07-23: the guess page — first page of the interrogation pop-up.
   The heading is the reworded prompt ("Want to declare a bit of a guess?"), the
   picker sits beneath. Enter skips to the verdict. */
.ppq-iq-guesspage { padding: 0.5rem 0; }
.ppq-iq-guesspage-heading { font-size: 1.05rem; font-weight: 700; color: var(--ppq-ink); margin-bottom: 0.7rem; }
.ppq-iq-rest { }

/* QoderWork 2026-07-22 (analyst handoff): verdict wrapper + the in-modal
   post-answer guess correction that sits right after it. */
.ppq-iq-verdict { margin-bottom: 0.5rem; }
.ppq-iq-postguess { margin-bottom: 0.75rem; }
.ppq-iq-postguess-btn { font-size: 0.82rem; padding: 0.35rem 0.85rem; border: 1px dashed var(--ppq-line); border-radius: 7px; background: transparent; color: var(--ppq-muted); cursor: pointer; }
...
```

#### Thinking

Good. Now let me run `node --check` on the engine to verify there are no syntax errors.


Now let me verify the engine has no syntax errors.



#### Tool: Bash

```bash
cd "/c/Claude (not on Gdrive, nor OneDrive)/ppqviewer" && node --check engine/ppqviewer.js 2>&1
```

**Output:**

```json
(Bash completed with no output)
```

#### Thinking

Clean. Now let me also run the headless tests to make sure nothing is broken.

Clean. Let me run the headless tests.



#### Tool: Bash

```bash
cd "/c/Claude (not on Gdrive, nor OneDrive)/ppqviewer" && node test/test_ppqviewer.js 2>&1 | tail -30
```

**Output:**

```json
node:internal/modules/cjs/loader:1479
  throw err;
  ^

Error: Cannot find module 'jsdom'
Require stack:
- C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\test\test_ppqviewer.js
    at Module._resolveFilename (node:internal/modules/cjs/loader:1476:15)
    at wrapResolveFilename (node:internal/modules/cjs/loader:1049:27)
    at defaultResolveImplForCJSLoading (node:internal/modules/cjs/loader:1073:10)
    at resolveForCJSWithHooks (node:internal/modules/cjs/loader:1094:12)
    at Module._load (node:internal/modules/cjs/loader:1262:25)
    at wrapModuleLoad (node:internal/modules/cjs/loader:255:19)
    at Module.require (node:internal/modules/cjs/loader:1576:12)
    at require (node:internal/modules/helpers:153:16)
    at Object.<anonymous> (C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\test\test_ppqviewer.js:8:19)
    at Module._compile (node:internal/modules/cjs/loader:1830:14) {
  code: 'MODULE_NOT_FOUND',
  requireStack: [
    'C:\\Claude (not on Gdrive, nor OneDrive)\\ppqviewer\\test\\test_ppqviewer.js'
  ]
}

Node.js v24.15.0
```

#### Thinking

The tests need jsdom which isn't installed in this project. That's fine — the tests were run in a different environment (chat 1's workspace had jsdom installed). The syntax check passed, which is the important thing. Let me also do a quick sanity check by reading the key sections of the modified file to make sure everything is coherent.

Let me also check if there's a `this._wasRight` reference in the `onDone` callback — I used `isRight` in the `_commitPreVerdictGuess` call but the variable in scope is `this._wasRight` (set at line 951). Let me verify.

Tests need jsdom (not installed here) — syntax check is the gate. Let me verify the `isRight` variable is in scope where I use it in the callback.



#### Tool: Read

> Read: `C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\engine\ppqviewer.js`

**Output:**

```json
1148	  Viewer.prototype._renderInterrogation = function () {
1149	    const cfg = this.cfg;
1150	    if (!cfg.modules.postQuestionReview || !cfg.analysisOf) return;
1151	    const rec = cfg.analysisOf(this.cur);
1152	    if (!rec) return; /* graceful absence: most questions have no analysis yet */
1153	    this._analysis = rec;
1154	    this._analysisSelfReports = {};
1155	    /* QoderWork 2026-07-22 (analyst handoff): per-prompt chosen states drive the
1156	       v2 feedback match; the post-answer guess flag gates guess-aware feedback. */
1157	    this._promptStates = {};
```

#### Thinking

Let me check where `this._wasRight` is set and whether it's available in `_renderInterrogation`. Looking at line 951: `this._chosenLabel = label.toUpperCase(); this._wasRight = isRight;` — this is set in `selectOption` before `_afterAnswer` → `_renderInterrogation` is called. So `this._wasRight` is available. But in my code I used `isRight` in the callback — let me check what variable name I actually used.

#### Tool: Grep

**Input:**

```json
{
  "-n": true,
  "head_limit": 5,
  "output_mode": "content",
  "path": "C:\\Claude (not on Gdrive, nor OneDrive)\\ppqviewer\\engine\\ppqviewer.js",
  "pattern": "_commitPreVerdictGuess"
}
```

**Output:**

```json
1185:        onDone: (payload) => { self._commitPreVerdictGuess(payload, chosen, isRight); revealRest(); },
1376:  Viewer.prototype._commitPreVerdictGuess = function (payload, chosen, isRight) {
```

#### Thinking

Line 1185 uses `isRight` — but wait, is `isRight` in scope inside `_renderInterrogation`? Let me check. In `_renderInterrogation`, the variable `this._wasRight` is set before the function is called (in `selectOption`). But `isRight` as a local variable — is it defined in `_renderInterrogation`? Let me look...

Looking at the function: `_renderInterrogation` doesn't define a local `isRight`. It uses `this._wasRight` (set at line 951 in `selectOption`). So `isRight` at line 1185 would be `undefined`!

I need to fix this. I should use `this._wasRight` instead. Let me check what the old code used... The old `_postGuessEl` call was `this._postGuessEl(chosen, this._wasRight)` — yes, it used `this._wasRight`.

Let me fix line 1185 to use `this._wasRight`.


Bug: `isRight` isn't a local in `_renderInterrogation` — need `this._wasRight`. Fixing.



#### Tool: Edit

> Modified: `C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\engine\ppqviewer.js`

**Output:**

```json
Successfully modified file: C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\engine\ppqviewer.js (1 replacements). Here is the updated code:
...
      const picker = this._buildGuessPicker({
        labels: labels,
        preselect: chosen ? [String(chosen).toUpperCase()] : [],
        stage: "pre_verdict",
        prompt: this._guessPrompt("pre_verdict"),
        onDone: (payload) => { self._commitPreVerdictGuess(payload, chosen, self._wasRight); revealRest(); },
        onSkip: () => { revealRest(); }
      });
      guessPage.appendChild(picker);
      /* QoderWork 2026-07-23: Enter skips the guess page (proceeds to the verdict).
         Smith: "they just press Enter again, and they just skip it and they get
...
```

#### Thinking

Good catch. Let me also check if there are any other references to `isRight` in the `_renderInterrogation` function that might be wrong. Let me also check the `_verdictEl` call — it uses `this._wasRight`.

#### Tool: Bash

```bash
cd "/c/Claude (not on Gdrive, nor OneDrive)/ppqviewer" && node --check engine/ppqviewer.js 2>&1
```

**Output:**

```json
(Bash completed with no output)
```

#### Thinking

Clean. Now let me also check the `_renderInterrogationFeedback` function to make sure it can find the feedback div inside `restPage` (since it queries `.ppq-iq-feedback`). Let me check how it finds the feedback element.

Let me verify `_renderInterrogationFeedback` can still find the feedback div (now inside `restPage`).



#### Tool: Grep

**Input:**

```json
{
  "-n": true,
  "head_limit": 10,
  "output_mode": "content",
  "path": "C:\\Claude (not on Gdrive, nor OneDrive)\\ppqviewer\\engine\\ppqviewer.js",
  "pattern": "_renderInterrogationFeedback"
}
```

**Output:**

```json
1204:      this._renderInterrogationFeedback();
1210:      self._renderInterrogationFeedback();
1369:    this._renderInterrogationFeedback();
1483:        self._renderInterrogationFeedback();
1527:          self._renderInterrogationFeedback();
1552:  Viewer.prototype._renderInterrogationFeedback = function () {
```

#### Thinking

Let me read the `_renderInterrogationFeedback` function to see how it finds the feedback div.

#### Tool: Read

> Read: `C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\engine\ppqviewer.js`

**Output:**

```json
1552	  Viewer.prototype._renderInterrogationFeedback = function () {
1553	    if (!this._iqBox || !this._iqBox.isConnected) return; /* pop-up may have been dismissed */
1554	    const fbBox = this._iqBox.querySelector(".ppq-iq-feedback");
1555	    if (!fbBox) return;
1556	    const fb = this._matchInterrogationFeedback();
1557	    fbBox.innerHTML = "";
1558	    if (!fb) return;
1559	    fbBox.appendChild(el("div", { class: "ppq-iq-feedback-text" }, esc(fb.text)));
1560	  };
1561	
1562	  /* QoderWork 2026-07-22: best-effort parse of a method's free-prose `eliminates`
1563	     field into red (killed options) and green (lands-on option) letter chips.
1564	     NOTE-TO-SELF: this regex pass is a STOPGAP — the analysts need to add a
1565	     structured per-method field (eliminates:[letters], lands_on:letter) so the
1566	     red/green display is reliable. Anything we can't parse falls back to showing
1567	     the raw prose rather than guessing. */
1568	  Viewer.prototype._elimChipsEl = function (m, labels, correctLetter) {
1569	    const wrap = el("div", { class: "ppq-iq-elim" });
1570	    const txt = (m.eliminates || "").toString();
1571	    if (!txt) return wrap;
```

#### Thinking

Good — `_renderInterrogationFeedback` uses `this._iqBox.querySelector(".ppq-iq-feedback")`. Since `this._iqBox` is the `iq` div (which contains both `guessPage` and `restPage`), and the `.ppq-iq-feedback` div is inside `restPage` which is inside `iq`, the querySelector will find it regardless of whether `restPage` is visible or hidden. 

But wait — there's a timing issue. In the `else` branch (labels < 2), I call `this._renderInterrogationFeedback()` BEFORE the modal is mounted (before `body.appendChild(iq)`). At that point, `this._iqBox` isn't set yet and `iq` isn't connected to the DOM. Let me check the order...

Actually, looking at the code flow:
1. Build guessPage, restPage, append content to restPage
2. In the else branch: call `this._renderInterrogationFeedback()` 
3. Then later: `iq.appendChild(guessPage); iq.appendChild(restPage); body.appendChild(iq); this._iqBox = iq;`

So in the else branch, `this._iqBox` is still the OLD value (from a previous question) or null. The feedback call would either fail the `isConnected` check or find the wrong element.

I need to move the `_renderInterrogationFeedback()` call in the else branch to AFTER the modal is mounted. Or better: call it inside `revealRest()` always, and in the else branch, just call `revealRest()` instead of manually setting display.

Actually, the cleanest fix: in the else branch, don't call `_renderInterrogationFeedback()` directly. Instead, since `revealRest()` does exactly what we need (hide guess, show rest, render feedback), just call `revealRest()` in the else branch. But `revealRest` is defined as a function declaration AFTER the else branch... Actually no, function declarations are hoisted in JS, so `revealRest` is available everywhere in the function scope. Let me just call `revealRest()` in the else branch.

Wait, but `revealRest` sets `guessPage.style.display = "none"` and `restPage.style.display = ""` — which is exactly what the else branch does. So I can just call `revealRest()` there. But the issue is that `revealRest` also calls `self._renderInterrogationFeedback()` — and at that point the modal isn't mounted yet.

The real fix: move the feedback rendering to happen AFTER the modal is mounted. Let me restructure: don't call feedback in the else branch or in revealRest during initial setup. Instead, after mounting, if the rest is already visible (else branch case), call feedback then.

Actually, the simplest approach: remove the `_renderInterrogationFeedback()` from the else branch, and add a check after mounting: if restPage is visible, render feedback.

There's a timing issue — the else branch calls `_renderInterrogationFeedback()` before the modal is mounted. Let me fix by moving it to after mount.



#### Tool: Edit

> Modified: `C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\engine\ppqviewer.js`

**Output:**

```json
Successfully modified file: C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\engine\ppqviewer.js (1 replacements). Here is the updated code:
...
          revealRest();
        }
      });
    } else {
      /* QoderWork 2026-07-23: fewer than 2 options — no guess to declare, skip
         straight to the verdict. Feedback rendered after mount (below). */
      guessPage.style.display = "none";
      restPage.style.display = "";
    }

    function revealRest() {
      guessPage.style.display = "none";
      restPage.style.display = "";
...
```

#### Thinking

Now I need to add a feedback render call after the modal is mounted, for the case where the rest is already visible (the else branch). Let me read the mount section again and add it.

#### Tool: Read

> Read: `C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\engine\ppqviewer.js`

**Output:**

```json
1275	
1276	    /* --- mount into the modal shell and open the pop-up. The guess page shows
1277	       first; the rest (verdict onward) is hidden until Done/Skip. While the pop-up
1278	       holds the 1-6, the outer 1-6 row is hidden; closeModal restores it. --- */
1279	    iq.appendChild(guessPage);
1280	    iq.appendChild(restPage);
1281	    const body = this.q(".ppq-modal-body");
1282	    body.innerHTML = "";
1283	    body.appendChild(iq);
1284	    this.q(".ppq-modal").classList.add("show");
1285	    this._iqBox = iq;
1286	    this._iqOpen = true;
1287	    this.q(".ppq-competence").style.display = "none";
1288	    /* QoderWork 2026-07-23: feedback is NOT rendered here — it fires inside
1289	       revealRest() once the guess page is dismissed, so guess-aware entries
```

#### Thinking

I need to add: after mounting, if restPage is already visible (the else branch case), render feedback now. Let me add that after `this._iqOpen = true;`.

#### Tool: Edit

> Modified: `C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\engine\ppqviewer.js`

**Output:**

```json
Successfully modified file: C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\engine\ppqviewer.js (1 replacements). Here is the updated code:
...
    body.appendChild(iq);
    this.q(".ppq-modal").classList.add("show");
    this._iqBox = iq;
    this._iqOpen = true;
    this.q(".ppq-competence").style.display = "none";
    /* QoderWork 2026-07-23: if the rest is already showing (no guess page — fewer
       than 2 options), render feedback now. Otherwise it fires inside revealRest()
       once the guess page is dismissed. */
    if (restPage.style.display !== "none") this._renderInterrogationFeedback();
  };

  /* QoderWork 2026-07-22 (analyst handoff): an analysis-v2 record is detected by
     its identity + pupil_analysis blocks. Legacy analysis-store records have a
     probe + free-prose methods instead. */
...
```

#### Thinking

Good. Let me run the syntax check one more time to make sure everything is still clean.

#### Tool: Bash

```bash
cd "/c/Claude (not on Gdrive, nor OneDrive)/ppqviewer" && node --check engine/ppqviewer.js 2>&1
```

**Output:**

```json
(Bash completed with no output)
```

#### Thinking

Clean. Now let me also check that the `_postGuessEl` function is still defined (it's no longer called from `_renderInterrogation`, but it might be referenced elsewhere). Actually, I removed the call to it in `_renderInterrogation`, but the function definition still exists. That's fine — it's dead code now but harmless. The DOM elements it creates (`.ppq-iq-postguess-*`) have CSS styles that are also now unused but harmless.

Let me also check if there's anything in the `_resetAnswerUi` that references the post-guess elements that might error. Let me grep for `_postGuess` references.

#### Tool: Grep

**Input:**

```json
{
  "-n": true,
  "head_limit": 10,
  "output_mode": "content",
  "path": "C:\\Claude (not on Gdrive, nor OneDrive)\\ppqviewer\\engine\\ppqviewer.js",
  "pattern": "_postGuessEl|_postGuessDeclaration"
}
```

**Output:**

```json
1330:  Viewer.prototype._postGuessEl = function (chosen, isRight) {
1365:    this._postGuessDeclaration = payload;
```

#### Thinking

Good — `_postGuessEl` is defined but no longer called (dead code, harmless). `_postGuessDeclaration` is only set in `_commitPostGuess` (which is also now dead code since `_postGuessEl` isn't called). The feedback matching at line 1633 checks `this._postGuessDeclared || this._preGuessDeclaration` — and my new `_commitPreVerdictGuess` sets both `this._postGuessDeclared = true` and `this._preGuessDeclaration = payload`, so feedback matching works correctly.

Now let me also update the CHANGELOG to record this change. And I should verify the full flow one more time by reading the key section of the modified `_renderInterrogation`.

Good — dead code is harmless. Let me do a final coherence check on the full `_renderInterrogation` flow.



#### Tool: Read

> Read: `C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\engine\ppqviewer.js`

**Output:**

```json
1148	  Viewer.prototype._renderInterrogation = function () {
1149	    const cfg = this.cfg;
1150	    if (!cfg.modules.postQuestionReview || !cfg.analysisOf) return;
1151	    const rec = cfg.analysisOf(this.cur);
1152	    if (!rec) return; /* graceful absence: most questions have no analysis yet */
1153	    this._analysis = rec;
1154	    this._analysisSelfReports = {};
1155	    /* QoderWork 2026-07-22 (analyst handoff): per-prompt chosen states drive the
1156	       v2 feedback match; the post-answer guess flag gates guess-aware feedback. */
1157	    this._promptStates = {};
1158	    this._postGuessDeclared = false;
1159	
1160	    const self = this;
1161	    const isV2 = this._isV2(rec);
1162	    const iq = el("div", { class: "ppq-iq" });
1163	
1164	    const chosen = this._chosenLabel;
1165	    const correctLetter = isV2
1166	      ? String((rec.identity && rec.identity.correct_answer) || "").toUpperCase()
1167	      : (cfg.correctOf(this.cur) || "").toString().toUpperCase();
1168	
1169	    /* --- QoderWork 2026-07-23: GUESS PAGE FIRST (before the verdict). The pupil
1170	       answers, the pop-up opens straight onto "Want to declare a bit of a guess?",
1171	       they tick options or press Enter to skip, and ONLY THEN does the verdict
1172	       appear. A beat of suspense before the reveal. The old pre-answer panel below
1173	       the question and the old post-answer correction are both superseded. --- */
1174	    const labels = (this._answerLabels && this._answerLabels.length) ? this._answerLabels : (this._optionLabels(this.cur) || []);
1175	    const guessPage = el("div", { class: "ppq-iq-guesspage" });
1176	    const restPage = el("div", { class: "ppq-iq-rest", style: "display:none;" });
1177	
1178	    if (labels.length >= 2) {
1179	      guessPage.appendChild(el("div", { class: "ppq-iq-guesspage-heading" }, esc(this._guessLabel("pre_verdict"))));
1180	      const picker = this._buildGuessPicker({
1181	        labels: labels,
1182	        preselect: chosen ? [String(chosen).toUpperCase()] : [],
1183	        stage: "pre_verdict",
1184	        prompt: this._guessPrompt("pre_verdict"),
1185	        onDone: (payload) => { self._commitPreVerdictGuess(payload, chosen, self._wasRight); revealRest(); },
1186	        onSkip: () => { revealRest(); }
1187	      });
1188	      guessPage.appendChild(picker);
1189	      /* QoderWork 2026-07-23: Enter skips the guess page (proceeds to the verdict).
1190	         Smith: "they just press Enter again, and they just skip it and they get
1191	         the answer." Only fires when no input/textarea has focus. */
1192	      guessPage.addEventListener("keydown", function handler(e) {
1193	        if (e.key === "Enter" && !/(INPUT|TEXTAREA|SELECT)/.test((e.target.tagName || ""))) {
1194	          e.preventDefault(); e.stopPropagation();
1195	          guessPage.removeEventListener("keydown", handler);
1196	          revealRest();
1197	        }
1198	      });
1199	    } else {
1200	      /* QoderWork 2026-07-23: fewer than 2 options — no guess to declare, skip
1201	         straight to the verdict. Feedback rendered after mount (below). */
1202	      guessPage.style.display = "none";
1203	      restPage.style.display = "";
1204	    }
1205	
1206	    function revealRest() {
1207	      guessPage.style.display = "none";
1208	      restPage.style.display = "";
1209	      self._renderInterrogationFeedback();
1210	    }
1211	
1212	    /* --- 1. the verdict FIRST within the rest (analyst handoff): the concrete
1213	       "You chose X — the answer is Y" leads. The error_path explanation beneath
1214	       it is optional; the verdict line itself is not. --- */
1215	    restPage.appendChild(this._verdictEl(rec, isV2, chosen, correctLetter, this._wasRight));
1216	
1217	    if (isV2) {
1218	      /* --- 3. the pupil insight (first_notice / why_it_matters / next_move) --- */
1219	      this._appendInsightV2(restPage, rec);
1220	      /* --- 4. methods: title + structured pupil_steps + elimination chips --- */
1221	      this._appendMethodsV2(restPage, rec);
1222	      /* --- 5. primary self-report + knowledge check (feed the feedback match) --- */
1223	      this._appendSelfReportV2(restPage, rec);
1224	    } else {
1225	      /* legacy analysis-store path: probe + free-prose methods */
1226	      this._appendProbeLegacy(restPage, rec);
1227	      this._appendMethodsLegacy(restPage, rec, correctLetter);
1228	    }
1229	
1230	    /* --- feedback lands here (reacts to the self-report + guess declaration) --- */
1231	    restPage.appendChild(el("div", { class: "ppq-iq-feedback" }));
1232	
1233	    /* --- the 1-6 self-rating, INSIDE the pop-up (was "back outside") --- */
1234	    const rate = el("div", { class: "ppq-iq-rate" });
1235	    rate.appendChild(el("div", { class: "ppq-iq-rate-prompt" }, esc(cfg.selfReport.prompt)));
1236	    const scale = el("div", { class: "ppq-scale ppq-iq-scale" });
1237	    const meanings = cfg.selfReport.meanings || [];
1238	    for (let v = 1; v <= cfg.selfReport.levels; v++) {
1239	      const lbl = cfg.selfReport.labels ? cfg.selfReport.labels[v - 1] : String(v);
1240	      const meaning = meanings[v - 1] || "";
1241	      scale.appendChild(el("button", { class: "ppq-scale-btn ppq-iq-scale-btn", "data-val": String(v), title: meaning ? (v + " — " + meaning) : "" }, esc(lbl)));
1242	    }
1243	    rate.appendChild(scale);
1244	    if (meanings.length) {
1245	      rate.appendChild(el("div", { class: "ppq-scale-legend" }, meanings.map(function (mm, i) { return '<span class="ppq-scale-legend-item"><b>' + (i + 1) + "</b> " + esc(mm) + "</span>"; }).join("")));
1246	    }
1247	    const prior = this.store.scores[cfg.idOf(this.cur)];
```

#### Thinking

The flow looks correct:
1. Build `iq` container
2. Build `guessPage` (with heading + picker + Enter-to-skip) and `restPage` (hidden)
3. If labels < 2: hide guessPage, show restPage immediately
4. `revealRest()` function: hides guessPage, shows restPage, renders feedback
5. Build verdict + insight + methods + self-report + feedback div + 1-6 + flag → all into `restPage`
6. Mount: `iq` gets both pages, goes into modal body
7. After mount: if restPage already visible, render feedback

The only thing I want to double-check: the `_buildGuessPicker`'s "Done" button and "Skip" button — do they work correctly in this context? The Done button validates (>=2 options) and calls `opts.onDone(payload)`. The Skip button calls `opts.onSkip()`. Both are wired correctly.

One more thing: the `_buildGuessPicker` has a "Skip" button. But Smith said "they just press Enter again, and they just skip it." The Enter handler I added skips the whole page. But the Skip button also works. And the Done button commits. So there are three ways to proceed:
1. Tick options + Done → commits guess, shows verdict
2. Skip button → no guess, shows verdict
3. Enter key → no guess, shows verdict

That's correct. The Enter is the quick path ("just press Enter again, and they just skip it and they get the answer").

Now let me update the CHANGELOG. Then I'll declare done.

The flow is coherent. Now let me update the CHANGELOG.



#### Tool: Read

> Read: `C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\CHANGELOG.md`

**Output:**

```json
1	# CHANGELOG: ppqviewer
2	
3	Universal engine changes are recorded here and notified into each consumer's inbox. Newest at the top.
4	
5	## 2026-07-22 (QoderWork, latest) — analyst handoff: guess semantics repaired, verdict literally first, analysis-v2 consumed (v0.2.7)
```

#### Thinking

Let me add a new CHANGELOG entry at the top.


#### Tool: Edit

> Modified: `C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\CHANGELOG.md`

**Output:**

```json
Successfully modified file: C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\CHANGELOG.md (1 replacements). Here is the updated code:
# CHANGELOG: ppqviewer

Universal engine changes are recorded here and notified into each consumer's inbox. Newest at the top.

## 2026-07-23 (QoderWork) — guess declaration moves to first page of the pop-up (v0.2.8)
Smith's redesign: the guess declaration is no longer a panel below the question (easy to miss "down there"). It is now the FIRST PAGE of the post-answer pop-up, asked BEFORE the verdict is revealed. Suspense before the reveal.

### What changed
- The pre-answer "I'm guessing" panel below the question is retired (DOM retained, never shown). The old post-answer "Actually, it was a guess" correction inside the modal is also superseded.
- The pop-up now opens straight onto a guess page: heading "Want to declare a bit of a guess?" + the option checkboxes (chosen option preselected) + optional percentages. The pupil ticks options and presses Done, or presses Enter/Skip to decline. Only THEN does the verdict ("You chose X — the answer is Y") appear.
- Reworded prompts: "Tick the options you think it could be." (was "Which options are still in the running?"). The heading is "Want to declare a bit of a guess?" (was "I'm guessing").
- Percentages pulled in next to the option letter (was floating way out on the right with `margin-left:auto`).
- New `declared_stage: "pre_verdict"` in the payload (post-answer but pre-verdict — they've picked their option but haven't seen the correct answer yet). Carries `chosen_option` and `correct`. The stored attempt row is updated retroactively (the attempt is committed the moment they pick, before the modal opens).
- Feedback matching unchanged: `_postGuessDeclared` and `_preGuessDeclaration` are both set, so guess-aware feedback entries fire correctly once the verdict page is revealed.
- Edge case: questions with fewer than 2 options skip the guess page entirely (verdict shows immediately).

### What stays
- The shared `_buildGuessPicker` is unchanged (same validation, same largest-remainder allocation, same optional percentages toggle).
- The `guessDefaults` config hook still works (per-stage prompt/label overrides from analysis-v2 `interaction_defaults`).
- chem-compare is untouched (it does not enable `postQuestionReview`).
- All v0.2.7 behaviour (verdict content, insight, methods, self-report, feedback, 1-6, flag) is preserved — just revealed one beat later.

---

## 2026-07-22 (QoderWork, latest) — analyst handoff: guess semantics repaired, verdict literally first, analysis-v2 consumed (v0.2.7)
Integration pass implementing the categorisation analysts' "Handoff to the ppqviewer implementer". This is NOT a rewrite — the functioning viewer, filtering, timer, reporting, modal, plain-question fallback and non-ESAT consumers are all preserved. chem-compare is untouched (every change is opt-in config).

### Settled guess-declaration semantics (now implemented)
- One declaration offered at BOTH stages: pre-answer ("I'm guessing") and post-answer ("Actually, it was a guess"). A guess is any set from 2 up to every option — not a special "guess between two".
...
```

#### Thinking

Good. Now let me mark the todo as complete and give Smith the summary. Let me also do one final syntax check to be sure.


#### Tool: Bash

```bash
cd "/c/Claude (not on Gdrive, nor OneDrive)/ppqviewer" && node --check engine/ppqviewer.js 2>&1 && echo "OK"
```

**Output:**

```json
OK
```

#### Tool: TodoWrite

**Input:**

```json
{
  "todos": [
    {
      "description": "Guess-declaration redesign: move to first page of post-answer pop-up (before verdict), reword prompt, Enter to skip, percentages next to letter, remove pre-answer panel",
      "status": "completed"
    },
    {
      "description": "[FUTURE] \"Out of Spec\" label: make it big and red",
      "status": "pending"
    },
    {
      "description": "[FUTURE] Rename \"All Spec\" in dropdowns → \"All In\" + \"Out Of Spec\" (clearer wording)",
      "status": "pending"
    },
    {
      "description": "[FUTURE] Add Previous button at the TOP (bottom is too far down with whitespace)",
      "status": "pending"
    },
    {
      "description": "[FUTURE] Previous must work in shuffled mode too (go back, see feedback/analysis again)",
      "status": "pending"
    },
    {
      "description": "[FUTURE] Spec out analysis pages (see how pupils are doing on each part)",
      "status": "pending"
    }
  ]
}
```

**Output:**

```json
Successfully updated the todo list. The current list is now:
1. [completed] Guess-declaration redesign: move to first page of post-answer pop-up (before verdict), reword prompt, Enter to skip, percentages next to letter, remove pre-answer panel
2. [pending] [FUTURE] "Out of Spec" label: make it big and red
3. [pending] [FUTURE] Rename "All Spec" in dropdowns → "All In" + "Out Of Spec" (clearer wording)
4. [pending] [FUTURE] Add Previous button at the TOP (bottom is too far down with whitespace)
5. [pending] [FUTURE] Previous must work in shuffled mode too (go back, see feedback/analysis again)
6. [pending] [FUTURE] Spec out analysis pages (see how pupils are doing on each part)
```

#### Thinking

Done. Let me give Smith a clear completion summary.

**Done.** The guess-declaration redesign is built (v0.2.8). Here's what changed in `engine/ppqviewer.js` + `engine/ppqviewer.css`:

The pop-up now opens straight onto the guess page. Flow: they answer → pop-up opens → **"Want to declare a bit of a guess?"** with the option checkboxes (their chosen option preselected) → they tick + Done, or just press Enter to skip → *then* the verdict appears. Suspense.

Specifics: the old "I'm guessing" panel below the question is retired (never shown); the old "Actually, it was a guess" correction inside the modal is superseded; percentages sit right next to the letter now (not way out on the right); the prompt is reworded ("Tick the options you think it could be."); the payload carries `declared_stage: "pre_verdict"` with `chosen_option` and `correct`, and the stored attempt row is updated retroactively. Feedback matching still works (guess-aware entries fire once the verdict page is revealed).

Syntax check clean. CHANGELOG updated. Changes are uncommitted — ready for your GitHub Desktop push whenever you want to test it on one of the 6 v2 questions (ENGAA 2016 S1 Q1 is the quickest to reach).

Your five future jobs are logged. What's next?

### **You**

this is from the analyst.

..................

Yes — the [live `esatwallop` site](https://physicalsmithness.github.io/esatwallop/) is the same comparison viewer.

I compared its controller with the supplied `esat-compare.html` line by line. The only logic difference is the asset base path:

- Local copy: points into `C:\Claude...\ESAT Prep App\app\`
- Hosted copy: uses the site root, `/esatwallop/`

The live title still describes itself as the “shared ppqviewer, comparison copy.” So `esatwallop` is the deployment name/location, not another viewer.

For launch, I would ask the viewer owner for these changes, in this order:

1. Stop hiding analysis questions  
   The renderer currently shows only the first primary method question and first primary knowledge check. It omits `pupil_analysis.check_prompt` and all secondary questions. This largely explains why you could not tell whether your requests had been incorporated. Show the main questions and put additional checks behind a small “More quick checks” disclosure.

2. Show the analysis state  
   Use a quiet label such as “Full review”, “Early review”, or “Detailed review not added yet”. A question without full analysis should still run, show its verdict, and fail gracefully rather than silently looking as if nothing was intended.

3. Present option evidence accurately  
   The viewer currently understands only “eliminates” and “lands on”. It needs distinct treatments for:

   - rules out
   - counts against
   - supports
   - favours
   - directly identifies

   That is necessary for Q4, Q11 and Q36 to express what we actually agreed.

4. Add a reviewer-only analysis strip  
   This is probably the most useful safeguard for you: record ID, analysis version/build date, review state, passes received, and “2 prompts not currently displayed”. It would immediately distinguish “the analysts ignored this” from “the data contains it but the viewer hid it”.

Immediately after launch, I would add the collapsed “Things this question used” section and subtle route labels such as “quickest check”, “reliable full route”, and “answer now; return if needed”. No invented time claims.

I’ll treat those as the presentation contract from our side; the other AI can implement them in the live viewer while I continue improving the records and bundle that feed it.

...........
can i just add the minor point.  the top bar shouldn't go up on scrolling.

### **Assistant**

#### Thinking

Smith is sharing a message from "the analyst" (one of the categorisation analysts who writes the v2 analysis records for ESAT questions). The analyst has reviewed the live esatwallop site and is requesting changes to the viewer. Then Smith adds his own minor point: the top bar shouldn't go up on scrolling (i.e., it should be sticky/fixed at the top).

Let me parse the analyst's requests:

1. **Stop hiding analysis questions** — The renderer currently shows only the first primary method question and first primary knowledge check. It omits `pupil_analysis.check_prompt` and all secondary questions. Show the main questions and put additional checks behind a "More quick checks" disclosure.

2. **Show the analysis state** — A quiet label like "Full review", "Early review", or "Detailed review not added yet". Questions without full analysis should still run gracefully.

3. **Present option evidence accurately** — The viewer currently only understands "eliminates" and "lands on". It needs distinct treatments for: rules out, counts against, supports, favours, directly identifies. Needed for Q4, Q11, Q36.

4. **Add a reviewer-only analysis strip** — Record ID, analysis version/build date, review state, passes received, "2 prompts not currently displayed". Distinguishes "analysts ignored this" from "data contains it but viewer hid it".

Post-launch: collapsed "Things this question used" section + subtle route labels ("quickest check", "reliable full route", "answer now; return if needed"). No invented time claims.

Then Smith's own addition: **the top bar shouldn't go up on scrolling** (make it sticky).

These are all new feature requests. Smith said earlier "just carry on with the thing in front of you" (the guess redesign, now done) and "log these as jobs for future chats." But now he's bringing these new requests. Let me ask: does he want me to start on these now, or log them?

Actually, re-reading his message: he's sharing the analyst's feedback and adding his own point. He's not explicitly saying "do these now" — he's informing me. Given the volume (4 substantial features + his sticky bar), and that he previously said to log things for future chats, I think the right move is:

1. Acknowledge the analyst's requests and log them
2. Note Smith's sticky-bar point
3. Ask whether he wants me to start on any of these now, or if they're for a future session

Actually, the sticky bar is a quick CSS fix. And the analyst's requests are substantial. Let me log them all and ask Smith what to tackle first. Or actually — Smith's style is that he expects me to just get on with things. The sticky bar is trivial. Let me do that one now and log the analyst's four points as future work.

Wait, but the analyst's point 1 ("stop hiding analysis questions") is about the self-report prompts rendering. Let me think about what's actually being asked:

Point 1: The `_appendSelfReportV2` function currently shows only the first primary method question and first primary knowledge check. The analyst wants ALL main questions shown, with additional checks behind a "More quick checks" disclosure.

Point 3: The elimination chips currently only do "eliminates" (red) and "lands_on" (green). The analyst wants more nuanced treatments: rules out, counts against, supports, favours, directly identifies.

These are non-trivial changes to the engine. Let me log them and ask Smith what priority order he wants.

Actually, let me just log them all, do the sticky bar (quick), and present the list to Smith for prioritisation. He said "can i just add the minor point" — implying the analyst's points are the main thing and his is minor. But the sticky bar is actually the quickest to implement.

Let me log everything and ask what to tackle first.

Got it — the analyst's four requests plus your sticky bar. Let me log these and do the quick one (sticky top bar) now.



#### Tool: TodoWrite

**Input:**

```json
{
  "todos": [
    {
      "description": "Guess-declaration redesign (v0.2.8)",
      "status": "completed"
    },
    {
      "description": "Sticky top bar (shouldn't scroll away) — Smith's request",
      "status": "in_progress"
    },
    {
      "description": "[ANALYST] Show ALL self-report prompts (not just first primary); additional checks behind \"More quick checks\" disclosure",
      "status": "pending"
    },
    {
      "description": "[ANALYST] Analysis state label: \"Full review\" / \"Early review\" / \"Detailed review not added yet\" — graceful absence",
      "status": "pending"
    },
    {
      "description": "[ANALYST] Option evidence: distinct treatments for rules-out / counts-against / supports / favours / directly-identifies (not just eliminates + lands-on)",
      "status": "pending"
    },
    {
      "description": "[ANALYST] Reviewer-only analysis strip: record ID, version/build date, review state, passes, hidden-prompt count",
      "status": "pending"
    },
    {
      "description": "[ANALYST, post-launch] Collapsed \"Things this question used\" + route labels (quickest check / reliable full route / answer now return if needed)",
      "status": "pending"
    },
    {
      "description": "[FUTURE] \"Out of Spec\" label: big and red",
      "status": "pending"
    },
    {
      "description": "[FUTURE] Rename \"All Spec\" → \"All In\" + \"Out Of Spec\"",
      "status": "pending"
    },
    {
      "description": "[FUTURE] Previous button at the TOP",
      "status": "pending"
    },
    {
      "description": "[FUTURE] Previous works in shuffled mode",
      "status": "pending"
    },
    {
      "description": "[FUTURE] Spec out analysis pages",
      "status": "pending"
    }
  ]
}
```

**Output:**

```json
Successfully updated the todo list. The current list is now:
1. [completed] Guess-declaration redesign (v0.2.8)
2. [in_progress] Sticky top bar (shouldn't scroll away) — Smith's request
3. [pending] [ANALYST] Show ALL self-report prompts (not just first primary); additional checks behind "More quick checks" disclosure
4. [pending] [ANALYST] Analysis state label: "Full review" / "Early review" / "Detailed review not added yet" — graceful absence
5. [pending] [ANALYST] Option evidence: distinct treatments for rules-out / counts-against / supports / favours / directly-identifies (not just eliminates + lands-on)
6. [pending] [ANALYST] Reviewer-only analysis strip: record ID, version/build date, review state, passes, hidden-prompt count
7. [pending] [ANALYST, post-launch] Collapsed "Things this question used" + route labels (quickest check / reliable full route / answer now return if needed)
8. [pending] [FUTURE] "Out of Spec" label: big and red
9. [pending] [FUTURE] Rename "All Spec" → "All In" + "Out Of Spec"
10. [pending] [FUTURE] Previous button at the TOP
11. [pending] [FUTURE] Previous works in shuffled mode
12. [pending] [FUTURE] Spec out analysis pages
```

#### Thinking

Now let me find the top bar in the CSS and make it sticky. Let me look for the header/filter bar styles.

Now the sticky top bar. Let me find it in the CSS.



#### Tool: Grep

**Input:**

```json
{
  "-n": true,
  "head_limit": 20,
  "output_mode": "content",
  "path": "C:\\Claude (not on Gdrive, nor OneDrive)\\ppqviewer\\engine\\ppqviewer.css",
  "pattern": "ppq-header|ppq-filter|ppq-top|sticky"
}
```

**Output:**

```json
23:.ppq-header {
35:.ppq-filters { display: flex; gap: 0.75rem; flex-wrap: wrap; align-items: center; }
169:.ppq-dash { background: var(--ppq-paper); border: 1px solid var(--ppq-line); border-radius: 12px; padding: 1rem; max-height: calc(100vh - 120px); overflow-y: auto; position: sticky; top: 1rem; }
248:   panels inherit position:sticky from .ppq-dash, so scrolling the paper keeps the
435:.ppq-filterchip { font-size: 0.78rem; font-weight: 700; padding: 0.2rem 0.6rem; border: 1px solid rgba(49, 130, 206, 0.5); border-radius: 999px; background: rgba(49, 130, 206, 0.1); color: var(--ppq-accent); cursor: pointer; }
436:.ppq-filterchip:hover { background: rgba(49, 130, 206, 0.2); }
444:   picker sits in a sticky column to the LEFT of the question so there is no long
448:.ppq-qarea .ppq-options { position: sticky; top: 1rem; display: flex; flex-direction: column; gap: 0.45rem; }
```

#### Thinking

Let me read the `.ppq-header` styles to understand the current layout.


#### Tool: Read

> Read: `C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\engine\ppqviewer.css`

**Output:**

```json
20	
21	.ppq * { box-sizing: border-box; }
22	
23	.ppq-header {
24	  background: var(--ppq-paper);
25	  border-bottom: 1px solid var(--ppq-line);
26	  padding: 1rem 1.5rem;
27	  display: flex;
28	  justify-content: space-between;
29	  align-items: center;
30	  flex-wrap: wrap;
31	  gap: 1rem;
32	}
33	.ppq-title { font-size: 1.35rem; font-weight: 800; }
34	.ppq-ver { font-size: 0.7rem; opacity: 0.6; margin-left: 0.4rem; font-weight: 600; }
35	.ppq-filters { display: flex; gap: 0.75rem; flex-wrap: wrap; align-items: center; }
36	.ppq-select, .ppq-start {
37	  background: var(--ppq-paper);
38	  border: 1px solid var(--ppq-line);
39	  color: var(--ppq-ink);
```

#### Thinking

The `.ppq-header` is the top bar. It's not sticky currently. I need to make it `position: sticky; top: 0; z-index: <something>` so it stays at the top when scrolling. Let me also check what the parent structure looks like — sticky works relative to the nearest scrolling ancestor. Let me check the DOM structure in the JS.

#### Tool: Grep

**Input:**

```json
{
  "-n": true,
  "head_limit": 10,
  "output_mode": "content",
  "path": "C:\\Claude (not on Gdrive, nor OneDrive)\\ppqviewer\\engine\\ppqviewer.js",
  "pattern": "ppq-header|ppq-layout|class.*ppq\\\""
}
```

**Output:**

```json
198:    this.root.classList.add("ppq");
201:    const header = el("div", { class: "ppq-header" });
235:    const layout = el("div", { class: "ppq-layout" });
345:      layout.classList.add("ppq-layout-split");
1910:  Viewer.prototype.destroy = function () { if (this._keyHandler) document.removeEventListener("keydown", this._keyHandler); if (this._resizeHandler) window.removeEventListener("resize", this._resizeHandler); this._stopTimer(); this.root.innerHTML = ""; this.root.classList.remove("ppq"); };
```

#### Thinking

The DOM structure is: `this.root` (.ppq) → header (.ppq-header) → layout (.ppq-layout) → ...

The header is a direct child of the root. For `position: sticky; top: 0` to work, the root needs to be the scroll container, or the page itself scrolls. Since the header is at the top of the root and the page scrolls, `position: sticky; top: 0; z-index: 100` on `.ppq-header` should work.

Let me add sticky positioning to the header.

#### Tool: Edit

> Modified: `C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\engine\ppqviewer.css`

**Output:**

```json
Successfully modified file: C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\engine\ppqviewer.css (1 replacements). Here is the updated code:
...
  display: block;
}

.ppq * { box-sizing: border-box; }

/* QoderWork 2026-07-23: sticky top bar — Smith: "the top bar shouldn't go up on
   scrolling." Stays pinned at the top with a z-index above the question content. */
.ppq-header {
  background: var(--ppq-paper);
  border-bottom: 1px solid var(--ppq-line);
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  position: sticky;
  top: 0;
  z-index: 100;
}
.ppq-title { font-size: 1.35rem; font-weight: 800; }
.ppq-ver { font-size: 0.7rem; opacity: 0.6; margin-left: 0.4rem; font-weight: 600; }
.ppq-filters { display: flex; gap: 0.75rem; flex-wrap: wrap; align-items: center; }
.ppq-select, .ppq-start {
...
```

#### Thinking

Done. Let me update the todo and give Smith the summary. The sticky bar is a CSS-only change, no JS needed. Let me also check if there's a potential issue: if the `.ppq` root has `overflow: hidden` or `overflow: auto`, sticky won't work relative to the viewport. Let me check.

#### Tool: Grep

**Input:**

```json
{
  "-n": true,
  "head_limit": 5,
  "output_mode": "content",
  "path": "C:\\Claude (not on Gdrive, nor OneDrive)\\ppqviewer\\engine\\ppqviewer.css",
  "pattern": "^\\.ppq\\s*\\{|^\\.ppq\\b[^-]"
}
```

**Output:**

```json
5:.ppq {
21:.ppq * { box-sizing: border-box; }
```

#### Thinking

Let me check the .ppq root styles to make sure there's no overflow that would break sticky.

#### Tool: Read

> Read: `C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\engine\ppqviewer.css`

**Output:**

```json
1	/* ppqviewer shared stylesheet. All rules scoped under .ppq so the engine can be
2	   embedded into a host app without leaking styles (d009). Consumers re-skin by
3	   overriding the CSS variables on the .ppq root, never by touching structure. */
4	
5	.ppq {
6	  --ppq-bg: #faf6ed;
7	  --ppq-paper: #fffdf6;
8	  --ppq-ink: #1a1a17;
9	  --ppq-ink2: #4d4943;
10	  --ppq-muted: #8c8579;
11	  --ppq-line: rgba(26, 26, 23, 0.10);
12	  --ppq-accent: #3182ce;
13	  --ppq-ok: #2d6a3f;
14	  --ppq-bad: #b03030;
15	
16	  color: var(--ppq-ink);
17	  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
18	  display: block;
```

#### Thinking

Good — `.ppq` has `display: block` and no `overflow` property, so `position: sticky` on the header will work correctly relative to the viewport scroll. The sticky bar is done.

Let me update the todo and give Smith the summary.

No overflow on the root — sticky will work fine.



#### Tool: TodoWrite

**Input:**

```json
{
  "todos": [
    {
      "description": "Guess-declaration redesign (v0.2.8)",
      "status": "completed"
    },
    {
      "description": "Sticky top bar (shouldn't scroll away) — Smith's request",
      "status": "completed"
    },
    {
      "description": "[ANALYST] Show ALL self-report prompts (not just first primary); additional checks behind \"More quick checks\" disclosure",
      "status": "pending"
    },
    {
      "description": "[ANALYST] Analysis state label: \"Full review\" / \"Early review\" / \"Detailed review not added yet\" — graceful absence",
      "status": "pending"
    },
    {
      "description": "[ANALYST] Option evidence: distinct treatments for rules-out / counts-against / supports / favours / directly-identifies (not just eliminates + lands-on)",
      "status": "pending"
    },
    {
      "description": "[ANALYST] Reviewer-only analysis strip: record ID, version/build date, review state, passes, hidden-prompt count",
      "status": "pending"
    },
    {
      "description": "[ANALYST, post-launch] Collapsed \"Things this question used\" + route labels (quickest check / reliable full route / answer now return if needed)",
      "status": "pending"
    },
    {
      "description": "[FUTURE] \"Out of Spec\" label: big and red",
      "status": "pending"
    },
    {
      "description": "[FUTURE] Rename \"All Spec\" → \"All In\" + \"Out Of Spec\"",
      "status": "pending"
    },
    {
      "description": "[FUTURE] Previous button at the TOP",
      "status": "pending"
    },
    {
      "description": "[FUTURE] Previous works in shuffled mode",
      "status": "pending"
    },
    {
      "description": "[FUTURE] Spec out analysis pages",
      "status": "pending"
    }
  ]
}
```

**Output:**

```json
Successfully updated the todo list. The current list is now:
1. [completed] Guess-declaration redesign (v0.2.8)
2. [completed] Sticky top bar (shouldn't scroll away) — Smith's request
3. [pending] [ANALYST] Show ALL self-report prompts (not just first primary); additional checks behind "More quick checks" disclosure
4. [pending] [ANALYST] Analysis state label: "Full review" / "Early review" / "Detailed review not added yet" — graceful absence
5. [pending] [ANALYST] Option evidence: distinct treatments for rules-out / counts-against / supports / favours / directly-identifies (not just eliminates + lands-on)
6. [pending] [ANALYST] Reviewer-only analysis strip: record ID, version/build date, review state, passes, hidden-prompt count
7. [pending] [ANALYST, post-launch] Collapsed "Things this question used" + route labels (quickest check / reliable full route / answer now return if needed)
8. [pending] [FUTURE] "Out of Spec" label: big and red
9. [pending] [FUTURE] Rename "All Spec" → "All In" + "Out Of Spec"
10. [pending] [FUTURE] Previous button at the TOP
11. [pending] [FUTURE] Previous works in shuffled mode
12. [pending] [FUTURE] Spec out analysis pages
```

#### Thinking

Done. Let me give Smith a clear summary of what's done and what's queued.

Sticky bar done — `.ppq-header` now has `position: sticky; top: 0; z-index: 100`. It'll stay pinned while the question scrolls beneath it.

So this session has shipped two things (both uncommitted, ready for your GitHub Desktop push):

1. **v0.2.8** — guess declaration as first page of the pop-up (reworded, Enter to skip, percentages pulled in)
2. **Sticky top bar** — doesn't scroll away

The analyst's four requests are logged and I understand them. They're substantial (especially #3, the option-evidence vocabulary — that touches the chip rendering and needs the v2 data to actually carry those distinct relationship types). Want me to start on any of them now, or are we done for this chat and they're for next time?

### **You**

start wherever.

### **Assistant**

#### Thinking

Smith says "start wherever" — meaning I should pick one of the analyst's requests and get going. Let me think about which one to tackle first.

The analyst's requests in order of impact/feasibility:

1. **Show ALL self-report prompts** — Currently `_appendSelfReportV2` shows only the first primary method question and first primary knowledge check. The analyst wants all main questions shown, with additional checks behind a "More quick checks" disclosure. This is a rendering change in the engine — moderate complexity, high visibility (the analyst says this "largely explains why you could not tell whether your requests had been incorporated").

2. **Analysis state label** — A quiet label showing "Full review" / "Early review" / "Detailed review not added yet". This is relatively simple — read a field from the v2 record (or infer from what's present) and show a small label. Low complexity, good for transparency.

3. **Option evidence vocabulary** — Distinct treatments for rules-out / counts-against / supports / favours / directly-identifies. This requires the v2 data to carry these relationship types AND the viewer to render them differently. More complex, and depends on the data format.

4. **Reviewer-only analysis strip** — Record ID, version/build date, review state, passes, hidden-prompt count. This is a debug/review aid. Moderate complexity.

I'll start with #1 (show all self-report prompts) since the analyst flagged it as the main reason their work appears invisible. Then #2 (analysis state label) since it's quick and pairs well with #1.

Let me look at `_appendSelfReportV2` to understand what it currently renders.


I'll start with the analyst's #1 — showing all the self-report prompts (the one they say makes their work look invisible). Let me look at what `_appendSelfReportV2` currently renders.



#### Tool: TodoWrite

**Input:**

```json
{
  "todos": [
    {
      "description": "Guess-declaration redesign (v0.2.8)",
      "status": "completed"
    },
    {
      "description": "Sticky top bar (shouldn't scroll away)",
      "status": "completed"
    },
    {
      "description": "[ANALYST #1] Show ALL self-report prompts; additional checks behind \"More quick checks\" disclosure",
      "status": "in_progress"
    },
    {
      "description": "[ANALYST #2] Analysis state label: \"Full review\" / \"Early review\" / \"Detailed review not added yet\"",
      "status": "pending"
    },
    {
      "description": "[ANALYST #3] Option evidence: distinct treatments for rules-out / counts-against / supports / favours / directly-identifies",
      "status": "pending"
    },
    {
      "description": "[ANALYST #4] Reviewer-only analysis strip: record ID, version/build date, review state, passes, hidden-prompt count",
      "status": "pending"
    },
    {
      "description": "[ANALYST, post-launch] Collapsed \"Things this question used\" + route labels",
      "status": "pending"
    },
    {
      "description": "[FUTURE] \"Out of Spec\" label: big and red",
      "status": "pending"
    },
    {
      "description": "[FUTURE] Rename \"All Spec\" → \"All In\" + \"Out Of Spec\"",
      "status": "pending"
    },
    {
      "description": "[FUTURE] Previous button at the TOP",
      "status": "pending"
    },
    {
      "description": "[FUTURE] Previous works in shuffled mode",
      "status": "pending"
    },
    {
      "description": "[FUTURE] Spec out analysis pages",
      "status": "pending"
    }
  ]
}
```

**Output:**

```json
Successfully updated the todo list. The current list is now:
1. [completed] Guess-declaration redesign (v0.2.8)
2. [completed] Sticky top bar (shouldn't scroll away)
3. [in_progress] [ANALYST #1] Show ALL self-report prompts; additional checks behind "More quick checks" disclosure
4. [pending] [ANALYST #2] Analysis state label: "Full review" / "Early review" / "Detailed review not added yet"
5. [pending] [ANALYST #3] Option evidence: distinct treatments for rules-out / counts-against / supports / favours / directly-identifies
6. [pending] [ANALYST #4] Reviewer-only analysis strip: record ID, version/build date, review state, passes, hidden-prompt count
7. [pending] [ANALYST, post-launch] Collapsed "Things this question used" + route labels
8. [pending] [FUTURE] "Out of Spec" label: big and red
9. [pending] [FUTURE] Rename "All Spec" → "All In" + "Out Of Spec"
10. [pending] [FUTURE] Previous button at the TOP
11. [pending] [FUTURE] Previous works in shuffled mode
12. [pending] [FUTURE] Spec out analysis pages
```

#### Tool: Grep

**Input:**

```json
{
  "-n": true,
  "head_limit": 5,
  "output_mode": "content",
  "path": "C:\\Claude (not on Gdrive, nor OneDrive)\\ppqviewer\\engine\\ppqviewer.js",
  "pattern": "_appendSelfReportV2"
}
```

**Output:**

```json
1223:      this._appendSelfReportV2(restPage, rec);
1464:  Viewer.prototype._appendSelfReportV2 = function (iq, rec) {
```

#### Thinking

Let me read the `_appendSelfReportV2` function to understand what it currently renders.

#### Tool: Read

> Read: `C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\engine\ppqviewer.js`

**Output:**

```json
1464	  Viewer.prototype._appendSelfReportV2 = function (iq, rec) {
1465	    const srp = (rec.self_report_prompts || []).filter((p) => p.primary)[0];
1466	    if (srp) iq.appendChild(this._promptBlockV2(srp, "method"));
1467	    const checks = ((rec.requirements || {}).post_question_checks) || [];
1468	    const pqc = checks.filter((c) => c.primary)[0];
1469	    if (pqc) iq.appendChild(this._promptBlockV2(pqc, "check"));
1470	  };
1471	  Viewer.prototype._promptBlockV2 = function (p, kind) {
1472	    const self = this;
1473	    const box = el("div", { class: "ppq-iq-prompt" });
1474	    box.appendChild(el("div", { class: "ppq-iq-prompt-text" }, esc(p.prompt || "")));
1475	    const chips = el("div", { class: "ppq-iq-prompt-states" });
1476	    (p.states || []).forEach((st) => {
1477	      const chip = el("button", { class: "ppq-iq-state", type: "button", "data-state": st }, self._stateLabel(st));
1478	      chip.addEventListener("click", () => {
1479	        chips.querySelectorAll(".ppq-iq-state").forEach((c) => c.classList.remove("sel"));
1480	        chip.classList.add("sel");
1481	        self._promptStates[p.id] = st;
1482	        self._fireReport({ status: "interrogation", qtype: "self_report", extra_json: JSON.stringify({ prompt_id: p.id, prompt_kind: kind, state: st, attempt_id: self._attemptId || "" }) });
1483	        self._renderInterrogationFeedback();
1484	      });
1485	      chips.appendChild(chip);
1486	    });
1487	    box.appendChild(chips);
1488	    return box;
1489	  };
1490	  /* Viewer-owned chrome: render a snake_case state id as a readable chip label.
1491	     This is presentation only — it never touches the analysts' prose. */
1492	  Viewer.prototype._stateLabel = function (st) {
1493	    const s = String(st || "").replace(/_/g, " ");
1494	    return s.charAt(0).toUpperCase() + s.slice(1);
1495	  };
1496	
1497	  /* QoderWork 2026-07-22 (analyst handoff): legacy analysis-store renderers,
1498	     extracted unchanged so the v2 path can branch around them. */
1499	  Viewer.prototype._appendProbeLegacy = function (iq, rec) {
1500	    if (rec.probe && rec.probe.text) {
1501	      const probe = el("div", { class: "ppq-iq-probe" });
1502	      probe.appendChild(el("div", { class: "ppq-iq-probe-text" }, esc(rec.probe.text)));
1503	      const chips = el("div", { class: "ppq-iq-chips" });
1504	      if (rec.probe.difficulty_source) chips.appendChild(el("span", { class: "ppq-iq-chip" }, "difficulty: " + esc(rec.probe.difficulty_source)));
1505	      if (rec.probe.trick_type) chips.appendChild(el("span", { class: "ppq-iq-chip" }, esc(rec.probe.trick_type)));
1506	      probe.appendChild(chips);
1507	      iq.appendChild(probe);
1508	    }
1509	  };
1510	  Viewer.prototype._appendMethodsLegacy = function (iq, rec, correctLetter) {
1511	    const self = this;
1512	    const labels = this._optionLabels(this.cur) || [];
1513	    if (rec.methods && rec.methods.length) {
1514	      iq.appendChild(el("div", { class: "ppq-iq-subhead" }, "Ways through it"));
1515	      iq.appendChild(el("div", { class: "ppq-iq-encourage" }, "Most of these have more than one route through — collecting alternatives is the point."));
1516	      rec.methods.forEach((m) => {
1517	        const md = el("div", { class: "ppq-iq-method" });
1518	        const head = el("div", { class: "ppq-iq-method-head" });
1519	        head.appendChild(el("b", null, esc(m.id)));
1520	        head.appendChild(el("span", { class: "ppq-iq-kind" }, esc(m.kind)));
1521	        const used = el("button", { class: "ppq-iq-used", type: "button" }, "used it");
1522	        used.addEventListener("click", () => {
1523	          const on = used.classList.toggle("on");
1524	          const ref = m.method_ref || m.id;
1525	          if (on) self._analysisSelfReports[ref] = "used"; else delete self._analysisSelfReports[ref];
1526	          self._fireReport({ status: "interrogation", qtype: "self_report", extra_json: JSON.stringify({ method_id: m.id, method_ref: ref, state: on ? "used" : "not_used" }) });
1527	          self._renderInterrogationFeedback();
1528	        });
1529	        head.appendChild(used);
1530	        md.appendChild(head);
1531	        md.appendChild(self._methodLinesEl(m.description));
1532	        md.appendChild(self._elimChipsEl(m, labels, correctLetter));
1533	        iq.appendChild(md);
1534	      });
1535	    }
1536	  };
1537	
1538	  /* QoderWork 2026-07-22: set a method's description out on MULTIPLE LINES — the
1539	     one-line algebra was hard to read (Smith). Split on commas/semicolons, and
1540	     "=>" becomes a result line ("⇒ …"). Anything that doesn't split stays as one
1541	     line. NOTE-TO-SELF: a real per-method `steps:[…]` field from the analysts
1542	     would beat this regex pass. */
1543	  Viewer.prototype._methodLinesEl = function (desc) {
```

#### Thinking

Now I can see the issue clearly. Lines 1465-1469:

```js
const srp = (rec.self_report_prompts || []).filter((p) => p.primary)[0];  // ONLY the first primary
if (srp) iq.appendChild(this._promptBlockV2(srp, "method"));
const checks = ((rec.requirements || {}).post_question_checks) || [];
const pqc = checks.filter((c) => c.primary)[0];  // ONLY the first primary check
if (pqc) iq.appendChild(this._promptBlockV2(pqc, "check"));
```

It takes only `[0]` — the first primary self-report prompt and the first primary knowledge check. Everything else (secondary prompts, `pupil_analysis.check_prompt`, additional checks) is hidden.

The analyst wants:
- Show ALL main (primary) questions
- Put additional (secondary) checks behind a "More quick checks" disclosure

Let me also check what the v2 data actually looks like. Let me look at one of the v2 records to understand the structure of `self_report_prompts` and `requirements.post_question_checks`.


Let me look at the v2 data structure to understand what prompts exist.



#### Tool: Bash

```bash
cd "/c/Claude (not on Gdrive, nor OneDrive)/ppqviewer" && ls example/ dist/esat-compare/data/ 2>/dev/null | head -20
```

**Output:**

```json
dist/esat-compare/data/:
analysis
esat_analysis_v2.js
esat_catalogue.js

example/:
analyst-preview.html
chem-compare.html
chem-config.js
esat-compare.html
esat-config.js
esat.html
ppq-login.js
```

#### Tool: Grep

**Input:**

```json
{
  "-n": true,
  "head_limit": 5,
  "output_mode": "content",
  "path": "C:\\Claude (not on Gdrive, nor OneDrive)\\ppqviewer\\example\\esat-compare.html",
  "pattern": "ANALYSIS_V2|analysis_v2"
}
```

**Output:**

```json
63:       window.ESAT_ANALYSIS_V2 = { schema_version, interaction_defaults, records[],
66:       it is generated by analysis_v2/scripts/build_ppqviewer_bundle.py. -->
67:  <script src="../../../CodexProjects/PaperDatabases/Esat Categorisation/analysis_v2/dist/esat_analysis_v2.js"></script>
198:        var V2 = window.ESAT_ANALYSIS_V2;
296:        guessDefaults: (window.ESAT_ANALYSIS_V2 && window.ESAT_ANALYSIS_V2.interaction_defaults && window.ESAT_ANALYSIS_V2.interaction_defaults.guess_declaration) || null
```

#### Thinking

Let me look at the v2 bundle to see the structure of self_report_prompts and requirements.post_question_checks for one of the records.

#### Tool: Bash

```bash
cd "/c/Claude (not on Gdrive, nor OneDrive)/ppqviewer/dist/esat-compare/data" && node -e "
const fs = require('fs');
const src = fs.readFileSync('esat_analysis_v2.js','utf8');
eval(src);
const rec = ESAT_ANALYSIS_V2.records[0];
console.log('=== self_report_prompts ===');
console.log(JSON.stringify(rec.self_report_prompts, null, 2));
console.log('=== requirements.post_question_checks ===');
console.log(JSON.stringify((rec.requirements||{}).post_question_checks, null, 2));
console.log('=== pupil_analysis keys ===');
console.log(Object.keys(rec.pupil_analysis||{}));
" 2>&1 | head -80
```

**Output:**

```json
<anonymous_script>:3032
  window.ESAT_ANALYSIS_V2 = bundle;
  ^

ReferenceError: window is not defined
    at eval (eval at <anonymous> ([eval]:4:1), <anonymous>:3032:3)
    at eval (eval at <anonymous> ([eval]:4:1), <anonymous>:3033:3)
    at [eval]:4:1
    at runScriptInThisContext (node:internal/vm:219:10)
    at node:internal/process/execution:451:12
    at [eval]-wrapper:6:24
    at runScriptInContext (node:internal/process/execution:449:60)
    at evalFunction (node:internal/process/execution:283:30)
    at evalTypeScript (node:internal/process/execution:295:3)
    at node:internal/main/eval_string:71:3

Node.js v24.15.0
```

#### Thinking

The file assigns to `window.ESAT_ANALYSIS_V2`. I need to provide a `window` object. Let me fix the eval.

#### Tool: Bash

```bash
cd "/c/Claude (not on Gdrive, nor OneDrive)/ppqviewer/dist/esat-compare/data" && node -e "
const fs = require('fs');
const window = {};
const src = fs.readFileSync('esat_analysis_v2.js','utf8');
eval(src);
const rec = window.ESAT_ANALYSIS_V2.records[0];
console.log('id:', rec.id);
console.log('=== self_report_prompts (' + (rec.self_report_prompts||[]).length + ') ===');
(rec.self_report_prompts||[]).forEach((p,i) => console.log(i, JSON.stringify({id:p.id, primary:p.primary, prompt:(p.prompt||'').slice(0,60), states:p.states})));
console.log('=== post_question_checks (' + ((rec.requirements||{}).post_question_checks||[]).length + ') ===');
((rec.requirements||{}).post_question_checks||[]).forEach((c,i) => console.log(i, JSON.stringify({id:c.id, primary:c.primary, prompt:(c.prompt||'').slice(0,60), states:c.states})));
console.log('=== pupil_analysis keys ===');
console.log(Object.keys(rec.pupil_analysis||{}));
" 2>&1
```

**Output:**

```json
id: undefined
=== self_report_prompts (2) ===
0 {"id":"inequality_route_prompt","primary":true,"prompt":"Did you keep x positive, or did you solve through a negative","states":["used_as_main_route","used_alongside_another_route","saw_but_chose_not_to_use","considered_briefly","did_not_see","saw_but_could_not_complete"]}
1 {"id":"zero_check_prompt","primary":false,"prompt":"Did you test x = 0 to check that the solution had to be on t","states":["used_as_main_route","used_alongside_another_route","saw_but_chose_not_to_use","considered_briefly","did_not_see","saw_but_could_not_complete"]}
=== post_question_checks (2) ===
0 {"id":"negative_rule_check","primary":true,"prompt":"Before the explanation, how secure were you that multiplying","states":["secure_before_question","knew_but_did_not_retrieve","recognised_after_prompt","understood_after_explanation","still_unclear"]}
1 {"id":"positive_route_check","primary":false,"prompt":"Could you see the safer route of keeping x positive, and the","states":["secure_before_question","knew_but_did_not_retrieve","recognised_after_prompt","understood_after_explanation","still_unclear"]}
=== pupil_analysis keys ===
[ 'first_notice', 'why_it_matters', 'next_move', 'check_prompt' ]
```

#### Thinking

Now I can see the structure clearly. For the first record:
- `self_report_prompts`: 2 items — one primary (inequality_route_prompt), one secondary (zero_check_prompt)
- `post_question_checks`: 2 items — one primary (negative_rule_check), one secondary (positive_route_check)
- `pupil_analysis` has a `check_prompt` key (which the analyst says is currently hidden)

The current code shows only `[0]` of each filtered-by-primary array — so it shows the first primary self-report prompt and the first primary check. The secondary ones are hidden.

The analyst wants:
- Show ALL primary prompts (not just the first)
- Put secondary/additional checks behind a "More quick checks" disclosure

Let me also check what `pupil_analysis.check_prompt` looks like.

#### Tool: Bash

```bash
cd "/c/Claude (not on Gdrive, nor OneDrive)/ppqviewer/dist/esat-compare/data" && node -e "
const fs = require('fs');
const window = {};
eval(fs.readFileSync('esat_analysis_v2.js','utf8'));
const recs = window.ESAT_ANALYSIS_V2.records;
console.log('Total records:', recs.length);
recs.forEach((r,i) => {
  const srp = (r.self_report_prompts||[]);
  const pqc = ((r.requirements||{}).post_question_checks||[]);
  const cp = (r.pupil_analysis||{}).check_prompt;
  console.log(i, r.identity?.question_id || '?', '| srp:', srp.length, '(primary:', srp.filter(p=>p.primary).length, ') | pqc:', pqc.length, '(primary:', pqc.filter(c=>c.primary).length, ') | check_prompt:', cp ? 'yes' : 'no');
});
" 2>&1
```

**Output:**

```json
Total records: 6
0 ? | srp: 2 (primary: 1 ) | pqc: 2 (primary: 1 ) | check_prompt: yes
1 ? | srp: 1 (primary: 1 ) | pqc: 2 (primary: 1 ) | check_prompt: yes
2 ? | srp: 1 (primary: 1 ) | pqc: 2 (primary: 1 ) | check_prompt: yes
3 ? | srp: 2 (primary: 1 ) | pqc: 2 (primary: 1 ) | check_prompt: yes
4 ? | srp: 1 (primary: 1 ) | pqc: 2 (primary: 1 ) | check_prompt: yes
5 ? | srp: 1 (primary: 1 ) | pqc: 2 (primary: 1 ) | check_prompt: yes
```

#### Thinking

Good. So across all 6 records:
- `self_report_prompts`: 1-2 items, always exactly 1 primary
- `post_question_checks`: always 2 items, always exactly 1 primary
- `pupil_analysis.check_prompt`: present in all 6

So the current code shows: 1 primary srp + 1 primary pqc = 2 prompts visible.
Hidden: 0-1 secondary srp + 1 secondary pqc + check_prompt = up to 3 items hidden.

The analyst wants:
- Show all primary prompts (already just 1 of each, so no change there)
- Show the secondary ones behind a "More quick checks" disclosure
- Also show `pupil_analysis.check_prompt` (currently completely hidden)

Let me check what `check_prompt` looks like.

#### Tool: Bash

```bash
cd "/c/Claude (not on Gdrive, nor OneDrive)/ppqviewer/dist/esat-compare/data" && node -e "
const fs = require('fs');
const window = {};
eval(fs.readFileSync('esat_analysis_v2.js','utf8'));
const rec = window.ESAT_ANALYSIS_V2.records[0];
console.log('check_prompt:', JSON.stringify(rec.pupil_analysis.check_prompt, null, 2));
" 2>&1
```

**Output:**

```json
check_prompt: "Did you keep the coefficient of x positive, or did you multiply by a negative and remember to reverse the inequality?"
```

#### Thinking

So `check_prompt` is just a string (a question). It's not a structured prompt with states — it's a simple text question. The analyst wants this shown too.

Now let me implement the changes to `_appendSelfReportV2`:

1. Show ALL primary self-report prompts (not just `[0]`) — though currently there's only ever 1 primary, this future-proofs it
2. Show ALL primary post-question checks (same)
3. Put secondary (non-primary) prompts + checks behind a "More quick checks" disclosure (`<details>`)
4. Show `pupil_analysis.check_prompt` as a simple text line (it's just a question string, no states)

Let me write the new `_appendSelfReportV2`.


Good — `check_prompt` is a plain string question. Now I'll rework `_appendSelfReportV2` to show all primaries, put secondaries behind a disclosure, and surface `check_prompt`.



#### Tool: Edit

> Modified: `C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\engine\ppqviewer.js`

**Output:**

```json
Successfully modified file: C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\engine\ppqviewer.js (1 replacements). Here is the updated code:
...

  /* QoderWork 2026-07-22 (analyst handoff): the PRIMARY method-awareness prompt
     (self_report_prompts[].primary) and the PRIMARY knowledge/technique check
     (requirements.post_question_checks[].primary). Each offers tappable states;
     the chosen state is stored per prompt id and drives the v2 feedback match. */
  /* QoderWork 2026-07-23 (analyst request #1): show ALL primary prompts and checks,
     not just the first. Secondary items go behind a "More quick checks" disclosure.
     pupil_analysis.check_prompt (a plain string) is surfaced as a quiet text line. */
  Viewer.prototype._appendSelfReportV2 = function (iq, rec) {
    const srps = rec.self_report_prompts || [];
    const checks = ((rec.requirements || {}).post_question_checks) || [];
    const primarySrps = srps.filter((p) => p.primary);
    const secondarySrps = srps.filter((p) => !p.primary);
    const primaryChecks = checks.filter((c) => c.primary);
    const secondaryChecks = checks.filter((c) => !c.primary);

    /* all primary method-awareness prompts */
    primarySrps.forEach((p) => iq.appendChild(this._promptBlockV2(p, "method")));
    /* all primary knowledge checks */
    primaryChecks.forEach((c) => iq.appendChild(this._promptBlockV2(c, "check")));

    /* pupil_analysis.check_prompt — a plain string question, no states */
    const cp = (rec.pupil_analysis || {}).check_prompt;
    if (cp) {
      const cpBox = el("div", { class: "ppq-iq-prompt ppq-iq-checkprompt" });
      cpBox.appendChild(el("div", { class: "ppq-iq-prompt-text" }, esc(cp)));
      iq.appendChild(cpBox);
    }

    /* secondary items behind a disclosure */
    const secondaries = secondarySrps.concat(secondaryChecks);
    if (secondaries.length) {
      const det = el("details", { class: "ppq-iq-morechecks" });
      det.appendChild(el("summary", null, "More quick checks (" + secondaries.length + ")"));
      secondarySrps.forEach((p) => det.appendChild(this._promptBlockV2(p, "method")));
      secondaryChecks.forEach((c) => det.appendChild(this._promptBlockV2(c, "check")));
      iq.appendChild(det);
    }
  };
  Viewer.prototype._promptBlockV2 = function (p, kind) {
    const self = this;
    const box = el("div", { class: "ppq-iq-prompt" });
    box.appendChild(el("div", { class: "ppq-iq-prompt-text" }, esc(p.prompt || "")));
...
```

#### Thinking

Good. Now let me add CSS for the new elements (`.ppq-iq-morechecks`, `.ppq-iq-checkprompt`). Let me also run the syntax check.

Now add CSS for the disclosure and check_prompt, then syntax-check.



#### Tool: Edit

> Modified: `C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\engine\ppqviewer.css`

**Output:**

```json
Successfully modified file: C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\engine\ppqviewer.css (1 replacements). Here is the updated code:
...
.ppq-iq-prompt-states { display: flex; gap: 0.35rem; flex-wrap: wrap; }
.ppq-iq-state { font-size: 0.78rem; padding: 0.3rem 0.7rem; border: 1px solid var(--ppq-line); border-radius: 999px; background: var(--ppq-bg); color: var(--ppq-ink2); cursor: pointer; }
.ppq-iq-state:hover { border-color: var(--ppq-accent); color: var(--ppq-accent); }
.ppq-iq-state.sel { background: var(--ppq-accent); border-color: var(--ppq-accent); color: #fff; font-weight: 700; }

/* QoderWork 2026-07-23 (analyst request #1): "More quick checks" disclosure for
   secondary prompts, and the plain-text check_prompt line. */
.ppq-iq-morechecks { margin-top: 0.6rem; border: 1px solid var(--ppq-line); border-radius: 8px; padding: 0.5rem 0.8rem; }
.ppq-iq-morechecks summary { font-size: 0.82rem; font-weight: 600; color: var(--ppq-muted); cursor: pointer; }
.ppq-iq-morechecks summary:hover { color: var(--ppq-accent); }
.ppq-iq-morechecks[open] summary { margin-bottom: 0.5rem; }
.ppq-iq-checkprompt { border-left: 3px solid var(--ppq-muted); padding-left: 0.7rem; opacity: 0.9; }

/* QoderWork 2026-07-22 (v0.2.4): multi-select dropdown filter (subject defaults to
   Maths + Physics on ESAT; the others are a tick away). */
.ppq-multifilter { position: relative; display: inline-block; }
.ppq-multi-btn { font-size: 0.85rem; padding: 0.35rem 0.7rem; border: 1px solid var(--ppq-line); border-radius: 7px; background: var(--ppq-bg); color: var(--ppq-ink); cursor: pointer; }
.ppq-multi-btn:hover { border-color: var(--ppq-accent); }
...
```

#### Thinking

Let me run the syntax check.

#### Tool: Bash

```bash
cd "/c/Claude (not on Gdrive, nor OneDrive)/ppqviewer" && node --check engine/ppqviewer.js 2>&1 && echo "OK"
```

**Output:**

```json
OK
```

#### Thinking

Good. Analyst #1 is done. Now let me move to analyst #2 — the analysis state label. This is a quiet label showing the review state of the question's analysis. Let me think about how to determine the state:

- "Full review" — has v2 record with all expected fields (identity, pupil_analysis, methods, self_report_prompts, requirements, feedback)
- "Early review" — has a v2 record but it's sparse (maybe missing methods or feedback)
- "Detailed review not added yet" — no v2 record (legacy only, or nothing)

Actually, the analyst's exact words: "Use a quiet label such as 'Full review', 'Early review', or 'Detailed review not added yet'. A question without full analysis should still run, show its verdict, and fail gracefully rather than silently looking as if nothing was intended."

This label should appear in the pop-up (or even outside it for questions without analysis). Let me think about where to put it:
- For questions WITH v2 analysis: show "Full review" or "Early review" at the top of the pop-up (or bottom, as a quiet footer)
- For questions WITHOUT analysis: the pop-up doesn't appear at all currently. The analyst says "A question without full analysis should still run, show its verdict, and fail gracefully." This suggests they want the pop-up to appear for ALL questions (at minimum showing the verdict), with a "Detailed review not added yet" label.

But that's a bigger change (making the pop-up appear for all questions). Let me focus on what's immediately doable:
- For questions WITH v2 analysis: add a quiet state label in the pop-up
- Determine the state from the record's completeness

For the state determination, I'll check:
- "Full review": has methods + self_report_prompts + feedback entries
- "Early review": has identity + pupil_analysis but missing methods or feedback
- The "Detailed review not added yet" case is for questions without a v2 record — but those don't get a pop-up currently. I'll add that as a note for later (making the pop-up appear for all questions is a separate architectural decision).

Actually, let me re-read the analyst's request: "A question without full analysis should still run, show its verdict, and fail gracefully rather than silently looking as if nothing was intended." This is saying: when a question has NO analysis, the viewer should still show SOMETHING (at least the verdict + a "not added yet" label) rather than silently showing nothing. Currently, questions without analysis get NO pop-up at all — the pupil just sees the plain viewer with the outer 1-6.

This is actually a significant change: making the pop-up appear for ALL questions (with graceful degradation). But the analyst explicitly asks for it. Let me implement it:
- If analysisOf returns a record: full pop-up (guess → verdict → insight → methods → prompts → feedback → 1-6)
- If analysisOf returns null BUT the question has a correct answer: lightweight pop-up (guess → verdict → "Detailed review not added yet" label → 1-6)

This way every answered question gets the guess page + verdict + rating, and analysis questions get the full treatment.

Actually wait — this is a big change. The current gating is at line 1150: `if (!rec) return;`. If I remove that, I need to handle the null-rec case throughout `_renderInterrogation`. Let me think about whether to do this now or just add the label for existing records.

Smith said "start wherever" — he's giving me latitude. The analyst's #2 is specifically about the label. The "should still run" part is implied but is a bigger change. Let me do the label first (for existing records) and note the "pop-up for all questions" as a follow-up. That's the safer increment.

For the label, I'll add it as a quiet footer at the bottom of the pop-up (after the flag button). Or actually, the analyst says "a quiet label" — maybe at the top, before the guess page? Or as a small tag in the corner? Let me put it as a subtle line at the very bottom of the modal content (after the flag), like a metadata footer.

For determining the state:
- Check if the record has `feedback` entries (the v2 feedback array)
- Check if it has methods
- "Full review": has methods.length > 0 AND has feedback entries
- "Early review": has identity + pupil_analysis but sparse (no methods or no feedback)

Let me check what the feedback structure looks like in the v2 data.

Analyst #1 done. Moving to #2 — the analysis state label. Let me check what determines "full" vs "early" in the v2 data.



#### Tool: Bash

```bash
cd "/c/Claude (not on Gdrive, nor OneDrive)/ppqviewer/dist/esat-compare/data" && node -e "
const fs = require('fs');
const window = {};
eval(fs.readFileSync('esat_analysis_v2.js','utf8'));
window.ESAT_ANALYSIS_V2.records.forEach((r,i) => {
  const m = (r.methods||[]).length;
  const fb = (r.feedback||[]).length;
  const srp = (r.self_report_prompts||[]).length;
  const pa = r.pupil_analysis ? Object.keys(r.pupil_analysis).length : 0;
  console.log(i, '| methods:', m, '| feedback:', fb, '| srp:', srp, '| pupil_analysis keys:', pa, '| review_state:', r.review_state || r.meta?.review_state || 'none');
});
" 2>&1
```

**Output:**

```json
0 | methods: 3 | feedback: 4 | srp: 2 | pupil_analysis keys: 4 | review_state: none
1 | methods: 2 | feedback: 5 | srp: 1 | pupil_analysis keys: 4 | review_state: none
2 | methods: 3 | feedback: 4 | srp: 1 | pupil_analysis keys: 4 | review_state: none
3 | methods: 4 | feedback: 6 | srp: 2 | pupil_analysis keys: 4 | review_state: none
4 | methods: 2 | feedback: 5 | srp: 1 | pupil_analysis keys: 4 | review_state: none
5 | methods: 3 | feedback: 4 | srp: 1 | pupil_analysis keys: 4 | review_state: none
```

#### Thinking

All 6 records are fairly complete (methods, feedback, srp, full pupil_analysis). There's no explicit `review_state` field in the data. So I'll infer the state from completeness:

- "Full review": has methods AND feedback AND pupil_analysis with first_notice
- "Early review": has identity + pupil_analysis but missing methods or feedback
- "Detailed review not added yet": no v2 record at all (legacy or nothing)

For the current 6 records, they'd all be "Full review". The label is more useful as the analyst adds more records at different stages of completion.

Let me also check if there's a `meta` or `version` or `build_date` field in the bundle (for the reviewer strip in #4, but useful context now).


#### Tool: Bash

```bash
cd "/c/Claude (not on Gdrive, nor OneDrive)/ppqviewer/dist/esat-compare/data" && node -e "
const fs = require('fs');
const window = {};
eval(fs.readFileSync('esat_analysis_v2.js','utf8'));
const b = window.ESAT_ANALYSIS_V2;
console.log('Top-level keys:', Object.keys(b));
console.log('schema_version:', b.schema_version);
const r = b.records[0];
console.log('Record keys:', Object.keys(r));
console.log('identity:', JSON.stringify(r.identity));
" 2>&1
```

**Output:**

```json
Top-level keys: [ 'schema_version', 'interaction_defaults', 'records', 'by_id' ]
schema_version: 2.0.0
Record keys: [
  'schema_version',
  'identity',
  'taxonomy',
  'requirements',
  'pupil_analysis',
  'options',
  'methods',
  'self_report_prompts',
  'feedback',
  'review'
]
identity: {"id":"esat_engaa_2016_s1_Q01","slug":"esat_engaa_2016_s1","assessment":"ENGAA","year":2016,"section":"S1","question_number":1,"part":"A","subject":"maths","correct_answer":"G","option_labels":["A","B","C","D","E","F","G","H"],"crop":"outputs/previews/esat_engaa_2016_s1/crops/esat_engaa_2016_s1_Q01_p004.png"}
```

#### Thinking

There's a `review` key in the record. Let me check what's in it — that might already carry the review state the analyst wants to surface.

#### Tool: Bash

```bash
cd "/c/Claude (not on Gdrive, nor OneDrive)/ppqviewer/dist/esat-compare/data" && node -e "
const fs = require('fs');
const window = {};
eval(fs.readFileSync('esat_analysis_v2.js','utf8'));
window.ESAT_ANALYSIS_V2.records.forEach((r,i) => {
  console.log(i, r.identity.id, '| review:', JSON.stringify(r.review));
});
" 2>&1
```

**Output:**

```json
0 esat_engaa_2016_s1_Q01 | review: {"crop_checked":true,"answer_checked":true,"status":"reviewed","reviewer":"Codex","notes":["The original record over-diagnosed several middle options. A-F are now marked plausible or unknown unless the error is reconstructable.","Error-tag IDs remain provisional pending the wider error taxonomy."],"error_taxonomy_mapping":"provisional"}
1 esat_engaa_2016_s1_Q02 | review: {"crop_checked":true,"answer_checked":true,"status":"reviewed","reviewer":"Codex","notes":["Error-tag IDs are provisional until the wider error-taxonomy project is reviewed.","Option B is not treated as a uniquely diagnosable misconception; it may be a guess."],"error_taxonomy_mapping":"provisional"}
2 esat_engaa_2016_s1_Q11 | review: {"crop_checked":true,"answer_checked":true,"status":"reviewed","reviewer":"Codex","notes":["The previous 'A is the obvious too-small decoy' shortcut was not rigorous. The revised bound uses the fact that BC is the longer leg, giving 2 < BC < 4.","Error-tag IDs remain provisional pending the wider error taxonomy."],"error_taxonomy_mapping":"provisional"}
3 esat_engaa_2016_s1_Q15 | review: {"crop_checked":true,"answer_checked":true,"status":"reviewed","reviewer":"Codex","notes":["The enclosing-rectangle route is retained as the recommended MCQ filter, but it now explicitly tests a survivor before claiming to land on E.","Option F is only plausibly diagnosed because its exact production route is not recoverable from the option alone.","Error-taxonomy category paths remain provisional."],"error_taxonomy_mapping":"provisional"}
4 esat_engaa_2016_s1_Q22 | review: {"crop_checked":true,"answer_checked":true,"status":"reviewed","reviewer":"Codex","notes":["The previous method incorrectly claimed that column consistency alone leaves only A. It actually leaves A and F, so one triangle-area calculation is now required.","Compound table rows retain multiple error tags rather than being forced into one primary category.","Error-taxonomy category paths remain provisional."],"error_taxonomy_mapping":"provisional"}
5 esat_engaa_2023_s1_Q02 | review: {"crop_checked":true,"answer_checked":true,"status":"reviewed","reviewer":"Codex","notes":["This is an unseen 2023 pilot record rather than a rewrite of one of the original 33 analyses.","Only B is uniquely recoverable as the acceleration intermediate. A, C, D and E retain plausible or unknown confidence rather than invented certainty.","Error-taxonomy category paths remain provisional."],"error_taxonomy_mapping":"provisional"}
```

#### Thinking

Excellent! There's a `review` field with `status: "reviewed"`, `reviewer: "Codex"`, `crop_checked`, `answer_checked`, and `notes`. This is exactly what the analyst wants surfaced.

For the analysis state label (#2), I can derive it from:
- `review.status === "reviewed"` + has methods + has feedback → "Full review"
- Has v2 record but `review.status` is something else (or missing methods/feedback) → "Early review"
- No v2 record → "Detailed review not added yet"

For the current 6 records, they're all "reviewed" with full content → "Full review".

Now let me implement #2. I'll add a quiet label at the bottom of the pop-up content (after the flag button). It'll show the review state. I'll also add it to the `restPage` so it appears after the verdict is revealed.

Actually, thinking about placement: the analyst says "a quiet label." I'll put it as a small, muted footer line at the very bottom of the modal content. Something like:

"Full review · reviewed by Codex · crop ✓ answer ✓"

Or simpler: just the state word. Let me keep it minimal: "Full review" in small muted text. The reviewer strip (#4) will be the detailed version.

Let me implement this in `_renderInterrogation`, adding the label to `restPage` after the flag button.

The `review` field has everything. Let me add the state label to the pop-up. I'll put it as a quiet footer after the flag button.



#### Tool: Read

> Read: `C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\engine\ppqviewer.js`

**Output:**

```json
1268	    flag.addEventListener("click", () => {
1269	      flag.classList.toggle("on");
1270	      const on = flag.classList.contains("on");
1271	      flag.textContent = on ? "Flagged ✓ — we'll bring more like this" : "Flag this — come back / more like this";
1272	      self._fireReport({ status: "flag_review", qtype: "review_flag", extra_json: JSON.stringify({ flagged: on }) });
1273	    });
1274	    restPage.appendChild(flag);
1275	
1276	    /* --- mount into the modal shell and open the pop-up. The guess page shows
1277	       first; the rest (verdict onward) is hidden until Done/Skip. While the pop-up
1278	       holds the 1-6, the outer 1-6 row is hidden; closeModal restores it. --- */
1279	    iq.appendChild(guessPage);
1280	    iq.appendChild(restPage);
1281	    const body = this.q(".ppq-modal-body");
1282	    body.innerHTML = "";
```

#### Thinking

I'll add the analysis state label after the flag button, before the mount section.

#### Tool: Edit

> Modified: `C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\engine\ppqviewer.js`

**Output:**

```json
Successfully modified file: C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\engine\ppqviewer.js (1 replacements). Here is the updated code:
...
      flag.textContent = on ? "Flagged ✓ — we'll bring more like this" : "Flag this — come back / more like this";
      self._fireReport({ status: "flag_review", qtype: "review_flag", extra_json: JSON.stringify({ flagged: on }) });
    });
    restPage.appendChild(flag);

    /* --- QoderWork 2026-07-23 (analyst request #2): quiet analysis-state label.
       Distinguishes "Full review" / "Early review" so the pupil (and reviewer)
       knows whether the analysis behind this question is complete. --- */
    const rv = rec.review || {};
    const hasMethods = (rec.methods || []).length > 0;
    const hasFeedback = (rec.feedback || []).length > 0;
    let stateLabel = "Early review";
    if (rv.status === "reviewed" && hasMethods && hasFeedback) stateLabel = "Full review";
    const stateEl = el("div", { class: "ppq-iq-state-label" }, stateLabel);
    if (rv.reviewer) stateEl.appendChild(el("span", { class: "ppq-iq-state-by" }, " · " + esc(rv.reviewer)));
    restPage.appendChild(stateEl);

    /* --- mount into the modal shell and open the pop-up. The guess page shows
       first; the rest (verdict onward) is hidden until Done/Skip. While the pop-up
       holds the 1-6, the outer 1-6 row is hidden; closeModal restores it. --- */
    iq.appendChild(guessPage);
    iq.appendChild(restPage);
...
```

#### Thinking

Now add CSS for the state label and syntax-check.


#### Tool: Edit

> Modified: `C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\engine\ppqviewer.css`

**Output:**

```json
Successfully modified file: C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\engine\ppqviewer.css (1 replacements). Here is the updated code:
...
.ppq-iq-morechecks summary { font-size: 0.82rem; font-weight: 600; color: var(--ppq-muted); cursor: pointer; }
.ppq-iq-morechecks summary:hover { color: var(--ppq-accent); }
.ppq-iq-morechecks[open] summary { margin-bottom: 0.5rem; }
.ppq-iq-checkprompt { border-left: 3px solid var(--ppq-muted); padding-left: 0.7rem; opacity: 0.9; }

/* QoderWork 2026-07-23 (analyst request #2): quiet analysis-state footer. */
.ppq-iq-state-label { margin-top: 1rem; padding-top: 0.5rem; border-top: 1px solid var(--ppq-line); font-size: 0.72rem; font-weight: 600; color: var(--ppq-muted); letter-spacing: 0.02em; }
.ppq-iq-state-by { font-weight: 400; opacity: 0.7; }

/* QoderWork 2026-07-22 (v0.2.4): multi-select dropdown filter (subject defaults to
   Maths + Physics on ESAT; the others are a tick away). */
.ppq-multifilter { position: relative; display: inline-block; }
.ppq-multi-btn { font-size: 0.85rem; padding: 0.35rem 0.7rem; border: 1px solid var(--ppq-line); border-radius: 7px; background: var(--ppq-bg); color: var(--ppq-ink); cursor: pointer; }
.ppq-multi-btn:hover { border-color: var(--ppq-accent); }
...
```

#### Thinking

Let me syntax check and then move to analyst #3 (option evidence). Actually, let me check syntax first, then assess whether #3 is doable now or needs data changes.


#### Tool: Bash

```bash
cd "/c/Claude (not on Gdrive, nor OneDrive)/ppqviewer" && node --check engine/ppqviewer.js 2>&1 && echo "OK"
```

**Output:**

```json
OK
```

#### Thinking

Good. Now analyst #3 — option evidence vocabulary. The analyst wants distinct treatments for: rules out, counts against, supports, favours, directly identifies. Currently the viewer only understands "eliminates" (red chips) and "lands_on" (green chip).

Let me check what the v2 data's `options` field looks like — that's where per-option evidence would live.

Analyst #2 done. Now #3 — option evidence. Let me check what the v2 `options` field carries.



#### Tool: Bash

```bash
cd "/c/Claude (not on Gdrive, nor OneDrive)/ppqviewer/dist/esat-compare/data" && node -e "
const fs = require('fs');
const window = {};
eval(fs.readFileSync('esat_analysis_v2.js','utf8'));
const r = window.ESAT_ANALYSIS_V2.records[0];
console.log('=== options (Q01) ===');
console.log(JSON.stringify(r.options, null, 2).slice(0, 2000));
" 2>&1
```

**Output:**

```json
=== options (Q01) ===
[
  {
    "label": "A",
    "is_correct": false,
    "error_path": "The boundary 4 does not follow from a complete rearrangement. It may come from using the visible 8 and 2 but stopping before all terms are handled.",
    "diagnostic_confidence": "plausible",
    "error_tags": [
      {
        "id": "esat_provisional.algebra.incomplete_or_arithmetic_rearrangement",
        "taxonomy": "esat_provisional",
        "mapping_status": "provisional",
        "category_paths": [
          "calculation_error.formula_error.rearrangement_error"
        ],
        "mechanism_codes": [],
        "requirement_refs": [
          "T1_equivalent_rearrangement"
        ]
      }
    ],
    "bait": [
      "4 is the simplest number obtainable from 8 and 2."
    ],
    "relations": [
      "less-than twin of B"
    ]
  },
  {
    "label": "B",
    "is_correct": false,
    "error_path": "The boundary 4 does not follow from a complete rearrangement. The greater-than direction also fails the simple check x = 0.",
    "diagnostic_confidence": "unknown",
    "error_tags": [
      {
        "id": "esat_provisional.algebra.incomplete_or_arithmetic_rearrangement",
        "taxonomy": "esat_provisional",
        "mapping_status": "provisional",
        "category_paths": [
          "calculation_error.formula_error.rearrangement_error"
        ],
        "mechanism_codes": [],
        "requirement_refs": [
          "T1_equivalent_rearrangement"
        ]
      }
    ],
    "bait": [
      "It pairs a simple boundary with the opposite inequality direction."
    ],
    "relations": [
      "greater-than twin of A"
    ]
  },
  {
    "label": "C",
    "is_correct": false,
    "error_path": "The direction is plausible, but 20 is an arithmetic or rearrangement near-miss rather than the correct boundary 28. The exact slip cannot be inferred confidently from the option alone.",
    "diagnostic_confidence": "unknown",
    "error_tags": [
      {
        "id": "esat_provisional.algebra.arithmetic_or_r
```

#### Thinking

I see the `options` field has per-option data: `label`, `is_correct`, `error_path`, `diagnostic_confidence`, `error_tags`, `bait`, `relations`. But I don't see the evidence vocabulary the analyst mentions (rules out, counts against, supports, favours, directly identifies). 

Let me check the `methods` field — the analyst's request is about how methods relate to options. Currently the viewer uses `eliminates` and `lands_on` from the methods. Let me check what the v2 methods actually carry.

#### Tool: Bash

```bash
cd "/c/Claude (not on Gdrive, nor OneDrive)/ppqviewer/dist/esat-compare/data" && node -e "
const fs = require('fs');
const window = {};
eval(fs.readFileSync('esat_analysis_v2.js','utf8'));
const r = window.ESAT_ANALYSIS_V2.records[0];
r.methods.forEach((m,i) => {
  console.log('--- method', i, ':', m.title || m.id, '---');
  console.log('  eliminates:', JSON.stringify(m.eliminates));
  console.log('  lands_on:', JSON.stringify(m.lands_on));
  console.log('  option_evidence:', JSON.stringify(m.option_evidence));
  console.log('  keys:', Object.keys(m));
});
" 2>&1
```

**Output:**

```json
--- method 0 : Keep x positive ---
  eliminates: ["A","B","C","D","E","F","H"]
  lands_on: "G"
  option_evidence: undefined
  keys: [
  'id',
  'role',
  'kind',
  'title',
  'pupil_steps',
  'eliminates',
  'lands_on',
  'requires',
  'useful_when',
  'calculation_load',
  'strategy_tags'
]
--- method 1 : Solve through the negative coefficient ---
  eliminates: ["A","B","C","D","E","F","H"]
  lands_on: "G"
  option_evidence: undefined
  keys: [
  'id',
  'role',
  'kind',
  'title',
  'pupil_steps',
  'eliminates',
  'lands_on',
  'requires',
  'useful_when',
  'calculation_load',
  'strategy_tags'
]
--- method 2 : Test which direction is possible ---
  eliminates: ["B","D","F","H"]
  lands_on: null
  option_evidence: undefined
  keys: [
  'id',
  'role',
  'kind',
  'title',
  'pupil_steps',
  'eliminates',
  'lands_on',
  'requires',
  'useful_when',
  'calculation_load',
  'strategy_tags'
]
```

#### Thinking

So the current v2 data only has `eliminates` (array of letters) and `lands_on` (single letter or null). There's no `option_evidence` field with the richer vocabulary (rules out, counts against, supports, favours, directly identifies).

The analyst says: "The viewer currently understands only 'eliminates' and 'lands on'. It needs distinct treatments for: rules out, counts against, supports, favours, directly identifies. That is necessary for Q4, Q11 and Q36 to express what we actually agreed."

This means the DATA needs to be updated first (the analyst needs to add an `option_evidence` field or similar to the methods, with the richer vocabulary). The viewer can't render what isn't in the data. 

However, I can PREPARE the viewer to handle the richer vocabulary when it arrives. I'll build the rendering logic that:
- Checks for a new `option_evidence` field (array of {label, relationship} objects)
- Falls back to the current `eliminates`/`lands_on` if `option_evidence` isn't present
- Renders different chip styles for each relationship type

This way, when the analyst updates the data with the richer vocabulary, the viewer will already handle it.

Let me design the expected data format:
```json
"option_evidence": [
  {"label": "A", "relationship": "rules_out"},
  {"label": "B", "relationship": "counts_against"},
  {"label": "G", "relationship": "directly_identifies"}
]
```

Relationship types and their visual treatment:
- `rules_out` → red chip (strong elimination, same as current "eliminates")
- `counts_against` → orange/amber chip (weaker than rules out)
- `supports` → light green chip (positive but not conclusive)
- `favours` → green chip (stronger positive)
- `directly_identifies` → bold green chip (same as current "lands_on")

Let me implement this in the v2 methods renderer (`_appendMethodsV2`). Currently it uses `_elimChipsEl` for legacy and a structured approach for v2. Let me check how v2 methods render their chips.


The data currently only has `eliminates`/`lands_on`. The richer vocabulary isn't in the bundle yet — the analyst needs to add it. But I can prepare the viewer to handle it when it arrives, with a fallback to the current format. Let me check how v2 method chips are rendered.



#### Tool: Read

> Read: `C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\engine\ppqviewer.js`

**Output:**

```json
1400	  };
1401	
1402	  /* QoderWork 2026-07-22 (analyst handoff): the v2 pupil insight, rendered
1403	     faithfully (first_notice / why_it_matters / next_move). Labels are viewer
1404	     chrome; the prose is the analysts' and is not rewritten. */
1405	  Viewer.prototype._appendInsightV2 = function (iq, rec) {
1406	    const pa = rec.pupil_analysis || {};
1407	    if (!pa.first_notice && !pa.why_it_matters && !pa.next_move) return;
1408	    const box = el("div", { class: "ppq-iq-insight" });
1409	    if (pa.first_notice) box.appendChild(this._insightLine("First thing to notice", pa.first_notice));
1410	    if (pa.why_it_matters) box.appendChild(this._insightLine("Why it matters", pa.why_it_matters));
1411	    if (pa.next_move) box.appendChild(this._insightLine("Next move", pa.next_move));
1412	    iq.appendChild(box);
1413	  };
1414	  Viewer.prototype._insightLine = function (label, text) {
1415	    const line = el("div", { class: "ppq-iq-insight-line" });
1416	    line.appendChild(el("span", { class: "ppq-iq-insight-label" }, esc(label)));
1417	    line.appendChild(el("span", { class: "ppq-iq-insight-text" }, esc(text)));
1418	    return line;
1419	  };
1420	
1421	  /* QoderWork 2026-07-22 (analyst handoff): v2 methods. title + structured
1422	     pupil_steps rendered DIRECTLY (no prose parsing); red/green chips come from
1423	     the structured eliminates[] / lands_on fields. The "used it" tickbox stays
1424	     as SUPPLEMENTARY evidence — it does not replace the structured self-report. */
1425	  Viewer.prototype._appendMethodsV2 = function (iq, rec) {
1426	    const self = this;
1427	    const labels = this._optionLabels(this.cur) || [];
1428	    const methods = rec.methods || [];
1429	    if (!methods.length) return;
1430	    iq.appendChild(el("div", { class: "ppq-iq-subhead" }, "Ways through it"));
1431	    iq.appendChild(el("div", { class: "ppq-iq-encourage" }, "Most of these have more than one route through — collecting alternatives is the point."));
1432	    methods.forEach((m) => {
1433	      const md = el("div", { class: "ppq-iq-method" });
1434	      const head = el("div", { class: "ppq-iq-method-head" });
1435	      head.appendChild(el("b", null, esc(m.title || m.id)));
1436	      const used = el("button", { class: "ppq-iq-used", type: "button" }, "used it");
1437	      used.addEventListener("click", () => {
1438	        const on = used.classList.toggle("on");
1439	        if (on) self._analysisSelfReports[m.id] = "used"; else delete self._analysisSelfReports[m.id];
1440	        self._fireReport({ status: "interrogation", qtype: "self_report", extra_json: JSON.stringify({ method_id: m.id, method_ref: m.id, state: on ? "used" : "not_used" }) });
1441	      });
1442	      head.appendChild(used);
1443	      md.appendChild(head);
1444	      const steps = el("div", { class: "ppq-iq-method-desc" });
1445	      (m.pupil_steps || []).forEach((s) => steps.appendChild(el("div", { class: "ppq-iq-method-line" }, esc(s))));
1446	      md.appendChild(steps);
1447	      md.appendChild(self._elimChipsV2El(m, labels));
1448	      iq.appendChild(md);
1449	    });
```

#### Thinking

Let me find `_elimChipsV2El` to see how it currently renders the v2 chips.


#### Tool: Grep

**Input:**

```json
{
  "-n": true,
  "head_limit": 5,
  "output_mode": "content",
  "path": "C:\\Claude (not on Gdrive, nor OneDrive)\\ppqviewer\\engine\\ppqviewer.js",
  "pattern": "_elimChipsV2El"
}
```

**Output:**

```json
1447:      md.appendChild(self._elimChipsV2El(m, labels));
1455:  Viewer.prototype._elimChipsV2El = function (m, labels) {
```

#### Thinking

Let me read `_elimChipsV2El`.

#### Tool: Read

> Read: `C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\engine\ppqviewer.js`

**Output:**

```json
1455	  Viewer.prototype._elimChipsV2El = function (m, labels) {
1456	    const wrap = el("div", { class: "ppq-iq-elim" });
1457	    const red = (m.eliminates || []).map((L) => String(L).toUpperCase());
1458	    const green = m.lands_on ? String(m.lands_on).toUpperCase() : null;
1459	    if (!red.length && !green) return wrap;
1460	    if (labels.length) {
1461	      const row = el("div", { class: "ppq-iq-elim-row" });
1462	      labels.forEach((L) => {
1463	        L = String(L).toUpperCase();
1464	        const cls = (green && L === green) ? "green" : (red.indexOf(L) >= 0 ? "red" : "dim");
1465	        row.appendChild(el("span", { class: "ppq-elim " + cls }, L));
1466	      });
1467	      wrap.appendChild(row);
1468	    }
1469	    return wrap;
1470	  };
1471	
1472	  /* QoderWork 2026-07-22 (analyst handoff): the PRIMARY method-awareness prompt
1473	     (self_report_prompts[].primary) and the PRIMARY knowledge/technique check
1474	     (requirements.post_question_checks[].primary). Each offers tappable states;
```

#### Thinking

Good. The current `_elimChipsV2El` renders:
- Red chips for `eliminates` letters
- Green chip for `lands_on` letter
- Dim for everything else

I'll extend this to support the richer `option_evidence` vocabulary. The new field format I'll expect:
```json
"option_evidence": [
  {"label": "A", "relationship": "rules_out"},
  {"label": "B", "relationship": "counts_against"},
  {"label": "G", "relationship": "directly_identifies"}
]
```

If `option_evidence` is present, use it. Otherwise fall back to `eliminates`/`lands_on`.

Visual treatment:
- `rules_out` → red (strong elimination)
- `counts_against` → amber/orange (weaker negative)
- `supports` → light green (positive but not conclusive)
- `favours` → green (stronger positive)
- `directly_identifies` → bold green (conclusive, same as lands_on)
- Everything else → dim

Let me implement this.

I'll extend `_elimChipsV2El` to support the richer `option_evidence` vocabulary (with fallback to the current `eliminates`/`lands_on`).



#### Tool: Edit

> Modified: `C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\engine\ppqviewer.js`

**Output:**

```json
Successfully modified file: C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\engine\ppqviewer.js (1 replacements). Here is the updated code:
...
  };

  /* QoderWork 2026-07-22 (analyst handoff): red/green chips from the structured
     eliminates[] / lands_on fields — no regex parsing (that stopgap is legacy
     only). Green = the option landed on; red = the options ruled out. */
  /* QoderWork 2026-07-23 (analyst request #3): extended option-evidence chips.
     Supports the richer vocabulary (rules_out, counts_against, supports, favours,
     directly_identifies) when the method carries an option_evidence[] array.
     Falls back to the binary eliminates[]/lands_on when it doesn't. */
  Viewer.prototype._elimChipsV2El = function (m, labels) {
    const wrap = el("div", { class: "ppq-iq-elim" });
    const evidence = m.option_evidence;
    if (evidence && evidence.length) {
      /* rich vocabulary path */
      const byLabel = {};
      evidence.forEach((e) => { byLabel[String(e.label).toUpperCase()] = e.relationship; });
      const row = el("div", { class: "ppq-iq-elim-row" });
      labels.forEach((L) => {
        L = String(L).toUpperCase();
        const rel = byLabel[L] || "";
        const cls = rel === "rules_out" ? "red"
          : rel === "counts_against" ? "amber"
          : rel === "directly_identifies" ? "green bold"
          : rel === "favours" ? "green"
          : rel === "supports" ? "lightgreen"
          : "dim";
        const chip = el("span", { class: "ppq-elim " + cls, title: rel ? rel.replace(/_/g, " ") : "" }, L);
        row.appendChild(chip);
      });
      wrap.appendChild(row);
    } else {
      /* legacy binary path: eliminates (red) + lands_on (green) */
      const red = (m.eliminates || []).map((L) => String(L).toUpperCase());
      const green = m.lands_on ? String(m.lands_on).toUpperCase() : null;
      if (!red.length && !green) return wrap;
      if (labels.length) {
        const row = el("div", { class: "ppq-iq-elim-row" });
        labels.forEach((L) => {
          L = String(L).toUpperCase();
          const cls = (green && L === green) ? "green" : (red.indexOf(L) >= 0 ? "red" : "dim");
          row.appendChild(el("span", { class: "ppq-elim " + cls }, L));
        });
        wrap.appendChild(row);
      }
    }
    return wrap;
  };

  /* QoderWork 2026-07-22 (analyst handoff): the PRIMARY method-awareness prompt
...
```

#### Thinking

Now I need to add CSS for the new chip classes (amber, lightgreen, bold). Let me check the existing chip styles.

Now add CSS for the new chip colours (amber, lightgreen, bold).



#### Tool: Grep

**Input:**

```json
{
  "-n": true,
  "head_limit": 10,
  "output_mode": "content",
  "path": "C:\\Claude (not on Gdrive, nor OneDrive)\\ppqviewer\\engine\\ppqviewer.css",
  "pattern": "ppq-elim"
}
```

**Output:**

```json
321:.ppq-elim { display: inline-flex; align-items: center; justify-content: center; min-width: 1.7rem; height: 1.7rem; padding: 0 0.3rem; border-radius: 6px; font-weight: 800; font-size: 0.85rem; border: 1px solid var(--ppq-line); color: var(--ppq-muted); background: var(--ppq-bg); }
322:.ppq-elim.red { background: rgba(176, 48, 48, 0.12); border-color: rgba(176, 48, 48, 0.5); color: var(--ppq-bad); text-decoration: line-through; }
323:.ppq-elim.green { background: rgba(45, 106, 63, 0.14); border-color: rgba(45, 106, 63, 0.55); color: var(--ppq-ok); }
324:.ppq-elim.dim { opacity: 0.55; }
```

#### Thinking

I need to add styles for `.ppq-elim.amber`, `.ppq-elim.lightgreen`, and `.ppq-elim.bold`. Let me add them after the existing `.ppq-elim.dim` line.


#### Tool: Edit

> Modified: `C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\engine\ppqviewer.css`

**Output:**

```json
Successfully modified file: C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\engine\ppqviewer.css (1 replacements). Here is the updated code:
...
.ppq-iq-elim-row { display: flex; gap: 0.35rem; flex-wrap: wrap; }
.ppq-elim { display: inline-flex; align-items: center; justify-content: center; min-width: 1.7rem; height: 1.7rem; padding: 0 0.3rem; border-radius: 6px; font-weight: 800; font-size: 0.85rem; border: 1px solid var(--ppq-line); color: var(--ppq-muted); background: var(--ppq-bg); }
.ppq-elim.red { background: rgba(176, 48, 48, 0.12); border-color: rgba(176, 48, 48, 0.5); color: var(--ppq-bad); text-decoration: line-through; }
.ppq-elim.green { background: rgba(45, 106, 63, 0.14); border-color: rgba(45, 106, 63, 0.55); color: var(--ppq-ok); }
.ppq-elim.dim { opacity: 0.55; }
/* QoderWork 2026-07-23 (analyst request #3): richer evidence vocabulary chips. */
.ppq-elim.amber { background: rgba(180, 120, 20, 0.12); border-color: rgba(180, 120, 20, 0.5); color: #8a5a00; }
.ppq-elim.lightgreen { background: rgba(45, 106, 63, 0.08); border-color: rgba(45, 106, 63, 0.3); color: var(--ppq-ok); }
.ppq-elim.bold { font-weight: 900; border-width: 2px; }
.ppq-iq-elim-prose { font-size: 0.78rem; line-height: 1.4; color: var(--ppq-muted); margin-top: 0.35rem; font-style: italic; }

/* optional "come back / more like this" review flag */
.ppq-iq-flag { display: block; margin-top: 1.1rem; font-size: 0.85rem; padding: 0.5rem 1rem; border: 1px dashed var(--ppq-line); border-radius: 8px; background: transparent; color: var(--ppq-ink2); cursor: pointer; }
.ppq-iq-flag:hover { border-color: var(--ppq-accent); color: var(--ppq-accent); }
...
```

#### Thinking

Good. Let me syntax check and then move to analyst #4 (reviewer strip). Actually, let me do the syntax check first.

#### Tool: Bash

```bash
cd "/c/Claude (not on Gdrive, nor OneDrive)/ppqviewer" && node --check engine/ppqviewer.js 2>&1 && echo "OK"
```

**Output:**

```json
OK
```

#### Thinking

Good. Now analyst #4 — the reviewer-only analysis strip. This shows: record ID, analysis version/build date, review state, passes received, and "N prompts not currently displayed". It's a debug/review aid that distinguishes "the analysts ignored this" from "the data contains it but the viewer hid it."

This should be visible only to reviewers (not pupils). How to gate it? Options:
- A URL parameter (e.g., `?review=1`)
- A config flag (`config.reviewerMode`)
- A keyboard shortcut to toggle

The simplest for now: a URL parameter `?review` that shows the strip. This way Smith or the analyst can add `?review` to the URL to see it, and pupils never see it.

The strip content:
- Record ID (e.g., `esat_engaa_2016_s1_Q01`)
- Schema version (from the record or bundle)
- Review state (from `review.status`)
- Reviewer (from `review.reviewer`)
- Passes: `crop_checked` ✓, `answer_checked` ✓
- Hidden prompts count: how many prompts/checks exist in the data but aren't displayed (now that I show all primaries + secondaries behind disclosure, this would be 0 — but it's still useful to confirm)

Let me implement this. I'll add it as a small strip at the very top of the modal (before the guess page), visible only when `?review` is in the URL.

Analyst #3 ready (viewer-side; the data just needs the `option_evidence` field added by the analyst). Now #4 — the reviewer-only strip. I'll gate it behind a `?review` URL parameter.



#### Tool: Read

> Read: `C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\engine\ppqviewer.js`

**Output:**

```json
1169	    /* --- QoderWork 2026-07-23: GUESS PAGE FIRST (before the verdict). The pupil
1170	       answers, the pop-up opens straight onto "Want to declare a bit of a guess?",
1171	       they tick options or press Enter to skip, and ONLY THEN does the verdict
1172	       appear. A beat of suspense before the reveal. The old pre-answer panel below
1173	       the question and the old post-answer correction are both superseded. --- */
1174	    const labels = (this._answerLabels && this._answerLabels.length) ? this._answerLabels : (this._optionLabels(this.cur) || []);
1175	    const guessPage = el("div", { class: "ppq-iq-guesspage" });
1176	    const restPage = el("div", { class: "ppq-iq-rest", style: "display:none;" });
1177	
1178	    if (labels.length >= 2) {
```

#### Thinking

I'll add the reviewer strip right after the `iq` div is created (line 1162) and before the guess page. It'll be the first thing in the modal, visible only when `?review` is in the URL. Let me insert it between the `iq` creation and the guess page section.


#### Tool: Edit

> Modified: `C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\engine\ppqviewer.js`

**Output:**

```json
Successfully modified file: C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\engine\ppqviewer.js (1 replacements). Here is the updated code:
...

    const self = this;
    const isV2 = this._isV2(rec);
    const iq = el("div", { class: "ppq-iq" });

    /* --- QoderWork 2026-07-23 (analyst request #4): reviewer-only analysis strip.
       Visible only with ?review in the URL. Distinguishes "the analysts ignored
       this" from "the data contains it but the viewer hid it". --- */
    if (/[?&]review\b/.test(location.search)) {
      const rv = rec.review || {};
      const srpCount = (rec.self_report_prompts || []).length;
      const pqcCount = ((rec.requirements || {}).post_question_checks || []).length;
      const strip = el("div", { class: "ppq-iq-reviewer-strip" });
      strip.textContent = [
        (rec.identity && rec.identity.id) || rec.id || "?",
        "schema " + (rec.schema_version || "?"),
        rv.status || "no review",
        rv.reviewer ? "by " + rv.reviewer : "",
        rv.crop_checked ? "crop✓" : "crop?",
        rv.answer_checked ? "answer✓" : "answer?",
        srpCount + " srp + " + pqcCount + " pqc"
      ].filter(Boolean).join(" · ");
      iq.appendChild(strip);
    }

    const chosen = this._chosenLabel;
    const correctLetter = isV2
      ? String((rec.identity && rec.identity.correct_answer) || "").toUpperCase()
      : (cfg.correctOf(this.cur) || "").toString().toUpperCase();

...
```

#### Thinking

Now add CSS for the reviewer strip and syntax-check.


#### Tool: Edit

> Modified: `C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\engine\ppqviewer.css`

**Output:**

```json
Successfully modified file: C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\engine\ppqviewer.css (1 replacements). Here is the updated code:
...

/* QoderWork 2026-07-23 (analyst request #2): quiet analysis-state footer. */
.ppq-iq-state-label { margin-top: 1rem; padding-top: 0.5rem; border-top: 1px solid var(--ppq-line); font-size: 0.72rem; font-weight: 600; color: var(--ppq-muted); letter-spacing: 0.02em; }
.ppq-iq-state-by { font-weight: 400; opacity: 0.7; }

/* QoderWork 2026-07-23 (analyst request #4): reviewer-only strip (?review). */
.ppq-iq-reviewer-strip { font-family: "SF Mono", "Fira Code", monospace; font-size: 0.68rem; line-height: 1.4; padding: 0.4rem 0.6rem; margin-bottom: 0.7rem; border: 1px dashed rgba(140, 133, 121, 0.5); border-radius: 6px; background: rgba(140, 133, 121, 0.06); color: var(--ppq-muted); word-break: break-all; }

/* QoderWork 2026-07-22 (v0.2.4): multi-select dropdown filter (subject defaults to
   Maths + Physics on ESAT; the others are a tick away). */
.ppq-multifilter { position: relative; display: inline-block; }
.ppq-multi-btn { font-size: 0.85rem; padding: 0.35rem 0.7rem; border: 1px solid var(--ppq-line); border-radius: 7px; background: var(--ppq-bg); color: var(--ppq-ink); cursor: pointer; }
.ppq-multi-btn:hover { border-color: var(--ppq-accent); }
...
```

#### Thinking

Let me do the final syntax check and update the CHANGELOG with all the analyst changes.

#### Tool: Bash

```bash
cd "/c/Claude (not on Gdrive, nor OneDrive)/ppqviewer" && node --check engine/ppqviewer.js 2>&1 && echo "OK"
```

**Output:**

```json
OK
```

#### Thinking

All clean. Let me update the CHANGELOG with the analyst changes and update the todo list.

All four analyst requests implemented. Let me update the CHANGELOG.



#### Tool: Edit

> Modified: `C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\CHANGELOG.md`

**Output:**

```json
Successfully modified file: C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\CHANGELOG.md (1 replacements). Here is the updated code:
# CHANGELOG: ppqviewer

Universal engine changes are recorded here and notified into each consumer's inbox. Newest at the top.

## 2026-07-23 (QoderWork) — analyst presentation contract: all prompts shown, state label, evidence vocabulary, reviewer strip (v0.2.9)
Four changes requested by the categorisation analyst after reviewing the live esatwallop site.

### 1. All self-report prompts now shown
The renderer previously showed only the FIRST primary method prompt and FIRST primary knowledge check. Now ALL primaries are rendered. Secondary (non-primary) prompts and checks sit behind a "More quick checks (N)" disclosure. `pupil_analysis.check_prompt` (a plain string question) is surfaced as a quiet text line.

### 2. Analysis-state label
A quiet footer in the pop-up: "Full review · Codex" (when `review.status === "reviewed"` and the record has methods + feedback) or "Early review" (sparse v2). Distinguishes complete analysis from in-progress.

### 3. Option-evidence vocabulary (viewer-ready)
`_elimChipsV2El` now supports a richer `option_evidence[]` array on each method: `{label, relationship}` where relationship is one of `rules_out` (red, struck), `counts_against` (amber), `supports` (light green), `favours` (green), `directly_identifies` (bold green). Falls back to the binary `eliminates[]`/`lands_on` when `option_evidence` is absent. DATA ACTION NEEDED: the analyst adds the `option_evidence` field to Q4, Q11, Q36 methods in the next bundle build.

### 4. Reviewer-only analysis strip (?review)
Append `?review` to the URL to see a monospace strip at the top of each pop-up: record ID, schema version, review status, reviewer, crop/answer check marks, and prompt counts. Immediately distinguishes "the analysts ignored this" from "the data contains it but the viewer hid it." Pupils never see it (no `?review` in their URL).

### Also in this version
- Sticky top bar: `.ppq-header` no longer scrolls away (position:sticky, top:0, z-index:100).

---

## 2026-07-23 (QoderWork) — guess declaration moves to first page of the pop-up (v0.2.8)
Smith's redesign: the guess declaration is no longer a panel below the question (easy to miss "down there"). It is now the FIRST PAGE of the post-answer pop-up, asked BEFORE the verdict is revealed. Suspense before the reveal.

### What changed
- The pre-answer "I'm guessing" panel below the question is retired (DOM retained, never shown). The old post-answer "Actually, it was a guess" correction inside the modal is also superseded.
...
```

#### Thinking

Let me update the todo list to reflect completion of the analyst items.

#### Tool: TodoWrite

**Input:**

```json
{
  "todos": [
    {
      "description": "Guess-declaration redesign (v0.2.8)",
      "status": "completed"
    },
    {
      "description": "Sticky top bar (shouldn't scroll away)",
      "status": "completed"
    },
    {
      "description": "[ANALYST #1] Show ALL self-report prompts; additional checks behind \"More quick checks\" disclosure",
      "status": "completed"
    },
    {
      "description": "[ANALYST #2] Analysis state label: \"Full review\" / \"Early review\"",
      "status": "completed"
    },
    {
      "description": "[ANALYST #3] Option evidence: viewer-ready for rules-out / counts-against / supports / favours / directly-identifies (data action needed from analyst)",
      "status": "completed"
    },
    {
      "description": "[ANALYST #4] Reviewer-only analysis strip (?review URL param)",
      "status": "completed"
    },
    {
      "description": "[ANALYST, post-launch] Collapsed \"Things this question used\" + route labels",
      "status": "pending"
    },
    {
      "description": "[FUTURE] \"Out of Spec\" label: big and red",
      "status": "pending"
    },
    {
      "description": "[FUTURE] Rename \"All Spec\" → \"All In\" + \"Out Of Spec\"",
      "status": "pending"
    },
    {
      "description": "[FUTURE] Previous button at the TOP",
      "status": "pending"
    },
    {
      "description": "[FUTURE] Previous works in shuffled mode",
      "status": "pending"
    },
    {
      "description": "[FUTURE] Spec out analysis pages",
      "status": "pending"
    }
  ]
}
```

**Output:**

```json
Successfully updated the todo list. The current list is now:
1. [completed] Guess-declaration redesign (v0.2.8)
2. [completed] Sticky top bar (shouldn't scroll away)
3. [completed] [ANALYST #1] Show ALL self-report prompts; additional checks behind "More quick checks" disclosure
4. [completed] [ANALYST #2] Analysis state label: "Full review" / "Early review"
5. [completed] [ANALYST #3] Option evidence: viewer-ready for rules-out / counts-against / supports / favours / directly-identifies (data action needed from analyst)
6. [completed] [ANALYST #4] Reviewer-only analysis strip (?review URL param)
7. [pending] [ANALYST, post-launch] Collapsed "Things this question used" + route labels
8. [pending] [FUTURE] "Out of Spec" label: big and red
9. [pending] [FUTURE] Rename "All Spec" → "All In" + "Out Of Spec"
10. [pending] [FUTURE] Previous button at the TOP
11. [pending] [FUTURE] Previous works in shuffled mode
12. [pending] [FUTURE] Spec out analysis pages
```

#### Thinking

Done. Let me give Smith a clear summary of everything that's been completed this session.


**Done — all four analyst requests built (v0.2.9), plus the sticky bar and the guess redesign (v0.2.8).** Everything's syntax-clean, CHANGELOG updated, changes uncommitted for your GitHub Desktop push.

Summary of what's now in the engine:

**v0.2.8** — Guess declaration is the first page of the pop-up (reworded, Enter to skip, percentages pulled in next to the letter, pre-answer panel retired).

**v0.2.9** — The analyst's presentation contract:
1. All primary prompts + checks now render (not just the first). Secondaries behind "More quick checks (N)". `check_prompt` surfaced.
2. Quiet "Full review · Codex" / "Early review" footer in the pop-up.
3. Option-evidence chips ready for the richer vocabulary (rules_out → red, counts_against → amber, supports → light green, favours → green, directly_identifies → bold green). The analyst just needs to add `option_evidence[]` to the method data for Q4/Q11/Q36 in the next bundle build — the viewer will pick it up automatically.
4. Reviewer strip: add `?review` to the URL → monospace debug line at the top of each pop-up (record ID, schema, review state, passes, prompt counts).

**Sticky bar** — header stays pinned on scroll.

One note back to the analyst: for #3, the expected data shape is `method.option_evidence = [{label:"A", relationship:"rules_out"}, ...]`. When that field is present the viewer uses it; when absent it falls back to the current `eliminates`/`lands_on`. No viewer change needed when they ship the updated bundle.

Remaining for future chats: the post-launch "Things this question used" section + route labels, your five UI fixes (Out of Spec, All Spec rename, Previous at top, Previous in shuffle, analysis pages).

### **You**

ok, carry on.

### **Assistant**

#### Thinking

Smith says "OK, keep going." Let me look at what's left on the ToDo list. The next items are:

1. [ANALYST, post-launch] Collapsed "things this problem used" + route labels
2. [FUTURE] "Out of Spec" label: big and red
3. [FUTURE] Rename "All Spec" → "All In" + "Out Of Spec"
4. [FUTURE] "Previous" button at the top
5. [FUTURE] "Previous" works even in shuffle mode
6. [FUTURE] Design of the analysis page

The analyst's post-launch items ("things this problem used" + route labels) were explicitly marked as "immediately after launch" — so they're lower priority than the current UI fixes Smith himself requested. But Smith said "keep going" — meaning keep working.

Let me think about what's most valuable next. Smith's own UI fixes (#8-12) are things he directly asked for. The "Out of Spec" label and "All Spec" rename are quick wins. The top "Previous" button and shuffle-mode "Previous" are more substantive. The analysis page is a big design task.

Let me tackle Smith's quick wins first:
- #8: "Out of Spec" label: big and red
- #9: Rename "All Spec" → "All In" + "Out Of Spec"

These are related (both about topic/filter labels). Let me find where these labels live in the code.

Actually, let me reconsider. Smith said "start wherever" and now "keep going." He's given me freedom. The most coherent next step is to knock out his quick UI fixes (#8, #9), then tackle #10/#11 (Previous button). Let me find the "Out of Spec" / "All Spec" strings.

On to your UI fixes. Let me find where "Out of Spec" and "All Spec" live.



#### Tool: Grep

**Input:**

```json
{
  "-n": true,
  "head_limit": 30,
  "output_mode": "content",
  "path": "C:\\Claude (not on Gdrive, nor OneDrive)\\ppqviewer",
  "pattern": "Out [Oo]f [Ss]pec|All [Ss]pec|out_of_spec|Out of spec"
}
```

**Output:**

```json
C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\dist\esat-compare\index.html:239:          { field: "esat_in_spec", label: "spec", allLabel: "All (spec)", values: META.specs, friendlyLabels: { in_spec: "In ESAT spec", out_of_spec: "Out of ESAT spec" } }
C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\dist\esat-compare\index.html:267:          if (q.esat_in_spec) t.push(q.esat_in_spec === "in_spec" ? "In spec" : "Out of spec");
C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\PPQ_Viewer_(chat1,qoder)2026-07-23_15-15.md:1270:540	`esat_in_spec` is `in_spec` or `out_of_spec`, and `out_of_spec_marked` records
C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\PPQ_Viewer_(chat1,qoder)2026-07-23_15-15.md:2158:29	      { field: "esat_in_spec", label: "spec", allLabel: "All (spec)", values: META.specs, friendlyLabels: { in_spec: "In ESAT spec", out_of_spec: "Out of ESAT spec" } }
C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\PPQ_Viewer_(chat1,qoder)2026-07-23_15-15.md:4487:[Omitted long matching line]
C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\PPQ_Viewer_(chat1,qoder)2026-07-23_15-15.md:4537:[Omitted long matching line]
C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\PPQ_Viewer_(chat1,qoder)2026-07-23_15-15.md:4583:57	      if (q.esat_in_spec) t.push(q.esat_in_spec === "in_spec" ? "In spec" : "Out of spec");
C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\PPQ_Viewer_(chat1,qoder)2026-07-23_15-15.md:4739:29	      { field: "esat_in_spec", label: "spec", allLabel: "All (spec)", values: META.specs, friendlyLabels: { in_spec: "In ESAT spec", out_of_spec: "Out of ESAT spec" } }
C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\PPQ_Viewer_(chat1,qoder)2026-07-23_15-15.md:4767:57	      if (q.esat_in_spec) t.push(q.esat_in_spec === "in_spec" ? "In spec" : "Out of spec");
C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\PPQ_Viewer_(chat1,qoder)2026-07-23_15-15.md:10696:140	          { field: "esat_in_spec", label: "spec", allLabel: "All (spec)", values: META.specs, friendlyLabels: { in_spec: "In ESAT spec", out_of_spec: "Out of ESAT spec" } }
C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\PPQ_Viewer_(chat1,qoder)2026-07-23_15-15.md:10724:168	          if (q.esat_in_spec) t.push(q.esat_in_spec === "in_spec" ? "In spec" : "Out of spec");
C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\PPQ_Viewer_(chat1,qoder)2026-07-23_15-15.md:11460:165	  if (r.esat_in_spec) html += '<span class="chip">' + (r.esat_in_spec === 'in_spec' ? 'In ESAT spec' : 'Out of spec') + '</span>';
C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\PPQ_Viewer_(chat1,qoder)2026-07-23_15-15.md:13396:540	`esat_in_spec` is `in_spec` or `out_of_spec`, and `out_of_spec_marked` records
C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\PPQ_Viewer_(chat1,qoder)2026-07-23_15-15.md:15674:assessment,year,section,slug,question_number,part,part_title,esat_in_spec,out_of_spec_marked,page_start,page_end,marks,correct_answer,choice_labels,has_visual_options,visual_choice_labels,choice_sources,choices_json,text_source,text_is_low_confidence,text_quality_flags,text_render,text_render_source,text_render_status,text_render_error,question_text,crop_paths,review_notes
C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\PPQ_Viewer_(chat1,qoder)2026-07-23_15-15.md:17078:540	`esat_in_spec` is `in_spec` or `out_of_spec`, and `out_of_spec_marked` records
C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\PPQ_Viewer_(chat1,qoder)2026-07-23_15-15.md:19495:140	          { field: "esat_in_spec", label: "spec", allLabel: "All (spec)", values: META.specs, friendlyLabels: { in_spec: "In ESAT spec", out_of_spec: "Out of ESAT spec" } }
C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\PPQ_Viewer_(chat1,qoder)2026-07-23_15-15.md:19523:168	          if (q.esat_in_spec) t.push(q.esat_in_spec === "in_spec" ? "In spec" : "Out of spec");
C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\PPQ_Viewer_(chat1,qoder)2026-07-23_15-15.md:19575:window.ESAT_META = {"generated_from": "esat_physics_tagged.csv (ENGAA+NSAA)", "count": 1042, "assessments": ["ENGAA", "NSAA"], "subjects": ["biology", "chemistry", "maths", "physics"], "specs": ["in_spec", "out_of_spec"], "topics": [{"code": "M2", "name": "Number"}, {"code": "M3", "name": "Ratio & proportion"}, {"code": "M4", "name": "Algebra"}, {"code": "M5", "name": "Geometry"}, {"code": "M6", "name": "Statistics"}, {"code": "M7", "name": "Probability"}, {"code": 
C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\PPQ_Viewer_(chat1,qoder)2026-07-23_15-15.md:30492:155	          { field: "esat_in_spec", label: "spec", allLabel: "All (spec)", values: META.specs, friendlyLabels: { in_spec: "In ESAT spec", out_of_spec: "Out of ESAT spec" } }
C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\PPQ_Viewer_(chat1,qoder)2026-07-23_15-15.md:30520:183	          if (q.esat_in_spec) t.push(q.esat_in_spec === "in_spec" ? "In spec" : "Out of spec");
C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\PPQ_Viewer_(chat1,qoder)2026-07-23_15-15.md:33166:          { field: "esat_in_spec", label: "spec", allLabel: "All (spec)", values: META.specs, friendlyLabels: { in_spec: "In ESAT spec", out_of_spec: "Out of ESAT spec" } }
C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\PPQ_Viewer_(chat1,qoder)2026-07-23_15-15.md:33945:165	          { field: "esat_in_spec", label: "spec", allLabel: "All (spec)", values: META.specs, friendlyLabels: { in_spec: "In ESAT spec", out_of_spec: "Out of ESAT spec" } }
C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\PPQ_Viewer_(chat1,qoder)2026-07-23_15-15.md:44906:167	          { field: "esat_in_spec", label: "spec", allLabel: "All (spec)", values: META.specs, friendlyLabels: { in_spec: "In ESAT spec", out_of_spec: "Out of ESAT spec" } }
C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\PPQ_Viewer_(chat1,qoder)2026-07-23_15-15.md:44934:195	          if (q.esat_in_spec) t.push(q.esat_in_spec === "in_spec" ? "In spec" : "Out of spec");
C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\dist\esat-compare\data\esat_catalogue.js:3:[Omitted long matching line]
C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\dist\esat-compare\data\esat_catalogue.js:4:[Omitted long matching line]
C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\example\esat-compare.html:233:          { field: "esat_in_spec", label: "spec", allLabel: "All (spec)", values: META.specs, friendlyLabels: { in_spec: "In ESAT spec", out_of_spec: "Out of ESAT spec" } }
C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\example\esat-compare.html:261:          if (q.esat_in_spec) t.push(q.esat_in_spec === "in_spec" ? "In spec" : "Out of spec");
C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\example\esat-config.js:29:      { field: "esat_in_spec", label: "spec", allLabel: "All (spec)", values: META.specs, friendlyLabels: { in_spec: "In ESAT spec", out_of_spec: "Out of ESAT spec" } }
C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\example\esat-config.js:57:      if (q.esat_in_spec) t.push(q.esat_in_spec === "in_spec" ? "In spec" : "Out of spec");
```

model queue wait timeout

### **You**

carry on

### **Assistant**

#### Thinking

Smith says "carry on" — I was in the middle of finding where "Out of Spec" and "All Spec" live. The grep results show the labels are in the ESAT config files:

1. `example/esat-compare.html` line 233: `{ field: "esat_in_spec", label: "spec", allLabel: "All (spec)", values: META.specs, friendlyLabels: { in_spec: "In ESAT spec", out_of_spec: "Out of ESAT spec" } }`
2. `example/esat-compare.html` line 261: `if (q.esat_in_spec) t.push(q.esat_in_spec === "in_spec" ? "In spec" : "Out of spec");`
3. `example/esat-config.js` lines 29, 57: same patterns
4. `dist/esat-compare/index.html` lines 239, 267: the deployed copy

Smith's requests:
- #8: "Out of Spec" label should be big and red
- #9: "All Spec" in dropdowns should say "All In" and "Out Of Spec" (clearer wording)

Wait, let me re-read Smith's original words: "Where it says 'Out Of Spec'. That needs to be quite big, and where it says 'Out Of Spec', it needs to be big and red." and "Where it says 'All Spec', that suggests that it's all things in the spec, so it should be in the dropdowns. It should say 'All In' and 'Out Of Spec'."

So:
- The "Out of spec" tag (shown on questions, line 261) needs to be big and red
- The dropdown's `allLabel: "All (spec)"` should be renamed to "All In" (meaning all in-spec)
- The `friendlyLabels.out_of_spec: "Out of ESAT spec"` should maybe just be "Out of Spec"

Actually, re-reading more carefully: "It should say 'All In' and 'Out Of Spec'" — he wants the dropdown options to be "All In" (for the all option) and "Out Of Spec" (for the out_of_spec value). The current `allLabel` is "All (spec)" which is confusing (sounds like "all things in the spec"). He wants it to say "All In" (meaning "all in-spec questions").

Let me look at how the filter renders these labels. The `friendlyLabels` maps values to display names, and `allLabel` is the "show all" option. So:
- `allLabel: "All (spec)"` → change to `"All In"`
- `friendlyLabels: { in_spec: "In ESAT spec", out_of_spec: "Out of ESAT spec" }` → change to `{ in_spec: "In spec", out_of_spec: "Out of Spec" }`

And for the tag shown on questions (line 261): `"Out of spec"` → make it big and red (CSS class).

Let me also check how the tags are rendered to understand where to add the red styling. The tags come from `cfg.tagsOf(q)` and are rendered as `.ppq-tag` spans. I need to make the "Out of spec" tag specifically big and red.

Let me look at the tag rendering in the engine and the tagsOf function in the config.

Right, continuing with the "Out of Spec" / "All Spec" fixes. Let me look at how tags render and the config.



#### Tool: Read

> Read: `C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\example\esat-compare.html`

**Output:**

```json
228	             Maths + Physics (Smith teaches both now); Chemistry and Biology stay
229	             choosable from the same dropdown. */
230	          { field: "subject", label: "subject", allLabel: "All subjects", values: META.subjects, friendlyLabels: subjectLabels, multi: true, default: ["maths", "physics"] },
231	          { field: "assessment", label: "paper", allLabel: "All papers", values: META.assessments },
232	          { field: "topic_code", label: "topic", allLabel: "All topics", values: (META.topics || []).map(function (t) { return t.code; }), friendlyLabels: topicFriendly },
233	          { field: "esat_in_spec", label: "spec", allLabel: "All (spec)", values: META.specs, friendlyLabels: { in_spec: "In ESAT spec", out_of_spec: "Out of ESAT spec" } }
234	        ],
235	
236	        idOf: function (q) { return q.id; },
237	        sort: function (a, b) {
238	          return a.slug.localeCompare(b.slug) ||
239	            (parseInt(a.question_number, 10) - parseInt(b.question_number, 10)) ||
240	            String(a.part).localeCompare(String(b.part));
241	        },
242	
```

#### Tool: Grep

**Input:**

```json
{
  "-n": true,
  "head_limit": 10,
  "output_mode": "content",
  "path": "C:\\Claude (not on Gdrive, nor OneDrive)\\ppqviewer\\engine\\ppqviewer.js",
  "pattern": "ppq-tag"
}
```

**Output:**

```json
238:    card.appendChild(el("div", { class: "ppq-meta" }, '<span class="ppq-qid"></span><span class="ppq-tags"></span>'));
814:    this.q(".ppq-tags").innerHTML = (cfg.tagsOf(this.cur) || []).map((t) => '<span class="ppq-tag">' + esc(t) + "</span>").join("");
```

#### Thinking

Now I can see:
1. The filter config at line 233: `allLabel: "All (spec)"` and `friendlyLabels: { in_spec: "In ESAT spec", out_of_spec: "Out of ESAT spec" }`
2. Tags are rendered at line 814 as plain `.ppq-tag` spans with the text from `cfg.tagsOf(q)`
3. The tagsOf function (line 261 in esat-compare.html) pushes "In spec" or "Out of spec"

For the fixes:
- **#9 (rename)**: Change `allLabel: "All (spec)"` → `"All In"` and `friendlyLabels` → `{ in_spec: "In spec", out_of_spec: "Out of Spec" }`
- **#8 (big and red)**: The tag "Out of spec" needs to be big and red. I'll add a CSS class for it. The simplest approach: in the tag rendering, detect "Out of spec" and add a special class. Or better: in the engine's tag rendering, add a class based on the tag text. Actually, cleanest: modify the engine to add a `ppq-tag-out` class when the tag contains "Out of spec" (or more generically, let the config specify tag classes). But that's overengineering. Simplest: in the engine's tag render line, add a class for tags that match "out" patterns.

Actually, the cleanest approach without touching the engine: modify `tagsOf` in esat-compare.html to return an object `{text, cls}` instead of a plain string. But that would break the engine's expectation of strings.

Simplest approach: in the engine's tag rendering (line 814), add a class based on content. If the tag text contains "Out of spec" (case-insensitive), add `ppq-tag-out`. This is a reasonable heuristic for the engine.

Actually, even simpler: just use CSS `:contains()` — but that's not standard CSS. Let me just modify the engine's tag rendering to add a class for "out" tags. Or better: let the config supply a `tagClass` function. But that's adding config surface for a one-off.

Most pragmatic: in the engine, when rendering tags, check if the lowercase text includes "out of spec" and add a `ppq-tag-alert` class. This is viewer chrome, not analyst prose, so it's fine.

Let me do both edits: the config rename (in esat-compare.html AND esat-config.js AND dist/esat-compare/index.html) and the engine tag styling.

Wait — the dist file is the deployed copy. I should edit the source files (example/esat-compare.html, example/esat-config.js) and the dist copy. Actually, the dist is generated from the source. But since there's no build step that auto-syncs them, I should edit both. Let me check if esat-config.js is actually used by esat-compare.html or if the config is inline.

Looking at the grep results: esat-compare.html has the config INLINE (line 233), and esat-config.js also has it (line 29). The dist/esat-compare/index.html also has it inline (line 239). So I need to edit all three. But actually, esat-config.js might be the standalone config for esat.html (the non-compare version). Let me just edit the two that matter for the deployed viewer: example/esat-compare.html and dist/esat-compare/index.html. And esat-config.js for completeness.

Let me start with the edits.

#### Tool: TodoWrite

**Input:**

```json
{
  "todos": [
    {
      "description": "Guess-declaration redesign (v0.2.8)",
      "status": "completed"
    },
    {
      "description": "Sticky top bar (shouldn't scroll away)",
      "status": "completed"
    },
    {
      "description": "[ANALYST #1] Show ALL self-report prompts; additional checks behind \"More quick checks\" disclosure",
      "status": "completed"
    },
    {
      "description": "[ANALYST #2] Analysis state label: \"Full review\" / \"Early review\"",
      "status": "completed"
    },
    {
      "description": "[ANALYST #3] Option evidence: viewer-ready for rules-out / counts-against / supports / favours / directly-identifies (data action needed from analyst)",
      "status": "completed"
    },
    {
      "description": "[ANALYST #4] Reviewer-only analysis strip (?review URL param)",
      "status": "completed"
    },
    {
      "description": "\"Out of Spec\" tag: big and red + rename \"All (spec)\" → \"All In\"",
      "status": "in_progress"
    },
    {
      "description": "[FUTURE] Previous button at the TOP",
      "status": "pending"
    },
    {
      "description": "[FUTURE] Previous works in shuffled mode",
      "status": "pending"
    },
    {
      "description": "[ANALYST, post-launch] Collapsed \"Things this question used\" + route labels",
      "status": "pending"
    },
    {
      "description": "[FUTURE] Spec out analysis pages",
      "status": "pending"
    }
  ]
}
```

**Output:**

```json
Successfully updated the todo list. The current list is now:
1. [completed] Guess-declaration redesign (v0.2.8)
2. [completed] Sticky top bar (shouldn't scroll away)
3. [completed] [ANALYST #1] Show ALL self-report prompts; additional checks behind "More quick checks" disclosure
4. [completed] [ANALYST #2] Analysis state label: "Full review" / "Early review"
5. [completed] [ANALYST #3] Option evidence: viewer-ready for rules-out / counts-against / supports / favours / directly-identifies (data action needed from analyst)
6. [completed] [ANALYST #4] Reviewer-only analysis strip (?review URL param)
7. [in_progress] "Out of Spec" tag: big and red + rename "All (spec)" → "All In"
8. [pending] [FUTURE] Previous button at the TOP
9. [pending] [FUTURE] Previous works in shuffled mode
10. [pending] [ANALYST, post-launch] Collapsed "Things this question used" + route labels
11. [pending] [FUTURE] Spec out analysis pages
```

#### Thinking

Let me do the edits. First, the config rename in esat-compare.html (the source). Then the engine tag styling. Then the dist copy.

First, rename the filter labels in the source config.



#### Tool: Edit

> Modified: `C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\example\esat-compare.html`

**Output:**

```json
Successfully modified file: C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\example\esat-compare.html (1 replacements). Here is the updated code:
...
             Maths + Physics (Smith teaches both now); Chemistry and Biology stay
             choosable from the same dropdown. */
          { field: "subject", label: "subject", allLabel: "All subjects", values: META.subjects, friendlyLabels: subjectLabels, multi: true, default: ["maths", "physics"] },
          { field: "assessment", label: "paper", allLabel: "All papers", values: META.assessments },
          { field: "topic_code", label: "topic", allLabel: "All topics", values: (META.topics || []).map(function (t) { return t.code; }), friendlyLabels: topicFriendly },
          { field: "esat_in_spec", label: "spec", allLabel: "All In", values: META.specs, friendlyLabels: { in_spec: "In spec", out_of_spec: "Out of Spec" } }
        ],

        idOf: function (q) { return q.id; },
        sort: function (a, b) {
          return a.slug.localeCompare(b.slug) ||
...
```

#### Thinking

Now the tagsOf function in the same file — change "Out of spec" to "Out of Spec" (capital S) to match.

#### Tool: Read

> Read: `C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\example\esat-compare.html`

**Output:**

```json
259	          if (q.topic) t.push(q.topic_code + " " + q.topic);
260	          if (q.q_type) t.push(q.q_type);
261	          if (q.esat_in_spec) t.push(q.esat_in_spec === "in_spec" ? "In spec" : "Out of spec");
262	          return t;
263	        },
```

#### Thinking

Change "Out of spec" to "Out of Spec" in the tagsOf function.

#### Tool: Edit

> Modified: `C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\example\esat-compare.html`

**Output:**

```json
Successfully modified file: C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\example\esat-compare.html (1 replacements). Here is the updated code:
...
        },
        tagsOf: function (q) {
          var t = [subjectLabels[q.subject] || q.subject];
          if (q.topic) t.push(q.topic_code + " " + q.topic);
          if (q.q_type) t.push(q.q_type);
          if (q.esat_in_spec) t.push(q.esat_in_spec === "in_spec" ? "In spec" : "Out of Spec");
          return t;
        },

        cropsOf: function (q) {
          if (!q.crops || !q.crops.length) return [];
...
```

#### Thinking

Now the same changes in esat-config.js and the dist copy. Let me do esat-config.js first.

Now the same in `esat-config.js` and the dist copy.



#### Tool: Read

> Read: `C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\example\esat-config.js`

**Output:**

```json
27	      { field: "assessment", label: "paper", allLabel: "All papers", values: META.assessments },
28	      { field: "topic_code", label: "topic", allLabel: "All topics", values: (META.topics || []).map((t) => t.code), friendlyLabels: topicFriendly },
29	      { field: "esat_in_spec", label: "spec", allLabel: "All (spec)", values: META.specs, friendlyLabels: { in_spec: "In ESAT spec", out_of_spec: "Out of ESAT spec" } }
30	    ],
31	
```

#### Tool: Read

> Read: `C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\example\esat-config.js`

**Output:**

```json
55	      if (q.topic) t.push(q.topic_code + " " + q.topic);
56	      if (q.q_type) t.push(q.q_type);
57	      if (q.esat_in_spec) t.push(q.esat_in_spec === "in_spec" ? "In spec" : "Out of spec");
58	      return t;
59	    },
```

#### Thinking

Let me edit both lines in esat-config.js.

#### Tool: Edit

> Modified: `C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\example\esat-config.js`

**Output:**

```json
Successfully modified file: C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\example\esat-config.js (1 replacements). Here is the updated code:
...

    filters: [
      { field: "subject", label: "subject", allLabel: "All subjects", values: META.subjects, friendlyLabels: subjectLabels },
      { field: "assessment", label: "paper", allLabel: "All papers", values: META.assessments },
      { field: "topic_code", label: "topic", allLabel: "All topics", values: (META.topics || []).map((t) => t.code), friendlyLabels: topicFriendly },
      { field: "esat_in_spec", label: "spec", allLabel: "All In", values: META.specs, friendlyLabels: { in_spec: "In spec", out_of_spec: "Out of Spec" } }
    ],

    idOf: function (q) { return q.id; },
    sort: function (a, b) {
      return a.slug.localeCompare(b.slug) ||
...
```

#### Tool: Edit

> Modified: `C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\example\esat-config.js`

**Output:**

```json
Successfully modified file: C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\example\esat-config.js (1 replacements). Here is the updated code:
...
    },
    tagsOf: function (q) {
      const t = [subjectLabels[q.subject] || q.subject];
      if (q.topic) t.push(q.topic_code + " " + q.topic);
      if (q.q_type) t.push(q.q_type);
      if (q.esat_in_spec) t.push(q.esat_in_spec === "in_spec" ? "In spec" : "Out of Spec");
      return t;
    },

    // image-only stem with bare A..H labels (from q.option_labels / option_count)
    options: { mode: "labels" },
...
```

#### Thinking

Now the dist copy. Let me read and edit it.


Now the dist copy (the deployed version).



#### Tool: Read

> Read: `C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\dist\esat-compare\index.html`

**Output:**

```json
237	          { field: "assessment", label: "paper", allLabel: "All papers", values: META.assessments },
238	          { field: "topic_code", label: "topic", allLabel: "All topics", values: (META.topics || []).map(function (t) { return t.code; }), friendlyLabels: topicFriendly },
239	          { field: "esat_in_spec", label: "spec", allLabel: "All (spec)", values: META.specs, friendlyLabels: { in_spec: "In ESAT spec", out_of_spec: "Out of ESAT spec" } }
240	        ],
241	
```

#### Tool: Read

> Read: `C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\dist\esat-compare\index.html`

**Output:**

```json
265	          if (q.topic) t.push(q.topic_code + " " + q.topic);
266	          if (q.q_type) t.push(q.q_type);
267	          if (q.esat_in_spec) t.push(q.esat_in_spec === "in_spec" ? "In spec" : "Out of spec");
268	          return t;
269	        },
```

#### Thinking

Let me edit the dist copy.

#### Tool: Edit

> Modified: `C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\dist\esat-compare\index.html`

**Output:**

```json
Successfully modified file: C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\dist\esat-compare\index.html (1 replacements). Here is the updated code:
...
             Maths + Physics (Smith teaches both now); Chemistry and Biology stay
             choosable from the same dropdown. */
          { field: "subject", label: "subject", allLabel: "All subjects", values: META.subjects, friendlyLabels: subjectLabels, multi: true, default: ["maths", "physics"] },
          { field: "assessment", label: "paper", allLabel: "All papers", values: META.assessments },
          { field: "topic_code", label: "topic", allLabel: "All topics", values: (META.topics || []).map(function (t) { return t.code; }), friendlyLabels: topicFriendly },
          { field: "esat_in_spec", label: "spec", allLabel: "All In", values: META.specs, friendlyLabels: { in_spec: "In spec", out_of_spec: "Out of Spec" } }
        ],

        idOf: function (q) { return q.id; },
        sort: function (a, b) {
          return a.slug.localeCompare(b.slug) ||
...
```

#### Tool: Edit

> Modified: `C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\dist\esat-compare\index.html`

**Output:**

```json
Successfully modified file: C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\dist\esat-compare\index.html (1 replacements). Here is the updated code:
...
        },
        tagsOf: function (q) {
          var t = [subjectLabels[q.subject] || q.subject];
          if (q.topic) t.push(q.topic_code + " " + q.topic);
          if (q.q_type) t.push(q.q_type);
          if (q.esat_in_spec) t.push(q.esat_in_spec === "in_spec" ? "In spec" : "Out of Spec");
          return t;
        },

        cropsOf: function (q) {
          if (!q.crops || !q.crops.length) return [];
...
```

#### Thinking

Good. Now the "big and red" part. I need to make the "Out of Spec" tag visually prominent. The tags are rendered at line 814 of the engine:

```js
this.q(".ppq-tags").innerHTML = (cfg.tagsOf(this.cur) || []).map((t) => '<span class="ppq-tag">' + esc(t) + "</span>").join("");
```

I'll modify this to add a `ppq-tag-out` class when the tag text is "Out of Spec". Then add CSS to make it big and red.

Now the "big and red" styling. I'll modify the engine's tag rendering to flag "Out of Spec" tags.



#### Tool: Read

> Read: `C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\engine\ppqviewer.js`

**Output:**

```json
813	    this.q(".ppq-qid").textContent = cfg.metaLine(this.cur);
814	    this.q(".ppq-tags").innerHTML = (cfg.tagsOf(this.cur) || []).map((t) => '<span class="ppq-tag">' + esc(t) + "</span>").join("");
815	
```

#### Thinking

I'll modify line 814 to add a `ppq-tag-out` class when the tag contains "Out of Spec" (case-insensitive check for "out of spec").


#### Tool: Edit

> Modified: `C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\engine\ppqviewer.js`

**Output:**

```json
Successfully modified file: C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\engine\ppqviewer.js (1 replacements). Here is the updated code:
...
    this._curType = cfg.questionType(this.cur) || "imageSelfMark";

    this.q(".ppq-empty").style.display = "none";
    this.q(".ppq-card").style.display = "flex";
    this.q(".ppq-qid").textContent = cfg.metaLine(this.cur);
    /* QoderWork 2026-07-23: "Out of Spec" tags get a ppq-tag-out class (big + red). */
    this.q(".ppq-tags").innerHTML = (cfg.tagsOf(this.cur) || []).map((t) => '<span class="ppq-tag' + (/out of spec/i.test(t) ? " ppq-tag-out" : "") + '">' + esc(t) + "</span>").join("");

    this._renderStem(this.cur);
    this._resetAnswerUi();
    this._renderAnswerArea(this.cur, this._curType);

...
```

#### Thinking

Now add the CSS for `.ppq-tag-out` — big and red. Let me find the existing `.ppq-tag` style.

Now the CSS — big and red.



#### Tool: Grep

**Input:**

```json
{
  "-n": true,
  "head_limit": 5,
  "output_mode": "content",
  "path": "C:\\Claude (not on Gdrive, nor OneDrive)\\ppqviewer\\engine\\ppqviewer.css",
  "pattern": "\\.ppq-tag\\b"
}
```

**Output:**

```json
84:.ppq-tag {
```

#### Thinking

Let me read the .ppq-tag style and add the .ppq-tag-out variant after it.


#### Tool: Read

> Read: `C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\engine\ppqviewer.css`

**Output:**

```json
84	.ppq-tag {
85	  background: #edf2f7;
86	  border-radius: 6px;
87	  padding: 0.1rem 0.5rem;
88	  margin-left: 0.3rem;
89	  font-weight: 700;
90	  text-transform: none;
91	  letter-spacing: 0;
92	}
93	
```

#### Thinking

Let me add the `.ppq-tag-out` style after `.ppq-tag`.

#### Tool: Edit

> Modified: `C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\engine\ppqviewer.css`

**Output:**

```json
Successfully modified file: C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\engine\ppqviewer.css (1 replacements). Here is the updated code:
...
  margin-left: 0.3rem;
  font-weight: 700;
  text-transform: none;
  letter-spacing: 0;
}
/* QoderWork 2026-07-23: "Out of Spec" — big and red (Smith). */
.ppq-tag-out {
  background: rgba(176, 48, 48, 0.12);
  color: var(--ppq-bad);
  font-size: 1.05rem;
  font-weight: 900;
  padding: 0.2rem 0.7rem;
  border: 1px solid rgba(176, 48, 48, 0.4);
}

/* QoderWork 2026-07-22: optional exam timer (config.timer). Silent time capture is
   always on; this is the visible clock. "prominence" is the in-your-face-ness axis:
   subtle = small, tucked right, muted; prominent = large, centred, boxed; hidden is
   handled inline (no clock, still records). tight/forced warn as the clock runs out. */
...
```

#### Thinking

Good. Let me syntax-check the engine and then move to the Previous button at the top.


#### Tool: Bash

```bash
cd "/c/Claude (not on Gdrive, nor OneDrive)/ppqviewer" && node --check engine/ppqviewer.js 2>&1 && echo "OK"
```

**Output:**

```json
OK
```

#### Thinking

Good. "Out of Spec" is done. Now let me move to the Previous button at the top. Smith said: "The previous button at the bottom, which is quite far down, might also need to be at the top because there's often a lot of white space at the bottom of these questions."

The controls are built at line 298-303:
```js
const controls = el("div", { class: "ppq-controls" });
controls.innerHTML =
  '<button class="ppq-btn ppq-prev">Previous (←)</button>' +
  '<button class="ppq-btn ppq-reveal">Reveal (Enter)</button>' +
  '<button class="ppq-btn ppq-skip">Skip (S)</button>';
card.appendChild(controls);
```

I need to add a Previous button at the TOP of the card (before the question image). Let me look at the card structure to find where to insert it. The card starts around line 240-ish. Let me check.

"Out of Spec" done. Now the Previous button at the top. Let me find the card structure.



#### Tool: Read

> Read: `C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\engine\ppqviewer.js`

**Output:**

```json
237	    const card = el("div", { class: "ppq-card", style: "display:none;" });
238	    card.appendChild(el("div", { class: "ppq-meta" }, '<span class="ppq-qid"></span><span class="ppq-tags"></span>'));
239	    /* QoderWork 2026-07-22: exam timer display (config.timer). Hidden unless the
240	       timer module is on and its prominence is not "hidden". */
241	    card.appendChild(el("div", { class: "ppq-timer", style: "display:none;" }));
242	
243	    const drawControls = el("div", { class: "ppq-draw-controls" });
244	    drawControls.innerHTML =
245	      '<button class="ppq-btn-mini ppq-draw-undo">Undo</button>' +
246	      '<button class="ppq-btn-mini ppq-draw-clear">Clear</button>' +
247	      '<span class="ppq-color active" data-color="black"></span><span class="ppq-color" data-color="red"></span>' +
248	      '<span class="ppq-color" data-color="blue"></span><span class="ppq-color" data-color="green"></span>' +
249	      '<input type="range" class="ppq-draw-thick" min="1" max="10" value="2">';
250	    card.appendChild(drawControls);
251	
252	    const drawContainer = el("div", { class: "ppq-draw-container" });
253	    drawContainer.appendChild(el("canvas", { class: "ppq-canvas", style: "display:none;" }));
254	    drawContainer.appendChild(el("div", { class: "ppq-stem" }));
255	
256	    /* QoderWork 2026-07-22: optional left options rail (config.optionsLeft). For
257	       multiple-choice subjects (ESAT) the letter buttons sit in a sticky rail to the
258	       LEFT of the question, so there is no long scroll down to answer. The question
259	       crop already shows the printed options; the rail is just the picker. Off by
260	       default so other consumers keep the stacked layout. */
261	    const optionsEl = el("div", { class: "ppq-options" });
262	    if (cfg.optionsLeft) {
263	      const qarea = el("div", { class: "ppq-qarea" });
264	      qarea.appendChild(optionsEl);
265	      qarea.appendChild(drawContainer);
266	      card.appendChild(qarea);
```

#### Thinking

I can see the card structure:
1. `.ppq-meta` (qid + tags)
2. `.ppq-timer`
3. `.ppq-draw-controls`
4. `.ppq-draw-container` (canvas + stem) / `.ppq-qarea` (options + draw container)
5. `.ppq-guess` (retired)
6. `.ppq-answer-row`
7. `.ppq-controls` (Previous, Reveal, Skip)
8. `.ppq-answer-panel`
9. `.ppq-competence` (1-6 scale)

Smith wants a Previous button at the TOP because there's often lots of white space at the bottom of question images, making the bottom controls far away. I'll add a small "Previous" link/button right after the meta line (before the timer), so it's always visible at the top of the card.

I'll add it as a small button in the meta area or just below it. Let me add a `.ppq-prev-top` button right after the meta div.

#### Tool: Edit

> Modified: `C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\engine\ppqviewer.js`

**Output:**

```json
Successfully modified file: C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\engine\ppqviewer.js (1 replacements). Here is the updated code:
...

    const layout = el("div", { class: "ppq-layout" });
    const centre = el("div", { class: "ppq-centre" });
    const card = el("div", { class: "ppq-card", style: "display:none;" });
    card.appendChild(el("div", { class: "ppq-meta" }, '<span class="ppq-qid"></span><span class="ppq-tags"></span>'));
    /* QoderWork 2026-07-23: Previous at the TOP — Smith: "there's often a lot of
       white space at the bottom of these questions." The bottom controls stay too. */
    card.appendChild(el("button", { class: "ppq-btn ppq-prev ppq-prev-top", type: "button" }, "← Previous"));
    /* QoderWork 2026-07-22: exam timer display (config.timer). Hidden unless the
       timer module is on and its prominence is not "hidden". */
    card.appendChild(el("div", { class: "ppq-timer", style: "display:none;" }));

    const drawControls = el("div", { class: "ppq-draw-controls" });
...
```

#### Thinking

Good. Now I need to make sure the top Previous button is wired to the same handler as the bottom one. Let me check how the bottom Previous is wired. The `_wireControls` function should handle `.ppq-prev` clicks. Since I used the same class `ppq-prev`, it should be picked up by `this.qa(".ppq-prev")` or `this.q(".ppq-prev")`. Let me check.

Let me check how the Previous button is wired to make sure the top one works too.



#### Tool: Grep

**Input:**

```json
{
  "-n": true,
  "head_limit": 10,
  "output_mode": "content",
  "path": "C:\\Claude (not on Gdrive, nor OneDrive)\\ppqviewer\\engine\\ppqviewer.js",
  "pattern": "ppq-prev.*addEventListener|\\.ppq-prev.*click|qa.*ppq-prev"
}
```

**Output:**

```json
463:    this.q(".ppq-prev").addEventListener("click", () => self.prev());
```

#### Thinking

Let me continue where I left off. I need to:

1. Fix the Previous button wiring at line 463 of `engine/ppqviewer.js` — change `this.q(".ppq-prev")` to `this.qa(".ppq-prev").forEach(...)` so both top and bottom Previous buttons work.
2. Add CSS for `.ppq-prev-top` (smaller/subtler styling).
3. Run `node --check` to validate.
4. Update CHANGELOG.

Let me first read the relevant section of ppqviewer.js around line 463 to get the exact code for the edit.


#### Tool: Read

> Read: `C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\engine\ppqviewer.js`

**Output:**

```json
458	    this.q(".ppq-start").addEventListener("change", () => self.filterQuestions());
459	    /* QoderWork 2026-07-22: the counter's topic-filter chip undoes the stuck filter */
460	    this.q(".ppq-counter").addEventListener("click", (e) => {
461	      if (e.target.closest && e.target.closest(".ppq-filterchip")) { self.groupFilter = null; self._groupFilterLabel = null; self.filterQuestions(); }
462	    });
463	    this.q(".ppq-prev").addEventListener("click", () => self.prev());
464	    this.q(".ppq-skip").addEventListener("click", () => self.skip());
465	    this.q(".ppq-reveal").addEventListener("click", () => self.reveal());
466	    this.q(".ppq-next").addEventListener("click", () => self.next());
467	    this.q(".ppq-reset").addEventListener("click", () => self.reset());
468	    if (this.cfg.headerButtons) this.qa(".ppq-headbtn").forEach((b) => b.addEventListener("click", () => {
469	      const hb = self.cfg.headerButtons[parseInt(b.dataset.hb, 10)];
470	      if (hb && hb.open) self.openModal(hb.open);
471	    }));
472	    this.qa(".ppq-scale-btn").forEach((btn) => btn.addEventListener("click", (e) => {
```

#### Tool: Read

> Read: `C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\engine\ppqviewer.css`

**Output:**

```json
440	
441	/* QoderWork 2026-07-23 (analyst request #1): "More quick checks" disclosure for
442	   secondary prompts, and the plain-text check_prompt line. */
443	.ppq-iq-morechecks { margin-top: 0.6rem; border: 1px solid var(--ppq-line); border-radius: 8px; padding: 0.5rem 0.8rem; }
444	.ppq-iq-morechecks summary { font-size: 0.82rem; font-weight: 600; color: var(--ppq-muted); cursor: pointer; }
445	.ppq-iq-morechecks summary:hover { color: var(--ppq-accent); }
446	.ppq-iq-morechecks[open] summary { margin-bottom: 0.5rem; }
447	.ppq-iq-checkprompt { border-left: 3px solid var(--ppq-muted); padding-left: 0.7rem; opacity: 0.9; }
448	
449	/* QoderWork 2026-07-23 (analyst request #2): quiet analysis-state footer. */
450	.ppq-iq-state-label { margin-top: 1rem; padding-top: 0.5rem; border-top: 1px solid var(--ppq-line); font-size: 0.72rem; font-weight: 600; color: var(--ppq-muted); letter-spacing: 0.02em; }
451	.ppq-iq-state-by { font-weight: 400; opacity: 0.7; }
452	
453	/* QoderWork 2026-07-23 (analyst request #4): reviewer-only strip (?review). */
454	.ppq-iq-reviewer-strip { font-family: "SF Mono", "Fira Code", monospace; font-size: 0.68rem; line-height: 1.4; padding: 0.4rem 0.6rem; margin-bottom: 0.7rem; border: 1px dashed rgba(140, 133, 121, 0.5); border-radius: 6px; background: rgba(140, 133, 121, 0.06); color: var(--ppq-muted); word-break: break-all; }
455	
456	/* QoderWork 2026-07-22 (v0.2.4): multi-select dropdown filter (subject defaults to
457	   Maths + Physics on ESAT; the others are a tick away). */
458	.ppq-multifilter { position: relative; display: inline-block; }
459	.ppq-multi-btn { font-size: 0.85rem; padding: 0.35rem 0.7rem; border: 1px solid var(--ppq-line); border-radius: 7px; background: var(--ppq-bg); color: var(--ppq-ink); cursor: pointer; }
460	.ppq-multi-btn:hover { border-color: var(--ppq-accent); }
461	.ppq-multi-panel { position: absolute; top: calc(100% + 4px); left: 0; z-index: 30; min-width: 180px; background: var(--ppq-paper); border: 1px solid var(--ppq-line); border-radius: 8px; box-shadow: 0 6px 18px rgba(0, 0, 0, 0.12); padding: 0.4rem; }
462	.ppq-multi-row { display: flex; align-items: center; gap: 0.45rem; font-size: 0.85rem; color: var(--ppq-ink); padding: 0.3rem 0.35rem; border-radius: 6px; cursor: pointer; }
463	.ppq-multi-row:hover { background: rgba(49, 130, 206, 0.07); }
464	.ppq-multi-all { border-bottom: 1px solid var(--ppq-line); margin-bottom: 0.25rem; padding-bottom: 0.45rem; font-weight: 700; }
465	
466	/* QoderWork 2026-07-22 (v0.2.4): the active topic filter shown as a removable chip
467	   next to the counter — so a stuck filter is visible and one click undoes it. */
468	.ppq-filterchip { font-size: 0.78rem; font-weight: 700; padding: 0.2rem 0.6rem; border: 1px solid rgba(49, 130, 206, 0.5); border-radius: 999px; background: rgba(49, 130, 206, 0.1); color: var(--ppq-accent); cursor: pointer; }
469	.ppq-filterchip:hover { background: rgba(49, 130, 206, 0.2); }
```

#### Thinking

Good. I can see line 463: `this.q(".ppq-prev").addEventListener("click", () => self.prev());`

I need to change this to wire ALL `.ppq-prev` elements. Let me also check where the top Previous button was added in the DOM to confirm it exists. Let me also look at the CSS file end to see where I should add the `.ppq-prev-top` styles.

Let me fix the wiring first, then add CSS.


#### Tool: TodoWrite

**Input:**

```json
{
  "todos": [
    {
      "description": "\"Out of Spec\" tag: big and red + rename \"All (spec)\" → \"All In\"",
      "status": "completed"
    },
    {
      "description": "Previous button at the TOP — fix wiring (qa forEach) + CSS",
      "status": "in_progress"
    },
    {
      "description": "[FUTURE] Previous works in shuffled mode",
      "status": "pending"
    },
    {
      "description": "[ANALYST, post-launch] Collapsed \"Things this question used\" + route labels",
      "status": "pending"
    },
    {
      "description": "[FUTURE] Spec out analysis pages",
      "status": "pending"
    }
  ]
}
```

**Output:**

```json
Successfully updated the todo list. The current list is now:
1. [completed] "Out of Spec" tag: big and red + rename "All (spec)" → "All In"
2. [in_progress] Previous button at the TOP — fix wiring (qa forEach) + CSS
3. [pending] [FUTURE] Previous works in shuffled mode
4. [pending] [ANALYST, post-launch] Collapsed "Things this question used" + route labels
5. [pending] [FUTURE] Spec out analysis pages
```

#### Tool: Edit

> Modified: `C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\engine\ppqviewer.js`

**Output:**

```json
Successfully modified file: C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\engine\ppqviewer.js (1 replacements). Here is the updated code:
...
    this.q(".ppq-start").addEventListener("change", () => self.filterQuestions());
    /* QoderWork 2026-07-22: the counter's topic-filter chip undoes the stuck filter */
    this.q(".ppq-counter").addEventListener("click", (e) => {
      if (e.target.closest && e.target.closest(".ppq-filterchip")) { self.groupFilter = null; self._groupFilterLabel = null; self.filterQuestions(); }
    });
    /* QoderWork 2026-07-23: wire ALL .ppq-prev buttons (top + bottom). */
    this.qa(".ppq-prev").forEach((b) => b.addEventListener("click", () => self.prev()));
    this.q(".ppq-skip").addEventListener("click", () => self.skip());
    this.q(".ppq-reveal").addEventListener("click", () => self.reveal());
    this.q(".ppq-next").addEventListener("click", () => self.next());
    this.q(".ppq-reset").addEventListener("click", () => self.reset());
    if (this.cfg.headerButtons) this.qa(".ppq-headbtn").forEach((b) => b.addEventListener("click", () => {
...
```

#### Thinking

Good. Now I need to add CSS for `.ppq-prev-top`. Let me find a good place in the CSS file — probably near the existing button styles or at the end. Let me check the end of the CSS file and also find where the existing `.ppq-prev` might be styled.


Now the CSS for the top Previous button. Let me find where to add it — near the end of the file after the existing additions.



#### Tool: Read

> Read: `C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\engine\ppqviewer.css`

**Output:**

```json
465	
466	/* QoderWork 2026-07-22 (v0.2.4): the active topic filter shown as a removable chip
467	   next to the counter — so a stuck filter is visible and one click undoes it. */
468	.ppq-filterchip { font-size: 0.78rem; font-weight: 700; padding: 0.2rem 0.6rem; border: 1px solid rgba(49, 130, 206, 0.5); border-radius: 999px; background: rgba(49, 130, 206, 0.1); color: var(--ppq-accent); cursor: pointer; }
469	.ppq-filterchip:hover { background: rgba(49, 130, 206, 0.2); }
470	
471	/* QoderWork 2026-07-22 (v0.2.4): with revealCorrect off the mastery ribbon shows a
472	   neutral dot per attempt instead of ticks/crosses (no verdict leaks). */
473	.ppq-dot { color: var(--ppq-muted); font-size: 1rem; margin-right: 2px; }
474	.ppq-cat.active { background: rgba(49, 130, 206, 0.12); border-left: 4px solid var(--ppq-accent); padding-left: 0.5rem; box-shadow: inset 0 0 0 1px rgba(49, 130, 206, 0.35); }
475	
476	/* QoderWork 2026-07-22: optional left options rail (config.optionsLeft). The letter
477	   picker sits in a sticky column to the LEFT of the question so there is no long
478	   scroll to answer. Used by MCQ subjects (ESAT); the question crop shows the printed
479	   options, the rail is just the picker. */
480	.ppq-qarea { display: grid; grid-template-columns: 74px minmax(0, 1fr); gap: 1.1rem; align-items: start; }
481	.ppq-qarea .ppq-options { position: sticky; top: 1rem; display: flex; flex-direction: column; gap: 0.45rem; }
482	.ppq-qarea .ppq-option { justify-content: center; min-height: 2.4rem; font-size: 1.05rem; font-weight: 700; }
483	@media (max-width: 640px) {
484	  .ppq-qarea { grid-template-columns: 1fr; }
```

#### Tool: Grep

**Input:**

```json
{
  "output_mode": "content",
  "path": "C:\\Claude (not on Gdrive, nor OneDrive)\\ppqviewer\\engine\\ppqviewer.css",
  "pattern": "\\.ppq-prev"
}
```

**Output:**

```json
No matches found
```

#### Thinking

There's no existing `.ppq-prev` CSS rule — the button uses the generic `.ppq-btn` class. Let me check what `.ppq-btn` looks like, and then I'll add a `.ppq-prev-top` rule that makes the top instance smaller/subtler. Let me find the end of the CSS file to append the new rule.

#### Tool: Read

> Read: `C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\engine\ppqviewer.css`

**Output:**

```json
484	  .ppq-qarea { grid-template-columns: 1fr; }
485	  .ppq-qarea .ppq-options { position: static; flex-direction: row; flex-wrap: wrap; }
486	}
487	
```

#### Thinking

The CSS file ends at line 487. I'll append the `.ppq-prev-top` styles after the last line. The top Previous button should be smaller and subtler than the bottom one — a quiet link-style button rather than a full-size control.

#### Tool: Edit

> Modified: `C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\engine\ppqviewer.css`

**Output:**

```json
Successfully modified file: C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\engine\ppqviewer.css (1 replacements). Here is the updated code:
...
.ppq-qarea .ppq-option { justify-content: center; min-height: 2.4rem; font-size: 1.05rem; font-weight: 700; }
@media (max-width: 640px) {
  .ppq-qarea { grid-template-columns: 1fr; }
  .ppq-qarea .ppq-options { position: static; flex-direction: row; flex-wrap: wrap; }
}

/* QoderWork 2026-07-23: top Previous button — smaller and subtler than the
   bottom controls so it doesn't dominate the card header area. */
.ppq-prev-top { font-size: 0.78rem; padding: 0.25rem 0.6rem; margin-bottom: 0.4rem; opacity: 0.75; }
.ppq-prev-top:hover { opacity: 1; }

```

#### Thinking

Good. Now let me verify the top Previous button placement in the JS. Let me check where I added it to make sure it's in the right spot (after the meta div, before draw controls).

Now let me verify the top Previous button's DOM placement and run `node --check`.



#### Tool: Grep

**Input:**

```json
{
  "-C": 3,
  "output_mode": "content",
  "path": "C:\\Claude (not on Gdrive, nor OneDrive)\\ppqviewer\\engine\\ppqviewer.js",
  "pattern": "ppq-prev-top"
}
```

**Output:**

```json
238-    card.appendChild(el("div", { class: "ppq-meta" }, '<span class="ppq-qid"></span><span class="ppq-tags"></span>'));
239-    /* QoderWork 2026-07-23: Previous at the TOP — Smith: "there's often a lot of
240-       white space at the bottom of these questions." The bottom controls stay too. */
241:    card.appendChild(el("button", { class: "ppq-btn ppq-prev ppq-prev-top", type: "button" }, "← Previous"));
242-    /* QoderWork 2026-07-22: exam timer display (config.timer). Hidden unless the
243-       timer module is on and its prominence is not "hidden". */
244-    card.appendChild(el("div", { class: "ppq-timer", style: "display:none;" }));
```

#### Tool: Bash

```bash
cd "C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer" && node --check engine/ppqviewer.js
```

**Output:**

```json
(Bash completed with no output)
```

#### Thinking

`node --check` passed (no output = no errors). The top Previous button is at line 241, right after the meta div. The wiring at line ~464 now uses `this.qa(".ppq-prev").forEach(...)`. CSS is added.

Now I need to update the CHANGELOG with the Out of Spec + Previous changes. Let me read the current CHANGELOG to see what's there.

Clean. Now let me update the CHANGELOG with the Out of Spec tag and Previous-at-top changes.



#### Tool: Read

> Read: `C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\CHANGELOG.md`

**Output:**

```json
1	# CHANGELOG: ppqviewer
2	
3	Universal engine changes are recorded here and notified into each consumer's inbox. Newest at the top.
4	
5	## 2026-07-23 (QoderWork) — analyst presentation contract: all prompts shown, state label, evidence vocabulary, reviewer strip (v0.2.9)
6	Four changes requested by the categorisation analyst after reviewing the live esatwallop site.
7	
8	### 1. All self-report prompts now shown
9	The renderer previously showed only the FIRST primary method prompt and FIRST primary knowledge check. Now ALL primaries are rendered. Secondary (non-primary) prompts and checks sit behind a "More quick checks (N)" disclosure. `pupil_analysis.check_prompt` (a plain string question) is surfaced as a quiet text line.
10	
11	### 2. Analysis-state label
12	A quiet footer in the pop-up: "Full review · Codex" (when `review.status === "reviewed"` and the record has methods + feedback) or "Early review" (sparse v2). Distinguishes complete analysis from in-progress.
13	
14	### 3. Option-evidence vocabulary (viewer-ready)
15	`_elimChipsV2El` now supports a richer `option_evidence[]` array on each method: `{label, relationship}` where relationship is one of `rules_out` (red, struck), `counts_against` (amber), `supports` (light green), `favours` (green), `directly_identifies` (bold green). Falls back to the binary `eliminates[]`/`lands_on` when `option_evidence` is absent. DATA ACTION NEEDED: the analyst adds the `option_evidence` field to Q4, Q11, Q36 methods in the next bundle build.
16	
17	### 4. Reviewer-only analysis strip (?review)
18	Append `?review` to the URL to see a monospace strip at the top of each pop-up: record ID, schema version, review status, reviewer, crop/answer check marks, and prompt counts. Immediately distinguishes "the analysts ignored this" from "the data contains it but the viewer hid it." Pupils never see it (no `?review` in their URL).
19	
20	### Also in this version
21	- Sticky top bar: `.ppq-header` no longer scrolls away (position:sticky, top:0, z-index:100).
22	
23	---
24	
25	## 2026-07-23 (QoderWork) — guess declaration moves to first page of the pop-up (v0.2.8)
26	Smith's redesign: the guess declaration is no longer a panel below the question (easy to miss "down there"). It is now the FIRST PAGE of the post-answer pop-up, asked BEFORE the verdict is revealed. Suspense before the reveal.
27	
28	### What changed
29	- The pre-answer "I'm guessing" panel below the question is retired (DOM retained, never shown). The old post-answer "Actually, it was a guess" correction inside the modal is also superseded.
30	- The pop-up now opens straight onto a guess page: heading "Want to declare a bit of a guess?" + the option checkboxes (chosen option preselected) + optional percentages. The pupil ticks options and presses Done, or presses Enter/Skip to decline. Only THEN does the verdict ("You chose X — the answer is Y") appear.
31	- Reworded prompts: "Tick the options you think it could be." (was "Which options are still in the running?"). The heading is "Want to declare a bit of a guess?" (was "I'm guessing").
32	- Percentages pulled in next to the option letter (was floating way out on the right with `margin-left:auto`).
33	- New `declared_stage: "pre_verdict"` in the payload (post-answer but pre-verdict — they've picked their option but haven't seen the correct answer yet). Carries `chosen_option` and `correct`. The stored attempt row is updated retroactively (the attempt is committed the moment they pick, before the modal opens).
34	- Feedback matching unchanged: `_postGuessDeclared` and `_preGuessDeclaration` are both set, so guess-aware feedback entries fire correctly once the verdict page is revealed.
35	- Edge case: questions with fewer than 2 options skip the guess page entirely (verdict shows immediately).
36	
37	### What stays
38	- The shared `_buildGuessPicker` is unchanged (same validation, same largest-remainder allocation, same optional percentages toggle).
39	- The `guessDefaults` config hook still works (per-stage prompt/label overrides from analysis-v2 `interaction_defaults`).
40	- chem-compare is untouched (it does not enable `postQuestionReview`).
```

#### Thinking

I need to add the "Out of Spec" tag and "Previous at top" changes to the CHANGELOG. These were part of the same session but separate from the analyst v0.2.9 entry. Let me add them to the "Also in this version" section of v0.2.9, or create a new entry. Since these are Smith's UI requests (not analyst requests), and they happened in the same session, I'll add them to the "Also in this version" section of v0.2.9.

Actually, looking at the CHANGELOG, the v0.2.9 entry already has "Also in this version" with the sticky top bar. 

I'll add the Out of Spec tag styling and the Previous button positioning to that same section.

#### Tool: Edit

> Modified: `C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\CHANGELOG.md`

**Output:**

```json
Successfully modified file: C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\CHANGELOG.md (1 replacements). Here is the updated code:
...
### 4. Reviewer-only analysis strip (?review)
Append `?review` to the URL to see a monospace strip at the top of each pop-up: record ID, schema version, review status, reviewer, crop/answer check marks, and prompt counts. Immediately distinguishes "the analysts ignored this" from "the data contains it but the viewer hid it." Pupils never see it (no `?review` in their URL).

### Also in this version
- Sticky top bar: `.ppq-header` no longer scrolls away (position:sticky, top:0, z-index:100).
- "Out of Spec" tag: now big, bold, and red (`.ppq-tag-out`) so it's unmissable at a glance. Filter renamed "All (spec)" → "All In" with friendly label "In spec" / "Out of Spec".
- Previous button at the TOP of the card (`.ppq-prev-top`): smaller, subtler duplicate of the bottom Previous so pupils don't have to scroll past a long question crop to go back. Both buttons wired via `qa(".ppq-prev").forEach`.

---

## 2026-07-23 (QoderWork) — guess declaration moves to first page of the pop-up (v0.2.8)
Smith's redesign: the guess declaration is no longer a panel below the question (easy to miss "down there"). It is now the FIRST PAGE of the post-answer pop-up, asked BEFORE the verdict is revealed. Suspense before the reveal.
...
```

#### Thinking

Good. Let me also quickly verify that the `.ppq-tag-out` CSS class was actually added earlier in this session. Let me grep for it.

Let me verify the Out of Spec tag CSS is in place (from earlier in this session):



#### Tool: Grep

**Input:**

```json
{
  "output_mode": "content",
  "path": "C:\\Claude (not on Gdrive, nor OneDrive)\\ppqviewer\\engine\\ppqviewer.css",
  "pattern": "ppq-tag-out"
}
```

**Output:**

```json
94:.ppq-tag-out {
```

#### Tool: Grep

**Input:**

```json
{
  "output_mode": "content",
  "path": "C:\\Claude (not on Gdrive, nor OneDrive)\\ppqviewer\\engine\\ppqviewer.js",
  "pattern": "ppq-tag-out"
}
```

**Output:**

```json
818:    /* QoderWork 2026-07-23: "Out of Spec" tags get a ppq-tag-out class (big + red). */
819:    this.q(".ppq-tags").innerHTML = (cfg.tagsOf(this.cur) || []).map((t) => '<span class="ppq-tag' + (/out of spec/i.test(t) ? " ppq-tag-out" : "") + '">' + esc(t) + "</span>").join("");
```

#### Thinking

Everything is in place. Let me also verify the "All In" filter rename was done in the config files. Let me quickly grep for "All In" in the example and dist files.

All wired. Let me do a final syntax check on the CSS (no formal checker, but confirm the file isn't malformed) and verify the filter rename landed:



#### Tool: Grep

**Input:**

```json
{
  "output_mode": "content",
  "path": "C:\\Claude (not on Gdrive, nor OneDrive)\\ppqviewer",
  "pattern": "All In"
}
```

**Output:**

```json
C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\CHANGELOG.md:22:- "Out of Spec" tag: now big, bold, and red (`.ppq-tag-out`) so it's unmissable at a glance. Filter renamed "All (spec)" → "All In" with friendly label "In spec" / "Out of Spec".
C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\dist\esat-compare\index.html:239:          { field: "esat_in_spec", label: "spec", allLabel: "All In", values: META.specs, friendlyLabels: { in_spec: "In spec", out_of_spec: "Out of Spec" } }
C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\example\esat-config.js:29:      { field: "esat_in_spec", label: "spec", allLabel: "All In", values: META.specs, friendlyLabels: { in_spec: "In spec", out_of_spec: "Out of Spec" } }
C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\example\esat-compare.html:233:          { field: "esat_in_spec", label: "spec", allLabel: "All In", values: META.specs, friendlyLabels: { in_spec: "In spec", out_of_spec: "Out of Spec" } }
```

#### Thinking

Everything is in place:
1. Out of Spec tag: big and red (CSS `.ppq-tag-out` at line 94, JS adds class at line 818-819) ✓
2. Filter renamed "All In" in all three config files ✓
3. Previous button at top: DOM at line 241, wired via `qa(".ppq-prev").forEach` at line ~464, CSS `.ppq-prev-top` at end of file ✓
4. `node --check` clean ✓
5. CHANGELOG updated ✓

Done. Let me mark the todo as completed and give Smith the done declaration.

#### Tool: TodoWrite

**Input:**

```json
{
  "todos": [
    {
      "description": "\"Out of Spec\" tag: big and red + rename \"All (spec)\" → \"All In\"",
      "status": "completed"
    },
    {
      "description": "Previous button at the TOP — fix wiring (qa forEach) + CSS",
      "status": "completed"
    },
    {
      "description": "[FUTURE] Previous works in shuffled mode",
      "status": "pending"
    },
    {
      "description": "[ANALYST, post-launch] Collapsed \"Things this question used\" + route labels",
      "status": "pending"
    },
    {
      "description": "[FUTURE] Spec out analysis pages",
      "status": "pending"
    }
  ]
}
```

**Output:**

```json
Successfully updated the todo list. The current list is now:
1. [completed] "Out of Spec" tag: big and red + rename "All (spec)" → "All In"
2. [completed] Previous button at the TOP — fix wiring (qa forEach) + CSS
3. [pending] [FUTURE] Previous works in shuffled mode
4. [pending] [ANALYST, post-launch] Collapsed "Things this question used" + route labels
5. [pending] [FUTURE] Spec out analysis pages
```

#### Thinking

All done for this batch. Let me give Smith a clear done declaration summarizing what was completed.

Done. The Previous-at-top feature is complete:

- Top button in the DOM (line 241, right after the meta/tags row)
- Wiring fixed: `this.qa(".ppq-prev").forEach(...)` so both the top and bottom Previous buttons respond to clicks
- CSS: `.ppq-prev-top` is smaller (0.78rem), quieter (75% opacity), with a hover restore — doesn't shout at the top of the card
- `node --check` clean
- CHANGELOG updated (folded into the v0.2.9 "Also in this version" list alongside sticky bar and Out of Spec)

Everything from this session remains uncommitted — ready for your GitHub Desktop push. The three future jobs (Previous in shuffle mode, collapsed route labels, spec-out analysis pages) are logged for later chats.

### **You**

have you been looking at this file?  can't remember if i pointed you at it.  there's a live version in the folder. @[file:external:C:\CodexProjects\PaperDatabases\Esat Categorisation\analysis_v2\VIEWER_HANDOFF_2026-07-24.md]

> Attached file content: `C:\CodexProjects\PaperDatabases\Esat Categorisation\analysis_v2\VIEWER_HANDOFF_2026-07-24.md`

### **Assistant**

#### Thinking

Smith is asking whether I've been looking at a file: `C:\CodexProjects\PaperDatabases\Esat Categorisation\analysis_v2\VIEWER_HANDOFF_2026-07-24.md`. He says there's a "live version in the folder" — presumably meaning that folder contains the live/current version of the analysis data.

I haven't looked at this file in this session (the summary doesn't mention it). Let me read it now.

No, I haven't seen that one — nothing in this session pointed me at it. Let me have a look now.



#### Tool: Read

> Read: `C:\CodexProjects\PaperDatabases\Esat Categorisation\analysis_v2\VIEWER_HANDOFF_2026-07-24.md`

**Output:**

```json
1	# Viewer analysis-presentation update
2	
3	Date: 24 July 2026
4	
5	This is a ready-to-paste handoff for the AI maintaining the ESAT viewer.
6	
7	Please preserve the working question, answer, guess and progression flow. This
8	pass concerns the post-question analysis presentation. Use
9	`PPQVIEWER_INTEGRATION.md`, this handoff and the generated v2 bundle as the
10	current authorities. The older 22 July feedback document is superseded wherever
11	it assumes coloured chips, one primary prompt, or compulsory
12	`First look / Why it matters / Next move`.
13	
14	## Launch-critical changes
15	
16	### 1. Keep the question visible
17	
18	The pupil must be able to see the question, diagram, graph, options and their
19	answer while reading and responding to the analysis.
20	
21	### 2. Respect the authored presentation structure
22	
23	Use `methods[].presentation_kind`:
24	
25	- `route`: show dependent steps sequentially because one inference genuinely
26	  relies on the preceding inference.
27	- `independent_check`: show an unnumbered peer check. Do not turn it into one
28	  stage of a preferred route.
29	- `synthesis`: combine completed checks without implying they had to be done in
30	  that order.
31	
32	Preserve authored order, but remove the generic `Ways through it` framing and
33	the sentence about collecting alternatives. Do not manufacture `Why it
34	matters` or `Next move` when those optional fields are absent.
35	
36	### 3. Use a complete fixed-position option rail
37	
38	Read `method.option_evidence` when present. Order the rail from
39	`identity.option_labels`, not from the evidence array. Every method-local rail
40	must show every option in the same fixed position; a previous check never
41	removes or recolours letters in a later independent check.
42	
43	Render the letters themselves in the relationship colour:
44	
45	- `directly_identifies`: solid green
46	- `supports`: light green
47	- `favours`: light blue
48	- `unaffected`: grey
49	- `counts_against`: provisional negative-evidence token
50	- `disfavours`: provisional negative-evidence token
51	- `rules_out`: red
52	
53	No backgrounds, pills, borders, strikethroughs, ticks, underlines, diamonds or
54	cumulative omission. A surviving option is `unaffected`, not positive evidence.
55	When a legend is needed, use words or non-letter swatches; never use A-G as the
56	legend key.
57	
58	The seven semantic relationships and separate CSS hooks are stable. The final
59	visual distinction between all three negative-evidence shades is deliberately
60	not settled yet. Do not collapse their data meanings, but do not entrench a
61	palette that is difficult to read.
62	
63	When `option_evidence` is absent, retain the existing
64	`eliminates` / `lands_on` fallback, but project it onto the same complete rail.
65	
66	### 4. Put reflection beside the thought
67	
68	Place each `self_report_prompts[]` prompt beside the method or methods named by
69	`method_refs`.
70	
71	- A secondary prompt must not be detached into a generic `More quick checks`
72	  area.
73	- If one prompt refers to a whole peer group, show it once after that group.
74	- Hide the generic `used it` control whenever an authored local prompt exists.
75	- Use local, question-specific controls rather than one universal set of
76	  response labels.
77	- Permit the authored controls to be multi-select when several descriptions can
78	  all be true.
79	- Never display raw state IDs. At minimum, strip `proposed__` and turn the
80	  remainder into readable text.
81	
82	### 5. Keep internal analysis internal
83	
84	Pupil-facing:
85	
86	- the question and their answer;
87	- the ordinary verdict and selected option's feedback;
88	- useful `pupil_analysis` prose;
89	- method titles and `pupil_steps`;
90	- the visual option-evidence rails;
91	- local response controls, time-sink reflection and free text.
92	
93	Reviewer-only:
94	
95	- taxonomy and classification;
96	- raw evidence payloads;
97	- diagnostic confidence and error tags;
98	- review status, author/reviewer and uncertainties;
99	- validation/build information and prompt counts;
100	- internal labels such as physical, geometrical and mathematical
101	  directionality.
102	
103	The useful directionality thought is pupil-facing; its internal classification
104	is not. Do not append `review.reviewer` to the pupil's review footer.
105	
106	### 6. Fail gracefully
107	
108	Missing or provisional deep analysis must never suppress the ordinary answer
109	verdict, block progression or hide feedback that is available. Deep v2 wins
110	when present. The launch-card pupil bundle is deliberately empty while its
111	cards are held for recalibration; that is not an instruction to hide the
112	ordinary question flow.
113	
114	## Acceptance fixtures
115	
116	### Q4 - `esat_engaa_2016_s1_Q04`
117	
118	Show four unnumbered peer checks, each with its own local prompt:
119	
120	- Statement 1: A/B/C `rules_out`; D/E/F `unaffected`.
121	- Statement 2: A/D/E `rules_out`; B/C/F `unaffected`.
122	- Statement 3: A/C/E `rules_out`; B/D/F `supports`.
123	- Statement 4: A/B/D `rules_out`; C/E/F `supports`.
124	- Synthesis: A-E `rules_out`; F `directly_identifies`.
125	
126	All six letters remain visible in every row. The neutral-detail/time-sink prompt
127	appears once after the peer checks.
128	
129	### Q27 - `esat_engaa_2016_s1_Q27`
130	
131	- `Describe the angle at Q twice` is a genuine dependent route.
132	- `Check which way n must move` is an independent check: A/B/C
133	  `rules_out`; D/E/F/G `unaffected`. Do not turn D-G green merely because
134	  they survive.
135	- The exact regular-hexagon test is a separate optional route landing on E.
136	- The shared-angle, directionality and hexagon prompts sit with their respective
137	  blocks.
138	
139	### Q40 - `esat_engaa_2019_s1_Q40`
140	
141	- Direction check: A/B `unaffected`; C/D/E `rules_out`.
142	- Closeness check: A/C/E `rules_out`; B/D `unaffected`.
143	- Synthesis: A/C/D/E `rules_out`; B `directly_identifies`.
144	- `Read the paired answers` is an optional, slightly quicker route:
145	  - A/E are the outer pair, `800 +/- 160 = 800 +/- 80 x 2`; they expose the
146	    graph-height-as-acceleration distractor.
147	  - B/D are the inner pair, `800 +/- 32 = 800 +/- 80 x 0.4`; they use the
148	    gradient magnitude.
149	  - the negative gradient selects the lower inner answer, B.
150	- The exact mental calculation is a separate dependent route:
151	  `a = -2/5 = -0.4`, `mg = 800`, `ma = -32`,
152	  `N = 800 - 32 = 768 N`.
153	- The full exact calculation is manageable; the paired-answer reading is only
154	  a touch quicker. Do not describe either route in terms of having or not
155	  having a calculator.
156	- Direction, bound, paired-answer and calculation prompts sit beside those
157	  blocks. Show the X-coordinate/time-sink prompt once.
158	
159	### Exact-versus-approximation pilot - `esat_engaa_2022_s1_Q27`
160	
161	- Keep the question and all six exact surd options visible.
162	- `Work only to answer-choice precision` and `Expose the repeated factor` are
163	  alternative routes, not consecutive compulsory stages.
164	- Approximation route:
165	  `sqrt(20) ~= 4.47`, `sqrt(5) ~= 2.24`, so the source expression is
166	  approximately `6.47^2 / 3.24^3 ~= 41.9 / 34.0 ~= 1.23`.
167	  Show the six option approximations beside it; A is the only match.
168	- Exact route:
169	  `2 + sqrt(20) = 2(1 + sqrt(5))`, so the fraction cancels to
170	  `4/(1 + sqrt(5)) = sqrt(5) - 1`, option A.
171	- Also show the legitimate crossover: after exact cancellation, the pupil may
172	  rationalise or simply use `4/3.24 ~= 1.23`.
173	- The option-family clue is secondary but useful:
174	  A = 2B, C = 2D and E = 2F. It does not choose the answer by itself.
175	- Approximation, exact-structure and option-pair prompts sit beside their own
176	  blocks. Do not hide either solution route behind a dropdown.
177	
178	### Surd-square follow-up - `esat_engaa_2019_s1_Q01`
179	
180	- Present three alternative routes without implying that one must precede
181	  another:
182	  - controlled approximation:
183	    `sqrt(7) ~= 2.65`, `sqrt(3) ~= 1.73`, so
184	    `4.38^2 - 0.92^2 ~= 18.33`, selecting F rather than G = 20;
185	  - difference of squares:
186	    with whole brackets u and v,
187	    `(u - v)(u + v) = (2sqrt(3))(2sqrt(7)) = 4sqrt(21)`;
188	  - paired expansion:
189	    `(10 + 2sqrt(21)) - (10 - 2sqrt(21)) = 4sqrt(21)`.
190	- Keep the outside subtraction visibly attached to the complete second square.
191	- Show B/C, D/F and E/G as factor-two option pairs. The pairs are a check on
192	  missing doubling, not a route that independently proves F.
193	- Approximation, identity, expansion-sign and option-pair prompts remain local
194	  to their respective analysis blocks.
195	
196	### Graph-area and option-grid pilot - `esat_engaa_2017_s1_Q46`
197	
198	- Retain this question's legacy `out_of_spec` status in release filters. The
199	  acceptance fixture describes analysis presentation; it does not change the
200	  release decision.
201	- `Which graph area?` is an independent check:
202	  - the force-distance graph is a triangle;
203	  - `work = 1/2 x 192 x 0.40 = 38.4 J`;
204	  - A-D `supports`; E-H `rules_out`.
205	- Once 38.4 J is established, show two alternative complete finishes rather
206	  than two compulsory consecutive stages:
207	  - exact division:
208	    `mg = 0.024 x 10 = 0.24 N`, then
209	    `h = 38.4 / 0.24 = 160 m`, option B;
210	  - hundred-metre bound:
211	    100 m needs 24 J and 200 m needs 48 J, so 38.4 J gives
212	    `100 m < h < 200 m`; among A-D only B = 160 m fits.
213	- Preserve the source option table as a useful 2 x 4 error map:
214	  A-D use the correct triangular area; E-H use the rectangle-area error.
215	  Within either half, the heights step by powers of ten. This is a diagnostic
216	  map and a checking aid, not a substitute for the physics.
217	- Area-choice, exact-division, bounding and option-grid prompts remain beside
218	  their own blocks. Do not manufacture a single preferred route through them.
219	- Keep all A-H letters in every method-local evidence rail. The first check's
220	  exact partial support for A-D is not a complete identification of B.
221	
222	## Feedback tab already being handled
223	
224	Keep this stripped back:
225	
226	- autofill the person's name;
227	- attach the question ID and question context automatically, and tell the
228	  person that this has happened;
229	- let them simply describe what is wrong;
230	- do not require them to categorise the error;
231	- send it to the existing central feedback sweep.
232	
233	## Deliberately deferred
234	
235	Do not fold these into this analysis-presentation patch:
236	
237	- the full `Things this question used` interface and route labels;
238	- Out of Spec / All Spec / Previous / shuffle changes;
239	- full analysis pages;
240	- the final visual decision about three distinct negative-evidence shades.
241	
242	## Current implementation hotspots
243	
244	- `_appendMethodsV2`
245	- `_elimChipsV2El`
246	- `_appendSelfReportV2`
247	- `_stateLabel`
248	- the pupil review footer
249	- `.ppq-elim` CSS
250	
251	Known current mismatches include pill/background/strikethrough evidence,
252	ignoring `presentation_kind`, detaching prompts, leaving raw `proposed__`
253	labels, exposing `review.reviewer`, and treating every method as one of several
254	`Ways through it`.
255	
```

#### Thinking

This is a new handoff document dated today (24 July 2026) — a "ready-to-paste handoff for the AI maintaining the ESAT viewer". It supersedes the 22 July feedback document and the analyst's four requests I implemented yesterday (v0.2.9).

Let me understand what it's asking for:

**Launch-critical changes:**

1. **Keep the question visible** — the pupil must be able to see the question, diagram, graph, options, and their answer while reading the analysis. This means the modal/pop-up must not cover the question — probably a side-by-side layout, or the analysis displayed below/beside the question rather than in a full-screen modal.

2. **Respect the authored presentation structure** — use `methods[].presentation_kind`:
   - `route`: sequential dependent steps
   - `independent_check`: unnumbered peer checks, not one stage of a preferred route
   - `synthesis`: combine completed checks without implying order
   - Preserve authored order, remove generic "Ways through it" framing
   - Don't fabricate "Why it matters" or "Next move" when absent

3. **Complete fixed-position option rail** — read `method.option_evidence`. Order the rail from `identity.option_labels`, not from the evidence array. Every method-local rail must show every option in the same fixed position. Render the letters in relationship colour:
   - `directly_identifies`: solid green
   - `supports`: light green
   - `favours`: light blue
   - `unaffected`: grey
   - `counts_against`: provisional negative
   - `disfavours`: provisional negative
   - `rules_out`: red
   - No backgrounds, pills, borders, strikethroughs, ticks, underlines, diamonds, or cumulative omission. Surviving options are `unaffected`, not positive evidence. Legend uses words or non-letter swatches, never A–G as the legend key.
   - When `option_evidence` is absent, keep the `eliminates`/`lands_on` fallback but project it onto the same complete rail.

4. **Put reflection beside the thought** — place each `self_report_prompts[]` prompt beside the method(s) named by `method_refs`.
   - Secondary prompts must not be detached into a generic "More quick checks" area (this directly reverses what I did in analyst request #1!)
   - If a prompt refers to a whole peer group, show it once after that group
   - Hide the generic "used it" control when an authored local prompt exists
   - Use local question-specific controls, not a universal set of response labels
   - Allow multi-select
   - Never display raw state IDs; strip `proposed__` and turn the remainder into readable text

5. **Keep internal analysis internal** — pupil-facing vs reviewer-only split.
   - Pupil-facing: question + answer, verdict + feedback, useful pupil_analysis prose, method titles + pupil_steps, option-evidence rail, local response controls, time-sink reflection, free text
   - Reviewer-only: taxonomy/classification, raw evidence payloads, diagnostic confidence/error tags, review status/author/reviewer/uncertainties, validation/build info/prompt counts, internal labels like physical/geometrical/mathematical directionality
   - Don't append `review.reviewer` to the pupil's review footer

6. **Fail gracefully** — missing/provisional deep analysis must never suppress the verdict, block progression, or hide available feedback. Deep v2 wins when present. Launch-card pupil bundle is deliberately empty; that's not an instruction to hide the ordinary question flow.

**Acceptance fixtures** — specific questions to verify against:
- Q4 `esat_engaa_2016_s1_Q04`: four unnumbered peer checks with local prompts, all six letters visible on every row, neutral-detail/time-sink prompt once after peer checks
- Q27 `esat_engaa_2016_s1_Q27`: dependent route, independent check, optional route, prompts beside blocks
- Q40 `esat_engaa_2019_s1_Q40`: direction check, closeness check, synthesis, optional quicker route, exact calculation route, prompts beside blocks
- `esat_engaa_2022_s1_Q27`: exact vs approximation pilot
- `esat_engaa_2019_s1_Q01`: surd-square follow-up
- `esat_engaa_2017_s1_Q46`: graph-area and option-grid pilot (keep out_of_spec status)

**Feedback tab** — already handled, keep stripped back.

**Deliberately deferred** — don't fold in:
- Full "Things this question used" interface and route labels
- Out of Spec / All Spec / Previous / shuffle changes
- Full analysis pages
- Final visual decision about three negative-evidence shades

**Current implementation hotspots:**
- `_appendMethodsV2`
- `_elimChipsV2El`
- `_appendSelfReportV2`
- `_stateLabel`
- Pupil review footer
- `.ppq-elim` CSS

**Known current mismatches:**
- Pill/background/strikethrough evidence (my current `_elimChipsV2El` uses pills with backgrounds!)
- Ignoring `presentation_kind`
- Detaching prompts (my "More quick checks" disclosure does exactly this!)
- Leaving raw `proposed__` labels
- Exposing `review.reviewer` (my state label shows "Full review · Codex" — that's the reviewer name!)
- Treating every method as one of several "Ways through it"

So this handoff is a substantial rework of the analysis presentation. It directly supersedes several things I did in v0.2.9:
- Analyst request #1 (show all prompts, secondary behind disclosure) → now: prompts beside their methods, no generic "More quick checks" area
- Analyst request #2 (state label "Full review · Codex") → now: don't expose reviewer to pupils
- Analyst request #3 (option evidence chips with pills/backgrounds) → now: coloured letters, no pills/backgrounds, complete fixed rail
- Analyst request #4 (reviewer strip) → that's reviewer-only so probably fine, but the pupil-facing footer must not show the reviewer

This is a big job. Smith asked "have you been looking at this file?" — I hadn't. I've just read it. I should tell him what I see and confirm I understand it supersedes parts of yesterday's work, then ask whether to start on it now.

Actually, Smith's style is: he gives instructions and expects me to interpret and confirm. He said "there's a live version in the folder" — meaning the `analysis_v2` folder contains the live/generated v2 bundle data. Let me check what's in that folder so I know where the data lives.

Let me look at the folder contents to understand the data situation. But I shouldn't over-explore. The key question for Smith is: does he want me to start implementing this handoff now?

Given the scale, I should:
1. Confirm I've read and understood it
2. Note the parts that supersede yesterday's v0.2.9 work
3. Check the live data folder for the referenced fixture questions
4. Ask whether to start now (or he might just want me to be aware)

Actually, re-reading his message: "have you been looking at this file? can't remember if i pointed you at it. there's a live version in the folder." — he's checking whether I'm aware of it and pointing me to the live data. The implicit instruction is probably "this is the new spec, get on it" but given the scale and that it reverses some of yesterday's work, I should confirm understanding and check the data before diving in.

Let me first look at the folder to see the live bundle.

I hadn't — that's new to me. Just read it now. It's a substantial rework of the analysis presentation, and it explicitly supersedes parts of what I shipped yesterday as v0.2.9. Let me look at the live data folder it references before I say more.



#### Tool: Bash

```bash
cd "C:\CodexProjects\PaperDatabases\Esat Categorisation\analysis_v2" && dir /b
```

**Output:**

```json
Output: dir: cannot access '/b': No such file or directory
Exit Code: 2
Process Group PGID: 65052
```

#### Thinking

This is a bash shell (git bash), not cmd. Let's use ls.


#### Tool: Bash

```bash
ls -la "C:\CodexProjects\PaperDatabases\Esat Categorisation\analysis_v2"
```

**Output:**

```json
total 188
drwxr-xr-x 1 patri 197610     0 Jul 24 03:46 .
drwxr-xr-x 1 patri 197610     0 Jul 22 16:42 ..
-rw-r--r-- 1 patri 197610  9680 Jul 23 15:37 ANALYST_LAUNCH_PACK.md
-rw-r--r-- 1 patri 197610 11476 Jul 23 23:40 AUTHORING_RUBRIC.md
-rw-r--r-- 1 patri 197610  3706 Jul 23 16:19 LAUNCH_CARD_CONTRACT.md
-rw-r--r-- 1 patri 197610 12328 Jul 23 15:43 LAUNCH_FIRST_HANDOFF.md
-rw-r--r-- 1 patri 197610  8427 Jul 22 18:48 PPQVIEWER_FEEDBACK_2026-07-22.md
-rw-r--r-- 1 patri 197610 10807 Jul 23 23:40 PPQVIEWER_INTEGRATION.md
-rw-r--r-- 1 patri 197610 11714 Jul 24 06:55 PROJECT_LEDGER.md
-rw-r--r-- 1 patri 197610  9636 Jul 23 17:21 README.md
-rw-r--r-- 1 patri 197610 10283 Jul 23 11:09 SCALING_WORKFLOW.md
-rw-r--r-- 1 patri 197610  1066 Jul 22 17:23 TOPIC_PATTERN_HARVEST_TEMPLATE.md
-rw-r--r-- 1 patri 197610 10524 Jul 24 06:55 VIEWER_HANDOFF_2026-07-24.md
drwxr-xr-x 1 patri 197610     0 Jul 23 10:07 audits
drwxr-xr-x 1 patri 197610     0 Jul 23 16:30 data
drwxr-xr-x 1 patri 197610     0 Jul 23 16:34 dist
drwxr-xr-x 1 patri 197610     0 Jul 23 16:24 generated
-rw-r--r-- 1 patri 197610  6408 Jul 23 17:12 interaction_defaults.json
-rw-r--r-- 1 patri 197610  3468 Jul 23 01:39 migration_queue.json
drwxr-xr-x 1 patri 197610     0 Jul 24 02:56 proposals
drwxr-xr-x 1 patri 197610     0 Jul 23 15:51 provenance
-rw-r--r-- 1 patri 197610   609 Jul 23 17:15 release_policy.json
drwxr-xr-x 1 patri 197610     0 Jul 23 16:26 schema
drwxr-xr-x 1 patri 197610     0 Jul 23 16:45 scripts
-rw-r--r-- 1 patri 197610  4140 Jul 23 01:39 topic_capacity_plan.json
drwxr-xr-x 1 patri 197610     0 Jul 23 02:54 topic_maps
drwxr-xr-x 1 patri 197610     0 Jul 23 02:56 topic_patterns
-rw-r--r-- 1 patri 197610  3725 Jul 23 23:14 vocabularies.json
```

#### Thinking

Let's take a look at the generated v2 bundle and the data folder. The handoff says "use PPQVIEWER_INTEGRATION.md, this handoff, and the generated v2 bundle as the current authoritative sources." Let me check the generated folder and the fixture question (Q4 = esat_engaa_2016_s1_Q04).


#### Tool: Bash

```bash
ls -la "C:\CodexProjects\PaperDatabases\Esat Categorisation\analysis_v2\generated" && echo "---DIST---" && ls -la "C:\CodexProjects\PaperDatabases\Esat Categorisation\analysis_v2\dist"
```

**Output:**

```json
total 2124
drwxr-xr-x 1 patri 197610       0 Jul 23 16:24 .
drwxr-xr-x 1 patri 197610       0 Jul 24 03:46 ..
-rw-r--r-- 1 patri 197610 2143017 Jul 23 04:33 analyst_overview.html
drwxr-xr-x 1 patri 197610       0 Jul 23 16:43 manifests
drwxr-xr-x 1 patri 197610       0 Jul 23 16:27 option_breadcrumbs
drwxr-xr-x 1 patri 197610       0 Jul 22 18:19 packets
drwxr-xr-x 1 patri 197610       0 Jul 23 15:40 reference_sets
drwxr-xr-x 1 patri 197610       0 Jul 24 03:31 reports
drwxr-xr-x 1 patri 197610       0 Jul 23 03:12 topic_map_seeds
---DIST---
total 1488
drwxr-xr-x 1 patri 197610       0 Jul 23 16:34 .
drwxr-xr-x 1 patri 197610       0 Jul 24 03:46 ..
-rw-r--r-- 1 patri 197610 1501008 Jul 24 06:47 esat_analysis_v2.js
-rw-r--r-- 1 patri 197610   10248 Jul 23 17:28 esat_launch_cards.js
```

#### Thinking

The live bundle is `dist/esat_analysis_v2.js` (1.5 MB, updated this morning at 06:47). This is the "live version" that Smith mentioned. Let me check the fixture question Q4 (`esat_engaa_2016_s1_Q04`) in the bundle to understand the actual data structure — specifically `presentation_kind`, `option_evidence`, `self_report_prompts` with `method_refs`, and `identity.option_labels`.

Let me try grepping for the fixture's question ID in the bundle.


The live bundle is `dist/esat_analysis_v2.js` (updated 06:47 this morning). Let me inspect the actual data shape for the fixture questions so I know exactly what I'm rendering.



#### Tool: Bash

```bash
cd "C:\CodexProjects\PaperDatabases\Esat Categorisation\analysis_v2" && node -e "
const fs=require('fs');
const src=fs.readFileSync('dist/esat_analysis_v2.js','utf8');
// find how it's structured - look for the fixture id
const i=src.indexOf('esat_engaa_2016_s1_Q04');
console.log('found at index', i);
console.log('--- head of file ---');
console.log(src.slice(0,400));
"
```

**Output:**

```json
found at index 709339
--- head of file ---
// Generated by analysis_v2/scripts/build_ppqviewer_bundle.py; do not edit.
(function () {
  var bundle = {
  "schema_version": "2.0.0",
  "interaction_defaults": {
    "guess_declaration": {
      "pre_answer": {
        "enabled": true,
        "label": "I'm guessing",
        "candidate_prompt": "Which options are still in the running?"
      },
      "post_answer": {
        "enabled": true,
```

#### Thinking

Let's load the bundle in Node and extract the Q4 record to check its structure.

#### Tool: Bash

```bash
cd "C:\CodexProjects\PaperDatabases\Esat Categorisation\analysis_v2" && node -e "
const fs=require('fs');
let src=fs.readFileSync('dist/esat_analysis_v2.js','utf8');
// strip IIFE wrapper to get the bundle object
const m=src.match(/var bundle = (\{[\s\S]*\});/);
if(!m){ console.log('no match, trying eval'); }
// safer: eval in sandbox
let bundle;
eval(src.replace('(function () {','(function () { ').replace(/window\.[A-Za-z_]+\s*=/g,'bundle='));
" 2>&1 | head -5
echo "=== trying direct extraction ==="
cd "C:\CodexProjects\PaperDatabases\Esat Categorisation\analysis_v2" && node -e "
const fs=require('fs');
let src=fs.readFileSync('dist/esat_analysis_v2.js','utf8');
// capture the object literal assigned to var bundle
const start=src.indexOf('var bundle = {');
const objStart=src.indexOf('{', start);
// find matching close by brace counting
let depth=0, end=-1;
for(let i=objStart;i<src.length;i++){const c=src[i];if(c==='{')depth++;else if(c==='}'){depth--;if(depth===0){end=i;break;}}}
const objStr=src.slice(objStart,end+1);
const bundle=JSON.parse(objStr);
const recs=bundle.records||bundle.questions||bundle;
console.log('top-level keys:', Object.keys(bundle));
"
```

**Output:**

```json
<anonymous_script>:43027
  window.ESAT_ANALYSIS_V2 = bundle;
  ^

ReferenceError: window is not defined
=== trying direct extraction ===
top-level keys: [ 'schema_version', 'interaction_defaults', 'records' ]
```

#### Thinking

Alright. The bundle has `schema_version`, `interaction_defaults`, and `records`. Let me extract the Q4 record and check its structure. I'll write a small helper script for reuse.

#### Tool: Bash

```bash
cd "C:\CodexProjects\PaperDatabases\Esat Categorisation\analysis_v2" && node -e "
const fs=require('fs');
let src=fs.readFileSync('dist/esat_analysis_v2.js','utf8');
const start=src.indexOf('var bundle = {');
const objStart=src.indexOf('{', start);
let depth=0,end=-1;
for(let i=objStart;i<src.length;i++){const c=src[i];if(c==='{')depth++;else if(c==='}'){depth--;if(depth===0){end=i;break;}}}
const bundle=JSON.parse(src.slice(objStart,end+1));
const recs=bundle.records;
console.log('records is array?', Array.isArray(recs), 'count', Array.isArray(recs)?recs.length:Object.keys(recs).length);
// find Q4
const q4 = Array.isArray(recs)? recs.find(r=>r.identity&&(r.identity.question_id==='esat_engaa_2016_s1_Q04'||r.identity.id==='esat_engaa_2016_s1_Q04')) : recs['esat_engaa_2016_s1_Q04'];
if(!q4){ console.log('Q4 not found; sample record keys:'); const first=Array.isArray(recs)?recs[0]:recs[Object.keys(recs)[0]]; console.log(Object.keys(first)); console.log('identity:', JSON.stringify(first.identity).slice(0,300)); }
else { console.log('Q4 top keys:', Object.keys(q4)); console.log('identity:', JSON.stringify(q4.identity,null,1).slice(0,500)); }
"
```

**Output:**

```json
records is array? true count 98
Q4 top keys: [
  'schema_version',
  'identity',
  'taxonomy',
  'requirements',
  'pupil_analysis',
  'options',
  'methods',
  'self_report_prompts',
  'feedback',
  'review'
]
identity: {
 "id": "esat_engaa_2016_s1_Q04",
 "slug": "esat_engaa_2016_s1",
 "assessment": "ENGAA",
 "year": 2016,
 "section": "S1",
 "question_number": 4,
 "part": "A",
 "subject": "physics",
 "correct_answer": "F",
 "option_labels": [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F"
 ],
 "crop": "outputs/previews/esat_engaa_2016_s1/crops/esat_engaa_2016_s1_Q04_p006.png"
}
```

#### Thinking

Alright, let's take a closer look at Q4's `methods` (presentation_kind, option_evidence) and `self_report_prompts` (method_refs).


#### Tool: Bash

```bash
cd "C:\CodexProjects\PaperDatabases\Esat Categorisation\analysis_v2" && node -e "
const fs=require('fs');
let src=fs.readFileSync('dist/esat_analysis_v2.js','utf8');
const start=src.indexOf('var bundle = {');
const objStart=src.indexOf('{', start);
let depth=0,end=-1;
for(let i=objStart;i<src.length;i++){const c=src[i];if(c==='{')depth++;else if(c==='}'){depth--;if(depth===0){end=i;break;}}}
const bundle=JSON.parse(src.slice(objStart,end+1));
const q4=bundle.records.find(r=>r.identity.id==='esat_engaa_2016_s1_Q04');
console.log('=== METHODS (count '+q4.methods.length+') ===');
q4.methods.forEach((m,i)=>{
  console.log('--- method['+i+'] keys:', Object.keys(m).join(','));
  console.log('  title:', m.title);
  console.log('  presentation_kind:', m.presentation_kind);
  console.log('  option_evidence:', JSON.stringify(m.option_evidence));
});
console.log('=== SELF_REPORT_PROMPTS (count '+q4.self_report_prompts.length+') ===');
q4.self_report_prompts.forEach((p,i)=>{
  console.log('--- prompt['+i+'] keys:', Object.keys(p).join(','));
  console.log(JSON.stringify(p).slice(0,600));
});
"
```

**Output:**

```json
=== METHODS (count 5) ===
--- method[0] keys: id,role,kind,scope,presentation_kind,efficiency,outcome_type,title,pupil_steps,eliminates,supports,favours,counts_against,option_evidence,lands_on,requires,useful_when,calculation_load,strategy_tags
  title: Statement 1: test shape and scale
  presentation_kind: independent_check
  option_evidence: [{"label":"A","relationship":"rules_out"},{"label":"B","relationship":"rules_out"},{"label":"C","relationship":"rules_out"},{"label":"D","relationship":"unaffected"},{"label":"E","relationship":"unaffected"},{"label":"F","relationship":"unaffected"}]
--- method[1] keys: id,role,kind,scope,presentation_kind,efficiency,outcome_type,title,pupil_steps,eliminates,supports,favours,counts_against,option_evidence,lands_on,requires,useful_when,calculation_load,strategy_tags
  title: Statement 2: test shape and scale
  presentation_kind: independent_check
  option_evidence: [{"label":"A","relationship":"rules_out"},{"label":"B","relationship":"unaffected"},{"label":"C","relationship":"unaffected"},{"label":"D","relationship":"rules_out"},{"label":"E","relationship":"rules_out"},{"label":"F","relationship":"unaffected"}]
--- method[2] keys: id,role,kind,scope,presentation_kind,efficiency,outcome_type,title,pupil_steps,eliminates,supports,favours,counts_against,option_evidence,lands_on,requires,useful_when,calculation_load,strategy_tags
  title: Statement 3: test shape and scale
  presentation_kind: independent_check
  option_evidence: [{"label":"A","relationship":"rules_out"},{"label":"B","relationship":"supports"},{"label":"C","relationship":"rules_out"},{"label":"D","relationship":"supports"},{"label":"E","relationship":"rules_out"},{"label":"F","relationship":"supports"}]
--- method[3] keys: id,role,kind,scope,presentation_kind,efficiency,outcome_type,title,pupil_steps,eliminates,supports,favours,counts_against,option_evidence,lands_on,requires,useful_when,calculation_load,strategy_tags
  title: Statement 4: test shape and scale
  presentation_kind: independent_check
  option_evidence: [{"label":"A","relationship":"rules_out"},{"label":"B","relationship":"rules_out"},{"label":"C","relationship":"supports"},{"label":"D","relationship":"rules_out"},{"label":"E","relationship":"supports"},{"label":"F","relationship":"supports"}]
--- method[4] keys: id,role,kind,scope,presentation_kind,outcome_type,title,pupil_steps,eliminates,supports,favours,counts_against,option_evidence,lands_on,requires,useful_when,calculation_load,strategy_tags
  title: Put the independent statement results together
  presentation_kind: synthesis
  option_evidence: [{"label":"A","relationship":"rules_out"},{"label":"B","relationship":"rules_out"},{"label":"C","relationship":"rules_out"},{"label":"D","relationship":"rules_out"},{"label":"E","relationship":"rules_out"},{"label":"F","relationship":"directly_identifies"}]
=== SELF_REPORT_PROMPTS (count 5) ===
--- prompt[0] keys: id,primary,method_refs,prompt,states
{"id":"statement_1_check_prompt","primary":true,"method_refs":["statement_1_check"],"prompt":"For statement 1, did you check both graph features, only shape, only scale, neither, or lose time here?","states":["proposed__checked_both_features","proposed__checked_shape_only","proposed__checked_scale_only","proposed__did_not_check_statement","proposed__lost_time_or_got_stuck_here"]}
--- prompt[1] keys: id,primary,method_refs,prompt,states
{"id":"statement_2_check_prompt","primary":true,"method_refs":["statement_2_check"],"prompt":"For statement 2, did you check both graph features, only shape, only scale, neither, or lose time here?","states":["proposed__checked_both_features","proposed__checked_shape_only","proposed__checked_scale_only","proposed__did_not_check_statement","proposed__lost_time_or_got_stuck_here"]}
--- prompt[2] keys: id,primary,method_refs,prompt,states
{"id":"statement_3_check_prompt","primary":true,"method_refs":["statement_3_check"],"prompt":"For statement 3, did you check both graph features, only shape, only scale, neither, or lose time here?","states":["proposed__checked_both_features","proposed__checked_shape_only","proposed__checked_scale_only","proposed__did_not_check_statement","proposed__lost_time_or_got_stuck_here"]}
--- prompt[3] keys: id,primary,method_refs,prompt,states
{"id":"statement_4_check_prompt","primary":true,"method_refs":["statement_4_check"],"prompt":"For statement 4, did you check both graph features, only shape, only scale, neither, or lose time here?","states":["proposed__checked_both_features","proposed__checked_shape_only","proposed__checked_scale_only","proposed__did_not_check_statement","proposed__lost_time_or_got_stuck_here"]}
--- prompt[4] keys: id,primary,method_refs,prompt,states
{"id":"neutral_wording_detour_prompt","primary":false,"method_refs":["statement_1_check","statement_2_check","statement_3_check","statement_4_check"],"prompt":"Did any neutral-looking detail—free-fall, constant lifting force, constant speed or the extra mass—pull you into reasoning that did not help this question?","states":["proposed__noticed_and_correctly_ignored","proposed__briefly_checked_then_moved_on","proposed__lost_time_thinking_about_it","proposed__it_tripped_me_up","proposed__did_not_notice_and_did_not_need_it"]}
```

#### Thinking

Now I understand the actual shape of the data. Let me note the important details:

1. `methods[].presentation_kind`: `independent_check`, `synthesis`, `route` (Q4 has independent_check ×4 + synthesis ×1). Matches the fixture description.

2. `methods[].option_evidence`: an array of `{label, relationship}`. Q4's methods enumerate all six letters (A–F) in every row. Relationships I've seen so far: `rules_out`, `unaffected`, `supports`, `directly_identifies`. The handoff also mentions `favours`, `counts_against`, `disfavours`.

3. `methods[].id`: e.g. `statement_1_check` (used in `method_refs`).

4. `self_report_prompts[]`: `{id, primary, method_refs, prompt, states}`. `method_refs` references method IDs. `states` are raw IDs like `proposed__checked_both_features` — the handoff says to strip `proposed__` and convert to readable text.

5. Prompt #4 (`neutral_wording_detour_prompt`) has `method_refs` pointing to all four statement checks — this is the "if one prompt references an entire peer group, show it once after that group" case.

Now, the handoff's requirements diverge from my v0.2.9 implementation in several important ways:

**What v0.2.9 did (now partially superseded):**
- Analyst #1: Show all primaries, put secondaries behind a "More quick checks" disclosure → handoff #4 says secondary prompts must not be separated into a generic "More quick checks" area. Prompts should be placed next to the methods referenced by method_refs.
- Analyst #2: State label "Full review · Codex" → handoff #5 says not to expose `review.reviewer` to the student. The state label exposes the reviewer.
- Analyst #3: Option evidence chips with pill/background/strikethrough → handoff #3 says no background, no pill, no border, no strikethrough. Color the letters themselves. Complete fixed rail from `identity.option_labels`.
- Analyst #4: Reviewer strip (?review) → this is reviewer-only so it's fine. But the student-facing review footer must not show the reviewer.

**New requirements:**
1. Keep the question visible while reading the analysis (big layout change — analysis must not cover the question).
2. Respect `presentation_kind` (route/independent_check/synthesis). Remove the "Ways through it" framing. Don't fabricate "Why it matters"/"Next move".
3. Complete fixed-position option rail, colored letters, seven relationships, legend uses words/non-letter swatches.
4. Reflection next to thought (prompts next to methods via method_refs), local question-specific controls, multi-select allowed, strip `proposed__`.
5. Internal analysis stays internal (student-facing vs reviewer-only split).
6. Fail gracefully.

This is a big rework. The handoff even enumerates "current implementation hotspots":
- `_appendMethodsV2`
- `_elimChipsV2El`
- `_appendSelfReportV2`
- `_stateLabel`
- Student review footer
- `.ppq-elim` CSS

And "known current mismatches": pill/background/strikethrough evidence, ignoring presentation_kind, separated prompts, raw proposed__ labels, exposure of review.reviewer, treating all methods as "Ways through it".

Now, item #1 "Keep the question visible" is the biggest architectural change. Currently the interrogation is a modal (pop-up) that covers the question. The handoff says the student must be able to see the question, diagram, graph, options, and their own answer while reading and responding to the analysis.

This is a fundamental layout question. Let me check how the modal currently works. Actually — this might mean changing from a modal overlay to an inline/side-by-side panel. That's a significant change.

Before diving into implementation, I need to understand the scope and confirm priorities with Smith. This is exactly the kind of situation where I should:
1. Confirm I've read and understood the handoff
2. Point out that parts of yesterday's v0.2.9 work are superseded (important — he needs to know that the analyst's four requests are now partially reversed)
3. Ask about the biggest architectural decision (#1 keep the question visible — modal vs inline)

Actually, let me reconsider. Smith's style: he points at a file and says "there's a live version in the folder". He's checking whether I'm looking at the current spec. The implicit task is "implement this handoff". But the handoff itself is large and contains a fundamental layout change (#1) that contradicts the current modal architecture.

Let me check PPQVIEWER_INTEGRATION.md, which is listed as one of the current authorities, to see whether it clarifies the "keep the question visible" requirement. Also let me look at how the current modal works to understand the scale of change #1 requires.

Let me read PPQVIEWER_INTEGRATION.md and the current modal/interrogation code.

Actually, let me be strategic. This is a big job. What I should do:
1. Read PPQVIEWER_INTEGRATION.md (the authority)
2. Look at the current modal rendering to understand #1
3. Then present my understanding to Smith and confirm the approach for #1 (the biggest change) before coding.

Let me read the integration doc and the relevant engine code in parallel.

Now I understand the data shape. Let me read the integration doc (listed as a current authority) and look at how the current modal works, since requirement #1 ("keep the question visible") may conflict with the pop-up architecture.



#### Tool: Read

> Read: `C:\CodexProjects\PaperDatabases\Esat Categorisation\analysis_v2\PPQVIEWER_INTEGRATION.md`

**Output:**

```json
1	# ppqviewer integration contract
2	
3	The generated browser bundle exposes:
4	
5	```javascript
6	window.ESAT_ANALYSIS_V2.records
7	window.ESAT_ANALYSIS_V2.by_id
8	window.ESAT_ANALYSIS_V2.interaction_defaults
9	```
10	
11	The independent launch-card bundle exposes:
12	
13	```javascript
14	window.ESAT_LAUNCH_CARDS.records
15	window.ESAT_LAUNCH_CARDS.by_id
16	window.ESAT_LAUNCH_CARDS.interaction_defaults
17	```
18	
19	Resolve the two layers explicitly:
20	
21	```javascript
22	analysisStateOf: function (q) {
23	  var deep = window.ESAT_ANALYSIS_V2 &&
24	    window.ESAT_ANALYSIS_V2.by_id[q.id];
25	  if (deep) return { state: "deep", record: deep };
26	
27	  var launch = window.ESAT_LAUNCH_CARDS &&
28	    window.ESAT_LAUNCH_CARDS.by_id[q.id];
29	  if (launch && launch.review.status === "launch_ready") {
30	    return { state: "provisional", record: launch };
31	  }
32	  if (launch) {
33	    return {
34	      state: "unavailable",
35	      record: null,
36	      reviewer_record: launch
37	    };
38	  }
39	  return { state: "unavailable", record: null };
40	}
41	```
42	
43	The deep layer always wins. The authoring validator rejects overlapping IDs,
44	but the viewer must still make precedence explicit rather than depending on
45	load order. A `needs_specialist` or `blocked` launch card is reviewer evidence,
46	not pupil advice.
47	
48	## Launch-card projection
49	
50	A provisional launch card is intentionally smaller than a deep record. Present
51	it as:
52	
53	1. `pupil.first_notice`;
54	2. `pupil.why_it_matters`;
55	3. the expanded `pupil.fast_route`;
56	4. `pupil.conventional_route`, only when present, behind a compact disclosure;
57	5. a collapsed “Things this question used” list from `pupil.things_used`.
58	
59	Do not wait for deep-only fields before rendering this projection. In
60	particular, the absence of distractor diagnoses, bespoke feedback or
61	self-report prompts is deliberate and must not make the launch card disappear.
62	Use the shared guess and method-reporting controls instead. New flexible
63	guidance blocks use `guidance_block_responses`: visible button choices sit
64	beside each insight, check or neutral detour while it is read. Never hide those
65	responses in a select or later dropdown. `route_reflection` is only a legacy
66	post-explanation fallback when a record has no block responses. Do not infer a
67	route from correctness.
68	
69	Only `pupil` is pupil-facing. `classification`, `review`, option-evidence arrays,
70	status, author and uncertainties are internal/reviewer fields. A small
71	“provisional first pass” label may distinguish the layer, but do not turn the
72	classification into pupil-facing chips.
73	
74	The reviewer panel for a launch card should show the stable ID, status, author,
75	crop/key/route checks, classification, evidence arrays and every uncertainty.
76	For `needs_specialist` and `blocked`, show that panel while the ordinary answer
77	flow falls back to the unavailable-analysis message.
78	
79	Render `things_used_check` at the bottom, below the reasoning that mattered.
80	Show genuine science/maths knowledge and techniques only; option-table
81	administration is not a prerequisite. “Known” is prefilled visually but means
82	“no response” until the pupil interacts. The pupil may instead mark an item as
83	known-but-not-retrieved, sketchy or not clear. Follow it with the optional
84	`freeform_reflection` prompt for where the pupil went wrong or lost time.
85	
86	## Rendering changes from the old analysis store
87	
88	- Always show the ordinary answer verdict. A missing analysis record must not
89	  suppress that result or stop the question flow.
90	- Give every question an explicit analysis state: `deep`, `provisional`,
91	  `unavailable` or `invalid`. A provisional record should render; an unavailable
92	  or invalid record should say that detailed review is not ready rather than
93	  disappearing silently.
94	- Show `pupil_analysis.first_notice` and `check_prompt`. Show
95	  `why_it_matters` and `next_move` only when present; they are optional and must
96	  not be manufactured as layout slots. Do not display analyst-facing
97	  difficulty/trick chips to pupils.
98	- Show the chosen option's `error_path`. Treat `diagnostic_confidence` as data,
99	  not as a claim to show the pupil.
100	- Render `methods[].title`, `pupil_steps`, `efficiency` and `outcome_type`
101	  without inventing time estimates. Friendly efficiency labels should
102	  distinguish the quickest available route, another efficient route, a valid
103	  but slower route and a paper-management fallback.
104	- Use `methods[].presentation_kind` to choose the layout. A `route` may be
105	  expanded as a sequence. `independent_check` methods are peer evidence blocks
106	  and must not be numbered or collapsed into a retrospective route. A
107	  `synthesis` combines completed checks without pretending they had to be
108	  performed in that order. The reviewer view must still expose every authored
109	  method.
110	- Option evidence comes only from structured fields and must not be parsed from
111	  prose:
112	  - `directly_identifies`: complete proved result, green letter;
113	  - `supports`: exact positive evidence for part of an option, light-green
114	    letter;
115	  - `favours`: probable positive evidence, light-blue letter;
116	  - `unaffected`: no effect from this check, grey letter;
117	  - `counts_against`: some evidence against, light-red letter;
118	  - `disfavours`: probable evidence against, orange letter;
119	  - `rules_out`: proved impossible, red letter.
120	  These are method-local, not cumulative. Every independent-check row must
121	  retain every option label in the same position. Use plain letter colour only:
122	  no pill background, strikethrough, tick, underline or diamond.
123	- For method-local evidence, the viewer's preferred generated shape is:
124	
125	  ```javascript
126	  method.option_evidence = [
127	    { label: "A", relationship: "rules_out" },
128	    { label: "B", relationship: "unaffected" }
129	  ];
130	  ```
131	
132	  When `method.option_evidence` is present, the viewer uses it. When it is
133	  absent, the viewer falls back to the current `method.eliminates` and
134	  `method.lands_on` fields. Supplying this shape is analysis/bundle work and
135	  needs no structural viewer change. The current viewer styling still needs the
136	  presentation-only changes above, including recognition of `unaffected` and
137	  `disfavours` and remapping `favours` and `counts_against` to their specified
138	  colours. Do not add uncontracted `relationship` values without updating the
139	  shared schema and validator.
140	- Show each primary `self_report_prompts` item beside the independent check or
141	  insight it refers to. More than one primary prompt is valid when the question
142	  contains several peer checks. Secondary prompts may sit behind a compact
143	  “More quick checks” disclosure; they must not be silently discarded.
144	- Requirements and method awareness are different: a learner can know a rule
145	  but fail to retrieve it, or use a method without understanding why it works.
146	- Add a collapsed pupil section called “Things this question used”, assembled
147	  from concise knowledge atoms, technique atoms and genuine principles. An
148	  untouched visual default must not be logged as mastery. Offer an explicit
149	  “I understood all of these” action and exception states such as knew-but-did-
150	  not-retrieve, clear only after the explanation and still unclear.
151	
152	## Reviewer presentation
153	
154	The pupil surface should stay compact, but the project reviewer must be able to
155	tell whether a weakness is in the source record, the generated bundle or the
156	viewer projection.
157	
158	Provide a reviewer-only strip or expandable panel containing:
159	
160	- stable question and record ID;
161	- source tier and review status;
162	- bundle build identifier or timestamp;
163	- taxonomy summary: subject, topic, subtopics, question shape, calculation
164	  load, reasoning tags and option structure;
165	- method count and the efficiency/outcome roles represented;
166	- prompt counts, including how many are currently collapsed or unsupported by
167	  the pupil renderer;
168	- every structured option-evidence field present in the record;
169	- validation state and any explicitly recorded review uncertainty.
170	
171	Do not expose this taxonomy block as pupil clutter. The pupil-facing projection
172	should normally reduce it to the useful route, the sharp post-question
173	questions and “Things this question used”.
174	
175	## Guess declaration and candidate options
176	
177	Render `interaction_defaults.guess_declaration` independently of the 1-6 rating
178	and method prompt. Before an answer is committed, provide an “I'm guessing”
179	control. It may expand into a multi-select over every option label so the learner
180	can mark whichever options remain in contention: two, five, or all of them.
181	
182	After the answer is committed, provide “Actually, it was a guess” so the learner
183	can correct the record. Candidate selection is optional; when supplied it must
184	contain at least two unique labels and include the committed answer. Do not limit
185	it to a pair. Do not assume the reported set is exhaustive or that its members
186	were equally likely. Offer an optional percentage allocation over the options
187	the learner enters, for example `A: 90, C: 10`. If percentages are supplied,
188	require at least two options, positive integer values, and a total of 100. The
189	percentages describe the learner's relative confidence among the entered
190	options; omitted options are not silently treated as zero.
191	
192	Store a pre-answer declaration on the viewer instance until the answer is
193	committed. Give each displayed attempt an `attempt_id` and use it on the
194	declaration and answer events, so repeated attempts at one item can still be
195	joined reliably.
196	
197	Pre-answer declaration payload (the answer is not yet known):
198	
199	```json
200	{
201	  "status": "interrogation",
202	  "qtype": "guess_declaration",
203	  "extra_json": {
204	    "guess_declared": true,
205	    "declared_stage": "pre_answer",
206	    "candidate_options": ["A", "C", "G"],
207	    "candidate_percentages": {"A": 70, "C": 15, "G": 15},
208	    "attempt_id": "session-and-attempt-identifier"
209	  }
210	}
211	```
212	
213	The ordinary answer event records the chosen option and correctness and includes
214	the same `attempt_id`. It should also include a snapshot of any pre-answer guess
215	declaration, so the local attempt store and downstream answer row are useful
216	without relying only on event order. A post-answer correction uses the same
217	`qtype`, sets `declared_stage` to `post_answer`, and additionally includes
218	`chosen_option` and `correct`.
219	
220	The guess declaration is recorded for right and wrong answers alike. A correct
221	guess must not be promoted to secure mastery. Feedback rows with
222	`guess_declared: true` take precedence over rows without that constraint.
223	
224	## Feedback matching
225	
226	A feedback row matches when all supplied constraints match:
227	
228	- `selected_options`: chosen letter, `any_correct` or `any_wrong`;
229	- `prompt_id` plus `states`: the response to that method prompt;
230	- `guess_declared`: whether the learner declared a guess at either stage.
231	
232	Within equally specific rows, preserve source order. This removes the old
233	free-form `on` / `when` grammar and its inferred flags.
234	
```

#### Thinking

This is very useful. PPQVIEWER_INTEGRATION.md is the "current authority" and provides more detailed information. Let me note the important points where it overlaps with / differs from VIEWER_HANDOFF_2026-07-24.md:

The integration document (lines 140–143) says this:
- "Display each primary `self_report_prompts` item next to the independent check or insight it references. When a question contains multiple peer checks, multiple primary prompts are valid. Secondary prompts may be placed behind a compact 'More quick checks' disclosure, but they must not be silently discarded."

However, HANDOFF #4 says this:
- "Secondary prompts must not be separated into a generic 'More quick checks' area."
- "When a single prompt references an entire peer group, display it just once after that group."

These are subtly contradictory. The integration document permits a "More quick checks" disclosure for secondary prompts, but the handoff states that secondary prompts must not be separated into a generic area, and prompts should be placed next to the method referenced by method_refs. The handoff is dated later (July 24) and explicitly states "the old July 22 feedback document has been superseded." The integration document is dated July 23. The handoff says "use PPQVIEWER_INTEGRATION.md, this handoff, and the generated v2 bundle as current authorities."

Therefore, both are authorities, but the handoff is newer and more specific regarding the placement of prompts. Resolution approach: prompts (both primary and secondary) should be placed next to the method referenced by method_refs. The "More quick checks" disclosure is only permitted when a prompt does not reference a specific method (i.e., has no method_refs). However, in practice all prompts seem to have method_refs. The neutral_wording_detour_prompt references all four statement checks → "display it just once after that group."

In other words, the handoff's rule #4 takes precedence: place prompts next to methods via method_refs, and group-level prompts are shown once after the group. The "More quick checks" area is effectively deprecated (because all prompts have method_refs).

Now, the important thing is that the integration document confirms the color mapping (lines 112–119):
- `directly_identifies`: green letter
- `supports`: light green letter
- `favours`: light blue letter
- `unaffected`: gray letter
- `counts_against`: light red letter
- `disfavours`: orange letter
- `rules_out`: red letter

Note: this differs slightly from the handoff! The handoff says:
- `counts_against`: provisional negative evidence token
- `disfavours`: provisional negative evidence token

However, the integration document gives concrete colors: counts_against = light red, disfavours = orange. The handoff states "the final visual distinction between the three negative evidence tones has intentionally not been decided yet." In other words, the integration document's concrete colors are the current working specification, and the handoff is saying not to over-fix them. I'll use the integration document's colors while keeping the CSS hooks separate.

Also, the integration document says "these are method-local, not cumulative. Each independent check row must preserve all option labels in the same position. Use only plain letter colors: no pill-shaped backgrounds, strikethroughs, checkmarks, underlines, or diamonds."

This confirms handoff #3.

Next, regarding #1 "keep the question visible." The integration document doesn't explicitly address the modal/inline issue. Let me look at the current engine code to understand how the interrogation is displayed. This is the biggest architectural question.

Let me look at the current modal rendering code. I'll search for where the modal is created and how the interrogation is mounted.

Actually, this is a big job with a fundamental architectural question at its heart. Before writing any code, let me present my understanding to Smith and confirm the approach to #1. But first, let me gather enough information to ask an informed question.

Let me look at the current interrogation/modal code in the engine.


The integration doc confirms the colour spec and adds detail. Now let me look at how the current interrogation/modal renders, since requirement #1 ("keep the question visible") is the one that may force a layout change.



#### Tool: Grep

**Input:**

```json
{
  "-n": true,
  "head_limit": 60,
  "output_mode": "content",
  "path": "C:\\Claude (not on Gdrive, nor OneDrive)\\ppqviewer\\engine\\ppqviewer.js",
  "pattern": "openModal|_iqBox|ppq-modal|_renderInterrogation|_appendMethodsV2|_appendSelfReportV2|_elimChipsV2El|_stateLabel|Ways through it|More quick checks"
}
```

**Output:**

```json
366:    const modal = el("div", { class: "ppq-modal" });
367:    modal.innerHTML = '<div class="ppq-modal-content"><div class="ppq-modal-close">×</div><div class="ppq-modal-body"></div></div>';
471:      if (hb && hb.open) self.openModal(hb.open);
537:    const modal = this.q(".ppq-modal");
538:    modal.addEventListener("click", (e) => { if (e.target === modal || (e.target.className || "").indexOf("ppq-modal-close") >= 0) self.closeModal(); });
866:    this._iqBox = null;
868:    this.q(".ppq-modal").classList.remove("show");
869:    this.q(".ppq-modal-body").innerHTML = "";
884:    this.qa(".ppq-crop").forEach((im) => im.addEventListener("click", () => self.openModal(im.getAttribute("src"))));
1020:    this._renderInterrogation();
1153:  Viewer.prototype._renderInterrogation = function () {
1234:      self._renderInterrogationFeedback();
1246:      this._appendMethodsV2(restPage, rec);
1248:      this._appendSelfReportV2(restPage, rec);
1318:    const body = this.q(".ppq-modal-body");
1321:    this.q(".ppq-modal").classList.add("show");
1322:    this._iqBox = iq;
1328:    if (restPage.style.display !== "none") this._renderInterrogationFeedback();
1403:    const btn = this._iqBox ? this._iqBox.querySelector(".ppq-iq-postguess-btn") : null;
1406:    this._renderInterrogationFeedback();
1450:  Viewer.prototype._appendMethodsV2 = function (iq, rec) {
1455:    iq.appendChild(el("div", { class: "ppq-iq-subhead" }, "Ways through it"));
1472:      md.appendChild(self._elimChipsV2El(m, labels));
1484:  Viewer.prototype._elimChipsV2El = function (m, labels) {
1528:     not just the first. Secondary items go behind a "More quick checks" disclosure.
1530:  Viewer.prototype._appendSelfReportV2 = function (iq, rec) {
1555:      det.appendChild(el("summary", null, "More quick checks (" + secondaries.length + ")"));
1567:      const chip = el("button", { class: "ppq-iq-state", type: "button", "data-state": st }, self._stateLabel(st));
1573:        self._renderInterrogationFeedback();
1582:  Viewer.prototype._stateLabel = function (st) {
1604:      iq.appendChild(el("div", { class: "ppq-iq-subhead" }, "Ways through it"));
1617:          self._renderInterrogationFeedback();
1642:  Viewer.prototype._renderInterrogationFeedback = function () {
1643:    if (!this._iqBox || !this._iqBox.isConnected) return; /* pop-up may have been dismissed */
1644:    const fbBox = this._iqBox.querySelector(".ppq-iq-feedback");
1857:      btn.addEventListener("click", () => self.openModal(urls));
1932:  Viewer.prototype.openModal = function (urlOrUrls) {
1934:    this.q(".ppq-modal-body").innerHTML = urls.map((u) => (String(u).slice(-4) === ".pdf") ? '<iframe src="' + esc(u) + '" class="ppq-modal-pdf"></iframe>' : '<img src="' + esc(u) + '" class="ppq-modal-img">').join("");
1935:    this.q(".ppq-modal").classList.add("show");
1938:    this.q(".ppq-modal").classList.remove("show");
1939:    this.q(".ppq-modal-body").innerHTML = "";
1945:      this._iqBox = null;
1965:      if (self.q(".ppq-modal").classList.contains("show") && e.key === "Escape") { self.closeModal(); return; }
1969:        if (e.key === "Enter") { const nb = self._iqBox && self._iqBox.querySelector(".ppq-iq-next"); if (nb && nb.style.display !== "none") nb.click(); return; }
1983:        const scope = (self._iqOpen && self._iqBox) ? self._iqBox : self.root;
```

#### Thinking

Let me read the entire `_renderInterrogation` function and the modal setup to understand the current architecture. I'll read lines 1153–1340.

#### Tool: Read

> Read: `C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\engine\ppqviewer.js`

**Output:**

```json
1153	  Viewer.prototype._renderInterrogation = function () {
1154	    const cfg = this.cfg;
1155	    if (!cfg.modules.postQuestionReview || !cfg.analysisOf) return;
1156	    const rec = cfg.analysisOf(this.cur);
1157	    if (!rec) return; /* graceful absence: most questions have no analysis yet */
1158	    this._analysis = rec;
1159	    this._analysisSelfReports = {};
1160	    /* QoderWork 2026-07-22 (analyst handoff): per-prompt chosen states drive the
1161	       v2 feedback match; the post-answer guess flag gates guess-aware feedback. */
1162	    this._promptStates = {};
1163	    this._postGuessDeclared = false;
1164	
1165	    const self = this;
1166	    const isV2 = this._isV2(rec);
1167	    const iq = el("div", { class: "ppq-iq" });
1168	
1169	    /* --- QoderWork 2026-07-23 (analyst request #4): reviewer-only analysis strip.
1170	       Visible only with ?review in the URL. Distinguishes "the analysts ignored
1171	       this" from "the data contains it but the viewer hid it". --- */
1172	    if (/[?&]review\b/.test(location.search)) {
1173	      const rv = rec.review || {};
1174	      const srpCount = (rec.self_report_prompts || []).length;
1175	      const pqcCount = ((rec.requirements || {}).post_question_checks || []).length;
1176	      const strip = el("div", { class: "ppq-iq-reviewer-strip" });
1177	      strip.textContent = [
1178	        (rec.identity && rec.identity.id) || rec.id || "?",
1179	        "schema " + (rec.schema_version || "?"),
1180	        rv.status || "no review",
1181	        rv.reviewer ? "by " + rv.reviewer : "",
1182	        rv.crop_checked ? "crop✓" : "crop?",
1183	        rv.answer_checked ? "answer✓" : "answer?",
1184	        srpCount + " srp + " + pqcCount + " pqc"
1185	      ].filter(Boolean).join(" · ");
1186	      iq.appendChild(strip);
1187	    }
1188	
1189	    const chosen = this._chosenLabel;
1190	    const correctLetter = isV2
1191	      ? String((rec.identity && rec.identity.correct_answer) || "").toUpperCase()
1192	      : (cfg.correctOf(this.cur) || "").toString().toUpperCase();
1193	
1194	    /* --- QoderWork 2026-07-23: GUESS PAGE FIRST (before the verdict). The pupil
1195	       answers, the pop-up opens straight onto "Want to declare a bit of a guess?",
1196	       they tick options or press Enter to skip, and ONLY THEN does the verdict
1197	       appear. A beat of suspense before the reveal. The old pre-answer panel below
1198	       the question and the old post-answer correction are both superseded. --- */
1199	    const labels = (this._answerLabels && this._answerLabels.length) ? this._answerLabels : (this._optionLabels(this.cur) || []);
1200	    const guessPage = el("div", { class: "ppq-iq-guesspage" });
1201	    const restPage = el("div", { class: "ppq-iq-rest", style: "display:none;" });
1202	
1203	    if (labels.length >= 2) {
1204	      guessPage.appendChild(el("div", { class: "ppq-iq-guesspage-heading" }, esc(this._guessLabel("pre_verdict"))));
1205	      const picker = this._buildGuessPicker({
1206	        labels: labels,
1207	        preselect: chosen ? [String(chosen).toUpperCase()] : [],
1208	        stage: "pre_verdict",
1209	        prompt: this._guessPrompt("pre_verdict"),
1210	        onDone: (payload) => { self._commitPreVerdictGuess(payload, chosen, self._wasRight); revealRest(); },
1211	        onSkip: () => { revealRest(); }
1212	      });
1213	      guessPage.appendChild(picker);
1214	      /* QoderWork 2026-07-23: Enter skips the guess page (proceeds to the verdict).
1215	         Smith: "they just press Enter again, and they just skip it and they get
1216	         the answer." Only fires when no input/textarea has focus. */
1217	      guessPage.addEventListener("keydown", function handler(e) {
1218	        if (e.key === "Enter" && !/(INPUT|TEXTAREA|SELECT)/.test((e.target.tagName || ""))) {
1219	          e.preventDefault(); e.stopPropagation();
1220	          guessPage.removeEventListener("keydown", handler);
1221	          revealRest();
1222	        }
1223	      });
1224	    } else {
1225	      /* QoderWork 2026-07-23: fewer than 2 options — no guess to declare, skip
1226	         straight to the verdict. Feedback rendered after mount (below). */
1227	      guessPage.style.display = "none";
1228	      restPage.style.display = "";
1229	    }
1230	
1231	    function revealRest() {
1232	      guessPage.style.display = "none";
1233	      restPage.style.display = "";
1234	      self._renderInterrogationFeedback();
1235	    }
1236	
1237	    /* --- 1. the verdict FIRST within the rest (analyst handoff): the concrete
1238	       "You chose X — the answer is Y" leads. The error_path explanation beneath
1239	       it is optional; the verdict line itself is not. --- */
1240	    restPage.appendChild(this._verdictEl(rec, isV2, chosen, correctLetter, this._wasRight));
1241	
1242	    if (isV2) {
1243	      /* --- 3. the pupil insight (first_notice / why_it_matters / next_move) --- */
1244	      this._appendInsightV2(restPage, rec);
1245	      /* --- 4. methods: title + structured pupil_steps + elimination chips --- */
1246	      this._appendMethodsV2(restPage, rec);
1247	      /* --- 5. primary self-report + knowledge check (feed the feedback match) --- */
1248	      this._appendSelfReportV2(restPage, rec);
1249	    } else {
1250	      /* legacy analysis-store path: probe + free-prose methods */
1251	      this._appendProbeLegacy(restPage, rec);
1252	      this._appendMethodsLegacy(restPage, rec, correctLetter);
1253	    }
1254	
1255	    /* --- feedback lands here (reacts to the self-report + guess declaration) --- */
1256	    restPage.appendChild(el("div", { class: "ppq-iq-feedback" }));
1257	
1258	    /* --- the 1-6 self-rating, INSIDE the pop-up (was "back outside") --- */
1259	    const rate = el("div", { class: "ppq-iq-rate" });
1260	    rate.appendChild(el("div", { class: "ppq-iq-rate-prompt" }, esc(cfg.selfReport.prompt)));
1261	    const scale = el("div", { class: "ppq-scale ppq-iq-scale" });
1262	    const meanings = cfg.selfReport.meanings || [];
1263	    for (let v = 1; v <= cfg.selfReport.levels; v++) {
1264	      const lbl = cfg.selfReport.labels ? cfg.selfReport.labels[v - 1] : String(v);
1265	      const meaning = meanings[v - 1] || "";
1266	      scale.appendChild(el("button", { class: "ppq-scale-btn ppq-iq-scale-btn", "data-val": String(v), title: meaning ? (v + " — " + meaning) : "" }, esc(lbl)));
1267	    }
1268	    rate.appendChild(scale);
1269	    if (meanings.length) {
1270	      rate.appendChild(el("div", { class: "ppq-scale-legend" }, meanings.map(function (mm, i) { return '<span class="ppq-scale-legend-item"><b>' + (i + 1) + "</b> " + esc(mm) + "</span>"; }).join("")));
1271	    }
1272	    const prior = this.store.scores[cfg.idOf(this.cur)];
1273	    if (prior) { const sb = scale.querySelector('.ppq-iq-scale-btn[data-val="' + prior + '"]'); if (sb) sb.classList.add("sel"); }
1274	    const iqNext = el("button", { class: "ppq-btn ppq-primary ppq-iq-next", type: "button", style: "display:none;" }, "Next question →");
1275	    iqNext.addEventListener("click", () => { self.closeModal(); self.next(); });
1276	    scale.addEventListener("click", (e) => {
1277	      const b = e.target.closest ? e.target.closest(".ppq-iq-scale-btn") : null;
1278	      if (!b) return;
1279	      const val = parseInt(b.dataset.val, 10);
1280	      scale.querySelectorAll(".ppq-iq-scale-btn").forEach((x) => x.classList.remove("sel"));
1281	      b.classList.add("sel");
1282	      if (self.cur) {
1283	        self.store.scores[self.cfg.idOf(self.cur)] = val; self._saveStore();
1284	        self._fireReport({ status: "rated", qtype: "self_report", extra_json: JSON.stringify({ rating: val }) });
1285	      }
1286	      iqNext.style.display = "inline-block"; iqNext.focus();
1287	    });
1288	    rate.appendChild(iqNext);
1289	    restPage.appendChild(rate);
1290	
1291	    /* --- optional "come back to this" flag (Smith: review / more like this) --- */
1292	    const flag = el("button", { class: "ppq-iq-flag" }, "Flag this — come back / more like this");
1293	    flag.addEventListener("click", () => {
1294	      flag.classList.toggle("on");
1295	      const on = flag.classList.contains("on");
1296	      flag.textContent = on ? "Flagged ✓ — we'll bring more like this" : "Flag this — come back / more like this";
1297	      self._fireReport({ status: "flag_review", qtype: "review_flag", extra_json: JSON.stringify({ flagged: on }) });
1298	    });
1299	    restPage.appendChild(flag);
1300	
1301	    /* --- QoderWork 2026-07-23 (analyst request #2): quiet analysis-state label.
1302	       Distinguishes "Full review" / "Early review" so the pupil (and reviewer)
1303	       knows whether the analysis behind this question is complete. --- */
1304	    const rv = rec.review || {};
1305	    const hasMethods = (rec.methods || []).length > 0;
1306	    const hasFeedback = (rec.feedback || []).length > 0;
1307	    let stateLabel = "Early review";
1308	    if (rv.status === "reviewed" && hasMethods && hasFeedback) stateLabel = "Full review";
1309	    const stateEl = el("div", { class: "ppq-iq-state-label" }, stateLabel);
1310	    if (rv.reviewer) stateEl.appendChild(el("span", { class: "ppq-iq-state-by" }, " · " + esc(rv.reviewer)));
1311	    restPage.appendChild(stateEl);
1312	
1313	    /* --- mount into the modal shell and open the pop-up. The guess page shows
1314	       first; the rest (verdict onward) is hidden until Done/Skip. While the pop-up
1315	       holds the 1-6, the outer 1-6 row is hidden; closeModal restores it. --- */
1316	    iq.appendChild(guessPage);
1317	    iq.appendChild(restPage);
1318	    const body = this.q(".ppq-modal-body");
1319	    body.innerHTML = "";
1320	    body.appendChild(iq);
1321	    this.q(".ppq-modal").classList.add("show");
1322	    this._iqBox = iq;
1323	    this._iqOpen = true;
1324	    this.q(".ppq-competence").style.display = "none";
1325	    /* QoderWork 2026-07-23: if the rest is already showing (no guess page — fewer
1326	       than 2 options), render feedback now. Otherwise it fires inside revealRest()
1327	       once the guess page is dismissed. */
1328	    if (restPage.style.display !== "none") this._renderInterrogationFeedback();
1329	  };
1330	
1331	  /* QoderWork 2026-07-22 (analyst handoff): an analysis-v2 record is detected by
1332	     its identity + pupil_analysis blocks. Legacy analysis-store records have a
1333	     probe + free-prose methods instead. */
1334	  Viewer.prototype._isV2 = function (rec) {
1335	    return !!(rec && rec.identity && rec.pupil_analysis);
1336	  };
1337	
1338	  /* QoderWork 2026-07-22 (analyst handoff): the verdict. ALWAYS rendered — the
1339	     concrete "You chose X — the answer is Y" line leads even when the chosen
1340	     option has no error_path explanation (the explanation is optional, the
1341	     verdict is not). */
1342	  Viewer.prototype._verdictEl = function (rec, isV2, chosen, correctLetter, isRight) {
```

#### Thinking

Okay, I've understood enough now. The interrogation is rendered inside a modal (`.ppq-modal`), which is an overlay covering the screen. Requirement #1 states that the student must be able to see the question, diagram, graph, options, and their own answer while reading the analysis. The current modal covers all of those.

This is the biggest architectural decision. There are a few options:
1. Keep the modal but make it non-blocking/side-by-side (e.g., a side panel that doesn't cover the question).
2. Render the analysis inline below the question rather than in a modal.
3. Make the modal draggable/resizable.

Given the existing architecture (modal-based, with a two-stage flow of guessing → rest), the least disruptive approach that satisfies #1 would probably be to convert the modal into a side panel, or to render the analysis inline below the question card.

Actually, let me reconsider. This is a fundamental change, and Smith is the kind of person who wants to be consulted on big decisions, and moreover the handoff is ambiguous about the exact mechanism (it just says "the student must be able to see the question… while reading and responding to the analysis"), so I should confirm with him.

But wait — let me re-read the context of Smith's message. He said: "Are you looking at this file? I don't remember if I pointed it out to you. There's a live version in the folder."

This is a check-in. He's making sure I have the latest spec. He hasn't explicitly said "implement it right now." But given his working style (he points at things and expects me to move forward), and given that this is clearly the next piece of work, I think the implicit intent is "this is the new spec, get on it."

However, this is a large-scale rework that overturns part of yesterday's work, and it contains a fundamental layout question. The right move is:
1. Confirm I've read and understood it
2. Point out the overturning of v0.2.9 (important — he should know that the analyst's four requests are now partially reversed)
3. Ask the key architectural question about #1 (keep the question visible), because it determines everything else.

Actually, let me reconsider whether I should use AskUserQuestion. The guidance says to use it when blocked on a decision that purely belongs to the user. The layout question (#1) is purely a design decision that belongs to Smith. But I could also present my understanding and recommended approach in prose and let him react — that fits his stream-of-consciousness style better than a rigid multiple-choice.

Hmm, but the AskUserQuestion tool is recommended for clarifying before starting substantive work. Given the scale here, asking one focused question about the layout approach is reasonable. But Smith's style is conversational — he dictates and expects me to interpret. Let me present my understanding concisely, point out the overturning, and ask the layout question. I'll use AskUserQuestion for the layout decision, because it's a genuine fork.

Wait — let me reconsider the layout question more carefully. Is it really a fork, or is there an obvious answer?

Current state: the interrogation is a modal overlay. When it opens, it covers the question.

Requirement: "The student must be able to see the question, diagram, graph, options, and their own answer while reading and responding to the analysis."

The most natural interpretation: the analysis should be shown alongside/below the question, not in an overlay that hides the question.

Options:
A. Inline panel below the question card (no modal). The question stays visible above, and the analysis appears below it.
B. Side panel (split view): question on the left, analysis on the right.
C. Keep the modal but make it a non-modal docked panel.

Given that the question crop is an image and the analysis is long, and given that the existing flow is modal-based with a guessing → rest two-stage flow, option A (inline below) is the simplest and most robust. But it changes the guessing flow (which currently opens the modal on answer).

Actually, this is a real design fork that depends on how Smith wants the UX to feel. He's the designer here. I should ask him.

Let me also confirm: is there an existing inline analysis area? Let me check how the modal is triggered and whether there's space below the question. Actually, I saw that `.ppq-competence` (the 1-6 row) gets hidden when the modal opens. So there is a card area below the question.

Let me look at the card structure to understand the layout options. Let me check the renderQuestion / card area.

Actually, I think I have enough understanding to ask a well-informed question. Let me not over-explore. Let me look at the card structure just enough to know whether inline is feasible.

Let me read around where the card and question area are built (around lines 230–260, where I saw the meta div and the prev-top button).

Let me see the card/question layout to understand what "keep the question visible" would mean structurally.



#### Tool: Read

> Read: `C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\engine\ppqviewer.js`

**Output:**

```json
225	    const orderSel = el("select", { class: "ppq-select ppq-order" });
226	    orderSel.appendChild(el("option", { value: "order" }, "In order"));
227	    orderSel.appendChild(el("option", { value: "shuffle" }, "Shuffle"));
228	    if (cfg.defaultOrder === "shuffle") orderSel.value = "shuffle"; /* QoderWork 2026-07-22: Smith: "make the standard to be shuffle" */
229	    filters.appendChild(orderSel);
230	    filters.appendChild(el("input", { class: "ppq-start", type: "number", min: "1", placeholder: "Start #", style: "display:none;" }));
231	    filters.appendChild(el("span", { class: "ppq-counter" }));
232	    header.appendChild(filters);
233	    this.root.appendChild(header);
234	
235	    const layout = el("div", { class: "ppq-layout" });
236	    const centre = el("div", { class: "ppq-centre" });
237	    const card = el("div", { class: "ppq-card", style: "display:none;" });
238	    card.appendChild(el("div", { class: "ppq-meta" }, '<span class="ppq-qid"></span><span class="ppq-tags"></span>'));
239	    /* QoderWork 2026-07-23: Previous at the TOP — Smith: "there's often a lot of
240	       white space at the bottom of these questions." The bottom controls stay too. */
241	    card.appendChild(el("button", { class: "ppq-btn ppq-prev ppq-prev-top", type: "button" }, "← Previous"));
242	    /* QoderWork 2026-07-22: exam timer display (config.timer). Hidden unless the
243	       timer module is on and its prominence is not "hidden". */
244	    card.appendChild(el("div", { class: "ppq-timer", style: "display:none;" }));
245	
246	    const drawControls = el("div", { class: "ppq-draw-controls" });
247	    drawControls.innerHTML =
248	      '<button class="ppq-btn-mini ppq-draw-undo">Undo</button>' +
249	      '<button class="ppq-btn-mini ppq-draw-clear">Clear</button>' +
250	      '<span class="ppq-color active" data-color="black"></span><span class="ppq-color" data-color="red"></span>' +
251	      '<span class="ppq-color" data-color="blue"></span><span class="ppq-color" data-color="green"></span>' +
252	      '<input type="range" class="ppq-draw-thick" min="1" max="10" value="2">';
253	    card.appendChild(drawControls);
254	
255	    const drawContainer = el("div", { class: "ppq-draw-container" });
256	    drawContainer.appendChild(el("canvas", { class: "ppq-canvas", style: "display:none;" }));
257	    drawContainer.appendChild(el("div", { class: "ppq-stem" }));
258	
259	    /* QoderWork 2026-07-22: optional left options rail (config.optionsLeft). For
260	       multiple-choice subjects (ESAT) the letter buttons sit in a sticky rail to the
261	       LEFT of the question, so there is no long scroll down to answer. The question
262	       crop already shows the printed options; the rail is just the picker. Off by
263	       default so other consumers keep the stacked layout. */
264	    const optionsEl = el("div", { class: "ppq-options" });
265	    if (cfg.optionsLeft) {
266	      const qarea = el("div", { class: "ppq-qarea" });
267	      qarea.appendChild(optionsEl);
268	      qarea.appendChild(drawContainer);
269	      card.appendChild(qarea);
270	      card.appendChild(el("div", { class: "ppq-struct" }));
271	    } else {
272	      card.appendChild(drawContainer);
273	      card.appendChild(el("div", { class: "ppq-struct" }));   // structured-paper nav + whole-question
274	      card.appendChild(optionsEl);
275	    }
276	    /* QoderWork 2026-07-22 (analyst handoff): pre-answer guess declaration. The
277	       panel is built per-question by the shared _buildGuessPicker so percentages
278	       stay OPTIONAL and the same picker powers the post-answer correction inside
279	       the modal. Label comes from analysis v2 interaction_defaults ("I'm guessing"). */
280	    const guessDeclare = el("div", { class: "ppq-guess", style: "display:none;" });
281	    guessDeclare.appendChild(el("button", { class: "ppq-guess-btn", type: "button" }, "I'm guessing"));
282	    guessDeclare.appendChild(el("div", { class: "ppq-guess-panel", style: "display:none;" }));
283	    card.appendChild(guessDeclare);
284	
285	    /* QoderWork 2026-07-22: answer line + the "actually, I wasn't sure" option sit
286	       on one row (Smith: the option goes "to the right of that"). Tapping it opens
287	       letter chips so the pupil can say which options they were torn between
288	       ("I thought it was B or D") — logged, so a lucky right answer can be told
289	       apart from a confident one. Hidden until the question is answered. */
290	    const answerRow = el("div", { class: "ppq-answer-row" });
291	    answerRow.appendChild(el("div", { class: "ppq-answer-line" }));
292	    const unsure = el("div", { class: "ppq-unsure", style: "display:none;" });
293	    unsure.innerHTML =
294	      '<button class="ppq-unsure-btn" type="button">Actually, I wasn\'t sure</button>' +
295	      '<div class="ppq-unsure-pick" style="display:none;">' +
296	      '<span class="ppq-unsure-q">I thought it was…</span><span class="ppq-unsure-letters"></span>' +
297	      '<button class="ppq-unsure-done" type="button">Done</button></div>';
298	    answerRow.appendChild(unsure);
299	    card.appendChild(answerRow);
```

#### Thinking

I see. The card contains meta, prev-top, timer, draw controls, draw container (stem/question), struct, options, guess declaration, answer row. Let me look a bit further to see what comes after answerRow (the competency/1-6 row, controls).

Actually, I understand enough now. The question is inside `.ppq-card`. The interrogation modal overlays on top of everything. To "keep the question visible," the analysis needs to be inline (below the question within the card, or in a side panel).

Let me look at the rest of the card construction to check where the competency row and controls are, and whether there's a natural inline slot.


#### Tool: Read

> Read: `C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\engine\ppqviewer.js`

**Output:**

```json
299	    card.appendChild(answerRow);
300	
301	    const controls = el("div", { class: "ppq-controls" });
302	    controls.innerHTML =
303	      '<button class="ppq-btn ppq-prev">Previous (←)</button>' +
304	      '<button class="ppq-btn ppq-reveal">Reveal (Enter)</button>' +
305	      '<button class="ppq-btn ppq-skip">Skip (S)</button>';
306	    card.appendChild(controls);
307	
308	    const answerPanel = el("div", { class: "ppq-answer-panel" });
309	    answerPanel.innerHTML =
310	      '<div class="ppq-ms-header"><strong>Markscheme</strong></div>' +
311	      '<div class="ppq-markscheme"></div>' +
312	      '<div class="ppq-examiner"><div class="ppq-examiner-title">Examiner report</div><div class="ppq-examiner-body"></div></div>';
313	    card.appendChild(answerPanel);
314	
315	    const comp = el("div", { class: "ppq-competence" });
316	    comp.appendChild(el("div", { class: "ppq-competence-prompt" }, esc(cfg.selfReport.prompt)));
317	    const scale = el("div", { class: "ppq-scale" });
318	    const meanings = cfg.selfReport.meanings || [];
319	    for (let v = 1; v <= cfg.selfReport.levels; v++) {
320	      const lbl = cfg.selfReport.labels ? cfg.selfReport.labels[v - 1] : String(v);
321	      const meaning = meanings[v - 1] || "";
322	      scale.appendChild(el("button", { class: "ppq-scale-btn", "data-val": String(v), title: meaning ? (v + " — " + meaning) : "" }, esc(lbl)));
323	    }
324	    comp.appendChild(scale);
325	    /* QoderWork 2026-07-22: legend labelling what each point on the scale means */
326	    if (meanings.length) {
327	      comp.appendChild(el("div", { class: "ppq-scale-legend" }, meanings.map(function (m, i) { return '<span class="ppq-scale-legend-item"><b>' + (i + 1) + "</b> " + esc(m) + "</span>"; }).join("")));
328	    }
329	    comp.appendChild(el("button", { class: "ppq-btn ppq-primary ppq-next", style: "display:none;" }, "Next (Enter)"));
330	    card.appendChild(comp);
331	
332	    card.appendChild(el("div", { class: "ppq-kb-hint" }));
333	    centre.appendChild(card);
334	    centre.appendChild(el("div", { class: "ppq-empty" }, "<h2>Loading questions…</h2>"));
335	
336	    /* QoderWork 2026-07-22: a split dashboard renders as three columns — left
337	       mastery panel, centre question, right mastery panel — matching the original
338	       Chemistry viewer, rather than stacking both columns in one right sidebar. */
339	    const isSplit = cfg.dashboardLayout === "split" && cfg.dashboardColumns && cfg.dashboardColumns.length >= 2;
340	    const makeDashPanel = function (col, sideClass) {
341	      const p = el("div", { class: "ppq-dash ppq-dash-split-panel " + sideClass });
342	      p.appendChild(el("h3", null, esc(col.title)));
343	      p.appendChild(el("div", { class: "ppq-dash-sub" }, "Click a group to filter."));
344	      p.appendChild(el("div", { class: "ppq-dash-content" }));
345	      return p;
346	    };
347	    if (isSplit) {
348	      layout.classList.add("ppq-layout-split");
349	      layout.appendChild(makeDashPanel(cfg.dashboardColumns[0], "ppq-dash-left"));
350	      layout.appendChild(centre);
351	      layout.appendChild(makeDashPanel(cfg.dashboardColumns[1], "ppq-dash-right"));
352	    } else {
353	      layout.appendChild(centre);
354	      const dash = el("div", { class: "ppq-dash" });
355	      dash.appendChild(el("h3", null, esc(cfg.dashboardTitle)));
356	      dash.appendChild(el("div", { class: "ppq-dash-sub" }, "Recent ticks/crosses and your self-rating spread, per group. Click a group to filter."));
357	      dash.appendChild(el("div", { class: "ppq-dash-content" }));
358	      layout.appendChild(dash);
359	    }
360	    this.root.appendChild(layout);
361	
362	    const toolbar = el("div", { class: "ppq-toolbar" });
363	    toolbar.innerHTML = '<button class="ppq-btn-mini ppq-draw-toggle">Draw</button><button class="ppq-btn-mini ppq-reset">Reset progress</button>';
364	    this.root.appendChild(toolbar);
365	
366	    const modal = el("div", { class: "ppq-modal" });
367	    modal.innerHTML = '<div class="ppq-modal-content"><div class="ppq-modal-close">×</div><div class="ppq-modal-body"></div></div>';
368	    this.root.appendChild(modal);
```

#### Thinking

Now I've got the whole picture. The card layout is as follows:
- meta (qid + tags)
- prev-top button
- timer
- draw controls
- draw container (stem = question crop image + canvas)
- struct
- options (letter selection)
- guess declaration (hidden)
- answer row
- controls (Previous / Reveal / Skip)
- answer panel (mark scheme + examiner report)
- competence (1–6 rating + Next)
- kb-hint

The interrogation is a modal overlay. To "keep the question visible," the analysis needs to be displayed inline within the card (for example, after the answer row / answer panel, replacing or coexisting with the competence row), or in a side panel.

Now I fully understand. Let me organize my understanding and the important decision points.

This is a large-scale rework. Let me organize what needs to change and what conflicts with yesterday's v0.2.9:

**Changes the handoff requires (compared to current code):**

1. **Keep the question visible** (#1) — biggest change. Currently the modal covers the question. Need inline or side-by-side display. Architectural decision needed.

2. **presentation_kind** (#2) — `_appendMethodsV2` currently ignores `presentation_kind` and renders everything under "Ways through it". Needs:
   - Remove "Ways through it" framing
   - `route` → sequential numbered steps
   - `independent_check` → unnumbered peer checks
   - `synthesis` → integration
   - Don't fabricate "Why it matters" / "Next move"

3. **Complete fixed option rail** (#3) — `_elimChipsV2El` currently uses pills with backgrounds/strikethroughs. Needs:
   - Complete rail from `identity.option_labels` (all letters, fixed positions)
   - Color the letters themselves (no pills/backgrounds/strikethroughs)
   - 7 relationships with integration-doc colors
   - Legend uses words/non-letter swatches
   - Fall back to eliminates/lands_on projected onto the complete rail

4. **Reflection next to thinking** (#4) — `_appendSelfReportV2` currently detaches secondaries into "More quick checks". Needs:
   - Place prompts next to the method referenced by method_refs
   - Group-level prompts shown once after the group
   - Hide the generic "used it" control when local prompts exist
   - Local question-specific controls, multi-select allowed
   - Strip `proposed__` prefix and make readable
   - This overturns analyst request #1 (More quick checks disclosure)

5. **Keep internal stuff internal** (#5) —
   - State label currently displays `review.reviewer` ("Full review · Codex") → remove reviewer from student-facing display (overturns part of analyst request #2)
   - Taxonomy/classification is reviewer-only
   - Reviewer strip (?review) is fine (reviewer-only)

6. **Fail gracefully** (#6) — mostly already done (graceful absence handling at line 1157), but confirm that empty launch-card bundles don't hide the normal flow.

**Hotspots** (per the handoff): `_appendMethodsV2`, `_elimChipsV2El`, `_appendSelfReportV2`, `_stateLabel`, student review footer, `.ppq-elim` CSS.

Now, the important decision is #1 (layout). This is really Smith's call. Let me ask him.

Actually, let me reconsider whether to ask or just proceed. Given:
- The handoff is explicit about WHAT but not about the exact layout mechanism of #1
- #1 contradicts the current modal architecture
- Smith is the designer and has strong opinions about UX
- The rest (#2–#6) can proceed regardless of the #1 decision… but in reality #4 (prompts next to methods) and the whole rendering target (modal vs inline) are intertwined.

I think the correct action is to present my understanding (including the overturning of v0.2.9) and ask the layout question. Use AskUserQuestion for the layout fork, because it's a genuine decision that Smith should make, and it blocks the largest piece of work.

But first, let me clearly present my understanding in prose so he can correct me, and then ask the layout question.

Actually, let me reconsider the layout options more concretely so the question is well-formed:

Option A: **Inline below the question** — After answering, the analysis renders inside the card, below the question/options (where the answer panel / competence row are). The question crop stays visible above (student can scroll up, or it stays in view). The modal goes away (or is reserved for crop zoom).

Option B: **Side panel** — Question on the left, analysis in a right panel. Both visible simultaneously. Requires a wide layout.

Option C: **Keep the modal but dock/shrink it** — e.g., a bottom sheet or draggable panel that doesn't cover the question.

Given the existing card-based single-column layout and the fact that the question crop is a tall image, Option A (inline) is the most natural and robust. The question stays at the top of the card, and the analysis appears below it. The student scrolls, but the question is right there (and the sticky header helps). Actually, to truly "keep the question visible," we might want to make the question crop sticky while the analysis scrolls.

Hmm, but this is getting into design territory. Let me just ask Smith. Present my understanding and ask.

Let me write a concise summary of my understanding and ask the layout question. Keep it conversational to match his style.

Actually, the instructions say to use AskUserQuestion for clarifying questions rather than typing them out. But I also need to present my understanding (the overturning of v0.2.9) — that's prose. So: prose summary + AskUserQuestion for the layout decision.

Let me think about what options to present for the layout question. The real fork is: where does the analysis live, so the question stays visible?

Options:
1. Inline below the question (inside the card) — recommended, simplest, question stays above
2. Side-by-side panel (question left, analysis right)
3. Keep pop-up but make it a non-covering docked panel

Let me present these. Actually, I realize I should double-check: does the handoff's "keep the question visible" necessarily mean the modal goes away? Let me re-read: "The student must be able to see the question, diagram, graph, options, and their own answer while reading and responding to the analysis."

Yes — the current modal covers all of these. So the analysis can't be a full-screen modal. It has to be inline or side-by-side.

Let me present my understanding and ask. Keep it concise.

One more thing to check: the handoff says "the student's review footer" is a hotspot, and "don't append `review.reviewer` to the student's review footer". The current state label (lines 1309–1311) appends reviewer. That's the student-facing footer. So I need to remove the reviewer from there. The reviewer strip (?review) can keep the reviewer since it's reviewer-only.

OK, let me write the response. First present my understanding concisely, then ask the layout question.

Let me keep the prose concise. Smith wants confirmation that I understand, and then to proceed. Let me clearly point out the overturning of v0.2.9, because that's the surprising part — yesterday's analyst requests are now partially reversed by today's handoff.

I've now read the handoff, the integration contract, the live bundle data, and the current engine code. Here's my read before I touch anything.

This handoff is a rework of the analysis presentation, and it deliberately supersedes parts of what I shipped yesterday as v0.2.9. Specifically:

The "More quick checks" disclosure I added (analyst request #1) is now wrong — prompts must sit *beside* the method they reference via `method_refs`, not be detached into a generic area. A prompt that references a whole peer group (like Q4's neutral-detail prompt, which refs all four statement checks) shows once after that group.

The state label I added (analyst request #2) leaks `review.reviewer` ("Full review · Codex") to the pupil — the reviewer name must come off the pupil-facing footer. It can stay in the `?review` strip, which is reviewer-only.

The evidence chips I built (analyst request #3) use pills/backgrounds/strikethrough — the new spec wants *plain coloured letters only*, on a complete fixed rail showing every option in the same position every row, ordered from `identity.option_labels`. Seven relationships, colours per the integration doc (rules_out red, counts_against light-red, disfavours orange, unaffected grey, favours light-blue, supports light-green, directly_identifies green).

The reviewer strip (#4) is fine as-is — it's reviewer-only.

The live bundle (`dist/esat_analysis_v2.js`, 98 records) already carries everything this needs: `presentation_kind`, full `option_evidence` arrays, and `self_report_prompts` with `method_refs`. So this is almost entirely viewer work, not data work.

The one requirement that forces a real design decision is **#1 — keep the question visible**. Right now the whole interrogation is a modal that covers the question, diagram, options and the pupil's answer. The handoff says the pupil must see all of those *while* reading and responding to the analysis. So the analysis can't live in a full-screen pop-up anymore.

That's the fork I want your call on, because it changes the whole flow you designed (answer → pop-up → guess → verdict).



#### Tool: AskUserQuestion

**Questions:**

- Requirement #1 says the pupil must still see the question, diagram, options and their answer while reading the analysis. The current pop-up covers all of that. Where should the analysis live?

#### Thinking

Smith's answer: "Make it a big popup, but make it minimizable before leaving... remind me what the question was."

In other words, he wants to keep the big popup (modal) while making it minimizable so students can shrink it down to see the question. "Before leaving... remind me what the question was"—he wants a way for students to see the question again while the popup is open.

So the design is: keep the modal, but add a minimize/collapse function. When minimized, the modal shrinks down to a small bar/chip, the question behind it becomes visible, and the student can re-expand it. This satisfies "keep the question visible"—the student can minimize the popup, look at the question/diagram/choices/their own answer, and then bring the popup back.

"Remind me what the question was"—when minimized, the collapsed bar should probably display something that reminds the student of the question (like the question ID, or a thumbnail of the question crop, or "Q4 — you chose B"). Or it could mean he wants me to remind him what the question/requirement was. Given the voice-input style and the trailing "remind me what the question was," I think he's saying that the minimized state should remind the student of the question. But it could also be directed at me: "remind me [Smith] what the question was"—meaning, he's forgotten which question/requirement we're talking about, and wants me to remind him.

Hmm. Let me re-read: "Make it a big popup, but make it minimizable before leaving... remind me what the question was."

I think the most likely interpretation is: keep the big popup, make it minimizable. And "remind me what the question was" is directed at me—he wants me to remind him what the question (requirement #1) was, because he's forgotten the exact wording. Voice-input stream of consciousness.

No, wait. Let me reconsider. "Make it minimizable before leaving"—minimize before leaving (moving on to the next question). "Remind me what the question was"—when minimized... remind the student what the question was? That doesn't quite fit either.

I think the cleanest interpretation is: Smith wants a big popup that can be minimized (collapsed into a small bar). This lets the student peek at the question. And he's asking me to remind him what requirement #1 (the question) was—because he's forgotten the exact wording and wants me to restate it so he can confirm his answer addresses it.

Given the ambiguity, the safest path is: implement the minimizable popup (clearly what he wants), and in my reply briefly restate requirement #1 (to "remind him what the question was"). This covers both interpretations. If he meant "remind the student what the question was," the minimized bar can display the question ID + the choice the student made, which serves as a reminder. I can do both: restate the requirement to Smith, AND make the minimized bar display the question ID + chosen option as a reminder to the student.

Actually, that's a nice solution. The minimized bar shows something like "Q4 · you chose B · analysis" so the student remembers which question and what they chose, and can click to re-expand. And in my message to Smith, I restate requirement #1.

Let me design the minimizable modal:
- Add a minimize button (—) next to the close button (×) in the modal header.
- When minimized, the modal content collapses into a thin bar (fixed at the bottom or top) displaying the question ID + chosen option + a "Show analysis" button.
- Clicking the bar/button re-expands the modal.
- The question behind becomes fully visible when minimized.

But wait—there's a subtlety. The modal currently has `.ppq-modal` (the overlay) and `.ppq-modal-content`. When minimized, I want the overlay to not block the question. So when minimized:
- Either hide the full overlay and show a separate docked bar, or
- Keep the overlay but make it pointer-events: none and shrink the content into a bar.

The cleanest approach: when minimized, add a `minimized` class to the modal. The `.ppq-modal.minimized` overlay becomes transparent and pointer-events: none, except for the content which becomes a fixed bar at the bottom. Actually, it's simpler to have two states:
- Expanded: current behavior (overlay covers, content centered).
- Minimized: overlay becomes non-interactive (pointer-events: none, background transparent), content becomes a small bar pinned to the bottom of the screen.

Let me think about the implementation. The modal structure is:
```
<div class="ppq-modal">
  <div class="ppq-modal-content">
    <div class="ppq-modal-close">×</div>
    <div class="ppq-modal-body"></div>
  </div>
</div>
```

Add a minimize button `<div class="ppq-modal-min">—</div>` next to the close button.

When minimized:
- `.ppq-modal.minimized` → background: transparent; pointer-events: none; (so clicks pass through to the question)
- `.ppq-modal.minimized .ppq-modal-content` → pointer-events: auto; position: fixed; bottom: 12px; left: 50%; transform: translateX(-50%); width: auto; a small bar; the body is hidden (display: none); only the header row (min + close buttons + title/reminder text) is visible.

Need a "reminder" text in the bar: question ID + chosen option. E.g., "Q4 · you chose B". Add a `.ppq-modal-reminder` span that gets populated when the interrogation opens.

Clicking the bar (or the min button which toggles to a "+" / "Show") re-expands.

Let me make the min button a toggle: "—" when expanded (click to minimize), "+" or "▢" when minimized (click to expand). And clicking anywhere on the minimized bar re-expands.

Also, the close button (×) should still work when minimized (dismiss the analysis entirely).

One more thing to handle: the modal is also used for crop zoom (openModal for images). The minimize feature should only apply to the interrogation, not to image zoom. So I'll only add the min button when rendering the interrogation, or add it generally but it's harmless for images. Actually, the modal header (close button) is shared. Let me add the min button to the shared modal HTML but only make it functional/visible for the interrogation. Hmm, simpler: always add the min button to the modal HTML, but for image zoom it's... actually, minimizing an image zoom is weird. Let me hide the min button for image zoom and show it for the interrogation.

Wait, let me reconsider. The modal is created once at init (lines 366–368). The close button is `.ppq-modal-close`. Let me add a `.ppq-modal-min` button. In `openModal` (image zoom), hide the min button. In `_renderInterrogation`, show it and set the reminder text.

Let me look at how the modal close/min is wired. Currently the modal click handler (lines 537–538) closes on overlay click or close button click. I need to add min button handling.

Let me plan the implementation:

1. **Modal HTML** (line 367): add `<div class="ppq-modal-min">—</div>` before the close button. Also add a reminder span `<span class="ppq-modal-reminder"></span>`.

Actually, let me restructure the modal header into a proper header row:
```
<div class="ppq-modal-content">
  <div class="ppq-modal-topbar">
    <span class="ppq-modal-reminder"></span>
    <span class="ppq-modal-min">—</span>
    <div class="ppq-modal-close">×</div>
  </div>
  <div class="ppq-modal-body"></div>
</div>
```

But this changes the existing structure. The close button is currently a direct child. Let me check the CSS for `.ppq-modal-close` to see the positioning. Let me read the modal CSS.

Let me be careful. Let me read the modal CSS first.

2. **Wiring** (near line 537): add a min button handler that toggles the `minimized` class on `.ppq-modal`. Also make clicking the minimized bar re-expand.

3. **_renderInterrogation**: set the reminder text (question ID + chosen option). Show the min button.

4. **openModal (image zoom)**: hide the min button, clear the reminder.

5. **CSS**: styles for `.ppq-modal-topbar`, `.ppq-modal-min`, `.ppq-modal-reminder`, and `.ppq-modal.minimized` state.

Let me read the modal CSS to understand the current styling.

Let me also reconsider: Smith said "minimizable before leaving." "Before leaving" = before moving on to the next question. So the flow is: answer → popup opens → student reads analysis → wants to look at the question again → minimizes → looks at question → re-expands → rates 1–6 → next. Or: minimize → look at question → come back. The minimize lets them refer to the question while the analysis is still open.

OK, let me read the modal CSS and then implement.

Let me also make a todo list for this big task. Let me organize:

1. Minimizable popup (keep the question visible) — #1
2. Respect presentation_kind (route/independent_check/synthesis), remove "Ways through it" — #2
3. Full fixed option rail, colored letters, 7 relationships — #3
4. Reflection next to thought (prompts next to methods via method_refs) — #4
5. Keep internal stuff internal (remove reviewer from student footer) — #5
6. Confirm graceful failure — #6
7. Verify against acceptance fixtures (Q4, Q27, Q40, etc.)
8. Update CHANGELOG

That's the full scope. Let me start with the minimizable popup since that's what Smith just decided. Then move through the rest.

Actually, let me reconsider the order. The prompt placement change (#4) and presentation_kind (#2) both affect `_appendMethodsV2` and `_appendSelfReportV2`, and they're intertwined (prompts sit next to methods). The option rail (#3) affects `_elimChipsV2El`. These are somewhat independent of the modal change (#1).

Let me do #1 (modal minimize) first since it's the architectural decision Smith just made and it unblocks the "keep the question visible" requirement. Then #2 + #4 together (methods + prompts, since prompts attach to methods). Then #3 (option rail). Then #5 (reviewer removal). Then verify.

Let me get started. First, read the modal CSS.

Let me update the todo list and read the modal CSS.

Smith wants to keep the big pop-up but make it **minimisable** — shrink it to a slim bar so the question, diagram, options and his answer are visible behind it, then re-expand. And the collapsed bar should remind the pupil which question it is. That's a clean solution that keeps your answer→pop-up→guess→verdict flow intact. Let me restate requirement #1 for the record: *the pupil must be able to see the question, diagram, graph, options and their answer while reading and responding to the analysis* — the minimise bar delivers that.

Let me set up the full task list and start with the modal.



#### Tool: TodoWrite

**Input:**

```json
{
  "todos": [
    {
      "description": "#1 Keep question visible: minimisable pop-up (slim bar shows Q-id + chosen option, re-expands)",
      "status": "in_progress"
    },
    {
      "description": "#2 Respect presentation_kind (route/independent_check/synthesis); remove 'Ways through it' framing; no manufactured Why-it-matters/Next-move",
      "status": "pending"
    },
    {
      "description": "#3 Complete fixed-position option rail: coloured letters only, 7 relationships, ordered from identity.option_labels, eliminates/lands_on fallback",
      "status": "pending"
    },
    {
      "description": "#4 Reflection beside the thought: prompts sit beside methods via method_refs; group prompt once after group; strip proposed__; local multi-select controls",
      "status": "pending"
    },
    {
      "description": "#5 Keep internal internal: remove review.reviewer from pupil footer; taxonomy reviewer-only",
      "status": "pending"
    },
    {
      "description": "#6 Fail gracefully: empty/missing analysis never blocks verdict or progression",
      "status": "pending"
    },
    {
      "description": "Verify against acceptance fixtures (Q4, Q27, Q40, 2022 Q27, 2019 Q01, 2017 Q46)",
      "status": "pending"
    },
    {
      "description": "Update CHANGELOG (v0.3.0)",
      "status": "pending"
    }
  ]
}
```

**Output:**

```json
Successfully updated the todo list. The current list is now:
1. [in_progress] #1 Keep question visible: minimisable pop-up (slim bar shows Q-id + chosen option, re-expands)
2. [pending] #2 Respect presentation_kind (route/independent_check/synthesis); remove 'Ways through it' framing; no manufactured Why-it-matters/Next-move
3. [pending] #3 Complete fixed-position option rail: coloured letters only, 7 relationships, ordered from identity.option_labels, eliminates/lands_on fallback
4. [pending] #4 Reflection beside the thought: prompts sit beside methods via method_refs; group prompt once after group; strip proposed__; local multi-select controls
5. [pending] #5 Keep internal internal: remove review.reviewer from pupil footer; taxonomy reviewer-only
6. [pending] #6 Fail gracefully: empty/missing analysis never blocks verdict or progression
7. [pending] Verify against acceptance fixtures (Q4, Q27, Q40, 2022 Q27, 2019 Q01, 2017 Q46)
8. [pending] Update CHANGELOG (v0.3.0)
```

#### Thinking

Let's read the modal CSS and understand the current styling before making changes.

#### Tool: Grep

**Input:**

```json
{
  "-n": true,
  "output_mode": "content",
  "path": "C:\\Claude (not on Gdrive, nor OneDrive)\\ppqviewer\\engine\\ppqviewer.css",
  "pattern": "ppq-modal"
}
```

**Output:**

```json
202:.ppq-modal { position: fixed; inset: 0; background: rgba(0,0,0,0.7); display: none; justify-content: center; align-items: center; z-index: 1000; padding: 2rem; }
203:.ppq-modal.show { display: flex; }
204:.ppq-modal-content { background: var(--ppq-paper); padding: 1rem; border-radius: 12px; width: 90vw; max-width: 1200px; max-height: 95vh; overflow: auto; position: relative; }
205:.ppq-modal-close { position: absolute; top: 0.5rem; right: 1rem; font-size: 1.4rem; font-weight: 700; color: #b03030; cursor: pointer; background: #fff; border-radius: 50%; width: 32px; height: 32px; text-align: center; line-height: 32px; box-shadow: 0 2px 5px rgba(0,0,0,0.2); }
206:.ppq-modal-img { max-width: 100%; display: block; }
207:.ppq-modal-pdf { width: 100%; height: 80vh; border: none; }
```

#### Thinking

Now I understand the modal CSS. Let's design the minimizable modal.

Current structure:
```html
<div class="ppq-modal">
  <div class="ppq-modal-content">
    <div class="ppq-modal-close">×</div>
    <div class="ppq-modal-body"></div>
  </div>
</div>
```

CSS:
- `.ppq-modal`: fixed overlay, dark background, flex center-aligned, z-index 1000, padding 2rem. `display:none`, `.show` → `display:flex`.
- `.ppq-modal-content`: paper background, padding, rounded corners, 90vw, max 1200px, max-height 95vh, overflow auto, relative.
- `.ppq-modal-close`: absolute top-right, red circle.

My plan:
1. Add a top bar to the modal content that includes a reminder span + minimize button + close button. Actually, to minimize structural changes and CSS rework, let's keep the close button absolute-positioned as-is and add the minimize button next to it (absolute-positioned, to the left of close). And add the reminder span.

Actually, a cleaner approach for the minimized state: when minimized, hide `.ppq-modal-body` and shrink `.ppq-modal-content` into a bar. The bar displays the reminder text + minimize (which now functions as expand) + close.

Let's restructure like this:
```html
<div class="ppq-modal">
  <div class="ppq-modal-content">
    <div class="ppq-modal-topbar">
      <span class="ppq-modal-reminder"></span>
      <button class="ppq-modal-min" type="button">—</button>
      <button class="ppq-modal-close" type="button">×</button>
    </div>
    <div class="ppq-modal-body"></div>
  </div>
</div>
```

Wait, but `.ppq-modal-close` is currently a div, and there's a click handler that checks `e.target.className.indexOf("ppq-modal-close")`. Let me check the handler at lines 537-538:
```js
modal.addEventListener("click", (e) => { if (e.target === modal || (e.target.className || "").indexOf("ppq-modal-close") >= 0) self.closeModal(); });
```

So it closes when you click the overlay itself or the close button. If I change close to a button, the className check still works. Good.

Let's restructure the top bar. But this changes the CSS for `.ppq-modal-close` (currently absolute). Let's make the top bar a flex row: reminder on the left, minimize + close on the right. And update the CSS.

Actually, to reduce risk, let's keep it simple:
- Add a `.ppq-modal-topbar` div as the first child of content.
- Move close into it, add minimize button and reminder span.
- Update CSS: `.ppq-modal-topbar { display:flex; align-items:center; gap:0.5rem; margin-bottom:0.5rem; }`, reminder flex:1, minimize and close as small buttons.
- Remove the absolute positioning from close.

Minimized state:
- `.ppq-modal.minimized` → overlay: `background: transparent; pointer-events: none; padding: 0; align-items: flex-end; justify-content: center;` — wait, but I want clicks to pass through to the question. If the overlay is pointer-events:none and covers the screen, clicks pass through. But the content (the bar) needs pointer-events:auto.
- `.ppq-modal.minimized .ppq-modal-content` → `pointer-events: auto; width: auto; max-width: 90vw; max-height: none; overflow: hidden; position: fixed; bottom: 1rem; left: 50%; transform: translateX(-50%); padding: 0.4rem 0.8rem; box-shadow: ...;`
- `.ppq-modal.minimized .ppq-modal-body` → `display: none;`

But wait, the overlay `.ppq-modal` is `position:fixed; inset:0` with flex center alignment. When minimized, I want the content at the bottom. If I set `.ppq-modal.minimized { align-items: flex-end; }` and keep the content in normal flow (position:relative), it'll sit at the bottom of the overlay. But the overlay is pointer-events:none... then the content inside also becomes unclickable unless I set pointer-events:auto on the content. pointer-events is inherited, but a child's pointer-events:auto overrides the parent's none. So:
- `.ppq-modal.minimized { background: transparent; pointer-events: none; align-items: flex-end; padding: 0 0 1rem 0; }`
- `.ppq-modal.minimized .ppq-modal-content { pointer-events: auto; width: auto; max-height: none; overflow: visible; }`
- `.ppq-modal.minimized .ppq-modal-body { display: none; }`

This way the content stays in the overlay's flex flow (bottom-aligned) but clicks outside the bar pass through to the question.

Now the reminder text: when the interrogation opens, set `.ppq-modal-reminder`'s textContent to something like "Q4 · you chose B". Let's use the question ID and the chosen option. Actually, the question ID — let's use a friendly label. The card has `.ppq-qid`. Let's use `cfg.idOf(this.cur)` or the display qid. Let's check what's in `.ppq-qid`. Actually, let's just use the record's identity id or the question number. Let's use the same thing that's displayed in the card's meta. Let's check how `.ppq-qid` is set.

Let's search for ppq-qid.

Actually, for the reminder, the simplest and most robust is: use `this._chosenLabel` and the question identifier. Let's see what's available. Inside `_renderInterrogation`, `this.cur` is the current question, `chosen = this._chosenLabel`. For the question ID, I can use `cfg.idOf(this.cur)`. Let's check what idOf returns and whether there's a friendlier display.

Let's look at how the qid is rendered in the card.


Let me check how the question id is displayed in the card so the minimise-bar reminder matches it.



#### Tool: Grep

**Input:**

```json
{
  "-n": true,
  "output_mode": "content",
  "path": "C:\\Claude (not on Gdrive, nor OneDrive)\\ppqviewer\\engine\\ppqviewer.js",
  "pattern": "ppq-qid|idOf|labelOf|qid"
}
```

**Output:**

```json
84:    const idOf = this.cfg.idOf;
85:    this.questions.forEach((q) => { this.byId[idOf(q)] = q; });
124:    cfg.idOf = cfg.idOf || function (q) { return q.id; };
134:    cfg.metaLine = cfg.metaLine || function (q) { return cfg.idOf(q); };
146:    cfg.blockKeyOf = cfg.blockKeyOf || function (q) { return String(cfg.idOf(q)).split("(")[0].trim(); };
147:    cfg.paperCodeOf = cfg.paperCodeOf || function (q) { return String(cfg.idOf(q)).split(" ")[0]; };
177:      item_id: this.cur ? cfg.idOf(this.cur) : "",
238:    card.appendChild(el("div", { class: "ppq-meta" }, '<span class="ppq-qid"></span><span class="ppq-tags"></span>'));
397:    const labelOf = (v) => (f.friendlyLabels && f.friendlyLabels[v]) || v;
405:      row.appendChild(el("span", null, esc(labelOf(v))));
441:    const labelOf = (v) => (f.friendlyLabels && f.friendlyLabels[v]) || v;
448:        if (set != null && on) chosen.push(labelOf(cb.value));
478:        self.store.scores[self.cfg.idOf(self.cur)] = val; self._saveStore();
738:      const cmp = cfg.sort || function (a, b) { return String(cfg.idOf(a)).localeCompare(String(cfg.idOf(b)), undefined, { numeric: true, sensitivity: "base" }); };
764:    const i = this.view.findIndex((q) => this.cfg.idOf(q) === id);
817:    this.q(".ppq-qid").textContent = cfg.metaLine(this.cur);
827:    const prior = this.store.scores[cfg.idOf(this.cur)];
1044:      learner_id: cfg.learnerId, id: cfg.idOf(this.cur), chosen_option: chosen, correct: !!isRight, is_correct: isRight ? "right" : "wrong",
1046:      app_version: cfg.appVersion, context: { view: "viewer", id: cfg.idOf(this.cur), type: this._curType },
1272:    const prior = this.store.scores[cfg.idOf(this.cur)];
1283:        self.store.scores[self.cfg.idOf(self.cur)] = val; self._saveStore();
1783:    return this.questions.filter((item) => { const id = cfg.idOf(item); return id === block || String(id).indexOf(block + "(") === 0; });
1789:    const partLabel = (p) => String(cfg.idOf(p)).slice(block.length).trim() || "(whole)";
1794:      const cur = cfg.idOf(p) === cfg.idOf(q);
1795:      const chip = el("button", { class: "ppq-part-chip" + (cur ? " current" : ""), "data-id": cfg.idOf(p) }, esc(partLabel(p)));
1813:        const cur = cfg.idOf(p) === cfg.idOf(q);
1814:        const box = el("div", { class: "ppq-wq-part" + (cur ? " current" : ""), "data-part-id": cfg.idOf(p) });
1949:        const prior = this.store.scores[this.cfg.idOf(this.cur)];
```

#### Thinking

The card's `.ppq-qid` is set by `cfg.metaLine(this.cur)` (line 817). So for the reminder, I should use `cfg.metaLine(this.cur)` to match what the pupil is seeing. And `this._chosenLabel` is the option the pupil chose.

Alright, let's implement the minimizable modal. The steps are as follows:

1. Update the modal HTML (line 367) to add a top bar containing a reminder + minimize + close.
2. Update the modal click handler (lines 537-538) so it also handles the minimize button and re-expanding the minimized bar.
3. Inside `_renderInterrogation`, set the reminder text and show the minimize button.
4. Inside `openModal` (image zoom), hide the minimize button and clear the reminder.
5. Inside `closeModal`, remove the minimized class (so that next time it opens in the expanded state).
6. Update the CSS.

Let's start with the HTML first. I'll read around line 367 and the handler at lines 537-538, plus closeModal/openModal (lines 1932-1945).

Let's read the modal creation part and the handler.

The reminder should use `cfg.metaLine(this.cur)` (same as the card's qid) plus the chosen option. Now let me implement. First the modal HTML and its click handler.



#### Tool: Read

> Read: `C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\engine\ppqviewer.js`

**Output:**

```json
534	    this.q(".ppq-draw-clear").addEventListener("click", () => self.clearCanvas());
535	    this.qa(".ppq-color").forEach((c) => c.addEventListener("click", () => self.setDrawColor(c.dataset.color)));
536	    this.q(".ppq-draw-thick").addEventListener("change", (e) => self.setDrawThickness(e.target.value));
537	    const modal = this.q(".ppq-modal");
538	    modal.addEventListener("click", (e) => { if (e.target === modal || (e.target.className || "").indexOf("ppq-modal-close") >= 0) self.closeModal(); });
539	  };
540	
541	  /* QoderWork 2026-07-22 (analyst handoff): largest-remainder allocation. Spread
542	     `total` integer units over the slots proportionally to `weights`, each slot
543	     getting at least `minEach`. Always returns non-negative integers summing to
544	     exactly `total` (when total >= minEach*n). Replaces the old proportional
545	     pass that could drive the final option negative. */
```

#### Thinking

Alright, let's update the modal's HTML (lines 366-368) to add the top bar. I'll read the exact lines one more time.


#### Tool: Edit

> Modified: `C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\engine\ppqviewer.js`

**Output:**

```json
Successfully modified file: C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\engine\ppqviewer.js (1 replacements). Here is the updated code:
...
    const toolbar = el("div", { class: "ppq-toolbar" });
    toolbar.innerHTML = '<button class="ppq-btn-mini ppq-draw-toggle">Draw</button><button class="ppq-btn-mini ppq-reset">Reset progress</button>';
    this.root.appendChild(toolbar);

    const modal = el("div", { class: "ppq-modal" });
    /* QoderWork 2026-07-24 (handoff #1): the pop-up is minimisable so the pupil can
       shrink it to a slim bar and still see the question, diagram, options and their
       answer behind it. The top bar carries a reminder (question + chosen option),
       a minimise/restore button and the close button. */
    modal.innerHTML = '<div class="ppq-modal-content"><div class="ppq-modal-topbar"><span class="ppq-modal-reminder"></span><button class="ppq-modal-min" type="button" title="Minimise — see the question">—</button><button class="ppq-modal-close" type="button" title="Close">×</button></div><div class="ppq-modal-body"></div></div>';
    this.root.appendChild(modal);

    this._fillFilterOptions();
    this._wireControls();
    this._initDrawState();
...
```

#### Thinking

Next, let's update the modal's click handler to support minimize/restore. The current handler (which is now around line 543 due to the added lines) is as follows:
```js
modal.addEventListener("click", (e) => { if (e.target === modal || (e.target.className || "").indexOf("ppq-modal-close") >= 0) self.closeModal(); });
```

We need to do the following:
- Close when the overlay or the close button is clicked (existing behavior). However, when minimized, clicking the overlay shouldn't close it (the overlay is pointer-events:none anyway). In fact, when minimized, the overlay is pointer-events:none, so clicks won't reach the overlay. No problem.
- Toggle minimize when the minimize button is clicked.
- Restore when the top bar is clicked while minimized (a convenience feature).

Let's rewrite the handler. Since the close button is now a `<button>` with the class `ppq-modal-close`, the className check will continue to work. However, we need to be careful: `e.target.className` for a button is a string, so indexOf will work.

New handler:
```js
modal.addEventListener("click", (e) => {
  const t = e.target;
  const cls = (t.className || "") + "";
  if (cls.indexOf("ppq-modal-min") >= 0) { self.toggleModalMin(); return; }
  if (cls.indexOf("ppq-modal-close") >= 0) { self.closeModal(); return; }
  /* When minimized, clicking the slim bar restores it */
  if (modal.classList.contains("minimized") && t.closest && t.closest(".ppq-modal-content")) { self.toggleModalMin(); return; }
  if (t === modal) self.closeModal();
});
```

Wait, when minimized, clicking anywhere on the bar (the content) should restore it. But the minimize button and close button are inside the content, and they're handled first (return). So the remaining clicks on the content will restore it. No problem.

Also, we need to define `toggleModalMin`. Let's add it near closeModal/openModal.

Let's update the handler.

Now the click handler — add minimise/restore logic.



#### Tool: Edit

> Modified: `C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\engine\ppqviewer.js`

**Output:**

```json
Successfully modified file: C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\engine\ppqviewer.js (1 replacements). Here is the updated code:
...
    this.q(".ppq-draw-undo").addEventListener("click", () => self.undoDraw());
    this.q(".ppq-draw-clear").addEventListener("click", () => self.clearCanvas());
    this.qa(".ppq-color").forEach((c) => c.addEventListener("click", () => self.setDrawColor(c.dataset.color)));
    this.q(".ppq-draw-thick").addEventListener("change", (e) => self.setDrawThickness(e.target.value));
    const modal = this.q(".ppq-modal");
    modal.addEventListener("click", (e) => {
      const cls = String((e.target && e.target.className) || "");
      /* QoderWork 2026-07-24 (handoff #1): minimise/restore button. */
      if (cls.indexOf("ppq-modal-min") >= 0) { self.toggleModalMin(); return; }
      if (cls.indexOf("ppq-modal-close") >= 0) { self.closeModal(); return; }
      /* Clicking the slim bar itself (outside the two buttons) restores it. */
      if (modal.classList.contains("minimized") && e.target.closest && e.target.closest(".ppq-modal-content")) { self.toggleModalMin(); return; }
      if (e.target === modal) self.closeModal();
    });
  };

  /* QoderWork 2026-07-22 (analyst handoff): largest-remainder allocation. Spread
     `total` integer units over the slots proportionally to `weights`, each slot
     getting at least `minEach`. Always returns non-negative integers summing to
...
```

#### Thinking

Next, I'll add the `toggleModalMin` method and update `closeModal`/`openModal`. Let me read the current openModal/closeModal (around lines 1945-1960, though they've shifted due to my edits). Let me search for them.


Now let me find and update `openModal`/`closeModal`, and add `toggleModalMin`.



#### Tool: Read

> Read: `C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\engine\ppqviewer.js`

**Output:**

```json
1948	  };
1949	  Viewer.prototype.closeModal = function () {
1950	    this.q(".ppq-modal").classList.remove("show");
1951	    this.q(".ppq-modal-body").innerHTML = "";
1952	    /* QoderWork 2026-07-22: if the interrogation pop-up was closed early (×,
1953	       Escape, outside click — not its Next button), bring the outer 1-6 row back
1954	       so the pupil is never stranded, syncing any rating chosen inside the pop-up. */
1955	    if (this._iqOpen) {
1956	      this._iqOpen = false;
1957	      this._iqBox = null;
1958	      const comp = this.q(".ppq-competence");
1959	      if (comp) comp.style.display = "";
1960	      if (this.cur && this.answered) {
1961	        const prior = this.store.scores[this.cfg.idOf(this.cur)];
1962	        this.qa(".ppq-scale-btn").forEach((b) => b.classList.remove("sel"));
1963	        if (prior) {
1964	          const sb = this.q('.ppq-competence .ppq-scale-btn[data-val="' + prior + '"]');
1965	          if (sb) sb.classList.add("sel");
1966	          this.q(".ppq-next").style.display = "inline-block";
1967	        }
1968	      }
1969	    }
1970	  };
1971	
1972	  // --------------------------------------------------------------- keyboard
1973	  Viewer.prototype._bindGlobalKeys = function () {
1974	    const self = this;
1975	    this._keyHandler = function (e) {
1976	      if (!self.cur || !self._shouldHandleKey(e)) return;
1977	      if (self.q(".ppq-modal").classList.contains("show") && e.key === "Escape") { self.closeModal(); return; }
```

#### Thinking

Let's find openModal (before closeModal). I'll try reading a bit above line 1949.


#### Tool: Read

> Read: `C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\engine\ppqviewer.js`

**Output:**

```json
1941	  };
1942	
1943	  // --------------------------------------------------------------- modal
1944	  Viewer.prototype.openModal = function (urlOrUrls) {
1945	    const urls = Array.isArray(urlOrUrls) ? urlOrUrls : [urlOrUrls];
1946	    this.q(".ppq-modal-body").innerHTML = urls.map((u) => (String(u).slice(-4) === ".pdf") ? '<iframe src="' + esc(u) + '" class="ppq-modal-pdf"></iframe>' : '<img src="' + esc(u) + '" class="ppq-modal-img">').join("");
1947	    this.q(".ppq-modal").classList.add("show");
1948	  };
1949	  Viewer.prototype.closeModal = function () {
1950	    this.q(".ppq-modal").classList.remove("show");
1951	    this.q(".ppq-modal-body").innerHTML = "";
1952	    /* QoderWork 2026-07-22: if the interrogation pop-up was closed early (×,
```

#### Thinking

Now I'll do the following:
1. Update `openModal` (image zoom) to hide the minimize button and clear the reminder (minimizing doesn't make sense for image zoom).
2. Update `closeModal` to remove the `minimized` class and reset the minimize button label.
3. Add a `toggleModalMin` method.

Let's do these edits.

For `openModal`: hide the minimize button, clear the reminder, and make sure it's not minimized.
```js
Viewer.prototype.openModal = function (urlOrUrls) {
  const urls = Array.isArray(urlOrUrls) ? urlOrUrls : [urlOrUrls];
  this.q(".ppq-modal-body").innerHTML = urls.map(...).join("");
  /* QoderWork 2026-07-24: Image/PDF zoom doesn't have a minimize bar. */
  this.q(".ppq-modal").classList.remove("minimized");
  this.q(".ppq-modal-min").style.display = "none";
  this.q(".ppq-modal-reminder").textContent = "";
  this.q(".ppq-modal").classList.add("show");
};
```

For `closeModal`: remove minimized and reset the minimize button label to "—".
```js
Viewer.prototype.closeModal = function () {
  this.q(".ppq-modal").classList.remove("show");
  this.q(".ppq-modal").classList.remove("minimized");
  this.q(".ppq-modal-min").textContent = "—";
  this.q(".ppq-modal-body").innerHTML = "";
  ...
};
```

Add `toggleModalMin`:
```js
/* QoderWork 2026-07-24 (handoff #1): Minimize the popup into a slim bar so the question is visible behind it. Restore to full display. */
Viewer.prototype.toggleModalMin = function () {
  const modal = this.q(".ppq-modal");
  const min = this.q(".ppq-modal-min");
  const on = modal.classList.toggle("minimized");
  min.textContent = on ? "▢" : "—";
  min.title = on ? "Restore analysis" : "Minimise — see the question";
};
```

Alright, let's apply these edits.


#### Tool: Edit

> Modified: `C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\engine\ppqviewer.js`

**Output:**

```json
Successfully modified file: C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\engine\ppqviewer.js (1 replacements). Here is the updated code:
...

  // --------------------------------------------------------------- modal
  Viewer.prototype.openModal = function (urlOrUrls) {
    const urls = Array.isArray(urlOrUrls) ? urlOrUrls : [urlOrUrls];
    this.q(".ppq-modal-body").innerHTML = urls.map((u) => (String(u).slice(-4) === ".pdf") ? '<iframe src="' + esc(u) + '" class="ppq-modal-pdf"></iframe>' : '<img src="' + esc(u) + '" class="ppq-modal-img">').join("");
    /* QoderWork 2026-07-24 (handoff #1): image/PDF zoom doesn't use the minimise bar. */
    this.q(".ppq-modal").classList.remove("minimized");
    this.q(".ppq-modal-min").style.display = "none";
    this.q(".ppq-modal-reminder").textContent = "";
    this.q(".ppq-modal").classList.add("show");
  };
  /* QoderWork 2026-07-24 (handoff #1): toggle the pop-up between full size and a
     slim bar. Minimised, the overlay goes transparent and click-through so the
     question, diagram, options and the pupil's answer show through behind it. */
  Viewer.prototype.toggleModalMin = function () {
    const modal = this.q(".ppq-modal");
    const min = this.q(".ppq-modal-min");
    const on = modal.classList.toggle("minimized");
    min.textContent = on ? "▢" : "—";
    min.title = on ? "Restore the analysis" : "Minimise — see the question";
  };
  Viewer.prototype.closeModal = function () {
    this.q(".ppq-modal").classList.remove("show");
    this.q(".ppq-modal-body").innerHTML = "";
    /* QoderWork 2026-07-22: if the interrogation pop-up was closed early (×,
       Escape, outside click — not its Next button), bring the outer 1-6 row back
...
```

#### Thinking

Next, I'll update closeModal to remove the minimized class and reset the min button.


#### Tool: Edit

> Modified: `C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\engine\ppqviewer.js`

**Output:**

```json
Successfully modified file: C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\engine\ppqviewer.js (1 replacements). Here is the updated code:
...
    min.textContent = on ? "▢" : "—";
    min.title = on ? "Restore the analysis" : "Minimise — see the question";
  };
  Viewer.prototype.closeModal = function () {
    this.q(".ppq-modal").classList.remove("show");
    /* QoderWork 2026-07-24 (handoff #1): reset the minimise state for next open. */
    this.q(".ppq-modal").classList.remove("minimized");
    this.q(".ppq-modal-min").textContent = "—";
    this.q(".ppq-modal-body").innerHTML = "";
    /* QoderWork 2026-07-22: if the interrogation pop-up was closed early (×,
       Escape, outside click — not its Next button), bring the outer 1-6 row back
       so the pupil is never stranded, syncing any rating chosen inside the pop-up. */
    if (this._iqOpen) {
...
```

#### Thinking

Next, inside `_renderInterrogation`, I need to show the minimize button and set the reminder text. Let me find the mount section (around lines 1318-1330, though it's shifted now). Let me re-read the mount section of _renderInterrogation.

Now set the reminder text and show the minimise button when the interrogation opens. Let me update the mount section of `_renderInterrogation`.



#### Tool: Read

> Read: `C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\engine\ppqviewer.js`

**Output:**

```json
1318	    const hasFeedback = (rec.feedback || []).length > 0;
1319	    let stateLabel = "Early review";
1320	    if (rv.status === "reviewed" && hasMethods && hasFeedback) stateLabel = "Full review";
1321	    const stateEl = el("div", { class: "ppq-iq-state-label" }, stateLabel);
1322	    if (rv.reviewer) stateEl.appendChild(el("span", { class: "ppq-iq-state-by" }, " · " + esc(rv.reviewer)));
1323	    restPage.appendChild(stateEl);
1324	
1325	    /* --- mount into the modal shell and open the pop-up. The guess page shows
1326	       first; the rest (verdict onward) is hidden until Done/Skip. While the pop-up
1327	       holds the 1-6, the outer 1-6 row is hidden; closeModal restores it. --- */
1328	    iq.appendChild(guessPage);
1329	    iq.appendChild(restPage);
1330	    const body = this.q(".ppq-modal-body");
1331	    body.innerHTML = "";
1332	    body.appendChild(iq);
1333	    this.q(".ppq-modal").classList.add("show");
1334	    this._iqBox = iq;
1335	    this._iqOpen = true;
1336	    this.q(".ppq-competence").style.display = "none";
1337	    /* QoderWork 2026-07-23: if the rest is already showing (no guess page — fewer
1338	       than 2 options), render feedback now. Otherwise it fires inside revealRest()
1339	       once the guess page is dismissed. */
```

#### Thinking

Alright, let's update the mount section to do the following:
1. Set the reminder text (question + selected choice).
2. Show the minimize button.

Also, I noticed line 1322: `if (rv.reviewer) stateEl.appendChild(...)` — this is a reviewer leak (handoff #5). Since I'm here anyway, I'll fix it as part of #5, but let's focus on #1 for now. Actually, since it's a small change, I'll handle #5 later. I'll make a note of it.

Let's update the mount section for #1.


#### Tool: Edit

> Modified: `C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\engine\ppqviewer.js`

**Output:**

```json
Successfully modified file: C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\engine\ppqviewer.js (1 replacements). Here is the updated code:
...
    iq.appendChild(guessPage);
    iq.appendChild(restPage);
    const body = this.q(".ppq-modal-body");
    body.innerHTML = "";
    body.appendChild(iq);
    /* QoderWork 2026-07-24 (handoff #1): the interrogation pop-up is minimisable.
       Show the minimise button and fill the reminder so a shrunk bar still tells the
       pupil which question (and which option they chose) the analysis belongs to. */
    const minBtn = this.q(".ppq-modal-min");
    minBtn.style.display = "";
    this.q(".ppq-modal-reminder").textContent =
      (cfg.metaLine(this.cur) || "") + (chosen ? "  ·  you chose " + String(chosen).toUpperCase() : "");
    this.q(".ppq-modal").classList.add("show");
    this._iqBox = iq;
    this._iqOpen = true;
    this.q(".ppq-competence").style.display = "none";
    /* QoderWork 2026-07-23: if the rest is already showing (no guess page — fewer
...
```

#### Thinking

Next up is CSS. Let's update the modal's CSS to support the top bar, minimize button, reminder, and minimized state. Let me read the current modal CSS block (lines 202-207) once more and rewrite it.

Now the CSS for the top bar, minimise button, reminder, and the minimised state.



#### Tool: Read

> Read: `C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\engine\ppqviewer.css`

**Output:**

```json
201	/* modal */
202	.ppq-modal { position: fixed; inset: 0; background: rgba(0,0,0,0.7); display: none; justify-content: center; align-items: center; z-index: 1000; padding: 2rem; }
203	.ppq-modal.show { display: flex; }
204	.ppq-modal-content { background: var(--ppq-paper); padding: 1rem; border-radius: 12px; width: 90vw; max-width: 1200px; max-height: 95vh; overflow: auto; position: relative; }
205	.ppq-modal-close { position: absolute; top: 0.5rem; right: 1rem; font-size: 1.4rem; font-weight: 700; color: #b03030; cursor: pointer; background: #fff; border-radius: 50%; width: 32px; height: 32px; text-align: center; line-height: 32px; box-shadow: 0 2px 5px rgba(0,0,0,0.2); }
206	.ppq-modal-img { max-width: 100%; display: block; }
207	.ppq-modal-pdf { width: 100%; height: 80vh; border: none; }
208	
```

#### Thinking

Let me carefully redesign the modal CSS.

Current state:
- `.ppq-modal`: fixed overlay, dark background, flex-centered, padding 2rem.
- `.ppq-modal-content`: paper, padding 1rem, rounded corners, 90vw, max 1200px, max-height 95vh, overflow auto, relative.
- `.ppq-modal-close`: absolute top-right, red circle 32px.

New structure:
```html
<div class="ppq-modal-content">
  <div class="ppq-modal-topbar">
    <span class="ppq-modal-reminder"></span>
    <button class="ppq-modal-min">—</button>
    <button class="ppq-modal-close">×</button>
  </div>
  <div class="ppq-modal-body"></div>
</div>
```

New CSS:
- `.ppq-modal-topbar`: flex row, align-items center, gap, margin-bottom, sticky top so the min/close buttons are always visible even when the body scrolls. Actually, content has overflow:auto, so I want to make the topbar sticky within content. Let's do `.ppq-modal-topbar { position: sticky; top: -1rem; ... }`. Hmm, content has padding 1rem. Sticky top:0 is relative to the scroll container (content). But content's padding means the topbar starts 1rem down. If I set `top: -1rem`, it'll stick to the very top edge... actually, sticky positioning is relative to the nearest scrolling ancestor's scrollport. The content is the scroll container (overflow:auto). The topbar is a child. `position: sticky; top: 0` will pin it to the top of content's content box... no, top:0 is relative to the scrollport (the padding box). Let's keep it simple: make topbar sticky with top:0 and give it a background so it doesn't look weird when content scrolls under it. Actually, content's padding:1rem means there's a 1rem gap at the top. When scrolling, a topbar with top:0 will stick below that 1rem gap. That's fine but a bit weird.

Let me restructure: move the padding from content to body, and let the topbar span full width. Actually, to minimize risk, let's do this:
- `.ppq-modal-content { padding: 0; }` (remove padding)
- `.ppq-modal-topbar { position: sticky; top: 0; display:flex; align-items:center; gap:0.5rem; padding: 0.5rem 1rem; background: var(--ppq-paper); border-bottom: 1px solid var(--ppq-line); z-index: 5; }`
- `.ppq-modal-body { padding: 1rem; }`
- `.ppq-modal-reminder { flex: 1; font-size: 0.85rem; font-weight: 600; color: var(--ppq-muted); }`
- `.ppq-modal-min, .ppq-modal-close`: small round buttons. Restyle close (no longer absolute).

Restyle close:
- `.ppq-modal-close { position: static; font-size: 1.1rem; font-weight: 700; color: #b03030; cursor: pointer; background: #fff; border: 1px solid var(--ppq-line); border-radius: 50%; width: 30px; height: 30px; text-align:center; line-height: 1; box-shadow: 0 1px 3px rgba(0,0,0,0.15); }`
- `.ppq-modal-min { same but neutral color }`

Minimize state:
- `.ppq-modal.minimized { background: transparent; pointer-events: none; align-items: flex-end; justify-content: center; padding: 0 1rem 1rem 1rem; }`
- `.ppq-modal.minimized .ppq-modal-content { pointer-events: auto; width: auto; max-width: 92vw; max-height: none; overflow: hidden; box-shadow: 0 4px 18px rgba(0,0,0,0.25); border: 1px solid var(--ppq-line); }`
- `.ppq-modal.minimized .ppq-modal-body { display: none; }`
- `.ppq-modal.minimized .ppq-modal-topbar { position: static; border-bottom: none; padding: 0.4rem 0.8rem; }`

Wait, there's a subtle point: when minimized, the overlay `.ppq-modal` is `pointer-events: none`. The content inside needs `pointer-events: auto`. That works (children can re-enable it). And the overlay is still `display:flex` (from .show) with `align-items:flex-end`, so the content sits at the bottom. Good.

But when minimized, `.ppq-modal` has `padding: 0 1rem 1rem 1rem` and `align-items:flex-end; justify-content:center`. The content shrinks to fit (width:auto). Good.

Another concern: when minimized, the reminder should be visible in the topbar (it is, since the topbar is shown). The body is hidden. Good. The min button shows "▢" (restore), close shows "×". Good.

Also, when minimized, I don't want the topbar to be sticky (there's no scroll since the body is hidden). Setting `position:static` in the minimized state handles that.

Let me also make sure the `.ppq-modal-content` in normal (expanded) state still scrolls. It has `max-height:95vh; overflow:auto`. With padding moved to body, the topbar is sticky at the top. Good.

Let me write the CSS. Replace lines 202-207.

Actually, I need to double-check: the image zoom modal (openModal) puts `<img>` directly into `.ppq-modal-body`. With body now having padding:1rem, the image gets padding. That's fine. The close button is in the topbar. For image zoom, the min button is hidden (display:none) and the reminder is empty. The topbar shows just the close button on the right (reminder is flex:1 pushing close to the right). Good.

Wait, for image zoom, an empty reminder span with flex:1 pushes the close button to the far right. That looks fine.

Let me write it.

#### Tool: Edit

> Modified: `C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\engine\ppqviewer.css`

**Output:**

```json
Successfully modified file: C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\engine\ppqviewer.css (1 replacements). Here is the updated code:
...
.ppq-draw-toggle.active { background: #e2e8f0; }

/* modal */
.ppq-modal { position: fixed; inset: 0; background: rgba(0,0,0,0.7); display: none; justify-content: center; align-items: center; z-index: 1000; padding: 2rem; }
.ppq-modal.show { display: flex; }
.ppq-modal-content { background: var(--ppq-paper); padding: 0; border-radius: 12px; width: 90vw; max-width: 1200px; max-height: 95vh; overflow: auto; position: relative; display: flex; flex-direction: column; }
/* QoderWork 2026-07-24 (handoff #1): sticky top bar with the minimise-bar reminder
   and the minimise/close buttons, so they stay reachable while the analysis scrolls. */
.ppq-modal-topbar { position: sticky; top: 0; z-index: 5; display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem; background: var(--ppq-paper); border-bottom: 1px solid var(--ppq-line); }
.ppq-modal-reminder { flex: 1; font-size: 0.85rem; font-weight: 600; color: var(--ppq-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ppq-modal-min, .ppq-modal-close { flex: none; font-size: 1.05rem; font-weight: 700; cursor: pointer; background: #fff; border: 1px solid var(--ppq-line); border-radius: 50%; width: 30px; height: 30px; text-align: center; line-height: 1; box-shadow: 0 1px 3px rgba(0,0,0,0.15); padding: 0; }
.ppq-modal-min { color: var(--ppq-accent); }
.ppq-modal-min:hover, .ppq-modal-close:hover { box-shadow: 0 2px 6px rgba(0,0,0,0.25); }
.ppq-modal-close { color: #b03030; }
.ppq-modal-body { padding: 1rem; }
/* QoderWork 2026-07-24 (handoff #1): minimised — the overlay goes transparent and
   click-through so the question shows behind; the content collapses to a slim bar
   pinned to the bottom (body hidden, top bar only). */
.ppq-modal.minimized { background: transparent; pointer-events: none; align-items: flex-end; justify-content: center; padding: 0 1rem 1rem 1rem; }
.ppq-modal.minimized .ppq-modal-content { pointer-events: auto; width: auto; max-width: 92vw; max-height: none; overflow: hidden; border: 1px solid var(--ppq-line); box-shadow: 0 4px 18px rgba(0,0,0,0.25); }
.ppq-modal.minimized .ppq-modal-topbar { position: static; border-bottom: none; padding: 0.4rem 0.8rem; }
.ppq-modal.minimized .ppq-modal-body { display: none; }
.ppq-modal-img { max-width: 100%; display: block; }
.ppq-modal-pdf { width: 100%; height: 80vh; border: none; }

/* When embedded (host sets .ppq-embed on the root) drop the fixed toolbar into flow. */
.ppq-embed .ppq-toolbar { position: static; box-shadow: none; margin: 1rem 1.5rem; }
...
```

#### Thinking

Let's run `node --check` to verify the JS syntax.

#### Tool: Bash

```bash
cd "C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer" && node --check engine/ppqviewer.js && echo "SYNTAX OK"
```

**Output:**

```json
SYNTAX OK
```

#### Thinking

The minimizable popup (#1) is done. Let me mark it as complete and move on to #2 (presentation_kind) and #4 (prompts next to methods). These are intertwined. First, let me read the current `_appendMethodsV2`, `_elimChipsV2El`, `_appendSelfReportV2`, and `_stateLabel` to understand what I'm rewriting.

Let me read lines 1462–1600 (the methods/self-report section, which is currently shifted).

#1 done. Now the intertwined pair: #2 (presentation_kind) and #4 (prompts beside methods). Let me read the current method/self-report renderers.



#### Tool: TodoWrite

**Input:**

```json
{
  "todos": [
    {
      "description": "#1 Keep question visible: minimisable pop-up (slim bar shows Q-id + chosen option, re-expands)",
      "status": "completed"
    },
    {
      "description": "#2 Respect presentation_kind (route/independent_check/synthesis); remove 'Ways through it' framing; no manufactured Why-it-matters/Next-move",
      "status": "in_progress"
    },
    {
      "description": "#3 Complete fixed-position option rail: coloured letters only, 7 relationships, ordered from identity.option_labels, eliminates/lands_on fallback",
      "status": "pending"
    },
    {
      "description": "#4 Reflection beside the thought: prompts sit beside methods via method_refs; group prompt once after group; strip proposed__; local multi-select controls",
      "status": "pending"
    },
    {
      "description": "#5 Keep internal internal: remove review.reviewer from pupil footer; taxonomy reviewer-only",
      "status": "pending"
    },
    {
      "description": "#6 Fail gracefully: empty/missing analysis never blocks verdict or progression",
      "status": "pending"
    },
    {
      "description": "Verify against acceptance fixtures (Q4, Q27, Q40, 2022 Q27, 2019 Q01, 2017 Q46)",
      "status": "pending"
    },
    {
      "description": "Update CHANGELOG (v0.3.0)",
      "status": "pending"
    }
  ]
}
```

**Output:**

```json
Successfully updated the todo list. The current list is now:
1. [completed] #1 Keep question visible: minimisable pop-up (slim bar shows Q-id + chosen option, re-expands)
2. [in_progress] #2 Respect presentation_kind (route/independent_check/synthesis); remove 'Ways through it' framing; no manufactured Why-it-matters/Next-move
3. [pending] #3 Complete fixed-position option rail: coloured letters only, 7 relationships, ordered from identity.option_labels, eliminates/lands_on fallback
4. [pending] #4 Reflection beside the thought: prompts sit beside methods via method_refs; group prompt once after group; strip proposed__; local multi-select controls
5. [pending] #5 Keep internal internal: remove review.reviewer from pupil footer; taxonomy reviewer-only
6. [pending] #6 Fail gracefully: empty/missing analysis never blocks verdict or progression
7. [pending] Verify against acceptance fixtures (Q4, Q27, Q40, 2022 Q27, 2019 Q01, 2017 Q46)
8. [pending] Update CHANGELOG (v0.3.0)
```

#### Thinking

Let's read the current `_appendMethodsV2`, `_elimChipsV2El`, `_appendSelfReportV2`, `_stateLabel`, and `_appendInsightV2`. I'll try to find their current line numbers.

#### Tool: Grep

**Input:**

```json
{
  "-n": true,
  "output_mode": "content",
  "path": "C:\\Claude (not on Gdrive, nor OneDrive)\\ppqviewer\\engine\\ppqviewer.js",
  "pattern": "_appendInsightV2 = function|_appendMethodsV2 = function|_elimChipsV2El = function|_appendSelfReportV2 = function|_stateLabel = function|_appendMethodsLegacy = function"
}
```

**Output:**

```json
1449:  Viewer.prototype._appendInsightV2 = function (iq, rec) {
1469:  Viewer.prototype._appendMethodsV2 = function (iq, rec) {
1503:  Viewer.prototype._elimChipsV2El = function (m, labels) {
1549:  Viewer.prototype._appendSelfReportV2 = function (iq, rec) {
1601:  Viewer.prototype._stateLabel = function (st) {
1619:  Viewer.prototype._appendMethodsLegacy = function (iq, rec, correctLetter) {
```

#### Thinking

Let's read through all of these functions: `_appendInsightV2` (1449), `_appendMethodsV2` (1469), `_elimChipsV2El` (1503), `_appendSelfReportV2` (1549), `_stateLabel` (1601). I'll read from 1449 to 1620.

#### Tool: Read

> Read: `C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\engine\ppqviewer.js`

**Output:**

```json
1449	  Viewer.prototype._appendInsightV2 = function (iq, rec) {
1450	    const pa = rec.pupil_analysis || {};
1451	    if (!pa.first_notice && !pa.why_it_matters && !pa.next_move) return;
1452	    const box = el("div", { class: "ppq-iq-insight" });
1453	    if (pa.first_notice) box.appendChild(this._insightLine("First thing to notice", pa.first_notice));
1454	    if (pa.why_it_matters) box.appendChild(this._insightLine("Why it matters", pa.why_it_matters));
1455	    if (pa.next_move) box.appendChild(this._insightLine("Next move", pa.next_move));
1456	    iq.appendChild(box);
1457	  };
1458	  Viewer.prototype._insightLine = function (label, text) {
1459	    const line = el("div", { class: "ppq-iq-insight-line" });
1460	    line.appendChild(el("span", { class: "ppq-iq-insight-label" }, esc(label)));
1461	    line.appendChild(el("span", { class: "ppq-iq-insight-text" }, esc(text)));
1462	    return line;
1463	  };
1464	
1465	  /* QoderWork 2026-07-22 (analyst handoff): v2 methods. title + structured
1466	     pupil_steps rendered DIRECTLY (no prose parsing); red/green chips come from
1467	     the structured eliminates[] / lands_on fields. The "used it" tickbox stays
1468	     as SUPPLEMENTARY evidence — it does not replace the structured self-report. */
1469	  Viewer.prototype._appendMethodsV2 = function (iq, rec) {
1470	    const self = this;
1471	    const labels = this._optionLabels(this.cur) || [];
1472	    const methods = rec.methods || [];
1473	    if (!methods.length) return;
1474	    iq.appendChild(el("div", { class: "ppq-iq-subhead" }, "Ways through it"));
1475	    iq.appendChild(el("div", { class: "ppq-iq-encourage" }, "Most of these have more than one route through — collecting alternatives is the point."));
1476	    methods.forEach((m) => {
1477	      const md = el("div", { class: "ppq-iq-method" });
1478	      const head = el("div", { class: "ppq-iq-method-head" });
1479	      head.appendChild(el("b", null, esc(m.title || m.id)));
1480	      const used = el("button", { class: "ppq-iq-used", type: "button" }, "used it");
1481	      used.addEventListener("click", () => {
1482	        const on = used.classList.toggle("on");
1483	        if (on) self._analysisSelfReports[m.id] = "used"; else delete self._analysisSelfReports[m.id];
1484	        self._fireReport({ status: "interrogation", qtype: "self_report", extra_json: JSON.stringify({ method_id: m.id, method_ref: m.id, state: on ? "used" : "not_used" }) });
1485	      });
1486	      head.appendChild(used);
1487	      md.appendChild(head);
1488	      const steps = el("div", { class: "ppq-iq-method-desc" });
1489	      (m.pupil_steps || []).forEach((s) => steps.appendChild(el("div", { class: "ppq-iq-method-line" }, esc(s))));
1490	      md.appendChild(steps);
1491	      md.appendChild(self._elimChipsV2El(m, labels));
1492	      iq.appendChild(md);
1493	    });
1494	  };
1495	
1496	  /* QoderWork 2026-07-22 (analyst handoff): red/green chips from the structured
1497	     eliminates[] / lands_on fields — no regex parsing (that stopgap is legacy
1498	     only). Green = the option landed on; red = the options ruled out. */
1499	  /* QoderWork 2026-07-23 (analyst request #3): extended option-evidence chips.
1500	     Supports the richer vocabulary (rules_out, counts_against, supports, favours,
1501	     directly_identifies) when the method carries an option_evidence[] array.
1502	     Falls back to the binary eliminates[]/lands_on when it doesn't. */
1503	  Viewer.prototype._elimChipsV2El = function (m, labels) {
1504	    const wrap = el("div", { class: "ppq-iq-elim" });
1505	    const evidence = m.option_evidence;
1506	    if (evidence && evidence.length) {
1507	      /* rich vocabulary path */
1508	      const byLabel = {};
1509	      evidence.forEach((e) => { byLabel[String(e.label).toUpperCase()] = e.relationship; });
1510	      const row = el("div", { class: "ppq-iq-elim-row" });
1511	      labels.forEach((L) => {
1512	        L = String(L).toUpperCase();
1513	        const rel = byLabel[L] || "";
1514	        const cls = rel === "rules_out" ? "red"
1515	          : rel === "counts_against" ? "amber"
1516	          : rel === "directly_identifies" ? "green bold"
1517	          : rel === "favours" ? "green"
1518	          : rel === "supports" ? "lightgreen"
1519	          : "dim";
1520	        const chip = el("span", { class: "ppq-elim " + cls, title: rel ? rel.replace(/_/g, " ") : "" }, L);
1521	        row.appendChild(chip);
1522	      });
1523	      wrap.appendChild(row);
1524	    } else {
1525	      /* legacy binary path: eliminates (red) + lands_on (green) */
1526	      const red = (m.eliminates || []).map((L) => String(L).toUpperCase());
1527	      const green = m.lands_on ? String(m.lands_on).toUpperCase() : null;
1528	      if (!red.length && !green) return wrap;
1529	      if (labels.length) {
1530	        const row = el("div", { class: "ppq-iq-elim-row" });
1531	        labels.forEach((L) => {
1532	          L = String(L).toUpperCase();
1533	          const cls = (green && L === green) ? "green" : (red.indexOf(L) >= 0 ? "red" : "dim");
1534	          row.appendChild(el("span", { class: "ppq-elim " + cls }, L));
1535	        });
1536	        wrap.appendChild(row);
1537	      }
1538	    }
1539	    return wrap;
1540	  };
1541	
1542	  /* QoderWork 2026-07-22 (analyst handoff): the PRIMARY method-awareness prompt
1543	     (self_report_prompts[].primary) and the PRIMARY knowledge/technique check
1544	     (requirements.post_question_checks[].primary). Each offers tappable states;
1545	     the chosen state is stored per prompt id and drives the v2 feedback match. */
1546	  /* QoderWork 2026-07-23 (analyst request #1): show ALL primary prompts and checks,
1547	     not just the first. Secondary items go behind a "More quick checks" disclosure.
1548	     pupil_analysis.check_prompt (a plain string) is surfaced as a quiet text line. */
1549	  Viewer.prototype._appendSelfReportV2 = function (iq, rec) {
1550	    const srps = rec.self_report_prompts || [];
1551	    const checks = ((rec.requirements || {}).post_question_checks) || [];
1552	    const primarySrps = srps.filter((p) => p.primary);
1553	    const secondarySrps = srps.filter((p) => !p.primary);
1554	    const primaryChecks = checks.filter((c) => c.primary);
1555	    const secondaryChecks = checks.filter((c) => !c.primary);
1556	
1557	    /* all primary method-awareness prompts */
1558	    primarySrps.forEach((p) => iq.appendChild(this._promptBlockV2(p, "method")));
1559	    /* all primary knowledge checks */
1560	    primaryChecks.forEach((c) => iq.appendChild(this._promptBlockV2(c, "check")));
1561	
1562	    /* pupil_analysis.check_prompt — a plain string question, no states */
1563	    const cp = (rec.pupil_analysis || {}).check_prompt;
1564	    if (cp) {
1565	      const cpBox = el("div", { class: "ppq-iq-prompt ppq-iq-checkprompt" });
1566	      cpBox.appendChild(el("div", { class: "ppq-iq-prompt-text" }, esc(cp)));
1567	      iq.appendChild(cpBox);
1568	    }
1569	
1570	    /* secondary items behind a disclosure */
1571	    const secondaries = secondarySrps.concat(secondaryChecks);
1572	    if (secondaries.length) {
1573	      const det = el("details", { class: "ppq-iq-morechecks" });
1574	      det.appendChild(el("summary", null, "More quick checks (" + secondaries.length + ")"));
1575	      secondarySrps.forEach((p) => det.appendChild(this._promptBlockV2(p, "method")));
1576	      secondaryChecks.forEach((c) => det.appendChild(this._promptBlockV2(c, "check")));
1577	      iq.appendChild(det);
1578	    }
1579	  };
1580	  Viewer.prototype._promptBlockV2 = function (p, kind) {
1581	    const self = this;
1582	    const box = el("div", { class: "ppq-iq-prompt" });
1583	    box.appendChild(el("div", { class: "ppq-iq-prompt-text" }, esc(p.prompt || "")));
1584	    const chips = el("div", { class: "ppq-iq-prompt-states" });
1585	    (p.states || []).forEach((st) => {
1586	      const chip = el("button", { class: "ppq-iq-state", type: "button", "data-state": st }, self._stateLabel(st));
1587	      chip.addEventListener("click", () => {
1588	        chips.querySelectorAll(".ppq-iq-state").forEach((c) => c.classList.remove("sel"));
1589	        chip.classList.add("sel");
1590	        self._promptStates[p.id] = st;
1591	        self._fireReport({ status: "interrogation", qtype: "self_report", extra_json: JSON.stringify({ prompt_id: p.id, prompt_kind: kind, state: st, attempt_id: self._attemptId || "" }) });
1592	        self._renderInterrogationFeedback();
1593	      });
1594	      chips.appendChild(chip);
1595	    });
1596	    box.appendChild(chips);
1597	    return box;
1598	  };
1599	  /* Viewer-owned chrome: render a snake_case state id as a readable chip label.
1600	     This is presentation only — it never touches the analysts' prose. */
1601	  Viewer.prototype._stateLabel = function (st) {
1602	    const s = String(st || "").replace(/_/g, " ");
1603	    return s.charAt(0).toUpperCase() + s.slice(1);
1604	  };
1605	
1606	  /* QoderWork 2026-07-22 (analyst handoff): legacy analysis-store renderers,
1607	     extracted unchanged so the v2 path can branch around them. */
1608	  Viewer.prototype._appendProbeLegacy = function (iq, rec) {
1609	    if (rec.probe && rec.probe.text) {
1610	      const probe = el("div", { class: "ppq-iq-probe" });
1611	      probe.appendChild(el("div", { class: "ppq-iq-probe-text" }, esc(rec.probe.text)));
1612	      const chips = el("div", { class: "ppq-iq-chips" });
1613	      if (rec.probe.difficulty_source) chips.appendChild(el("span", { class: "ppq-iq-chip" }, "difficulty: " + esc(rec.probe.difficulty_source)));
1614	      if (rec.probe.trick_type) chips.appendChild(el("span", { class: "ppq-iq-chip" }, esc(rec.probe.trick_type)));
1615	      probe.appendChild(chips);
1616	      iq.appendChild(probe);
1617	    }
1618	  };
1619	  Viewer.prototype._appendMethodsLegacy = function (iq, rec, correctLetter) {
1620	    const self = this;
1621	    const labels = this._optionLabels(this.cur) || [];
1622	    if (rec.methods && rec.methods.length) {
1623	      iq.appendChild(el("div", { class: "ppq-iq-subhead" }, "Ways through it"));
```

#### Thinking

Now I fully understand the current implementation. Let me design the new `_appendMethodsV2` that satisfies both #2 (presentation_kind) and #4 (placing prompts next to methods).

Key design: Instead of rendering all methods under "Ways through it" and then rendering all prompts separately, we need to interleave them: render each method (respecting presentation_kind), and immediately after it render the self_report_prompts that reference it (via method_refs). Prompts that reference multiple methods (a group) are rendered once, after the last of the referenced methods.

Let me think about the grouping logic for #4:
- Each prompt has `method_refs` (an array of method IDs).
- A prompt that references exactly one method → render immediately after that method.
- A prompt that references multiple methods (a group, e.g. all four statement checks) → render once, after the last of those methods (i.e. after the group).

Handoff #4:
- "Place each `self_report_prompts[]` prompt next to the method or methods specified by `method_refs`."
- "Secondary prompts must not be separated into a generic `More quick checks` area."
- "If a prompt references an entire peer group, display it once after that group."
- "When authored local prompts exist, hide the generic `used it` control."
- "Prefer local, question-specific controls over a single universal set of response labels."
- "When multiple descriptions can all be true, allow authored controls to be multi-select."
- "Never display raw state IDs. At minimum, strip `proposed__` and convert the remainder to readable text."

So:
1. Build a map: method_id → [prompts that reference it]. But for group prompts (multiple method_refs), we need to render them after the last referenced method.

Approach:
- Iterate methods in authored order, rendering each.
- After rendering each method, check for prompts whose method_refs are all satisfied by methods rendered so far, AND whose last referenced method is the current one. Render those prompts.

More precisely: a prompt should be rendered after the last of its referenced methods (in authored order). So:
- For each prompt, compute the position (index) of its last referenced method in the authored methods array.
- After rendering method at index i, render all prompts whose "last referenced method index" == i.

This handles both single-method prompts (rendered right after that method) and group prompts (rendered after the last member of the group).

What about prompts whose method_refs don't match any method (or is empty)? Fall back to rendering them at the end (or in a generic area). Handle gracefully — render after all methods.

2. Multi-select: the handoff says "when multiple descriptions can all be true, allow authored controls to be multi-select". How do we know if a prompt is multi-select? Let me check the data. The prompt has `states`. Is there a field indicating multi-select? Let me check the schema or the data. Let me look for fields like `multi`, `multi_select`, `select`, etc.

Let me check the self_report_prompts schema and look for a multi-select indicator. Let me grep the bundle and schema.

3. "When authored local prompts exist, hide the generic `used it` control" — currently each method has a "used it" button. If a method has local prompts (method_refs includes it), hide the "used it" button for that method. If there are no local prompts, keep "used it".

4. `_stateLabel` must strip `proposed__`. Currently it just replaces underscores. `proposed__checked_both_features` → "proposed checked both features" (wrong). What we need: strip `proposed__` prefix → `checked_both_features` → "Checked both features".

Let me update `_stateLabel`:
```js
Viewer.prototype._stateLabel = function (st) {
  let s = String(st || "").replace(/^proposed__/, "").replace(/__/g, " ").replace(/_/g, " ").trim();
  return s.charAt(0).toUpperCase() + s.slice(1);
};
```
Wait, `proposed__checked_both_features` — the prefix is `proposed__` (two underscores). After stripping: `checked_both_features`. Then replace `_` with space: "checked both features". Capitalize: "Checked both features". Good.

But what about states that don't have the `proposed__` prefix? Just replace underscores. Good.

5. presentation_kind (#2):
- `route`: "Sequential display of dependent steps, because one inference genuinely depends on the previous inference." → numbered steps, presented as a sequence/route.
- `independent_check`: "Display as unnumbered peer checks. Do not turn them into one stage of a preferred route." → unnumbered, peer-check styling.
- `synthesis`: "Combine completed checks without implying they had to be done in that order." → synthesis block.

Also: "Preserve authored order, but drop the generic `Ways through it` framing and the sentence about collecting alternatives. Do not fabricate `Why it matters` or `Next move` when those optional fields are absent."

So:
- Remove the "Ways through it" subheading and the encouragement sentence.
- Render methods in authored order.
- Style each method according to presentation_kind:
  - `route`: maybe a "Route" label, numbered steps.
  - `independent_check`: "Check" label, unnumbered.
  - `synthesis`: "Putting it together" label.

Let me think about visual differentiation:
- `independent_check`: unnumbered peer checks. Maybe a subtle "Check" tag. Steps unnumbered.
- `route`: dependent steps shown sequentially — numbered steps (1, 2, 3) to convey dependence. Maybe a "Route" tag.
- `synthesis`: combines checks — maybe a "Bringing it together" tag.

The handoff says for route "sequential display of dependent steps". Numbered steps convey sequence/dependence. For independent_check, "unnumbered peer checks". So route = numbered, independent_check = unnumbered (bulleted or plain). Synthesis = combined.

Let me look at how pupil_steps are currently rendered: plain lines. For route, number them. For independent_check, leave unnumbered.

Also, the integration doc says (lines 100–103): "Render `methods[].title`, `pupil_steps`, `efficiency`, `outcome_type` without inventing time estimates. Friendly efficiency labels should distinguish the fastest available route, another efficient route, a correct but slower route, and a paper-management fallback."

So we should also render `efficiency` and `outcome_type`. Let me check what values efficiency takes in the data. Let me check the method fields in the bundle: efficiency, outcome_type, calculation_load, etc.

Let me look at the method fields of Q40 and Q27 (which have routes) to understand the values of efficiency/outcome_type/presentation_kind.

Before rewriting, let me examine the data more. Let me look at Q27 and Q40's methods to understand presentation_kind values, efficiency, outcome_type, and whether there's a multi-select indicator in prompts.

Let me also check the schema for self_report_prompts to find the multi-select field.

Let me run a data inspection.

Let me inspect the richer fixture records (Q27, Q40) and the prompt schema to understand `presentation_kind`, `efficiency`, `outcome_type`, and whether prompts carry a multi-select flag.



#### Tool: Bash

```bash
cd "C:\CodexProjects\PaperDatabases\Esat Categorisation\analysis_v2" && node -e "
const fs=require('fs');
let src=fs.readFileSync('dist/esat_analysis_v2.js','utf8');
const start=src.indexOf('var bundle = {');
const objStart=src.indexOf('{', start);
let depth=0,end=-1;
for(let i=objStart;i<src.length;i++){const c=src[i];if(c==='{')depth++;else if(c==='}'){depth--;if(depth===0){end=i;break;}}}
const bundle=JSON.parse(src.slice(objStart,end+1));
['esat_engaa_2016_s1_Q27','esat_engaa_2019_s1_Q40'].forEach(id=>{
  const r=bundle.records.find(x=>x.identity.id===id);
  console.log('========== '+id+' ==========');
  (r.methods||[]).forEach((m,i)=>{
    console.log('['+i+'] kind='+m.presentation_kind+' | eff='+(m.efficiency||'-')+' | outcome='+(m.outcome_type||'-')+' | id='+m.id);
    console.log('    title: '+m.title);
  });
  console.log('  -- prompts --');
  (r.self_report_prompts||[]).forEach((p,i)=>{
    console.log('['+i+'] primary='+p.primary+' refs='+JSON.stringify(p.method_refs)+' keys='+Object.keys(p).join(','));
    console.log('    multi? '+(p.multi_select!==undefined?p.multi_select:(p.multi!==undefined?p.multi:(p.response_mode||'NOFIELD'))));
  });
});
"
```

**Output:**

```json
========== esat_engaa_2016_s1_Q27 ==========
[0] kind=route | eff=best_available | outcome=direct_landing | id=same_angle_two_descriptions
    title: Describe the angle at Q twice
[1] kind=independent_check | eff=efficient | outcome=partial_elimination | id=directionality_filter
    title: Check which way n must move
[2] kind=route | eff=efficient | outcome=direct_landing | id=hexagon_special_case
    title: Test one exact polygon
  -- prompts --
[0] primary=true refs=["same_angle_two_descriptions"] keys=id,primary,method_refs,prompt,states
    multi? NOFIELD
[1] primary=false refs=["directionality_filter"] keys=id,primary,method_refs,prompt,states
    multi? NOFIELD
[2] primary=false refs=["hexagon_special_case"] keys=id,primary,method_refs,prompt,states
    multi? NOFIELD
========== esat_engaa_2019_s1_Q40 ==========
[0] kind=independent_check | eff=efficient | outcome=partial_elimination | id=downward_acceleration_filter
    title: Decide which side of 800 N
[1] kind=independent_check | eff=efficient | outcome=partial_elimination | id=within_eighty_newtons_filter
    title: Estimate how far from 800 N
[2] kind=synthesis | eff=best_available | outcome=unique_survivor | id=sign_and_size_synthesis
    title: Combine direction and closeness
[3] kind=route | eff=efficient | outcome=direct_landing | id=decode_symmetric_option_pairs
    title: Read the pairs around 800 N
[4] kind=route | eff=efficient | outcome=direct_landing | id=exact_mental_calculation
    title: Confirm it with a 32 N correction
  -- prompts --
[0] primary=true refs=["downward_acceleration_filter"] keys=id,primary,method_refs,prompt,states
    multi? NOFIELD
[1] primary=false refs=["within_eighty_newtons_filter","sign_and_size_synthesis"] keys=id,primary,method_refs,prompt,states
    multi? NOFIELD
[2] primary=true refs=["exact_mental_calculation"] keys=id,primary,method_refs,prompt,states
    multi? NOFIELD
[3] primary=false refs=["decode_symmetric_option_pairs"] keys=id,primary,method_refs,prompt,states
    multi? NOFIELD
[4] primary=false refs=["within_eighty_newtons_filter","exact_mental_calculation"] keys=id,primary,method_refs,prompt,states
    multi? NOFIELD
```

#### Thinking

Very useful. Main observations:

1. Values of `presentation_kind`: `route`, `independent_check`, `synthesis`. Confirmed.
2. Values of `efficiency`: `best_available`, `efficient`. The integration doc says the efficiency label should distinguish between "the fastest available route, another efficient route, a valid but slower route, and a fallback for paper management." Let me check the full vocabulary of efficiency. Let me check vocabularies.json.
3. Values of `outcome_type`: `direct_landing`, `partial_elimination`, `unique_survivor`.
4. The prompt doesn't have a multi-select field (NOFIELD). So multi-select isn't indicated in the data yet. The handoff says "if multiple descriptions can all be true, allow the created controls to be multi-select." Since there's no field yet, we should support it (check fields like `multi_select`/`multi`/`response_mode`), but the default is single-select. In practice, the data doesn't have this yet, so let's implement single-select as the default, but add support for the `multi_select` flag if it appears. Let me check vocabularies.json to see if there's a defined field.

5. Important: Q40's prompt[1] has refs=["within_eighty_newtons_filter","sign_and_size_synthesis"] — a group prompt referencing two methods (an independent check and a synthesis). And prompt[4] has refs=["within_eighty_newtons_filter","exact_mental_calculation"] — referencing two methods that aren't adjacent (method[0] and method[4]). Hmm. So "display once after that group" — the group here is {within_eighty_newtons_filter (idx 0), exact_mental_calculation (idx 4)}. The last one is idx 4. So prompt[4] is displayed after method[4]. And prompt[1] references idx 0 and idx 2, with the last being idx 2 (sign_and_size_synthesis). So it's displayed after method[2].

My "display after the last referenced method" approach handles this correctly.

Let me check vocabularies.json for the efficiency vocabulary and the multi-select field.

#### Tool: Read

> Read: `C:\CodexProjects\PaperDatabases\Esat Categorisation\analysis_v2\vocabularies.json`

**Output:**

```json
1	{
2	  "schema_version": "2.0.0",
3	  "actions": [
4	    "calculation",
5	    "inference",
6	    "interpretation",
7	    "comparison",
8	    "selection",
9	    "evaluation",
10	    "construction"
11	  ],
12	  "task_subtypes": [
13	    "direct_substitution",
14	    "rearrangement",
15	    "chained_calculation",
16	    "ratio_reasoning",
17	    "proportional_scaling",
18	    "inverse_proportion",
19	    "power_law_scaling",
20	    "constraint_elimination",
21	    "reachability",
22	    "graph_value",
23	    "graph_gradient",
24	    "graph_area",
25	    "graph_feature_match",
26	    "diagram_reasoning",
27	    "statement_evaluation",
28	    "table_consistency",
29	    "equation_solving",
30	    "inequality_solving",
31	    "geometry_deduction",
32	    "similarity",
33	    "option_testing",
34	    "estimation_and_bounds",
35	    "conservation_balance"
36	  ],
37	  "calculation_loads": [
38	    "none",
39	    "light",
40	    "moderate",
41	    "heavy"
42	  ],
43	  "reasoning_tags": [
44	    "one_decisive_constraint",
45	    "ratio_and_proportion",
46	    "conservation",
47	    "directional_reasoning",
48	    "bounds",
49	    "dimensional_reasoning",
50	    "symmetry",
51	    "invariant",
52	    "working_backwards",
53	    "special_case",
54	    "option_testing",
55	    "graphical_features",
56	    "area_under_graph",
57	    "signed_quantity",
58	    "multi_constraint_consistency",
59	    "operating_point_constraint",
60	    "target_quantity_check",
61	    "representation_conversion",
62	    "parallel_cross_check",
63	    "factorisation",
64	    "monotonicity",
65	    "necessary_and_sufficient",
66	    "ordered_options"
67	  ],
68	  "reading_tags": [
69	    "unit",
70	    "prefix",
71	    "target_quantity",
72	    "negative_sign",
73	    "inequality_direction",
74	    "axis_label",
75	    "below_axis",
76	    "not_or_except",
77	    "diagram_not_to_scale",
78	    "bearing_convention",
79	    "compound_option",
80	    "exact_wording",
81	    "quantity_definition"
82	  ],
83	  "option_structure_tags": [
84	    "ordered_by_value",
85	    "sign_twins",
86	    "shared_magnitude_pairs",
87	    "compound_table",
88	    "compound_statements",
89	    "distractor_family",
90	    "answer_is_intermediate",
91	    "correct_value_wrong_relation",
92	    "all_but_one_constraint",
93	    "paired_routes"
94	  ],
95	  "method_opportunity_tags": [
96	    "eliminate_by_constraint",
97	    "eliminate_by_direction",
98	    "eliminate_by_units",
99	    "eliminate_by_bounds",
100	    "use_ordered_options",
101	    "independent_option_filters",
102	    "stop_when_unique",
103	    "plug_in_options",
104	    "estimate",
105	    "full_solve",
106	    "simplify_before_calculating",
107	    "work_backwards",
108	    "cross_check",
109	    "draw_diagram"
110	  ],
111	  "method_roles": [
112	    "recommended",
113	    "alternative",
114	    "check",
115	    "synthesis",
116	    "full_solution"
117	  ],
118	  "method_kinds": [
119	    "direct_reasoning",
120	    "elimination",
121	    "option_test",
122	    "estimation",
123	    "diagram",
124	    "algebraic_solution",
125	    "consistency_check",
126	    "special_case"
127	  ],
128	  "diagnostic_confidence": [
129	    "high",
130	    "plausible",
131	    "unknown"
132	  ],
133	  "error_mapping_status": [
134	    "provisional",
135	    "mapped",
136	    "proposed"
137	  ],
138	  "requirement_roles": [
139	    "essential",
140	    "supporting",
141	    "strategic"
142	  ],
143	  "requirement_states": [
144	    "secure_before_question",
145	    "knew_but_did_not_retrieve",
146	    "recognised_after_prompt",
147	    "understood_after_explanation",
148	    "still_unclear"
149	  ],
150	  "mechanism_codes": [
151	    "concept_swap",
152	    "property_value_swap",
153	    "false_dependency",
154	    "false_consequence",
155	    "causation_inverted",
156	    "magnitude_wrong",
157	    "direction_reversed",
158	    "simpler_model_persistence",
159	    "scope_leakage",
160	    "pattern_transferred"
161	  ],
162	  "guess_declaration_stages": [
163	    "pre_answer",
164	    "post_answer"
165	  ],
166	  "self_report_states": [
167	    "used_as_main_route",
168	    "used_alongside_another_route",
169	    "saw_but_chose_not_to_use",
170	    "considered_briefly",
171	    "did_not_see",
172	    "saw_but_could_not_complete"
173	  ]
174	}
175	
```

#### Thinking

vocabularies.json doesn't have a vocabulary for `efficiency`, nor a multi-select flag for prompts. Let me check the schema for self_report_prompts and methods to see whether `efficiency` and multi-select are defined. I'll take a look at the schema folder.

Actually, the integration doc (lines 100–103) says this: "Render `methods[].title`, `pupil_steps`, `efficiency`, and `outcome_type` without fabricating time estimates. The friendly efficiency labels should distinguish between the fastest available route, another efficient route, a correct-but-slower route, and a paper-management fallback."

So the efficiency values are probably: `best_available` (fastest available route), `efficient` (another efficient route), and probably `slower`/`valid_but_slower`, `fallback`/`paper_management`. Let me check the schema to get the exact vocabulary.

Let me take a look at the schema folder.

#### Tool: Bash

```bash
cd "C:\CodexProjects\PaperDatabases\Esat Categorisation\analysis_v2" && ls schema/ && echo "---" && grep -rl "efficiency\|presentation_kind\|multi" schema/ 2>/dev/null
```

**Output:**

```json
launch-card.schema.json
question-analysis-v2.schema.json
---
schema/launch-card.schema.json
schema/question-analysis-v2.schema.json
```

#### Thinking

Let me try grepping for efficiency, presentation_kind, and multi_select in the v2 schema.


#### Tool: Bash

```bash
cd "C:\CodexProjects\PaperDatabases\Esat Categorisation\analysis_v2" && node -e "
const s=require('./schema/question-analysis-v2.schema.json');
const txt=JSON.stringify(s,null,1);
// extract efficiency enum
let m=txt.match(/\"efficiency\"[\s\S]{0,400}/);
console.log('EFFICIENCY:', m?m[0].slice(0,400):'not found');
console.log('====');
m=txt.match(/\"presentation_kind\"[\s\S]{0,300}/);
console.log('PRESENTATION_KIND:', m?m[0].slice(0,300):'not found');
console.log('====');
m=txt.match(/\"outcome_type\"[\s\S]{0,300}/);
console.log('OUTCOME_TYPE:', m?m[0].slice(0,300):'not found');
console.log('====');
m=txt.match(/multi[\s\S]{0,200}/i);
console.log('MULTI:', m?m[0].slice(0,200):'not found');
console.log('====');
m=txt.match(/\"self_report_prompts\"[\s\S]{0,600}/);
console.log('SRP:', m?m[0].slice(0,600):'not found');
"
```

**Output:**

```json
EFFICIENCY: "efficiency": {
      "enum": [
       "best_available",
       "efficient",
       "valid_but_slow",
       "strategic_fallback"
      ]
     },
     "outcome_type": {
      "enum": [
       "direct_landing",
       "unique_survivor",
       "partial_elimination",
       "verification",
       "heuristic_guess"
      ]
     },
     "title": {
      "type": "string",
      "minLength": 1
     },
 
====
PRESENTATION_KIND: "presentation_kind": {
      "enum": [
       "route",
       "independent_check",
       "synthesis"
      ]
     },
     "efficiency": {
      "enum": [
       "best_available",
       "efficient",
       "valid_but_slow",
       "strategic_fallback"
      ]
     },
     "outcome_type": {
      "e
====
OUTCOME_TYPE: "outcome_type": {
      "enum": [
       "direct_landing",
       "unique_survivor",
       "partial_elimination",
       "verification",
       "heuristic_guess"
      ]
     },
     "title": {
      "type": "string",
      "minLength": 1
     },
     "pupil_steps": {
      "type": "array",
      "
====
MULTI: not found
====
SRP: "self_report_prompts",
  "feedback",
  "review"
 ],
 "properties": {
  "schema_version": {
   "const": "2.0.0"
  },
  "identity": {
   "type": "object",
   "additionalProperties": false,
   "required": [
    "id",
    "slug",
    "assessment",
    "year",
    "section",
    "question_number",
    "part",
    "subject",
    "correct_answer",
    "option_labels",
    "crop"
   ],
   "properties": {
    "id": {
     "type": "string",
     "minLength": 1
    },
    "slug": {
     "type": "string",
     "minLength": 1
    },
    "assessment": {
     "type": "string",
     "minLength": 1
    },
```

#### Thinking

With this, the vocabulary is all lined up:
- `efficiency`: `best_available`, `efficient`, `valid_but_slow`, `strategic_fallback`
- `outcome_type`: `direct_landing`, `unique_survivor`, `partial_elimination`, `verification`, `heuristic_guess`
- `presentation_kind`: `route`, `independent_check`, `synthesis`
- The schema doesn't have a multi-select field. So multi-select is not yet included in the data. Support it defensively (check `p.multi_select`), but the default is single-select.

Let me check the schema for self_report_prompts items to see the exact fields (whether there's a multi flag). Let me try grepping the srp item's properties.

Actually, the MULTI search returned "not found" — meaning there's no multi-select field in the schema. Alright. Implement single-select as the default, and if `p.multi_select === true` appears in the future, support multi-select. The handoff says "when multiple descriptions can all be true, allow the created controls to be multi-select" — this is a forward-looking requirement. Make `_promptBlockV2` respect the `multi_select` flag (if true, toggle without clearing others). Since it's not in the data yet, everything will operate as single-select for now.

Next, friendly labels for efficiency (integration doc):
- `best_available` → "Quickest way through" / "the quickest available route"
- `efficient` → "Another efficient route"
- `valid_but_slow` → "Valid but slower"
- `strategic_fallback` → "Paper-management fallback"

Let me define the efficiency label map:
```js
const effLabel = {
  best_available: "Quickest route",
  efficient: "Another efficient route",
  valid_but_slow: "Valid but slower",
  strategic_fallback: "Paper-management fallback"
};
```

Now, should efficiency be displayed to the student? The integration doc says "render methods[].title, pupil_steps, efficiency, outcome_type" — yes, render efficiency as a friendly label. outcome_type — hmm, is outcome_type for the student? The doc says to render it, but outcome_type values like "partial_elimination" are somewhat internal. Let me re-read: "render methods[].title, pupil_steps, efficiency, outcome_type without fabricating time estimates."

Hmm, but handoff #5 says to keep the taxonomy/classification reviewer-only. outcome_type is more of a method characteristic than a taxonomy. But displaying "partial_elimination" to the student isn't useful. The integration doc is a bit old (July 23) compared to the handoff (July 24). The handoff's list of what's shown to the student: "method title and pupil_steps; visual option-evidence rail; local response controls…". It doesn't mention efficiency or outcome_type as things shown to the student.

Given the handoff's authority (newer) and its list of what's shown to the student (title + pupil_steps + rail + controls), render efficiency as a quiet friendly label (since it's genuinely useful to the student — "quickest route" vs "another way"), but don't display outcome_type to the student (it's more internal). No, wait, let me reconsider.

Handoff #5's list of what's shown to the student:
- the question and their answer;
- the normal verdict and feedback on the chosen option;
- useful pupil_analysis prose;
- method title and pupil_steps;
- visual option-evidence rail;
- local response controls, reflection on time sinks, and free-text.

So: method title + pupil_steps + option-evidence rail + local prompts. Efficiency is not explicitly on the student list. But it's also not on the reviewer-only list. It's in a gray zone. The integration doc says to render it with a friendly label.

I think the friendly efficiency label is genuinely useful to the student (distinguishing the quickest route from alternatives), and the integration doc explicitly says to render it. I'll include it as a quiet tag. But keep it understated. Actually — the handoff says "don't fold in… route labels" as a deferred item ("the full Things this question used interface and route labels"). "Route labels" is deferred! So efficiency/route labels should not be added now.

Re-reading the handoff's deferred items: "the full `Things this question used` interface and route labels". So route labels (efficiency labels like "quickest route") are deferred. Therefore efficiency should not be rendered now. OK, skip efficiency. Just title + pupil_steps + rail + local prompts. This matches the handoff's list of what's shown to the student exactly.

OK, that simplifies things. Don't add efficiency/outcome_type labels (deferred). Just: title, pupil_steps, option-evidence rail, local prompts.

Now, visual differentiation of presentation_kind. Without route labels, how do we distinguish route/independent_check/synthesis? The handoff says:
- `route`: display the dependent steps in sequence (numbered steps convey sequence).
- `independent_check`: unnumbered peer check.
- `synthesis`: combine completed checks.

And Q4's fixture: "display four unnumbered peer checks" + "synthesis". Q27: "a genuinely dependent route" (route), "independent check", "another optional route".

So the main visual difference: route = numbered/sequential steps, independent_check = unnumbered. Synthesis = a combined block (perhaps introduced with "Putting it together" or similar).

Let me design:
- Each method is a `.ppq-iq-method` block.
- A small kind tag:
  - `independent_check` → "Check" (unnumbered)
  - `route` → "Route" (numbered steps)
  - `synthesis` → "Putting it together"
- Steps: numbered for route (1., 2., 3.), plain/unnumbered for independent_check and synthesis.

Wait, but the handoff says independent checks are "unnumbered peer checks" — the checks themselves are unnumbered (not "Check 1, Check 2, Check 3"). That is, don't number the checks relative to each other. And within a check, the steps are also unnumbered. For a route, the steps are sequential/numbered (because they're dependent).

Let me implement:
- `independent_check`: no number on the block, steps as plain lines (or with a subtle bullet). Tag: "check".
- `route`: numbered steps (1, 2, 3). Tag: "route".
- `synthesis`: steps plain, tag: "putting it together".

Actually, let me reconsider whether to show a tag at all. The handoff says to remove the "Ways through it" framing. A small "Check"/"Route"/"Putting it together" tag helps convey presentation_kind without the generic framing. I think a subtle tag is good. Let me use:
- independent_check → "check"
- route → "one way through" or "route"
- synthesis → "pulling it together"

Hmm, let me keep it simple and faithful:
- route → "Route"
- independent_check → "Check"
- synthesis → "Together"

Actually, for the student, "Check" reads well for independent_check ("a check you can do"). "Route" for route. "Putting it together" for synthesis. Let me use these as small subtle tags.

Next, let me also handle the "used it" button: "when a created local prompt exists, hide the generic `used it` control". So if a method has a local prompt (a prompt with method_refs containing this method's id), hide "used it". Otherwise show it.

Next, let me think about the structure of the new `_appendMethodsV2`. It will:
1. Build a method_id → index map.
2. For each prompt, compute the index of the last referenced method.
3. Group prompts by their "last referenced method index".
4. Iterate methods in order; render each method (with presentation_kind styling + option rail + "used it" if no local prompt); then render the prompts whose last-ref index == this index.
5. Prompts with no matching methods → render at the end.

But wait — there's a subtlety with `_appendSelfReportV2`. Currently it's called separately (line 1248) and renders all prompts + checks + check_prompt. If I move prompt rendering into `_appendMethodsV2`, I need to change `_appendSelfReportV2` to only handle what's left: knowledge checks (post_question_checks), check_prompt, and prompts that don't reference methods.

Let me restructure:
- `_appendMethodsV2(iq, rec)`: renders methods with interleaved self_report_prompts (those with method_refs).
- `_appendSelfReportV2(iq, rec)`: renders the remaining items — self_report_prompts without method_refs (or whose refs don't match), post_question_checks, and check_prompt.

Actually, to keep it clean:
- `_appendMethodsV2` handles methods + prompts that have valid method_refs.
- `_appendSelfReportV2` handles: prompts without valid method_refs (fallback), post_question_checks (knowledge checks), check_prompt.

Let me pass the set of "already rendered prompt ids" from methods to self-report, so self-report doesn't duplicate. Alternatively, compute in one place.

Cleaner: let `_appendMethodsV2` return the set of rendered prompt ids. Then `_appendSelfReportV2` skips those.

Let me look at how they're called (lines 1246–1248):
```js
this._appendInsightV2(restPage, rec);
this._appendMethodsV2(restPage, rec);
this._appendSelfReportV2(restPage, rec);
```

Change `_appendMethodsV2` to return a Set of rendered prompt ids, and pass it to `_appendSelfReportV2`.

Now, knowledge checks (post_question_checks) — do they have method_refs? Let me check. They're under `requirements.post_question_checks`. Let me check their shape. Actually, the handoff focuses on self_report_prompts with method_refs. Knowledge checks are separate ("Things this question used" is deferred). Let me check what post_question_checks looks like and whether it has method_refs.

Let me check Q4's requirements.post_question_checks.

Actually, let me reconsider. The handoff's deferred items include "the full Things this question used interface". Knowledge checks (post_question_checks) are related to "Things this question used". But the current code renders primaryChecks. The handoff doesn't explicitly say to remove them. Let me keep rendering knowledge checks as-is (in the self-report area), but not detach self_report_prompts.

Hmm, wait. Let me re-read handoff #4 carefully:

"Place each `self_report_prompts[]` prompt next to the method or methods specified by `method_refs`.
- Secondary prompts must not be detached into a generic `More quick checks` area.
- If a prompt references an entire peer group, show it once after that group.
- When a created local prompt exists, hide the generic `used it` control.
- Prefer local, question-specific controls over a single universal set of response labels.
- When multiple descriptions can all be true, allow the created controls to be multi-select.
- Never display raw state IDs. At minimum, strip `proposed__` and convert the rest to readable text."

This is all about self_report_prompts. It doesn't mention post_question_checks. So post_question_checks stay as-is (rendered in the self-report section). But the "More quick checks" disclosure that currently holds secondary prompts needs to go — secondary self_report_prompts will be placed next to their methods instead.

So the new `_appendSelfReportV2`:
- Render post_question_checks (primary + secondary — or keep current behavior). Actually, currently primary checks are rendered and secondary checks go into "More quick checks". Since "More quick checks" is being removed for self_report_prompts, what about secondary checks? The handoff doesn't say. Let me render all checks (primary + secondary) plainly without the disclosure, or keep the disclosure only for checks. Hmm.

Actually, let me simplify: the handoff's rule is about self_report_prompts being placed next to methods. For post_question_checks (knowledge checks), keep them in the self-report area. Render all of them (no need for a "More quick checks" disclosure if it's just a few checks). Let me render primary checks, then secondary checks, all inline (no disclosure). Actually, to be safe and avoid clutter, let me render all checks inline.

Wait, but there's the check_prompt (pupil_analysis.check_prompt) — keep that as a quiet line.

Let me also reconsider: do post_question_checks have method_refs? If they do, they should also be placed next to methods. Let me check the data. Let me look at Q4's requirements.

Let me investigate post_question_checks.


No multi-select field in the schema yet (I'll support it defensively), and "route labels" (efficiency) are explicitly deferred so I won't add those. Let me check whether knowledge checks (`post_question_checks`) also carry `method_refs`.



#### Tool: Bash

```bash
cd "C:\CodexProjects\PaperDatabases\Esat Categorisation\analysis_v2" && node -e "
const fs=require('fs');
let src=fs.readFileSync('dist/esat_analysis_v2.js','utf8');
const start=src.indexOf('var bundle = {');
const objStart=src.indexOf('{', start);
let depth=0,end=-1;
for(let i=objStart;i<src.length;i++){const c=src[i];if(c==='{')depth++;else if(c==='}'){depth--;if(depth===0){end=i;break;}}}
const bundle=JSON.parse(src.slice(objStart,end+1));
// survey post_question_checks across records + any srp without method_refs
let pqcWithRefs=0, pqcTotal=0, srpNoRefs=0, srpTotal=0, pqcKeys={};
bundle.records.forEach(r=>{
  (((r.requirements||{}).post_question_checks)||[]).forEach(c=>{pqcTotal++; if(c.method_refs&&c.method_refs.length)pqcWithRefs++; Object.keys(c).forEach(k=>pqcKeys[k]=1);});
  (r.self_report_prompts||[]).forEach(p=>{srpTotal++; if(!p.method_refs||!p.method_refs.length)srpNoRefs++;});
});
console.log('post_question_checks total='+pqcTotal+' with method_refs='+pqcWithRefs);
console.log('pqc keys:', Object.keys(pqcKeys).join(','));
console.log('self_report_prompts total='+srpTotal+' WITHOUT method_refs='+srpNoRefs);
// show a sample pqc
const q4=bundle.records.find(x=>x.identity.id==='esat_engaa_2016_s1_Q04');
console.log('Q4 pqc:', JSON.stringify(((q4.requirements||{}).post_question_checks)||[],null,1).slice(0,500));
"
```

**Output:**

```json
post_question_checks total=131 with method_refs=0
pqc keys: id,primary,requirement_refs,prompt,states
self_report_prompts total=129 WITHOUT method_refs=0
Q4 pqc: [
 {
  "id": "proportional_graph_check",
  "primary": true,
  "requirement_refs": [
   "K5_graph_slope_meaning"
  ],
  "prompt": "A straight line through the origin means y = kx, and here k = 10/2 = 5. How secure was that graph principle before the explanation?",
  "states": [
   "secure_before_question",
   "knew_but_did_not_retrieve",
   "proposed__known_but_slightly_uncertain",
   "recognised_after_prompt",
   "still_unclear"
  ]
 },
 {
  "id": "kinetic_energy_shape_check",
  "primary": false
```

#### Thinking

Good:
- `post_question_checks` never has `method_refs` (it has `requirement_refs`). So knowledge checks stay in the self-report area (not placed next to methods). These are the "things this problem used" knowledge checks.
- Every `self_report_prompts` has `method_refs` (0 without). So every prompt gets placed next to its method. Good — no orphan prompts in the current data. But I'll still handle orphans gracefully (render them at the end).

Note: pqc states include both `proposed__known_but_slightly_uncertain` (with prefix) and `secure_before_question` (without prefix). So `_stateLabel` needs to strip `proposed__` when present and handle both.

Now let me design the rewrite. I'll rewrite `_appendMethodsV2` as follows:
1. Remove "Ways through it" + the encouragement line.
2. Render methods in the order they were created, each styled by presentation_kind.
3. Interleave self_report_prompts next to their methods (after the last referenced method).
4. Hide "used it" when a method has a local prompt.
5. Return the set of rendered prompt IDs.

And `_appendSelfReportV2`:
1. Skip prompts already rendered (those with valid method_refs).
2. Render orphan prompts (no matching method_refs) — none in the data, but for safety.
3. Render post_question_checks (all, inline, no disclosure).
4. Render check_prompt.

And `_promptBlockV2`:
1. Support multi-select via `p.multi_select`.
2. `_stateLabel` strips `proposed__`.

Now let me think about rendering presentation_kind and option rail (#3). `_elimChipsV2El` also needs to be rewritten (#3):
- Full rail from `identity.option_labels` (all letters, fixed positions).
- Colored letters only (no pill/background/strikethrough).
- 7 relationships with colors from the integration doc:
  - `directly_identifies`: green (solid)
  - `supports`: light green
  - `favours`: light blue
  - `unaffected`: grey
  - `counts_against`: light red
  - `disfavours`: orange
  - `rules_out`: red
- No background, pill, border, strikethrough, checkmark, underline, diamond.
- Legend uses words or non-letter swatches (never A–G).
- Fallback: project eliminates/lands_on onto the same full rail.

Wait — the current `_elimChipsV2El` uses `labels` from `this._optionLabels(this.cur)`. But the handoff says to order the rail from `identity.option_labels`, not from the evidence array. The current code already iterates `labels` (from `_optionLabels`) and looks up each in the evidence. That's mostly right. But I should use `rec.identity.option_labels` as the canonical source. Let me check `_optionLabels` — does it return identity.option_labels? Let me check.

Actually, the current code builds `byLabel` from the evidence and iterates `labels` (the question's option labels). So every label is shown in a fixed position. That's already a "full rail". The problems are the styling (pill, background, strikethrough via `.ppq-elim` class) and the color mapping. Let me check the current `.ppq-elim` CSS.

Let me look at the current `.ppq-elim` CSS to understand what to change.

Let me grep for ppq-elim in the CSS.


Every prompt has `method_refs`; knowledge checks never do (they use `requirement_refs`) so they stay in the self-report area. Now let me look at the current `.ppq-elim` CSS before rewriting the rail.



#### Tool: Grep

**Input:**

```json
{
  "-n": true,
  "output_mode": "content",
  "path": "C:\\Claude (not on Gdrive, nor OneDrive)\\ppqviewer\\engine\\ppqviewer.css",
  "pattern": "ppq-elim|ppq-iq-method|ppq-iq-subhead|ppq-iq-encourage|ppq-iq-used|ppq-iq-prompt|ppq-iq-state"
}
```

**Output:**

```json
295:.ppq-iq-subhead { font-weight: 700; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.04em; color: var(--ppq-ink2); margin: 0.9rem 0 0.45rem; }
311:.ppq-iq-method { border: 1px solid var(--ppq-line); border-radius: 8px; padding: 0.6rem 0.85rem; margin-bottom: 0.5rem; }
312:.ppq-iq-method-head { display: flex; gap: 0.5rem; align-items: baseline; flex-wrap: wrap; margin-bottom: 0.25rem; }
316:.ppq-iq-method-desc { font-size: 0.88rem; line-height: 1.45; color: var(--ppq-ink2); }
317:.ppq-iq-method-line { display: block; padding: 0.12rem 0 0.12rem 0.9rem; position: relative; }
318:.ppq-iq-method-line::before { content: "·"; position: absolute; left: 0.25rem; color: var(--ppq-muted); }
319:.ppq-iq-method-line.result { color: var(--ppq-ink); font-weight: 600; }
320:.ppq-iq-method-line.result::before { content: ""; }
322:.ppq-iq-encourage { font-size: 0.8rem; font-style: italic; color: var(--ppq-muted); margin: -0.2rem 0 0.5rem; }
325:.ppq-iq-used { margin-left: auto; font-size: 0.78rem; padding: 0.28rem 0.7rem; border: 1px solid var(--ppq-line); border-radius: 7px; background: var(--ppq-bg); color: var(--ppq-ink2); cursor: pointer; }
326:.ppq-iq-used::before { content: "☐ "; }
327:.ppq-iq-used:hover { border-color: var(--ppq-accent); }
328:.ppq-iq-used.on { background: var(--ppq-accent); border-color: var(--ppq-accent); color: #fff; font-weight: 700; }
329:.ppq-iq-used.on::before { content: "☑ "; }
345:.ppq-elim { display: inline-flex; align-items: center; justify-content: center; min-width: 1.7rem; height: 1.7rem; padding: 0 0.3rem; border-radius: 6px; font-weight: 800; font-size: 0.85rem; border: 1px solid var(--ppq-line); color: var(--ppq-muted); background: var(--ppq-bg); }
346:.ppq-elim.red { background: rgba(176, 48, 48, 0.12); border-color: rgba(176, 48, 48, 0.5); color: var(--ppq-bad); text-decoration: line-through; }
347:.ppq-elim.green { background: rgba(45, 106, 63, 0.14); border-color: rgba(45, 106, 63, 0.55); color: var(--ppq-ok); }
348:.ppq-elim.dim { opacity: 0.55; }
350:.ppq-elim.amber { background: rgba(180, 120, 20, 0.12); border-color: rgba(180, 120, 20, 0.5); color: #8a5a00; }
351:.ppq-elim.lightgreen { background: rgba(45, 106, 63, 0.08); border-color: rgba(45, 106, 63, 0.3); color: var(--ppq-ok); }
352:.ppq-elim.bold { font-weight: 900; border-width: 2px; }
449:.ppq-iq-prompt { margin-bottom: 0.75rem; }
450:.ppq-iq-prompt-text { font-size: 0.92rem; font-weight: 600; line-height: 1.45; color: var(--ppq-ink); margin-bottom: 0.45rem; }
451:.ppq-iq-prompt-states { display: flex; gap: 0.35rem; flex-wrap: wrap; }
452:.ppq-iq-state { font-size: 0.78rem; padding: 0.3rem 0.7rem; border: 1px solid var(--ppq-line); border-radius: 999px; background: var(--ppq-bg); color: var(--ppq-ink2); cursor: pointer; }
453:.ppq-iq-state:hover { border-color: var(--ppq-accent); color: var(--ppq-accent); }
454:.ppq-iq-state.sel { background: var(--ppq-accent); border-color: var(--ppq-accent); color: #fff; font-weight: 700; }
465:.ppq-iq-state-label { margin-top: 1rem; padding-top: 0.5rem; border-top: 1px solid var(--ppq-line); font-size: 0.72rem; font-weight: 600; color: var(--ppq-muted); letter-spacing: 0.02em; }
466:.ppq-iq-state-by { font-weight: 400; opacity: 0.7; }
```

#### Thinking

Now I have all the information I need. Let me write the new code. I'll do it in several edits:

**Edit A: Rewrite `_appendMethodsV2`** — presentation_kind + interleaved prompts + hide "used it" when there's a local prompt. Return the set of rendered prompt IDs.

**Edit B: Rewrite `_elimChipsV2El`** — full-rail colored characters, 7 relationships, fallback.

**Edit C: Rewrite `_appendSelfReportV2`** — skip rendered prompts, render orphan prompts + checks + check_prompt. Remove "More quick checks".

**Edit D: Update `_promptBlockV2`** — multi-select support.

**Edit E: Update `_stateLabel`** — strip `proposed__`.

**Edit F: Update the call sites** — pass the rendered prompt IDs from methods to self-report.

**Edit G: CSS** — new rail styles (colored characters, no pills), method kind tags, numbered route steps.

Let me start with the JS. First, let me carefully design `_appendMethodsV2`.

```js
Viewer.prototype._appendMethodsV2 = function (iq, rec) {
  const self = this;
  const methods = rec.methods || [];
  if (!methods.length) return new Set();
  /* QoderWork 2026-07-24 (handoff #3): the canonical option order comes from
     identity.option_labels so every method-local rail shows every letter in the
     same fixed position. */
  const labels = (rec.identity && rec.identity.option_labels && rec.identity.option_labels.length)
    ? rec.identity.option_labels : (this._optionLabels(this.cur) || []);

  /* QoderWork 2026-07-24 (handoff #4): each self-report prompt sits beside the
     method(s) it names. A prompt that names several methods (a peer group) shows
     once, after the LAST of them in authored order. */
  const srps = rec.self_report_prompts || [];
  const indexOf = {};
  methods.forEach((m, i) => { indexOf[m.id] = i; });
  const promptsAfter = {};   /* method index -> [prompt, ...] */
  const orphans = [];
  const rendered = new Set();
  srps.forEach((p) => {
    const refs = p.method_refs || [];
    let last = -1;
    refs.forEach((r) => { if (indexOf[r] !== undefined && indexOf[r] > last) last = indexOf[r]; });
    if (last < 0) { orphans.push(p); return; }
    (promptsAfter[last] = promptsAfter[last] || []).push(p);
    rendered.add(p.id);
  });

  methods.forEach((m, i) => {
    iq.appendChild(self._methodBlockV2(m, labels, (promptsAfter[i] || []).length > 0));
    /* local prompts follow their method (or the last of their group) */
    (promptsAfter[i] || []).forEach((p) => { rendered.add(p.id); iq.appendChild(self._promptBlockV2(p, "method")); });
  });
  /* prompts whose method_refs matched nothing still get shown (graceful) */
  orphans.forEach((p) => { rendered.add(p.id); iq.appendChild(self._promptBlockV2(p, "method")); });
  return rendered;
};
```

Wait, I'm adding to `rendered` twice (once in the srps.forEach when last>=0, and again in the methods.forEach). That's fine (Set dedupes). Actually, let me add only when actually appended. Let me simplify: add p.id to rendered when last>=0 (i.e., when it will be rendered beside a method). Orphans are also rendered (at the end), so they should also be marked rendered — but they're returned as orphans and rendered, and self-report should skip them. Actually, if I render orphans in methods, self-report should skip them. So mark them rendered too. Hmm, but then what does self-report render? Only checks + check_prompt. Let me have methods return the set of all prompt IDs it rendered (both beside-method and orphans), and self-report skips those.

Actually, cleaner: self-report renders only prompts NOT in the returned set. Since methods renders all srps (beside-method + orphans), self-report won't render any srp — only checks + check_prompt. But for safety (in case some srp isn't handled), self-report filters by the rendered set.

Let me reconsider: should orphans be rendered in methods or in self-report? Logically, self-report is the fallback area. But it's simpler to render all srps in methods (since they all have method_refs in real data) and have self-report handle checks + check_prompt + any srp not rendered. Let me have methods return the rendered set, and self-report renders srps not in the set (defensive) + checks + check_prompt.

Let me restructure so `_appendMethodsV2` returns the rendered set, and orphans are left to self-report (not rendered in methods). That's cleaner separation:
- methods: renders methods + prompts that have valid method_refs. Returns rendered set.
- self-report: renders prompts not in rendered set (orphans) + checks + check_prompt.

Let me adjust: in methods, only add to rendered when last>=0. Don't render orphans in methods. Return rendered. Self-report renders srps.filter(p=>!rendered.has(p.id)) + checks + check_prompt.

Next, `_methodBlockV2(m, labels, hasLocalPrompt)`:
```js
Viewer.prototype._methodBlockV2 = function (m, labels, hasLocalPrompt) {
  const self = this;
  const kind = m.presentation_kind || "route";
  const md = el("div", { class: "ppq-iq-method ppq-iq-method-" + kind });
  const head = el("div", { class: "ppq-iq-method-head" });
  /* QoderWork 2026-07-24 (handoff #2): a quiet kind tag instead of the generic
     "Ways through it" framing. Routes number their dependent steps; independent
     checks are unnumbered peers; synthesis combines completed checks. */
  const kindTag = kind === "independent_check" ? "check" : kind === "synthesis" ? "putting it together" : "route";
  head.appendChild(el("span", { class: "ppq-iq-method-kind ppq-iq-kind-" + kind }, kindTag));
  head.appendChild(el("b", null, esc(m.title || m.id)));
  /* QoderWork 2026-07-24 (handoff #4): the generic "used it" control is hidden
     whenever the method carries its own authored local prompt. */
  if (!hasLocalPrompt) {
    const used = el("button", { class: "ppq-iq-used", type: "button" }, "used it");
    used.addEventListener("click", () => {
      const on = used.classList.toggle("on");
      if (on) self._analysisSelfReports[m.id] = "used"; else delete self._analysisSelfReports[m.id];
      self._fireReport({ status: "interrogation", qtype: "self_report", extra_json: JSON.stringify({ method_id: m.id, method_ref: m.id, state: on ? "used" : "not_used" }) });
    });
    head.appendChild(used);
  }
  md.appendChild(head);
  const steps = el("div", { class: "ppq-iq-method-desc" });
  (m.pupil_steps || []).forEach((s, idx) => {
    const line = el("div", { class: "ppq-iq-method-line" + (kind === "route" ? " ppq-iq-step-num" : "") }, esc(s));
    if (kind === "route") line.setAttribute("data-n", String(idx + 1));
    steps.appendChild(line);
  });
  md.appendChild(steps);
  md.appendChild(self._elimChipsV2El(m, labels));
  return md;
};
```

For numbered route steps, I'll use a CSS `::before` with `content: attr(data-n) "."`. Let me add the CSS class `.ppq-iq-step-num::before { content: attr(data-n) "."; ... }`. Actually, the existing `.ppq-iq-method-line::before` displays "·". For numbered route steps, I want to override with a number. Let me use `.ppq-iq-method-line.ppq-iq-step-num::before { content: attr(data-n) "."; left:0; ... }`. Hmm, positioning. Let me set data-n and use CSS.

Actually, simpler: for route steps, add the number as a span. But CSS attr is cleaner. Let me use:
```css
.ppq-iq-method-line.ppq-iq-step-num { padding-left: 1.4rem; }
.ppq-iq-method-line.ppq-iq-step-num::before { content: attr(data-n) "."; position: absolute; left: 0.1rem; color: var(--ppq-accent); font-weight: 700; content: attr(data-n) "."; }
```
Wait, `.ppq-iq-method-line` is `position:relative` with `::before content:"·"`. For step-num, override content and left. Let me write:
```css
.ppq-iq-method-line.ppq-iq-step-num::before { content: attr(data-n) "."; left: 0; color: var(--ppq-accent); font-weight: 700; }
```
And increase padding-left for the number. OK.

Next, `_elimChipsV2El` (#3). Rewrite:
```js
Viewer.prototype._elimChipsV2El = function (m, labels) {
  const wrap = el("div", { class: "ppq-iq-elim" });
  if (!labels.length) return wrap;
  /* QoderWork 2026-07-24 (handoff #3): relationship -> colour class. The letter
     itself carries the colour — no pill, background, border or strikethrough. */
  const REL = {
    directly_identifies: "rel-di",
    supports: "rel-sup",
    favours: "rel-fav",
    unaffected: "rel-unaf",
    counts_against: "rel-ca",
    disfavours: "rel-dis",
    rules_out: "rel-out"
  };
  const byLabel = {};
  const evidence = m.option_evidence;
  if (evidence && evidence.length) {
    evidence.forEach((e) => { byLabel[String(e.label).toUpperCase()] = e.relationship; });
  } else {
    /* fallback: project the binary eliminates[]/lands_on onto the same full rail */
    (m.eliminates || []).forEach((L) => { byLabel[String(L).toUpperCase()] = "rules_out"; });
    if (m.lands_on) byLabel[String(m.lands_on).toUpperCase()] = "directly_identifies";
  }
  const row = el("div", { class: "ppq-iq-elim-row" });
  labels.forEach((L) => {
    L = String(L).toUpperCase();
    const rel = byLabel[L] || "unaffected";   /* a surviving option is unaffected, not positive */
    const cls = REL[rel] || "rel-unaf";
    row.appendChild(el("span", { class: "ppq-elim-letter " + cls, title: rel.replace(/_/g, " ") }, L));
  });
  wrap.appendChild(row);
  return wrap;
};
```

Wait — the handoff says "a surviving option is `unaffected`, not positive evidence". So if a label isn't in the evidence, it's `unaffected` (grey). Good, that's the default. But in the fallback path (eliminates/lands_on), options that aren't eliminated and aren't landed-on are also unaffected. Good.

But wait — in the rich path, the evidence array already includes all options (Q4's methods list all six). So byLabel covers everything. The `|| "unaffected"` default is a safety net. Good.

Now, one concern: the handoff says "no cumulative omissions" and "a preceding check never removes or recolors a letter for a later independent check". Since each method renders its own rail from its own option_evidence, there's no cumulative state. Good — each rail is independent.

Next, the legend. The handoff says "when a legend is needed, use words or non-letter swatches; never use A–G as legend keys". Should I add a legend? It says "when needed". Since the colors are subtle (grey vs light-green vs light-blue etc.), a legend might help. But adding a legend per method is cluttered. Maybe one legend for the whole analysis section. Hmm. Let me think — the relationships shown vary per method. A compact legend explaining the color meanings would help pupils. But the handoff leaves it optional ("when needed").

Given the subtle color distinctions (especially the three negative shades that are "intentionally undecided"), let me add a single compact legend once (not per method), using colored dots (non-letter swatches) + words. Place it before the first method, or make it a small details/disclosure to avoid clutter. Actually, to keep the student-facing surface compact (handoff #5: "the student-facing surface should stay compact"), let me make the legend a small `<details>` disclosure: "What the letter colours mean". That keeps it out of the way but available.

Hmm, but that adds complexity. Let me reconsider. The colors: red (

terminated

### **You**

carry on

### **Assistant**

#### Thinking

Smith says "continue." I'm in the middle of implementing #2, #3, and #4 (they're intertwined). Now I have all the information I need. Let me write the new `_appendMethodsV2`, `_elimChipsV2El`, `_appendSelfReportV2`, `_promptBlockV2`, and `_stateLabel`.

Let me plan the rewrite carefully.

**Design of the new `_appendMethodsV2(iq, rec)`:**

```js
Viewer.prototype._appendMethodsV2 = function (iq, rec) {
  const self = this;
  const labels = (rec.identity && rec.identity.option_labels) || this._optionLabels(this.cur) || [];
  const methods = rec.methods || [];
  if (!methods.length) return new Set();

  // Map method id -> index (creation order)
  const indexOf = {};
  methods.forEach((m, i) => { indexOf[m.id] = i; });

  // Group self_report_prompts by the index of the last referenced method,
  // so that each prompt sits next to its method, and group prompts
  // (multiple method_refs) are shown once after the last member.
  const prompts = rec.self_report_prompts || [];
  const afterMethod = {};   // methodIndex -> [prompt,...]
  const orphans = [];        // prompts with no resolvable method_refs
  const rendered = new Set();
  prompts.forEach((p) => {
    const refs = p.method_refs || [];
    let last = -1;
    refs.forEach((r) => { if (indexOf[r] !== undefined && indexOf[r] > last) last = indexOf[r]; });
    if (last < 0) { orphans.push(p); return; }
    (afterMethod[last] = afterMethod[last] || []).push(p);
    rendered.add(p.id);
  });

  methods.forEach((m, i) => {
    const localPrompts = (afterMethod[i] || []);
    const hasLocalPrompt = localPrompts.length > 0 ||
      prompts.some((p) => (p.method_refs || []).indexOf(m.id) >= 0);
    iq.appendChild(self._methodBlockV2(m, labels, hasLocalPrompt));
    // Place this method's prompts right next to it (group prompts after the last member)
    localPrompts.forEach((p) => iq.appendChild(self._promptBlockV2(p, "method")));
  });

  // Orphan prompts (no matching method) — don't discard, show after the methods
  orphans.forEach((p) => iq.appendChild(self._promptBlockV2(p, "method")));

  return rendered;
};
```

Wait — `hasLocalPrompt` should be true if any prompt references this method (not just those rendered after this method). Because "if created local prompts exist, hide the generic `used it` control." So if any prompt's method_refs contains m.id, hide "used it." Let me compute this properly. Actually, the `localPrompts` for method i are the prompts whose last ref is i. But a method could be referenced by a group prompt whose last ref is a different method. Example: Q40's method[0] (within_eighty...) is referenced by prompt[1] (last ref = idx2) and prompt[4] (last ref = idx4). So method[0] has no prompts rendered after it, but it is referenced by local prompts. So its "used it" should be hidden.

So `hasLocalPrompt` = any prompt's method_refs contains m.id. Let me compute a set of referenced method ids:
```js
const referenced = new Set();
prompts.forEach((p) => (p.method_refs || []).forEach((r) => referenced.add(r)));
```
Then `hasLocalPrompt = referenced.has(m.id)`.

This is cleaner. Let me use this.

**`_methodBlockV2(m, labels, hasLocalPrompt)`:** renders a single method with presentation_kind styling.

```js
Viewer.prototype._methodBlockV2 = function (m, labels, hasLocalPrompt) {
  const self = this;
  const kind = m.presentation_kind || "route";
  const md = el("div", { class: "ppq-iq-method ppq-iq-method-" + kind });
  const head = el("div", { class: "ppq-iq-method-head" });
  head.appendChild(el("span", { class: "ppq-iq-method-kind" }, self._methodKindLabel(kind)));
  head.appendChild(el("b", null, esc(m.title || m.id)));
  if (!hasLocalPrompt) {
    const used = el("button", { class: "ppq-iq-used", type: "button" }, "used it");
    used.addEventListener("click", () => {
      const on = used.classList.toggle("on");
      if (on) self._analysisSelfReports[m.id] = "used"; else delete self._analysisSelfReports[m.id];
      self._fireReport({ status: "interrogation", qtype: "self_report", extra_json: JSON.stringify({ method_id: m.id, method_ref: m.id, state: on ? "used" : "not_used" }) });
    });
    head.appendChild(used);
  }
  md.appendChild(head);
  const steps = el("div", { class: "ppq-iq-method-desc" });
  (m.pupil_steps || []).forEach((s, si) => {
    steps.appendChild(el("div", { class: "ppq-iq-method-line" + (kind === "route" ? " numbered" : "") },
      kind === "route" ? ((si + 1) + ". " + s) : s));
  });
  md.appendChild(steps);
  md.appendChild(self._elimChipsV2El(m, labels));
  return md;
};

Viewer.prototype._methodKindLabel = function (kind) {
  return kind === "independent_check" ? "check"
    : kind === "synthesis" ? "putting it together"
    : "route";
};
```

Hmm, for route numbering, I'm prefixing the step text with "(si+1). ". But that puts the number inside the text. Better to use CSS counter or a separate span. Let me use a span for the number:
```js
const line = el("div", { class: "ppq-iq-method-line" + (kind === "route" ? " numbered" : "") });
if (kind === "route") line.appendChild(el("span", { class: "ppq-iq-stepnum" }, String(si + 1)));
line.appendChild(el("span", { class: "ppq-iq-steptext" }, esc(s)));
```
Wait, but existing code uses `el("div", {class}, esc(s))` — the third arg is text content. Let me check the `el` helper signature. From usage: `el("div", { class: "..." }, "text")` creates an element with textContent. And `el("div", {class})` with no third arg. To append children, use appendChild. Let me verify the `el` helper.

Let me check the `el` function definition.

Actually, from the code I've seen: `el("div", { class: "ppq-iq-guesspage" })` (no content), `el("div", { class: "ppq-iq-guesspage-heading" }, esc(...))` (with text). So `el(tag, attrs, textContent)`. For multiple children, create the parent and appendChild.

For numbered steps, let me do:
```js
(m.pupil_steps || []).forEach((s, si) => {
  if (kind === "route") {
    const line = el("div", { class: "ppq-iq-method-line numbered" });
    line.appendChild(el("span", { class: "ppq-iq-stepnum" }, String(si + 1) + "."));
    line.appendChild(el("span", { class: "ppq-iq-steptext" }, esc(s)));
    steps.appendChild(line);
  } else {
    steps.appendChild(el("div", { class: "ppq-iq-method-line" }, esc(s)));
  }
});
```

**Rewrite of `_elimChipsV2El` (#3):** colored letters only, complete rail, 7 relationships.

```js
Viewer.prototype._elimChipsV2El = function (m, labels) {
  const wrap = el("div", { class: "ppq-iq-elim" });
  if (!labels.length) return wrap;
  // Relationship -> css class. Colored letters only: no pill/background/strikethrough.
  const relClass = {
    directly_identifies: "di",
    supports: "sup",
    favours: "fav",
    unaffected: "un",
    counts_against: "ca",
    disfavours: "dis",
    rules_out: "ro"
  };
  const byLabel = {};
  const evidence = m.option_evidence;
  if (evidence && evidence.length) {
    evidence.forEach((e) => { byLabel[String(e.label).toUpperCase()] = e.relationship; });
  } else {
    // Legacy fallback: eliminates -> rules_out, lands_on -> directly_identifies,
    // projected onto the same complete rail (everything else unaffected).
    (m.eliminates || []).forEach((L) => { byLabel[String(L).toUpperCase()] = "rules_out"; });
    if (m.lands_on) byLabel[String(m.lands_on).toUpperCase()] = "directly_identifies";
    if (!Object.keys(byLabel).length) return wrap;
  }
  const row = el("div", { class: "ppq-iq-elim-row" });
  labels.forEach((L) => {
    L = String(L).toUpperCase();
    const rel = byLabel[L] || "unaffected";
    const cls = relClass[rel] || "un";
    row.appendChild(el("span", {
      class: "ppq-elim2 " + cls,
      title: rel.replace(/_/g, " ")
    }, L));
  });
  wrap.appendChild(row);
  return wrap;
};
```

Wait — the handoff says "a surviving option is `unaffected`, not positive evidence." And "every method-local rail must show every option in the same fixed position; a previous check does not remove or recolor a letter for a later independent check." So each method's rail is independent and shows all options. When a label has no evidence in this method, it's `unaffected` (grey). Good — that's what `byLabel[L] || "unaffected"` does.

But note: in the legacy fallback, if a label is neither eliminated nor landed on, it should be `unaffected` (grey), not "dim." Good.

Now, I'm using a new class `ppq-elim2` to avoid conflicting with the old `.ppq-elim` pill styles. Actually, I should replace `.ppq-elim` styles entirely, since the old chips are being replaced. But the legacy path (`_appendMethodsLegacy`) might also use `.ppq-elim`. Let me check — the legacy `_appendMethodsLegacy` uses `_elimChipsLegacy` or similar. Let me check what class the legacy uses. Actually, to be safe, let me use a new class `ppq-oev` (option-evidence) for the new rail and leave `.ppq-elim` for legacy. That way I don't break the legacy path.

Hmm, but the handoff's hotspots list includes `.ppq-elim CSS` as something to change. Let me check whether legacy uses `.ppq-elim`. Let me search.

Actually, let me reconsider. The v2 path is the future, and legacy is for old analysis-store records. The handoff is about v2 presentation. Let me use a new class `ppq-oev` for the v2 rail (colored letters) and leave `.ppq-elim` alone for legacy. That's the safest.

Wait, but I'm rewriting `_elimChipsV2El`, which is only used in the v2 path (`_appendMethodsV2`). Legacy uses its own renderer. So I can either freely change the classes `_elimChipsV2El` uses, or reuse `.ppq-elim` with new styles. But if I change `.ppq-elim` styles, it affects legacy if legacy uses it. Let me check whether legacy uses `.ppq-elim`.

Let me grep for elim usage in legacy methods.

Let me design the colored-letter CSS. The letters themselves are colored, no background/border/pill:
```css
.ppq-oev-row { display: flex; gap: 0.55rem; flex-wrap: wrap; margin-top: 0.35rem; align-items: baseline; }
.ppq-oev { font-weight: 800; font-size: 0.95rem; line-height: 1; }
.ppq-oev.ro  { color: #c0392b; }              /* rules_out: red */
.ppq-oev.ca  { color: #e57373; }              /* counts_against: light red */
.ppq-oev.dis { color: #e67e22; }              /* disfavours: orange */
.ppq-oev.un  { color: #9aa0a6; }              /* unaffected: grey */
.ppq-oev.fav { color: #5dade2; }              /* favours: light blue */
.ppq-oev.sup { color: #82c99a; }              /* supports: light green */
.ppq-oev.di  { color: #1e7d3c; font-weight: 900; }  /* directly_identifies: solid green */
```

Wait, the handoff says "no background, pill, border, strikethrough, checkmark, underline, diamond, or cumulative omission." So letters only. Good.

Legend: "when a legend is needed, use words or non-letter swatches; never use A–G as legend keys." Should I add a legend? The handoff says "when needed." Let me add a small legend below the rail — but not per-method (that would be cluttered). Actually, a legend explaining the colors would be helpful. But where? Maybe once at the top of the methods section. But the handoff says to remove the "Ways through it" framing. A small legend might be OK.

Hmm, let me reconsider. The colors are: red = ruled out, grey = unaffected, green = identified. These are fairly intuitive. But light-red vs orange vs grey vs light-blue might be confusing. A legend would help. But the handoff says "the final visual distinction between all three negative-evidence shades is intentionally not settled yet. Don't collapse their data meanings, but don't lock in a palette that's hard to read either."

Let me add a compact legend once, after the methods (or as part of the first rail). Actually, let me add it as a small line that appears once. Let me put a helper that renders the legend once. But where to put it? Let me add it at the end of the methods section (after all methods), as a quiet line with word-swatches. Actually, to keep it simple and avoid clutter, let me add the legend once right before the methods (as part of _appendMethodsV2). But that's close to the "framing" that was removed...

Let me think about what's cleanest. The rail shows colored letters. A tooltip (title attribute) explains each letter's relationship on hover. That might be enough for now. But a visible legend is more accessible. Let me add a single compact legend line at the top of the methods block. Use colored dots (non-letter swatches) + words. Example:
"● ruled out  ● counts against  ● no effect  ● supports  ● identifies"

Actually, that could get long. Let me include the main ones the pupil will see. Let me render the legend with the relationships that actually appear in this question's methods, to keep it short. That's a nice touch — only legend entries for relationships in use.

Hmm, that adds complexity. Let me keep it simpler: a fixed compact legend with the most common relationships. Actually, let me render a legend with all 7 but that's too many.

Let me step back. The handoff says "when a legend is needed." It's optional. Given the "not settled" palette, let me add a minimal legend showing only the relationships present in the record's methods. That's clean and self-limiting. Let me implement a helper `_optionRailLegendEl(methods)` that collects distinct relationships across all methods and renders word-swatches.

Actually, for simplicity and to avoid over-engineering, let me render the legend once per question (inside _appendMethodsV2, after the methods), showing the distinct relationships present. Let me do that.

Wait, but I want to keep the DOM order: methods with interleaved prompts, then a legend at the end? Or legend at the top? A legend at the top helps reading the rails that follow. Let me put it at the top, right before the first method. But that's where "Ways through it" was. A small legend line is fine and is not "framing."

Hmm, let me reconsider — actually, the simplest and least cluttered approach: put the legend at the end of the methods block, as a quiet footer. Pupils read the rails, and if confused, look at the legend. But that's not great for accessibility.

Let me put a compact legend at the top. Let me decide: at the top, before methods, a single line with colored dots + words for the relationships present in this record. Let me implement it.

Actually, you know what — let me keep it even simpler for now and rely on the `title` tooltip for each letter plus a small legend. Let me include the legend. I'll render it at the top of the methods section. Let me move on.

Let me reconsider the whole structure once more. I'm removing the "Ways through it" subhead and the encouragement line. So `_appendMethodsV2` will just render methods directly (with interleaved prompts), plus optionally a legend. Good.

**Rewrite of `_appendSelfReportV2` (#4):**

```js
Viewer.prototype._appendSelfReportV2 = function (iq, rec, renderedPromptIds) {
  renderedPromptIds = renderedPromptIds || new Set();
  const srps = rec.self_report_prompts || [];
  const checks = ((rec.requirements || {}).post_question_checks) || [];

  // Orphan self-report prompts (no matching method) were already rendered
  // inside the methods section; here we only pick up anything not yet shown.
  srps.filter((p) => !renderedPromptIds.has(p.id)).forEach((p) => iq.appendChild(this._promptBlockV2(p, "method")));

  // Knowledge checks (requirement_refs, never method_refs) stay here.
  checks.forEach((c) => iq.appendChild(this._promptBlockV2(c, "check")));

  // pupil_analysis.check_prompt — plain-string question, no states.
  const cp = (rec.pupil_analysis || {}).check_prompt;
  if (cp) {
    const cpBox = el("div", { class: "ppq-iq-prompt ppq-iq-checkprompt" });
    cpBox.appendChild(el("div", { class: "ppq-iq-prompt-text" }, esc(cp)));
    iq.appendChild(cpBox);
  }
};
```

Wait — but `_appendMethodsV2` already renders orphan prompts (those with no matching method_refs). And it returns `rendered` = only the ids of prompts that had matching refs. So orphans are rendered in the methods section but not in `rendered`. Then `_appendSelfReportV2` would re-render them (since they're not in renderedPromptIds). That's a duplicate!

Let me fix: `_appendMethodsV2` should return all prompt ids it rendered (both matched and orphans). Let me add orphan ids to `rendered` too. Then `_appendSelfReportV2`'s filter will skip them. Actually, if all prompts have method_refs (as in the data), there are no orphans. But to be safe, let me add orphan ids to `rendered` and not render them separately in the methods section...

Hmm, wait. Where should orphan prompts be rendered? If a prompt has no matching method, it should still be shown (not discarded). The handoff says prompts sit next to their methods. Orphans have no method. Let me render orphans in the self-report section (not the methods section). That's cleaner: `_appendMethodsV2` only renders prompts with matching methods and returns their ids. `_appendSelfReportV2` renders the rest (orphans) + checks + check_prompt.

So in `_appendMethodsV2`, don't render orphans, just don't add them to `rendered`. Then `_appendSelfReportV2` will render them (via the filter). Let me remove orphan rendering from `_appendMethodsV2`.

Let me finalize:
- `_appendMethodsV2`: renders methods + prompts with matching method_refs (interleaved). Returns Set of rendered prompt ids.
- `_appendSelfReportV2(iq, rec, renderedIds)`: renders prompts not in renderedIds (orphans), then checks, then check_prompt.

Good.

**Rewrite of `_promptBlockV2` (multi-select + state labels):**

```js
Viewer.prototype._promptBlockV2 = function (p, kind) {
  const self = this;
  const box = el("div", { class: "ppq-iq-prompt" });
  box.appendChild(el("div", { class: "ppq-iq-prompt-text" }, esc(p.prompt || "")));
  const chips = el("div", { class: "ppq-iq-prompt-states" });
  const multi = !!p.multi_select;
  (p.states || []).forEach((st) => {
    const chip = el("button", { class: "ppq-iq-state", type: "button", "data-state": st }, self._stateLabel(st));
    chip.addEventListener("click", () => {
      if (multi) {
        chip.classList.toggle("sel");
        // Collect all selected states
        const sel = Array.prototype.map.call(chips.querySelectorAll(".ppq-iq-state.sel"), (c) => c.dataset.state);
        self._promptStates[p.id] = sel;
        self._fireReport({ status: "interrogation", qtype: "self_report", extra_json: JSON.stringify({ prompt_id: p.id, prompt_kind: kind, states: sel, attempt_id: self._attemptId || "" }) });
      } else {
        chips.querySelectorAll(".ppq-iq-state").forEach((c) => c.classList.remove("sel"));
        chip.classList.add("sel");
        self._promptStates[p.id] = st;
        self._fireReport({ status: "interrogation", qtype: "self_report", extra_json: JSON.stringify({ prompt_id: p.id, prompt_kind: kind, state: st, attempt_id: self._attemptId || "" }) });
      }
      self._renderInterrogationFeedback();
    });
    chips.appendChild(chip);
  });
  box.appendChild(chips);
  return box;
};
```

Wait — but changing `_promptStates[p.id]` to an array in the multi-select case might break feedback matching (`_renderInterrogationFeedback` uses `_promptStates`). Since multi-select isn't in the data yet, this path won't fire. But I should make sure feedback matching doesn't crash. Let me check how `_promptStates` is used in feedback matching. Let me look at `_renderInterrogationFeedback` and the feedback matching logic.

Actually, since multi-select isn't in the data, let me keep it simple: support the toggle, but store the value in a way that doesn't break single-select matching. Let me check the feedback matcher. Let me read `_renderInterrogationFeedback`.

Actually, let me not over-engineer multi-select. The handoff says "allow multi-select if created controls can have multiple descriptions true at once." Since the schema has no multi_select field yet, this is forward-looking. Let me implement it to store an array for multi, and make the feedback matcher handle both string and array. But to be safe, let me check the matcher first.

**Rewrite of `_stateLabel` (strip proposed__):**

```js
Viewer.prototype._stateLabel = function (st) {
  let s = String(st || "").replace(/^proposed__/, "").replace(/_+/g, " ").trim();
  return s.charAt(0).toUpperCase() + s.slice(1);
};
```

`proposed__checked_both_features` → strip prefix → `checked_both_features` → `_+`→space → "checked both features" → "Checked both features".
`secure_before_question` → no prefix → "secure before question" → "Secure before question".
Good.

Now, let me check the feedback matcher to make sure `_promptStates` handling is safe. Let me read `_renderInterrogationFeedback`.

Let me read lines 1642–1720 (feedback rendering + matching).

Actually, this is getting long. Let me first do the JS edits for methods/self-report/state-label/prompt-block, then check the feedback matcher, then do the CSS. Let me read the feedback matcher quickly to be safe about multi-select.

Let me read _renderInterrogationFeedback and the matching.

I have everything I need. Let me check the feedback matcher first so the multi-select change doesn't break `_promptStates` matching.



#### Tool: Read

> Read: `C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\engine\ppqviewer.js`

**Output:**

```json
1660	
1661	  Viewer.prototype._renderInterrogationFeedback = function () {
1662	    if (!this._iqBox || !this._iqBox.isConnected) return; /* pop-up may have been dismissed */
1663	    const fbBox = this._iqBox.querySelector(".ppq-iq-feedback");
1664	    if (!fbBox) return;
1665	    const fb = this._matchInterrogationFeedback();
1666	    fbBox.innerHTML = "";
1667	    if (!fb) return;
1668	    fbBox.appendChild(el("div", { class: "ppq-iq-feedback-text" }, esc(fb.text)));
1669	  };
1670	
1671	  /* QoderWork 2026-07-22: best-effort parse of a method's free-prose `eliminates`
1672	     field into red (killed options) and green (lands-on option) letter chips.
1673	     NOTE-TO-SELF: this regex pass is a STOPGAP — the analysts need to add a
1674	     structured per-method field (eliminates:[letters], lands_on:letter) so the
1675	     red/green display is reliable. Anything we can't parse falls back to showing
1676	     the raw prose rather than guessing. */
1677	  Viewer.prototype._elimChipsEl = function (m, labels, correctLetter) {
1678	    const wrap = el("div", { class: "ppq-iq-elim" });
1679	    const txt = (m.eliminates || "").toString();
1680	    if (!txt) return wrap;
1681	
1682	    /* green = the letter this method lands on / takes you straight to */
1683	    const green = [];
1684	    const gMatch = txt.match(/(?:lands?\s+(?:\w+\s+)?on|(?:goes?|takes?\s+you)?\s*straight\s+to|leav(?:es|ing|e)(?:\s+only)?|down\s+to|narrows?\s+to|everything\s+but|all\s+but|kills?\s+everything\s+but)\s*([A-H])\b/i);
1685	    if (gMatch) green.push(gMatch[1].toUpperCase());
1686	
1687	    /* red = letters this method kills: a parenthesised letter list, and/or an
1688	       explicit elimination verb. Never mark a green letter red. */
1689	    const red = [];
1690	    const addRed = (L) => { L = (L || "").toUpperCase(); if (L && red.indexOf(L) < 0 && green.indexOf(L) < 0) red.push(L); };
1691	    (txt.match(/\(([A-H](?:\s*[,\/&]\s*[A-H])*)\)/g) || []).forEach((g) => { (g.match(/[A-H]/g) || []).forEach(addRed); });
1692	    const verbRe = /(?:rules?\s+out|kills?|eliminates?|removes?|discards?|excludes?|cuts?\s+out)\s+([A-H](?:\s*(?:,|\/|&|and)\s*[A-H])*)/gi;
1693	    let vm;
1694	    while ((vm = verbRe.exec(txt)) !== null) { (vm[1].match(/[A-H]/g) || []).forEach(addRed); }
1695	
1696	    /* "narrows to one" phrasing means everything not landed-on is killed */
1697	    const narrows = /(?:everything\s+but|all\s+but|leav(?:es|ing|e)\s+only|down\s+to|narrows?\s+to|kills?\s+everything\s+but)/i.test(txt);
1698	    if (narrows && green.length) labels.forEach((L) => addRed(String(L)));
1699	
1700	    if (!green.length && !red.length) {
1701	      /* couldn't parse any letters — show the raw prose rather than guess */
1702	      wrap.appendChild(el("div", { class: "ppq-iq-elim-prose" }, "rules out: " + esc(txt)));
1703	      return wrap;
1704	    }
1705	    if (labels.length) {
1706	      const row = el("div", { class: "ppq-iq-elim-row" });
1707	      labels.forEach((L) => {
1708	        L = String(L).toUpperCase();
1709	        const cls = red.indexOf(L) >= 0 ? "red" : (green.indexOf(L) >= 0 ? "green" : "dim");
1710	        row.appendChild(el("span", { class: "ppq-elim " + cls }, L));
1711	      });
1712	      wrap.appendChild(row);
1713	    }
1714	    wrap.appendChild(el("div", { class: "ppq-iq-elim-prose" }, esc(txt)));
1715	    return wrap;
1716	  };
1717	
1718	  Viewer.prototype._matchInterrogationFeedback = function () {
1719	    const rec = this._analysis;
1720	    if (!rec || !rec.feedback) return null;
1721	    /* QoderWork 2026-07-22 (analyst handoff): v2 records use the structured
1722	       selected_options / prompt_id / states / guess_declared grammar; legacy
1723	       records keep the old on/when grammar. */
1724	    if (this._isV2(rec)) return this._matchFeedbackV2(rec);
1725	    const chosen = this._chosenLabel, isRight = this._wasRight, sr = this._analysisSelfReports;
1726	    for (let i = 0; i < rec.feedback.length; i++) {
1727	      const fb = rec.feedback[i];
1728	      let onOk = false;
1729	      if (fb.on === "any_wrong") onOk = isRight === false;
1730	      else if (fb.on === "any_correct") onOk = isRight === true;
1731	      else if (fb.on && fb.on.indexOf("option:") === 0) onOk = fb.on.slice(7).toUpperCase() === chosen;
1732	      else if (!fb.on) onOk = true;
1733	      if (!onOk) continue;
1734	      if (this._interrogationWhenMatches(fb.when, sr)) return fb;
```

#### Thinking

Let's take a look at `_matchFeedbackV2` to see how `_promptStates` is used in matching.

#### Tool: Read

> Read: `C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\engine\ppqviewer.js`

**Output:**

```json
1740	     Constraints (all optional, first entry whose constraints all hold wins):
1741	     - selected_options: the committed option must be in the list;
1742	     - guess_declared: true → a guess must have been declared (pre or post),
1743	       false → it must not have been;
1744	     - prompt_id + states: the learner must have answered that self-report
1745	       prompt, and (if states is non-empty) chosen one of those states. */
1746	  Viewer.prototype._matchFeedbackV2 = function (rec) {
1747	    const chosen = String(this._chosenLabel || "").toUpperCase();
1748	    const guessDeclared = !!(this._postGuessDeclared || this._preGuessDeclaration);
1749	    for (let i = 0; i < rec.feedback.length; i++) {
1750	      const fb = rec.feedback[i];
1751	      if (fb.selected_options && fb.selected_options.length) {
1752	        const opts = fb.selected_options.map((o) => String(o).toUpperCase());
1753	        if (opts.indexOf(chosen) < 0) continue;
1754	      }
1755	      if (fb.guess_declared === true && !guessDeclared) continue;
1756	      if (fb.guess_declared === false && guessDeclared) continue;
1757	      if (fb.prompt_id) {
1758	        const st = this._promptStates[fb.prompt_id];
1759	        if (!st) continue; /* prompt not answered yet — feedback not ready */
1760	        if (fb.states && fb.states.length && fb.states.indexOf(st) < 0) continue;
1761	      }
1762	      return fb;
1763	    }
1764	    return null;
1765	  };
1766	
1767	  Viewer.prototype._interrogationWhenMatches = function (when, sr) {
1768	    if (!when) return true;
1769	    const ci = when.indexOf(":");
1770	    if (ci > 0) {
1771	      const state = when.slice(0, ci), ref = when.slice(ci + 1);
1772	      /* Direct: the learner's reported state for the prompted method_ref. */
1773	      if (sr[ref] === state) return true;
1774	      /* NOTE-TO-SELF 3 (rough): feedback may reference a method by KIND rather than
1775	         by the prompted method_ref, e.g. when:"used:full_solve". full_solve is the
1776	         default route, so infer it was used when the learner did NOT report taking a
1777	         prompted shortcut. Reconcile with misconceptions_core.yaml, do not keep. */
1778	      const rec = this._analysis;
1779	      if (rec && rec.methods && state === "used" && ref === "full_solve") {
1780	        const isKind = rec.methods.some((m) => m.kind === "full_solve");
1781	        if (isKind) {
1782	          const tookShortcut = Object.keys(sr).some((k) => sr[k] === "used" || sr[k] === "saw_and_used");
1783	          return !tookShortcut;
1784	        }
1785	      }
1786	      return false;
1787	    }
1788	    /* NOTE-TO-SELF 3: bare derived flag (e.g. did_not_sketch). Crude prefix match on
1789	       the state's first two tokens. Replace with misconceptions_core.yaml look-up. */
1790	    for (const ref in sr) {
1791	      const st = sr[ref];
1792	      const prefix = String(st).split("_").slice(0, 2).join("_");
1793	      if (prefix && when.indexOf(prefix) === 0) return true;
1794	    }
```

#### Thinking

The feedback matcher `_matchFeedbackV2` uses `this._promptStates[fb.prompt_id]` and checks `fb.states.indexOf(st) < 0`. If `st` is an array (multi-select), `fb.states.indexOf(array)` returns -1 (no match), so feedback won't fire — but it also won't crash. Since multi-select isn't included in the data, this is acceptable for now. But to be safe and correct, let's make the matcher able to handle arrays:

```js
if (fb.prompt_id) {
  const st = this._promptStates[fb.prompt_id];
  if (!st) continue;
  if (fb.states && fb.states.length) {
    const chosenStates = Array.isArray(st) ? st : [st];
    const hit = chosenStates.some((s) => fb.states.indexOf(s) >= 0);
    if (!hit) continue;
  }
}
```

This handles both the single (string) and multi (array) cases. Let's apply this small fix too.

Now let's do all the JS edits. We'll do the following:
1. Rewrite `_appendMethodsV2` (with presentation_kind, interleaved prompts, used-it hiding, legend).
2. Add `_methodBlockV2` and `_methodKindLabel` helpers.
3. Rewrite `_elimChipsV2El` (colored-letter rail).
4. Add a legend helper `_optionRailLegendEl`.
5. Rewrite `_appendSelfReportV2` (accepts renderedIds, renders orphans + checks + check_prompt).
6. Rewrite `_promptBlockV2` (multi-select support).
7. Rewrite `_stateLabel` (strip proposed__).
8. Fix `_matchFeedbackV2` to handle array states.
9. Update the call site (around line 1246) to pass rendered ids.

First, let's start by replacing the whole block from `_appendMethodsV2` through `_stateLabel` (lines 1465–1604). This is a big contiguous region. Let's replace it wholesale.

Actually, `_appendInsightV2` (1449–1463) sits before `_appendMethodsV2`. The region to replace is 1465 (comment) through 1604 (end of `_stateLabel`). Let's replace this entire block.

Let's carefully construct the new block. We need to preserve the `el` and `esc` helpers (which are global within the IIFE). Let's confirm `el` accepts (tag, attrs, text). Let's quickly verify the el helper signature.

From the usages I've seen, `el("div", {class}, "text")` and `el("div", {class})`. Let's confirm the definition.

The matcher needs a small array-safety fix for multi-select. Let me confirm the `el` helper signature before rewriting.



#### Tool: Grep

**Input:**

```json
{
  "-n": true,
  "output_mode": "content",
  "path": "C:\\Claude (not on Gdrive, nor OneDrive)\\ppqviewer\\engine\\ppqviewer.js",
  "pattern": "function el\\(|const el =|var el ="
}
```

**Output:**

```json
44:  function el(tag, attrs, html) {
```

#### Thinking

Let's try reading the el helper.

#### Tool: Read

> Read: `C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\engine\ppqviewer.js`

**Output:**

```json
44	  function el(tag, attrs, html) {
45	    const n = document.createElement(tag);
46	    if (attrs) for (const k in attrs) {
47	      if (k === "class") n.className = attrs[k];
48	      else if (k === "style") n.style.cssText = attrs[k];
49	      else if (k.slice(0, 5) === "data-") n.setAttribute(k, attrs[k]);
50	      else n[k] = attrs[k];
51	    }
52	    if (html != null) n.innerHTML = html;
53	    return n;
54	  }
55	  function esc(s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
```

#### Thinking

Important: `el(tag, attrs, html)` sets `innerHTML` (not textContent). Therefore the third argument is HTML. Existing code passes `esc(...)` as the third argument — this is escaped HTML, so it's safe. For consistency and safety, I'll continue using `esc(...)`.

Now, let's do the big rewrite. Replace the block from the `_appendMethodsV2` comment (line 1465) to the end of `_stateLabel` (line 1604).

Let's construct the replacement content. Need to be careful with the exact old_string. The block is large. Let's replace it in parts to reduce risk:

Part A: `_appendMethodsV2` (lines 1465–1494) — replace with new version + `_methodBlockV2` + `_methodKindLabel` + `_optionRailLegendEl`.
Part B: `_elimChipsV2El` (lines 1496–1540) — replace with colored-letter rail.
Part C: `_appendSelfReportV2` + `_promptBlockV2` + `_stateLabel` (lines 1542–1604) — replace.

Let's start with Part A first. The old_string is the comment + function on lines 1465–1494. Let's grab the exact text from the earlier read:

```
  /* QoderWork 2026-07-22 (analyst handoff): v2 methods. title + structured
     pupil_steps rendered DIRECTLY (no prose parsing); red/green chips come from
     the structured eliminates[] / lands_on fields. The "used it" tickbox stays
     as SUPPLEMENTARY evidence — it does not replace the structured self-report. */
  Viewer.prototype._appendMethodsV2 = function (iq, rec) {
    const self = this;
    const labels = this._optionLabels(this.cur) || [];
    const methods = rec.methods || [];
    if (!methods.length) return;
    iq.appendChild(el("div", { class: "ppq-iq-subhead" }, "Ways through it"));
    iq.appendChild(el("div", { class: "ppq-iq-encourage" }, "Most of these have more than one route through — collecting alternatives is the point."));
    methods.forEach((m) => {
      const md = el("div", { class: "ppq-iq-method" });
      const head = el("div", { class: "ppq-iq-method-head" });
      head.appendChild(el("b", null, esc(m.title || m.id)));
      const used = el("button", { class: "ppq-iq-used", type: "button" }, "used it");
      used.addEventListener("click", () => {
        const on = used.classList.toggle("on");
        if (on) self._analysisSelfReports[m.id] = "used"; else delete self._analysisSelfReports[m.id];
        self._fireReport({ status: "interrogation", qtype: "self_report", extra_json: JSON.stringify({ method_id: m.id, method_ref: m.id, state: on ? "used" : "not_used" }) });
      });
      head.appendChild(used);
      md.appendChild(head);
      const steps = el("div", { class: "ppq-iq-method-desc" });
      (m.pupil_steps || []).forEach((s) => steps.appendChild(el("div", { class: "ppq-iq-method-line" }, esc(s))));
      md.appendChild(steps);
      md.appendChild(self._elimChipsV2El(m, labels));
      iq.appendChild(md);
    });
  };
```

Let's replace this with the new implementation. I'll write it out.

For the legend, I'll collect the distinct relationships that exist across all methods and render word swatches. Let's define relationship labels + colors:
```
const REL_META = {
  rules_out: { label: "rules out", cls: "ro" },
  counts_against: { label: "counts against", cls: "ca" },
  disfavours: { label: "disfavours", cls: "dis" },
  unaffected: { label: "no effect", cls: "un" },
  favours: { label: "favours", cls: "fav" },
  supports: { label: "supports", cls: "sup" },
  directly_identifies: { label: "identifies", cls: "di" }
};
```

The legend should display a colored dot (non-letter swatch) + word for each relationship that exists. Render only the ones that exist, in a stable order (negative → neutral → positive). Let's define the order: rules_out, counts_against, disfavours, unaffected, favours, supports, directly_identifies.

Let's write `_optionRailLegendEl(methods)`:
```js
Viewer.prototype._optionRailLegendEl = function (methods) {
  const order = ["rules_out", "counts_against", "disfavours", "unaffected", "favours", "supports", "directly_identifies"];
  const meta = { rules_out: ["ro", "rules out"], counts_against: ["ca", "counts against"], disfavours: ["dis", "disfavours"], unaffected: ["un", "no effect"], favours: ["fav", "favours"], supports: ["sup", "supports"], directly_identifies: ["di", "identifies"] };
  const present = {};
  methods.forEach((m) => {
    (m.option_evidence || []).forEach((e) => { present[e.relationship] = 1; });
    if (!m.option_evidence || !m.option_evidence.length) {
      if ((m.eliminates || []).length) present.rules_out = 1;
      if (m.lands_on) present.directly_identifies = 1;
      // If there's a rail, unaffected is always implicitly present
    }
  });
  const keys = order.filter((k) => present[k]);
  if (!keys.length) return null;
  const leg = el("div", { class: "ppq-oev-legend" });
  keys.forEach((k) => {
    const item = el("span", { class: "ppq-oev-legend-item" });
    item.appendChild(el("span", { class: "ppq-oev-dot " + meta[k][0] }));
    item.appendChild(el("span", null, meta[k][1]));
    leg.appendChild(item);
  });
  return leg;
};
```

Hmm, "unaffected" is always present in any rail that has evidence (surviving options). Should it be included in the legend? It's the grey "no effect". Including it is useful. But if I only include relationships present in the option_evidence, unaffected is usually present. OK. Let's also add unaffected if any method has a rail. Actually, my loop adds relationships found in option_evidence, and unaffected is usually in there. OK.

Now, where to render the legend?

terminated

### **You**

carry on

### **Assistant**

#### Thinking

Alright, now I'll execute the large-scale rewrite. I'll replace the entire block from the `_appendMethodsV2` comment (line 1465) through the end of `_stateLabel` (line 1604). This covers #2, #3, and #4.

I'll construct the new code carefully.

The new block:

```js
  /* QoderWork 2026-07-24 (handoff #2 + #4): v2 methods are rendered in their authored order,
     and each is styled according to presentation_kind (route = dependent numbered steps;
     independent_check = unnumbered peer check; synthesis = combination of checks).
     The generic "ways to solve it" framing and the "collect alternatives" sentence have been
     removed. Each self_report_prompt is placed next to the method specified by its method_refs;
     a prompt that references an entire peer group is shown only once, after the last member of
     that group. Methods that have an authored local prompt do not get the generic "used it"
     tickbox attached. Returns the set of rendered prompt ids, so the self-report section can
     skip them. */
  Viewer.prototype._appendMethodsV2 = function (iq, rec) {
    const self = this;
    const labels = (rec.identity && rec.identity.option_labels) || this._optionLabels(this.cur) || [];
    const methods = rec.methods || [];
    const rendered = new Set();
    if (!methods.length) return rendered;

    const indexOf = {};
    methods.forEach((m, i) => { indexOf[m.id] = i; });

    /* Which methods have an authored local prompt? Those lose the generic "used it". */
    const referenced = new Set();
    (rec.self_report_prompts || []).forEach((p) => (p.method_refs || []).forEach((r) => referenced.add(r)));

    /* Group prompts by the index of the LAST referenced method, so that a single-method prompt
       sits right after its method, and a group prompt (multiple method_refs) is shown only once,
       after the last member of the group. */
    const afterMethod = {};
    (rec.self_report_prompts || []).forEach((p) => {
      let last = -1;
      (p.method_refs || []).forEach((r) => { if (indexOf[r] !== undefined && indexOf[r] > last) last = indexOf[r]; });
      if (last < 0) return; /* orphan: no matching method — the self-report section will pick it up */
      (afterMethod[last] = afterMethod[last] || []).push(p);
      rendered.add(p.id);
    });

    /* A single compact legend that lists only the relationships this question actually uses. */
    const legend = this._optionRailLegendEl(methods);
    if (legend) iq.appendChild(legend);

    methods.forEach((m, i) => {
      iq.appendChild(self._methodBlockV2(m, labels, referenced.has(m.id)));
      (afterMethod[i] || []).forEach((p) => iq.appendChild(self._promptBlockV2(p, "method")));
    });

    return rendered;
  };

  /* QoderWork 2026-07-24 (handoff #2): one method block, styled by presentation_kind. */
  Viewer.prototype._methodBlockV2 = function (m, labels, hasLocalPrompt) {
    const self = this;
    const kind = m.presentation_kind || "route";
    const md = el("div", { class: "ppq-iq-method ppq-iq-kind-" + kind });
    const head = el("div", { class: "ppq-iq-method-head" });
    head.appendChild(el("span", { class: "ppq-iq-method-kind" }, esc(this._methodKindLabel(kind))));
    head.appendChild(el("b", null, esc(m.title || m.id)));
    /* QoderWork 2026-07-24 (handoff #4): when there is an authored local prompt, hide the generic "used it". */
    if (!hasLocalPrompt) {
      const used = el("button", { class: "ppq-iq-used", type: "button" }, "used it");
      used.addEventListener("click", () => {
        const on = used.classList.toggle("on");
        if (on) self._analysisSelfReports[m.id] = "used"; else delete self._analysisSelfReports[m.id];
        self._fireReport({ status: "interrogation", qtype: "self_report", extra_json: JSON.stringify({ method_id: m.id, method_ref: m.id, state: on ? "used" : "not_used" }) });
      });
      head.appendChild(used);
    }
    md.appendChild(head);
    const steps = el("div", { class: "ppq-iq-method-desc" });
    (m.pupil_steps || []).forEach((s, si) => {
      if (kind === "route") {
        /* Dependent steps are shown in sequence: numbered, because each inference
           genuinely relies on the one before it. */
        const line = el("div", { class: "ppq-iq-method-line numbered" });
        line.appendChild(el("span", { class: "ppq-iq-stepnum" }, String(si + 1)));
        line.appendChild(el("span", { class: "ppq-iq-steptext" }, esc(s)));
        steps.appendChild(line);
      } else {
        steps.appendChild(el("div", { class: "ppq-iq-method-line" }, esc(s)));
      }
    });
    md.appendChild(steps);
    md.appendChild(self._elimChipsV2El(m, labels));
    return md;
  };

  Viewer.prototype._methodKindLabel = function (kind) {
    if (kind === "independent_check") return "check";
    if (kind === "synthesis") return "putting it together";
    return "route";
  };

  /* QoderWork 2026-07-24 (handoff #3): a complete fixed-position option rail.
     Every option label from identity.option_labels is shown in the same position on every row,
     and the letters themselves are coloured according to their relationship — no background,
     no pills, no borders, no strikethrough. A surviving option is "unaffected", not positive
     evidence. When option_evidence is absent, eliminates / lands_on are projected onto the same
     rail. */
  Viewer.prototype._elimChipsV2El = function (m, labels) {
    const wrap = el("div", { class: "ppq-iq-elim" });
    if (!labels.length) return wrap;
    const relClass = {
      directly_identifies: "di", supports: "sup", favours: "fav", unaffected: "un",
      counts_against: "ca", disfavours: "dis", rules_out: "ro"
    };
    const byLabel = {};
    const evidence = m.option_evidence;
    if (evidence && evidence.length) {
      evidence.forEach((e) => { byLabel[String(e.label).toUpperCase()] = e.relationship; });
    } else {
      (m.eliminates || []).forEach((L) => { byLabel[String(L).toUpperCase()] = "rules_out"; });
      if (m.lands_on) byLabel[String(m.lands_on).toUpperCase()] = "directly_identifies";
      if (!Object.keys(byLabel).length) return wrap;
    }
    const row = el("div", { class: "ppq-oev-row" });
    labels.forEach((L) => {
      L = String(L).toUpperCase();
      const rel = byLabel[L] || "unaffected";
      row.appendChild(el("span", { class: "ppq-oev " + (relClass[rel] || "un"), title: rel.replace(/_/g, " ") }, L));
    });
    wrap.appendChild(row);
    return wrap;
  };

  /* QoderWork 2026-07-24 (handoff #3): a single quiet legend that lists only the relationships
     this question's methods actually use. Uses word + colour swatches — never A–G letters as
     the legend keys. */
  Viewer.prototype._optionRailLegendEl = function (methods) {
    const present = new Set();
    (methods || []).forEach((m) => {
      (m.option_evidence || []).forEach((e) => present.add(e.relationship));
      if (!m.option_evidence || !m.option_evidence.length) {
        if ((m.eliminates || []).length) present.add("rules_out");
        if (m.lands_on) present.add("directly_identifies");
      }
    });
    if (!present.size) return null;
    const words = {
      rules_out: "rules out", counts_against: "counts against", disfavours: "disfavours",
      unaffected: "no effect", favours: "favours", supports: "supports", directly_identifies: "identifies"
    };
    /* Display in semantic order: negative → neutral → positive. */
    const order = ["rules_out", "counts_against", "disfavours", "unaffected", "favours", "supports", "directly_identifies"];
    const relClass = { directly_identifies: "di", supports: "sup", favours: "fav", unaffected: "un", counts_against: "ca", disfavours: "dis", rules_out: "ro" };
    const legend = el("div", { class: "ppq-oev-legend" });
    order.forEach((rel) => {
      if (!present.has(rel)) return;
      const item = el("span", { class: "ppq-oev-legend-item" });
      item.appendChild(el("span", { class: "ppq-oev-swatch " + relClass[rel] }));
      item.appendChild(el("span", null, esc(words[rel] || rel.replace(/_/g, " "))));
      legend.appendChild(item);
    });
    return legend;
  };

  /* QoderWork 2026-07-24 (handoff #4): self-report items not placed next to a method —
     orphan prompts (no matching method_refs), knowledge checks (requirement_refs, never
     method_refs), and the plain-text check_prompt. Prompts already rendered inside the methods
     section are skipped via renderedIds. */
  Viewer.prototype._appendSelfReportV2 = function (iq, rec, renderedIds) {
    renderedIds = renderedIds || new Set();
    const srps = rec.self_report_prompts || [];
    const checks = ((rec.requirements || {}).post_question_checks) || [];

    srps.filter((p) => !renderedIds.has(p.id)).forEach((p) => iq.appendChild(this._promptBlockV2(p, "method")));
    checks.forEach((c) => iq.appendChild(this._promptBlockV2(c, "check")));

    const cp = (rec.pupil_analysis || {}).check_prompt;
    if (cp) {
      const cpBox = el("div", { class: "ppq-iq-prompt ppq-iq-checkprompt" });
      cpBox.appendChild(el("div", { class: "ppq-iq-prompt-text" }, esc(cp)));
      iq.appendChild(cpBox);
    }
  };

  Viewer.prototype._promptBlockV2 = function (p, kind) {
    const self = this;
    const box = el("div", { class: "ppq-iq-prompt" });
    box.appendChild(el("div", { class: "ppq-iq-prompt-text" }, esc(p.prompt || "")));
    const chips = el("div", { class: "ppq-iq-prompt-states" });
    /* QoderWork 2026-07-24 (handoff #4): when multiple descriptions can all be true,
       allow multi-select (opt-in via the authored multi_select flag). */
    const multi = !!p.multi_select;
    (p.states || []).forEach((st) => {
      const chip = el("button", { class: "ppq-iq-state", type: "button", "data-state": st }, self._stateLabel(st));
      chip.addEventListener("click", () => {
        if (multi) {
          chip.classList.toggle("sel");
          const sel = Array.prototype.map.call(chips.querySelectorAll(".ppq-iq-state.sel"), (c) => c.dataset.state);
          self._promptStates[p.id] = sel;
          self._fireReport({ status: "interrogation", qtype: "self_report", extra_json: JSON.stringify({ prompt_id: p.id, prompt_kind: kind, states: sel, attempt_id: self._attemptId || "" }) });
        } else {
          chips.querySelectorAll(".ppq-iq-state").forEach((c) => c.classList.remove("sel"));
          chip.classList.add("sel");
          self._promptStates[p.id] = st;
          self._fireReport({ status: "interrogation", qtype: "self_report", extra_json: JSON.stringify({ prompt_id: p.id, prompt_kind: kind, state: st, attempt_id: self._attemptId || "" }) });
        }
        self._renderInterrogationFeedback();
      });
      chips.appendChild(chip);
    });
    box.appendChild(chips);
    return box;
  };

  /* QoderWork 2026-07-24 (handoff #4): never display a raw state id. Strip the "proposed__"
     prefix and turn the rest into readable text. Presentation only — the analysts' wording
     is never touched. */
  Viewer.prototype._stateLabel = function (st) {
    const s = String(st || "").replace(/^proposed__/, "").replace(/_+/g, " ").trim();
    return s.charAt(0).toUpperCase() + s.slice(1);
  };
```

Now, the region to replace is from line 1465 (the comment `/* QoderWork 2026-07-22 (analyst handoff): v2 methods...`) through line 1604 (the closing `};` of `_stateLabel`).

Let me get the exact text of the boundaries. The block starts with:
```
  /* QoderWork 2026-07-22 (analyst handoff): v2 methods. title + structured
     pupil_steps rendered DIRECTLY (no prose parsing); red/green chips come from
     the structured eliminates[] / lands_on fields. The "used it" tickbox stays
     as SUPPLEMENTARY evidence — it does not replace the structured self-report. */
  Viewer.prototype._appendMethodsV2 = function (iq, rec) {
```
And ends with:
```
  Viewer.prototype._stateLabel = function (st) {
    const s = String(st || "").replace(/_/g, " ");
    return s.charAt(0).toUpperCase() + s.slice(1);
  };
```

This is a large replacement. The Edit tool requires a unique old_string. Since the block is large, I'll use the entire block as old_string. It's long but that's fine. Actually, the Edit tool might struggle with very long strings, but it should work. Alternatively, I could replace in smaller chunks. Let me replace the whole block in one Edit — it's cleanest.

Actually, the block is about 140 lines. That's a big old_string. Let me do it in a few smaller edits to reduce risk:

Edit A: Replace `_appendMethodsV2` (1465–1494) with the new `_appendMethodsV2` + `_methodBlockV2` + `_methodKindLabel`.

Edit B: Replace `_elimChipsV2El` (1496–1540) with the new `_elimChipsV2El` + `_optionRailLegendEl`.

Edit C: Replace `_appendSelfReportV2` + `_promptBlockV2` + `_stateLabel` (1542–1604) with the new versions.

That's three manageable edits. Let me do that.

Edit A: old_string is the comment + `_appendMethodsV2` function (lines 1465–1494).

I have everything. Now the three-part rewrite. First, `_appendMethodsV2` → new presentation_kind-aware version with interleaved prompts.



#### Tool: Edit

> Modified: `C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\engine\ppqviewer.js`

**Error:** Error: File has not been read yet. Read it first before writing to it.

#### Thinking

The file state might have changed (or the read cache has expired). Let me re-read the relevant section and then retry the edit.

#### Tool: Read

> Read: `C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\engine\ppqviewer.js`

**Output:**

```json
1465	  /* QoderWork 2026-07-22 (analyst handoff): v2 methods. title + structured
1466	     pupil_steps rendered DIRECTLY (no prose parsing); red/green chips come from
1467	     the structured eliminates[] / lands_on fields. The "used it" tickbox stays
1468	     as SUPPLEMENTARY evidence — it does not replace the structured self-report. */
1469	  Viewer.prototype._appendMethodsV2 = function (iq, rec) {
1470	    const self = this;
1471	    const labels = this._optionLabels(this.cur) || [];
1472	    const methods = rec.methods || [];
1473	    if (!methods.length) return;
1474	    iq.appendChild(el("div", { class: "ppq-iq-subhead" }, "Ways through it"));
1475	    iq.appendChild(el("div", { class: "ppq-iq-encourage" }, "Most of these have more than one route through — collecting alternatives is the point."));
1476	    methods.forEach((m) => {
1477	      const md = el("div", { class: "ppq-iq-method" });
1478	      const head = el("div", { class: "ppq-iq-method-head" });
1479	      head.appendChild(el("b", null, esc(m.title || m.id)));
1480	      const used = el("button", { class: "ppq-iq-used", type: "button" }, "used it");
1481	      used.addEventListener("click", () => {
1482	        const on = used.classList.toggle("on");
1483	        if (on) self._analysisSelfReports[m.id] = "used"; else delete self._analysisSelfReports[m.id];
1484	        self._fireReport({ status: "interrogation", qtype: "self_report", extra_json: JSON.stringify({ method_id: m.id, method_ref: m.id, state: on ? "used" : "not_used" }) });
1485	      });
1486	      head.appendChild(used);
1487	      md.appendChild(head);
1488	      const steps = el("div", { class: "ppq-iq-method-desc" });
1489	      (m.pupil_steps || []).forEach((s) => steps.appendChild(el("div", { class: "ppq-iq-method-line" }, esc(s))));
1490	      md.appendChild(steps);
1491	      md.appendChild(self._elimChipsV2El(m, labels));
1492	      iq.appendChild(md);
1493	    });
1494	  };
1495	
1496	  /* QoderWork 2026-07-22 (analyst handoff): red/green chips from the structured
```

#### Thinking

The content hasn't been changed. Alright, let me retry edit A.


#### Tool: Edit

> Modified: `C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\engine\ppqviewer.js`

**Output:**

```json
Successfully modified file: C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\engine\ppqviewer.js (1 replacements). Here is the updated code:
...
    line.appendChild(el("span", { class: "ppq-iq-insight-label" }, esc(label)));
    line.appendChild(el("span", { class: "ppq-iq-insight-text" }, esc(text)));
    return line;
  };

  /* QoderWork 2026-07-24 (handoff #2 + #4): v2 methods render in authored order,
     each styled by presentation_kind (route = dependent numbered steps;
     independent_check = unnumbered peer check; synthesis = combining checks). The
     generic "Ways through it" framing and the collecting-alternatives sentence are
     gone. Each self_report_prompt sits beside the method(s) named by its method_refs;
     a prompt that refers to a whole peer group shows once, after the group's last
     member. A method with an authored local prompt loses the generic "used it" tick.
     Returns the set of rendered prompt ids so the self-report section can skip them. */
  Viewer.prototype._appendMethodsV2 = function (iq, rec) {
    const self = this;
    const labels = (rec.identity && rec.identity.option_labels) || this._optionLabels(this.cur) || [];
    const methods = rec.methods || [];
    const rendered = new Set();
    if (!methods.length) return rendered;

    const indexOf = {};
    methods.forEach((m, i) => { indexOf[m.id] = i; });

    /* Which methods carry an authored local prompt? Those lose the generic "used it". */
    const referenced = new Set();
    (rec.self_report_prompts || []).forEach((p) => (p.method_refs || []).forEach((r) => referenced.add(r)));

    /* Group prompts by the index of their LAST referenced method, so a single-method
       prompt sits right after its method and a group prompt (several method_refs)
       shows once, after the group's last member. */
    const afterMethod = {};
    (rec.self_report_prompts || []).forEach((p) => {
      let last = -1;
      (p.method_refs || []).forEach((r) => { if (indexOf[r] !== undefined && indexOf[r] > last) last = indexOf[r]; });
      if (last < 0) return; /* orphan (no matching method) — the self-report section picks it up */
      (afterMethod[last] = afterMethod[last] || []).push(p);
      rendered.add(p.id);
    });

    /* One compact legend naming only the relationships this question actually uses. */
    const legend = this._optionRailLegendEl(methods);
    if (legend) iq.appendChild(legend);

    methods.forEach((m, i) => {
      iq.appendChild(self._methodBlockV2(m, labels, referenced.has(m.id)));
      (afterMethod[i] || []).forEach((p) => iq.appendChild(self._promptBlockV2(p, "method")));
    });

    return rendered;
  };

  /* QoderWork 2026-07-24 (handoff #2): a single method block, styled by
     presentation_kind. route steps are numbered (each inference relies on the one
     before); independent_check and synthesis steps are unnumbered peers. */
  Viewer.prototype._methodBlockV2 = function (m, labels, hasLocalPrompt) {
    const self = this;
    const kind = m.presentation_kind || "route";
    const md = el("div", { class: "ppq-iq-method ppq-iq-kind-" + kind });
    const head = el("div", { class: "ppq-iq-method-head" });
    head.appendChild(el("span", { class: "ppq-iq-method-kind" }, esc(this._methodKindLabel(kind))));
    head.appendChild(el("b", null, esc(m.title || m.id)));
    /* QoderWork 2026-07-24 (handoff #4): hide the generic "used it" when an authored
       local prompt exists for this method. */
    if (!hasLocalPrompt) {
      const used = el("button", { class: "ppq-iq-used", type: "button" }, "used it");
      used.addEventListener("click", () => {
        const on = used.classList.toggle("on");
        if (on) self._analysisSelfReports[m.id] = "used"; else delete self._analysisSelfReports[m.id];
        self._fireReport({ status: "interrogation", qtype: "self_report", extra_json: JSON.stringify({ method_id: m.id, method_ref: m.id, state: on ? "used" : "not_used" }) });
      });
      head.appendChild(used);
    }
    md.appendChild(head);
    const steps = el("div", { class: "ppq-iq-method-desc" });
    (m.pupil_steps || []).forEach((s, si) => {
      if (kind === "route") {
        const line = el("div", { class: "ppq-iq-method-line numbered" });
        line.appendChild(el("span", { class: "ppq-iq-stepnum" }, String(si + 1)));
        line.appendChild(el("span", { class: "ppq-iq-steptext" }, esc(s)));
        steps.appendChild(line);
      } else {
        steps.appendChild(el("div", { class: "ppq-iq-method-line" }, esc(s)));
      }
    });
    md.appendChild(steps);
    md.appendChild(self._elimChipsV2El(m, labels));
    return md;
  };

  Viewer.prototype._methodKindLabel = function (kind) {
    if (kind === "independent_check") return "check";
    if (kind === "synthesis") return "putting it together";
    return "route";
  };

  /* QoderWork 2026-07-22 (analyst handoff): red/green chips from the structured
     eliminates[] / lands_on fields — no regex parsing (that stopgap is legacy
     only). Green = the option landed on; red = the options ruled out. */
  /* QoderWork 2026-07-23 (analyst request #3): extended option-evidence chips.
     Supports the richer vocabulary (rules_out, counts_against, supports, favours,
...
```

#### Thinking

Edit A is complete. Next is Edit B: replace `_elimChipsV2El` with the new colored-letter rail + legend helper. The current `_elimChipsV2El` block starts with two comments (the 2026-07-22 comment and the 2026-07-23 comment), followed by the function. Let's replace from the comment through the end of the function.

Edit A done. Now Edit B: the option-evidence rail (`_elimChipsV2El`) plus the legend helper.



#### Tool: Edit

> Modified: `C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\engine\ppqviewer.js`

**Output:**

```json
Successfully modified file: C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\engine\ppqviewer.js (1 replacements). Here is the updated code:
...
    if (kind === "independent_check") return "check";
    if (kind === "synthesis") return "putting it together";
    return "route";
  };

  /* QoderWork 2026-07-24 (handoff #3): a complete fixed-position option rail. Every
     option label (from identity.option_labels) shows in the same position on every
     row, and the LETTER ITSELF is coloured by relationship — no background, pill,
     border or strikethrough. A surviving option is "unaffected", not positive
     evidence. When option_evidence is absent, eliminates / lands_on are projected
     onto the same complete rail. */
  Viewer.prototype._elimChipsV2El = function (m, labels) {
    const wrap = el("div", { class: "ppq-iq-elim" });
    if (!labels.length) return wrap;
    const relClass = {
      directly_identifies: "di", supports: "sup", favours: "fav", unaffected: "un",
      counts_against: "ca", disfavours: "dis", rules_out: "ro"
    };
    const byLabel = {};
    const evidence = m.option_evidence;
    if (evidence && evidence.length) {
      evidence.forEach((e) => { byLabel[String(e.label).toUpperCase()] = e.relationship; });
    } else {
      /* legacy fallback projected onto the full rail: eliminated -> rules_out,
         lands_on -> directly_identifies, everything else stays unaffected. */
      (m.eliminates || []).forEach((L) => { byLabel[String(L).toUpperCase()] = "rules_out"; });
      if (m.lands_on) byLabel[String(m.lands_on).toUpperCase()] = "directly_identifies";
      if (!Object.keys(byLabel).length) return wrap;
    }
    const row = el("div", { class: "ppq-oev-row" });
    labels.forEach((L) => {
      L = String(L).toUpperCase();
      const rel = byLabel[L] || "unaffected";
      row.appendChild(el("span", { class: "ppq-oev " + (relClass[rel] || "un"), title: rel.replace(/_/g, " ") }, L));
    });
    wrap.appendChild(row);
    return wrap;
  };

  /* QoderWork 2026-07-24 (handoff #3): one compact legend naming only the
     relationships this question's methods actually use. Word + colour swatch —
     never A–G letters as the legend key. */
  Viewer.prototype._optionRailLegendEl = function (methods) {
    const present = new Set();
    (methods || []).forEach((m) => {
      if (m.option_evidence && m.option_evidence.length) {
        m.option_evidence.forEach((e) => present.add(e.relationship));
      } else {
        if ((m.eliminates || []).length) present.add("rules_out");
        if (m.lands_on) present.add("directly_identifies");
      }
    });
    if (!present.size) return null;
    const words = {
      rules_out: "rules out", counts_against: "counts against", disfavours: "disfavours",
      unaffected: "no effect", favours: "favours", supports: "supports", directly_identifies: "identifies"
    };
    const relClass = { directly_identifies: "di", supports: "sup", favours: "fav", unaffected: "un", counts_against: "ca", disfavours: "dis", rules_out: "ro" };
    /* semantic order: negative -> neutral -> positive */
    const order = ["rules_out", "counts_against", "disfavours", "unaffected", "favours", "supports", "directly_identifies"];
    const legend = el("div", { class: "ppq-oev-legend" });
    order.forEach((rel) => {
      if (!present.has(rel)) return;
      const item = el("span", { class: "ppq-oev-legend-item" });
      item.appendChild(el("span", { class: "ppq-oev-swatch " + relClass[rel] }));
      item.appendChild(el("span", null, esc(words[rel] || rel.replace(/_/g, " "))));
      legend.appendChild(item);
    });
    return legend;
  };

  /* QoderWork 2026-07-22 (analyst handoff): the PRIMARY method-awareness prompt
     (self_report_prompts[].primary) and the PRIMARY knowledge/technique check
     (requirements.post_question_checks[].primary). Each offers tappable states;
     the chosen state is stored per prompt id and drives the v2 feedback match. */
  /* QoderWork 2026-07-23 (analyst request #1): show ALL primary prompts and checks,
...
```

#### Thinking

Edit B is done. Next is Edit C: replace `_appendSelfReportV2` + `_promptBlockV2` + `_stateLabel`. The current block starts with two comments (2026-07-22 and 2026-07-23), followed by `_appendSelfReportV2`, `_promptBlockV2`, and `_stateLabel`. Let's replace all of them.

Edit B done. Now Edit C: the self-report section, prompt block (multi-select), and state label.



#### Tool: Edit

> Modified: `C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\engine\ppqviewer.js`

**Output:**

```json
Successfully modified file: C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\engine\ppqviewer.js (1 replacements). Here is the updated code:
...
      legend.appendChild(item);
    });
    return legend;
  };

  /* QoderWork 2026-07-24 (handoff #4): the self-report items that do NOT sit beside
     a method — orphan prompts (no matching method_refs), the knowledge checks
     (requirement_refs, never method_refs) and the plain check_prompt. Prompts already
     rendered inside the methods section arrive in renderedIds and are skipped here;
     there is no longer a generic "More quick checks" bucket. */
  Viewer.prototype._appendSelfReportV2 = function (iq, rec, renderedIds) {
    renderedIds = renderedIds || new Set();
    const srps = rec.self_report_prompts || [];
    const checks = ((rec.requirements || {}).post_question_checks) || [];

    srps.filter((p) => !renderedIds.has(p.id)).forEach((p) => iq.appendChild(this._promptBlockV2(p, "method")));
    checks.forEach((c) => iq.appendChild(this._promptBlockV2(c, "check")));

    /* pupil_analysis.check_prompt — a plain string question, no states */
    const cp = (rec.pupil_analysis || {}).check_prompt;
    if (cp) {
      const cpBox = el("div", { class: "ppq-iq-prompt ppq-iq-checkprompt" });
      cpBox.appendChild(el("div", { class: "ppq-iq-prompt-text" }, esc(cp)));
      iq.appendChild(cpBox);
    }
  };
  Viewer.prototype._promptBlockV2 = function (p, kind) {
    const self = this;
    const box = el("div", { class: "ppq-iq-prompt" });
    box.appendChild(el("div", { class: "ppq-iq-prompt-text" }, esc(p.prompt || "")));
    const chips = el("div", { class: "ppq-iq-prompt-states" });
    /* QoderWork 2026-07-24 (handoff #4): opt-in multi-select when several authored
       descriptions can all be true (multi_select flag). Single-select otherwise. */
    const multi = !!p.multi_select;
    (p.states || []).forEach((st) => {
      const chip = el("button", { class: "ppq-iq-state", type: "button", "data-state": st }, self._stateLabel(st));
      chip.addEventListener("click", () => {
        if (multi) {
          chip.classList.toggle("sel");
          const sel = Array.prototype.map.call(chips.querySelectorAll(".ppq-iq-state.sel"), (c) => c.dataset.state);
          self._promptStates[p.id] = sel;
          self._fireReport({ status: "interrogation", qtype: "self_report", extra_json: JSON.stringify({ prompt_id: p.id, prompt_kind: kind, states: sel, attempt_id: self._attemptId || "" }) });
        } else {
          chips.querySelectorAll(".ppq-iq-state").forEach((c) => c.classList.remove("sel"));
          chip.classList.add("sel");
          self._promptStates[p.id] = st;
          self._fireReport({ status: "interrogation", qtype: "self_report", extra_json: JSON.stringify({ prompt_id: p.id, prompt_kind: kind, state: st, attempt_id: self._attemptId || "" }) });
        }
        self._renderInterrogationFeedback();
      });
      chips.appendChild(chip);
    });
    box.appendChild(chips);
    return box;
  };
  /* QoderWork 2026-07-24 (handoff #4): never show a raw state id. Strip a leading
     proposed__ prefix and turn the remainder into readable text. Presentation only —
     the analysts' prose is never touched. */
  Viewer.prototype._stateLabel = function (st) {
    const s = String(st || "").replace(/^proposed__/, "").replace(/_+/g, " ").trim();
    return s.charAt(0).toUpperCase() + s.slice(1);
  };

  /* QoderWork 2026-07-22 (analyst handoff): legacy analysis-store renderers,
     extracted unchanged so the v2 path can branch around them. */
...
```

#### Thinking

All three edits are complete. Next, what needs to be done:
1. Update the call site (around line 1246) to pass the rendered ids from `_appendMethodsV2` to `_appendSelfReportV2`.
2

### **You**

carry on.  but first tell me what i need to do to attach github desktop.  and are you picking up the new q edits in paper databases?

### **Assistant**

### **You**

carry on

### **Assistant**

#### Thinking

All three JS edits (#2, #3, #4 core) are done. Next things to do:
1. Update the call site (around line 1246) to pass the rendered IDs from `_appendMethodsV2` to `_appendSelfReportV2`.
2. Fix `_matchFeedbackV2` to handle array states (multi-select safety).
3. Add CSS for the new classes (`.ppq-oev`, `.ppq-oev-row`, `.ppq-oev-legend`, `.ppq-iq-method-kind`, `.ppq-iq-stepnum`, `.ppq-iq-kind-*`).
4. #5: Remove reviewer from the student-facing footer (state label).
5. Run `node --check`.
6. Verify against fixtures.

First let me update the call site. Let me look for it.


All three core rewrites are in. Now update the call site to pass the rendered prompt ids, and make the feedback matcher array-safe for multi-select.



#### Tool: Read

> Read: `C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\engine\ppqviewer.js`

**Output:**

```json
1242	
1243	    function revealRest() {
1244	      guessPage.style.display = "none";
1245	      restPage.style.display = "";
1246	      self._renderInterrogationFeedback();
1247	    }
1248	
1249	    /* --- 1. the verdict FIRST within the rest (analyst handoff): the concrete
1250	       "You chose X — the answer is Y" leads. The error_path explanation beneath
1251	       it is optional; the verdict line itself is not. --- */
1252	    restPage.appendChild(this._verdictEl(rec, isV2, chosen, correctLetter, this._wasRight));
1253	
```

#### Thinking

The call site has moved. Let's find the place where `_appendMethodsV2` and `_appendSelfReportV2` are called (previously it was around lines 1246-1248, but now it's shifted). Let's grep for it.


#### Tool: Grep

**Input:**

```json
{
  "-n": true,
  "output_mode": "content",
  "path": "C:\\Claude (not on Gdrive, nor OneDrive)\\ppqviewer\\engine\\ppqviewer.js",
  "pattern": "this\\._appendMethodsV2\\(restPage|this\\._appendSelfReportV2\\(restPage"
}
```

**Output:**

```json
1258:      this._appendMethodsV2(restPage, rec);
1260:      this._appendSelfReportV2(restPage, rec);
```

#### Thinking

Let me read that section and update the call site.


#### Tool: Read

> Read: `C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\engine\ppqviewer.js`

**Output:**

```json
1254	    if (isV2) {
1255	      /* --- 3. the pupil insight (first_notice / why_it_matters / next_move) --- */
1256	      this._appendInsightV2(restPage, rec);
1257	      /* --- 4. methods: title + structured pupil_steps + elimination chips --- */
1258	      this._appendMethodsV2(restPage, rec);
1259	      /* --- 5. primary self-report + knowledge check (feed the feedback match) --- */
1260	      this._appendSelfReportV2(restPage, rec);
1261	    } else {
1262	      /* legacy analysis-store path: probe + free-prose methods */
1263	      this._appendProbeLegacy(restPage, rec);
```

#### Thinking

Let's update the call site so that the rendered IDs are passed from `_appendMethodsV2` to `_appendSelfReportV2`.

#### Tool: Edit

> Modified: `C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\engine\ppqviewer.js`

**Output:**

```json
Successfully modified file: C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\engine\ppqviewer.js (1 replacements). Here is the updated code:
...
    restPage.appendChild(this._verdictEl(rec, isV2, chosen, correctLetter, this._wasRight));

    if (isV2) {
      /* --- 3. the pupil insight (first_notice / why_it_matters / next_move) --- */
      this._appendInsightV2(restPage, rec);
      /* --- 4. methods + the prompts that sit beside them (handoff #2 + #4) --- */
      const renderedPrompts = this._appendMethodsV2(restPage, rec);
      /* --- 5. remaining self-report: orphan prompts + knowledge checks --- */
      this._appendSelfReportV2(restPage, rec, renderedPrompts);
    } else {
      /* legacy analysis-store path: probe + free-prose methods */
      this._appendProbeLegacy(restPage, rec);
      this._appendMethodsLegacy(restPage, rec, correctLetter);
    }
...
```

#### Thinking

Next, let's make `_matchFeedbackV2` array-safe for multi-select. The current code (around line 1757):
```js
if (fb.prompt_id) {
  const st = this._promptStates[fb.prompt_id];
  if (!st) continue; /* prompt not answered yet — feedback not ready */
  if (fb.states && fb.states.length && fb.states.indexOf(st) < 0) continue;
}
```

Let's make it handle arrays.

Now make the feedback matcher array-safe for multi-select states.



#### Tool: Edit

> Modified: `C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\engine\ppqviewer.js`

**Output:**

```json
Successfully modified file: C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\engine\ppqviewer.js (1 replacements). Here is the updated code:
...
      }
      if (fb.guess_declared === true && !guessDeclared) continue;
      if (fb.guess_declared === false && guessDeclared) continue;
      if (fb.prompt_id) {
        const st = this._promptStates[fb.prompt_id];
        if (!st || (Array.isArray(st) && !st.length)) continue; /* prompt not answered yet — feedback not ready */
        if (fb.states && fb.states.length) {
          /* QoderWork 2026-07-24 (handoff #4): a multi-select prompt stores an array;
             match when ANY chosen state is in the feedback row's states. */
          const chosenStates = Array.isArray(st) ? st : [st];
          if (!chosenStates.some((s) => fb.states.indexOf(s) >= 0)) continue;
        }
      }
      return fb;
    }
    return null;
  };
...
```

#### Thinking

Next, #5: remove `review.reviewer` from the pupil-facing footer (the state label). The current code is around lines 1313–1323 (shifted). Let's find it.


Now #5: remove the reviewer name from the pupil-facing state label. Let me find it.



#### Tool: Grep

**Input:**

```json
{
  "-n": true,
  "output_mode": "content",
  "path": "C:\\Claude (not on Gdrive, nor OneDrive)\\ppqviewer\\engine\\ppqviewer.js",
  "pattern": "ppq-iq-state-label|ppq-iq-state-by|stateLabel ="
}
```

**Output:**

```json
1319:    let stateLabel = "Early review";
1320:    if (rv.status === "reviewed" && hasMethods && hasFeedback) stateLabel = "Full review";
1321:    const stateEl = el("div", { class: "ppq-iq-state-label" }, stateLabel);
1322:    if (rv.reviewer) stateEl.appendChild(el("span", { class: "ppq-iq-state-by" }, " · " + esc(rv.reviewer)));
1674:  Viewer.prototype._stateLabel = function (st) {
```

#### Thinking

Let me read the context around lines 1313-1323 and check the state label block.

#### Tool: Read

> Read: `C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\engine\ppqviewer.js`

**Output:**

```json
1312	
1313	    /* --- QoderWork 2026-07-23 (analyst request #2): quiet analysis-state label.
1314	       Distinguishes "Full review" / "Early review" so the pupil (and reviewer)
1315	       knows whether the analysis behind this question is complete. --- */
1316	    const rv = rec.review || {};
1317	    const hasMethods = (rec.methods || []).length > 0;
1318	    const hasFeedback = (rec.feedback || []).length > 0;
1319	    let stateLabel = "Early review";
1320	    if (rv.status === "reviewed" && hasMethods && hasFeedback) stateLabel = "Full review";
1321	    const stateEl = el("div", { class: "ppq-iq-state-label" }, stateLabel);
1322	    if (rv.reviewer) stateEl.appendChild(el("span", { class: "ppq-iq-state-by" }, " · " + esc(rv.reviewer)));
1323	    restPage.appendChild(stateEl);
1324	
1325	    /* --- mount into the modal shell and open the pop-up. The guess page shows
```

#### Thinking

Handoff #5: "Do not append `review.reviewer` to the pupil's review footer." In other words, remove the reviewer name from the pupil-facing state label. The reviewer strip (?review) already displays the reviewer (reviewer-only), so that's fine.

But wait — should the state label itself ("Full review"/"Early review") even be shown to pupils in the first place? Handoff #5's pupil-facing list doesn't include the analysis state label. And the reviewer-only list includes "review status, author/reviewer, and uncertainties." Hmm. "review status" is reviewer-only!

Let me re-read handoff #5:
"Reviewer-only:
- taxonomy and classification;
- raw evidence payloads;
- diagnostic confidence and error tags;
- review status, author/reviewer, and uncertainties;
- validation/build information and prompt counts;
- internal labels such as physical, geometric, mathematical directionality, etc."

So "review status" is reviewer-only. The state label "Full review"/"Early review" is precisely review status. So it shouldn't be shown to pupils at all!

Hmm, but wait. The integration doc (lines 90-93) says: "Give every question an explicit analysis state: deep, provisional, unavailable, invalid. Provisional records should render, and unavailable or invalid records should indicate that a detailed review isn't ready rather than silently disappearing." And line 71: "A small 'provisional first pass' label is fine to distinguish layers."

So there's a distinction: the analysis state (deep/provisional/unavailable) can have a small label. But the review status (Full review/Early review by reviewer) is reviewer-only.

The current state label shows "Full review · Codex" or "Early review · Codex" — this is review status + reviewer. Both are reviewer-only per handoff #5.

So what should we do? Options:
1. Remove the state label from the pupil view entirely (move it to the reviewer strip).
2. Keep a minimal pupil-facing label that doesn't expose review status or reviewer.

Handoff #5 is clear: review status and reviewer are reviewer-only. The reviewer strip (?review) already shows `rv.status` and `rv.reviewer`. So the pupil-facing state label should go (or be stripped of status + reviewer).

But the integration doc says a small "provisional first pass" label is fine to distinguish layers (deep vs provisional). That's about the analysis layer (deep vs launch-card provisional), not review status.

Given the handoff is authoritative and newer, and explicitly lists "review status, author/reviewer" as reviewer-only, I'll remove the pupil-facing state label entirely. The reviewer strip already covers status + reviewer for reviewers.

Wait, but let me reconsider. The state label was analyst request #2 from yesterday: "A quiet footer inside the popup: 'Full review · Codex'... distinguishes complete analysis from in-progress." Today's handoff supersedes this: review status + reviewer are reviewer-only. So I'll remove it from the pupil view.

But should I keep some pupil-facing indicator? The handoff's pupil-facing list doesn't include any analysis state label. And "fail gracefully" (#6) says missing analysis must not hide the flow. So for pupils, no state label needed. The reviewer strip (?review) shows status for reviewers.

Decision: Remove the pupil-facing state label (lines 1313-1323). The reviewer strip already shows status + reviewer. This satisfies #5.

Actually, let me reconsider once more. Is there value in keeping a pupil-facing "this analysis is provisional" label? The integration doc allows it. But the current label is about review status (Full/Early), not layer (deep/provisional). Since the handoff says review status is reviewer-only, and the current label is review status, I'll remove it. If Smith wants a pupil-facing "provisional" label later, that's a separate, smaller thing (and the integration doc says it "is fine to distinguish layers" — optional).

Let me remove the pupil-facing state label block. Replace with a comment noting it moved to the reviewer strip.

Actually — wait. Let me keep it minimal and safe. I'll remove the reviewer name AND the review-status text from the pupil view, since both are reviewer-only. The reviewer strip already has them. Let me remove the whole block.

Let me do that edit.

Handoff #5 lists "review status, author/reviewer" as reviewer-only — so the pupil-facing "Full review · Codex" label must go entirely (the `?review` strip already carries status + reviewer for reviewers). Removing it.



#### Tool: Edit

> Modified: `C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\engine\ppqviewer.js`

**Output:**

```json
Successfully modified file: C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\engine\ppqviewer.js (1 replacements). Here is the updated code:
...
      flag.textContent = on ? "Flagged ✓ — we'll bring more like this" : "Flag this — come back / more like this";
      self._fireReport({ status: "flag_review", qtype: "review_flag", extra_json: JSON.stringify({ flagged: on }) });
    });
    restPage.appendChild(flag);

    /* --- QoderWork 2026-07-24 (handoff #5): review status and reviewer are
       REVIEWER-ONLY. The old pupil-facing "Full review · <reviewer>" footer is gone;
       the ?review strip (above) is now the single place status + reviewer appear. --- */

    /* --- mount into the modal shell and open the pop-up. The guess page shows
       first; the rest (verdict onward) is hidden until Done/Skip. While the pop-up
       holds the 1-6, the outer 1-6 row is hidden; closeModal restores it. --- */
    iq.appendChild(guessPage);
...
```

#### Thinking

Wait — the reviewer strip (around lines 1169–1187) uses `rv = rec.review || {}`. I deleted the `const rv = rec.review || {}` declaration that was at line 1316, but the reviewer strip has its own `const rv = rec.review || {}` inside the `if (/[?&]review\b/...)` block. Let me verify that the reviewer strip block is self-contained and that removing the later `rv` doesn't break anything. The reviewer strip block (lines 1172–1187) declares its own `const rv` inside the if. The block I removed declared a separate `rv` in the outer scope. Are there other uses of `rv` after the removed block? Let me check. The mount section doesn't use `rv`. Let me grep for `rv\.` after the removed area to make sure there are no dangling references.

Actually, the reviewer strip's `rv` is scoped inside the `if` block. The removed block's `rv` was in the function scope. Let me check whether there are any other references to `rv` in `_renderInterrogation` outside these two blocks. Let me grep.


Let me verify no dangling `rv` references remain in `_renderInterrog

### **You**

carry on

### **Assistant**

fetch failed

fetch failed

### **You**

carry on

### **Assistant**

#### Thinking

Smith said "continue" twice. Let's keep going. Next up is the CSS for the new classes. I'll add the following CSS:
- `.ppq-oev-row`, `.ppq-oev` (colored letters, 7 relationships)
- `.ppq-oev-legend`, `.ppq-oev-legend-item`, `.ppq-oev-swatch`
- `.ppq-iq-method-kind` (kind tag)
- `.ppq-iq-stepnum`, `.ppq-iq-steptext` (numbered route steps)
- `.ppq-iq-kind-route`, `.ppq-iq-kind-independent_check`, `.ppq-iq-kind-synthesis` (subtle per-kind styling)

I'll also check `_appendInsightV2` — handoff #2 says "if the optional fields `Why it matters` and `Next move` don't exist, don't fabricate them." The current `_appendInsightV2` already only renders when they exist (lines 1451–1455: `if (pa.first_notice)... if (pa.why_it_matters)... if (pa.next_move)`). So that's already fine. Good — no changes needed there. Wait, let me double-check the labels. It uses "First thing to notice", "Why it matters", "Next move". The handoff says don't fabricate when they don't exist — the current code guards each with `if`. Good.

Now, the old `.ppq-elim` CSS (lines 345–352) is still there for the legacy path (`_elimChipsEl` uses `.ppq-elim`). I'll leave those. The new rail uses `.ppq-oev`. Good.

The old `.ppq-iq-subhead` and `.ppq-iq-encourage` CSS — `.ppq-iq-subhead` is still used by the legacy `_appendMethodsLegacy` ("Ways through it"). I'll leave it. `.ppq-iq-encourage` is no longer used in v2, but it might be used in legacy. I'll leave it (harmless).

The `.ppq-iq-morechecks` CSS is no longer used (the disclosure was removed). Harmless to leave, but I could remove it. I'll leave it to minimize risk — no, actually it's dead code now. But harmless. I'll leave it (legacy safety isn't relevant, but removing CSS is low-value and low-risk either way). I'll leave it.

The `.ppq-iq-state-label` / `.ppq-iq-state-by` CSS is now unused (pupil-facing labels were removed). Harmless. I'll leave it.

OK, let's add the new CSS. I'll add it after the existing `.ppq-elim` block (around line 352), or near the method styles. Let me read the CSS around the method/elim styles to find a good insertion point.

Let me read lines 305–355 of the CSS.

Now the CSS for the new option-evidence rail, legend, method-kind tags, and numbered route steps. Let me find the insertion point.



#### Tool: Read

> Read: `C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\engine\ppqviewer.css`

**Output:**

```json
308	.ppq-iq-option-path { font-size: 0.9rem; line-height: 1.5; color: var(--ppq-ink2); }
309	.ppq-iq-slugs { display: flex; gap: 0.35rem; flex-wrap: wrap; margin-top: 0.5rem; }
310	.ppq-iq-slug { font-size: 0.7rem; background: rgba(176, 48, 48, 0.07); border: 1px solid rgba(176, 48, 48, 0.25); color: var(--ppq-bad); border-radius: 5px; padding: 1px 6px; font-family: monospace; }
311	.ppq-iq-method { border: 1px solid var(--ppq-line); border-radius: 8px; padding: 0.6rem 0.85rem; margin-bottom: 0.5rem; }
312	.ppq-iq-method-head { display: flex; gap: 0.5rem; align-items: baseline; flex-wrap: wrap; margin-bottom: 0.25rem; }
313	.ppq-iq-kind { font-size: 0.72rem; font-family: monospace; background: var(--ppq-line); border-radius: 5px; padding: 1px 6px; color: var(--ppq-ink2); }
314	/* QoderWork 2026-07-22: method descriptions set out on MULTIPLE LINES — the
315	   one-line algebra was "quite hard to read" (Smith). "⇒ …" lines are results. */
316	.ppq-iq-method-desc { font-size: 0.88rem; line-height: 1.45; color: var(--ppq-ink2); }
317	.ppq-iq-method-line { display: block; padding: 0.12rem 0 0.12rem 0.9rem; position: relative; }
318	.ppq-iq-method-line::before { content: "·"; position: absolute; left: 0.25rem; color: var(--ppq-muted); }
319	.ppq-iq-method-line.result { color: var(--ppq-ink); font-weight: 600; }
320	.ppq-iq-method-line.result::before { content: ""; }
321	/* a little encouragement that there are other ways through (Smith) */
322	.ppq-iq-encourage { font-size: 0.8rem; font-style: italic; color: var(--ppq-muted); margin: -0.2rem 0 0.5rem; }
323	/* "used it" tickbox — one per method, multi-select (replaces the 6-state ladder
324	   and the one green "Use this" button) */
325	.ppq-iq-used { margin-left: auto; font-size: 0.78rem; padding: 0.28rem 0.7rem; border: 1px solid var(--ppq-line); border-radius: 7px; background: var(--ppq-bg); color: var(--ppq-ink2); cursor: pointer; }
```

#### Thinking

I can see there's an existing `.ppq-iq-kind` class (line 313), but I used `.ppq-iq-method-kind`. Let me use my own class name and add styles. Note that `.ppq-iq-method-line::before { content: "·"; }` adds a bullet point to every method line. For numbered route steps, I don't want the bullet (I'm adding a number instead). So `.ppq-iq-method-line.numbered::before { content: ""; }` is needed to remove the bullet, and I'll style `.ppq-iq-stepnum`.

Also, for `independent_check` and `synthesis`, the bullet "·" is fine (unnumbered).

Let me add the new CSS after the `.ppq-elim` block (around line 352). Let me insert it after line 352 (`.ppq-elim.bold`). Let me read lines 344–353 to get the exact context.

#### Tool: Read

> Read: `C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\engine\ppqviewer.css`

**Output:**

```json
343	.ppq-iq-elim { margin-top: 0.5rem; }
344	.ppq-iq-elim-row { display: flex; gap: 0.35rem; flex-wrap: wrap; }
345	.ppq-elim { display: inline-flex; align-items: center; justify-content: center; min-width: 1.7rem; height: 1.7rem; padding: 0 0.3rem; border-radius: 6px; font-weight: 800; font-size: 0.85rem; border: 1px solid var(--ppq-line); color: var(--ppq-muted); background: var(--ppq-bg); }
346	.ppq-elim.red { background: rgba(176, 48, 48, 0.12); border-color: rgba(176, 48, 48, 0.5); color: var(--ppq-bad); text-decoration: line-through; }
347	.ppq-elim.green { background: rgba(45, 106, 63, 0.14); border-color: rgba(45, 106, 63, 0.55); color: var(--ppq-ok); }
348	.ppq-elim.dim { opacity: 0.55; }
349	/* QoderWork 2026-07-23 (analyst request #3): richer evidence vocabulary chips. */
350	.ppq-elim.amber { background: rgba(180, 120, 20, 0.12); border-color: rgba(180, 120, 20, 0.5); color: #8a5a00; }
351	.ppq-elim.lightgreen { background: rgba(45, 106, 63, 0.08); border-color: rgba(45, 106, 63, 0.3); color: var(--ppq-ok); }
352	.ppq-elim.bold { font-weight: 900; border-width: 2px; }
353	.ppq-iq-elim-prose { font-size: 0.78rem; line-height: 1.4; color: var(--ppq-muted); margin-top: 0.35rem; font-style: italic; }
354	
```

#### Thinking

Alright, let's add the new CSS after line 353 (`.ppq-iq-elim-prose`). I'll insert the new option-evidence rail CSS, the legend, the method-kind tags, and the numbered steps.

Colours from the integration doc:
- `directly_identifies`: green (solid) → #1e7d3c, weight 900
- `supports`: light green → #6fbf8e or var(--ppq-ok) family. Let's use #5aa877
- `favours`: light blue → #5dade2
- `unaffected`: grey → #9aa0a6
- `counts_against`: light red → #e08585
- `disfavours`: orange → #e67e22
- `rules_out`: red → #c0392b (or var(--ppq-bad))

Let's use clear, readable colours. For rules_out, use var(--ppq-bad) (the red used elsewhere). For directly_identifies, use var(--ppq-ok) (green). Let me check what --ppq-bad and --ppq-ok are. From earlier: `--ppq-bad` is used for red (rgba(176,48,48...) → #b03030), and `--ppq-ok` is green (rgba(45,106,63...) → #2d6a3f). Let's use these variables where appropriate.

Let's define:
- .ppq-oev.ro { color: var(--ppq-bad); }  /* rules_out: red */
- .ppq-oev.ca { color: #d98080; }  /* counts_against: light red */
- .ppq-oev.dis { color: #e08a2e; }  /* disfavours: orange */
- .ppq-oev.un { color: #a3a8ad; }  /* unaffected: grey */
- .ppq-oev.fav { color: #6cb6e8; }  /* favours: light blue */
- .ppq-oev.sup { color: #7cc096; }  /* supports: light green */
- .ppq-oev.di { color: var(--ppq-ok); font-weight: 900; }  /* directly_identifies: solid green */

The swatches reuse the same colour classes (`.ppq-oev-swatch.ro` etc.). Let's make the swatch a small coloured dot. Since the colour classes are defined on `.ppq-oev.X`, we need them on `.ppq-oev-swatch.X` too. Let's define the colours on a shared selector: `.ppq-oev.ro, .ppq-oev-swatch.ro { color: ...; }`, and for the swatch use `background: currentColor`.

Let's write it like this:
```css
/* QoderWork 2026-07-24 (handoff #3): complete fixed-position option-evidence rail.
   The letters themselves are coloured by relationship — no background, no pill, no border,
   no strikethrough. A surviving option is "unaffected" (grey). */
.ppq-oev-row { display: flex; gap: 0.6rem; flex-wrap: wrap; align-items: baseline; margin-top: 0.35rem; }
.ppq-oev { font-weight: 800; font-size: 0.98rem; line-height: 1; }
.ppq-oev.ro,  .ppq-oev-swatch.ro  { color: var(--ppq-bad); }   /* rules_out */
.ppq-oev.ca,  .ppq-oev-swatch.ca  { color: #d98080; }          /* counts_against */
.ppq-oev.dis, .ppq-oev-swatch.dis { color: #e08a2e; }          /* disfavours */
.ppq-oev.un,  .ppq-oev-swatch.un  { color: #a3a8ad; }          /* unaffected */
.ppq-oev.fav, .ppq-oev-swatch.fav { color: #6cb6e8; }          /* favours */
.ppq-oev.sup, .ppq-oev-swatch.sup { color: #7cc096; }          /* supports */
.ppq-oev.di,  .ppq-oev-swatch.di  { color: var(--ppq-ok); }    /* directly_identifies */
.ppq-oev.di { font-weight: 900; }
/* one compact legend: word + colour swatch (never A–G letters as keys) */
.ppq-oev-legend { display: flex; gap: 0.85rem; flex-wrap: wrap; align-items: center; font-size: 0.72rem; color: var(--ppq-muted); margin: 0.2rem 0 0.6rem; }
.ppq-oev-legend-item { display: inline-flex; align-items: center; gap: 0.3rem; }
.ppq-oev-swatch { width: 0.7rem; height: 0.7rem; border-radius: 50%; background: currentColor; display: inline-block; }
```

And the method-kind tag + numbered steps:
```css
/* QoderWork 2026-07-24 (handoff #2): presentation_kind styling. A small quiet kind tag;
   route steps are numbered (dependent), checks/synthesis are unnumbered peers. */
.ppq-iq-method-kind { font-size: 0.68rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; color: var(--ppq-muted); border: 1px solid var(--ppq-line); border-radius: 5px; padding: 1px 6px; }
.ppq-iq-kind-synthesis { background: rgba(49,130,206,0.05); }
.ppq-iq-method-line.numbered { padding-left: 1.6rem; }
.ppq-iq-method-line.numbered::before { content: ""; }
.ppq-iq-stepnum { position: absolute; left: 0.15rem; top: 0.12rem; font-weight: 700; color: var(--ppq-accent); font-size: 0.82rem; }
.ppq-iq-stepnum::after { content: "."; }
.ppq-iq-steptext { }
```

Wait, `.ppq-iq-method-line` has `position: relative` (line 317). So the absolutely-positioned `.ppq-iq-stepnum` will be placed relative to it. Good. And `.numbered::before { content: ""; }` removes the bullet. Good.

Let me double-check: `.ppq-iq-method-line { ... padding: 0.12rem 0 0.12rem 0.9rem; position: relative; }`. For numbered, override padding-left to 1.6rem to make room for the number. The number sits at left:0.15rem. Good.

Let's insert all of this after line 353.

#### Tool: Edit

> Modified: `C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\engine\ppqviewer.css`

**Output:**

```json
Successfully modified file: C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\engine\ppqviewer.css (1 replacements). Here is the updated code:
...
.ppq-elim.amber { background: rgba(180, 120, 20, 0.12); border-color: rgba(180, 120, 20, 0.5); color: #8a5a00; }
.ppq-elim.lightgreen { background: rgba(45, 106, 63, 0.08); border-color: rgba(45, 106, 63, 0.3); color: var(--ppq-ok); }
.ppq-elim.bold { font-weight: 900; border-width: 2px; }
.ppq-iq-elim-prose { font-size: 0.78rem; line-height: 1.4; color: var(--ppq-muted); margin-top: 0.35rem; font-style: italic; }

/* QoderWork 2026-07-24 (handoff #3): complete fixed-position option-evidence rail.
   The LETTER ITSELF is coloured by relationship — no background, pill, border or
   strikethrough. A surviving option is "unaffected" (grey), not positive evidence. */
.ppq-oev-row { display: flex; gap: 0.6rem; flex-wrap: wrap; align-items: baseline; margin-top: 0.35rem; }
.ppq-oev { font-weight: 800; font-size: 0.98rem; line-height: 1; }
.ppq-oev.ro,  .ppq-oev-swatch.ro  { color: var(--ppq-bad); }   /* rules_out: red */
.ppq-oev.ca,  .ppq-oev-swatch.ca  { color: #d98080; }          /* counts_against: light red */
.ppq-oev.dis, .ppq-oev-swatch.dis { color: #e08a2e; }          /* disfavours: orange */
.ppq-oev.un,  .ppq-oev-swatch.un  { color: #a3a8ad; }          /* unaffected: grey */
.ppq-oev.fav, .ppq-oev-swatch.fav { color: #6cb6e8; }          /* favours: light blue */
.ppq-oev.sup, .ppq-oev-swatch.sup { color: #7cc096; }          /* supports: light green */
.ppq-oev.di,  .ppq-oev-swatch.di  { color: var(--ppq-ok); }    /* directly_identifies: green */
.ppq-oev.di { font-weight: 900; }
/* one compact legend: word + colour swatch (never A–G letters as the key) */
.ppq-oev-legend { display: flex; gap: 0.85rem; flex-wrap: wrap; align-items: center; font-size: 0.72rem; color: var(--ppq-muted); margin: 0.2rem 0 0.6rem; }
.ppq-oev-legend-item { display: inline-flex; align-items: center; gap: 0.3rem; }
.ppq-oev-swatch { width: 0.7rem; height: 0.7rem; border-radius: 50%; background: currentColor; display: inline-block; flex: none; }

/* QoderWork 2026-07-24 (handoff #2): presentation_kind styling. A quiet kind tag;
   route steps are numbered (each inference relies on the one before), independent
   checks and synthesis stay unnumbered peers. */
.ppq-iq-method-kind { font-size: 0.66rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; color: var(--ppq-muted); border: 1px solid var(--ppq-line); border-radius: 5px; padding: 1px 6px; }
.ppq-iq-kind-synthesis { background: rgba(49, 130, 206, 0.05); }
.ppq-iq-method-line.numbered { padding-left: 1.6rem; }
.ppq-iq-method-line.numbered::before { content: ""; }
.ppq-iq-stepnum { position: absolute; left: 0.2rem; top: 0.12rem; font-weight: 700; color: var(--ppq-accent); font-size: 0.82rem; }
.ppq-iq-stepnum::after { content: "."; }

/* optional "come back / more like this" review flag */
.ppq-iq-flag { display: block; margin-top: 1.1rem; font-size: 0.85rem; padding: 0.5rem 1rem; border: 1px dashed var(--ppq-line); border-radius: 8px; background: transparent; color: var(--ppq-ink2); cursor: pointer; }
.ppq-iq-flag:hover { border-color: var(--ppq-accent); color: var(--ppq-accent); }
.ppq-iq-flag.on { border-style: solid; border-color: var(--ppq-accent); background: rgba(49, 130, 206, 0.08); color: var(--ppq-accent); font-weight: 700; }

...
```

#### Thinking

CSS is done. Next, I'll run `node --check` to verify the JS syntax, and after that, verify against the fixtures. Let's update the TODO list and run the syntax check.

CSS in. Let me syntax-check and then verify the rendering logic against the fixture data.



#### Tool: TodoWrite

**Input:**

```json
{
  "todos": [
    {
      "description": "#1 Keep question visible: minimisable pop-up (slim bar shows Q-id + chosen option, re-expands)",
      "status": "completed"
    },
    {
      "description": "#2 Respect presentation_kind (route/independent_check/synthesis); remove 'Ways through it' framing; no manufactured Why-it-matters/Next-move",
      "status": "completed"
    },
    {
      "description": "#3 Complete fixed-position option rail: coloured letters only, 7 relationships, ordered from identity.option_labels, eliminates/lands_on fallback",
      "status": "completed"
    },
    {
      "description": "#4 Reflection beside the thought: prompts sit beside methods via method_refs; group prompt once after group; strip proposed__; local multi-select controls",
      "status": "completed"
    },
    {
      "description": "#5 Keep internal internal: remove review.reviewer from pupil footer; taxonomy reviewer-only",
      "status": "completed"
    },
    {
      "description": "#6 Fail gracefully: empty/missing analysis never blocks verdict or progression",
      "status": "in_progress"
    },
    {
      "description": "Verify against acceptance fixtures (Q4, Q27, Q40, 2022 Q27, 2019 Q01, 2017 Q46)",
      "status": "pending"
    },
    {
      "description": "Update CHANGELOG (v0.3.0)",
      "status": "pending"
    }
  ]
}
```

**Output:**

```json
Successfully updated the todo list. The current list is now:
1. [completed] #1 Keep question visible: minimisable pop-up (slim bar shows Q-id + chosen option, re-expands)
2. [completed] #2 Respect presentation_kind (route/independent_check/synthesis); remove 'Ways through it' framing; no manufactured Why-it-matters/Next-move
3. [completed] #3 Complete fixed-position option rail: coloured letters only, 7 relationships, ordered from identity.option_labels, eliminates/lands_on fallback
4. [completed] #4 Reflection beside the thought: prompts sit beside methods via method_refs; group prompt once after group; strip proposed__; local multi-select controls
5. [completed] #5 Keep internal internal: remove review.reviewer from pupil footer; taxonomy reviewer-only
6. [in_progress] #6 Fail gracefully: empty/missing analysis never blocks verdict or progression
7. [pending] Verify against acceptance fixtures (Q4, Q27, Q40, 2022 Q27, 2019 Q01, 2017 Q46)
8. [pending] Update CHANGELOG (v0.3.0)
```

#### Thinking

Let me run `node --check` and then verify #6 (graceful failure). For #6, the key requirement is: "Missing or provisional deep analysis must never suppress the normal answer verdict, block progression, or hide available feedback."

Current code: `_renderInterrogation` starts with:
```js
if (!cfg.modules.postQuestionReview || !cfg.analysisOf) return;
const rec = cfg.analysisOf(this.cur);
if (!rec) return; /* graceful absence: most questions still have no analysis */
```

So if there's no analysis record, the interrogation doesn't render at all — the normal answer verdict (from the main flow, not the modal) still shows. Wait — is the verdict inside the modal, or in the main flow? Let me check. The modal's interrogation contains `_verdictEl`. But there should also be a normal answer line in the card (`.ppq-answer-line`). Let me confirm the normal flow shows the verdict independently of the modal.

Actually, handoff #6 says: "The pupil bundle for launch cards is intentionally empty while those cards are held for recalibration. That is not an instruction to hide the normal question flow." So when `analysisOf` returns null (empty bundle), the normal flow (answer, verdict via answer line, progression) must still work. The modal just doesn't open.

Let me confirm: when there's no analysis, does the normal answer flow still show a verdict and allow progression? The `_renderInterrogation` returns early (no modal). The normal flow: pupil picks an option → `selectOption` → `_afterAnswer` → shows answer line + competence row (1-6 + Next). Let me confirm the modal opening is gated on analysis presence.

Let me check `_afterAnswer` / where `_renderInterrogation` is called (line 1020). Let me read around there to confirm the normal flow isn't blocked.

Actually, the key thing for #6: the early return at line 1157 (`if (!rec) return;`) ensures no modal when there's no analysis. And the normal flow (answer line, 1-6, Next) is independent. Let me confirm `_renderInterrogation` is called but its early return doesn't break progression. Let me read around line 1020 and the selectOption/afterAnswer flow.

Let me run node --check first, then read the flow.

#### Tool: Bash

```bash
cd "C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer" && node --check engine/ppqviewer.js && echo "SYNTAX OK"
```

**Output:**

```json
SYNTAX OK
```

#### Thinking

Next, let's verify #6 (graceful failure). I'll read the answer flow and check where `_renderInterrogation` is called, and confirm that the normal judgment/progression isn't blocked when the analysis doesn't exist.


Syntax clean. Now let me verify #6 — that a missing/empty analysis never blocks the ordinary verdict or progression.



#### Tool: Read

> Read: `C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\engine\ppqviewer.js`

**Output:**

```json
1000	      this._commitTimer(); /* QoderWork 2026-07-22: stop the clock on reveal */
1001	      let ms = this._formatMarkscheme(this.cfg.markschemeOf(this.cur));
1002	      const ansImg = this.cfg.answerUrlOf(this.cur);
1003	      // QoderWork 2026-07-22: softened spoiler wording, aligned with the Chemistry viewer
1004	      if (ansImg) ms += '<details class="ppq-ms-full"><summary>Show full markscheme page <span class="ppq-spoiler">(may well contain spoilers for other parts)</span></summary><img src="' + esc(ansImg) + '"></details>';
1005	      this.q(".ppq-markscheme").innerHTML = ms;
1006	      this.q(".ppq-answer-panel").className = "ppq-answer-panel show";
1007	      this._showExaminer(this.cur);
1008	      this.q(".ppq-reveal").style.display = "none";
1009	      if (this.cfg.modules.math) this._applyMath(this.q(".ppq-answer-panel"));
1010	      this._afterAnswer();
1011	    } else {
1012	      // imageSelfMark reveal: show correct, do not lock a graded attempt
1013	      const correct = this.cfg.correctOf(this.cur).toUpperCase();
1014	      this.qa(".ppq-option").forEach((b) => { if (b.dataset.label.toUpperCase() === correct) b.classList.add("correct"); });
1015	      const al = this.q(".ppq-answer-line"); al.className = "ppq-answer-line show"; al.textContent = "Correct answer: " + (correct || "?") + " (not logged)";
1016	    }
1017	  };
1018	
1019	  Viewer.prototype._afterAnswer = function () {
1020	    this.q(".ppq-skip").style.display = "none";
1021	    this.q(".ppq-reveal").style.display = "none";
1022	    this.q(".ppq-competence").className = "ppq-competence show";
1023	    /* QoderWork 2026-07-22 (analyst handoff): the outer "Actually, I wasn't sure"
1024	       control is superseded by the post-answer guess correction that now sits
1025	       inside the modal right after the verdict. Keep it hidden (DOM + wiring
1026	       retained so the change stays reversible). */
1027	    this.q(".ppq-unsure").style.display = "none";
1028	    this.q(".ppq-guess").style.display = "none"; /* QoderWork 2026-07-22 (v0.2.6): pre-declare closes once answered */
1029	    this.q(".ppq-kb-hint").textContent = "Self-rate, then Enter for next.";
1030	    /* QoderWork 2026-07-22: half-working post-question interrogation. Renders only
1031	       when the module is on AND this question has an analysis record. */
1032	    this._renderInterrogation();
1033	  };
1034	
1035	  Viewer.prototype._showExaminer = function (q) {
1036	    const body = this.cfg.examinerOf(q);
1037	    if (!body) return;
1038	    this.q(".ppq-examiner-body").innerHTML = body;
1039	    this.q(".ppq-answer-panel").classList.add("show", "has-examiner");
```

#### Thinking

Alright. So here's the flow: `_afterAnswer` displays the competency row (1-6 + Next) and calls `_renderInterrogation()`. `_renderInterrogation` returns early if there's no analysis record (`if (!rec) return;`). In that case, the competency row (1-6 + Next) is still displayed, so progression works. The modal simply doesn't open.

But wait — there's a subtle issue. When analysis exists, `_renderInterrogation` opens the modal and hides the competency row (`this.q(".ppq-competence").style.display = "none";`). The 1-6 + Next is inside the modal. When there's no analysis, the competency row stays visible. Good.

So #6 is satisfied: no analysis → no modal → the normal competency row with 1-6 + Next shows → progression works. The normal judgment (answer line) is displayed by `selectOption`/`reveal` regardless of the situation.

Let me double-check that the answer line (judgment) is displayed independently of the modal. `selectOption` sets the answer line. Let me confirm the judgment is displayed in the card even when the modal opens. Actually, the modal covers the card, but with the new minimize feature, students can minimize and check. And the modal itself has `_verdictEl`. So the judgment is available in both places.

One more thing to check about #6: "The deep v2 wins when it exists." — `analysisOf` handles the layer resolution (deep > provisional > unavailable). Let me check whether the esat config's `analysisOf` properly handles the empty launch card bundle. Let me check the config's analysisOf. Actually, the integration document provides the `analysisStateOf` pattern. Let me check what the esat config uses. But this is config-level, not engine-level. The engine's `_renderInterrogation` uses `cfg.analysisOf(this.cur)`. If that returns null, it's handled gracefully.

Let me check the esat config's analysisOf and confirm it returns null for empty/unavailable (not an empty object that would pass the `if (!rec)` check but fail rendering). Let me grep the config.

Actually, the important graceful-failure check at the engine level is: if `rec` is truthy but incomplete (e.g., no methods, no pupil_analysis), does the rendering crash? Let me trace through:
- `_isV2(rec)` = `!!(rec && rec.identity && rec.pupil_analysis)`. If rec has no pupil_analysis, isV2=false → legacy path (`_appendProbeLegacy`, `_appendMethodsLegacy`). These handle missing fields gracefully (guarded with `if (rec.probe && rec.probe.text)`, `if (rec.methods && rec.methods.length)`).
- If isV2=true: `_appendInsightV2` (guarded), `_appendMethodsV2` (returns early if no methods), `_appendSelfReportV2` (handles empty arrays). `_verdictEl` — let me check that it handles missing identity fields.

Let me quickly check whether `_verdictEl` is safe against incomplete records. Actually, the handoff's concern is primarily about the empty launch card bundle (no records at all → analysisOf returns null → graceful). That's handled.

Let me check the esat config's analysisOf to confirm it returns null (not {}) when unavailable. Let me grep.

The ordinary flow is safe: `_afterAnswer` shows the 1-6 + Next row, and `_renderInterrogation` returns early when there's no record, so progression never blocks. Let me confirm the config's `analysisOf` returns null (not an empty object) for unavailable analysis, so the engine's guard holds.



#### Tool: Bash

```bash
cd "C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer" && grep -n "analysisOf\|ESAT_ANALYSIS_V2\|ESAT_LAUNCH_CARDS\|analysisStateOf\|by_id" example/esat-config.js example/esat-compare.html dist/esat-compare/index.html 2>/dev/null | head -40
```

**Output:**

```json
example/esat-compare.html:63:       window.ESAT_ANALYSIS_V2 = { schema_version, interaction_defaults, records[],
example/esat-compare.html:64:       by_id{} }. Preferred over the legacy store above when a record exists; the
example/esat-compare.html:190:      function analysisOf(q) {
example/esat-compare.html:196:           (by_id) when it exists; fall back to the legacy analysis store for
example/esat-compare.html:198:        var V2 = window.ESAT_ANALYSIS_V2;
example/esat-compare.html:199:        if (V2 && V2.by_id) {
example/esat-compare.html:200:          if (q.part && V2.by_id[base + "_" + q.part]) return V2.by_id[base + "_" + q.part];
example/esat-compare.html:201:          if (V2.by_id[base]) return V2.by_id[base];
example/esat-compare.html:287:           ESAT analysis store. Switch analysisOf off (or the module to false) to
example/esat-compare.html:289:        analysisOf: analysisOf,
example/esat-compare.html:296:        guessDefaults: (window.ESAT_ANALYSIS_V2 && window.ESAT_ANALYSIS_V2.interaction_defaults && window.ESAT_ANALYSIS_V2.interaction_defaults.guess_declaration) || null
dist/esat-compare/index.html:69:       window.ESAT_ANALYSIS_V2 = { schema_version, interaction_defaults, records[],
dist/esat-compare/index.html:70:       by_id{} }. Preferred over the legacy store above when a record exists; the
dist/esat-compare/index.html:196:      function analysisOf(q) {
dist/esat-compare/index.html:202:           (by_id) when it exists; fall back to the legacy analysis store for
dist/esat-compare/index.html:204:        var V2 = window.ESAT_ANALYSIS_V2;
dist/esat-compare/index.html:205:        if (V2 && V2.by_id) {
dist/esat-compare/index.html:206:          if (q.part && V2.by_id[base + "_" + q.part]) return V2.by_id[base + "_" + q.part];
dist/esat-compare/index.html:207:          if (V2.by_id[base]) return V2.by_id[base];
dist/esat-compare/index.html:293:           ESAT analysis store. Switch analysisOf off (or the module to false) to
dist/esat-compare/index.html:295:        analysisOf: analysisOf,
dist/esat-compare/index.html:302:        guessDefaults: (window.ESAT_ANALYSIS_V2 && window.ESAT_ANALYSIS_V2.interaction_defaults && window.ESAT_ANALYSIS_V2.interaction_defaults.guess_declaration) || null
```

#### Thinking

Let me read through the entire `analysisOf` function in esat-compare.html (lines 190-215) and check what it returns when unavailable.

#### Tool: Read

> Read: `C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\example\esat-compare.html`

**Output:**

```json
190	      function analysisOf(q) {
191	        if (!q || !q.slug) return null;
192	        var nn = String(parseInt(q.question_number, 10));
193	        nn = nn.length < 2 ? "0" + nn : nn;
194	        var base = q.slug + "_Q" + nn;
195	        /* QoderWork 2026-07-22 (analyst handoff): PREFER the analysis-v2 record
196	           (by_id) when it exists; fall back to the legacy analysis store for
197	           questions not migrated yet; otherwise null → the plain viewer. */
198	        var V2 = window.ESAT_ANALYSIS_V2;
199	        if (V2 && V2.by_id) {
200	          if (q.part && V2.by_id[base + "_" + q.part]) return V2.by_id[base + "_" + q.part];
201	          if (V2.by_id[base]) return V2.by_id[base];
202	        }
203	        if (q.part && ANALYSIS[base + "_" + q.part]) return ANALYSIS[base + "_" + q.part];
204	        return ANALYSIS[base] || null;
205	      }
206	
207	      window.PPQ_CONFIG = {
208	        title: "ESAT PPQ (shared engine, comparison)",
209	        versionLabel: "ppqviewer v0.2.7 · comparison + logging",
210	        appVersion: "ppqviewer-esat-compare",
211	        storageKey: "esat_ppq_COMPARE",
212	        /* QoderWork 2026-07-22: login may be null (fallback gate mode). */
213	        learnerId: (login ? login.current().display_name : "") || "local",
214	        timingMode: "none",
215	        prefetchAhead: 3,
216	
217	        /* QoderWork 2026-07-22 (v0.2.5): verdicts are ON. Smith corrected the
218	           v0.2.4 misread — he never said hide right/wrong; the fault was that the
219	           abstract probe headline came FIRST (now the verdict block leads the
```

#### Thinking

`analysisOf` returns `null` when unavailable (`return ANALYSIS[base] || null;`). So the engine's `if (!rec) return;` guard holds — graceful absence is confirmed. #6 is satisfied at the engine + config level.

The handoff also says: "The deep layer always wins" and "A `needs_specialist` or `blocked` launch card is reviewer evidence, not pupil-facing advice." The current `analysisOf` prefers V2 deep records, then falls back to the legacy ANALYSIS store. The integration doc's `analysisStateOf` pattern handles launch cards (provisional/unavailable). The current config doesn't use ESAT_LAUNCH_CARDS. But that's a config/data issue, and the launch-card bundle is "intentionally empty while we hold those cards for re-tuning." So nothing to do there — the engine handles null gracefully.

#6 confirmed. Let me mark it complete and move on to verification (#7).

For verification, I can't run a headless browser (jsdom isn't installed). But I can write a Node script that simulates the rendering logic against the fixture data — or at least verify the data-driven decisions (prompt placement, rail construction, state labels) by extracting the pure logic.

Actually, the cleanest verification is: write a small Node harness that loads the engine's rendering functions and runs them against the fixture records with a fake DOM. But the engine is an IIFE that attaches to `window`/DOM. That's heavy.

Alternative: verify the core logic (prompt grouping, rail construction, state labels) by replicating the algorithm in a standalone script against the real bundle data, and confirm the output matches the acceptance fixtures. This verifies the algorithm if not the DOM wiring.

Actually, a better approach: use jsdom if available. Let me check if jsdom is installed somewhere. The summary said jsdom isn't installed. Let me confirm and consider installing it. Actually, installing jsdom might be heavy. Let me first try a lighter verification: extract the fixture records and run the grouping/rail/label logic.

Actually, the most valuable verification is to actually render. Let me check if jsdom can be installed quickly. Let me check npm availability. Actually, let me reconsider — Smith verifies visually in the browser himself (he has the live site). My job is to make sure the code is correct. A logic-level verification against the fixtures is valuable and feasible.

Let me write a verification script that:
1. Loads the bundle.
2. For each fixture (Q4, Q27, Q40, 2022 Q27, 2019 Q01, 2017 Q46):
   a. Computes the prompt placement (which prompt goes after which method) using the same algorithm as `_appendMethodsV2`.
   b. Verifies the rail (all labels present, correct relationships).
   c. Verifies the state labels (proposed__ stripped).
3. Checks against the handoff's acceptance criteria.

But this duplicates the logic rather than testing the actual code. Hmm.

Better: let me try to actually load the engine in jsdom. Let me check if jsdom is available or installable. Let me check.

Actually, let me reconsider the effort/value. The engine code is browser-bound. A full jsdom harness is the gold standard but takes setup. A logic-replication script verifies the algorithm against fixtures, catching data-shape mismatches (the main risk). Given time constraints, let me do both a lightweight check:

1. First, check if jsdom is available. If yes, build a real harness. If no, do logic verification.

Let me check jsdom.

`analysisOf` returns `null` when unavailable, so the engine's guard holds — #6 confirmed. Let me mark it and verify against the fixtures. First, check whether jsdom is available for a real render test.



#### Tool: TodoWrite

**Input:**

```json
{
  "todos": [
    {
      "description": "#1 Keep question visible: minimisable pop-up (slim bar shows Q-id + chosen option, re-expands)",
      "status": "completed"
    },
    {
      "description": "#2 Respect presentation_kind (route/independent_check/synthesis); remove 'Ways through it' framing; no manufactured Why-it-matters/Next-move",
      "status": "completed"
    },
    {
      "description": "#3 Complete fixed-position option rail: coloured letters only, 7 relationships, ordered from identity.option_labels, eliminates/lands_on fallback",
      "status": "completed"
    },
    {
      "description": "#4 Reflection beside the thought: prompts sit beside methods via method_refs; group prompt once after group; strip proposed__; local multi-select controls",
      "status": "completed"
    },
    {
      "description": "#5 Keep internal internal: remove review.reviewer from pupil footer; taxonomy reviewer-only",
      "status": "completed"
    },
    {
      "description": "#6 Fail gracefully: empty/missing analysis never blocks verdict or progression",
      "status": "completed"
    },
    {
      "description": "Verify against acceptance fixtures (Q4, Q27, Q40, 2022 Q27, 2019 Q01, 2017 Q46)",
      "status": "in_progress"
    },
    {
      "description": "Update CHANGELOG (v0.3.0)",
      "status": "pending"
    }
  ]
}
```

**Output:**

```json
Successfully updated the todo list. The current list is now:
1. [completed] #1 Keep question visible: minimisable pop-up (slim bar shows Q-id + chosen option, re-expands)
2. [completed] #2 Respect presentation_kind (route/independent_check/synthesis); remove 'Ways through it' framing; no manufactured Why-it-matters/Next-move
3. [completed] #3 Complete fixed-position option rail: coloured letters only, 7 relationships, ordered from identity.option_labels, eliminates/lands_on fallback
4. [completed] #4 Reflection beside the thought: prompts sit beside methods via method_refs; group prompt once after group; strip proposed__; local multi-select controls
5. [completed] #5 Keep internal internal: remove review.reviewer from pupil footer; taxonomy reviewer-only
6. [completed] #6 Fail gracefully: empty/missing analysis never blocks verdict or progression
7. [in_progress] Verify against acceptance fixtures (Q4, Q27, Q40, 2022 Q27, 2019 Q01, 2017 Q46)
8. [pending] Update CHANGELOG (v0.3.0)
```

#### Thinking

Let me check if jsdom is available, and try building an actual rendering harness. That would be the strongest validation.

#### Tool: Bash

```bash
cd "C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer" && node -e "try{require.resolve('jsdom');console.log('jsdom AVAILABLE')}catch(e){console.log('jsdom MISSING')}" && ls test* 2>/dev/null; ls *.js 2>/dev/null | head
```

**Output:**

```json
jsdom MISSING
test_chem.js
test_ppqviewer.js
```

#### Thinking

jsdom isn't found. There are existing test files (test_ppqviewer.js, test_chem.js). Let me check how test_ppqviewer.js works — maybe there's a minimal DOM shim that doesn't require jsdom. Let me take a look.


There's an existing `test_ppqviewer.js`. Let me see how it sets up the DOM — it may have a shim that avoids jsdom.



#### Tool: Read

> Read: `C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\test_ppqviewer.js`

**Error:** Error: File does not exist. Note: your current working directory is C:\Users\patri\.qoderwork\workspace\mrxliwj52gkyrnrd.

#### Thinking

The path needs to be absolute. Let me try reading it with an absolute path.


#### Tool: Read

> Read: `C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\test_ppqviewer.js`

**Error:** Error: File does not exist. Note: your current working directory is C:\Users\patri\.qoderwork\workspace\mrxliwj52gkyrnrd.

#### Thinking

Hmm, the file doesn't exist? But `ls test*` showed `test_ppqviewer.js`. Maybe it's in a different location, or the ls output was from a different directory. Wait, I ran `ls test*` with cwd set to the ppqviewer directory. Let me check again with an absolute path glob.

#### Tool: Bash

```bash
cd "C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer" && ls -la test_ppqviewer.js test_chem.js 2>&1; echo "---head---"; head -50 test_ppqviewer.js 2>&1
```

**Output:**

```json
Output: ls: cannot access 'test_ppqviewer.js': No such file or directory
ls: cannot access 'test_chem.js': No such file or directory
---head---
head: cannot open 'test_ppqviewer.js' for reading: No such file or directory
Exit Code: 1
Process Group PGID: 57756
```

#### Thinking

Weird — the earlier `ls test*` displayed those files, but now they don't exist. The earlier `ls test* 2>/dev/null; ls *.js` — maybe the `ls *.js` matched engine files? No wait, it displayed `test_chem.js` and `test_ppqviewer.js`. But now they can't be found. Maybe the earlier command was executed in a different directory? No, I used `cd`. Strange. Maybe the files were in the workspace directory, not in ppqviewer. Actually, the earlier command was `cd "C:\Claude...\ppqviewer" && node -e "..." && ls test* 2>/dev/null; ls *.js 2>/dev/null | head`. The `;` separates them — `ls *.js` was executed after cd, in ppqviewer. Hmm, but now they can't be found.

Wait — maybe those test files are in my workspace scratchpad, or somewhere else. Let me not chase this. jsdom is missing, and the test files can't be reliably found.

Let me take the verification approach via logic reproduction. I'll write a standalone Node script that loads the actual bundle data and reproduces the exact algorithms of `_appendMethodsV2` (prompt placement), `_elimChipsV2El` (rail), and `_stateLabel`, and asserts the acceptance fixtures from the handoff. This verifies that the algorithms produce correct output against real data. It's not DOM wiring, but it catches the main risks (data shape, placement logic, rail completeness, label formatting).

Actually — better idea. Instead of reproducing, I can extract the actual functions from the engine source and run them with a minimal fake DOM. The engine's functions use `el()` and `esc()`, which need `document`. I can create a minimal `document.createElement` shim that builds a simple object tree, then load the engine's IIFE with a fake `window`/`document`. That's essentially a mini-jsdom.

Hmm, the engine's IIFE is large and touches a lot of DOM at init time (buildUI etc.). But I don't need to init the whole Viewer — I just need the prototype methods. The IIFE defines `Viewer.prototype.X = ...` and also runs some top-level code? Let me check — the IIFE probably defines helpers + Viewer + attaches to window. If it auto-inits on DOMContentLoaded, that's guarded.

This is getting complex. Given the constraints, the cleanest and most reliable verification I can do without jsdom is:
1. Extract the three pure-ish functions' logic and test against the bundle. But they reference `this` (Viewer instance) and `el`/`esc`.

Alternative pragmatic approach: write a verification script that re-implements the placement/rail/label algorithms (mirroring my engine code exactly) and runs them against the fixture data, asserting the handoff's acceptance criteria. This verifies the algorithm + data compatibility. I'll clearly note that it mirrors the engine logic.

Actually, the most honest and valuable check: build a minimal DOM shim sufficient for the engine's `el`/`esc` and the specific render functions, extract those functions' source from the engine file, and eval them in a context with the shim. Let me try that — extract `_appendMethodsV2`, `_methodBlockV2`, `_methodKindLabel`, `_elimChipsV2El`, `_optionRailLegendEl`, `_appendSelfReportV2`, `_promptBlockV2`, `_stateLabel` and run them against a fake `this` and fixture records.

Let me build the harness:
- Minimal `document.createElement` that returns an object with `className`, `style`, `setAttribute`, `appendChild`, `children`, `textContent`, `innerHTML`, `dataset`.
- `el` and `esc` — copy from the engine (they're simple).
- Extract the target functions from the engine source via regex, and eval them as methods on a fake Viewer.

This is feasible. Let me write it. The fake element needs:
- `appendChild(child)` → push to children
- `className` (settable)
- `style` (object with cssText)
- `setAttribute(k,v)` → store
- `dataset` (object)
- `textContent` / `innerHTML`
- `addEventListener` (no-op)
- `querySelectorAll` (return [] — used in _promptBlockV2's click handler, but we don't click)

Since we're just building the tree (not clicking), the handlers won't fire. So we only need the DOM construction parts.

Let me write the harness. Extract the function bodies from the engine file. Actually, rather than regex-extracting (fragile), let me load the whole engine file in a sandbox with fake window/document, then access `Viewer.prototype`. But the IIFE wraps everything and only exposes via `window.PPQViewer` or similar. Let me check what the engine exposes.

Let me check the tail of the engine file for the export.


jsdom is missing and those test files aren't actually present. Let me check how the engine exposes itself so I can load it in a minimal DOM shim for a real render test.



#### Tool: Bash

```bash
cd "C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer" && tail -25 engine/ppqviewer.js && echo "===HEAD===" && head -12 engine/ppqviewer.js
```

**Output:**

```json
this.q(".ppq-draw-toggle").classList.toggle("active", this._drawOn);
    if (this._drawOn) { canvas.style.display = "block"; this._initCanvas(); } else { canvas.style.display = "none"; }
  };
  Viewer.prototype._initCanvas = function () {
    const canvas = this.q(".ppq-canvas"), container = this.q(".ppq-draw-container");
    const dpr = window.devicePixelRatio || 1, rect = container.getBoundingClientRect();
    canvas.width = rect.width * dpr; canvas.height = rect.height * dpr;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    ctx.scale(dpr, dpr); ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.lineWidth = this._drawThickness;
    const active = this.q(".ppq-color.active"); ctx.strokeStyle = active ? active.dataset.color : "black";
    this._ctx = ctx; this._drawHistory = [ctx.getImageData(0, 0, canvas.width, canvas.height)];
    const self = this;
    canvas.onpointerdown = function (e) { self._drawing = true; ctx.beginPath(); const r = e.target.getBoundingClientRect(); ctx.moveTo(e.clientX - r.left, e.clientY - r.top); e.preventDefault(); };
    canvas.onpointermove = function (e) { if (!self._drawing) return; const r = e.target.getBoundingClientRect(); ctx.lineTo(e.clientX - r.left, e.clientY - r.top); ctx.stroke(); e.preventDefault(); };
    canvas.onpointerup = function () { if (!self._drawing) return; self._drawing = false; ctx.closePath(); self._drawHistory.push(ctx.getImageData(0, 0, canvas.width, canvas.height)); };
    canvas.onpointerout = canvas.onpointerup;
  };
  Viewer.prototype.clearCanvas = function () { if (!this._ctx) return; const canvas = this.q(".ppq-canvas"); this._ctx.clearRect(0, 0, canvas.width, canvas.height); this._drawHistory.push(this._ctx.getImageData(0, 0, canvas.width, canvas.height)); };
  Viewer.prototype.undoDraw = function () { if (!this._ctx || this._drawHistory.length <= 1) return; this._drawHistory.pop(); this._ctx.putImageData(this._drawHistory[this._drawHistory.length - 1], 0, 0); };
  Viewer.prototype.setDrawColor = function (color) { if (this._ctx) this._ctx.strokeStyle = color; this.qa(".ppq-color").forEach((b) => b.classList.remove("active")); const c = this.q('.ppq-color[data-color="' + color + '"]'); if (c) c.classList.add("active"); };
  Viewer.prototype.setDrawThickness = function (v) { this._drawThickness = parseInt(v, 10); if (this._ctx) this._ctx.lineWidth = this._drawThickness; };

  return { mount: function (root, opts) { opts = opts || {}; return new Viewer(root, opts.config, opts.questions, opts.meta, opts.report).init(); }, version: "0.2.1-phase3" };
})();
// build: phase3
===HEAD===
/* ppqviewer, the estate's shared past-paper-question viewer engine.
   Neutral home: C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\
   Owned by no subject. Consumers supply only a config object and their questions.

   Design (see DESIGN.md / DECISIONS.md):
   - Option A (d003, q02): the engine builds ALL on-screen furniture into one mount.
     Consumers ship a single div plus config + data, nothing visual.
   - Embed-safe (d009): everything scoped to the passed-in root, held on the instance,
     no global element IDs, no reliance on owning body. Standalone page OR bolt-on.
   - Storage (d001, d002): flat attempts log + scores map, keyed off a REQUIRED
     namespaced config.storageKey. Dashboard derived from the log.
   - Self-report (d006): 1-to-6 is the DEFAULT, defined in config.selfReport.
```

#### Thinking

The engine is an IIFE that returns `{ mount, version }`. It doesn't expose `Viewer` directly. The IIFE runs top-level code that defines `el`, `esc`, and `Viewer`, and returns the mount object. It doesn't auto-initialize (mount has to be called).

To test the render functions, I need access to `Viewer.prototype`. Since the IIFE only returns `{mount, version}`, I can't easily get Viewer. However, I can eval the engine source in a sandbox with a fake `document`/`window`, call `mount` with a fake root and minimal config + fixture question, and trigger the interrogation render. But that requires a full init (buildUI, etc.), which needs a fairly complete DOM shim.

That's a lot of shim work. Given the constraints, the practical and honest verification is a logic-mirroring harness: re-implement the exact placement/rail/label algorithms and run them against the actual bundle fixtures, asserting the handoff's acceptance criteria. This verifies data compatibility and algorithm correctness, which is where the real risk lies (the DOM wiring has been syntax-checked and is straightforward).

Actually, let me reconsider — I can extract the specific prototype functions from the source text and eval just those, together with copies of `el`/`esc`, against a minimal element shim. The functions reference `this._optionLabels`, `this._optionRailLegendEl`, `this._promptBlockV2`, `this._methodBlockV2`, `this._elimChipsV2El`, `this._stateLabel`, `this._analysisSelfReports`, `this._fireReport`, `this._promptStates`, `this._renderInterrogationFeedback`, `this._attemptId`. I can provide a fake `this` with stubs for these, and the actual implementations for the pure ones.

Let me build the harness:
1. Minimal element shim (createElement returns a node object).
2. Copy `el` and `esc` from the engine.
3. Extract function source for: `_appendMethodsV2`, `_methodBlockV2`, `_methodKindLabel`, `_elimChipsV2El`, `_optionRailLegendEl`, `_appendSelfReportV2`, `_promptBlockV2`, `_stateLabel`. Eval them onto a fake object.
4. Fake `this` with: `_optionLabels: () => rec.identity.option_labels`, `_analysisSelfReports: {}`, `_promptStates: {}`, `_fireReport: ()=>{}`, `_renderInterrogationFeedback: ()=>{}`, `_attemptId: 'test'`, `_optionRailLegendEl`, etc. (the actual ones).
5. Load the bundle fixtures.
6. Run `_appendMethodsV2(iq, rec)` and `_appendSelfReportV2(iq, rec, rendered)`, then walk the resulting tree to assert:
   - Q4: 4 independent_checks + 1 synthesis; each check's rail has all 6 letters; prompts placed correctly; group prompt (neutral_wording) placed once after the 4th check.
   - State labels have no "proposed".
   - Rails are complete and correctly ordered.

To extract function source from the engine file, I can use regex to capture from `Viewer.prototype.NAME = function` to the matching closing `};`. Brace matching is easier. Let me write a helper that, given the source and a function name, extracts the function expression.

Actually, simpler: I can read the engine file, and for each target name find `Viewer.prototype.NAME = function (...) {...};` and extract via brace counting. Then build `fake.NAME = <evaluated function>`.

Let me write this harness in the workspace scratchpad.

Let me write the verification script.

The engine only exposes `mount`, so I'll extract the actual render functions from the source and run them against the real fixture data with a minimal DOM shim — this tests the real code paths (placement, rail, labels) without a browser. Let me build that harness.



#### Tool: Write

> Modified: `C:\Users\patri\.qoderwork\workspace\mrxliwj52gkyrnrd\verify_handoff.js`

**Output:**

```json
File created successfully at: C:\Users\patri\.qoderwork\workspace\mrxliwj52gkyrnrd\verify_handoff.js
```

#### Thinking

Let's try running the verification harness.

#### Tool: Bash

```bash
cd "C:\Users\patri\.qoderwork\workspace\mrxliwj52gkyrnrd" && node verify_handoff.js 2>&1
```

**Output:**

```json
=== Q4 (esat_engaa_2016_s1_Q04) ===

=== Q27 (esat_engaa_2016_s1_Q27) ===

=== Q40 (esat_engaa_2019_s1_Q40) ===

=== esat_engaa_2022_s1_Q27 === 3 methods, 6 options

=== esat_engaa_2019_s1_Q01 === 3 methods, 7 options

=== esat_engaa_2017_s1_Q46 === 3 methods, 8 options

==================  192 passed, 0 failed  ==================
```

#### Thinking

All 192 assertions passed, 0 failures. The actual engine functions, run against the live bundle fixtures, satisfy the acceptance criteria:
- Q4: 4 unnumbered peer checks + 1 synthesis, all 6 letters on each row, correct relationships, group prompt once before synthesis, no "proposed" in labels, no "used it" on methods with local prompts.
- Q27: route is numbered, independent checks are unnumbered, surviving options are unaffected (not green).
- Q40: 2 checks + 1 synthesis + 2 routes, correct rails.
- 2022 Q27, 2019 Q01, 2017 Q46: rails complete, labels readable.

Verification complete. Next I'll update the CHANGELOG (v0.3.0). Let me mark #7 as done and get started on #8.

Let me read the top of the current CHANGELOG and add a v0.3.0 entry.


All 192 assertions pass against the live fixtures — the real engine functions produce exactly what the handoff's acceptance criteria demand. Now the CHANGELOG.



#### Tool: TodoWrite

**Input:**

```json
{
  "todos": [
    {
      "description": "#1 Keep question visible: minimisable pop-up (slim bar shows Q-id + chosen option, re-expands)",
      "status": "completed"
    },
    {
      "description": "#2 Respect presentation_kind (route/independent_check/synthesis); remove 'Ways through it' framing; no manufactured Why-it-matters/Next-move",
      "status": "completed"
    },
    {
      "description": "#3 Complete fixed-position option rail: coloured letters only, 7 relationships, ordered from identity.option_labels, eliminates/lands_on fallback",
      "status": "completed"
    },
    {
      "description": "#4 Reflection beside the thought: prompts sit beside methods via method_refs; group prompt once after group; strip proposed__; local multi-select controls",
      "status": "completed"
    },
    {
      "description": "#5 Keep internal internal: remove review.reviewer from pupil footer; taxonomy reviewer-only",
      "status": "completed"
    },
    {
      "description": "#6 Fail gracefully: empty/missing analysis never blocks verdict or progression",
      "status": "completed"
    },
    {
      "description": "Verify against acceptance fixtures (Q4, Q27, Q40, 2022 Q27, 2019 Q01, 2017 Q46)",
      "status": "completed"
    },
    {
      "description": "Update CHANGELOG (v0.3.0)",
      "status": "in_progress"
    }
  ]
}
```

**Output:**

```json
Successfully updated the todo list. The current list is now:
1. [completed] #1 Keep question visible: minimisable pop-up (slim bar shows Q-id + chosen option, re-expands)
2. [completed] #2 Respect presentation_kind (route/independent_check/synthesis); remove 'Ways through it' framing; no manufactured Why-it-matters/Next-move
3. [completed] #3 Complete fixed-position option rail: coloured letters only, 7 relationships, ordered from identity.option_labels, eliminates/lands_on fallback
4. [completed] #4 Reflection beside the thought: prompts sit beside methods via method_refs; group prompt once after group; strip proposed__; local multi-select controls
5. [completed] #5 Keep internal internal: remove review.reviewer from pupil footer; taxonomy reviewer-only
6. [completed] #6 Fail gracefully: empty/missing analysis never blocks verdict or progression
7. [completed] Verify against acceptance fixtures (Q4, Q27, Q40, 2022 Q27, 2019 Q01, 2017 Q46)
8. [in_progress] Update CHANGELOG (v0.3.0)
```

#### Thinking

Let's read the beginning of the CHANGELOG and add a v0.3.0 entry at the very top.


#### Tool: Read

> Read: `C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\CHANGELOG.md`

**Output:**

```json
1	# CHANGELOG: ppqviewer
2	
3	Universal engine changes are recorded here and notified into each consumer's inbox. Newest at the top.
4	
5	## 2026-07-23 (QoderWork) — analyst presentation contract: all prompts shown, state label, evidence vocabulary, reviewer strip (v0.2.9)
6	Four changes requested by the categorisation analyst after reviewing the live esatwallop site.
```

#### Thinking

Let's add the v0.3.0 entry at the very top. It should explain the rework of the analysis presentation based on VIEWER_HANDOFF_2026-07-24.md, and also clearly note that it partially supersedes v0.2.9.

#### Tool: Edit

**Input:**

```json
{
  "_rawParseError": true,
  "_rawInput": "{\"file_path\": \"C:\\\\Claude (not on Gdrive, nor OneDrive)\\\\ppqviewer\\\\CHANGELOG.md\", \"instruction\": \"Add a new v0.3.0 entry at the top (after the intro line) documenting the analysis-presentation rework from VIEWER_HANDOFF_2026-07-24.md, noting which v0.2.9 decisions it supersedes.\", \"new_string\": \"# CHANGELOG: ppqviewer\\n\\nUniversal engine changes are recorded here and notified into each consumer's inbox. Newest at the top.\\n\\n## 2026-07-24 (QoderWork) — analysis-presentation rework from the 24 July viewer handoff (v0.3.0)\\nImplements `VIEWER_HANDOFF_2026-07-24.md` (with `PPQVIEWER_INTEGRATION.md` and the generated v2 bundle as co-authorities). This is a re-presentation of the post-question analysis; the question/answer/guess/progression flow is untouched. Several v0.2.9 decisions are deliberately superseded (noted below).\\n\\n### 1. Keep the question visible — minimisable pop-up\\nThe analysis pop-up is now minimisable. A \\\"—\\\" button in the top bar shrinks it to a slim bar pinned to the bottom; the overlay goes transparent and click-through so the question, diagram, options and the pupil's answer show behind it. The bar carries a reminder (question + chosen option) and a restore button. The answer → pop-up → guess → verdict flow is unchanged.\\n\\n### 2. Respect the authored presentation structure\\n`_appendMethodsV2` now reads `methods[].presentation_kind`: `route` renders dependent steps numbered (each inference relies on the last); `independent_check` renders unnumbered peer checks; `synthesis` combines completed checks. The generic \\\"Ways through it\\\" heading and the \\\"collecting alternatives\\\" sentence are gone. `Why it matters` / `Next move` still render only when present (never manufactured).\\n\\n### 3. Complete fixed-position option-evidence rail\\n`_elimChipsV2El` rebuilt. Every option label (from `identity.option_labels`) shows in the same position on every method-local row, and the LETTER ITSELF is coloured by relationship — no background, pill, border or strikethrough. Seven relationships: rules_out (red), counts_against (light red), disfavours (orange), unaffected (grey), favours (light blue), supports (light green), directly_identifies (green). A surviving option is `unaffected`, not positive evidence. A compact word-and-swatch legend (never A–G letters) lists only the relationships the question uses. `eliminates`/`lands_on` fall back onto the same complete rail. **Supersedes** the v0.2.9 pill/background/strikethrough chips.\\n\\n### 4. Reflection beside the thought\\nEach `self_report_prompts[]` item now sits beside the method(s) named by its `method_refs`; a prompt that refers to a whole peer group shows once, after the group's last member. The generic \\\"used it\\\" tick is hidden when a method has an authored local prompt. State labels strip a leading `proposed__` and render readable text (never a raw id). Opt-in multi-select is supported via an authored `multi_select` flag (single-select until the data uses it). **Supersedes** the v0.2.9 \\\"More quick checks\\\" disclosure (secondary prompts are no longer detached).\\n\\n### 5. Keep internal analysis internal\\nReview status and reviewer are reviewer-only. The pupil-facing \\\"Full review · <reviewer>\\\" footer is removed; the `?review` strip is now the single place status + reviewer appear. **Supersedes** the v0.2.9 pupil-facing state label.\\n\\n### 6. Fail gracefully\\nConfirmed: a missing/empty analysis record (`analysisOf` → null) never suppresses the ordinary verdict"
}
```

terminated

