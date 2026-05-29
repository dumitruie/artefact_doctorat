// ═══ ITEM TYPES ═══
var IT={
  'Alegere duală':    {code:'AF', lvl:1,pts:1,instr:'Identifică valoarea de adevăr a afirmației de mai jos.',ans:'TRUE sau FALSE'},
  'Alegere singulară':{code:'AS', lvl:1,pts:1,instr:'Selectează răspunsul corect din variantele propuse.',ans:'=Răspuns corect ~Variantă greșită 1 ~Variantă greșită 2'},
  'Alegere multiplă': {code:'AM', lvl:1,pts:1,instr:'Selectează toate variantele corecte din lista de mai jos.',ans:'~%50%Răspuns1 ~%50%Răspuns2 ~%-100%Greșit'},
  'Tip pereche':      {code:'TP', lvl:1,pts:1,instr:'Asociază elementele din coloana A cu cele corespunzătoare din coloana B.',ans:'=A1 -> B1 =A2 -> B2'},
  'Completare':       {code:'C',  lvl:2,pts:2,instr:'Completează spațiile libere cu informația corectă.',ans:'=răspuns1 =răspuns2'},
  'Răspuns scurt':    {code:'RS', lvl:2,pts:2,instr:'Scrie în spațiul liber răspunsul corect (cuvânt, expresie sau valoare numerică).',ans:'=răspuns'},
  'Structurat':       {code:'Str',lvl:2,pts:2,instr:'Rezolvă cerințele de mai jos, respectând pașii indicați.',ans:''},
  'Calculat':         {code:'Cal',lvl:2,pts:2,instr:'Calculează valoarea cerută utilizând datele din enunț.',ans:''},
  'Ordonare':         {code:'O',  lvl:2,pts:2,instr:'Ordonează corect elementele date conform criteriului indicat.',ans:''},
  'Probl. libere':    {code:'PL', lvl:3,pts:4,instr:'Rezolvă problema utilizând metoda potrivită și argumentează soluția.',ans:''},
  'Eseu structurat':  {code:'Es', lvl:3,pts:4,instr:'Elaborează un răspuns argumentat respectând reperele indicate.',ans:''},
  'Eseu nestructurat':{code:'EsN',lvl:3,pts:4,instr:'Redactează un eseu în care analizezi și argumentezi tema propusă.',ans:''},
  'CodeRunner':       {code:'CR', lvl:3,pts:4,instr:'Scrie un program care rezolvă cerința dată, utilizând datele din enunț.',ans:''}
};
var NC_COL={1:'#1565c0',2:'#2e7d32',3:'#bf360c'};
var NC_NM={1:'NC1 – Cunoaștere',2:'NC2 – Aplicare',3:'NC3 – Analiză-Sinteză'};

// ═══ STATE ═══
var testsList=[],giftRaw='',selMatKey=null,selSblKey=null,selGftKey=null;
var sblData={},giftBank={};
var bloomCfgs={},testCfgs={},rowIdx=0;
var _expItems=[],_expFn='',_expGift=false;
var DEFS={
  Intrare:    {nc1:60,nc2:30,nc3:10,nrItemi:15,timp:20,prag:30},
  Tematic:    {nc1:50,nc2:35,nc3:15,nrItemi:16,timp:35,prag:50},
  Intermediar:{nc1:30,nc2:40,nc3:30,nrItemi:30,timp:50,prag:70},
  Final:      {nc1:20,nc2:30,nc3:50,nrItemi:30,timp:60,prag:70}
};

