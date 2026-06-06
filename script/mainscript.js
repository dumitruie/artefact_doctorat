var IT={
  'Alegere duală':    {code:'AF',lvl:1,pts:1,instr:'Identifică valoarea de adevăr a afirmației de mai jos.'},
  'Alegere singulară':{code:'AS',lvl:1,pts:1,instr:'Selectează răspunsul corect din variantele propuse.'},
  'Alegere multiplă': {code:'AM',lvl:1,pts:1,instr:'Selectează toate variantele corecte din lista de mai jos.'},
  'Tip pereche':      {code:'TP',lvl:1,pts:1,instr:'Asociază elementele din coloana A cu cele din coloana B.'},
  'Completare':       {code:'C', lvl:2,pts:2,instr:'Completează spațiile libere cu informația corectă.'},
  'Răspuns scurt':    {code:'RS',lvl:2,pts:2,instr:'Scrie răspunsul corect (cuvânt, expresie sau valoare numerică).'},
  'Structurat':       {code:'Str',lvl:2,pts:2,instr:'Rezolvă cerințele de mai jos, respectând pașii indicați.'},
  'Eseu structurat':  {code:'Es',lvl:3,pts:4,instr:'Elaborează un răspuns argumentat respectând reperele indicate.'},
  'Probl. libere':    {code:'PL',lvl:3,pts:4,instr:'Rezolvă problema utilizând metoda potrivită și argumentează.'}
};
function giftTemplate(c){switch(c){case 'AF':return'{TRUE}';case 'AS':case 'AM':return'{=Răspuns_corect ~Variantă_greșită_1 ~Variantă_greșită_2 ~Variantă_greșită_3}';case 'TP':return'{=Element_A -> Pereche_1 =Element_B -> Pereche_2}';case 'C':case 'RS':return'{=răspuns_corect}';default:return'{}';}};

var NC_COL={1:'#1565c0',2:'#2e7d32',3:'#bf360c'};
var NC_NM={1:'NC1 – Cunoaștere',2:'NC2 – Aplicare',3:'NC3 – Analiză-Sinteză'};
var TIP_COL={Intrare:'#1565c0',Tematic:'#2e7d32',Intermediar:'#6a1b9a',Final:'#bf360c'};
var AUTO_CFG={a:2,s:10,m:4};
var DEFS={
  Intrare:    {nc1:60,nc2:30,nc3:10,nrItemi:15,timp:45,prag:30},
  Tematic:    {nc1:50,nc2:35,nc3:15,nrItemi:16,timp:55,prag:50},
  Intermediar:{nc1:30,nc2:40,nc3:30,nrItemi:30,timp:80,prag:70},
  Final:      {nc1:20,nc2:30,nc3:50,nrItemi:30,timp:90,prag:70}
};
var AUTO_BLOOM={1:['Alegere duală','Alegere singulară','Alegere multiplă'],2:['Completare','Răspuns scurt'],3:['Eseu structurat']};
var testsList=[],giftRaw='',selMatKey=null,selSblKey=null,sblData={};
var rowIdx=0;
var _expItems=[],_expFn='',_expGift=false;

