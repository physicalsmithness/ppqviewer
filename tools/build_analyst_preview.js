#!/usr/bin/env node
/* QoderWork 2026-07-22 — build_analyst_preview.js
   Generates a single self-contained HTML file showing all 33 analysed ESAT
   questions exactly as the pop-up renders them (verdict, probe, methods with
   multi-line split + red/green elimination chips, feedback). No dependencies,
   no relative paths, no file:/// images — safe to email or open anywhere.

   Usage: node tools/build_analyst_preview.js
   Output: example/analyst-preview.html
*/
"use strict";
const fs = require("fs");
const path = require("path");

const ANALYSIS_DIR = path.resolve(__dirname, "../../ESAT Prep App/data/analysis");
const OUT = path.resolve(__dirname, "../example/analyst-preview.html");

/* --- load the five analysis-store files (they set window.ESAT_ANALYSIS_*) --- */
const FILES = [
  "esat_engaa_2016_s1.js",
  "esat_nsaa_2016_s1.js",
  "esat_engaa_2017_s1.js",
  "esat_nsaa_2017_s1.js",
  "esat_nsaa_2018_s1.js",
];
const window = {};
FILES.forEach((f) => {
  const code = fs.readFileSync(path.join(ANALYSIS_DIR, f), "utf8");
  new Function("window", code)(window);
});
const ALL = Object.keys(window)
  .filter((k) => k.startsWith("ESAT_ANALYSIS_"))
  .flatMap((k) => window[k]);

console.log("Loaded " + ALL.length + " analysis records.");

