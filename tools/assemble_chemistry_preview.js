/* Local-only chemistry assembly. Reads content-seat files without changing them.
 * Missing originals stay visible as text-only practice and are listed honestly.
 * Nothing here stages, publishes, or approves a catalogue for publication. */
"use strict";
const fs = require("fs"), path = require("path"), vm = require("vm"), crypto = require("crypto");
const { fileURLToPath } = require("url");
const ROOT = path.resolve(__dirname, "..");
const DEFAULT_LEGACY = "C:/Claude (not on Gdrive, nor OneDrive)/chemistrydriller";
const DEFAULT_ASSETS = "C:/CodexProjects/PaperDatabases/outputs/previews";
const IMAGE_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".gif", ".webp"]);
const FIELDS = ["id", "legacy_id", "part_id", "parent_id", "source_part_id", "label", "part_label", "question_number",
  "year", "session", "timezone", "paper", "level", "marks", "marks_status", "mark_group", "stem_text", "lead_in",
  "question_text", "part_text", "choices", "answer_key", "correct_option", "answer_status", "markscheme_text",
  "examiner_comment", "examiner_report", "examiner_source_type", "examiner_match_note", "current_levels",
  "current_level", "level_availability", "source_group_id", "shared_group", "cross_level_group_id", "topic_codes",
  "primary_codes", "topics", "p1b_skill", "syllabus_codes", "cross_level_group_method", "command_terms", "question_types", "themes", "category_code", "category_label", "subcategory_code", "subcategory_label", "spec_status",
  "usable_if", "marking_note", "marking_differs", "era_note", "has_figure_omitted", "self_mark", "criteria"];
