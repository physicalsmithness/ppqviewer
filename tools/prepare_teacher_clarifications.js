/* Stage the clarification feature over the downloaded live TeacherViewer source.
   Separate proposed canonical copies preserve its unrelated unpublished work. */
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const root = path.resolve(__dirname, '..');
const dir = path.join(root, 'integration/teacher-clarifications');
const canonical = 'C:/Claude (not on Gdrive, nor OneDrive)/TeacherViewer';
const endpoint = process.argv[2] || '__OWNER_ENDPOINT__';
const mode = process.argv[3] || 'teacher';
if (endpoint !== '__OWNER_ENDPOINT__' && !/^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(endpoint)) throw Error('Invalid endpoint');
if (!['teacher', 'owner'].includes(mode)) throw Error('Invalid deployment role');
const read = p => fs.readFileSync(p, 'utf8').replace(/\r\n/g, '\n');
const moduleCode = read(path.join(dir, 'Clarifications.gs')).replace('__OWNER_ENDPOINT__', endpoint);
const panel = read(path.join(dir, 'teacher-panel.js'));
const MODULE_BEGIN='// PPQ TEACHER CLARIFICATIONS MODULE BEGIN', MODULE_END='// PPQ TEACHER CLARIFICATIONS MODULE END';
const PANEL_BEGIN='<!-- PPQ TEACHER CLARIFICATIONS PANEL BEGIN -->', PANEL_END='<!-- PPQ TEACHER CLARIFICATIONS PANEL END -->';
const sha = s => crypto.createHash('sha256').update(s).digest('hex');
const occurrences=(text,part)=>text.split(part).length-1;
function replaceOnce(text, from, to) {
  if (text.split(from).length !== 2) throw Error('Source changed: ' + from.slice(0, 60));
  return text.replace(from, to);
}
function applyKnown(text,from,to){
  if(occurrences(text,to)===1){const rest=text.replace(to,'');if(rest.includes(from)||rest.includes(to))throw Error('Duplicate installed guard: '+from.slice(0,60));return text;}
  return replaceOnce(text,from,to);
}
function stripModule(text){
  if(text.includes(MODULE_BEGIN)||text.includes(MODULE_END)){
    if(occurrences(text,MODULE_BEGIN)!==1||occurrences(text,MODULE_END)!==1)throw Error('Ambiguous clarification module markers');
    const start=text.indexOf(MODULE_BEGIN),end=text.indexOf(MODULE_END);
    if(end<start||text.slice(end+MODULE_END.length).trim())throw Error('Unexpected source after clarification module');
    const before=text.slice(0,start);if(before.includes('function tvHelpInbox(')||before.includes('/* Teacher-reviewed public Q&A.'))throw Error('Duplicate clarification module');
    return before.trimEnd();
  }
  const marker="/* Teacher-reviewed public Q&A. Add beside TeacherViewer's Code.gs.";
  if(!text.includes(marker)){if(text.includes('function tvHelpInbox('))throw Error('Unknown installed clarification module');return text.trimEnd();}
  if(occurrences(text,marker)!==1)throw Error('Duplicate clarification module');
  const start=text.indexOf(marker),previous=text.slice(start).trim().replace(/var TV_HELP_OWNER_URL = '[^']*';/,"var TV_HELP_OWNER_URL = '__OWNER_ENDPOINT__';");
  // Recognise the exact unmarked installation made on 12 September; future
  // installations carry explicit module boundaries for safe replacement.
  if(sha(previous)!=='dff881f1f5be8b66dd39122fd81060693b13979750fe83a6073915e29f1ea732')throw Error('Unknown unmarked clarification module');
  return text.slice(0,start).trimEnd();
}
function server(text) {
  text = stripModule(text);
  text = applyKnown(text, 'var RESERVED_TABS = {', 'var RESERVED_TABS = { ppq_help_requests: true, ppq_help_replies: true, ppq_help_nonces: true,');
  text = applyKnown(text, 'function doPost(e) {\n  try {',
    'function doPost(e) {\n  try {\n    var help = helpDoPost_(JSON.parse(e.postData.contents));\n    if (help !== null) return jsonOut_(help);');
  text = applyKnown(text, 'function doGet() {',
    'function doGet(e) {\n  var help = helpPublicGetOutput_(e && e.parameter || {});\n  if (help !== null) return help;');
  text = applyKnown(text, "  if (!email) { try { email = Session.getEffectiveUser().getEmail() || ''; } catch (err2) {} }\n", '  // An owner-run public endpoint must never authenticate its anonymous visitor as the owner.\n');
  text = applyKnown(text, "  if (!project) throw new Error('tvGetRows needs a project');", "  if (!project) throw new Error('tvGetRows needs a project');\n  if (/^ppq_help_(requests|replies|nonces)$/.test(sanitizeTab_(project).toLowerCase())) throw new Error('Use the authorised clarification queue.');");
  for(const token of ['ppq_help_requests: true','ppq_help_replies: true','ppq_help_nonces: true','helpDoPost_(','helpPublicGetOutput_(','Use the authorised clarification queue.'])if(occurrences(text,token)!==1)throw Error('Unknown or duplicate clarification guard: '+token);
  if(text.includes('Session.getEffectiveUser()'))throw Error('Unknown effective-user authentication form');
  return text.trimEnd() + '\n\n' + MODULE_BEGIN + '\n' + moduleCode.trimEnd() + '\n' + MODULE_END + '\n';
}
function html(text) {
  if(text.includes(PANEL_BEGIN)||text.includes(PANEL_END)){
    if(occurrences(text,PANEL_BEGIN)!==1||occurrences(text,PANEL_END)!==1)throw Error('Ambiguous teacher panel markers');
    const start=text.indexOf(PANEL_BEGIN),end=text.indexOf(PANEL_END);if(end<start)throw Error('Invalid teacher panel markers');
    text=text.slice(0,start)+text.slice(end+PANEL_END.length).replace(/^\n/,'');
  }else{
    const marker='/* Optional TeacherViewer extension.';
    if(text.includes(marker)){
      if(occurrences(text,marker)!==1)throw Error('Duplicate teacher panel');
      const at=text.indexOf(marker),start=text.lastIndexOf('<script>',at),end=text.indexOf('</script>',at);
      if(start<0||end<0||text.slice(start+8,at).trim()||sha(text.slice(at,end).trim())!=='baebf8decf51e3f80d30ce86fc5fa2dd213c17f6481236580bdfb06951f1c412')throw Error('Unknown unmarked teacher panel');
      text=text.slice(0,start)+text.slice(end+9).replace(/^\n/,'');
    }
  }
  if(text.includes('TeacherClarificationsPanel')||text.includes('/* Optional TeacherViewer extension.'))throw Error('Unknown or duplicate installed teacher panel');
  return replaceOnce(text, '</body>', PANEL_BEGIN+'\n<script>\n'+panel.trimEnd()+'\n</script>\n'+PANEL_END+'\n</body>');
}
const targets = [
  { name: 'staged', code: path.join(dir, 'remote-before/Code.js'), html: path.join(dir, 'remote-before/teacherviewer.html') },
  { name: 'canonical-proposed', code: path.join(canonical, 'shared_script/teacher-tracking.gs'), html: path.join(canonical, 'app/teacherviewer.html') }
];
const receipts = [];
for (const t of targets) {
  const out = path.join(dir, t.name); fs.mkdirSync(out, { recursive: true });
  const codeIn = read(t.code), htmlIn = read(t.html);
  fs.writeFileSync(path.join(out, 'Code.js'), server(codeIn));
  fs.writeFileSync(path.join(out, 'teacherviewer.html'), html(htmlIn));
  const manifest = JSON.parse(read(path.join(dir, 'remote-before/appsscript.json')));
  manifest.oauthScopes.push('https://www.googleapis.com/auth/script.external_request');
  manifest.webapp = mode === 'owner' && t.name === 'staged'
    ? { executeAs: 'USER_DEPLOYING', access: 'ANYONE_ANONYMOUS' }
    : { executeAs: 'USER_ACCESSING', access: 'ANYONE' };
  fs.writeFileSync(path.join(out, 'appsscript.json'), JSON.stringify(manifest, null, 2) + '\n');
  if (t.name === 'staged') fs.writeFileSync(path.join(out, '.clasp.json'), JSON.stringify({ scriptId: '1eEhqf-sdvuuD0dtWke608DuJv9vHGYuI2sKcmqhagHpRZWWiHZlyICXn', rootDir: '.' }) + '\n');
  receipts.push({ target: t.name, sourceCode: t.code, sourceHtml: t.html, sourceCodeSha256: sha(codeIn), sourceHtmlSha256: sha(htmlIn), codeSha256: sha(server(codeIn)), htmlSha256: sha(html(htmlIn)) });
}
fs.writeFileSync(path.join(dir, 'staging-receipt.json'), JSON.stringify({ prepared_at: new Date().toISOString(), endpoint, mode, receipts }, null, 2) + '\n');
console.log('Prepared teacher clarification source for ' + mode + '; ' + targets.length + ' isolated copies.');