function toRoman(n){if(n<1||n>50)return String(n);var v=[50,40,10,9,5,4,1],s=['L','XL','X','IX','V','IV','I'],r='';for(var i=0;i<v.length;i++)while(n>=v[i]){r+=s[i];n-=v[i];}return r;}
function xe(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
function slug(s){return s.replace(/\s+/g,'_').replace(/[^\w\-]/g,'').substring(0,28);}

function resetAll(){showDlg('dlgReset');}
function doReset(){
  document.getElementById('cC').value='CURS_IPT';
  document.getElementById('modBody').innerHTML='';rowIdx=0;
  addRow('',0,0);addRow('',0,0);addRow('',0,0);
  testsList=[];giftRaw='';selMatKey=null;selSblKey=null;sblData={};
  document.getElementById('pevW').innerHTML='<div class="es"><div class="ei">📅</div>Apăsați ⚡ GENEREAZĂ</div>';
  document.getElementById('matTree').innerHTML='<div class="es"><div class="ei">📊</div>Generați</div>';
  document.getElementById('matC').innerHTML='<div class="es"><div class="ei">👈</div>Selectați test</div>';
  document.getElementById('sblTree').innerHTML='<div class="es"><div class="ei">📋</div>Generați</div>';
  document.getElementById('sblC').innerHTML='<div class="es"><div class="ei">👈</div>Selectați testul din stânga</div>';
  document.getElementById('colW').innerHTML='<div class="es"><div class="ei">📦</div>Generați</div>';
  document.getElementById('noteW').innerHTML='<div class="es"><div class="ei">📈</div>Generați</div>';
  document.getElementById('giftO').innerHTML='<span class="cm">// Apăsați ⚡ GENEREAZĂ…</span>';
  document.getElementById('docSum').textContent='';
  document.querySelectorAll('.doc-card').forEach(function(c){c.classList.remove('dc-ready');c.classList.add('dc-empty');});
  ['dc1s','dc2s','dc3s','dc4s','dc5s'].forEach(function(id){var el=document.getElementById(id);if(el)el.textContent='—';});
  var st=document.getElementById('giftStat');if(st)st.textContent='';
  sts();gt('cfg');closeDlg('dlgReset');
  toast('✅ Sesiune resetată','#2e7d32');
}

function openImport(){
  document.getElementById('importDlgTxt').value='';
  document.getElementById('importDlgPrev').style.display='none';
  document.getElementById('impFileStat').textContent='';
  document.getElementById('impFileStat').style.color='#1565c0';
  document.getElementById('importDZ').style.background='#f0f6ff';
  document.getElementById('importDZ').style.borderColor='#1565c0';
  document.getElementById('scanTip').style.display='none';
  showDlg('importDlg');
}

function runImportDlg(){
  var raw=document.getElementById('importDlgTxt').value.trim();
  if(!raw){toast('⚠ Lipiți textul sau încărcați un fișier!','#bf360c');return;}
  var found=parseCGImproved(raw);
  if(!found.length)found=parseUni(raw);
  if(!found.length){toast('⚠ Nu s-au detectat module. Verificați formatul.','#bf360c');return;}
  document.getElementById('importDlgPrev').textContent='✅ '+found.length+' module: '+found.map(function(f){return f.name.substring(0,12);}).join(', ');
  document.getElementById('importDlgPrev').style.display='block';
  document.getElementById('modBody').innerHTML='';rowIdx=0;
  found.forEach(function(f){addRow(f.name,f.ore,f.nrEv||0);});
  closeDlg('importDlg');sts();
  toast('✅ '+found.length+' module inserate','#2e7d32');
}

// ═══════════════════════════════════════════════════════════════════
// EXTRAGERE PDF cu PDF.js
// ═══════════════════════════════════════════════════════════════════
async function extractModulesFromPDF(file) {
  var _cw=console.warn,_ce=console.error,_cl=console.log;
  console.warn=console.error=console.log=function(){};
  try {
    if(typeof pdfjsLib !== 'undefined') {
      pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
      var ab=await file.arrayBuffer();
      var pdf=await pdfjsLib.getDocument({data:new Uint8Array(ab)}).promise;
      var allLines=[];
      for(var p=1;p<=pdf.numPages;p++){
        var page=await pdf.getPage(p);
        var content=await page.getTextContent();
        var items=[];
        content.items.forEach(function(it){var txt=it.str.trim();if(!txt.length)return;items.push({x:it.transform[4],y:it.transform[5],w:Math.abs(it.transform[0])*txt.length*0.55,text:txt});});
        var rows=[];
        items.forEach(function(it){for(var r=0;r<rows.length;r++){if(Math.abs(rows[r].y-it.y)<=4){rows[r].items.push(it);return;}}rows.push({y:it.y,items:[it]});});
        rows.sort(function(a,b){return b.y-a.y;});
        rows.forEach(function(row){
          row.items.sort(function(a,b){return a.x-b.x;});
          var cells=[],cell='',prevEnd=-9999;
          row.items.forEach(function(it){var gap=it.x-prevEnd;if(prevEnd>-9999&&gap>18){if(cell.trim())cells.push(cell.trim());cell=it.text;}else{cell+=(cell?' ':'')+it.text;}prevEnd=it.x+it.w;});
          if(cell.trim())cells.push(cell.trim());
          if(cells.length>=2)allLines.push(cells.join('\t'));
          else if(cells.length===1)allLines.push(cells[0]);
        });
      }
      var combined=allLines.join('\n');
      var found=parseCGImproved(combined);
      if(!found.length)found=parseUni(combined);
      console.warn=_cw;console.error=_ce;console.log=_cl;
      return found;
    }
  } catch(e){}
  console.warn=_cw;console.error=_ce;console.log=_cl;
  try{var txt=await rdPdf(file);if(!txt)return[];var fb=parseCGImproved(txt);return fb.length?fb:parseUni(txt);}catch(e2){return[];}
}

async function hImportFile(file) {
  if(!file)return;
  var stat=document.getElementById('impFileStat');
  var dz=document.getElementById('importDZ');
  stat.style.color='#1565c0';
  dz.style.background='#e3f2fd';
  dz.style.borderColor='#1565c0';
  document.getElementById('scanTip').style.display='none';
  var ext=file.name.split('.').pop().toLowerCase();
  try {
    if(ext==='docx'||ext==='doc'){
      stat.textContent='⏳ Se procesează '+file.name+'…';
      var t=await rdDocx(file);
      if(!t||t.trim().length<10)throw new Error('Fișier DOCX gol sau corupt.');
      document.getElementById('importDlgTxt').value=t.substring(0,12000);
      var found=parseCGImproved(t);
      if(!found.length)found=parseUni(t);
      if(!found.length){stat.style.color='#e65100';stat.textContent='⚠ Text extras dar module nedetectate. Editați câmpul de mai jos și apăsați Detectează.';dz.style.background='#fff3e0';dz.style.borderColor='#ef6c00';return;}
      document.getElementById('modBody').innerHTML='';rowIdx=0;
      found.forEach(function(f){addRow(f.name,f.ore,f.nrEv||0);});
      stat.style.color='#2e7d32';stat.textContent='✅ '+found.length+' module inserate din '+file.name;
      dz.style.background='#e8f5e9';dz.style.borderColor='#2e7d32';
      closeDlg('importDlg');sts();toast('✅ '+found.length+' module importate (DOCX)','#2e7d32');
    } else if(ext==='pdf'){
      stat.textContent='⏳ Se identifică tabelul din PDF…';
      var found=await extractModulesFromPDF(file);
      if(found.length){
        document.getElementById('modBody').innerHTML='';rowIdx=0;
        found.forEach(function(f){addRow(f.name,f.ore,f.nrEv||0);});
        stat.style.color='#2e7d32';stat.textContent='✅ '+found.length+' module identificate din '+file.name;
        dz.style.background='#e8f5e9';dz.style.borderColor='#2e7d32';
        closeDlg('importDlg');sts();toast('✅ '+found.length+' module importate (PDF)','#2e7d32');
      } else {
        stat.style.color='#e65100';stat.textContent='⚠ PDF scanat sau tabel nedetectat — folosiți instrucțiunile de mai jos.';
        dz.style.background='#fff8e1';dz.style.borderColor='#f59e0b';document.getElementById('scanTip').style.display='block';
      }
    }
  } catch(e){stat.style.color='#c62828';stat.textContent='⚠ '+String(e.message||e).substring(0,180);dz.style.background='#ffebee';dz.style.borderColor='#c62828';}
}

// ═══ PARSERE ═══
function parseCGImproved(raw){
  var lines=raw.split('\n').map(function(l){return l.trim();}).filter(function(l){return l.length>0;});
  var found=[],si=0,ei=lines.length;
  for(var i=0;i<lines.length;i++){if(/ADMINISTRAREA\s+DISCIPLIN/i.test(lines[i])){si=i+1;break;}}
  for(var i=si+2;i<lines.length;i++){if(/PROIECTAREA\s+DIDACTIC|REPARTIZAR|PLANUL\s+CALEND|COMPETENȚE\s+SPECIFICE/i.test(lines[i])){ei=i;break;}}
  var skip=/^(nr\.?|modul|denumire|unitat|ore|total|evaluări|conținut|administrarea|proiectarea|disciplin|luna|semestru)/i;
  for(var i=si;i<ei;i++){
    var ln=lines[i];if(skip.test(ln))continue;
    var cells=splitCells(ln);if(!cells||cells.length<2)continue;
    if(/^(\d{1,2}|total)$/i.test(cells[0]))continue;
    var name='';
    for(var j=0;j<cells.length;j++){var c=cells[j];if(c.length>2&&!/^\d{1,3}$/.test(c)&&!/^[IVXLCDM]+\.?$/.test(c)){name=c.replace(/^(\d{1,2}|[IVXLCDM]+)[\.\s)\-–]+/i,'').trim();if(name.length>1)break;}}
    if(!name)continue;
    var nums=cells.filter(function(c){return/^\d{1,3}$/.test(c.replace(/\s/g,''));}).map(function(c){return parseInt(c);}).filter(function(n){return n>0;});
    if(!nums.length)continue;
    var ore=nums[0],evM=ln.match(/(\d+)\s*(?:EI|ES|EF|eval)/gi);
    var nrEv=evM?evM.reduce(function(s,e){return s+parseInt(e);},0):(nums.length>=2&&nums[1]<=10?nums[1]:0);
    if(name.length>2&&ore>0&&ore<=300)found.push({name:name,ore:ore,nrEv:nrEv});
  }
  return found;
}

function parseUni(raw){
  var found=[],lines=raw.split('\n').map(function(l){return l.trim();}).filter(function(l){return l.length>2;});
  var skip=/^(nr\.?|modul|denumire|ore|evaluări|eval|unitat|conținut|total|sumar|\*{3,}|[-=│|]{4,})/i;
  lines.forEach(function(ln){
    if(skip.test(ln))return;
    var cells=splitCells(ln);var name='',ore=0,nrEv=0;
    if(cells&&cells.length>=2){
      var ci=0;if(/^([IVXLCDM]+\.?|\d+\.?)$/.test(cells[0]))ci=1;
      for(var j=ci;j<cells.length;j++)if(cells[j].length>2&&!/^\d{1,3}$/.test(cells[j])&&!/^[IVXLCDM]+\.?$/.test(cells[j])){name=cells[j];break;}
      var nums=cells.filter(function(c){return/^\d{1,3}$/.test(c);}).map(Number).filter(function(n){return n>0;});
      if(nums.length>=1)ore=nums[0];
      var evM=ln.match(/(\d+)\s*(?:EI|ES|EF|eval)/gi);
      if(evM)nrEv=evM.reduce(function(s,e){return s+parseInt(e);},0);else if(nums.length>=2)nrEv=nums[1];
    } else {
      var m=ln.match(/^(?:[IVXLCDM]+|[\d]+)[\.\s]+(.{3,70}?)\s{2,}(\d{1,3})\s*(?:ore?)?\s*(\d+)?/i);
      if(m){name=m[1].trim();ore=parseInt(m[2]);nrEv=m[3]?parseInt(m[3]):0;}
    }
    if(name.length>2&&ore>0)found.push({name:name,ore:ore,nrEv:nrEv});
  });
  return found;
}

