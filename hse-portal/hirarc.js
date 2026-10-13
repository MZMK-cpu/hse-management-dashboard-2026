
(function(){
'use strict';
const KEY='fgvt_hse_one_demo_v01';
const DEFAULT_COMPANY='FGV Transport Services Sdn Bhd';
const $=id=>document.getElementById(id);
const escape=s=>String(s===undefined||s===null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=d=>d&&/^\d{4}-\d\d-\d\d$/.test(d)?d.split('-').reverse().join('/'):(d||'—');
const clone=x=>JSON.parse(JSON.stringify(x));
const metaIds=['company','department','assessDate','station','scope','title','assessor','reviewDate'];
const requiredMeta=['company','department','assessDate','station','scope','title'];
const labels={
 activity:'Aktiviti Kerja',hazard:'Bahaya / Hazard',effect:'Risiko / Kesan',
 existing:'Kawalan Sedia Ada',l:'Likelihood (L)',s:'Severity (S)',
 control:'Cadangan Kawalan Tambahan',hierarchy:'Hierarki Kawalan',
 owner:'Pegawai Bertanggungjawab',due:'Tarikh Tindakan',
 rl:'Likelihood Baki',rs:'Severity Baki'
};
const risk=(l,s)=>{const score=Number(l)*Number(s);return Number(l)&&Number(s)?score:0;};
const riskInfo=v=>!v?{text:'BELUM DINILAI',type:'none'}:v<=4?{text:'RENDAH',type:'low'}:v<=12?{text:'SEDERHANA',type:'medium'}:{text:'TINGGI',type:'high'};
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,6);
let step=1, editingId=null, existingRecord=null, saved=false;
let metadata={},hazards=[newHazard()];

function newHazard(){return {
 uid:uid(),activity:'',hazard:'',effect:'',existing:'',l:'',s:'',
 control:'',hierarchy:'',owner:'',due:'',rl:'',rs:''
};}
function today(){
 const d=new Date();
 return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');
}
function toast(message){
 const node=$('toast');node.textContent=message;node.classList.remove('hidden');
 clearTimeout(window.hirarcToast);window.hirarcToast=setTimeout(()=>node.classList.add('hidden'),4500);
}
function getMeta(){return Object.fromEntries(metaIds.map(id=>[id,$(id).value.trim()]));}
function populateMeta(m){metaIds.forEach(id=>{if(m&&m[id]!=null)$(id).value=m[id];});}
function showStep(n){
 step=n;
 ['stepOne','stepTwo','stepThree'].forEach((id,i)=>$(id).classList.toggle('hidden',i+1!==n));
 document.querySelectorAll('[data-progress]').forEach(el=>{
   const x=Number(el.dataset.progress);
   el.classList.toggle('current',x===n);
   el.classList.toggle('done',x<n);
 });
 window.scrollTo({top:0,behavior:'smooth'});
}
function validateGeneral(){
 let ok=true,first=null;
 for(const id of requiredMeta){
  const el=$(id),valid=el.value.trim()!=='';
  el.classList.toggle('invalid',!valid);
  $(id+'Error').textContent=valid?'':(el.tagName==='SELECT'?'Sila pilih maklumat ini.':'Medan ini wajib diisi.');
  if(!valid){ok=false;if(!first)first=el;}
 }
 if(first)first.focus();
 if(!ok)toast('Sila lengkapkan medan wajib bertanda *.');
 return ok;
}
function selectHtml(field,idx,value,values,label){
 const options=[['','- Pilih -']].concat(values.map(v=>[String(v),String(v)]));
 return '<div class="form-field"><label>'+escape(label)+' <em>*</em></label><select data-field="'+field+'" data-index="'+idx+'" required>'+
 options.map(o=>'<option value="'+escape(o[0])+'" '+(value===o[0]?'selected':'')+'>'+escape(o[1])+'</option>').join('')+
 '</select></div>';
}
function textHtml(field,idx,value,label,area,required,wide,placeholder){
 const p=placeholder?' placeholder="'+escape(placeholder)+'"':'';
 const attrs=' data-field="'+field+'" data-index="'+idx+'" '+(required?'required':'')+p;
 return '<div class="form-field '+(wide?'wide':'')+'"><label>'+escape(label)+(required?' <em>*</em>':'')+'</label>'+
 (area?'<textarea maxlength="1500"'+attrs+'>'+escape(value)+'</textarea>':'<input maxlength="250" type="text" value="'+escape(value)+'"'+attrs+'>')+'</div>';
}
function scorebox(idx,h,prefix){
 const residual=prefix==='r',lField=residual?'rl':'l',sField=residual?'rs':'s';
 const v=risk(h[lField],h[sField]),info=riskInfo(v);
 const select=(field,name)=>
 '<div><label>'+name+'</label><select data-index="'+idx+'" data-field="'+field+'">'+
 '<option value="">- Pilih -</option>'+[1,2,3,4,5].map(n=>'<option value="'+n+'" '+(String(h[field])===String(n)?'selected':'')+'>'+n+'</option>').join('')+
 '</select></div>';
 return '<div class="riskbox"><h3>'+(residual?'Risiko Baki (Selepas Kawalan)':'Risiko Asal (Sebelum Kawalan Tambahan)')+'</h3>'+
 '<div class="score-controls">'+select(lField,'L · Kebarangkalian')+select(sField,'S · Keterukan')+
 '<div class="score-display" id="score-'+idx+'-'+prefix+'"><strong>'+ (v||'—')+'</strong><small class="'+(v?'risk-'+info.type:'')+'">'+info.text+'</small></div></div></div>';
}
function renderHazards(){
 $('hazards').innerHTML=hazards.map((h,i)=>
 '<article class="hazard-card" data-hazard-row="'+i+'">'+
 '<div class="hazard-title"><strong>Aktiviti / Bahaya #'+(i+1)+'</strong>'+
 '<button class="mini-link" type="button" data-remove="'+i+'">'+(hazards.length===1?'Kosongkan':'✕ Buang Bahaya')+'</button></div>'+
 '<div class="hazard-card-body"><div class="hazard-grid">'+
 textHtml('activity',i,h.activity,'Aktiviti / Langkah Kerja',false,true,false,'Contoh: Menukar tayar lori')+
 textHtml('hazard',i,h.hazard,'Bahaya yang Dikenal Pasti',true,true,false,'Contoh: Jack gagal menyokong beban')+
 textHtml('effect',i,h.effect,'Risiko / Kesan',true,true,false,'Contoh: Kaki / tangan tersepit')+
 textHtml('existing',i,h.existing,'Kawalan Sedia Ada',true,false,false,'Jika tiada, tulis Tiada')+
 '</div><div class="risk-grid" style="margin:16px 0">'+scorebox(i,h,'o')+scorebox(i,h,'r')+'</div>'+
 '<div class="hazard-grid">'+
 textHtml('control',i,h.control,'Cadangan Kawalan Tambahan / Pencegahan',true,true,true,'Nyatakan kawalan mengikut hierarki jika sesuai')+
 selectHtml('hierarchy',i,h.hierarchy,['Penghapusan (Elimination)','Penggantian (Substitution)','Kawalan Kejuruteraan (Engineering)','Kawalan Pentadbiran (Administrative)','PPE'],'Hierarki Kawalan')+
 textHtml('owner',i,h.owner,'Pegawai Bertanggungjawab (PIC)',false,false,false,'Nama penyelia / PIC')+
 '<div class="form-field"><label>Tarikh Sasaran Tindakan</label><input type="date" data-field="due" data-index="'+i+'" value="'+escape(h.due)+'"></div>'+
 '</div></div></article>'
 ).join('');
 updateAllScores();
}
function updateScore(i,p){
 const h=hazards[i],el=$('score-'+i+'-'+p);
 if(!h||!el)return;
 const v=p==='o'?risk(h.l,h.s):risk(h.rl,h.rs);
 const x=riskInfo(v);
 el.innerHTML='<strong>'+(v||'—')+'</strong><small class="'+(v?'risk-'+x.type:'')+'">'+x.text+'</small>';
}
function updateAllScores(){hazards.forEach((h,i)=>{updateScore(i,'o');updateScore(i,'r');});}
function setHazardField(evt){
 const e=evt.target;if(!e.dataset||!e.dataset.field)return;
 const n=Number(e.dataset.index),field=e.dataset.field;if(!hazards[n]||!Object.prototype.hasOwnProperty.call(hazards[n],field))return;
 hazards[n][field]=e.value;
 e.classList.remove('invalid');
 saved=false;
 if(['l','s','rl','rs'].includes(field))updateScore(n,['rl','rs'].includes(field)?'r':'o');
}
function validateHazards(){
 if(!hazards.length){toast('Tambah sekurang-kurangnya satu aktiviti atau bahaya.');return false;}
 const required=['activity','hazard','effect','l','s','control','hierarchy','rl','rs'];
 let first=null;
 hazards.forEach((h,i)=>{
  required.forEach(field=>{
   const el=document.querySelector('[data-index="'+i+'"][data-field="'+field+'"]');
   if(!el)return;
   const missing=!String(h[field]||'').trim();
   el.classList.toggle('invalid',missing);
   if(missing&&!first)first=el;
  });
 });
 if(first){first.focus();first.scrollIntoView({block:'center',behavior:'smooth'});toast('Lengkapkan semua medan wajib bagi setiap bahaya (ditanda merah).');return false;}
 return true;
}
function riskTag(v){
 const info=riskInfo(v);
 return '<span class="risk-'+info.type+'">'+(v||'—')+' · '+info.text+'</span>';
}
function review(){
 metadata=getMeta();
 const pairs=[['Syarikat',metadata.company],['Projek / Jabatan',metadata.department],['Tarikh Taksiran',fmt(metadata.assessDate)],
 ['Stesen Kerja / Depot',metadata.station],['Skop Kerja',metadata.scope],['Tajuk Taksiran Risiko',metadata.title],['Nama Penilai',metadata.assessor||'—'],
 ['Tarikh Semakan',fmt(metadata.reviewDate)]];
 const origMax=Math.max(0,...hazards.map(h=>risk(h.l,h.s)));
 const resMax=Math.max(0,...hazards.map(h=>risk(h.rl,h.rs)));
 const tr=hazards.map((h,i)=>'<tr><td>'+(i+1)+'</td><td><strong>'+escape(h.activity)+'</strong><br>'+escape(h.hazard)+'</td>'+
 '<td>'+escape(h.effect)+'</td><td>'+escape(h.existing||'Tiada')+'</td><td>'+riskTag(risk(h.l,h.s))+'</td>'+
 '<td>'+escape(h.control)+'<div class="actions">'+escape(h.hierarchy)+'</div></td>'+
 '<td>'+riskTag(risk(h.rl,h.rs))+'</td><td>'+escape(h.owner||'—')+'<div class="actions">'+fmt(h.due)+'</div></td></tr>').join('');
 $('reviewDetails').innerHTML='<div class="review-grid">'+pairs.map(p=>'<div class="review-meta"><small>'+escape(p[0])+'</small><strong>'+escape(p[1])+'</strong></div>').join('')+'</div>'+
 '<h3 style="font-size:15px;color:#28245f">Ringkasan Taksiran Risiko ('+hazards.length+' aktiviti / bahaya)</h3>'+
 '<div class="review-tablewrap"><table class="review-table"><thead><tr><th>#</th><th>Aktiviti / Bahaya</th><th>Risiko / Kesan</th><th>Kawalan Sedia Ada</th><th>Skor Asal</th><th>Kawalan Tambahan</th><th>Risiko Baki</th><th>PIC / Tarikh</th></tr></thead><tbody>'+tr+'</tbody></table></div>'+
 '<div class="review-summary"><strong>Skor tertinggi sebelum kawalan:</strong> '+riskTag(origMax)+' &nbsp; <strong>Skor tertinggi selepas kawalan:</strong> '+riskTag(resMax)+
 '<p style="margin:8px 0 0">Penarafan risiko baki ialah anggaran selepas kawalan yang dicadangkan dilaksanakan dan perlu disemak semula. Rekod ini tidak bermaksud kerja berisiko tinggi telah diluluskan.</p></div>';
}
function readLocalRecords(){
 try{const data=JSON.parse(localStorage.getItem(KEY));return Array.isArray(data)?data:[];}
 catch(e){return [];}
}
function metaFromRecord(record){
 const m=record.hirarcMeta||{};
 return {company:m.company||DEFAULT_COMPANY,department:m.department||'',assessDate:m.assessDate||record.date||today(),
 station:m.station||record.depot||'',scope:m.scope||'',title:m.title||record.title||'',
 assessor:m.assessor||record.reporter||'',reviewDate:m.reviewDate||record.due||''};
}
function loadExisting(){
 const params=new URLSearchParams(location.search),id=params.get('id');if(!id)return;
 const entry=readLocalRecords().find(r=>r.id===id&&r.type==='hirarc'&&Array.isArray(r.hazards)&&r.hazards.length);
 if(!entry){toast('Rekod HIRARC tidak dijumpai pada pelayar ini. Borang baharu dipaparkan.');return;}
 editingId=entry.id;existingRecord=entry;
 metadata=metaFromRecord(entry);
 populateMeta(metadata);
 hazards=entry.hazards.map(h=>Object.assign(newHazard(),h));
 $('pageTitle').textContent='Kemas Kini Taksiran Risiko';
 document.querySelector('.panel-heading').textContent='Kemas Kini Maklumat Am Taksiran Risiko';
 toast('Rekod '+entry.id+' dibuka untuk dikemas kini.');
}
function makeRecord(){
 const old=existingRecord;
 const initials=hazards.map(h=>risk(h.l,h.s));
 const residuals=hazards.map(h=>risk(h.rl,h.rs));
 const highest=Math.max(...initials);
 const priority=highest>=15?'Tinggi':highest>=5?'Sederhana':'Rendah';
 return {
 id:editingId||'HIRARC-'+Date.now().toString(36).toUpperCase(),
 type:'hirarc',
 company:metadata.company,department:metadata.department,station:metadata.station,scope:metadata.scope,
 title:metadata.title,depot:metadata.station,date:metadata.assessDate,due:metadata.reviewDate||'',
 priority:priority,status:old?old.status||'Open':'Open',category:'Risk Assessment',
 description:'HIRARC: '+metadata.title+' · '+hazards.length+' aktiviti / bahaya dinilai. '+(old&&old.description?old.description:''),
 reporter:metadata.assessor||'',assignee:old&&old.assignee||'',
 riskScore:highest,residualScore:Math.max(...residuals),
 hazards:clone(hazards),hirarcMeta:clone(metadata),
 source:'hirarc-wizard',demo:false,
 created_at:old&&old.created_at||new Date().toISOString(),
 updated_at:new Date().toISOString()
 };
}
function save(){
 metadata=getMeta();
 const record=makeRecord();
 try{
  const list=readLocalRecords();
  const index=list.findIndex(r=>r.id===record.id);
  if(index>=0)list[index]=record;else list.unshift(record);
  localStorage.setItem(KEY,JSON.stringify(list));
  editingId=record.id;existingRecord=record;saved=true;
  history.replaceState(null,'','./hirarc.html?id='+encodeURIComponent(record.id));
  toast('Taksiran '+record.id+' disimpan pada pelayar ini sahaja.');
  const b=$('saveAssessment');b.textContent='✓ Disimpan — Buka Senarai HIRARC';
  b.dataset.saved='yes';
 }catch(e){toast('Gagal menyimpan: storan pelayar penuh / disekat. Cuba eksport CSV atau kosongkan storan.');}
}
function excelSafe(value){
 const v=String(value===undefined||value===null?'':value);
 return /^[\s]*[=+@\-]/.test(v)?"'"+v:v;
}
function cell(value){return '"'+excelSafe(value).replace(/"/g,'""')+'"';}
function download(){
 metadata=getMeta();
 const heads=['Rujukan','Syarikat','Jabatan','Depot','Tarikh Taksiran','Skop','Tajuk','Aktiviti',
  'Bahaya','Risiko / Kesan','Kawalan Sedia Ada','Likelihood Asal','Severity Asal','Skor Asal','Tahap Asal',
  'Kawalan Tambahan','Hierarki Kawalan','Likelihood Baki','Severity Baki','Skor Baki','Tahap Baki','PIC','Tarikh Sasaran'];
 const rows=hazards.map(h=>[editingId||'BELUM DISIMPAN',metadata.company,metadata.department,metadata.station,metadata.assessDate,metadata.scope,metadata.title,
 h.activity,h.hazard,h.effect,h.existing,h.l,h.s,risk(h.l,h.s),riskInfo(risk(h.l,h.s)).text,
 h.control,h.hierarchy,h.rl,h.rs,risk(h.rl,h.rs),riskInfo(risk(h.rl,h.rs)).text,h.owner,h.due]);
 const csv='\ufeff'+heads.map(cell).join(',')+'\n'+rows.map(r=>r.map(cell).join(',')).join('\n');
 const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));
 const link=document.createElement('a');link.href=url;link.download='HIRARC_'+(metadata.station||'FGVT').replace(/[^a-zA-Z0-9]/g,'_')+'_'+(metadata.assessDate||today())+'.csv';
 document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);
 toast('Fail CSV HIRARC telah dijana.');
}
$('generalForm').addEventListener('submit',e=>{
 e.preventDefault();
 if(!validateGeneral())return;
 metadata=getMeta();renderHazards();showStep(2);
});
requiredMeta.forEach(id=>$(id).addEventListener('input',()=>{
 const e=$(id);e.classList.remove('invalid');$(id+'Error').textContent='';saved=false;
}));
$('hazards').addEventListener('input',setHazardField);
$('hazards').addEventListener('change',setHazardField);
$('hazards').addEventListener('click',e=>{
 const b=e.target.closest('[data-remove]');if(!b)return;
 const idx=Number(b.dataset.remove);
 if(hazards.length===1){
  if(!confirm('Kosongkan semua butiran bahaya ini?'))return;
  hazards=[newHazard()];
 }else if(confirm('Buang aktiviti / bahaya #'+(idx+1)+'?'))hazards.splice(idx,1);
 renderHazards();saved=false;
});
$('addHazard').addEventListener('click',()=>{hazards.push(newHazard());renderHazards();saved=false;document.querySelector('[data-hazard-row="'+(hazards.length-1)+'"]').scrollIntoView({behavior:'smooth',block:'center'});});
$('backOne').addEventListener('click',()=>showStep(1));
$('nextReview').addEventListener('click',()=>{
 if(!validateHazards())return;
 review();showStep(3);
});
$('backTwo').addEventListener('click',()=>{renderHazards();showStep(2);});
$('downloadCSV').addEventListener('click',download);
$('printAssessment').addEventListener('click',()=>window.print());
$('saveAssessment').addEventListener('click',e=>{
 if(e.currentTarget.dataset.saved==='yes'){location.href='./index.html?page=hirarc';return;}
 save();
});
$('menuToggle').addEventListener('click',()=>{$('sidebar').classList.toggle('open');});
document.addEventListener('keydown',e=>{if(e.key==='Escape')$('sidebar').classList.remove('open');});
const d=$('assessDate');d.value=today();
loadExisting();
renderHazards();
})();
