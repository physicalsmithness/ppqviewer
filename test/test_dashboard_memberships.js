/* Overlapping dashboard groups retain one part and one saved attempt.
   Run: node test/test_dashboard_memberships.js (same jsdom as consumer tests). */
"use strict";
const assert = require("assert");
const fs = require("fs"), path = require("path");
const { JSDOM } = require("jsdom");
const engine = fs.readFileSync(path.join(__dirname, "../engine/ppqviewer.js"), "utf8");
const opened = [];
let checks = 0;
function check(label, fn) { fn(); checks++; console.log("ok " + label); }
function mount(questions, extra = {}) {
  const dom = new JSDOM('<!doctype html><div id="root"></div>', {
    url: "https://localhost/", runScripts: "outside-only", pretendToBeVisual: true
  });
  const w = dom.window;
  w.confirm = () => true;
  w.eval(engine);
  const root = w.document.getElementById("root");
  const config = {
    storageKey: "membership-test", defaultOrder: "ordered", questionFinder: true,
    groupKey: q => q.topics[0], groupLabel: q => q.topics[0],
    correctOf: () => "A", questionTextOf: () => "A test prompt", ...extra
  };
  const v = w.PPQViewer.mount(root, { config, questions });
  const result = { dom, w, root, v };
  opened.push(result);
  return result;
}
function cat(p, key) { return p.root.querySelector('.ppq-cat[data-key="' + key + '"]'); }
function count(p, key) { return Number(cat(p, key).querySelector(".ppq-cat-count").textContent.replace(/[()]/g, "")); }
const memberships = {
  groupKeysOf: q => q.topics,
  groupLabelOf: key => ({ "A.1": "Kinematics", "A.5": "Relativity", "E.2": "Quantum physics" }[key] || key),
  itemNoun: "part"
};
try {
  // The observed A5 case: 404 primary memberships and 44 secondary ones.
  const questions = Array.from({ length: 448 }, (_, i) => ({
    id: "q" + String(i).padStart(3, "0"),
    topics: i < 43 ? ["A.1", "A.5"] : i === 43 ? ["E.2", "A.5"] : ["A.5"]
  }));
  questions[0].topics.push("A.5"); // A repeated tag must not duplicate membership.
  questions.push({ id: "outside", topics: ["A.1"] });
  const p = mount(questions, memberships);
  check("dashboard counts all448 A5 parts exactly once", () => {
    assert.strictEqual(count(p, "A.5"), 448);
    assert.strictEqual(count(p, "A.1"), 44);
    assert.match(cat(p, "A.5").textContent, /Relativity/);
  });
  check("dashboard click selects448 stable part records including secondary topics", () => {
    cat(p, "A.5").click();
    assert.strictEqual(p.v.view.length, 448);
    assert.strictEqual(new Set(p.v.view.map(q => q.id)).size, 448);
    assert(p.v.view.every(q => q.topics.includes("A.5")));
    assert.match(p.root.querySelector(".ppq-counter").textContent, /^448 parts/);
    assert.match(p.root.querySelector(".ppq-dash-sub").textContent, /One box per part/);
    assert.strictEqual(p.root.querySelector(".ppq-find-input").placeholder, "Find part…");
  });
  check("one answer and rating update both dashboard groups without duplicate storage", () => {
    assert.strictEqual(p.v.cur.id, "q000");
    p.v.selectOption("A");
    p.root.querySelector('.ppq-scale-btn[data-val="4"]').click();
    assert.strictEqual(p.v.store.attempts.length, 1);
    assert.strictEqual(Object.keys(p.v.store.scores).length, 1);
    assert.strictEqual(JSON.parse(p.w.localStorage.getItem("membership-test")).attempts.length, 1);
    for (const topic of ["A.1", "A.5"]) {
      assert.strictEqual(cat(p, topic).querySelectorAll(".ppq-tick").length, 1);
      assert(cat(p, topic).querySelector('.ppq-heat[title="rated 4: 1"]'));
    }
    p.v.renderDashboard();
    assert.strictEqual(p.v.store.attempts.length, 1);
  });
  check("legacy consumers keep primary-only dashboard and question wording", () => {
    const legacy = mount(questions);
    assert.strictEqual(count(legacy, "A.5"), 404);
    cat(legacy, "A.5").click();
    assert.strictEqual(legacy.v.view.length, 404);
    assert.match(legacy.root.querySelector(".ppq-counter").textContent, /^404 questions/);
    assert.match(legacy.root.querySelector(".ppq-dash-sub").textContent, /One box per question/);
  });
  const facet = mount([
    { id: "shared", topics: ["A.1", "A.5"], families: ["frames"] },
    { id: "other", topics: ["A.5"], families: ["motion"] }
  ], {
    ...memberships,
    filters: [
      { field: "topics", label: "topic", values: ["A.1", "A.5"], default: "A.5", friendlyLabels: { "A.1": "Kinematics", "A.5": "Relativity" } },
      { field: "families", label: "family", dependsOn: "topics", dashboardFacet: true, facetNoun: "families",
        facetGuidanceOf: value => value === "frames" ? { summary: 'Compare <img src="x"> frames.', checks: ["State x < y & explain.", "Identify the observer."] } : {summary:"Track motion.",checks:["Name the frame."]} }
    ]
  });
  check("facet heading uses selected topic label despite representative's first topic", () => {
    assert.strictEqual(facet.root.querySelector(".ppq-dash h3").textContent, "Relativity families");
    assert.match(facet.root.querySelector(".ppq-dash-overlap-note").textContent, /^2 parts\./);
    assert(!facet.root.querySelector(".ppq-facet-guidance"));
  });
  check("Key tips start closed, retain escaped advice and close again on a group switch", () => {
    facet.root.querySelector('.ppq-facet-cat[data-value="frames"]').click();
    assert.strictEqual(facet.v.view.length, 1);
    const guidance = facet.root.querySelector(".ppq-facet-guidance");
    assert(guidance && !guidance.open);
    assert.strictEqual(guidance.querySelector("summary").textContent, "Key tips");
    assert.strictEqual(guidance.querySelector("p").textContent, 'Compare <img src="x"> frames.');
    assert.strictEqual(guidance.querySelectorAll("li").length, 2);
    assert.strictEqual(guidance.querySelectorAll("img,script").length, 0);
    const before={id:facet.v.cur.id,shownAt:facet.v.shownAt,answered:facet.v.answered,store:JSON.stringify(facet.v.store)};
    guidance.querySelector("summary").click();assert(guidance.open,"Advice can be opened explicitly");
    assert.deepStrictEqual({id:facet.v.cur.id,shownAt:facet.v.shownAt,answered:facet.v.answered,store:JSON.stringify(facet.v.store)},before);
    facet.root.querySelector('.ppq-facet-cat[data-value="motion"]').click();
    const switched=facet.root.querySelector(".ppq-facet-guidance");
    assert(switched && !switched.open);assert.strictEqual(switched.querySelector("summary").textContent,"Key tips");
    assert.strictEqual(switched.querySelector("p").textContent,"Track motion.");
    assert.strictEqual(facet.root.querySelector(".ppq-facet-cat.active").dataset.value,"motion");
    assert.strictEqual(facet.v.cur.id,"other");
    facet.root.querySelector(".ppq-facet-clear").click();
    assert.strictEqual(facet.v.view.length, 2);
    assert(!facet.root.querySelector(".ppq-facet-guidance"));
  });
  console.log(checks + " dashboard membership checks passed");
} finally {
  opened.forEach(p => { p.v.destroy(); p.dom.window.close(); });
}