function splitCells(ln){
  if(ln.indexOf('\t')>=0)return ln.split('\t').map(function(c){return c.replace(/[*│║|]/g,'').trim();}).filter(function(c){return c.length>0;});
  if(/[|║]/.test(ln))return ln.split(/[|║]/).map(function(c){return c.replace(/\*/g,'').trim();}).filter(function(c){return c.length>0;});
  return null;
}

// ═══ DOCX extragere JS ═══
async function rdDocx(file){
  if(typeof JSZip==='undefined')throw new Error('Import DOCX necesită conexiune (JSZip).');
  var ab=await file.arrayBuffer(),z=await JSZip.loadAsync(ab),xf=z.file('word/document.xml');
  if(!xf)return '';
  var xml=await xf.async('string');
  function nTxt(x){return x.replace(/<w:br[^>]*>/g,' ').replace(/<w:t[^>]*>([^<]*)<\/w:t>/gi,'$1').replace(/<[^>]+>/g,'').replace(/\s+/g,' ').trim();}
  var tblRx=/<w:tbl[ >][\s\S]*?<\/w:tbl>/g,tp=[],m;
  while((m=tblRx.exec(xml))!==null)tp.push({s:m.index,e:m.index+m[0].length,t:m[0]});
  var rep=xml;
  for(var i=tp.length-1;i>=0;i--){
    var tt=tp[i],rows=[],rR=/<w:tr[ >][\s\S]*?<\/w:tr>/g,rm;rR.lastIndex=0;
    while((rm=rR.exec(tt.t))!==null){
      var cells=[],cR=/<w:tc[ >][\s\S]*?<\/w:tc>/g,cm;cR.lastIndex=0;
      while((cm=cR.exec(rm[0]))!==null){var ct=nTxt(cm[0]);cells.push(ct||'');}
      if(cells.filter(function(c){return c.length>0;}).length>=2)rows.push(cells.join('\t'));
    }
    rep=rep.substring(0,tt.s)+'\n'+rows.join('\n')+'\n'+rep.substring(tt.e);
  }
  return rep.replace(/<w:p[ >]/g,'\n').replace(/<w:t[^>]*>([^<]*)<\/w:t>/gi,'$1').replace(/<[^>]+>/g,'').split('\n').map(function(l){return l.trim();}).filter(function(l){return l.length>0;}).join('\n');
}

// ═══ PDF fallback ═══
async function rdPdf(file){
  try{
    var ab=await file.arrayBuffer(),raw=new TextDecoder('latin1').decode(new Uint8Array(ab)),rowMap={};
    var btRx=/BT([\s\S]*?)ET/g,bm;
    while((bm=btRx.exec(raw))!==null){
      var blk=bm[1],x=0,y=0;
      var tmRx=/([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)\s+Tm/g,tm,ltm=null;
      while((tm=tmRx.exec(blk))!==null)ltm=tm;
      if(ltm){x=parseFloat(ltm[5]);y=parseFloat(ltm[6]);}
      var tdRx=/([-\d.]+)\s+([-\d.]+)\s+Td/g,td;while((td=tdRx.exec(blk))!==null)y+=parseFloat(td[2]);
      var txts=[],tjRx=/\(([^)\\]*(?:\\[\s\S][^)\\]*)*)\)\s*Tj/g,tj;while((tj=tjRx.exec(blk))!==null)txts.push(decPdf(tj[1]));
      var TJRx=/\[([\s\S]*?)\]\s*TJ/g,TJ;while((TJ=TJRx.exec(blk))!==null){var aRx=/\(([^)\\]*(?:\\[\s\S][^)\\]*)*)\)/g,am;while((am=aRx.exec(TJ[1]))!==null)txts.push(decPdf(am[1]));}
      var txt=txts.join('').trim();if(txt.length>0&&y>0){var ry=Math.round(y/2)*2;if(!rowMap[ry])rowMap[ry]=[];rowMap[ry].push({x:x,s:txt});}
    }
    var ys=Object.keys(rowMap).map(Number).sort(function(a,b){return b-a;}),out='';
    ys.forEach(function(y){var cells=rowMap[y].sort(function(a,b){return a.x-b.x;}).map(function(c){return c.s;}).filter(Boolean);if(cells.length)out+=cells.join('\t')+'\n';});
    return out.trim().length>20?out.trim().substring(0,15000):null;
  }catch(e){return null;}
}
function decPdf(s){var w={128:'€',130:'‚',131:'ƒ',132:'„',133:'…',145:'\u2018',146:'\u2019',147:'\u201C',148:'\u201D',150:'–',151:'—'};return s.replace(/\\(\d{3})/g,function(m,o){var c=parseInt(o,8);return(c>=128&&c<=159&&w[c])?w[c]:String.fromCharCode(c);}).replace(/\\n/g,' ').replace(/\\r/g,' ').replace(/\\t/g,'\t').replace(/\\\(/g,'(').replace(/\\\)/g,')').replace(/\\\\/g,'\\');}

// ═══ MODULE TABLE ═══
function addRow(name,ore,nrEv){
  var tb=document.getElementById('modBody'),tr=document.createElement('tr');rowIdx++;
  tr.innerHTML='<td class="rn">'+toRoman(tb.rows.length+1)+'</td>'+
    '<td><input type="text" placeholder="Denumire modul…" value="'+(name||'')+'" style="width:100%;min-width:120px" oninput="onMC()"></td>'+
    '<td><input type="number" min="0" max="300" value="'+(ore||'')+'" placeholder="0" style="width:60px;text-align:center" oninput="onMC()"></td>'+
    '<td><input type="number" min="0" max="20" value="'+(nrEv||'')+'" placeholder="0" style="width:60px;text-align:center" oninput="onMC()"></td>'+
    '<td><button onclick="this.closest(\'tr\').remove();renum()" style="background:none;border:none;color:#c62828;font-size:14px;cursor:pointer;line-height:1">✕</button></td>';
  tb.appendChild(tr);onMC();
}
function renum(){document.querySelectorAll('#modBody tr').forEach(function(r,i){r.querySelector('.rn').textContent=toRoman(i+1);});onMC();}
function onMC(){document.querySelectorAll('#modBody tr').forEach(function(r,i){r.querySelector('.rn').textContent=toRoman(i+1);});sts();}
function getMods(){var res=[];document.querySelectorAll('#modBody tr').forEach(function(tr,i){var c=tr.querySelectorAll('input');var name=c[0].value.trim(),ore=parseInt(c[1].value)||0,nrEv=parseInt(c[2].value)||0;if(name.length>0&&ore>0)res.push({id:i+1,name:name,ore:ore,nrEval:nrEv});});return res;}
function getBloomTypes(lv){return AUTO_BLOOM[lv]||[];}
function getTestCfg(tip){return DEFS[tip]||DEFS.Tematic;}