/* --- helpers (mirror the engine's rendering) --- */
function esc(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function methodLines(desc) {
  const raw = String(desc || "").replace(/=>/g, " ⇒ ");
  const parts = raw.split(/[,;]/).map((p) => p.trim()).filter(Boolean);
  if (parts.length <= 1) return '<div class="ml">' + esc(raw) + "</div>";
  return parts
    .map((p) => {
      const cls = p.startsWith("⇒") ? "ml result" : "ml";
      return '<div class="' + cls + '">' + esc(p) + "</div>";
    })
    .join("");
}
function elimChips(method, labels, correctLetter) {
  const raw = String(method.eliminates || "");
  if (!raw) return "";
  const letters = raw.match(/\b([A-H])\b/g) || [];
  if (!letters.length) return '<div class="elim-prose">' + esc(raw) + "</div>";
  const chips = labels
    .map((L) => {
      const isElim = letters.includes(L);
      const isCorrect = L === correctLetter;
      let cls = "chip";
      if (isElim && !isCorrect) cls += " red";
      else if (isCorrect) cls += " green";
      else cls += " dim";
      return '<span class="' + cls + '">' + L + "</span>";
    })
    .join("");
  return '<div class="elim">' + chips + '<div class="elim-prose">' + esc(raw) + "</div></div>";
}

/* --- render one record --- */
function renderRecord(rec) {
  const labels = (rec.options || []).map((o) => o.label);
  const correctLetter = String(rec.correct_answer || "").toUpperCase();
  let h = "";

  /* verdict block (leads, per v0.2.5) */
  h += '<div class="verdict-note">Verdict block shows the pupil\'s chosen option with right/wrong styling. Example for each option below.</div>';
  (rec.options || []).forEach((opt) => {
    if (!opt.error_path) return;
    const cls = opt.is_correct ? "opt right" : "opt wrong";
    const head = opt.is_correct
      ? opt.label + " — the right answer"
      : opt.label + (correctLetter ? " — the answer is " + correctLetter : "");
    h += '<div class="' + cls + '">';
    h += '<div class="opt-head">' + esc(head) + "</div>";
    h += '<div class="opt-path">' + esc(opt.error_path) + "</div>";
    if (opt.misconception_slugs && opt.misconception_slugs.length) {
      h += '<div class="slugs">' + opt.misconception_slugs.map((s) => '<span class="slug">' + esc(s) + "</span>").join("") + "</div>";
    }
    h += "</div>";
  });

  /* probe */
  if (rec.probe && rec.probe.text) {
    h += '<div class="section-label">What this question is really about</div>';
    h += '<div class="probe">' + esc(rec.probe.text) + "</div>";
    if (rec.probe.difficulty_source || rec.probe.trick_type) {
      h += '<div class="chips">';
      if (rec.probe.difficulty_source) h += '<span class="chip-tag">difficulty: ' + esc(rec.probe.difficulty_source) + "</span>";
      if (rec.probe.trick_type) h += '<span class="chip-tag">' + esc(rec.probe.trick_type) + "</span>";
      h += "</div>";
    }
  }

  /* methods */
  if (rec.methods && rec.methods.length) {
    h += '<div class="section-label">Ways through it</div>';
    h += '<div class="encourage">There is more than one route — collecting alternatives is the point.</div>';
    rec.methods.forEach((m) => {
      h += '<div class="method">';
      h += '<div class="method-head"><b>' + esc(m.id) + "</b> <span class=\"kind\">" + esc(m.kind || "") + "</span>";
      h += ' <span class="used">☐ used it</span></div>';
      h += '<div class="method-desc">' + methodLines(m.description) + "</div>";
      h += elimChips(m, labels, correctLetter);
      h += "</div>";
    });
  }

  /* feedback */
  if (rec.feedback && rec.feedback.length) {
    h += '<div class="section-label">Feedback (fires on condition)</div>';
    rec.feedback.forEach((fb) => {
      h += '<div class="fb"><span class="fb-on">' + esc(fb.on) + "</span> <span class=\"fb-when\">" + esc(fb.when || "") + "</span>";
      if (fb.fires && fb.fires.length) h += " fires: " + fb.fires.map((f) => '<span class="slug">' + esc(f) + "</span>").join(" ");
      h += '<div class="fb-text">' + esc(fb.text) + "</div></div>";
    });
  }

  return h;
}

/* --- group by paper --- */
const papers = {};
ALL.forEach((rec) => {
  const key = rec.assessment + " " + rec.year + " " + rec.section;
  if (!papers[key]) papers[key] = [];
  papers[key].push(rec);
});

/* --- assemble HTML --- */
let body = "";
Object.keys(papers).sort().forEach((paper) => {
  body += '<h2 class="paper">' + esc(paper) + " (" + papers[paper].length + " questions)</h2>";
  papers[paper].forEach((rec) => {
    body += '<div class="card">';
    body += '<h3>' + esc(rec.id) + " · " + esc(rec.subject) + " · Q" + rec.question_number + (rec.part ? rec.part : "") + "</h3>";
    body += renderRecord(rec);
    body += "</div>";
  });
});

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>ESAT Analysis Preview — for the Question Analyst</title>
<style>
:root{--ink:#1a1a1a;--ink2:#444;--muted:#777;--line:#ddd;--accent:#3182ce;--ok:#2d6a3f;--bad:#b03030;--bg:#fafafa;--paper:#fff}
*{box-sizing:border-box}
body{font-family:system-ui,-apple-system,sans-serif;max-width:900px;margin:2rem auto;padding:0 1rem;color:var(--ink);line-height:1.5;background:var(--bg)}
h1{font-size:1.4rem;margin-bottom:0.3rem}
.subtitle{color:var(--muted);font-size:0.9rem;margin-bottom:2rem}
h2.paper{font-size:1.1rem;margin:2.5rem 0 1rem;padding-bottom:0.3rem;border-bottom:2px solid var(--accent)}
.card{background:var(--paper);border:1px solid var(--line);border-radius:10px;padding:1.2rem 1.4rem;margin-bottom:1.5rem}
.card h3{font-size:0.95rem;color:var(--accent);margin:0 0 0.8rem}
.section-label{font-weight:800;font-size:0.78rem;text-transform:uppercase;letter-spacing:0.05em;color:var(--accent);margin:1rem 0 0.4rem}
.verdict-note{font-size:0.8rem;color:var(--muted);font-style:italic;margin-bottom:0.6rem}
.opt{border:1px solid var(--line);border-radius:8px;padding:0.6rem 0.8rem;margin-bottom:0.5rem}
.opt.wrong{border-left:3px solid var(--bad)}
.opt.right{border-left:3px solid var(--ok)}
.opt-head{font-weight:700;font-size:0.88rem;margin-bottom:0.2rem}
.opt.wrong .opt-head{color:var(--bad)}
.opt.right .opt-head{color:var(--ok)}
.opt-path{font-size:0.88rem;color:var(--ink2)}
.slugs{display:flex;gap:0.3rem;flex-wrap:wrap;margin-top:0.4rem}
.slug{font-size:0.68rem;background:rgba(176,48,48,0.07);border:1px solid rgba(176,48,48,0.25);color:var(--bad);border-radius:5px;padding:1px 6px;font-family:monospace}
.probe{font-size:0.92rem;color:var(--ink)}
.chips{display:flex;gap:0.4rem;flex-wrap:wrap;margin-top:0.4rem}
.chip-tag{font-size:0.7rem;background:rgba(49,130,206,0.08);border:1px solid rgba(49,130,206,0.25);color:var(--accent);border-radius:5px;padding:2px 7px;font-family:monospace}
.encourage{font-size:0.82rem;color:var(--muted);font-style:italic;margin-bottom:0.5rem}
.method{border:1px solid var(--line);border-radius:8px;padding:0.6rem 0.85rem;margin-bottom:0.5rem}
.method-head{display:flex;gap:0.5rem;align-items:baseline;flex-wrap:wrap;margin-bottom:0.25rem;font-size:0.9rem}
.kind{font-size:0.7rem;font-family:monospace;background:var(--line);border-radius:5px;padding:1px 6px;color:var(--ink2)}
.used{font-size:0.75rem;color:var(--muted)}
.method-desc{font-size:0.86rem;color:var(--ink2)}
.ml{display:block;padding:0.1rem 0 0.1rem 0.9rem;position:relative}
.ml::before{content:"·";position:absolute;left:0.25rem;color:var(--muted)}
.ml.result{color:var(--ink);font-weight:600}
.elim{margin-top:0.4rem}
.elim .chip{display:inline-flex;align-items:center;justify-content:center;min-width:1.6rem;height:1.6rem;border-radius:6px;font-weight:800;font-size:0.82rem;border:1px solid var(--line);color:var(--muted);background:var(--bg);margin-right:0.25rem}
.elim .chip.red{background:rgba(176,48,48,0.12);border-color:rgba(176,48,48,0.5);color:var(--bad);text-decoration:line-through}
.elim .chip.green{background:rgba(45,106,63,0.14);border-color:rgba(45,106,63,0.55);color:var(--ok)}
.elim .chip.dim{opacity:0.55}
.elim-prose{font-size:0.76rem;color:var(--muted);font-style:italic;margin-top:0.3rem}
.fb{border:1px solid var(--line);border-radius:8px;padding:0.5rem 0.8rem;margin-bottom:0.5rem;font-size:0.85rem}
.fb-on{font-weight:700;color:var(--accent)}
.fb-when{font-family:monospace;font-size:0.78rem;color:var(--muted)}
.fb-text{margin-top:0.3rem;color:var(--ink2)}
.ask{background:#fffbe6;border:1px solid #e6d84d;border-radius:10px;padding:1.2rem 1.4rem;margin:2rem 0}
.ask h2{font-size:1.05rem;margin:0 0 0.8rem;color:#8a6d00}
.ask ol{margin:0;padding-left:1.2rem}
.ask li{margin-bottom:0.7rem;font-size:0.9rem;line-height:1.5}
.ask li b{color:#8a6d00}
</style>
</head>
<body>
<h1>ESAT Analysis Preview</h1>
<div class="subtitle">ppqviewer v0.2.5 · ${ALL.length} analysed questions · generated ${new Date().toISOString().slice(0, 10)} · self-contained (no external files needed)</div>

<div class="ask">
<h2>What we need from you (the Question Analyst)</h2>
<ol>
<li><b>Structured elimination data.</b> The engine currently parses <code>eliminates</code> as free prose with a regex to find letter references — this works for 67 of 128 methods. Please add <code>eliminates: ["A","C","F"]</code> (array of letters) and <code>lands_on: "G"</code> per method so the red/green chips render reliably.</li>
<li><b>Per-method steps.</b> The multi-line layout currently splits <code>description</code> on commas/semicolons (117/128 split well). A proper <code>steps: ["Subtract 6", "Multiply by −2, FLIP sign", "⇒ x &lt; 28"]</code> array per method would give full control over line breaks.</li>
<li><b>Pupil-facing wording.</b> Probe text, method descriptions, and misconception slugs (e.g. <code>inequality_sign_flip_omitted</code>) are currently shown verbatim to pupils. Please supply a <code>pupil_text</code> or reword the existing fields so they read naturally for a 16–18-year-old.</li>
<li><b>Feedback review.</b> (a) Strip praise — estate voice is "no praise, no infantilising"; the current feedback contains "Nice, …" etc. (b) Reconcile the <code>when</code> grammar with the new "used it" tickbox model (currently <code>when:"used:M3"</code> etc. — confirm this maps cleanly). (c) Check alignment with <code>misconceptions_core.yaml</code> for the <code>fires</code> arrays.</li>
<li><b>Error paths for CORRECT options.</b> The correct option's <code>error_path</code> currently describes the solution method. Consider whether this should be a brief "why it's right" note or left blank (the verdict already says "the right answer").</li>
<li><b>Pre-declare vs post-declare guesses.</b> The live app now has a post-declare mechanism ("Actually, I wasn't sure" → pick the letters you were torn between, after seeing the verdict). Should we ALSO or INSTEAD let pupils declare uncertainty BEFORE locking in their answer? Your view on which produces more honest data.</li>
</ol>
</div>

${body}

</body>
</html>`;

fs.writeFileSync(OUT, html, "utf8");
console.log("Written: " + OUT);
console.log("Size: " + (fs.statSync(OUT).size / 1024).toFixed(1) + " kB");
