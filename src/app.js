(function(){
'use strict';
/* písmo načítať hneď na začiatku – inak môže pri zmene veľkosti na chvíľu naskočiť náhradné písmo */
try{if(document.fonts&&document.fonts.load)document.fonts.load('34px FR','אבגוּוֹשׁ').then(function(){document.documentElement.classList.add('pismo')})}catch(e){}
var D=document,R=D.documentElement,B=D.body;
function $(id){return D.getElementById(id)}
function get(k){try{return localStorage.getItem(k)}catch(e){return null}}
function set(k,v){try{localStorage.setItem(k,v)}catch(e){}}
function nb(t){return String(t).replace(/(^|[\s(„])([aiksouvzAIKSOUVZ]) /g,'$1$2 ')}
var CP=(window.Capacitor&&window.Capacitor.Plugins)||{};
var MAIL='sidur.hineni@gmail.com';
var CHEV='<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>';

/* ---------- strany ---------- */
var P=STRANY,N=P.length,IDX={};P.forEach(function(p,i){IDX[p.id]=i});
var ART=P.map(function(p){return $('p-'+p.id)});
var scroll=$('scroll'),cur=-1;
function lab(i,j){var a=P[i],b=P[j];return b&&a.ser&&a.ser===b.ser?String(b.num):''}

ART.forEach(function(a,i){
  var p=P[i],o=a.querySelector('.otv'),h='<div class="eb"><span class="sek">'+nb(p.grp)+'</span>'+(p.pill?'<span class="cis">'+p.pill.replace(' ',' ')+'</span>':'')+'</div>';
  if(p.pis)h+='<p class="velke" lang="he" dir="rtl">'+p.pis+'</p>';
  h+='<p class="naz">'+nb(p.tit)+'<small>'+p.desc+'</small></p><div class="orn" aria-hidden="true"><i></i>✦<i></i></div>';
  o.innerHTML=h;
  var k=a.querySelector('.koniec'),nx=P[i+1];
  h='<div class="k1">'+nb(p.kon)+'</div>';
  if(nx)h+='<button type="button" class="dalsia" data-ist="'+(i+1)+'"><span class="t"><span class="e">Ďalej</span><b>'+nb(nx.tit)+'</b><small>'+nx.desc+'</small></span><span class="ch">'+CHEV+'</span></button>';
  else h+='<p class="hotovo">'+nb('Prešiel si celý materiál. K ľubovoľnej časti sa vrátiš cez obsah.')+'</p><div class="sekL"><button type="button" data-obsah>Obsah</button></div>';
  h+='<div class="sekL"><button type="button" data-precvic>Precvičiť znova bez výslovnosti</button><button type="button" data-chyba>Nahlásiť chybu</button></div>';
  k.innerHTML=h;
  // slová a riadky ako tlačidlá
  [].forEach.call(a.querySelectorAll('.row'),function(r){
    var n=r.querySelector('.num');if(n){var bt=D.createElement('button');bt.type='button';bt.className='num';bt.textContent=n.textContent;bt.setAttribute('aria-label','Riadok '+n.textContent+' – výslovnosť celého riadku');n.replaceWith(bt)}
  });
  [].forEach.call(a.querySelectorAll('.w,.odp'),function(w){w.setAttribute('role','button');w.tabIndex=0;w._pr=false});
});

/* ---------- výslovnosť: oko, slová, riadky ---------- */
var H=get('hideTr')==='1',eye=$('t');
function vidno(w){return H?w._pr:!w._pr}
function kresliW(w){var v=vidno(w);w.classList.toggle('skr',!v);w.classList.toggle('ukaz',H&&v);w.setAttribute('aria-pressed',v?'true':'false')}
function kresliVsetko(){[].forEach.call(D.querySelectorAll('.w,.odp'),function(w){w._pr=false;kresliW(w)})}
function nastavH(h,hlas){H=h;set('hideTr',h?'1':'0');eye.setAttribute('aria-pressed',h?'true':'false');eye.setAttribute('aria-label',h?'Ukázať výslovnosť':'Skryť výslovnosť');
  $('vysP').setAttribute('aria-checked',h?'false':'true');kresliVsetko();
  if(hlas){var c=+(get('toastN')||0);if(c<3||!h){toast(h?'Výslovnosť je skrytá. Ťukni na slovo a ukáže sa.':'Výslovnosť je zobrazená.');if(h)set('toastN',String(c+1))}}}
nastavH(H,false);
eye.onclick=function(){nastavH(!H,true)};
var posledne=null,posledneT=0;
function prepni(w){var t=Date.now();if(w===posledne&&t-posledneT<350)return;posledne=w;posledneT=t;w._pr=!w._pr;kresliW(w)}
scroll.addEventListener('click',function(e){
  if(posun)return;
  var w=e.target.closest('.w,.odp');if(w){prepni(w);return}
  var n=e.target.closest('.row .num');if(n){var ws=[].slice.call(n.parentNode.querySelectorAll('.w'));var skryte=ws.some(function(x){return !vidno(x)});ws.forEach(function(x){x._pr=skryte?H:!H;kresliW(x)});return}
  var d=e.target.closest('[data-ist]');if(d){chod(+d.getAttribute('data-ist'));return}
  if(e.target.closest('[data-precvic]')){nastavH(true,true);scroll.scrollTo({top:0,behavior:'smooth'});return}
  if(e.target.closest('[data-chyba]')){chyba();return}
  if(e.target.closest('[data-obsah]')){otvorObsah();return}
});
scroll.addEventListener('keydown',function(e){if((e.key==='Enter'||e.key===' ')&&e.target.matches('.w,.odp')){e.preventDefault();prepni(e.target)}});

/* ---------- toast ---------- */
var tT=null;function toast(t){var el=$('toast');el.textContent=nb(t);el.hidden=false;clearTimeout(tT);tT=setTimeout(function(){el.hidden=true},2600)}

/* ---------- zobrazenie strany ---------- */
function ukaz(i,smer,riadok){
  if(i<0||i>=N)return;
  var p=P[i];
  if(cur>=0&&ART[cur])ART[cur].hidden=true;
  var a=ART[i];a.hidden=false;a.classList.remove('vstup','vstupP');
  if(smer){void a.offsetWidth;a.classList.add(smer>0?'vstup':'vstupP')}
  cur=i;
  $('titL').textContent=p.ser==='l'?p.tit:p.ser==='bp'?'Big Practice':p.ser==='am'?'Amida':p.tit;
  $('titHe').textContent=p.he||'';
  $('nStT').textContent=p.kr;$('nStS').textContent=(i+1)+' z '+N+' · prejsť';
  var sp=$('nSp'),da=$('nDa');
  sp.disabled=i===0;da.disabled=i===N-1;
  $('nSpC').textContent=i>0?lab(i,i-1):'';$('nDaC').textContent=i<N-1?lab(i,i+1):'';
  sp.setAttribute('aria-label',i>0?'Predchádzajúca časť: '+P[i-1].kr:'');da.setAttribute('aria-label',i<N-1?'Ďalšia časť: '+P[i+1].kr:'');
  if(riadok!=null){var r=a.querySelectorAll('.row')[riadok];scroll.scrollTop=0;if(r)scroll.scrollTop=r.getBoundingClientRect().top-scroll.getBoundingClientRect().top-8}
  else scroll.scrollTop=0;
  ulozPoz();
}
/* navigácia cez históriu (Späť v prehliadači aj v Androide) */
var hl=0;
function chod(i,riadok){
  if(i<0||i>=N)return;
  var smer=cur<0?0:(i>cur?1:-1);
  zavriVsetko();schovajUvod();
  var id=P[i].id;
  if(location.hash==='#'+id){ukaz(i,smer,riadok);return}
  cakaR=riadok;cakaS=smer;hl++;location.hash=id;
}
var cakaR=null,cakaS=0;
window.addEventListener('hashchange',function(){
  var id=location.hash.slice(1);
  if(!id||IDX[id]==null){ukazUvod();return}
  var i=IDX[id],smer=cakaS||(cur<0?0:(i>cur?1:-1)),r=cakaR;cakaS=0;cakaR=null;
  zavriVsetko();schovajUvod();ukaz(i,smer,r);
});
$('nSp').onclick=function(){chod(cur-1)};
$('nDa').onclick=function(){chod(cur+1)};
/* potiahnutie prstom */
var tx=0,ty=0,posun=false;
scroll.addEventListener('touchstart',function(e){var t=e.touches[0];tx=t.clientX;ty=t.clientY;posun=false},{passive:true});
scroll.addEventListener('touchmove',function(e){var t=e.touches[0];if(Math.abs(t.clientX-tx)>10||Math.abs(t.clientY-ty)>10)posun=true},{passive:true});
scroll.addEventListener('touchend',function(e){var t=e.changedTouches[0],dx=t.clientX-tx,dy=t.clientY-ty;
  if(Math.abs(dx)>60&&Math.abs(dx)>1.5*Math.abs(dy)){if(dx<0)chod(cur+1);else chod(cur-1)}
  setTimeout(function(){posun=false},50)});
D.addEventListener('keydown',function(e){
  if(e.key==='Tab')R.classList.add('klav');
  if(e.key==='Escape'){if(!zavriVsetko()&&$('uvod').hidden)spat();return}
  if(otvorene()||!$('uvod').hidden)return;
  if(e.target.matches&&e.target.matches('input,textarea'))return;
  if(e.key==='ArrowRight')chod(cur+1);else if(e.key==='ArrowLeft')chod(cur-1);
});
D.addEventListener('pointerdown',function(){R.classList.remove('klav')},true);

/* ---------- uloženie miesta (strana + riadok, nie pixely) ---------- */
var uT=0;
function ulozPoz(){if(cur<0)return;var a=ART[cur],rows=a.querySelectorAll('.row'),top=scroll.getBoundingClientRect().top,ri=0,rn='';
  for(var k=0;k<rows.length;k++){var b=rows[k].getBoundingClientRect();if(b.bottom>top+20){ri=k;rn=(rows[k].querySelector('.num')||{}).textContent||'';break}}
  if(scroll.scrollTop<40){ri=0;rn=''}
  set('poz',JSON.stringify({p:P[cur].id,r:ri,n:rn}))}
scroll.addEventListener('scroll',function(){if(uT)return;uT=setTimeout(function(){uT=0;ulozPoz()},250)},{passive:true});

/* ---------- okná ---------- */
var OKNA=['nav','mriezka','nast','info','onb'];
function otvorene(){return OKNA.some(function(o){return !$(o).hidden})}
function otvor(id){OKNA.forEach(function(o){if(o!==id)$(o).hidden=true});$(id).hidden=false;var pn=$(id).querySelector('.panel,.obBox');if(pn){pn.tabIndex=-1;pn.focus({preventScroll:true})};$('toc').setAttribute('aria-expanded',id==='nav'?'true':'false')}
function zavriVsetko(){var bolo=false;OKNA.forEach(function(o){if(!$(o).hidden){$(o).hidden=true;bolo=true}});$('toc').setAttribute('aria-expanded','false');return bolo}
D.addEventListener('click',function(e){
  var z=e.target.closest('[data-zavri]');if(z){$(z.getAttribute('data-zavri')).hidden=true;$('toc').setAttribute('aria-expanded','false');return}
  if(e.target.classList&&e.target.classList.contains('sheet')){e.target.hidden=true;$('toc').setAttribute('aria-expanded','false')}
});
function otvorObsah(){otvor('nav');[].forEach.call($('nav').querySelectorAll('.obPol'),function(x){var on=cur>=0&&x.getAttribute('data-p')===P[cur].id;x.classList.toggle('akt',on);if(on){x.setAttribute('aria-current','true');setTimeout(function(){x.scrollIntoView({block:'center'})},0)}else x.removeAttribute('aria-current')})}
$('toc').onclick=function(){if($('nav').hidden)otvorObsah();else zavriVsetko()};
$('nav').addEventListener('click',function(e){var a=e.target.closest('.obPol');if(a){e.preventDefault();chod(IDX[a.getAttribute('data-p')])}});
$('nSt').onclick=function(){otvor('mriezka');var id=cur>=0?P[cur].id:'';[].forEach.call($('mriezka').querySelectorAll('.chip'),function(c){var p=c.getAttribute('data-p');c.classList.toggle('akt',p===id||(p==='s5a'&&id==='s5b'))})};
$('mriezka').addEventListener('click',function(e){var c=e.target.closest('.chip');if(c)chod(IDX[c.getAttribute('data-p')])});
$('nastB').onclick=function(){otvor('nast')};
$('oApp').onclick=function(){otvor('info')};
function chyba(){var kde=cur>=0?P[cur].kr:'';location.href='mailto:'+MAIL+'?subject='+encodeURIComponent('Hebrejčina – chyba'+(kde?': '+kde:''))+'&body='+encodeURIComponent('Časť: '+kde+'\nRiadok: \nČo nesedí: \n')}
$('chybaB').onclick=chyba;

/* ---------- nastavenie: písmo, výslovnosť, noc ---------- */
var VH=[28,31,34,39,45,52],VP=[13,14,15,16,18,20],VT=[15,16,16,17,18,20];
var vel=parseInt(get('vel')||'2',10);if(!(vel>=0&&vel<6))vel=2;
function kresliVel(){R.style.setProperty('--fhe',VH[vel]+'px');R.style.setProperty('--fpr',VP[vel]+'px');R.style.setProperty('--ftx',VT[vel]+'px');$('vel').textContent=vel+1;$('m').disabled=vel===0;$('p').disabled=vel===5;set('vel',String(vel))}
kresliVel();
$('m').onclick=function(){if(vel>0){vel--;kresliVel()}};$('p').onclick=function(){if(vel<5){vel++;kresliVel()}};
var mq=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)');
function isDark(){return R.classList.contains('dark')||(!R.classList.contains('light')&&mq&&mq.matches)}
var th=get('theme');if(th==='dark')R.classList.add('dark');if(th==='light')R.classList.add('light');
function lista(){try{if(CP.SystemBars)CP.SystemBars.setStyle({style:isDark()?'DARK':'LIGHT'})}catch(e){}}
function dkStav(){$('dk').setAttribute('aria-checked',isDark()?'true':'false');lista()}
dkStav();if(mq&&mq.addEventListener)mq.addEventListener('change',dkStav);
$('nast').addEventListener('click',function(e){var b=e.target.closest('[data-prep]');if(!b)return;
  if(b.getAttribute('data-prep')==='noc'){var d=!isDark();R.classList.remove('dark','light');R.classList.add(d?'dark':'light');set('theme',d?'dark':'light');dkStav()}
  else nastavH(!H,true)});

/* ---------- úvod, pokračovanie, prvé spustenie ---------- */
function citajPoz(){try{return JSON.parse(get('poz')||'null')}catch(e){return null}}
function kresliUvod(){var z=citajPoz();
  if(z&&IDX[z.p]!=null&&(IDX[z.p]>0||z.r>0)){$('uvDalejT').textContent='Pokračovať';$('uvKde').textContent=P[IDX[z.p]].kr+(z.n?' · riadok '+z.n:'')}
  else{$('uvDalejT').textContent='Začať 1. lekciou';$('uvKde').textContent=''}}
function ukazUvod(){kresliUvod();zavriVsetko();$('uvod').hidden=false;try{if(CP.KeepAwake)CP.KeepAwake.allowSleep()}catch(e){}}
function schovajUvod(){if($('uvod').hidden)return;$('uvod').hidden=true;try{if(CP.KeepAwake)CP.KeepAwake.keepAwake()}catch(e){}}
$('uvDalej').onclick=function(){var z=citajPoz(),i=z&&IDX[z.p]!=null?IDX[z.p]:0;chod(i,z&&IDX[z.p]!=null?z.r:null);
  if(!get('onb')){set('onb','1');setTimeout(function(){otvor('onb')},250)}};
$('uvObsah').onclick=function(){schovajUvod();if(cur<0){var z=citajPoz();ukaz(z&&IDX[z.p]!=null?IDX[z.p]:0,0)}otvorObsah()};

/* ---------- Späť (Android) ---------- */
function spat(){
  if(zavriVsetko())return true;
  if($('uvod').hidden){if(hl>0){hl--;history.back();return true}ukazUvod();try{history.replaceState(null,'',location.pathname+location.search)}catch(e){}return true}
  return false;
}
window.hinSpat=spat;
try{if(CP.App&&CP.App.addListener)CP.App.addListener('backButton',function(){if(!spat()){try{CP.App.exitApp()}catch(e){}}})}catch(e){}

/* ---------- štart ---------- */
var start=location.hash.slice(1);
if(start&&IDX[start]!=null){schovajUvod();ukaz(IDX[start],0)}
else ukazUvod();
})();