function buildTests(ms,cfg){
  var t=[],i=1,oa=0,ns=1,ic=getTestCfg('Intrare');
  t.push({nr:i++,key:'ti_0',den:'Test Inițial',tip:'Intrare',modIds:[],allMods:true,nrItemi:ic.nrItemi,timp:ic.timp,prag:ic.prag,bloom:{nc1:ic.nc1,nc2:ic.nc2,nc3:ic.nc3}});
  ms.forEach(function(m){
    var tc=getTestCfg('Tematic');
    var nT=m.nrEval>0?Math.max(1,m.nrEval-1):Math.max(1,Math.floor(m.ore/cfg.a));
    for(var a=1;a<=nT;a++)t.push({nr:i++,key:'tm_'+m.id+'_'+a,den:toRoman(m.id)+'. '+m.name.substring(0,22)+' T'+a,tip:'Tematic',modIds:[m.id],allMods:false,nrItemi:tc.nrItemi,timp:tc.timp,prag:tc.prag,bloom:{nc1:tc.nc1,nc2:tc.nc2,nc3:tc.nc3}});
    if(m.nrEval>0){var sum=getTestCfg('Intermediar');t.push({nr:i++,key:'sm_'+m.id,den:toRoman(m.id)+'. '+m.name.substring(0,22)+' — Sumativă',tip:'Intermediar',modIds:[m.id],allMods:false,nrItemi:sum.nrItemi,timp:sum.timp,prag:sum.prag,bloom:{nc1:sum.nc1,nc2:sum.nc2,nc3:sum.nc3}});}
    oa+=m.ore;
    if(oa>=cfg.s){var np=Math.floor(oa/cfg.s);for(var s2=0;s2<np;s2++){var ic2=getTestCfg('Intermediar'),cv=ms.slice(0,ms.indexOf(m)+1).map(function(x){return x.id;});t.push({nr:i++,key:'int_'+ns,den:'Eval. intermediară nr.'+ns,tip:'Intermediar',modIds:cv,allMods:false,nrItemi:ic2.nrItemi,timp:ic2.timp,prag:ic2.prag,bloom:{nc1:ic2.nc1,nc2:ic2.nc2,nc3:ic2.nc3}});ns++;}oa=oa%cfg.s;}
  });
  var fc=getTestCfg('Final');
  t.push({nr:i,key:'final',den:'Examen Final',tip:'Final',modIds:ms.map(function(m){return m.id;}),allMods:true,nrItemi:fc.nrItemi,timp:fc.timp,prag:fc.prag,bloom:{nc1:fc.nc1,nc2:fc.nc2,nc3:fc.nc3}});
  return t;
}

function renderPlanif(ts){var bC={Tematic:'btem',Intermediar:'bint',Final:'bfin',Intrare:'bi'};var h='<div class="tw"><table><thead><tr><th>#</th><th>Denumire</th><th>Tip</th><th>Module</th><th>Itemi</th><th>Timp</th><th>Prag</th></tr></thead><tbody>';ts.forEach(function(t){h+='<tr class="pr" onclick="quickView(\''+t.key+'\')"><td>'+t.nr+'</td><td><b>'+t.den+'</b></td><td><span class="badge '+(bC[t.tip]||'bi')+'">'+t.tip+'</span></td><td>'+(t.allMods?'Toate':t.modIds.map(toRoman).join(','))+'</td><td>'+t.nrItemi+'</td><td>'+t.timp+'</td><td>'+t.prag+'%</td></tr>';});h+='</tbody></table></div><div style="margin-top:7px;font-size:10px;color:#888">Total: <b>'+ts.length+'</b> teste</div>';document.getElementById('pevW').innerHTML=h;}

function buildTreeUI(cid,cb,ak){var el=document.getElementById(cid);if(!testsList.length){el.innerHTML='<div class="es"><div class="ei">⚡</div>Generați</div>';return;}var grp={Intrare:[],Tematic:[],Intermediar:[],Final:[]};testsList.forEach(function(t){if(grp[t.tip])grp[t.tip].push(t);});var ic={Intrare:'🔵',Tematic:'🟢',Intermediar:'🟣',Final:'🔴'},h='';Object.keys(grp).forEach(function(tip){var l=grp[tip];if(!l.length)return;h+='<div class="tg">'+ic[tip]+' '+tip+'</div>';l.forEach(function(t){var sel=t.key===ak;h+='<div class="ti'+(sel?' sel':'')+'" onclick="'+cb+'(\''+t.key+'\')"><span style="flex:1">'+t.den+'</span><span class="tin">'+t.nrItemi+'</span></div>';});});el.innerHTML=h;}

function genItemList(t,ms){var T=t.nrItemi,b=t.bloom,tO=ms.reduce(function(s,m){return s+m.ore;},0)||1,items=[],nr=1;[{pct:b.nc1,lv:1},{pct:b.nc2,lv:2},{pct:b.nc3,lv:3}].forEach(function(lv){var types=getBloomTypes(lv.lv);if(!lv.pct||!types.length)return;var nI=Math.round(T*lv.pct/100);ms.forEach(function(m){var n=Math.max(1,Math.round(nI*m.ore/tO));for(var j=0;j<n&&nr<=T;j++){var tn=types[j%types.length],ti=IT[tn]||{code:'?',lvl:lv.lv,pts:lv.lv,instr:''};items.push({nr:nr++,typeName:tn,code:ti.code,instr:ti.instr,lvl:lv.lv,pts:ti.pts,mod:m,R:toRoman(m.id)});}});});return items;}

