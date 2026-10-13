
(function () {
'use strict';
var KEY='fgvt_hse_one_demo_v01';
var EMAIL='zairullizam.mk@fgvholdings.com';
var DEPOTS=['Port Klang','Kuantan','Pasir Gudang','Sahabat','Kurier / Shah Alam','HQ'];
var MODULES=[
 {key:'nemso',name:'NeMSO / Safety Observation',short:'NeMSO',icon:'🛡️',desc:'Laporkan bahaya, hampir kemalangan dan amalan baik.',group:'PELAPORAN'},
 {key:'wpi',name:'Workplace Inspection',short:'WPI Inspection',icon:'🔎',desc:'Pemeriksaan premis, checklist dan penemuan.',group:'PELAPORAN'},
 {key:'hirarc',name:'HIRARC / Risk Register',short:'HIRARC',icon:'⚖️',desc:'Penilaian risiko, skor dan langkah kawalan.',group:'PELAPORAN'},
 {key:'incident',name:'Accident & Incident',short:'Incident / MVI',icon:'🚨',desc:'Insiden jalan raya, bengkel dan near miss.',group:'PELAPORAN'},
 {key:'ovr',name:'OVR & Driver Monitoring',short:'OVR',icon:'📹',desc:'Kesalahan pemandu, lori dan dapatan berulang.',group:'FLEET SAFETY'},
 {key:'capa',name:'CAPAR / Action Tracker',short:'CAPAR',icon:'✅',desc:'Tindakan pembetulan, pencegahan dan pemilik.',group:'FLEET SAFETY'},
 {key:'toolbox',name:'Toolbox Talk',short:'Toolbox Talk',icon:'🗣️',desc:'Rekod sesi, tajuk dan kehadiran petugas.',group:'OPERASI'},
 {key:'training',name:'Training Register',short:'Training',icon:'🎓',desc:'Penyertaan, sijil dan latihan keselamatan.',group:'OPERASI'},
 {key:'ptw',name:'Permit to Work',short:'PTW',icon:'📋',desc:'Rekod permohonan permit dan kelulusan kerja.',group:'OPERASI'}
];
var SAMPLES=[
 ['nemso','Port Klang','Kotak barang menghalang laluan pejalan kaki','Open','Tinggi','2026-10-09','2026-10-17','Unsafe Condition'],
 ['wpi','Pasir Gudang','Pemeriksaan kawasan secondary containment','Dalam Tindakan','Sederhana','2026-10-08','2026-10-22','Premises'],
 ['ovr','Kuantan','Semakan contoh: seat belt not fastened','Open','Tinggi','2026-10-07','2026-10-15','Seat Belt Not Fastened'],
 ['capa','Port Klang','Tindakan pembetulan tanda amaran bengkel','Selesai','Sederhana','2026-10-06','2026-10-11','Corrective Action'],
 ['hirarc','HQ','Semakan risiko aktiviti pengendalian muatan','Dalam Tindakan','Tinggi','2026-10-03','2026-10-20','Risk Assessment'],
 ['incident','Sahabat','Contoh pelaporan kerosakan harta benda','Selesai','Rendah','2026-10-02','2026-10-12','Property Damage'],
 ['toolbox','Kuantan','Taklimat contoh: pengurusan keletihan pemandu','Selesai','Rendah','2026-10-01','2026-10-01','Toolbox Talk'],
 ['training','HQ','Contoh latihan defensive driving','Selesai','Rendah','2026-09-29','2026-10-01','Training'],
 ['ptw','Pasir Gudang','Contoh permit penyelenggaraan kontraktor','Open','Tinggi','2026-10-09','2026-10-16','Hot Work']
].map(function(x,i){return {id:'DEMO-'+String(i+1).padStart(3,'0'),type:x[0],depot:x[1],title:x[2],status:x[3],priority:x[4],date:x[5],due:x[6],category:x[7],reporter:'Pengguna Contoh',assignee:'Penyelia Depot',description:'Ini hanyalah rekod contoh untuk demonstrasi paparan. Bukan laporan operasi sebenar.',demo:true};});
var records=load();
var active='dashboard', searchText='', depotFilter='', statusFilter='', chartFilter='All';
function load(){try {var parsed=JSON.parse(localStorage.getItem(KEY));if(Array.isArray(parsed))return parsed;}catch(e){} return SAMPLES.slice();}
function persist(){try {localStorage.setItem(KEY,JSON.stringify(records));return true;}catch(err){alert('Storan pelayar penuh atau tidak tersedia. Cuba eksport data dahulu.');return false;}}
function safe(s){return String(s===null||s===undefined?'':s).replace(/[&<>"']/g,function(ch){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch];});}
function mod(k){return MODULES.find(function(m){return m.key===k;})||MODULES[0];}
function dToday(){var d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');}
function dated(s){if(!s)return '—';var a=String(s).split('-');return a.length===3?a[2]+'/'+a[1]+'/'+a[0]:safe(s);}
function percent(a,b){return b?Math.round(100*a/b):0;}
function toast(s){var n=document.getElementById('toast');n.textContent=s;n.classList.remove('hidden');clearTimeout(window.__hseToast);window.__hseToast=setTimeout(function(){n.classList.add('hidden');},3500);}
function isLate(r){return r.status!=='Selesai'&&r.due&&r.due<dToday();}
function pill(r,kind){var type=kind==='priority'?r.priority:r.status;var cls=type==='Selesai'?'closed':type==='Dalam Tindakan'?'progress':type==='Tinggi'?'high':type==='Sederhana'?'medium':type==='Rendah'?'low':'open';return '<span class="pill '+cls+'">'+safe(type||'—')+'</span>';}
function htmlNote(){return '<div class="note"><strong>VERSI DEMO:</strong> Rekod DEMO ialah data contoh, bukan data sebenar FGV. Perubahan hanya disimpan pada pelayar/peranti ini. Tiada log masuk, pangkalan data berpusat atau penghantaran e-mel automatik. Jangan masukkan maklumat sulit atau data peribadi sebenar.</div>';}
function button(label,action,value,extra){return '<button class="button '+(extra||'')+'" data-act="'+safe(action)+'" data-value="'+safe(value||'')+'">'+label+'</button>';}
function nav(){
 var html='<div class="nav-section"><div class="side-label">OVERVIEW</div><button class="nav-item '+(active==='dashboard'?'active':'')+'" data-page="dashboard"><span class="emoji">◫</span><span class="nav-text">Dashboard HSE</span></button></div>';
 var prev='';MODULES.forEach(function(m){if(prev!==m.group){if(prev)html+='</div>';html+='<div class="nav-section"><div class="side-label">'+m.group+'</div>';prev=m.group;}html+='<button class="nav-item '+(active===m.key?'active':'')+'" data-page="'+m.key+'"><span class="emoji">'+m.icon+'</span><span class="nav-text">'+safe(m.short)+'</span><span class="count">'+records.filter(function(r){return r.type===m.key;}).length+'</span></button>';});html+='</div>';
 html+='<div class="nav-section"><div class="side-label">TOOLS</div><button class="nav-item '+(active==='settings'?'active':'')+'" data-page="settings"><span class="emoji">⚙️</span><span class="nav-text">Data & Settings</span></button></div>';
 document.getElementById('sideNav').innerHTML=html;
}
function heading(title,sub,buttons){return '<div class="page-heading"><div><div class="eyebrow">SAFETY • HEALTH • ENVIRONMENT</div><h1>'+safe(title)+'</h1><p>'+safe(sub)+'</p></div><div class="dash-actions">'+(buttons||'')+'</div></div>';}
function stats(){
 var total=records.length,open=records.filter(function(r){return r.status!=='Selesai';}).length,over=records.filter(isLate).length,closed=total-open;
 return '<div class="grid stats">'+
 stat('TOTAL REPORTS',total,'Rekod keseluruhan','📑')+
 stat('PENDING ACTIONS',open,'Belum ditutup','⏳')+
 stat('OVERDUE',over,'Melepasi tarikh sasaran','⚠️')+
 stat('CLOSURE RATE',percent(closed,total)+'%','Status selesai','📈')+'</div>';
}
function stat(label,value,caption,ico){return '<div class="stat"><div class="stat-icon">'+ico+'</div><div class="stat-label">'+label+'</div><strong>'+safe(value)+'</strong><small>'+caption+'</small></div>';}
function chart(){
 var set=records.filter(function(r){return chartFilter==='All'||r.status===chartFilter;});
 var max=Math.max(1,...DEPOTS.map(function(d){return set.filter(function(r){return r.depot===d;}).length;}));
 return '<div class="chart-list">'+DEPOTS.map(function(d){var v=set.filter(function(r){return r.depot===d;}).length;return '<div class="chart-row"><span>'+safe(d)+'</span><div class="track"><div class="fill" style="width:'+Math.round(v/max*100)+'%"></div></div><strong>'+v+'</strong></div>';}).join('')+'</div>';
}
function row(r){
 return '<tr><td><strong>'+safe(r.title)+'</strong><span class="id">'+safe(r.id)+(r.demo?' · DATA CONTOH':'')+'</span></td><td>'+safe(mod(r.type).short)+'</td><td>'+safe(r.depot)+'</td><td>'+dated(r.date)+'</td><td>'+pill(r)+'</td><td>'+pill(r,'priority')+'</td><td><button class="btn-mini" data-act="detail" data-value="'+safe(r.id)+'">Lihat →</button></td></tr>';
}
function table(rs){
 if(!rs.length)return '<div class="empty"><div class="large">📂</div>Tiada rekod dipaparkan.</div>';
 return '<div class="table-scroll"><table class="data-table"><thead><tr><th>REKOD / RUJUKAN</th><th>MODUL</th><th>DEPOT</th><th>TARIKH</th><th>STATUS</th><th>PRIORITI</th><th>DETAIL</th></tr></thead><tbody>'+rs.map(row).join('')+'</tbody></table></div>';
}
function dashboard(){
 var recent=records.slice().sort(function(a,b){return b.date.localeCompare(a.date);}).slice(0,5);
 var pend=records.filter(function(r){return r.status!=='Selesai';}).sort(function(a,b){return (a.due||'9999').localeCompare(b.due||'9999');}).slice(0,4);
 return heading('HSE Command Centre','Pemantauan laporan, tindakan dan prestasi mengikut depot.',button('＋ Laporan Baharu','choose','', 'primary')+button('↓ Export Data','export','', ''))+
 htmlNote()+stats()+
 '<div class="grid two"><div class="panel"><div class="panel-head"><div><h2>Perbandingan rekod mengikut depot</h2><p class="subtitle">Jumlah rekod dalam pelayar ini.</p></div><div class="metric-tabs"><button data-act="chart" data-value="All" class="'+(chartFilter==='All'?'selected':'')+'">Semua</button><button data-act="chart" data-value="Open" class="'+(chartFilter==='Open'?'selected':'')+'">Open</button><button data-act="chart" data-value="Selesai" class="'+(chartFilter==='Selesai'?'selected':'')+'">Closed</button></div></div>'+chart()+'</div>'+
 '<div class="panel"><div class="panel-head"><div><h2>Tindakan perlu diberi perhatian</h2><p class="subtitle">Susunan mengikut tarikh sasaran.</p></div></div>'+
 (pend.length?pend.map(function(r){return '<div class="action-card"><div class="number">!</div><div><strong>'+safe(r.title)+'</strong><div class="meta">'+safe(r.depot)+' · '+(isLate(r)?'OVERDUE · ':'')+dated(r.due)+'</div></div><button class="btn-mini" style="margin-left:auto" data-act="detail" data-value="'+safe(r.id)+'">→</button></div>';}).join(''):'<div class="empty">Tiada tindakan terbuka.</div>')+'</div></div>'+
 '<div class="panel" style="margin-bottom:16px"><div class="panel-head"><div><h2>Modul HSE</h2><p class="subtitle">Klik modul untuk melihat data dan menambah laporan.</p></div></div><div class="grid three">'+MODULES.map(function(m){var n=records.filter(function(r){return r.type===m.key;}).length;return '<div class="module-card" data-page="'+m.key+'" role="button" tabindex="0"><div class="module-head"><div class="module-icon">'+m.icon+'</div><span class="card-arrow">↗</span></div><h3>'+safe(m.name)+'</h3><p>'+safe(m.desc)+'</p><div class="module-count">'+n+' rekod</div></div>';}).join('')+'</div></div>'+
 '<div class="panel"><div class="panel-head"><h2>Laporan terkini</h2>'+button('Semua Rekod','openPage','all','small')+'</div>'+table(recent)+'</div>';
}
function filtered(type){
 return records.filter(function(r){return (type==='all'||r.type===type)&&(!depotFilter||r.depot===depotFilter)&&(!statusFilter||r.status===statusFilter)&&(!searchText||[r.id,r.title,r.depot,r.reporter,r.assignee,r.vehicle,r.driver,r.category,r.description].join(' ').toLowerCase().includes(searchText.toLowerCase()));}).sort(function(a,b){return b.date.localeCompare(a.date);});
}
function filters(){
 return '<div class="filterbar"><input class="field search" type="search" placeholder="Cari rekod, lori, pemandu, kategori..." id="searchField" value="'+safe(searchText)+'">'+
 '<select class="field select" id="depotFilter"><option value="">Semua Depot</option>'+DEPOTS.map(function(d){return '<option value="'+safe(d)+'" '+(depotFilter===d?'selected':'')+'>'+safe(d)+'</option>';}).join('')+'</select>'+
 '<select class="field select" id="statusFilter"><option value="">Semua Status</option>'+['Open','Dalam Tindakan','Selesai'].map(function(x){return '<option '+(statusFilter===x?'selected':'')+'>'+x+'</option>';}).join('')+'</select>'+
 '<div class="toolbar-end">'+button('↓ CSV','csv','','small')+'</div></div>';
}
function recordsPage(type){
 var m=type==='all'?{name:'Semua Laporan',desc:'Carian dan penapisan merentas semua modul.'}:mod(type);
 return heading(m.name,m.desc,button('＋ Tambah Laporan','new',type==='all'?'nemso':type,'primary')+button('Semua Rekod','openPage','all',''))+
 htmlNote()+ '<div class="grid stats">'+stat('JUMLAH REKOD',records.filter(function(r){return type==='all'||r.type===type;}).length,'Semua status','📁')+
 stat('DALAM TINDAKAN',records.filter(function(r){return (type==='all'||r.type===type)&&r.status!=='Selesai';}).length,'Open / in progress','⏳')+
 stat('SELESAI',records.filter(function(r){return (type==='all'||r.type===type)&&r.status==='Selesai';}).length,'Tindakan ditutup','✅')+
 stat('OVERDUE',records.filter(function(r){return (type==='all'||r.type===type)&&isLate(r);}).length,'Lepas tarikh sasaran','📅')+
 '</div><div class="panel">'+filters()+'<div id="tableArea">'+table(filtered(type))+'</div></div>';
}
function settings(){
 return heading('Data & Tetapan','Urus data demonstrasi dan eksport rekod.')+htmlNote()+
 '<div class="grid two"><div class="panel"><h2>Eksport & Import</h2><p class="subtitle">Sandaran JSON untuk pelayar sama atau peranti berbeza; CSV untuk Excel.</p><div class="dash-actions" style="margin-top:19px">'+
 button('↓ Muat Turun JSON','export','','primary')+button('↑ Import JSON','import','','')+button('↓ Eksport CSV','csv','','')+'</div>'+
 '<p class="subtitle" style="margin-top:17px">Import akan menggantikan semua rekod yang dipaparkan selepas anda sahkan.</p></div>'+
 '<div class="panel"><h2>Pengurusan Data Demo</h2><p class="subtitle">Mulakan paparan kosong atau pulihkan rekod contoh.</p><div class="dash-actions" style="margin-top:19px">'+button('Kosongkan Semua Rekod','clear','','')+button('Pulihkan Data Contoh','reset','','')+'</div></div></div>'+
 '<div class="panel"><h2>Sambungan versi produksi</h2><p style="color:#728198;font-size:13px">Versi seterusnya memerlukan login selamat berasaskan peranan, pangkalan data berpusat, storan gambar, audit trail dan notifikasi melalui server / Google Apps Script. Alamat penerima yang dirancang: <strong>'+safe(EMAIL)+'</strong>.</p><p style="color:#a06943;font-size:12px">GitHub Pages sahaja tidak menyediakan pengesahan pengguna atau server untuk penghantaran e-mel automatik. Jangan gunakan demo ini untuk laporan HSE sulit atau sebenar.</p></div>';
}
function render(){
 document.getElementById('crumb').textContent=active==='dashboard'?'DASHBOARD':active==='settings'?'SETTINGS':active==='all'?'ALL REPORTS':mod(active).short.toUpperCase();
 document.getElementById('clock').textContent=new Date().toLocaleDateString('ms-MY',{day:'numeric',month:'short',year:'numeric'});
 nav();
 document.getElementById('screen').innerHTML=active==='dashboard'?dashboard():active==='settings'?settings():recordsPage(active);
}
function closeModal(){document.getElementById('modal').className='hidden';document.getElementById('modal').innerHTML='';}
function modal(title,subtitle,body,footer){
 var m=document.getElementById('modal');
 m.className='overlay';
 m.innerHTML='<div class="dialog" role="dialog" aria-modal="true" aria-label="'+safe(title)+'"><div class="dialog-header"><div><h2>'+safe(title)+'</h2><p>'+safe(subtitle||'')+'</p></div><button class="close" data-act="close" aria-label="Tutup">✕</button></div><div class="dialog-body">'+body+'</div>'+(footer?'<div class="dialog-footer">'+footer+'</div>':'')+'</div>';
}
function chooseModule(){
 modal('Pilih Modul Laporan','Pilih jenis pelaporan untuk memulakan rekod baharu.',
 '<div class="grid three">'+MODULES.map(function(m){return '<button class="module-card" data-act="new" data-value="'+m.key+'" style="text-align:left"><div class="module-icon">'+m.icon+'</div><h3>'+safe(m.short)+'</h3><p>'+safe(m.desc)+'</p></button>';}).join('')+'</div>',button('Tutup','close','',''));
}
function group(label,field,name,placeholder,req,wide){return '<div class="form-group '+(wide?'wide':'')+'"><label for="f_'+name+'">'+label+'</label><'+field+' id="f_'+name+'" name="'+name+'" '+(req?'required':'')+' '+(field==='textarea'?'':'placeholder="'+safe(placeholder||'')+'"')+'>'+(field==='textarea'?'':'')+'</'+field+'></div>';}
function optionSelect(name,label,options,wide){
 return '<div class="form-group '+(wide?'wide':'')+'"><label for="f_'+name+'">'+label+'</label><select name="'+name+'" id="f_'+name+'">'+options.map(function(v){return '<option value="'+safe(v)+'">'+safe(v)+'</option>';}).join('')+'</select></div>';
}
function extras(type){
 if(type==='nemso')return optionSelect('category','Kategori Pemerhatian',['Unsafe Condition','Unsafe Act','Near Miss','Good Practice','Other']);
 if(type==='wpi')return optionSelect('category','Skop Pemeriksaan',['Premises','Vehicle','Workshop','Equipment','PPE','Environmental','Other']);
 if(type==='ovr')return optionSelect('category','Jenis Kesalahan',['Seat Belt Not Fastened','Using Phone','Camera Covered / Obstruction','Smoking','Speed Violation','Other']);
 if(type==='hirarc')return optionSelect('likelihood','Likelihood (L)',['1','2','3','4','5'])+optionSelect('severity','Severity (S)',['1','2','3','4','5']);
 if(type==='incident')return optionSelect('category','Jenis Insiden',['Motor Vehicle Incident','Workplace Injury','Spill','Near Miss','Property Damage','Other']);
 if(type==='capa')return optionSelect('category','Jenis Tindakan',['Corrective Action','Preventive Action','Improvement']);
 if(type==='toolbox')return optionSelect('category','Jenis Program',['Toolbox Talk','Safety Briefing','Standdown','Safety Moment']);
 if(type==='training')return optionSelect('category','Jenis Latihan',['Defensive Driving','First Aid','HIRARC','Fire Drill','Other']);
 if(type==='ptw')return optionSelect('category','Jenis Kerja',['Hot Work','Confined Space','Electrical','Work at Height','Maintenance','Other']);
 return '';
}
function newForm(type){
 var m=mod(type);var form='<form id="recordForm"><input type="hidden" name="type" value="'+m.key+'"><div class="form-grid">'+
 group('Tajuk Laporan *','input','title','Contoh: Pemerhatian tidak selamat',true,true)+
 optionSelect('depot','Depot / Lokasi *',DEPOTS)+optionSelect('priority','Keutamaan',['Sederhana','Tinggi','Rendah'])+
 extras(m.key)+
 group('Tarikh Penemuan *','input','date','',true,false)+group('Tarikh Sasaran Tindakan','input','due','',false,false)+
 group('Nama Pelapor','input','reporter','Nama petugas',false,false)+group('Pegawai Bertanggungjawab','input','assignee','Nama penyelia / PIC',false,false)+
 group('No. Kenderaan (jika berkaitan)','input','vehicle','ABC1234',false,false)+group('Nama Pemandu (jika berkaitan)','input','driver','Nama pemandu',false,false)+
 group('Penerangan & Cadangan Tindakan','textarea','description','',false,true)+
 '<div class="form-group wide"><label for="evidence">Lampiran Bukti / Gambar</label><input type="file" id="evidence" name="evidence" accept="image/png,image/jpeg,image/webp"><div class="hint">Demo tempatan sahaja · gambar maksimum 500 KB · bukan storan awan / bukan e-mel.</div></div>'+
 '</div><div class="dialog-footer" style="padding:16px 0 0;margin-top:18px">'+button('Batal','close','','')+'<button type="submit" class="button primary">Simpan Laporan</button></div></form>';
 modal('Laporan Baharu · '+m.short,'Masukkan butiran dan lampiran gambar jika ada.',form,'');
 document.getElementById('f_date').type='date';document.getElementById('f_date').value=dToday();
 document.getElementById('f_due').type='date';
 document.getElementById('recordForm').addEventListener('submit',handleSave);
}
function fileAsDataUrl(file){return new Promise(function(resolve,reject){var reader=new FileReader();reader.onload=function(){resolve(reader.result);};reader.onerror=reject;reader.readAsDataURL(file);});}
async function handleSave(ev){
 ev.preventDefault();var form=ev.currentTarget;var obj=Object.fromEntries(new FormData(form).entries());var f=document.getElementById('evidence').files[0];
 if(f&&(!f.type.startsWith('image/')||f.size>500*1024)){alert('Gunakan gambar JPG, PNG atau WEBP dengan saiz maksimum 500KB untuk demo ini.');return;}
 var today=dToday(),id='HSE-'+Date.now().toString(36).toUpperCase();
 var r={id:id,type:obj.type,title:obj.title.trim(),depot:obj.depot,date:obj.date||today,due:obj.due||'',priority:obj.priority||'Sederhana',status:'Open',description:obj.description||'',reporter:obj.reporter||'',assignee:obj.assignee||'',vehicle:obj.vehicle||'',driver:obj.driver||'',category:obj.category||'',likelihood:obj.likelihood||'',severity:obj.severity||'',demo:false,created_at:new Date().toISOString()};
 if(r.type==='hirarc')r.riskScore=Number(obj.likelihood||1)*Number(obj.severity||1);
 if(f){try{r.evidence=await fileAsDataUrl(f);r.evidenceName=f.name;}catch(e){alert('Lampiran gagal dibaca.');return;}}
 records.unshift(r);
 if(!persist()){records.shift();return;}
 closeModal();active=r.type;searchText='';depotFilter='';statusFilter='';render();toast('Rekod '+id+' disimpan pada pelayar ini (bukan e-mel).');
}
function detail(id){
 var r=records.find(function(x){return x.id===id;});if(!r)return;
 var fields=[['Rujukan',r.id],['Modul',mod(r.type).name],['Depot',r.depot],['Tarikh',dated(r.date)],['Tarikh sasaran',dated(r.due)],['Pelapor',r.reporter||'—'],['Pegawai bertanggungjawab',r.assignee||'—'],['Kategori',r.category||'—'],['No. Kenderaan',r.vehicle||'—'],['Pemandu',r.driver||'—']];
 if(r.riskScore)fields.push(['Skor Risiko (L × S)',r.riskScore]);
 var body='<div class="grid detail-grid">'+fields.map(function(f){return '<div class="detail-field"><small>'+safe(f[0]).toUpperCase()+'</small><div>'+safe(f[1])+'</div></div>';}).join('')+'</div>'+
 '<hr style="border:0;border-top:1px solid #e7ebf1;margin:20px 0"><div class="detail-field"><small>PERIHAL / TINDAKAN</small><div style="white-space:pre-wrap">'+safe(r.description||'Tiada penerangan')+'</div></div>'+
 '<div style="display:flex;gap:8px;margin-top:14px">'+pill(r)+pill(r,'priority')+'</div>'+
 (r.evidence?'<div style="margin-top:20px"><div class="detail-field"><small>LAMPIRAN TEMPATAN</small><img class="detail-photo" alt="Bukti laporan" src="'+safe(r.evidence)+'"></div></div>':'')+
 (r.demo?'<p class="note" style="margin-top:18px">Rekod contoh; bukan penemuan sebenar.</p>':'');
 var actions=r.status==='Open'?button('Mula Tindakan','status',r.id+'|Dalam Tindakan','primary'):r.status==='Dalam Tindakan'?button('Tandakan Selesai','status',r.id+'|Selesai','primary'):button('Buka Semula','status',r.id+'|Open','');
 modal('Butiran Laporan',safe(r.title),body,button('Tutup','close','','')+actions);
}
function setStatus(val){var i=val.lastIndexOf('|');var id=val.slice(0,i),status=val.slice(i+1);var r=records.find(function(x){return x.id===id;});if(!r)return;r.status=status;if(persist()){closeModal();render();toast('Status dikemas kini: '+status);} }
function download(name,type,content){var blob=new Blob([content],{type:type}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(url);},1000);}
function csvEscape(val){return '"'+String(val===undefined||val===null?'':val).replace(/"/g,'""')+'"';}
function exportCSV(){
 var rows=active==='dashboard'||active==='settings'?records:filtered(active);
 var heads=['ID','Module','Title','Depot','Date','Due','Category','Priority','Status','Reporter','Assignee','Vehicle','Driver','Description'];
 var keys=['id','type','title','depot','date','due','category','priority','status','reporter','assignee','vehicle','driver','description'];
 var csv='\ufeff'+heads.join(',')+'\n'+rows.map(function(r){return keys.map(function(k){return csvEscape(r[k]);}).join(',');}).join('\n');
 download('HSE_One_Export_'+dToday()+'.csv','text/csv;charset=utf-8',csv);toast('Fail CSV dijana.');
}
function exportJSON(){download('HSE_One_Backup_'+dToday()+'.json','application/json',JSON.stringify({version:1,exportedAt:new Date().toISOString(),records:records},null,2));toast('Sandaran JSON dijana.');}
function importJSON(){
 document.getElementById('importFile').click();
}
document.getElementById('importFile').addEventListener('change',async function(ev){
 var file=ev.target.files[0];if(!file)return;try{
 var data=JSON.parse(await file.text()),items=Array.isArray(data)?data:data.records;
 if(!Array.isArray(items)||items.some(function(x){return !x||typeof x!=='object'||!x.id||!x.type||!x.title||!x.depot||!MODULES.some(function(m){return m.key===x.type;});}))throw Error('Format fail tidak serasi.');
 if(!confirm('Import '+items.length+' rekod? Ini akan menggantikan data demo dalam pelayar ini.'))return;
 var old=records;records=items;if(!persist()){records=old;return;}active='dashboard';render();toast('Import berjaya: '+items.length+' rekod.');
 }catch(err){alert('Import gagal: '+err.message);}finally{ev.target.value='';}
});
document.addEventListener('click',function(ev){
 var b=ev.target.closest('[data-page],[data-act]');if(!b)return;
 if(b.dataset.page){active=b.dataset.page;searchText='';depotFilter='';statusFilter='';render();window.scrollTo(0,0);return;}
 var a=b.dataset.act,v=b.dataset.value||'';
 if(a==='close')closeModal();
 if(a==='choose')chooseModule();
 if(a==='new')newForm(v);
 if(a==='detail')detail(v);
 if(a==='status')setStatus(v);
 if(a==='chart'){chartFilter=v;render();}
 if(a==='export')exportJSON();
 if(a==='csv')exportCSV();
 if(a==='import')importJSON();
 if(a==='openPage'){active=v;render();window.scrollTo(0,0);}
 if(a==='clear'&&confirm('Kosongkan semua rekod dalam pelayar ini? Sila eksport sandaran jika perlu.')){records=[];persist();render();toast('Semua rekod dikosongkan.');}
 if(a==='reset'&&confirm('Pulihkan data contoh? Rekod sekarang akan diganti.')){records=SAMPLES.slice();persist();render();toast('Data contoh dipulihkan.');}
});
document.addEventListener('input',function(ev){
 if(ev.target.id==='searchField'){searchText=ev.target.value;document.getElementById('tableArea').innerHTML=table(filtered(active));}
});
document.addEventListener('change',function(ev){
 if(ev.target.id==='depotFilter'){depotFilter=ev.target.value;document.getElementById('tableArea').innerHTML=table(filtered(active));}
 if(ev.target.id==='statusFilter'){statusFilter=ev.target.value;document.getElementById('tableArea').innerHTML=table(filtered(active));}
});
document.addEventListener('keydown',function(ev){
 if(ev.key==='Escape')closeModal();
 if((ev.key==='Enter'||ev.key===' ')&&ev.target.classList.contains('module-card')&&ev.target.dataset.page){ev.preventDefault();active=ev.target.dataset.page;render();}
});
document.getElementById('modal').addEventListener('click',function(ev){if(ev.target.id==='modal')closeModal();});
render();
})();
