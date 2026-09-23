/* E1/E2 consumer readiness using the real page, engine and config. No network,
   assessment records, source archive or generated release files are written. */
"use strict";
const assert=require('node:assert/strict'),fs=require('fs'),path=require('path'),{JSDOM}=require('jsdom');
const ROOT=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
const html=read('example/physics.html'),scripts=['engine/ppqviewer.js','example/physics-identity.js','example/physics-login.js','example/physics-config.js'].map(read);
const labels={'A.1':'Kinematics','A.5':'Galilean and special relativity','C.1':'Simple harmonic motion','D.2':'Electric and magnetic fields','E.1':'Structure of the atom','E.2':'Quantum physics'};
const clone=x=>JSON.parse(JSON.stringify(x)),opened=[];
const group=topic=>({code:topic==='E.1'?'atomic_review_2026:family:levels':topic==='E.2'?'quantum_review_2026:family:photons':topic.replace('.','')+'.family',topic,label:labels[topic]+' group',summary:'Read the supplied quantities.',checks:['Check the units.']});
const atom=topic=>({code:topic==='E.1'?'atomic_review_2026:type:levels':topic==='E.2'?'quantum_review_2026:type:photons':topic.replace('.','')+'.type',topic,display_code:topic.replace('.','')+'.1',label:labels[topic]+' type',summary:'Use the information in this question.',checks:['Keep the source quantities.']});
const groups=Object.keys(labels).map(group),atoms=Object.keys(labels).map(atom);
function part(id,topics,{paper='2',year='2025',typed=true}={}){
 return {id,parent_id:id,source_part_id:'fixture-'+id,topic_codes:topics,analysis_groups:topics.map(t=>group(t).code),analysis_atoms:typed?topics.map(t=>atom(t).code):[],analysis_types:[],year,paper,level:'SL',question_number:id,label:'(a)',marks:2,question_images:['assets/'+id+'.png'],context_images:[],markscheme_images:['assets/'+id+'-ms.png']};
}
const records=[...['A.1','A.5','C.1','D.2'].map(t=>part(t,[t])),part('atomic-old',['E.1'],{paper:'3',year:'2012'}),part('shared',['E.1','E.2']),part('quantum',['E.2']),part('quantum-untyped',['E.2'],{typed:false})];
Object.assign(records.find(q=>q.id==='shared'),{practice_scope_notes:['Practise the current component of this mixed question; use the original markscheme to check your work.'],source_notice:'Teacher preview: reserved school test details must remain private.'});
const meta={course:'ib',release:true,title:'IB Physics past-paper question viewer',default_topic:'A.5',topics:labels,analysis:{groups,atoms,types:[]},topic_mapping_counts:Object.fromEntries(Object.keys(labels).map(topic=>[topic,{parts:records.filter(q=>q.topic_codes.includes(topic)).length,typed_parts:records.filter(q=>q.topic_codes.includes(topic)&&q.analysis_atoms.length).length}]))}; // QoderWork 2026-09-14
let checks=0;
function check(label,fn){fn();checks++;console.log('ok '+label);}
function page(query=''){
 const dom=new JSDOM(html,{url:'https://physics-ui.test/'+query,runScripts:'outside-only',pretendToBeVisual:true}),w=dom.window,calls=[];
 w.PHYSICS_META=clone(meta);w.PHYSICS_QUESTIONS=clone(records);w.confirm=()=>true;
 w.localStorage.setItem('smithics_fields_identity_v1',JSON.stringify({anonymous_id:'smith-e-fixture',display_name:'Smith',signed_in:true,contexts:{physics:{anonymous_id:'smith-e-fixture',display_name:'Smith',cohort:'Test'}}}));
 const reject=(...args)=>{calls.push(args);throw Error('Unexpected network request');};w.fetch=reject;w.XMLHttpRequest=reject;w.navigator.sendBeacon=reject;
 for(const source of scripts)w.eval(source);
 w.PPQ_CONFIG.prefetchAhead=0;w.PPQ_CONFIG.defaultOrder='order';w.PPQ_CONFIG.teacherHelp=null;w.PPQ_CONFIG.problemReport=null;
 for(const match of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g))if(match[1].includes('window.physicsViewer ='))w.eval(match[1]);
 const p={w,dom,calls,root:w.document.getElementById('ppq-root'),v:w.physicsViewer};opened.push(p);return p;
}
const ids=p=>Array.from(p.v._practiceBaseView||p.v.view,q=>q.id).sort();
// d030: secondary topic tags describe co-strands; only the leading topic supplies practice.
const leads=topic=>records.filter(q=>q.topic_codes[0]===topic);
function select(p,label,value){const node=p.root.querySelector('select[aria-label="'+label+'"]');assert(node,label);node.value=value;node.dispatchEvent(new p.w.Event('change',{bubbles:true}));return node;}
const values=(p,label)=>Array.from(p.root.querySelector('select[aria-label="'+label+'"]').options,o=>o.value).filter(v=>v!=='ALL');
try{
 check('E1 and E2 become available topic cards with their exact part counts',()=>{
  const p=page();assert(!p.v);const cards=Array.from(p.root.querySelectorAll('.physics-topics-available article'));
  assert.equal(cards.length,6);
  for(const topic of ['E.1','E.2']){
   const count=leads(topic).length;
   const card=cards.find(c=>c.querySelector('a[href="?topic='+encodeURIComponent(topic)+'"]'));
   assert(card);assert(card.textContent.includes(labels[topic]));assert.equal(card.querySelector('.physics-topic-code').textContent,topic.replace('.',''));assert.equal(card.querySelector('p').textContent,count+' question parts');
  }
  const unavailable=Array.from(p.root.querySelectorAll('.physics-topics-soon article'));assert.equal(unavailable.length,1);assert.match(unavailable[0].textContent,/Data analysis/);assert(!unavailable[0].querySelector('a'));
 });
 check('canonical and short E-topic links open only their own parts',()=>{
  for(const [query,topic]of [['E.1','E.1'],['E1','E.1'],['E.2','E.2'],['e2','E.2']]){
   const p=page('?topic='+query);assert(p.v);assert.deepEqual(ids(p),leads(topic).map(q=>q.id).sort());assert.equal(p.root.querySelector('select[aria-label="topic"]').selectedOptions[0].textContent,topic.replace('.','')+' '+labels[topic]);
  }
 });
 check('explicit topic ownership supports opaque source namespaces and preserves every existing topic',()=>{
  const p=page('?topic=E1');
  for(const topic of Object.keys(labels)){
   select(p,'topic',topic);assert.deepEqual(ids(p),leads(topic).map(q=>q.id).sort());
   assert.deepEqual(values(p,'question type'),[atom(topic).code]);assert.deepEqual(values(p,'question group'),[group(topic).code]);
   const categories=Array.from(p.root.querySelectorAll('.ppq-facet-cat'));assert.equal(categories.length,1);assert.equal(categories[0].dataset.value,atom(topic).code);
   if(topic.startsWith('E.')){assert.match(categories[0].textContent,new RegExp(topic.replace('.','')+'\\.1'));assert(!/review_2026/.test(categories[0].textContent));}
  }
 });
 check('shared E1/E2 parts drill only in their leading topic and untyped E2 parts remain accessible',()=>{
  const p=page('?topic=E2');assert.match(p.root.querySelector('.ppq-dash-facet-content').textContent,/Some questions still need a type/);
  const category=p.root.querySelector('.ppq-facet-cat');assert.equal(Number(category.querySelector('.ppq-cat-count').textContent.replace(/[()]/g,'')),leads('E.2').filter(q=>q.analysis_atoms.length).length);category.click();assert.deepEqual(ids(p),['quantum']);
  p.root.querySelector('.ppq-facet-clear').click();assert.deepEqual(ids(p),['quantum','quantum-untyped']);
  select(p,'topic','ALL');assert.equal(ids(p).length,records.length);assert.equal(ids(p).filter(id=>id==='shared').length,1);
  select(p,'topic','E.1');assert.deepEqual(ids(p),['atomic-old','shared']);
 });
 check('switching E-topic types keeps Key tips closed and preserves the authored guidance',()=>{
  const p=page('?topic=E1');p.root.querySelector('.ppq-facet-cat').click();
  let tips=p.root.querySelector('details.ppq-facet-guidance');assert(tips);assert.equal(tips.open,false);assert.equal(tips.querySelector('summary').textContent,'Key tips');assert.match(tips.textContent,/Keep the source quantities/);tips.open=true;
  select(p,'topic','E.2');p.root.querySelector('.ppq-facet-cat').click();tips=p.root.querySelector('details.ppq-facet-guidance');assert(tips);assert.equal(tips.open,false);
 });
 check('E-topic paper/year filters preserve historic source identity and shared links',()=>{
  const p=page('?topic=E1');select(p,'paper','2');select(p,'year range','2010-2015');assert.deepEqual(ids(p),['atomic-old']);assert.match(p.root.querySelector('.ppq-qid').textContent,/2012.*Paper 3/);
  assert.equal(p.v.cur.paper,'3');assert.equal(p.v.cur.year,'2012');assert.equal(p.v.cur.level,'SL');
  const linked=page('?id=shared');assert.equal(linked.v.cur.id,'shared');assert.deepEqual(Array.from(linked.v.cur.topic_codes),['E.1','E.2']);assert.equal(Object.keys(linked.v.byId).length,records.length);
 });
 check('only reviewed practice-focus notes appear before the question, with private source notes suppressed',()=>{
  const p=page('?id=shared'),note=p.root.querySelector('.ppq-notice');assert(note);
  assert.equal(note.querySelector('b').textContent,'Practice focus');
  assert.equal(note.textContent,'Practice focus '+records.find(q=>q.id==='shared').practice_scope_notes[0]);
  assert(note.compareDocumentPosition(p.root.querySelector('img.ppq-crop'))&p.w.Node.DOCUMENT_POSITION_FOLLOWING,'The focus must be visible before the question image');
  assert(!/Teacher preview|reserved school test/.test(p.root.textContent));
  assert.equal(p.root.querySelectorAll('.ppq-answer-panel.show').length,0,'A practice note must not reveal an answer');
  const safe='Read the <current component> & the printed marks.';
  p.v.render({...p.v.cur,practice_scope_notes:[null,{},'  ',safe]});
  const notes=p.root.querySelectorAll('.ppq-notice');assert.equal(notes.length,1);assert.equal(notes[0].textContent,'Practice focus '+safe);assert(!notes[0].querySelector('current'));
  assert.deepEqual(clone(p.v.cfg.noticesOf({practice_scope_notes:'not a reviewed array',source_notice:'Teacher/test note'})),[]);
  p.v.render({...records.find(q=>q.id==='quantum'),source_notice:'Teacher/test note'});assert.equal(p.root.querySelectorAll('.ppq-notice').length,0);assert(!p.root.textContent.includes('Teacher/test note'));
 });
 check('co-strand panel names both topics of a shared part, main first, and stays hidden for one topic',()=>{ // QoderWork 2026-09-14
  const p=page('?id=shared'),box=p.root.querySelector('.ppq-also-studied');
  assert(box&&!box.hidden,'A shared E1/E2 part shows the also-studied panel');
  const items=Array.from(box.querySelectorAll('.ppq-also-studied-item')).map(n=>n.textContent);
  assert.equal(items.length,2);
  assert.equal(items[0],'Main: E1 Structure of the atom — Structure of the atom group');
  assert.equal(items[1],'Also: E2 Quantum physics — Quantum physics group');
  assert(box.querySelector('.ppq-also-studied-main'),'The main strand is emphasised');
  assert.equal(p.root.querySelectorAll('.ppq-notice').length,1,'The co-strand panel adds no practice-focus notice');
  const single=page('?id=quantum'),sbox=single.root.querySelector('.ppq-also-studied');
  assert(sbox&&sbox.hidden&&!sbox.textContent.trim(),'A single-topic part keeps the panel hidden');
 });
 check('navigation does not create attempts, send requests, or mutate supplied taxonomy and source records',()=>{
  for(const p of opened){assert.equal(p.calls.length,0);if(p.v)assert.equal(p.v.store.attempts.length,0);assert.equal(JSON.stringify(p.w.PHYSICS_QUESTIONS),JSON.stringify(records));assert.equal(JSON.stringify(p.w.PHYSICS_META),JSON.stringify(meta));}
 });
 console.log(checks+' E1/E2 consumer readiness journeys passed');
}finally{for(const p of opened){if(p.w.physicsLogin)p.w.physicsLogin.destroy();if(p.v)p.v.destroy();p.dom.window.close();}}