function selectMat(key){
  selMatKey=key;buildTreeUI('matTree','selectMat',key);
  var t=testsList.find(function(x){return x.key===key;});if(!t)return;
  var ms=getMods(),rm=t.allMods?ms:ms.filter(function(m){return t.modIds.indexOf(m.id)>=0;});if(!rm.length)return;
  var T=t.nrItemi,b=t.bloom,tO=rm.reduce(function(s,m){return s+m.ore;},0)||1;var col=TIP_COL[t.tip]||'#555';
  var h='<div style="background:'+col+';color:#fff;border-radius:8px;padding:10px 14px;margin-bottom:10px"><b style="font-size:12px">'+t.den+'</b><div style="font-size:10px;opacity:.9">'+T+' itemi · '+t.timp+' min · NC1:'+b.nc1+'% NC2:'+b.nc2+'% NC3:'+b.nc3+'%</div></div>';
  h+='<div style="overflow-x:auto"><table class="mt3"><thead><tr><th class="tcm" rowspan="2">Modul</th><th class="tcm" rowspan="2">Ore</th><th class="tc1" colspan="2">NC1</th><th class="tc2" colspan="2">NC2</th><th class="tc3" colspan="2">NC3</th><th class="tcm" rowspan="2">Tot</th></tr><tr><th class="tc1">Cod</th><th class="tc1">#</th><th class="tc2">Cod</th><th class="tc2">#</th><th class="tc3">Cod</th><th class="tc3">#</th></tr></thead><tbody>';
  var s1=0,s2=0,s3=0,t1=getBloomTypes(1),t2=getBloomTypes(2),t3=getBloomTypes(3);
  rm.forEach(function(m,i){var n1=Math.max(0,Math.round(T*b.nc1/100*m.ore/tO)),n2=Math.max(0,Math.round(T*b.nc2/100*m.ore/tO)),n3=Math.max(0,Math.round(T*b.nc3/100*m.ore/tO));s1+=n1;s2+=n2;s3+=n3;var c1=t1[i%Math.max(1,t1.length)],c2=t2[i%Math.max(1,t2.length)],c3=t3[i%Math.max(1,t3.length)];h+='<tr><td>'+toRoman(m.id)+'. '+m.name.substring(0,22)+'</td><td>'+m.ore+'</td><td class="dc1" style="font-size:8px">'+(c1?IT[c1].code:'—')+'</td><td class="dc1"><b>'+n1+'</b></td><td class="dc2" style="font-size:8px">'+(c2?IT[c2].code:'—')+'</td><td class="dc2"><b>'+n2+'</b></td><td class="dc3" style="font-size:8px">'+(c3?IT[c3].code:'—')+'</td><td class="dc3"><b>'+n3+'</b></td><td><b>'+(n1+n2+n3)+'</b></td></tr>';});
  h+='<tr class="totr"><td colspan="2">TOTAL</td><td></td><td>'+s1+'</td><td></td><td>'+s2+'</td><td></td><td>'+s3+'</td><td>'+(s1+s2+s3)+'</td></tr></tbody></table></div>';
  h+='<div class="brow" style="margin-top:10px"><button class="b bp" onclick="selectSbl(\''+key+'\');gt(\'sbl\')">→ Șablon</button><button class="b" onclick="exp(\'mat\')">⬇ DOCX</button></div>';
  document.getElementById('matC').innerHTML=h;
}

function selectSbl(key){
  selSblKey=key;buildTreeUI('sblTree','selectSbl',key);
  var t=testsList.find(function(x){return x.key===key;});if(!t)return;
  var ms=getMods(),rm=t.allMods?ms:ms.filter(function(m){return t.modIds.indexOf(m.id)>=0;});if(!rm.length)return;
  var items=genItemList(t,rm);if(!sblData[key])sblData[key]={};
  var col=TIP_COL[t.tip]||'#555';var pt=items.reduce(function(s,it){return s+it.pts;},0);
  var h='<div style="background:'+col+';color:#fff;border-radius:8px;padding:10px 14px;margin-bottom:10px"><b style="font-size:13px">📋 ȘABLON — '+t.den+'</b><div style="font-size:10px;opacity:.9;margin-top:2px">'+t.nrItemi+' itemi · '+pt+' pct · '+t.timp+' min · Prag '+t.prag+'%</div></div>';
  var pcts=[4,9,20,32,47,62,77,87,94,100];
  h+='<div style="margin-bottom:10px;padding:8px;background:#f0f6ff;border-radius:7px;border:1px solid #c5cfe0"><b style="font-size:9px;color:#1565c0">📊 SCHEMA NOTE</b><div style="overflow-x:auto;margin-top:5px"><table style="border-collapse:collapse;font-size:9px;width:100%"><thead><tr>';
  pcts.forEach(function(v,i){var pv=i===0?0:pcts[i-1]+1;h+='<th style="background:#1565c0;color:#fff;padding:3px 5px;border:1px solid #c5cfe0">'+Math.round(pv*pt/100)+'–'+Math.round(v*pt/100)+'</th>';});
  h+='</tr></thead><tbody><tr>';pcts.forEach(function(v,i){h+='<td style="padding:3px 5px;text-align:center;font-weight:700;color:#1565c0;border:1px solid #c5cfe0;background:'+(i%2?'#eef3fc':'#fff')+'">'+(i+1)+'</td>';});h+='</tr></tbody></table></div></div>';
  [1,2,3].forEach(function(lv){var lvI=items.filter(function(it){return it.lvl===lv;});if(!lvI.length)return;var c=NC_COL[lv];h+='<div style="background:'+c+';color:#fff;border-radius:6px;padding:7px 12px;font-size:11px;font-weight:700;margin:12px 0 4px">'+NC_NM[lv]+' — '+lvI.length+' itemi · '+(['','1p','2p','4p'][lv])+'</div>';lvI.forEach(function(it){var saved=sblData[key][it.nr-1]||'';h+='<div style="background:#fff;border:1px solid #dce3ef;border-radius:6px;margin:4px 0;border-left:4px solid '+c+';padding:8px 10px"><div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-bottom:5px"><span style="background:'+c+';color:#fff;font-size:10px;font-weight:700;padding:2px 8px;border-radius:4px">'+it.code+' '+it.nr+'</span><span style="font-size:9px;background:#f0f4f8;padding:2px 6px;border-radius:3px;color:#546e7a">'+it.typeName+'</span><span style="font-size:9px;background:'+c+';color:#fff;padding:1px 6px;border-radius:3px">'+it.pts+'p</span><span style="font-size:9px;color:#888;margin-left:auto">'+it.R+'. '+it.mod.name.substring(0,28)+'</span></div><div style="font-size:9px;color:#546e7a;font-style:italic;margin-bottom:5px;padding:3px 6px;background:#fffbea;border-radius:4px">'+it.instr+'</div><textarea style="width:100%;height:52px;font-size:11px;border:1px solid #c5cfe0;border-radius:5px;padding:5px 7px;background:#fafbfd;font-family:inherit;resize:vertical" id="sbl_'+key+'_'+(it.nr-1)+'" placeholder="Completați enunțul…" onchange="sblData[\''+key+'\']['+(it.nr-1)+']=this.value">'+xe(saved)+'</textarea></div>';});});
  h+='<div class="brow" style="margin-top:12px"><button class="b bg" onclick="expSbl(\''+key+'\')">⬇ Export DOCX</button><button class="b bp" onclick="selectMat(\''+key+'\');gt(\'mat\')">→ Matrice</button><button class="b" onclick="gt(\'gft\')">💾 Bancă GIFT</button></div>';
  document.getElementById('sblC').innerHTML=h;
}
function quickView(k){selectMat(k);selectSbl(k);gt('sbl');}