const unique = values => [...new Set(values.filter(Boolean))];
const list = value => Array.isArray(value) ? value : value == null || value === "" ? [] : [value];
function ensure(value, message) { if (!value) throw new Error(message); }
function inside(root, file) {
  const relative = path.relative(path.resolve(root), path.resolve(file));
  return relative !== "" && relative !== ".." && !relative.startsWith(".." + path.sep) && !path.isAbsolute(relative);
}
function hasLocalPath(value) { return /(?:file:\/\/|[a-z]:[\\/]|\\\\[^\\\s]+\\)/i.test(value); }
// Inspect decoded strings. JSON escaping doubles TeX backslashes and must never
// be mistaken for a UNC filesystem path.
function hasLocalPathValue(value) {
  if (typeof value === "string") return hasLocalPath(value);
  if (Array.isArray(value)) return value.some(hasLocalPathValue);
  return !!value && typeof value === "object" && Object.entries(value).some(([key, item]) => hasLocalPath(key) || hasLocalPathValue(item));
}
function safeValue(value) {
  if (typeof value === "string") return hasLocalPath(value) ? undefined : value;
  if (Array.isArray(value)) return value.map(safeValue).filter(item => item !== undefined);
  if (value && typeof value === "object") {
    const result = {};
    for (const [key, item] of Object.entries(value)) {
      if (hasLocalPath(key) || ["__proto__", "constructor", "prototype"].includes(key)) continue;
      const safe = safeValue(item); if (safe !== undefined) result[key] = safe;
    }
    return result;
  }
  return value;
}
function loadCatalogue(file) {
  const source = fs.readFileSync(file);
  const context = vm.createContext({window:Object.create(null)}, {codeGeneration:{strings:false, wasm:false}});
  vm.runInContext(source.toString("utf8"), context, {timeout:10000, filename:path.basename(file)});
  const data = JSON.parse(vm.runInContext("JSON.stringify({meta:window.CHEM_META || window.CHEMISTRY_META || {}, records:window.CHEM_QUESTIONS || window.CHEM_PPQS || window.CHEMISTRY_QUESTIONS})", context, {timeout:10000}));
  ensure(Array.isArray(data.records) && data.records.length, "Catalogue must export a nonempty CHEM_QUESTIONS or CHEM_PPQS array");
  return {...data, sha256:crypto.createHash("sha256").update(source).digest("hex")};
}
function loadAdapter(repositoryRoot) {
  const context = vm.createContext({window:Object.create(null)}, {codeGeneration:{strings:false, wasm:false}});
  vm.runInContext(fs.readFileSync(path.join(repositoryRoot, "example/chemistry-config.js"), "utf8"), context, {timeout:10000});
  ensure(context.window.ChemistryViewer, "Chemistry adapter is missing");
  return context.window.ChemistryViewer;
}
function badSegments(reference) {
  return reference.replace(/\\/g, "/").split("/").some(piece => piece === ".." || piece === ".");
}
function resolveAsset(reference, settings, role, preview, kind) {
  if (typeof reference !== "string" || !reference.trim()) return {error:"unsafe", reason:"Image reference is not a nonempty string"};
  let ref = reference.trim(), file;
  if (/[\0\r\n]/.test(ref)) return {error:"unsafe", reason:"Control character in image reference"};
  if (/^https?:|^\/\//i.test(ref)) return {error:"remote", reason:"Remote images are not downloaded by a local preview"};
  try { ref = decodeURIComponent(ref); } catch (_) { return {error:"unsafe", reason:"Invalid URL escape"}; }
  if (badSegments(ref)) return {error:"unsafe", reason:"Image reference contains path traversal"};
  if (kind) {
    if (!/^[\w][\w.-]*$/.test(String(preview || "")) || !/^[\w][\w .()-]*$/.test(ref)) return {error:"unsafe", reason:"Canonical preview and asset must be bare names"};
    if (!(role === "markscheme_images" ? /^mark_/ : /^question_/).test(ref)) return {error:"unsafe", reason:"Question and markscheme asset kind mismatch"};
    if (!["flat", "crops_and_pages"].includes(settings.assetLayout)) return {error:"unsafe", reason:"Canonical assets require meta.asset_layout flat or crops_and_pages"};
    file = path.resolve(settings.assetsRoot, preview, ...(settings.assetLayout === "flat" ? [] : [kind === "pages" ? "pages" : "crops"]), ref);
  } else if (/^file:/i.test(ref)) {
    try { file = fileURLToPath(ref); } catch (_) { return {error:"unsafe", reason:"Invalid local file URL"}; }
  } else if (/^[a-z][a-z\d+.-]*:/i.test(ref) && !/^[a-z]:[\\/]/i.test(ref)) {
    return {error:"unsafe", reason:"Unsupported image URL scheme"};
  } else if (path.isAbsolute(ref)) file = path.resolve(ref);
  else file = path.resolve(settings.legacyRoot, ref);
  if (!IMAGE_EXTENSIONS.has(path.extname(file).toLowerCase())) return {error:"unsafe", reason:"Unsupported image file type"};
  const roots = [settings.legacyRoot, settings.assetsRoot].map(root => path.resolve(root));
  if (!roots.some(root => inside(root, file))) return {error:"unsafe", reason:"Image is outside the declared source roots"};
  if (!fs.existsSync(file)) return {error:"missing", reason:"Referenced image does not exist", file};
  if (!fs.statSync(file).isFile()) return {error:"unsafe", reason:"Image reference is not a file"};
  const real = fs.realpathSync(file);
  if (!roots.some(root => fs.existsSync(root) && inside(fs.realpathSync(root), real))) return {error:"unsafe", reason:"Image symlink leaves the declared source roots"};
  return {file:real};
}
function assetRequests(record, parent) {
  const output = {question_images:[], context_images:[], markscheme_images:[]};
  function add(role, value, kind, owner) {
    const preview = (owner || record).preview || (parent || {}).preview;
    list(value).forEach(reference => output[role].push({reference,
      kind:kind || (preview && typeof reference === "string" && /^(?:question|mark)_/.test(reference) && !/[\\/]/.test(reference) ? /^(?:question|mark)_p\d/.test(reference) ? "pages" : "crops" : null), preview}));
  }
  function canonical(role, owner, cropField) {
    add(role, owner[cropField], "crops", owner);
    if (!list(owner[cropField]).length) add(role, role === "markscheme_images"
      ? owner.ms_pages_this_question || owner.ms_pages || list(owner.pages).filter(file => /^mark_/.test(file))
      : list(owner.pages).filter(file => /^question_/.test(file)), "pages", owner);
  }
  function images(role, owner, modern, crops, legacy) {
    if (Object.hasOwn(owner, modern)) add(role, owner[modern], null, owner);
    else if (list(owner[crops]).length || list(owner.pages).length || list(owner.ms_pages).length || list(owner.ms_pages_this_question).length) canonical(role, owner, crops);
    else add(role, owner[legacy], null, owner);
  }
  images("question_images", record, "question_images", "crops", "crop_url");
  images("markscheme_images", record, "markscheme_images", "ms_crops", "answer_url");
  if (Object.hasOwn(record, "context_images")) add("context_images", record.context_images, null, record);
  else if (parent) images("context_images", parent, "question_images", "crops", "crop_url");
  add("context_images", record.context_pages || list(record.pages).filter(file => /^question_/.test(file)), "pages", record);
  add("context_images", record.stem_pages, "pages", record);
  if (parent) add("context_images", parent.stem_pages, "pages", parent);
  add("markscheme_images", record.ms_pages_this_question || record.ms_pages, "pages", record);
  // Keep whole-page originals as context without ever treating mark pages as questions.
  if (record.page_url) add("context_images", record.page_url, null, record);
  if (parent && parent.page_url && parent.page_url !== record.page_url) add("context_images", parent.page_url, null, parent);
  return output;
}
function validateBundle(root, questions, staticAssets) {
  const references = unique(questions.flatMap(q => ["question_images", "context_images", "markscheme_images"].flatMap(key => q[key])).concat(staticAssets));
  for (const reference of references) {
    ensure(typeof reference === "string" && !/^(?:[a-z]+:|[\\/])/i.test(reference) && !badSegments(reference), "Unsafe bundled reference");
    const target = path.resolve(root, reference);
    ensure(inside(root, target) && fs.existsSync(target) && fs.statSync(target).isFile(), "Missing bundled reference: " + reference);
    ensure(inside(fs.realpathSync(root), fs.realpathSync(target)), "Bundled reference escapes through a symlink");
  }
  ensure(!hasLocalPathValue(questions), "Source filesystem path leaked into served questions");
  return references.length;
}
// Preserve the deployed Paper 1B mastery grouping by stable ID. The canonical
// catalogue supplies finer skills as well; their order is not a broad-group
// contract. Only retain a donor category explicitly present in those skills.
function preserveMasteryCategory(item, donor) {
  if (String(item.paper) !== "1B" || item.category_code || !donor || !donor.category_code) return;
  const code = donor.category_code;
  ensure(String(donor.paper) === "1B" && typeof code === "string" && !/^[SR]/.test(code)
    && list(item.p1b_skill).includes(code), "Legacy Paper 1B category is not declared by source: " + item.id);
  item.category_code = code;
}
function assemble(options = {}) {
  ensure(!options.release && !options.publish && !options.stage, "This assembler only creates a local preview");
  const repositoryRoot = path.resolve(options.repositoryRoot || ROOT);
  const legacyRoot = path.resolve(options.legacyRoot || DEFAULT_LEGACY), assetsRoot = path.resolve(options.assetsRoot || DEFAULT_ASSETS);
  const catalogue = path.resolve(options.catalogue || path.join(legacyRoot, "ppqs.js"));
  const outputRoot = path.resolve(options.outputRoot || path.join(ROOT, "dist/chemistry-preview"));
  ensure(inside(ROOT, outputRoot), "Preview output must stay inside the ppqviewer workspace");
  const {meta:sourceMeta, records, sha256:catalogueHash} = loadCatalogue(catalogue), adapter = loadAdapter(repositoryRoot);
  const normalized = JSON.parse(JSON.stringify(adapter.normalizeQuestions(records))), sourceById = new Map();
  const donorPath = path.join(legacyRoot, "ppqs.js");
  const donor = fs.existsSync(donorPath) ? loadCatalogue(donorPath) : null;
  const donorById = new Map((donor ? donor.records : []).map(q => [q.id, q]));
  records.forEach(record => {
    if (Array.isArray(record.parts) && record.parts.length) record.parts.forEach(part => sourceById.set(part.legacy_id || part.part_id || part.id, {record:part, parent:record}));
    else sourceById.set(record.legacy_id || record.id || record.part_id, {record, parent:null});
  });
  const buildId = new Date().toISOString().replace(/[:.]/g, "-") + "_" + crypto.randomBytes(3).toString("hex");
  const root = path.join(outputRoot, buildId);
  fs.mkdirSync(path.join(root, "assets/questions"), {recursive:true});
  const report = {schema_version:1, build_id:buildId, release:false, catalogue, catalogue_sha256:catalogueHash,
    source_roots:{legacy:legacyRoot, assets:assetsRoot}, source_records:records.length, parts:normalized.length, issues:[], copied_assets:[], by_paper:{}};
  const settings = {legacyRoot, assetsRoot, assetLayout:sourceMeta.asset_layout};
  const sourceCache = new Map(), hashCache = new Map();
  function copy(request, role, id) {
    const resolved = resolveAsset(request.reference, settings, role, request.preview, request.kind);
    if (resolved.error) { report.issues.push({id, role, reference:request.reference, status:resolved.error, reason:resolved.reason}); return null; }
    if (sourceCache.has(resolved.file)) return sourceCache.get(resolved.file);
    const bytes = fs.readFileSync(resolved.file), hash = crypto.createHash("sha256").update(bytes).digest("hex");
    let target = hashCache.get(hash);
    if (!target) {
      target = "assets/questions/" + hash + path.extname(resolved.file).toLowerCase();
      fs.writeFileSync(path.join(root, target), bytes);
      hashCache.set(hash, target); report.copied_assets.push({source:resolved.file, target, sha256:hash, bytes:bytes.length});
    }
    sourceCache.set(resolved.file, target); return target;
  }
  const questions = normalized.map(item => {
    const result = {};
    FIELDS.forEach(key => { if (Object.hasOwn(item, key)) { const safe = safeValue(item[key]); if (safe !== undefined) result[key] = safe; } });
    preserveMasteryCategory(result, donorById.get(item.id));
    ensure(result.id === item.id, "Question ID contains a filesystem path");
    result.parent_id = result.parent_id || result.id.split("(")[0].trim();
    result.label = result.label || result.part_label || (result.id.match(/\(.*$/) || [""])[0];
    result.stem_text = result.stem_text || ""; result.lead_in = result.lead_in || "";
    result.question_text = result.question_text || result.part_text || safeValue(item.text) || "";
    const marks = item.marks == null || item.marks === "" ? NaN : Number(item.marks);
    result.marks = Number.isInteger(marks) && marks >= 0 ? marks : null;
    const source = sourceById.get(item.id), requests = assetRequests(source.record, source.parent);
    Object.entries(requests).forEach(([role, requests]) => { result[role] = unique(requests.map(request => copy(request, role, item.id))); });
    const hasOriginal = result.question_images.length > 0 || result.context_images.length > 0;
    result.original_status = hasOriginal ? "available" : "missing";
    const paper = String(result.paper || "unknown");
    report.by_paper[paper] ||= {parts:0, with_original:0, text_only:0, with_markscheme_images:0};
    report.by_paper[paper].parts++; report.by_paper[paper][hasOriginal ? "with_original" : "text_only"]++;
    if (result.markscheme_images.length) report.by_paper[paper].with_markscheme_images++;
    return result;
  });
  const assets = [];
  for (const [source, target] of [["example/chemistry.html", "index.html"], ["example/chemistry-page.js", "chemistry-page.js"], ["example/chemistry-config.js", "chemistry-config.js"],
    ["example/subject-identity.js", "subject-identity.js"], ["example/physics-reporting.js", "ppq-reporting.js"], ["engine/ppqviewer.js", "ppqviewer.js"], ["engine/ppqviewer.css", "ppqviewer.css"]]) {
    fs.copyFileSync(path.join(repositoryRoot, source), path.join(root, target)); assets.push(target);
  }
  const config = adapter.createConfig({questions:[], meta:{release:false}}), booklet = config.modules.referenceBooklet;
  const bookletAssets = unique(list(booklet.sections).map(file => booklet.assetPrefix + file).concat(list(config.headerButtons).map(button => button.open)));
  for (const relative of bookletAssets) {
    ensure(!badSegments(relative) && inside(legacyRoot, path.resolve(legacyRoot, relative)) && inside(root, path.resolve(root, relative)), "Unsafe booklet path");
    fs.mkdirSync(path.dirname(path.join(root, relative)), {recursive:true});
    fs.copyFileSync(path.join(legacyRoot, relative), path.join(root, relative)); assets.push(relative);
  }
  report.with_original = questions.filter(q => q.original_status === "available").length;
  report.text_only = questions.length - report.with_original;
  report.unique_question_assets = hashCache.size;
  report.issue_counts = Object.fromEntries(["missing", "remote", "unsafe"].map(status => [status, report.issues.filter(issue => issue.status === status).length]));
  const meta = {release:false, local_preview:true, build_id:buildId, asset_layout:"bundled", source_kind:options.catalogue ? "catalogue" : "legacy", part_count:questions.length,
    original_count:report.with_original, text_only_count:report.text_only, reporting_enabled:false};
  for (const key of ["code_names", "text_tokens", "paper_reports"]) if (sourceMeta[key]) meta[key] = safeValue(sourceMeta[key]);
  const catalogueText = "window.CHEMISTRY_META = " + JSON.stringify(meta, null, 2) + ";\nwindow.CHEMISTRY_QUESTIONS = " + JSON.stringify(questions, null, 2) + ";\n";
  ensure(!hasLocalPathValue({meta, questions}), "Source filesystem path leaked into served catalogue");
  fs.writeFileSync(path.join(root, "chemistry-catalogue.js"), catalogueText); assets.push("chemistry-catalogue.js");
  report.verified_references = validateBundle(root, questions, assets);
  ensure(crypto.createHash("sha256").update(fs.readFileSync(catalogue)).digest("hex") === catalogueHash, "Source catalogue changed during assembly; rebuild from the completed delivery");
  if (donor) ensure(loadCatalogue(donorPath).sha256 === donor.sha256, "Legacy mastery categories changed during assembly");
  const reportPath = path.join(outputRoot, buildId + "-report.json");
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2) + "\n");
  const latest = {root, build_id:buildId, release:false, report:reportPath, parts:questions.length, with_original:report.with_original, text_only:report.text_only};
  const pointer = path.join(outputRoot, buildId + "-latest.tmp");
  fs.writeFileSync(pointer, JSON.stringify(latest, null, 2) + "\n");
  fs.renameSync(pointer, path.join(outputRoot, "latest.json"));
  return {latest, report, meta, questions};
}
function parseArgs(args) {
  const options = {}, flags = {"--catalogue":"catalogue", "--assets-root":"assetsRoot", "--legacy-root":"legacyRoot", "--output-root":"outputRoot"};
  for (let i = 0; i < args.length; i++) {
    ensure(flags[args[i]], "Unknown option (this tool is preview-only): " + args[i]);
    ensure(args[i + 1] && !args[i + 1].startsWith("--"), "Missing option value: " + args[i]);
    options[flags[args[i]]] = args[++i];
  }
  return options;
}
if (require.main === module) {
  try { const result = assemble(parseArgs(process.argv.slice(2))); console.log(JSON.stringify(result.latest, null, 2)); console.log("Assets:", result.report.unique_question_assets, "Issues:", JSON.stringify(result.report.issue_counts)); }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}
module.exports = {assemble, loadCatalogue, resolveAsset, assetRequests, validateBundle, parseArgs, inside, hasLocalPath, hasLocalPathValue, preserveMasteryCategory};
