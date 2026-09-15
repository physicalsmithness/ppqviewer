/* Teacher-reviewed public Q&A. Add beside TeacherViewer's Code.gs.
 * Public request and read routes run only on the dedicated owner deployment.
 * Teacher functions require an actual active Google account, never the owner fallback.
 */
var TV_HELP_OWNER_URL = '__OWNER_ENDPOINT__';
var TV_HELP_REQUESTS_TAB = 'ppq_help_requests';
var TV_HELP_REPLIES_TAB = 'ppq_help_replies';
var TV_HELP_NONCES_TAB = 'ppq_help_nonces';
var TV_HELP_SECRET_KEY = 'TV_HELP_RELAY_SECRET';
var TV_HELP_STORAGE_SECRET_KEY = 'TV_HELP_STORAGE_SECRET';
var TV_HELP_REQUEST_HEADERS = ['request_id','project','item_id','question_json','source_label_json','source_url','source_context_json','created_at','row_signature'];
var TV_HELP_REPLY_HEADERS = ['id','request_id','project','item_id','question_json','answer_json','published_at','source_label_json','source_url','row_signature'];
var TV_HELP_NONCE_HEADERS = ['nonce','used_at','payload_hash','row_signature'];

function helpDoGet_(params) {
  params = params || {};
  var action = String(params.action || '');
  if (action.indexOf('ppq_help_') !== 0) return null;
  try {
    var project = helpProject_(params.project);
    if (action === 'ppq_help_list') {
      var item = helpItem_(params.item_id);
      return {ok:true,replies:helpPublicReplies_().filter(function(r){return r.project === project && r.item_id === item;})};
    }
    if (action === 'ppq_help_status') {
      var ids = String(params.request_ids || '').split(',');
      if (!ids.length || ids.length > 50) throw new Error('Provide 1 to 50 request IDs.');
      ids = ids.map(helpUuid_).filter(function(id,i,all){return all.indexOf(id) === i;});
      var requests = helpRequestRows_(), replies = helpPublicReplies_();
      return {ok:true,requests:ids.map(function(id){
        var request = requests.filter(function(r){return r.request_id === id && r.project === project;})[0];
        var answered = replies.some(function(r){return r.request_id === id && r.project === project;});
        return {request_id:id,status:request ? (answered ? 'answered' : 'pending') : 'not_found'};
      }),replies:replies.filter(function(r){return r.project === project && ids.indexOf(r.request_id) >= 0;})};
    }
    throw new Error('Unsupported clarification action.');
  } catch (error) { return helpError_(error); }
}

function helpPublicGetOutput_(params) {
  params = params || {};
  if (String(params.action || '').indexOf('ppq_help_') !== 0) return null;
  var callback = params.callback, result;
  if (callback != null && (!/^[A-Za-z_$][A-Za-z0-9_$]{0,63}$/.test(String(callback)) || /^(break|case|catch|class|const|continue|debugger|default|delete|do|else|export|extends|finally|for|function|if|import|in|instanceof|let|new|return|super|switch|this|throw|try|typeof|var|void|while|with|yield|await|enum|null|true|false)$/.test(String(callback)))) {
    return ContentService.createTextOutput(JSON.stringify({ok:false,error:'Invalid callback.'})).setMimeType(ContentService.MimeType.JSON);
  }
  result = helpDoGet_(params);
  var json = JSON.stringify(result).replace(/</g,'\\u003c').replace(/\u2028/g,'\\u2028').replace(/\u2029/g,'\\u2029');
  return ContentService.createTextOutput(callback ? String(callback)+'('+json+');' : json)
    .setMimeType(callback ? ContentService.MimeType.JAVASCRIPT : ContentService.MimeType.JSON);
}

function helpDoPost_(raw) {
  var action = raw && String(raw.action || '');
  if (!action || action.indexOf('ppq_help_') !== 0) return null;
  try {
    if (action === 'ppq_help_request') return helpCreateRequest_(raw);
    if (action === 'ppq_help_publish') return helpReceivePublication_(raw);
    throw new Error('Unsupported clarification action.');
  } catch (error) { return helpError_(error); }
}