function buildCol(ms,cfg){var h='<div class="tw"><table><thead><tr><th>#</th><th>Modul</th><th>Ore</th><th>Total</th><th>Binar</th><th>Singulară</th><th>Multiplă</th></tr></thead><tbody>';var tI=0;ms.forEach(function(m,i){var T=m.ore*2*cfg.m;tI+=T;h+='<tr><td>'+(i+1)+'</td><td><b>'+toRoman(m.id)+'.</b> '+m.name.substring(0,30)+'</td><td>'+m.ore+'</td><td><b>'+T+'</b></td><td>'+Math.round(T*.32)+'</td><td>'+Math.round(T*.14)+'</td><td>'+Math.round(T*.24)+'</td></tr>';});h+='<tr style="background:#e8ecf0;font-weight:700"><td colspan="3">Total</td><td>'+tI+'</td><td colspan="3"></td></tr></tbody></table></div>';document.getElementById('colW').innerHTML=h;}
function buildNoteAll(){var h='';testsList.forEach(function(t){var pt=Math.round(t.nrItemi*t.bloom.nc1/100)+Math.round(t.nrItemi*t.bloom.nc2/100*2)+Math.round(t.nrItemi*t.bloom.nc3/100*4);var col=TIP_COL[t.tip]||'#555';var pcts=[4,9,20,32,47,62,77,87,94,100];h+='<div style="margin-bottom:12px;background:#fff;border-radius:8px;border:1px solid #c5cfe0;overflow:hidden"><div style="background:'+col+';color:#fff;padding:6px 12px;font-size:11px;font-weight:700">'+t.den+' · '+pt+' pct · Prag '+t.prag+'%</div><div style="padding:8px;overflow-x:auto"><table style="border-collapse:collapse;font-size:10px;width:100%"><thead><tr>';pcts.forEach(function(v,i){var pv=i===0?0:pcts[i-1]+1;h+='<th style="background:#f0f4f8;color:#555;padding:4px 7px;border:1px solid #c5cfe0;text-align:center">'+Math.round(pv*pt/100)+'–'+Math.round(v*pt/100)+'</th>';});h+='</tr></thead><tbody><tr>';pcts.forEach(function(v,i){h+='<td style="padding:4px 7px;text-align:center;font-weight:700;color:'+col+';border:1px solid #c5cfe0">'+(i+1)+'</td>';});h+='</tr></tbody></table></div></div>';});document.getElementById('noteW').innerHTML=h||'<div class="es"><div class="ei">📈</div>Generați</div>';}

function buildGift(ms,c){
  if(!testsList.length){giftRaw='';document.getElementById('giftO').innerHTML='<span class="cm">// Apăsați ⚡ GENEREAZĂ mai întâi.</span>';return;}
  var g='',raw='';
  var hdr='// ══════════════════════════════════════════════════\n// BANCĂ GIFT — '+c+'\n// e-PLANIFICATOR · Ord.644/2020 · '+new Date().toLocaleDateString('ro-RO')+'\n// ══════════════════════════════════════════════════\n\n';
  g+='<span class="cm">'+xe(hdr.replace(/\n/g,'<br>'))+'</span>';raw+=hdr;
  var tot=0;
  testsList.forEach(function(t){
    var rm=t.allMods?ms:ms.filter(function(m){return t.modIds.indexOf(m.id)>=0;});if(!rm.length)return;
    var items=genItemList(t,rm);tot+=items.length;
    var catPath='$course$/'+c+'/'+String(t.nr).padStart(2,'0')+'_'+slug(t.den)+'_'+t.tip;
    var sep='// ──────────────────────────────────────────────\n';
    g+='\n<span class="cm">'+xe(sep)+'// TEST '+t.nr+': '+xe(t.den)+' ['+t.tip+']\n</span>';
    g+='<span class="gk">$CATEGORY:</span> <span class="cat">'+xe(catPath)+'</span>\n\n';
    raw+=sep+'// TEST '+t.nr+': '+t.den+' ['+t.tip+']\n$CATEGORY: '+catPath+'\n\n';
    [1,2,3].forEach(function(lv){
      var lvI=items.filter(function(it){return it.lvl===lv;});if(!lvI.length)return;
      g+='<span class="cm">// '+NC_NM[lv]+' ('+lvI.length+' itemi)\n</span>';
      raw+='// '+NC_NM[lv]+' ('+lvI.length+' itemi)\n';
      lvI.forEach(function(it){
        var iCode='T'+String(t.nr).padStart(2,'0')+'_'+it.code+'_'+String(it.nr).padStart(3,'0');
        var saved=(sblData[t.key]&&sblData[t.key][it.nr-1])?sblData[t.key][it.nr-1]:'';
        var enunt=saved||'['+it.typeName+' · '+it.R+'. '+it.mod.name.substring(0,20)+'] '+it.instr;
        g+='<span class="q">::'+xe(iCode)+'::</span> '+xe(enunt)+' <span class="ans">'+xe(giftTemplate(it.code))+'</span>\n\n';
        raw+='::'+iCode+':: '+enunt+' '+giftTemplate(it.code)+'\n\n';
      });
    });
  });
  giftRaw=raw;document.getElementById('giftO').innerHTML=g;
  var st=document.getElementById('giftStat');if(st)st.textContent='✅ '+testsList.length+' teste · '+tot+' itemi';
}

function dlGift(){if(!giftRaw||!giftRaw.trim()){toast('⚠ Generați întâi!','#bf360c');return;}var disc=document.getElementById('cC').value||'CURS';var b=new Blob([giftRaw],{type:'text/plain;charset=utf-8'}),u=URL.createObjectURL(b),a=document.createElement('a');a.href=u;a.download='BancaGIFT_'+disc+'.gift';document.body.appendChild(a);a.click();setTimeout(function(){document.body.removeChild(a);URL.revokeObjectURL(u);},300);toast('⬇ BancaGIFT_'+disc+'.gift','#2e7d32');}

function previewGiftBank(){var ms=getMods();if(!testsList.length||!ms.length){toast('⚠ Generați întâi!','#bf360c');return;}var h='<div style="font-size:10px;color:#666;margin-bottom:10px;padding:7px 10px;background:#f0f6ff;border-radius:6px;border:1px solid #c5cfe0">💡 O categorie Moodle per test.</div>';testsList.forEach(function(t){var rm=t.allMods?ms:ms.filter(function(m){return t.modIds.indexOf(m.id)>=0;});if(!rm.length)return;var items=genItemList(t,rm);var tipCol=TIP_COL[t.tip]||'#555';var disc=document.getElementById('cC').value||'CURS';var catPath='$course$/'+disc+'/'+String(t.nr).padStart(2,'0')+'_'+slug(t.den)+'_'+t.tip;var tipIco={Intrare:'🔵',Tematic:'🟢',Intermediar:'🟣',Final:'🔴'}[t.tip]||'⚪';h+='<div class="gp-test"><div class="gp-test-hdr" style="background:'+tipCol+'">'+tipIco+' <b>Test '+t.nr+':</b> '+xe(t.den)+'<span style="margin-left:auto;font-size:9px;opacity:.85">'+t.nrItemi+' itemi · '+t.timp+' min</span></div><div class="gp-test-cat">$CATEGORY: '+xe(catPath)+'</div>';[1,2,3].forEach(function(lv){var lvI=items.filter(function(it){return it.lvl===lv;});if(!lvI.length)return;var ncCol=NC_COL[lv];h+='<div class="gp-nc" style="color:'+ncCol+'">'+NC_NM[lv]+' — '+lvI.length+' itemi</div>';lvI.forEach(function(it){var iCode='T'+String(t.nr).padStart(2,'0')+'_'+it.code+'_'+String(it.nr).padStart(3,'0');var saved=(sblData[t.key]&&sblData[t.key][it.nr-1])?sblData[t.key][it.nr-1]:'';h+='<div class="gp-item"><span class="gp-chip" style="background:'+ncCol+'">'+it.code+'</span><span class="gp-code">::'+iCode+'::</span><span class="gp-instr">'+(saved?xe(saved.substring(0,60)):xe(it.typeName)+' · '+xe(it.instr.substring(0,50)))+'</span></div>';});});h+='</div>';});document.getElementById('giftPrevContent').innerHTML=h;showDlg('giftPrevOv');}