// ═══ HELPERS ═══
function toRoman(n){if(n<1||n>50)return String(n);var v=[50,40,10,9,5,4,1],s=['L','XL','X','IX','V','IV','I'],r='';for(var i=0;i<v.length;i++)while(n>=v[i]){r+=s[i];n-=v[i];}return r;}
function romanToNum(s){if(!s)return 0;var m={I:1,V:5,X:10,L:50},r=0,u=s.toUpperCase();for(var i=0;i<u.length;i++){var c=m[u[i]],nx=m[u[i+1]];if(!c)return 0;r+=nx&&c<nx?nx-c:(i+=nx&&c<nx?1:0,c);}
// simpler:
r=0;u=s.toUpperCase();for(var i=0;i<u.length;i++){var cv={I:1,V:5,X:10,L:50}[u[i]]||0,nv={I:1,V:5,X:10,L:50}[u[i+1]]||0;r+=cv<nv?-cv:cv;}return r;}
function xe(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
function P(s,n){s=String(s);while(s.length<n)s+=' ';return s.substring(0,n);}

// ═══ MODULE TABLE ═══
function addRow(name,ore,nrEv){
  var tb=document.getElementById('modBody'),idx=++rowIdx,rn=tb.rows.length+1,tr=document.createElement('tr');
  tr.dataset.idx=idx;
  tr.innerHTML='<td class="rn">'+toRoman(rn)+'</td>'+
    '<td><input type="text" placeholder="Denumire modul…" value="'+(name||'')+'" style="width:100%;min-width:120px" oninput="onModChange()"></td>'+
    '<td><input type="number" min="0" max="300" value="'+(ore||'')+'" placeholder="0" style="width:60px;text-align:center" oninput="onModChange()"></td>'+
    '<td><input type="number" min="0" max="20" value="'+(nrEv||'')+'" placeholder="auto" style="width:60px;text-align:center" oninput="onModChange()"></td>'+
    '<td><button onclick="this.closest(\'tr\').remove();onModChange()" style="background:none;border:none;color:#c62828;font-size:14px;cursor:pointer;line-height:1">✕</button></td>';
  tb.appendChild(tr);onModChange();
}
function onModChange(){
  document.querySelectorAll('#modBody tr').forEach(function(tr,i){tr.querySelector('.rn').textContent=toRoman(i+1);});
  populateSel();sts();
}
function getMods(){
  var res=[];
  document.querySelectorAll('#modBody tr').forEach(function(tr,i){
    var cells=tr.querySelectorAll('input');
    var name=cells[0].value.trim(),ore=parseInt(cells[1].value)||0,nrEv=parseInt(cells[2].value)||0;
    if(name.length>0&&ore>0)res.push({id:i+1,name:name,ore:ore,nrEval:nrEv,subs:[],comps:[],evals:[]});
  });
  return res;
}

// ═══ IMPORT ═══
function importFromText(){
  var raw=document.getElementById('impTxt').value.trim();
  if(!raw){toast('⚠ Lipiți text!','#bf360c');return;}
  var lines=raw.split('\n').map(function(l){return l.trim();}).filter(function(l){return l.length>2;});
  var skip=/^(nr\.?|modul|denumire|ore|evaluări|eval|unitat|conținut|total|sumar|\*{3,}|[-=│|]{4,}|[╔╗╚╝═─┌└]{3,})/i;
  var found=[];
  lines.forEach(function(ln){
    if(skip.test(ln))return;
    var name='',ore=0,nrEv=0,cells=null;
    if(ln.indexOf('\t')>=0)cells=ln.split('\t').map(function(c){return c.replace(/[*│║|]/g,'').trim();}).filter(function(c){return c.length>0;});
    else if(/[|║]/.test(ln))cells=ln.split(/[|║]/).map(function(c){return c.replace(/\*/g,'').trim();}).filter(function(c){return c.length>0;});
    if(cells&&cells.length>=2){
      var ci=0;if(/^([IVXLCDM]+\.?|\d+\.?)$/.test(cells[0]))ci=1;
      for(var j=ci;j<cells.length;j++)if(cells[j].length>2&&!/^\d{1,3}$/.test(cells[j])&&!/^[IVXLCDM]+\.?$/.test(cells[j])){name=cells[j];break;}
      var nums=cells.filter(function(c){return /^\d{1,3}$/.test(c);}).map(Number).filter(function(n){return n>0;});
      if(nums.length>=1)ore=nums[0];
      var evM=ln.match(/(\d+)\s*(?:EI|ES|EF|eval)/gi);
      if(evM)nrEv=evM.reduce(function(s,e){return s+parseInt(e);},0);
      else if(nums.length>=2)nrEv=nums[1];
    } else {
      var m=ln.match(/^(?:[IVXLCDM]+|[\d]+)[\.\s]+(.{3,70}?)\s{2,}(\d{1,3})\s*(?:ore?)?\s*(\d+)?/i);
      if(m){name=m[1].replace(/[*│║|]/g,'').trim();ore=parseInt(m[2]);nrEv=m[3]?parseInt(m[3]):0;}
    }
    if(name.length>2&&ore>0)found.push({name:name,ore:ore,nrEv:nrEv});
  });
  if(!found.length){toast('⚠ Nu s-au detectat module. Verificați formatul.','#bf360c');return;}
  document.getElementById('modBody').innerHTML='';rowIdx=0;
  found.forEach(function(f){addRow(f.name,f.ore,f.nrEv);});
  document.getElementById('impTxt').value='';
  toast('✅ '+found.length+' module importate','#2e7d32');
}

// ═══ SELECTORS — sync with modules ═══
function populateSel(){
  var ms=getMods();
  ['bloomModSel','cfgModSel'].forEach(function(id){
    var s=document.getElementById(id);if(!s)return;
    var cv=s.value;while(s.options.length>1)s.remove(1);
    ms.forEach(function(m){s.add(new Option(toRoman(m.id)+'. '+m.name.substring(0,24),'m'+m.id));});
    if(cv&&Array.from(s.options).some(function(o){return o.value===cv;}))s.value=cv;
  });
  filterTip('bloomModSel','bloomTipSel');filterTip('cfgModSel','cfgTipSel');
  buildSchemaInline();
}
function filterTip(ms,ts){var m=document.getElementById(ms),t=document.getElementById(ts);if(!m||!t)return;Array.from(t.options).forEach(function(o){if(o.value==='Final')o.style.display=m.value==='all'?'':'none';else if(o.value==='Intrare')o.style.display=(m.value==='all'||m.value==='m1')?'':'none';});var co=t.querySelector('option[value="'+t.value+'"]');if(co&&co.style.display==='none')t.value='Tematic';}
function bK(){return(document.getElementById('bloomModSel').value||'all')+'_'+(document.getElementById('bloomTipSel').value||'Tematic');}
function cK(){return(document.getElementById('cfgModSel').value||'all')+'_'+(document.getElementById('cfgTipSel').value||'Final');}
function saveBloom(){var k=bK();bloomCfgs[k]={b1:Array.from(document.querySelectorAll('#b1i input')).map(function(x){return x.checked;}),b2:Array.from(document.querySelectorAll('#b2i input')).map(function(x){return x.checked;}),b3:Array.from(document.querySelectorAll('#b3i input')).map(function(x){return x.checked;})};}
function loadBloom(){var k=bK(),s=bloomCfgs[k];if(s)['b1i','b2i','b3i'].forEach(function(id,i){var sv=s[['b1','b2','b3'][i]],el=document.querySelectorAll('#'+id+' input');sv.forEach(function(v,j){if(el[j])el[j].checked=v;});});cB();}
function saveCfgV(){var k=cK();testCfgs[k]={nrItemi:+document.getElementById('cfgTi').value||30,timp:+document.getElementById('cfgTm').value||60,prag:+document.getElementById('cfgPr').value||70,nc1:+document.getElementById('pNC1').value||20,nc2:+document.getElementById('pNC2').value||30,nc3:+document.getElementById('pNC3').value||50};}
function loadCfg(){var k=cK(),tip=k.split('_').pop(),d=DEFS[tip]||DEFS.Final,s=testCfgs[k]||d;document.getElementById('cfgTi').value=s.nrItemi;document.getElementById('cfgTm').value=s.timp;document.getElementById('cfgPr').value=s.prag;document.getElementById('pNC1').value=s.nc1;document.getElementById('pNC2').value=s.nc2;document.getElementById('pNC3').value=s.nc3;updCfg();}
function getTestCfg(id,tip){return testCfgs['m'+id+'_'+tip]||testCfgs['all_'+tip]||DEFS[tip]||DEFS.Tematic;}
function getBloomTypes(lv){var sel=[];document.querySelectorAll('#b'+lv+'i input:checked').forEach(function(i){sel.push(i.value);});return sel;}
function gBloom(){return Array.from(document.querySelectorAll('#b1i input:checked,#b2i input:checked,#b3i input:checked')).map(function(c){return c.value;});}

// ═══ SCHEMA INLINE (Sec.4) ═══
function buildSchemaInline(){
  var ms=getMods();if(!ms.length){document.getElementById('schemaInline').style.display='none';return;}
  var k=cK(),tip=k.split('_').pop(),modV=document.getElementById('cfgModSel').value;
  var cfg=testCfgs[k]||DEFS[tip]||DEFS.Final;
  var T=cfg.nrItemi,p1=cfg.nc1,p2=cfg.nc2,p3=cfg.nc3;
  var pt=Math.round(T*p1/100)+Math.round(T*p2/100*2)+Math.round(T*p3/100*4);
  var pr=cfg.prag;
  var modLbl=modV==='all'?'Toate modulele':getMods().find(function(m){return 'm'+m.id===modV;})||(modV);
  var modLblStr=typeof modLbl==='object'?toRoman(modLbl.id)+'. '+modLbl.name.substring(0,20):modLbl;
  document.getElementById('schemaLbl').textContent=modLblStr+' · '+tip+' · '+T+' itemi · '+pt+' pct';
  var pcts=[4,9,20,32,47,62,77,87,94,100],h='<table class="schema-inline" style="border-collapse:collapse"><thead><tr>';
  pcts.forEach(function(v,i){var pv=i===0?0:pcts[i-1]+1;h+='<th style="background:#1565c0;color:#fff;padding:3px 6px;font-size:9px;border:1px solid #c5cfe0">'+Math.round(pv*pt/100)+'–'+Math.round(v*pt/100)+'</th>';});
  h+='</tr></thead><tbody><tr>';
  pcts.forEach(function(v,i){h+='<td style="padding:3px 6px;text-align:center;font-weight:700;color:#1565c0;border:1px solid #c5cfe0;background:'+(i%2?'#eef3fc':'#fff')+'">'+(i+1)+'</td>';});
  h+='</tr></tbody></table>';
  h+='<div style="font-size:9px;color:#546e7a;margin-top:5px">Promovare: <b>'+Math.round(pt*pr/100)+'</b> pct din <b>'+pt+'</b> pct ('+pr+'%)</div>';
  document.getElementById('schemaTable').innerHTML=h;
  document.getElementById('schemaInline').style.display='block';
}

// ═══ GIFT BANK ═══
function initGiftBank(){
  var ms=getMods();
  ms.forEach(function(m){
    [1,2,3].forEach(function(lv){
      var types=getBloomTypes(lv);
      types.forEach(function(tn){
        var ti=IT[tn];if(!ti)return;
        var k='m'+m.id+'_nc'+lv+'_'+ti.code;
        if(!giftBank[k])giftBank[k]={modId:m.id,modName:m.name,ncLvl:lv,typeName:tn,typeCode:ti.code,instr:ti.instr,ansHint:ti.ans,items:[]};
        else{giftBank[k].modName=m.name;giftBank[k].instr=ti.instr;}
      });
    });
  });
}

function buildGiftTree(){
  var ms=getMods();
  var el=document.getElementById('gftTree');
  if(!ms.length){el.innerHTML='<div class="es"><div class="ei">💾</div>Generați pentru a activa</div>';return;}
  var h='';
  ms.forEach(function(m){
    h+='<div class="tg">'+toRoman(m.id)+'. '+m.name.substring(0,28)+'</div>';
    [1,2,3].forEach(function(lv){
      var types=getBloomTypes(lv);
      if(!types.length)return;
      var c=NC_COL[lv];
      h+='<div style="padding:2px 7px 2px 10px;font-size:9px;font-weight:700;color:'+c+'">'+(['','🔵 NC1','🟢 NC2','🟠 NC3'][lv])+'</div>';
      types.forEach(function(tn){
        var ti=IT[tn];if(!ti)return;
        var k='m'+m.id+'_nc'+lv+'_'+ti.code;
        var cnt=(giftBank[k]&&giftBank[k].items.length)||0;
        var sel=k===selGftKey;
        h+='<div class="gb-tree-tp'+(sel?' sel':'')+'" onclick="selectGft(\''+k+'\')" style="border-left:3px solid '+c+';margin-left:10px">'+
          '<span style="background:'+c+';color:#fff;font-size:8px;padding:1px 5px;border-radius:3px;font-weight:700">'+ti.code+'</span>'+
          '<span style="flex:1;margin-left:3px">'+tn+'</span>'+
          '<span class="cnt" style="background:'+(cnt>0?'#2e7d32':'#bbb')+';color:#fff">'+cnt+'</span>'+
          '</div>';
      });
    });
  });
  el.innerHTML=h;
}

function selectGft(key){
  selGftKey=key;buildGiftTree();
  var bank=giftBank[key];if(!bank)return;
  var c=NC_COL[bank.ncLvl];
  var h='<div style="background:'+c+';color:#fff;border-radius:8px;padding:10px 14px;margin-bottom:10px">'+
    '<div style="font-size:12px;font-weight:700">'+bank.typeCode+' — '+bank.typeName+'</div>'+
    '<div style="font-size:10px;opacity:.9">'+toRoman(bank.modId)+'. '+bank.modName+' · '+NC_NM[bank.ncLvl]+'</div>'+
    '</div>'+
    '<div class="rule-box">📌 <b>Regula de construcție:</b> '+bank.instr+'</div>';
  if(bank.ansHint)h+='<div style="font-size:9px;color:#777;margin-bottom:8px;padding:4px 8px;background:#f0f4f8;border-radius:4px">💡 Format răspuns GIFT: <code>'+bank.ansHint+'</code></div>';
  
  h+='<div id="gft_items_'+key+'"></div>';
  h+='<button class="add-btn" style="margin-top:4px" onclick="addGftItem(\''+key+'\')">＋ Adaugă item '+bank.typeCode+'</button>';
  h+='<div style="margin-top:14px"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">'+
    '<b style="font-size:10px;color:#1a1a2e">📄 Previzualizare GIFT Moodle</b>'+
    '<div class="brow" style="margin:0"><button class="b bp" style="font-size:9px;padding:3px 8px" onclick="copyGift()">📋 Copiază tot</button><button class="b bg" style="font-size:9px;padding:3px 8px" onclick="exp(\'gift\')">⬇ TXT</button></div>'+
    '</div>'+
    '<div class="gift-prev" id="gft_prev_'+key+'"></div></div>';
  document.getElementById('gftC').innerHTML=h;
  renderGftItems(key);updateGftPrev(key);
}

function renderGftItems(key){
  var bank=giftBank[key];if(!bank)return;
  var el=document.getElementById('gft_items_'+key);if(!el)return;
  var c=NC_COL[bank.ncLvl];
  var h='';
  bank.items.forEach(function(item,idx){
    h+='<div class="gi-card" style="border-left:4px solid '+c+'">'+
      '<button class="gi-del" onclick="delGftItem(\''+key+'\','+idx+')">✕</button>'+
      '<div class="gi-card-hdr">'+
      '<span class="gi-nr" style="background:'+c+'">'+bank.typeCode+' '+(idx+1)+'</span>'+
      '<span style="font-size:9px;color:#888;font-style:italic">'+bank.instr.substring(0,60)+'…</span>'+
      '</div>'+
      '<div class="gi-fields">'+
      '<div><div style="font-size:9px;color:#546e7a;margin-bottom:2px">Enunțul itemului:</div>'+
      '<textarea id="gc_t_'+key+'_'+idx+'" onchange="updGftItem(\''+key+'\','+idx+',\'txt\',this.value)" placeholder="Scrieți enunțul itemului specifice disciplinei…">'+xe(item.txt||'')+'</textarea></div>'+
      '<div><div style="font-size:9px;color:#546e7a;margin-bottom:2px">Răspuns/Opțiuni GIFT:</div>'+
      '<textarea id="gc_a_'+key+'_'+idx+'" onchange="updGftItem(\''+key+'\','+idx+',\'ans\',this.value)" placeholder="'+(bank.ansHint||'Răspuns…')+'">'+xe(item.ans||'')+'</textarea></div>'+
      '</div></div>';
  });
  el.innerHTML=h;
}

function addGftItem(key){
  var bank=giftBank[key];if(!bank)return;
  bank.items.push({txt:'',ans:''});
  renderGftItems(key);updateGftPrev(key);buildGiftTree();
  toast('✅ Item '+bank.typeCode+' adăugat','#2e7d32');
}
function delGftItem(key,idx){
  var bank=giftBank[key];if(!bank)return;
  bank.items.splice(idx,1);renderGftItems(key);updateGftPrev(key);buildGiftTree();
}
function updGftItem(key,idx,field,val){
  var bank=giftBank[key];if(!bank||!bank.items[idx])return;
  bank.items[idx][field]=val;updateGftPrev(key);
}

function updateGftPrev(key){
  var bank=giftBank[key];
  var el=document.getElementById('gft_prev_'+key);if(!el)return;
  var c=document.getElementById('cC').value||'CURS';
  var cat='$course$/'+c+'/'+bank.modName.replace(/\s+/g,'_').substring(0,25)+'/'+bank.typeCode+'_'+toRoman(bank.modId);
  var h='<span class="gc">// '+NC_NM[bank.ncLvl]+' — '+bank.typeName+'</span>\n';
  h+='<span class="gc">// '+bank.instr+'</span>\n\n';
  h+='<span class="gk">$CATEGORY:</span> <span style="color:#c3e88d">'+cat+'</span>\n\n';
  bank.items.forEach(function(item,idx){
    var code=bank.typeCode+'_'+toRoman(bank.modId)+'_'+String(idx+1).padStart(3,'0');
    h+='<span class="gc">::'+code+'::</span> <span class="gq">'+(item.txt||(bank.instr))+'</span> ';
    h+='<span class="ga">{'+(item.ans||'')+' }</span>\n\n';
  });
  el.innerHTML=h;
  buildGiftRaw();
}

function buildGift(ms,cfg){
  var c=cfg||document.getElementById('cC').value||'CURS';
  var g='',raw='// GIFT Bancă — '+c+'\n// SistemExpert IPT v13 · Ord.644/2020\n\n';
  var cats=0;
  ms.forEach(function(m){
    var R=toRoman(m.id);
    var catBase='$course$/'+c+'/'+R+'_'+m.name.replace(/\s+/g,'_').substring(0,24);
    g+='<span class="cm">// ══ MODULUL '+R+'. '+m.name.toUpperCase()+' ══</span>\n';
    g+='<span class="gk">$CATEGORY:</span> <span style="color:#c3e88d">'+catBase+'</span>\n\n';
    raw+='// ══ MODULUL '+R+'. '+m.name+' ══\n$CATEGORY: '+catBase+'\n\n';
    cats++;
    [1,2,3].forEach(function(lv){
      var types=getBloomTypes(lv);if(!types.length)return;
      var lvCol=['','#7ec8e3','#b8f2b4','#f8d976'][lv];
      g+='<span style="color:'+lvCol+';font-weight:700">// ── '+NC_NM[lv]+' ──</span>\n';
      raw+='// ── '+NC_NM[lv]+' ──\n';
      types.forEach(function(tn){
        var ti=IT[tn];if(!ti)return;
        var pfx=ti.code+'_'+R;
        // Header: cod + tip + regulă
        g+='\n<span class="cm">// ┌─ [<b style="color:#fff">'+ti.code+'</b>] '+tn+'</span>\n';
        g+='<span class="cm">// │  Regulă: '+ti.instr+'</span>\n';
        if(ti.ans)g+='<span class="cm">// │  Format răspuns: '+ti.ans+'</span>\n';
        g+='<span class="cm">// └─────────────────────────────────────</span>\n';
        raw+='\n// ['+ti.code+'] '+tn+'\n// Regulă: '+ti.instr+'\n';
        if(ti.ans)raw+='// Format răspuns: '+ti.ans+'\n';
        // Items from bank or placeholder
        var k='m'+m.id+'_nc'+lv+'_'+ti.code;
        var bankItems=(giftBank[k]&&giftBank[k].items)||[];
        if(bankItems.length){
          bankItems.forEach(function(item,idx){
            var code=pfx+'_'+String(idx+1).padStart(3,'0');
            var enunt=item.txt||('Enunț '+ti.code+' '+R+'.'+(idx+1));
            var ans=item.ans||'';
            g+='<span class="q">::'+code+'::</span> '+enunt+' <span class="ga">{ '+ans+' }</span>\n\n';
            raw+='::'+code+':: '+enunt+' { '+ans+' }\n\n';
          });
        } else {
          var code=pfx+'_001';
          var ph='[Enunț '+ti.code+' — '+m.name.substring(0,20)+' — completați]';
          g+='<span style="color:#556">// ::'+code+':: '+ph+' { '+(ti.ans||'...')+' }</span>\n\n';
          raw+='// ::'+code+':: '+ph+' { '+(ti.ans||'...')+' }\n\n';
        }
      });
    });
    g+='\n';raw+='\n';
  });
  giftRaw=raw;
  document.getElementById('giftO').innerHTML=g||'<span class="cm">// —</span>';
  // Previzualizare Moodle dreapta — intreaga bancă curată
  var prevEl=document.getElementById('giftPrev');
  if(prevEl){
    var pv='';
    // parcurgem raw linie cu linie și colorăm
    raw.split('\n').forEach(function(ln){
      if(!ln){pv+='<br>';return;}
      if(ln.startsWith('$CATEGORY:'))
        pv+='<span class="gk">$CATEGORY:</span> <span style="color:#c3e88d">'+xe(ln.replace('$CATEGORY:','').trim())+'</span><br>';
      else if(ln.startsWith('//'))
        pv+='<span class="cm">'+xe(ln)+'</span><br>';
      else if(ln.startsWith('::'))
        pv+='<span class="gq">'+xe(ln)+'</span><br>';
      else
        pv+='<span style="color:#a8d8ea">'+xe(ln)+'</span><br>';
    });
    prevEl.innerHTML=pv;
  }
  var st=document.getElementById('giftStat');
  if(st)st.textContent=ms.length+' module · '+cats+' categorii';
}

function dlGift(){
  if(!giftRaw){toast('⚠ Generați întâi!','#bf360c');return;}
  var b=new Blob([giftRaw],{type:'text/plain;charset=utf-8'}),u=URL.createObjectURL(b),a=document.createElement('a');
  a.href=u;a.download='BancaGIFT_'+(document.getElementById('cC').value||'CURS')+'.txt';
  document.body.appendChild(a);a.click();
  setTimeout(function(){document.body.removeChild(a);URL.revokeObjectURL(u);},300);
  toast('⬇ BancaGIFT descărcată','#2e7d32');
}

function previewGiftBank(){
  var ms=getMods();
  if(!ms.length){toast('⚠ Generați întâi!','#bf360c');return;}
  var disc=document.getElementById('cC').value||'CURS';
  var h='';
  ms.forEach(function(m){
    var R=toRoman(m.id);
    var catPath='$course$/'+disc+'/'+R+'_'+m.name.replace(/\s+/g,'_').substring(0,24);
    h+='<div style="margin-bottom:16px;border:1px solid #c5cfe0;border-radius:8px;overflow:hidden">';
    // antet modul
    h+='<div style="background:#1565c0;color:#fff;padding:8px 12px;font-size:11px;font-weight:700">📂 '+R+'. '+m.name+'</div>';
    h+='<div style="font-size:9px;color:#888;padding:4px 12px 6px;font-family:Consolas,monospace;background:#f8faff;border-bottom:1px solid #e8ecf0">$CATEGORY: '+catPath+'</div>';
    var bodyH='';
    [1,2,3].forEach(function(lv){
      var types=getBloomTypes(lv);if(!types.length)return;
      var col=NC_COL[lv];
      bodyH+='<div style="padding:5px 12px 2px;font-size:9px;font-weight:700;color:'+col+';text-transform:uppercase;letter-spacing:.4px">'+NC_NM[lv]+'</div>';
      types.forEach(function(tn){
        var ti=IT[tn];if(!ti)return;
        bodyH+='<div style="margin:3px 10px 3px 10px;padding:7px 10px;background:#fff;border-radius:6px;border-left:4px solid '+col+';border:1px solid #eef1f7;border-left:4px solid '+col+'">';
        bodyH+='<div style="display:flex;align-items:center;gap:7px;margin-bottom:4px">';
        bodyH+='<span style="background:'+col+';color:#fff;font-size:9px;font-weight:700;padding:2px 8px;border-radius:4px;letter-spacing:.5px">'+ti.code+'</span>';
        bodyH+='<span style="font-size:10px;font-weight:600;color:#1a1a2e">'+tn+'</span>';
        bodyH+='<span style="margin-left:auto;font-size:9px;color:#fff;background:'+col+';padding:1px 6px;border-radius:3px">'+ti.pts+'p</span>';
        bodyH+='</div>';
        bodyH+='<div style="font-size:9px;color:#555;font-style:italic;line-height:1.5">📌 '+ti.instr+'</div>';
        if(ti.ans)bodyH+='<div style="font-size:9px;color:#888;margin-top:3px;font-family:Consolas,monospace;background:#f0f4f8;border-radius:3px;padding:2px 6px">Format GIFT: {'+ti.ans+'}</div>';
        bodyH+='</div>';
      });
    });
    h+=bodyH+'</div>';
  });
  document.getElementById('giftPrevContent').innerHTML=h||'<p style="color:#aaa;text-align:center;padding:20px">Niciun modul configurat</p>';
  showDlg('giftPrevOv');
}

// ═══ TESTS ═══
function buildTests(ms,cfg){
  var t=[],i=1,oa=0,ns=1,ic=getTestCfg(0,'Intrare');
  t.push({nr:i++,key:'ti_0',den:'Test Inițial',tip:'Intrare',scop:'Diagnoză',modIds:[],allMods:true,nrItemi:ic.nrItemi,timp:ic.timp,prag:ic.prag,bloom:{nc1:ic.nc1,nc2:ic.nc2,nc3:ic.nc3}});
  ms.forEach(function(m){
    var tc=getTestCfg(m.id,'Tematic');
    var nT=m.nrEval>0?Math.max(1,m.nrEval-1):Math.max(1,Math.floor(m.ore/cfg.a));
    for(var a=1;a<=nT;a++)t.push({nr:i++,key:'tm_'+m.id+'_'+a,den:toRoman(m.id)+'. '+m.name.substring(0,22)+' T'+a,tip:'Tematic',scop:'Formatoare',modIds:[m.id],allMods:false,nrItemi:tc.nrItemi,timp:tc.timp,prag:tc.prag,bloom:{nc1:tc.nc1,nc2:tc.nc2,nc3:tc.nc3}});
    if(m.nrEval>0){var sum=getTestCfg(m.id,'Intermediar');t.push({nr:i++,key:'sm_'+m.id,den:toRoman(m.id)+'. '+m.name.substring(0,22)+' — Sumativă',tip:'Intermediar',scop:'Sumativă',modIds:[m.id],allMods:false,nrItemi:sum.nrItemi,timp:sum.timp,prag:sum.prag,bloom:{nc1:sum.nc1,nc2:sum.nc2,nc3:sum.nc3}});}
    oa+=m.ore;
    if(oa>=cfg.s){var np=Math.floor(oa/cfg.s);for(var s2=0;s2<np;s2++){var ic2=getTestCfg(0,'Intermediar'),cv=ms.slice(0,ms.indexOf(m)+1).map(function(x){return x.id;});t.push({nr:i++,key:'int_'+ns,den:'Eval. intermediară nr.'+ns,tip:'Intermediar',scop:'Formativă',modIds:cv,allMods:false,nrItemi:ic2.nrItemi,timp:ic2.timp,prag:ic2.prag,bloom:{nc1:ic2.nc1,nc2:ic2.nc2,nc3:ic2.nc3}});ns++;}oa=oa%cfg.s;}
  });
  var fc=getTestCfg(0,'Final');
  t.push({nr:i,key:'final',den:'Examen Final',tip:'Final',scop:'Sumativă',modIds:ms.map(function(m){return m.id;}),allMods:true,nrItemi:fc.nrItemi,timp:fc.timp,prag:fc.prag,bloom:{nc1:fc.nc1,nc2:fc.nc2,nc3:fc.nc3}});
  return t;
}

function renderPlanif(ts){
  var bC={Tematic:'btem',Intermediar:'bint',Final:'bfin',Intrare:'bi'};
  var h='<div class="tw"><table><thead><tr><th>#</th><th>Denumire</th><th>Tip</th><th>Module</th><th>Itemi</th><th>Timp</th><th>Prag</th></tr></thead><tbody>';
  ts.forEach(function(t){h+='<tr class="pr" onclick="quickView(\''+t.key+'\')"><td>'+t.nr+'</td><td><b>'+t.den+'</b></td><td><span class="badge '+(bC[t.tip]||'bi')+'">'+t.tip+'</span></td><td>'+(t.allMods?'Toate':t.modIds.map(toRoman).join(','))+'</td><td>'+t.nrItemi+'</td><td>'+t.timp+'</td><td>'+t.prag+'%</td></tr>';});
  h+='</tbody></table></div><div style="margin-top:7px;font-size:10px;color:#888">Total: <b>'+ts.length+'</b> teste · Click pe rând → matrice/șablon</div>';
  document.getElementById('pevW').innerHTML=h;
}

function buildTreeUI(cid,cb,ak){
  var el=document.getElementById(cid);
  if(!testsList.length){el.innerHTML='<div class="es"><div class="ei">⚡</div>Generați</div>';return;}
  var grp={Intrare:[],Tematic:[],Intermediar:[],Final:[]};
  testsList.forEach(function(t){if(grp[t.tip])grp[t.tip].push(t);});
  var ic={Intrare:'🔵',Tematic:'🟢',Intermediar:'🟣',Final:'🔴'},h='';
  Object.keys(grp).forEach(function(tip){var l=grp[tip];if(!l.length)return;h+='<div class="tg">'+ic[tip]+' '+tip+'</div>';l.forEach(function(t){var sel=t.key===ak;h+='<div class="ti'+(sel?' sel':'')+'" onclick="'+cb+'(\''+t.key+'\')"><span style="flex:1">'+t.den+'</span><span class="tin">'+t.nrItemi+'</span></div>';});});
  el.innerHTML=h;
}

function genItemList(t,ms){
  var T=t.nrItemi,b=t.bloom,tO=ms.reduce(function(s,m){return s+m.ore;},0)||1;
  var items=[],nr=1;
  [{pct:b.nc1,lv:1},{pct:b.nc2,lv:2},{pct:b.nc3,lv:3}].forEach(function(lv){
    var types=getBloomTypes(lv.lv);if(!lv.pct||!types.length)return;
    var nI=Math.round(T*lv.pct/100);
    ms.forEach(function(m){
      var n=Math.max(1,Math.round(nI*m.ore/tO));
      for(var j=0;j<n&&nr<=T;j++){
        var tn=types[j%types.length],ti=IT[tn]||{code:tn.substring(0,3),lvl:lv.lv,pts:lv.lv,instr:''};
        items.push({nr:nr++,typeName:tn,code:ti.code,instr:ti.instr,lvl:lv.lv,pts:ti.pts,mod:m,R:toRoman(m.id)});
      }
    });
  });
  return items;
}

function selectMat(key){
  selMatKey=key;buildTreeUI('matTree','selectMat',key);
  var t=testsList.find(function(x){return x.key===key;});if(!t)return;
  var ms=getMods(),rm=t.allMods?ms:ms.filter(function(m){return t.modIds.indexOf(m.id)>=0;});
  if(!rm.length)return;
  var T=t.nrItemi,b=t.bloom,tO=rm.reduce(function(s,m){return s+m.ore;},0)||1;
  var col={Tematic:NC_COL[2],Intermediar:'#6a1b9a',Final:NC_COL[3],Intrare:NC_COL[1]}[t.tip];
  var h='<div style="background:'+col+';color:#fff;border-radius:8px;padding:10px 14px;margin-bottom:10px"><div style="font-size:12px;font-weight:700">'+t.den+'</div><div style="font-size:10px;opacity:.9">'+T+' itemi · '+t.timp+' min · NC1:'+b.nc1+'% NC2:'+b.nc2+'% NC3:'+b.nc3+'%</div></div>';
  h+='<div style="overflow-x:auto"><table class="mt3"><thead><tr><th class="tcm" rowspan="2">Modul</th><th class="tcm" rowspan="2">Ore</th><th class="tc1" colspan="2">NC1</th><th class="tc2" colspan="2">NC2</th><th class="tc3" colspan="2">NC3</th><th class="tcm" rowspan="2">Tot</th></tr><tr><th class="tc1">Cod</th><th class="tc1">#</th><th class="tc2">Cod</th><th class="tc2">#</th><th class="tc3">Cod</th><th class="tc3">#</th></tr></thead><tbody>';
  var s1=0,s2=0,s3=0,t1=getBloomTypes(1),t2=getBloomTypes(2),t3=getBloomTypes(3);
  rm.forEach(function(m,i){
    var n1=Math.max(0,Math.round(T*b.nc1/100*m.ore/tO)),n2=Math.max(0,Math.round(T*b.nc2/100*m.ore/tO)),n3=Math.max(0,Math.round(T*b.nc3/100*m.ore/tO));
    s1+=n1;s2+=n2;s3+=n3;
    var c1=t1[i%Math.max(1,t1.length)],c2=t2[i%Math.max(1,t2.length)],c3=t3[i%Math.max(1,t3.length)];
    h+='<tr><td>'+toRoman(m.id)+'. '+m.name.substring(0,22)+'</td><td>'+m.ore+'</td>'+
      '<td class="dc1" style="font-size:8px">'+(c1?IT[c1].code:'—')+'</td><td class="dc1"><b>'+n1+'</b></td>'+
      '<td class="dc2" style="font-size:8px">'+(c2?IT[c2].code:'—')+'</td><td class="dc2"><b>'+n2+'</b></td>'+
      '<td class="dc3" style="font-size:8px">'+(c3?IT[c3].code:'—')+'</td><td class="dc3"><b>'+n3+'</b></td>'+
      '<td><b>'+(n1+n2+n3)+'</b></td></tr>';
  });
  h+='<tr class="totr"><td colspan="2">TOTAL</td><td></td><td>'+s1+'</td><td></td><td>'+s2+'</td><td></td><td>'+s3+'</td><td>'+(s1+s2+s3)+'</td></tr></tbody></table></div>';
  h+='<div class="brow" style="margin-top:10px"><button class="b bp" onclick="selectSbl(\''+key+'\');gt(\'sbl\')">→ Șablon</button><button class="b" onclick="exp(\'mat\')">⬇ DOCX</button></div>';
  document.getElementById('matC').innerHTML=h;
}

function selectSbl(key){
  selSblKey=key;buildTreeUI('sblTree','selectSbl',key);
  var t=testsList.find(function(x){return x.key===key;});if(!t)return;
  var ms=getMods(),rm=t.allMods?ms:ms.filter(function(m){return t.modIds.indexOf(m.id)>=0;});
  if(!rm.length)return;
  var items=genItemList(t,rm);
  if(!sblData[key])sblData[key]={};
  var col={Tematic:NC_COL[2],Intermediar:'#6a1b9a',Final:NC_COL[3],Intrare:NC_COL[1]}[t.tip];
  var pt=items.reduce(function(s,it){return s+it.pts;},0);
  var h='<div style="background:'+col+';color:#fff;border-radius:8px;padding:10px 14px;margin-bottom:10px">'+
    '<div style="font-size:13px;font-weight:700">📋 ȘABLON — '+t.den+'</div>'+
    '<div style="font-size:10px;opacity:.9;margin-top:2px">'+t.nrItemi+' itemi · '+pt+' pct · '+t.timp+' min · Prag '+t.prag+'%</div></div>';

  // Note schema in template
  var pcts=[4,9,20,32,47,62,77,87,94,100];
  h+='<div style="margin-bottom:10px;padding:8px;background:#f0f6ff;border-radius:7px;border:1px solid #c5cfe0">'+
    '<b style="font-size:9px;color:#1565c0">📊 SCHEMA NOTE · '+t.den+'</b>'+
    '<div style="overflow-x:auto;margin-top:5px"><table style="border-collapse:collapse;font-size:9px;width:100%"><thead><tr>';
  pcts.forEach(function(v,i){var pv=i===0?0:pcts[i-1]+1;h+='<th style="background:#1565c0;color:#fff;padding:3px 5px;border:1px solid #c5cfe0">'+Math.round(pv*pt/100)+'–'+Math.round(v*pt/100)+'</th>';});
  h+='</tr></thead><tbody><tr>';
  pcts.forEach(function(v,i){h+='<td style="padding:3px 5px;text-align:center;font-weight:700;color:#1565c0;border:1px solid #c5cfe0;background:'+(i%2?'#eef3fc':'#fff')+'">'+(i+1)+'</td>';});
  h+='</tr></tbody></table></div></div>';

  // Legend
  h+='<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px;font-size:9px">';
  Object.keys(IT).forEach(function(k){var ti=IT[k];h+='<span style="background:'+NC_COL[ti.lvl]+';color:#fff;padding:2px 6px;border-radius:3px;font-weight:700">'+ti.code+'</span><span style="color:#555"> '+k+'</span>&nbsp;';});
  h+='</div>';

  [1,2,3].forEach(function(lv){
    var lvI=items.filter(function(it){return it.lvl===lv;});if(!lvI.length)return;
    var c=NC_COL[lv];
    h+='<div style="background:'+c+';color:#fff;border-radius:6px;padding:7px 12px;font-size:11px;font-weight:700;margin:12px 0 4px">'+NC_NM[lv]+' — '+lvI.length+' itemi · '+(['','1p','2p','4p'][lv])+'</div>';
    lvI.forEach(function(it){
      var saved=sblData[key][it.nr-1]||'';
      h+='<div style="background:#fff;border:1px solid #dce3ef;border-radius:6px;margin:4px 0;border-left:4px solid '+c+';padding:8px 10px">'+
        '<div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-bottom:5px">'+
        '<span style="background:'+c+';color:#fff;font-size:10px;font-weight:700;padding:2px 8px;border-radius:4px">'+it.code+' '+it.nr+'</span>'+
        '<span style="font-size:9px;background:#f0f4f8;padding:2px 6px;border-radius:3px;color:#546e7a">'+it.typeName+'</span>'+
        '<span style="font-size:9px;background:'+c+';color:#fff;padding:1px 6px;border-radius:3px">'+it.pts+'p</span>'+
        '<span style="font-size:9px;color:#888;margin-left:auto">'+it.R+'. '+it.mod.name.substring(0,28)+'</span>'+
        '</div>'+
        '<div style="font-size:9px;color:#546e7a;font-style:italic;margin-bottom:5px;padding:3px 6px;background:#fffbea;border-radius:4px">'+it.instr+'</div>'+
        '<textarea style="width:100%;height:52px;font-size:11px;border:1px solid #c5cfe0;border-radius:5px;padding:5px 7px;background:#fafbfd;font-family:inherit;resize:vertical" '+
        'id="sbl_'+key+'_'+(it.nr-1)+'" placeholder="Completați enunțul itemului…" onchange="sblData[\''+key+'\']['+(it.nr-1)+']=this.value">'+xe(saved)+'</textarea>'+
        '</div>';
    });
  });
  h+='<div class="brow" style="margin-top:12px"><button class="b bg" onclick="expSbl(\''+key+'\')">⬇ Export DOCX cu enunțuri</button><button class="b bp" onclick="selectMat(\''+key+'\');gt(\'mat\')">→ Matrice</button></div>';
  document.getElementById('sblC').innerHTML=h;
}

function quickView(k){selectMat(k);selectSbl(k);gt('sbl');}

function buildCol(ms,cfg){
  var h='<div class="tw"><table><thead><tr><th>#</th><th>Modul</th><th>Ore</th><th>Total bancă</th><th>Binar</th><th>Singulară</th><th>Multiplă</th></tr></thead><tbody>';
  var tI=0;ms.forEach(function(m,i){var T=m.ore*2*cfg.m;tI+=T;h+='<tr><td>'+(i+1)+'</td><td><b>'+toRoman(m.id)+'.</b> '+m.name.substring(0,30)+'</td><td>'+m.ore+'</td><td><b>'+T+'</b></td><td>'+Math.round(T*.32)+'</td><td>'+Math.round(T*.14)+'</td><td>'+Math.round(T*.24)+'</td></tr>';});
  h+='<tr style="background:#e8ecf0;font-weight:700"><td colspan="3">Total</td><td>'+tI+'</td><td colspan="3"></td></tr></tbody></table></div>';
  document.getElementById('colW').innerHTML=h;
}

function buildNoteAll(){
  var h='';
  testsList.forEach(function(t){
    var pt=Math.round(t.nrItemi*t.bloom.nc1/100)+Math.round(t.nrItemi*t.bloom.nc2/100*2)+Math.round(t.nrItemi*t.bloom.nc3/100*4);
    var col={Tematic:NC_COL[2],Intermediar:'#6a1b9a',Final:NC_COL[3],Intrare:NC_COL[1]}[t.tip];
    var pcts=[4,9,20,32,47,62,77,87,94,100];
    h+='<div style="margin-bottom:12px;background:#fff;border-radius:8px;border:1px solid #c5cfe0;overflow:hidden">'+
      '<div style="background:'+col+';color:#fff;padding:6px 12px;font-size:11px;font-weight:700">'+t.den+' · '+pt+' pct · Prag '+t.prag+'%</div>'+
      '<div style="padding:8px;overflow-x:auto"><table style="border-collapse:collapse;font-size:10px;width:100%"><thead><tr>';
    pcts.forEach(function(v,i){var pv=i===0?0:pcts[i-1]+1;h+='<th style="background:#f0f4f8;color:#555;padding:4px 7px;border:1px solid #c5cfe0;text-align:center">'+Math.round(pv*pt/100)+'–'+Math.round(v*pt/100)+'</th>';});
    h+='</tr></thead><tbody><tr>';
    pcts.forEach(function(v,i){h+='<td style="padding:4px 7px;text-align:center;font-weight:700;color:'+col+';border:1px solid #c5cfe0">'+(i+1)+'</td>';});
    h+='</tr></tbody></table></div></div>';
  });
  document.getElementById('noteW').innerHTML=h||'<div class="es"><div class="ei">📈</div>Generați</div>';
}

function runAll(){
  var ms=getMods();if(!ms.length){toast('⚠ Adăugați module!','#bf360c');gt('cfg');return;}
  var tip=gBloom();if(!tip.length){toast('⚠ Selectați tipuri Bloom!','#bf360c');return;}
  var cfg={a:+document.getElementById('cA').value||2,s:+document.getElementById('cS').value||10,m:+document.getElementById('cM').value||4,c:document.getElementById('cC').value||'CURS'};
  updCfg();populateSel();
  testsList=buildTests(ms,cfg);
  renderPlanif(testsList);
  buildTreeUI('matTree','selectMat',null);buildTreeUI('sblTree','selectSbl',null);
  initGiftBank();
  var fin=testsList.find(function(t){return t.tip==='Final';});
  if(fin){selectMat(fin.key);selectSbl(fin.key);}
  buildCol(ms,cfg);buildGift(ms,cfg.c);buildNoteAll();
  updateDocPanel(ms);sts();
  toast('✅ '+testsList.length+' teste generate — Tab Documente actualizat','#2e7d32');
  var td=document.getElementById('t-doc');td.classList.add('pulse');setTimeout(function(){td.classList.remove('pulse');},3100);
  setTimeout(function(){gt('doc');},600);
}

function updateDocPanel(ms){
  var tot=ms.reduce(function(s,m){return s+m.ore;},0);
  document.getElementById('docSum').textContent=ms.length+' module · '+tot+' ore · '+testsList.length+' teste · '+document.getElementById('cfgTi').value+' itemi/test';
  var cards=document.querySelectorAll('.doc-card');
  cards.forEach(function(c){c.classList.remove('dc-empty');c.classList.add('dc-ready');});
  document.getElementById('dc1s').textContent='✅ '+testsList.length+' teste planificate';
  document.getElementById('dc2s').textContent='✅ '+ms.length+' module · '+tot+' ore';
  document.getElementById('dc3s').textContent='✅ Examen Final configurat';
  document.getElementById('dc4s').textContent='✅ Bancă inițializată — adăugați itemi';
  document.getElementById('dc5s').textContent='✅ '+testsList.length+' șabloane disponibile';
  document.getElementById('dc6s').textContent='✅ '+testsList.length+' matrice disponibile';
}

// ═══ UI ═══
function tmn(id){var w=document.getElementById(id).classList.contains('open');cmn();if(!w)document.getElementById(id).classList.add('open');}
function cmn(){document.querySelectorAll('.mn').forEach(function(m){m.classList.remove('open');});}
document.addEventListener('click',function(e){if(!e.target.closest('.mn'))cmn();});
function gt(id){document.querySelectorAll('.tp').forEach(function(p){p.classList.remove('on');});document.querySelectorAll('.tab').forEach(function(t){t.classList.remove('on');});var p=document.getElementById('p-'+id),t=document.getElementById('t-'+id);if(p)p.classList.add('on');if(t)t.classList.add('on');cmn();}
function togSec(id){document.getElementById(id).classList.toggle('closed');var arr=document.querySelector('#'+id+' .arr');if(arr)arr.textContent=document.getElementById(id).classList.contains('closed')?'▶':'▼';}
function cB(){['b1','b2','b3'].forEach(function(c){document.getElementById(c+'c').textContent=document.querySelectorAll('#'+c+'i input:checked').length;});saveBloom();}
function tgB(c){var e=document.getElementById(c+'i');e.style.display=e.style.display==='none'?'grid':'none';}
function ss(){document.getElementById('dA').textContent=document.getElementById('cA').value;document.getElementById('dS').textContent=document.getElementById('cS').value;document.getElementById('dM').textContent=document.getElementById('cM').value;document.getElementById('dPF').textContent=document.getElementById('cPF').value+'%';document.getElementById('dPS').textContent=document.getElementById('cPS').value+'%';}
function updCfg(){
  var T=+document.getElementById('cfgTi').value||30,tm=+document.getElementById('cfgTm').value||60,pr=+document.getElementById('cfgPr').value||70,p1=+document.getElementById('pNC1').value||20,p2=+document.getElementById('pNC2').value||30,p3=+document.getElementById('pNC3').value||50;
  document.getElementById('cfgWarn').style.display=(p1+p2+p3!==100)?'block':'none';
  var pt=Math.round(T*p1/100)+Math.round(T*p2/100*2)+Math.round(T*p3/100*4);
  document.getElementById('cfgPt').textContent=pt;document.getElementById('cfgPp').textContent=Math.round(pt*pr/100);
  document.getElementById('cfgTs').textContent=Math.round(tm*60/T);
  document.getElementById('vNC1').textContent=Math.round(T*p1/100);document.getElementById('vNC2').textContent=Math.round(T*p2/100);document.getElementById('vNC3').textContent=Math.round(T*p3/100);
  document.getElementById('cfgNiv').textContent=T<=30?'Nivel 3':T<=35?'Nivel 4':'Nivel 5';
  saveCfgV();buildSchemaInline();sts();
}
function sts(){var ms=getMods(),tO=ms.reduce(function(s,m){return s+(m.ore||0);},0);setSb(2,ms.length>0,'Module: '+ms.length);setSb(3,tO>0,'Ore: '+tO);setSb(4,testsList.length>0,'Teste: '+testsList.length);setSb(5,true,'Itemi: '+(document.getElementById('cfgTi').value||30));}
function setSb(n,ok,tx){var d=document.getElementById('ds'+n),s=document.getElementById('ss'+n);if(d)d.className='dot'+(ok?' ok':'');if(s)s.textContent=tx;}
function toast(m,bg){var t=document.getElementById('toastEl');t.textContent=m;t.style.background=bg||'#1a1a2e';t.style.display='block';clearTimeout(t._t);t._t=setTimeout(function(){t.style.display='none';},4000);}
function showDlg(id){document.getElementById(id).classList.add('show');cmn();}
function closeDlg(id){document.getElementById(id).classList.remove('show');}

// ═══ EXPORT / DOCX ═══
function buildDocx(items){
  var body='';items.forEach(function(it){
    if(it.t==='title')body+='<w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:b/><w:sz w:val="28"/><w:color w:val="1F3864"/></w:rPr><w:t>'+xe(it.v)+'</w:t></w:r></w:p>';
    else if(it.t==='h1')body+='<w:p><w:pPr><w:shd w:val="clear" w:color="auto" w:fill="E8F0FE"/></w:pPr><w:r><w:rPr><w:b/><w:sz w:val="24"/><w:color w:val="'+(it.col||'1565C0')+'"/></w:rPr><w:t>'+xe(it.v)+'</w:t></w:r></w:p>';
    else if(it.t==='p')body+='<w:p><w:r><w:rPr><w:sz w:val="20"/></w:rPr><w:t xml:space="preserve">'+xe(it.v)+'</w:t></w:r></w:p>';
    else if(it.t==='line')body+='<w:p/>';
    else if(it.t==='table')body+=bTbl(it.headers,it.rows,it.hc||'1565C0')+'<w:p/>';
  });
  var doc='<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>'+body+'<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1134" w:right="851" w:bottom="1134" w:left="1701"/></w:sectPr></w:body></w:document>';
  var z=new JSZip();
  z.file('[Content_Types].xml','<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>');
  z.file('_rels/.rels','<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>');
  z.file('word/document.xml',doc);
  return z.generateAsync({type:'blob',mimeType:'application/vnd.openxmlformats-officedocument.wordprocessingml.document'});
}
function bTbl(h,rows,col){var nc=h.length,cw=Math.floor(9000/nc),x='<w:tbl><w:tblPr><w:tblW w:w="9000" w:type="dxa"/><w:tblBorders><w:top w:val="single" w:sz="4" w:color="C5CFE0"/><w:left w:val="single" w:sz="4" w:color="C5CFE0"/><w:bottom w:val="single" w:sz="4" w:color="C5CFE0"/><w:right w:val="single" w:sz="4" w:color="C5CFE0"/><w:insideH w:val="single" w:sz="4" w:color="C5CFE0"/><w:insideV w:val="single" w:sz="4" w:color="C5CFE0"/></w:tblBorders></w:tblPr><w:tr>';h.forEach(function(c){x+='<w:tc><w:tcPr><w:tcW w:w="'+cw+'" w:type="dxa"/><w:shd w:val="clear" w:color="auto" w:fill="'+col+'"/></w:tcPr><w:p><w:r><w:rPr><w:b/><w:color w:val="FFFFFF"/><w:sz w:val="16"/></w:rPr><w:t>'+xe(c)+'</w:t></w:r></w:p></w:tc>';});x+='</w:tr>';rows.forEach(function(r,ri){x+='<w:tr>';r.forEach(function(c){x+='<w:tc><w:tcPr><w:tcW w:w="'+cw+'" w:type="dxa"/><w:shd w:val="clear" w:color="auto" w:fill="'+(ri%2?'EEF3FC':'FFFFFF')+'"/></w:tcPr><w:p><w:r><w:rPr><w:sz w:val="16"/></w:rPr><w:t xml:space="preserve">'+xe(c)+'</w:t></w:r></w:p></w:tc>';});x+='</w:tr>';});return x+'</w:tbl>';}
function itemsToText(items){return items.map(function(it){if(it.t==='title')return it.v+'\n'+'═'.repeat(50);if(it.t==='h1')return '\n▌ '+it.v;if(it.t==='p')return '  '+it.v;if(it.t==='table')return [it.headers.join(' | ')].concat(it.rows.map(function(r){return r.join(' | ');})).join('\n');return '';}).join('\n');}

function showExp(i,f,g){_expItems=i;_expFn=f;_expGift=!!g;document.getElementById('expTitle').textContent=f;document.getElementById('expTxt').value=g?giftRaw:itemsToText(i);document.getElementById('expDlBtn').textContent=g?'⬇ TXT':'⬇ DOCX';document.getElementById('expFmt').textContent=g?'GIFT Moodle':'Word';document.getElementById('expOv').classList.add('show');}
function expCopy(){var t=document.getElementById('expTxt');t.select();try{document.execCommand('copy');toast('✅ Copiat','#2e7d32');}catch(e){navigator.clipboard.writeText(t.value).then(function(){toast('✅','#2e7d32');});}}
function expDl(){if(_expGift){var b=new Blob([giftRaw],{type:'text/plain'}),u=URL.createObjectURL(b),a=document.createElement('a');a.href=u;a.download=_expFn;document.body.appendChild(a);a.click();setTimeout(function(){document.body.removeChild(a);URL.revokeObjectURL(u);},300);toast('⬇ '+_expFn,'#2e7d32');return;}toast('⏳ Generare DOCX…','#1565c0');buildDocx(_expItems).then(function(b){var u=URL.createObjectURL(b),a=document.createElement('a');a.href=u;a.download=_expFn;document.body.appendChild(a);a.click();setTimeout(function(){document.body.removeChild(a);URL.revokeObjectURL(u);},300);toast('⬇ '+_expFn,'#2e7d32');}).catch(function(e){toast('⚠ '+e.message,'#bf360c');});}
document.getElementById('expOv').addEventListener('click',function(e){if(e.target===this)this.classList.remove('show');});

function expSbl(key){
  var t=testsList.find(function(x){return x.key===key;});if(!t)return;
  var ms=getMods(),rm=t.allMods?ms:ms.filter(function(m){return t.modIds.indexOf(m.id)>=0;});
  var items=genItemList(t,rm),saved=sblData[key]||{};
  var docItems=[{t:'title',v:'ȘABLON TEST — '+t.den},{t:'p',v:t.nrItemi+' itemi · '+t.timp+' min · Prag '+t.prag+'%'},{t:'line'}];
  [1,2,3].forEach(function(lv){
    var lvI=items.filter(function(it){return it.lvl===lv;});if(!lvI.length)return;
    docItems.push({t:'h1',v:NC_NM[lv]+' — '+lvI.length+' itemi · '+(['','1p','2p','4p'][lv]),col:['','1565C0','2E7D32','BF360C'][lv]});
    lvI.forEach(function(it){
      docItems.push({t:'p',v:'['+it.code+' '+it.nr+'] '+it.typeName+' ('+it.pts+'p) · '+it.R+'. '+it.mod.name});
      docItems.push({t:'p',v:'↳ '+it.instr});
      docItems.push({t:'p',v:saved[it.nr-1]?'Enunț: '+saved[it.nr-1]:'Enunț: ___________________________________________'});
      docItems.push({t:'line'});
    });
  });
  _expItems=docItems;_expFn='Sablon_'+t.den.replace(/\s+/g,'_').substring(0,28)+'.docx';_expGift=false;
  document.getElementById('expTitle').textContent=t.den;document.getElementById('expTxt').value=itemsToText(docItems);document.getElementById('expDlBtn').textContent='⬇ DOCX';document.getElementById('expFmt').textContent='Word';document.getElementById('expOv').classList.add('show');
}

function exp(type){
  var ms=getMods(),cM=+document.getElementById('cM').value||4,items=[],f='';
  if(type==='t2'){if(!testsList.length){toast('⚠ Generați întâi!','#bf360c');return;}items.push({t:'title',v:'LISTA TESTELOR — Tabelul 2'});items.push({t:'line'});items.push({t:'table',headers:['#','Denumire','Tip','Module','Itemi','Timp','Prag'],rows:testsList.map(function(t){return[String(t.nr),t.den,t.tip,t.allMods?'Toate':t.modIds.map(toRoman).join(','),String(t.nrItemi),String(t.timp),t.prag+'%'];})});f='Tabelul2.docx';}
  else if(type==='t3'){if(!ms.length)return;items.push({t:'title',v:'COLECȚII — Tabelul 3'});items.push({t:'line'});items.push({t:'table',headers:['Modul','Ore','Total','Binar','Sing','Mult'],rows:ms.map(function(m){var T=m.ore*2*cM;return[toRoman(m.id)+'. '+m.name,m.ore+'h',String(T),String(Math.round(T*.32)),String(Math.round(T*.14)),String(Math.round(T*.24))];})});f='Tabelul3.docx';}
  else if(type==='mat'){buildGiftRaw();var tm=testsList.find(function(t){return t.key===selMatKey;})||testsList.find(function(t){return t.tip==='Final';});if(!tm)return;var rm=tm.allMods?ms:ms.filter(function(m){return tm.modIds.indexOf(m.id)>=0;}),tO=rm.reduce(function(s,m){return s+m.ore;},0)||1;items.push({t:'title',v:'MATRICE — Anexa 2'});items.push({t:'p',v:'Test: '+tm.den+' · '+tm.nrItemi+' itemi'});items.push({t:'line'});var s1=0,s2=0,s3=0,mR=rm.map(function(m){var n1=Math.max(0,Math.round(tm.nrItemi*tm.bloom.nc1/100*m.ore/tO)),n2=Math.max(0,Math.round(tm.nrItemi*tm.bloom.nc2/100*m.ore/tO)),n3=Math.max(0,Math.round(tm.nrItemi*tm.bloom.nc3/100*m.ore/tO));s1+=n1;s2+=n2;s3+=n3;return[toRoman(m.id)+'. '+m.name.substring(0,25),m.ore+'h',String(n1),String(n2),String(n3),String(n1+n2+n3)];});mR.push(['TOTAL','',String(s1),String(s2),String(s3),String(s1+s2+s3)]);items.push({t:'table',headers:['Modul','Ore','NC1','NC2','NC3','Total'],rows:mR});f='Matrice.docx';}
  else if(type==='gift'){buildGift(getMods(),document.getElementById('cC').value||'CURS');showExp([],'BancaGIFT.txt',true);cmn();return;}
  if(items.length&&f)showExp(items,f,false);cmn();
}

function doPrint(){try{var w=window.open('','_blank');if(!w)return;var a=document.querySelector('.tp.on');w.document.write('<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Print</title><style>body{font-family:Segoe UI;font-size:11px;padding:20px}table{border-collapse:collapse;width:100%}th,td{border:1px solid #ccc;padding:5px 7px}th{background:#f0f4f8}@media print{.np{display:none}}</style></head><body><button class="np" onclick="window.print()">🖨 Print</button>'+(a?a.innerHTML:'')+'</body></html>');w.document.close();}catch(e){}}

// ═══ DEMO ═══
function loadDemo(){
  document.getElementById('modBody').innerHTML='';rowIdx=0;
  document.getElementById('cC').value='Informatica_X';
  [['Recapitulare și consolidare',2,1],['Metode de descriere a limbajelor',4,1],['Vocabularul și sintaxa limbajului',5,1],['Tipuri de date simple',10,2],['Instrucțiuni de programare',25,3],['Elemente de Web Design',22,2]].forEach(function(d){addRow(d[0],d[1],d[2]);});
  toast('📄 Demo Informatică cl.X','#2e7d32');
}

// ═══ INIT ═══
cB();ss();updCfg();
addRow('',0,0);addRow('',0,0);addRow('',0,0);
filterTip('bloomModSel','bloomTipSel');filterTip('cfgModSel','cfgTipSel');
sts();