function helpError_(error) { return {ok:false,error:String(error && error.message || error)}; }
function helpKeys_(value, allowed) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Expected an object.');
  Object.keys(value).forEach(function(key){if (allowed.indexOf(key) < 0) throw new Error('Unsupported field: ' + key);});
}
function helpText_(value, max, required) {
  if (typeof value !== 'string' || value.length > max || /[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/.test(value)) throw new Error('Invalid or oversized text.');
  var text = value.replace(/\r\n?/g,'\n').trim();
  if (required && !text) throw new Error('Text is required.');
  return text;
}
function helpProject_(value) {
  if (typeof value !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9_.-]{0,79}$/.test(value)) throw new Error('Invalid project.');
  if ([TV_HELP_REQUESTS_TAB,TV_HELP_REPLIES_TAB,TV_HELP_NONCES_TAB].indexOf(value) >= 0 || (typeof RESERVED_TABS !== 'undefined' && RESERVED_TABS[value])) throw new Error('Reserved project.');
  return value;
}
function helpItem_(value) {
  if (typeof value !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9_.:()@/+\[\]-]{0,239}$/.test(value)) throw new Error('Invalid source item ID.');
  return value;
}
function helpUuid_(value) {
  if (typeof value !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)) throw new Error('Invalid request ID.');
  return value.toLowerCase();
}
function helpUrl_(value, relative) {
  value = helpText_(value == null ? '' : value,2048,false);
  if (!value) return '';
  if (/\s|[<>"'\\]/.test(value)) throw new Error('Invalid source URL.');
  if (/^https:\/\//i.test(value)) {
    var authority = value.slice(8).split(/[/?#]/)[0];
    if (!authority || /@/.test(authority)) throw new Error('Invalid source URL.');
    return value;
  }
  if (relative && /^(?:\.\/)?[A-Za-z0-9_-][A-Za-z0-9_./%()-]*\.(?:png|jpe?g|webp)$/i.test(value) && !/(?:^|\/)\.\.(?:\/|$)/.test(value)) return value;
  throw new Error('A secure source URL is required.');
}
function helpPublicUrl_(url) {
  if (!url) return '';
  var base = url.split(/[?#]/)[0], query = url.indexOf('?') < 0 ? '' : url.split('?')[1].split('#')[0];
  var kept = query.split('&').filter(function(part){
    var eq = part.indexOf('='), key = eq < 0 ? '' : part.slice(0,eq), value = eq < 0 ? '' : part.slice(eq+1);
    return /^(topic|part|id|course)$/.test(key) && /^[A-Za-z0-9_.%:()+-]{1,240}$/.test(value);
  });
  return base + (kept.length ? '?' + kept.join('&') : '');
}
function helpContext_(value) {
  if (value == null) return {};
  var ids = ['id','parent_id','source_part_id','source_group_id'];
  var images = ['question_images','context_images','markscheme_images'];
  helpKeys_(value,ids.concat(images));
  var out = {};
  ids.forEach(function(key){if (value[key] != null && value[key] !== '') out[key] = helpItem_(value[key]);});
  images.forEach(function(key){
    if (value[key] == null) return;
    if (!Array.isArray(value[key]) || value[key].length > 24) throw new Error('Too many source images.');
    out[key] = value[key].map(function(url){return helpUrl_(url,true);});
  });
  if (JSON.stringify(out).length > 24000) throw new Error('Source context is too large.');
  return out;
}
function helpCanonical_(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return '[' + value.map(helpCanonical_).join(',') + ']';
  return '{' + Object.keys(value).sort().map(function(key){return JSON.stringify(key)+':'+helpCanonical_(value[key]);}).join(',') + '}';
}
function helpNow_() { return new Date().toISOString(); }
function helpLock_(run) {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try { return run(); } finally { lock.releaseLock(); }
}
function helpSheet_(name,headers,create) {
  var ss = SpreadsheetApp.getActive(), sheet = ss.getSheetByName(name);
  if (!sheet && create) { sheet = ss.insertSheet(name); sheet.appendRow(headers); sheet.setFrozenRows(1); }
  if (!sheet) return null;
  var first = sheet.getDataRange().getValues()[0] || [];
  // The pinned legacy writer can append wider rows, padding the header with
  // empty cells. Accept that padding, but never a changed or extended schema.
  if (JSON.stringify(first.slice(0,headers.length)) !== JSON.stringify(headers) || first.slice(headers.length).some(function(value){return value !== '' && value != null;})) throw new Error('Clarification storage headers do not match.');
  return sheet;
}
function helpRows_(name,headers) {
  var sheet = helpSheet_(name,headers,false);
  if (!sheet) return [];
  var secret = PropertiesService.getScriptProperties().getProperty(TV_HELP_STORAGE_SECRET_KEY);
  if (!secret) return [];
  return sheet.getDataRange().getValues().slice(1).filter(function(row){return row[0];}).map(function(row){
    var out = {}; headers.forEach(function(key,i){out[key] = row[i] instanceof Date ? row[i].toISOString() : String(row[i] == null ? '' : row[i]);});
    if (!/^[0-9a-f]{64}$/.test(out.row_signature) || !helpSameSignature_(out.row_signature,helpStorageSignature_(name,headers,out,secret))) return null;
    return out;
  }).filter(function(row){return row !== null;});
}
function helpStorageSignature_(name,headers,record,secret) {
  return helpSignature_({storage_version:1,tab:name,values:headers.filter(function(key){return key !== 'row_signature';}).map(function(key){return String(record[key] == null ? '' : record[key]);})},secret);
}
function helpAppend_(name,headers,record) {
  var secret = PropertiesService.getScriptProperties().getProperty(TV_HELP_STORAGE_SECRET_KEY);
  if (!secret) throw new Error('Clarification storage has not been initialised.');
  record.row_signature = helpStorageSignature_(name,headers,record,secret);
  helpSheet_(name,headers,true).appendRow(headers.map(function(key){return record[key] == null ? '' : record[key];}));
}
function helpInitialiseStorageSecret_() {
  // Called inside the owner request route's lock, after validating a real request.
  // This separate key cannot authorise teacher publication.
  var props = PropertiesService.getScriptProperties();
  if (!props.getProperty(TV_HELP_STORAGE_SECRET_KEY)) props.setProperty(TV_HELP_STORAGE_SECRET_KEY,Utilities.getUuid().replace(/-/g,'')+Utilities.getUuid().replace(/-/g,''));
}
function helpStoredJson_(text) { try { return JSON.parse(text); } catch (_) { throw new Error('Clarification storage contains an unreadable record.'); } }
function helpRequestRows_() {
  return helpRows_(TV_HELP_REQUESTS_TAB,TV_HELP_REQUEST_HEADERS).map(function(row){return {
    request_id:row.request_id,project:row.project,item_id:row.item_id,question:helpStoredJson_(row.question_json),
    source_label:helpStoredJson_(row.source_label_json),source_url:row.source_url,source_context:helpStoredJson_(row.source_context_json),created_at:row.created_at
  };});
}
function helpPublicReplies_() {
  // Explicit projection only. Private request text and all future extra columns
  // are never merged into this public response. Only the latest publication of
  // each request is public: a correction must also remove superseded text.
  var latest = {};
  helpRows_(TV_HELP_REPLIES_TAB,TV_HELP_REPLY_HEADERS).forEach(function(row){latest[row.request_id] = {
    id:row.id,request_id:row.request_id,project:row.project,item_id:row.item_id,
    question:helpStoredJson_(row.question_json),answer:helpStoredJson_(row.answer_json),published_at:row.published_at,
    source_label:helpStoredJson_(row.source_label_json),source_url:row.source_url
  };});
  return Object.keys(latest).map(function(id){return latest[id];});
}
function helpCreateRequest_(raw) {
  helpKeys_(raw,['action','request_id','project','item_id','question','source_label','source_url','source_context']);
  var request = {request_id:helpUuid_(raw.request_id),project:helpProject_(raw.project),item_id:helpItem_(raw.item_id),
    question:helpText_(raw.question,4000,true),source_label:helpText_(raw.source_label || '',400,false),
    source_url:helpUrl_(raw.source_url,false),source_context:helpContext_(raw.source_context)};
  return helpLock_(function(){
    helpInitialiseStorageSecret_();
    var old = helpRequestRows_().filter(function(r){return r.request_id === request.request_id;})[0];
    if (old) {
      var withoutDate = {}; Object.keys(request).forEach(function(key){withoutDate[key] = old[key];});
      if (helpCanonical_(withoutDate) !== helpCanonical_(request)) throw new Error('This request ID already belongs to a different request.');
    } else helpAppend_(TV_HELP_REQUESTS_TAB,TV_HELP_REQUEST_HEADERS,{request_id:request.request_id,project:request.project,item_id:request.item_id,
      question_json:JSON.stringify(request.question),source_label_json:JSON.stringify(request.source_label),source_url:request.source_url,
      source_context_json:helpCanonical_(request.source_context),created_at:helpNow_()});
    var answered = helpPublicReplies_().some(function(r){return r.request_id === request.request_id;});
    return {ok:true,request_id:request.request_id,status:answered ? 'answered' : 'pending'};
  });
}
function helpActiveTeacher_() {
  var email = String(Session.getActiveUser().getEmail() || '').trim().toLowerCase();
  if (!email || !isAllowlisted_(email)) throw new Error('An authorised teacher must sign in.');
  return email;
}
function helpProjectAllowed_(email,project) {
  var scope = teacherScope_(email);
  if (!scope.projects) return true;
  var subject = String((registryMap_()[project] || {}).subject || '').toLowerCase();
  return scope.projects.indexOf(project.toLowerCase()) >= 0 || !!(subject && scope.projects.indexOf(subject) >= 0);
}
function tvHelpInbox() {
  var email = helpActiveTeacher_(), replies = helpPublicReplies_();
  return {ok:true,requests:helpRequestRows_().filter(function(request){return helpProjectAllowed_(email,request.project);}).map(function(request){
    var found = replies.filter(function(reply){return reply.request_id === request.request_id;}), reply = found.length ? found[found.length-1] : null;
    request.status = reply ? 'answered' : 'pending';request.reply = reply;return request;
  })};
}
function helpPublishFields_(value,request) {
  var question = helpText_(value.question,4000,true), answer = helpText_(value.answer,12000,true);
  if (value.reviewed_public_question !== true) throw new Error('Review the public question and answer for pupil names before publishing.');
  return {question:question,answer:answer};
}
function helpSecretForTeacher_() {
  helpActiveTeacher_();
  return helpLock_(function(){
    var props = PropertiesService.getScriptProperties(), secret = props.getProperty(TV_HELP_SECRET_KEY);
    if (!secret) { secret = Utilities.getUuid().replace(/-/g,'') + Utilities.getUuid().replace(/-/g,'');props.setProperty(TV_HELP_SECRET_KEY,secret); }
    return secret;
  });
}
function helpHex_(bytes) { return bytes.map(function(byte){return ('0'+(byte&255).toString(16)).slice(-2);}).join(''); }
function helpSignature_(payload,secret) { return helpHex_(Utilities.computeHmacSha256Signature(helpCanonical_(payload),secret,Utilities.Charset.UTF_8)); }
function helpSameSignature_(a,b) { if (typeof a !== 'string' || a.length !== b.length) return false;var diff = 0;for(var i=0;i<a.length;i++) diff |= a.charCodeAt(i)^b.charCodeAt(i);return diff === 0; }
function tvHelpPublish(input) {
  var email = helpActiveTeacher_();helpKeys_(input,['request_id','question','answer','reviewed_public_question']);
  var id = helpUuid_(input.request_id), request = helpRequestRows_().filter(function(r){return r.request_id === id;})[0];
  if (!request || !helpProjectAllowed_(email,request.project)) throw new Error('This clarification is unavailable.');
  var fields = helpPublishFields_(input,request);
  if (!/^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(TV_HELP_OWNER_URL)) throw new Error('The clarification publisher has not been configured.');
  var payload = {operation:'publish',timestamp:Date.now(),nonce:Utilities.getUuid().toLowerCase(),teacher:email,
    request_id:id,question:fields.question,answer:fields.answer,reviewed_public_question:true};
  var envelope = {action:'ppq_help_publish',payload:payload,signature:helpSignature_(payload,helpSecretForTeacher_())};
  var response = UrlFetchApp.fetch(TV_HELP_OWNER_URL,{method:'post',contentType:'application/json',payload:JSON.stringify(envelope),muteHttpExceptions:true,followRedirects:true});
  var result;try { result = JSON.parse(response.getContentText()); } catch (_) { throw new Error('The publisher returned an unreadable response. Your draft is unchanged.'); }
  if (response.getResponseCode() !== 200 || !result || result.ok !== true || !result.reply) throw new Error(result && result.error || 'The reply could not be published.');
  return {ok:true,reply:result.reply};
}
function helpReceivePublication_(raw) {
  helpKeys_(raw,['action','payload','signature']);
  var payload = raw.payload;helpKeys_(payload,['operation','timestamp','nonce','teacher','request_id','question','answer','reviewed_public_question']);
  var age = Date.now()-payload.timestamp;
  if (payload.operation !== 'publish' || !Number.isInteger(payload.timestamp) || age > 300000 || age < -30000) throw new Error('Expired publication authorisation.');
  helpText_(payload.question,4000,true);helpText_(payload.answer,12000,true);
  helpUuid_(payload.nonce);helpUuid_(payload.request_id);
  if (typeof payload.teacher !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.teacher) || payload.teacher.length > 254) throw new Error('Invalid teacher authorisation.');
  if (typeof raw.signature !== 'string' || !/^[0-9a-f]{64}$/.test(raw.signature)) throw new Error('Invalid publication signature.');
  var secret = PropertiesService.getScriptProperties().getProperty(TV_HELP_SECRET_KEY);
  if (!secret || !helpSameSignature_(raw.signature,helpSignature_(payload,secret))) throw new Error('Invalid publication signature.');
  return helpLock_(function(){
    if (helpRows_(TV_HELP_NONCES_TAB,TV_HELP_NONCE_HEADERS).some(function(row){return row.nonce === payload.nonce;})) throw new Error('Publication authorisation has already been used.');
    var request = helpRequestRows_().filter(function(row){return row.request_id === payload.request_id;})[0];
    if (!request || !isAllowlisted_(payload.teacher) || !helpProjectAllowed_(payload.teacher,request.project)) throw new Error('This clarification is unavailable.');
    var fields = helpPublishFields_(payload,request);
    var existing = helpPublicReplies_().filter(function(reply){return reply.request_id === request.request_id && reply.question === fields.question && reply.answer === fields.answer;});
    var reply = existing.length ? existing[existing.length-1] : {id:Utilities.getUuid().toLowerCase(),request_id:request.request_id,project:request.project,item_id:request.item_id,
      question:fields.question,answer:fields.answer,published_at:helpNow_(),source_label:request.project+' · '+request.item_id,source_url:helpPublicUrl_(request.source_url)};
    if (!existing.length) helpAppend_(TV_HELP_REPLIES_TAB,TV_HELP_REPLY_HEADERS,{id:reply.id,request_id:reply.request_id,project:reply.project,item_id:reply.item_id,
      question_json:JSON.stringify(reply.question),answer_json:JSON.stringify(reply.answer),published_at:reply.published_at,source_label_json:JSON.stringify(reply.source_label),source_url:reply.source_url});
    helpAppend_(TV_HELP_NONCES_TAB,TV_HELP_NONCE_HEADERS,{nonce:payload.nonce,used_at:helpNow_(),payload_hash:helpHex_(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,helpCanonical_(payload),Utilities.Charset.UTF_8))});
    return {ok:true,reply:reply};
  });
}