function runAll(){
  var ms=getMods();if(!ms.length){toast('⚠ Adăugați module!','#bf360c');gt('cfg');return;}
  var c=document.getElementById('cC').value||'CURS',cfg={a:AUTO_CFG.a,s:AUTO_CFG.s,m:AUTO_CFG.m};
  testsList=buildTests(ms,cfg);
  renderPlanif(testsList);
  buildTreeUI('matTree','selectMat',null);buildTreeUI('sblTree','selectSbl',null);
  var fin=testsList.find(function(t){return t.tip==='Final';});if(fin){selectMat(fin.key);selectSbl(fin.key);}
  buildCol(ms,cfg);buildGift(ms,c);buildNoteAll();
  updateDocPanel(ms);sts();
  toast('✅ '+testsList.length+' teste generate','#2e7d32');
  var td=document.getElementById('t-doc');td.classList.add('pulse');setTimeout(function(){td.classList.remove('pulse');},3100);
  setTimeout(function(){gt('doc');},600);
}
function updateDocPanel(ms){var tot=ms.reduce(function(s,m){return s+m.ore;},0);document.getElementById('docSum').textContent=ms.length+' module · '+tot+' ore · '+testsList.length+' teste';document.querySelectorAll('.doc-card').forEach(function(c){c.classList.remove('dc-empty');c.classList.add('dc-ready');});document.getElementById('dc1s').textContent='✅ '+testsList.length+' teste';document.getElementById('dc2s').textContent='✅ '+ms.length+' module · '+tot+' ore';document.getElementById('dc3s').textContent='✅ Examen Final';document.getElementById('dc4s').textContent='✅ '+testsList.length+' categorii GIFT';document.getElementById('dc5s').textContent='✅ '+testsList.length+' șabloane';}

function tmn(id){var w=document.getElementById(id).classList.contains('open');cmn();if(!w)document.getElementById(id).classList.add('open');}
function cmn(){document.querySelectorAll('.mn').forEach(function(m){m.classList.remove('open');});}
document.addEventListener('click',function(e){if(!e.target.closest('.mn'))cmn();});
function gt(id){document.querySelectorAll('.tp').forEach(function(p){p.classList.remove('on');});document.querySelectorAll('.tab').forEach(function(t){t.classList.remove('on');});var p=document.getElementById('p-'+id),t=document.getElementById('t-'+id);if(p)p.classList.add('on');if(t)t.classList.add('on');cmn();}
function togSec(id){document.getElementById(id).classList.toggle('closed');var a=document.querySelector('#'+id+' .arr');if(a)a.textContent=document.getElementById(id).classList.contains('closed')?'▶':'▼';}
function sts(){var ms=getMods(),tO=ms.reduce(function(s,m){return s+(m.ore||0);},0);setSb(2,ms.length>0,'Module: '+ms.length);setSb(3,tO>0,'Ore: '+tO);setSb(4,testsList.length>0,'Teste: '+testsList.length);}
function setSb(n,ok,tx){var d=document.getElementById('ds'+n),s=document.getElementById('ss'+n);if(d)d.className='dot'+(ok?' ok':'');if(s)s.textContent=tx;}
function toast(m,bg){var t=document.getElementById('toastEl');t.textContent=m;t.style.background=bg||'#1a1a2e';t.style.display='block';clearTimeout(t._t);t._t=setTimeout(function(){t.style.display='none';},4000);}
function showDlg(id){document.getElementById(id).classList.add('show');cmn();}
function closeDlg(id){document.getElementById(id).classList.remove('show');}
document.querySelectorAll('.dlgo').forEach(function(d){d.addEventListener('click',function(e){if(e.target===d)d.classList.remove('show');});});

function buildDocx(items){var body='';items.forEach(function(it){if(it.t==='title')body+='<w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:b/><w:sz w:val="28"/><w:color w:val="1F3864"/></w:rPr><w:t>'+xe(it.v)+'</w:t></w:r></w:p>';else if(it.t==='h1')body+='<w:p><w:pPr><w:shd w:val="clear" w:color="auto" w:fill="E8F0FE"/></w:pPr><w:r><w:rPr><w:b/><w:sz w:val="24"/><w:color w:val="'+(it.col||'1565C0')+'"/></w:rPr><w:t>'+xe(it.v)+'</w:t></w:r></w:p>';else if(it.t==='p')body+='<w:p><w:r><w:rPr><w:sz w:val="20"/></w:rPr><w:t xml:space="preserve">'+xe(it.v)+'</w:t></w:r></w:p>';else if(it.t==='line')body+='<w:p/>';else if(it.t==='table')body+=bTbl(it.headers,it.rows,it.hc||'1565C0')+'<w:p/>';});var doc='<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>'+body+'<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1134" w:right="851" w:bottom="1134" w:left="1701"/></w:sectPr></w:body></w:document>';var z=new JSZip();z.file('[Content_Types].xml','<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>');z.file('_rels/.rels','<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>');z.file('word/document.xml',doc);return z.generateAsync({type:'blob',mimeType:'application/vnd.openxmlformats-officedocument.wordprocessingml.document'});}
function bTbl(h,rows,col){var nc=h.length,cw=Math.floor(9000/nc),x='<w:tbl><w:tblPr><w:tblW w:w="9000" w:type="dxa"/><w:tblBorders><w:top w:val="single" w:sz="4" w:color="C5CFE0"/><w:left w:val="single" w:sz="4" w:color="C5CFE0"/><w:bottom w:val="single" w:sz="4" w:color="C5CFE0"/><w:right w:val="single" w:sz="4" w:color="C5CFE0"/><w:insideH w:val="single" w:sz="4" w:color="C5CFE0"/><w:insideV w:val="single" w:sz="4" w:color="C5CFE0"/></w:tblBorders></w:tblPr><w:tr>';h.forEach(function(c){x+='<w:tc><w:tcPr><w:tcW w:w="'+cw+'" w:type="dxa"/><w:shd w:val="clear" w:color="auto" w:fill="'+col+'"/></w:tcPr><w:p><w:r><w:rPr><w:b/><w:color w:val="FFFFFF"/><w:sz w:val="16"/></w:rPr><w:t>'+xe(c)+'</w:t></w:r></w:p></w:tc>';});x+='</w:tr>';rows.forEach(function(r,ri){x+='<w:tr>';r.forEach(function(c){x+='<w:tc><w:tcPr><w:tcW w:w="'+cw+'" w:type="dxa"/><w:shd w:val="clear" w:color="auto" w:fill="'+(ri%2?'EEF3FC':'FFFFFF')+'"/></w:tcPr><w:p><w:r><w:rPr><w:sz w:val="16"/></w:rPr><w:t xml:space="preserve">'+xe(c)+'</w:t></w:r></w:p></w:tc>';});x+='</w:tr>';});return x+'</w:tbl>';}
function itemsToText(items){return items.map(function(it){if(it.t==='title')return it.v+'\n'+'═'.repeat(50);if(it.t==='h1')return '\n▌ '+it.v;if(it.t==='p')return '  '+it.v;if(it.t==='table')return [it.headers.join(' | ')].concat(it.rows.map(function(r){return r.join(' | ');})).join('\n');return '';}).join('\n');}
function showExp(i,f,g){_expItems=i;_expFn=f;_expGift=!!g;document.getElementById('expTitle').textContent=f;document.getElementById('expTxt').value=g?giftRaw:itemsToText(i);document.getElementById('expDlBtn').textContent=g?'⬇ .gift':'⬇ DOCX';document.getElementById('expFmt').textContent=g?'GIFT Moodle':'Word';document.getElementById('expOv').classList.add('show');}
function expCopy(){var t=document.getElementById('expTxt');t.select();try{document.execCommand('copy');toast('✅ Copiat','#2e7d32');}catch(e){navigator.clipboard.writeText(t.value).then(function(){toast('✅','#2e7d32');});}}
function expDl(){if(_expGift){var b=new Blob([giftRaw],{type:'text/plain'}),u=URL.createObjectURL(b),a=document.createElement('a');a.href=u;a.download=_expFn;document.body.appendChild(a);a.click();setTimeout(function(){document.body.removeChild(a);URL.revokeObjectURL(u);},300);toast('⬇','#2e7d32');return;}toast('⏳…','#1565c0');buildDocx(_expItems).then(function(b){var u=URL.createObjectURL(b),a=document.createElement('a');a.href=u;a.download=_expFn;document.body.appendChild(a);a.click();setTimeout(function(){document.body.removeChild(a);URL.revokeObjectURL(u);},300);toast('⬇ '+_expFn,'#2e7d32');}).catch(function(e){toast('⚠ '+e.message,'#bf360c');});}
document.getElementById('expOv').addEventListener('click',function(e){if(e.target===this)this.classList.remove('show');});
function expSbl(key){var t=testsList.find(function(x){return x.key===key;});if(!t)return;var ms=getMods(),rm=t.allMods?ms:ms.filter(function(m){return t.modIds.indexOf(m.id)>=0;});var items=genItemList(t,rm),saved=sblData[key]||{};var docItems=[{t:'title',v:'ȘABLON TEST — '+t.den},{t:'p',v:t.nrItemi+' itemi · '+t.timp+' min · Prag '+t.prag+'%'},{t:'line'}];[1,2,3].forEach(function(lv){var lvI=items.filter(function(it){return it.lvl===lv;});if(!lvI.length)return;docItems.push({t:'h1',v:NC_NM[lv]+' — '+lvI.length+' itemi · '+(['','1p','2p','4p'][lv]),col:['','1565C0','2E7D32','BF360C'][lv]});lvI.forEach(function(it){docItems.push({t:'p',v:'['+it.code+' '+it.nr+'] '+it.typeName+' ('+it.pts+'p) · '+it.R+'. '+it.mod.name});docItems.push({t:'p',v:'↳ '+it.instr});docItems.push({t:'p',v:saved[it.nr-1]?'Enunț: '+saved[it.nr-1]:'Enunț: ___________________________________________'});docItems.push({t:'line'});});});_expItems=docItems;_expFn='Sablon_'+t.den.replace(/\s+/g,'_').substring(0,28)+'.docx';_expGift=false;document.getElementById('expTitle').textContent=t.den;document.getElementById('expTxt').value=itemsToText(docItems);document.getElementById('expDlBtn').textContent='⬇ DOCX';document.getElementById('expFmt').textContent='Word';document.getElementById('expOv').classList.add('show');}
function exp(type){var ms=getMods(),cM=AUTO_CFG.m,items=[],f='';if(type==='t2'){if(!testsList.length){toast('⚠ Generați întâi!','#bf360c');return;}items.push({t:'title',v:'LISTA TESTELOR — Tabelul 2'});items.push({t:'line'});items.push({t:'table',headers:['#','Denumire','Tip','Module','Itemi','Timp','Prag'],rows:testsList.map(function(t){return[String(t.nr),t.den,t.tip,t.allMods?'Toate':t.modIds.map(toRoman).join(','),String(t.nrItemi),String(t.timp),t.prag+'%'];})});f='Tabelul2.docx';}else if(type==='t3'){if(!ms.length)return;items.push({t:'title',v:'COLECȚII — Tabelul 3'});items.push({t:'line'});items.push({t:'table',headers:['Modul','Ore','Total','Binar','Sing','Mult'],rows:ms.map(function(m){var T=m.ore*2*cM;return[toRoman(m.id)+'. '+m.name,m.ore+'h',String(T),String(Math.round(T*.32)),String(Math.round(T*.14)),String(Math.round(T*.24))];})});f='Tabelul3.docx';}else if(type==='mat'){var tm=testsList.find(function(t){return t.key===selMatKey;})||testsList.find(function(t){return t.tip==='Final';});if(!tm)return;var rm=tm.allMods?ms:ms.filter(function(m){return tm.modIds.indexOf(m.id)>=0;}),tO=rm.reduce(function(s,m){return s+m.ore;},0)||1;items.push({t:'title',v:'MATRICE — Anexa 2'});items.push({t:'p',v:'Test: '+tm.den+' · '+tm.nrItemi+' itemi'});items.push({t:'line'});var s1=0,s2=0,s3=0,mR=rm.map(function(m){var n1=Math.max(0,Math.round(tm.nrItemi*tm.bloom.nc1/100*m.ore/tO)),n2=Math.max(0,Math.round(tm.nrItemi*tm.bloom.nc2/100*m.ore/tO)),n3=Math.max(0,Math.round(tm.nrItemi*tm.bloom.nc3/100*m.ore/tO));s1+=n1;s2+=n2;s3+=n3;return[toRoman(m.id)+'. '+m.name.substring(0,25),m.ore+'h',String(n1),String(n2),String(n3),String(n1+n2+n3)];});mR.push(['TOTAL','',String(s1),String(s2),String(s3),String(s1+s2+s3)]);items.push({t:'table',headers:['Modul','Ore','NC1','NC2','NC3','Total'],rows:mR});f='Matrice.docx';}else if(type==='gift'){if(!giftRaw){toast('⚠ Generați întâi!','#bf360c');return;}var disc=document.getElementById('cC').value||'CURS';showExp([],'BancaGIFT_'+disc+'.gift',true);cmn();return;}if(items.length&&f)showExp(items,f,false);cmn();}
function doPrint(){try{var w=window.open('','_blank');if(!w)return;var a=document.querySelector('.tp.on');w.document.write('<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Print</title><style>body{font-family:Segoe UI;font-size:11px;padding:20px}table{border-collapse:collapse;width:100%}th,td{border:1px solid #ccc;padding:5px 7px}th{background:#f0f4f8}@media print{.np{display:none}}</style></head><body><button class="np" onclick="window.print()">🖨 Print</button>'+(a?a.innerHTML:'')+'</body></html>');w.document.close();}catch(e){}}
function loadDemo(){document.getElementById('modBody').innerHTML='';rowIdx=0;document.getElementById('cC').value='Informatica_X';[['Recapitulare și consolidare',2,1],['Metode de descriere a limbajelor',4,1],['Vocabularul și sintaxa limbajului',5,1],['Tipuri de date simple',10,2],['Instrucțiuni de programare',25,3],['Elemente de Web Design',22,2]].forEach(function(d){addRow(d[0],d[1],d[2]);});sts();toast('📄 Demo Informatică cl.X','#2e7d32');}

addRow('',0,0);addRow('',0,0);addRow('',0,0);
sts();