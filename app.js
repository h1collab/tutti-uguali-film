/* ZORIX Movies: accessible, dependency-free cinema player and reviews */
(function(){
'use strict';
document.documentElement.classList.add('js-enhanced');
var $=function(id){return document.getElementById(id);};
var video=$('video'), player=$('player'), hud=$('hud'), cover=$('cover-play');
var seek=$('seek'), time=$('time'), play=$('toggle-play'), mute=$('toggle-mute');
var idleTimer, toastTimer, wasSeeking=false, initiated=false;
function sec(value){if(!Number.isFinite(value))return '--:--';var n=Math.max(0,Math.floor(value));return Math.floor(n/3600)>0?Math.floor(n/3600)+':'+String(Math.floor(n%3600/60)).padStart(2,'0')+':'+String(n%60).padStart(2,'0'):Math.floor(n/60)+':'+String(n%60).padStart(2,'0');}
function notice(msg){var el=$('toast');el.textContent=msg;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(function(){el.classList.remove('show');},3500);}
function duration(){return Number.isFinite(video.duration)?video.duration:0;}
function requestPlay(){initiated=true;cover.classList.add('is-hidden');var p=video.play();if(p&&p.catch)p.catch(function(){notice('Premi Riproduci per iniziare il documentario.');updatePlay();});}
function toggle(){if(video.paused)requestPlay();else video.pause();}
function updatePlay(){var paused=video.paused;player.classList.toggle('is-paused',paused);play.setAttribute('aria-label',paused?'Riproduci':'Pausa');play.title=paused?'Riproduci':'Pausa';$('play-symbol').innerHTML=paused?'<path d="M8 4v16l12-8z"/>':'<path d="M7 5h3v14H7zm7 0h3v14h-3z"/>';if(!paused){cover.classList.add('is-hidden');scheduleIdle();}else{hud.classList.remove('is-idle');clearTimeout(idleTimer);}}
function updatePosition(){var d=duration();if(!wasSeeking&&d){seek.value=String(Math.round(video.currentTime/d*1000));seek.style.setProperty('--progress',(video.currentTime/d*100).toFixed(2)+'%');}time.textContent=sec(video.currentTime)+' / '+(d?sec(d):'--:--');}
function updateBuffer(){var d=duration();if(!d)return;var end=0;try{var r=video.buffered;for(var i=0;i<r.length;i++){if(r.start(i)<=video.currentTime+1)end=Math.max(end,r.end(i));}}catch(e){}seek.style.setProperty('--buffer',Math.max(0,Math.min(100,end/d*100)).toFixed(2)+'%');}
function scheduleIdle(){clearTimeout(idleTimer);hud.classList.remove('is-idle');if(!video.paused)idleTimer=setTimeout(function(){if(!video.paused&&!player.matches(':focus-within'))hud.classList.add('is-idle');},3000);}
function updateVolume(){var off=video.muted||video.volume===0;$('volume-waves').style.opacity=off?'.1':'1';mute.setAttribute('aria-label',off?'Attiva audio':'Disattiva audio');}
function jump(by){if(duration())video.currentTime=Math.max(0,Math.min(duration(),video.currentTime+by));}
if(video&&player){
$('cover-play').addEventListener('click',requestPlay);
$('start-film').addEventListener('click',function(){setTimeout(function(){requestPlay();},150);});
play.addEventListener('click',toggle);
video.addEventListener('play',updatePlay);video.addEventListener('pause',updatePlay);
video.addEventListener('ended',function(){updatePlay();cover.classList.remove('is-hidden');});
video.addEventListener('timeupdate',updatePosition);video.addEventListener('progress',updateBuffer);
video.addEventListener('loadedmetadata',function(){var d=duration();if(d){$('duration-tag').textContent=Math.ceil(d/60)+' min';updatePosition();}});
video.addEventListener('error',function(){var e=$('video-error');e.classList.add('visible');if(!initiated)notice('Video momentaneamente non disponibile.');});
video.addEventListener('waiting',function(){if(initiated)notice('Caricamento del video…');});
video.addEventListener('canplay',function(){$('video-error').classList.remove('visible');});
seek.addEventListener('input',function(){wasSeeking=true;var d=duration(),v=Number(seek.value)/1000;if(d){time.textContent=sec(v*d)+' / '+sec(d);seek.style.setProperty('--progress',(v*100)+'%');}});
seek.addEventListener('change',function(){if(duration())video.currentTime=Number(seek.value)/1000*duration();wasSeeking=false;updatePosition();});
$('rewind').addEventListener('click',function(){jump(-10);scheduleIdle();});
$('forward').addEventListener('click',function(){jump(10);scheduleIdle();});
mute.addEventListener('click',function(){video.muted=!video.muted;updateVolume();});
$('volume').addEventListener('input',function(e){video.volume=Number(e.target.value);video.muted=video.volume===0;updateVolume();});
video.addEventListener('volumechange',updateVolume);
$('speed').addEventListener('change',function(e){video.playbackRate=Number(e.target.value);notice('Velocità: '+e.target.value+'×');});
var pip=$('pip');if(!document.pictureInPictureEnabled||!video.requestPictureInPicture)pip.hidden=true;
pip.addEventListener('click',async function(){try{if(document.pictureInPictureElement)await document.exitPictureInPicture();else await video.requestPictureInPicture();}catch(e){notice('Picture in Picture non disponibile.');}});
$('fullscreen').addEventListener('click',async function(){try{if(document.fullscreenElement){await document.exitFullscreen();}else if(player.requestFullscreen){await player.requestFullscreen();}else if(video.webkitEnterFullscreen){video.webkitEnterFullscreen();}else{notice('Schermo intero non supportato.');}}catch(e){notice('Schermo intero non disponibile.');}});
player.addEventListener('mousemove',scheduleIdle);player.addEventListener('touchstart',function(){hud.classList.remove('is-idle');scheduleIdle();},{passive:true});
player.addEventListener('dblclick',function(e){if(e.target.closest('button,input,select'))return;if(duration())toggle();});
$('theater').addEventListener('click',function(){var active=document.body.classList.toggle('is-theater');this.setAttribute('aria-pressed',String(active));this.textContent=active?'Esci dalla modalità cinema':'Modalità cinema';player.scrollIntoView({block:'center',behavior:'smooth'});});
$('share').addEventListener('click',async function(){var data={title:'TUTTI UGUALI | ZORIX',text:'Un documentario breve originale ZORIX.',url:location.origin+location.pathname};try{if(navigator.share)await navigator.share(data);else if(navigator.clipboard){await navigator.clipboard.writeText(data.url);notice('Link copiato negli appunti.');}else{notice('Copia il link dalla barra del browser.');}}catch(e){if(e.name!=='AbortError')notice('Impossibile condividere il link.');}});
document.addEventListener('keydown',function(e){var t=e.target;if(/INPUT|TEXTAREA|SELECT|BUTTON/.test(t.tagName)||t.isContentEditable)return;var rect=player.getBoundingClientRect();if(rect.bottom<0||rect.top>window.innerHeight)return;var handled=true;switch(e.code){case 'Space':case 'KeyK':toggle();break;case 'ArrowLeft':jump(-5);break;case 'ArrowRight':jump(5);break;case 'KeyM':video.muted=!video.muted;break;case 'KeyF':$('fullscreen').click();break;default:handled=false;}if(handled)e.preventDefault();});
updatePlay();updateVolume();updatePosition();
}
/* Animation respects reduced-motion and appears once. */
var reduced=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var reveals=document.querySelectorAll('.reveal');
if('IntersectionObserver' in window&&!reduced){var observer=new IntersectionObserver(function(entries){entries.forEach(function(entry){if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target);}});},{threshold:.06,rootMargin:'0px 0px -10px 0px'});reveals.forEach(function(el){observer.observe(el);});}else reveals.forEach(function(el){el.classList.add('visible');});
var bar=$('meter-bar');if(bar){if(reduced)bar.style.width='92.25%';else{setTimeout(function(){bar.style.width='92.25%';},500);}}
/* Local personal score: distinct from published GitHub reviews and the supplied four testimonials. */
var selected=null,key='zorix-film-personal-score-v2';
try{var stored=Number(localStorage.getItem(key));if(stored>=1&&stored<=10)selected=stored;}catch(e){}
var slider=$('score-slider'), chips=document.querySelectorAll('.score-chip'), msg=$('score-message');
function formatScore(s){return s==null?'—':s.toFixed(1).replace('.',',');}
function setScore(n,persist){selected=Math.max(1,Math.min(10,Math.round(Number(n)*2)/2));slider.value=String(selected);$('my-score').textContent=formatScore(selected);var pressed=Number.isInteger(selected);chips.forEach(function(c){c.setAttribute('aria-pressed',String(pressed&&Number(c.dataset.score)===selected));});$('publish-review').disabled=false;msg.textContent='Il tuo voto: '+formatScore(selected)+'/10. Puoi aggiungere un commento e pubblicarlo.';if(persist){try{localStorage.setItem(key,String(selected));}catch(e){}}}
if(selected!==null)setScore(selected,false);else{$('my-score').textContent='—';slider.value='5';$('publish-review').disabled=true;}
slider.addEventListener('input',function(){setScore(slider.value,true);});
chips.forEach(function(chip){chip.addEventListener('click',function(){setScore(chip.dataset.score,true);});});
$('publish-review').addEventListener('click',function(){
if(selected==null)return;
var review=$('review-text').value.trim().slice(0,1500);
var clean=String(selected).replace('.',',');
var title='[Recensione] TUTTI UGUALI - '+clean+'/10';
var body='Voto: '+clean+'/10\n\nRecensione:\n'+(review||'Solo valutazione.')+'\n\n---\nPubblicata da movies.zorix.it';
var url='https://github.com/h1collab/tutti-uguali-film/issues/new?title='+encodeURIComponent(title)+'&body='+encodeURIComponent(body);
window.open(url,'_blank','noopener,noreferrer');notice('Si apre GitHub: conferma lì la pubblicazione.');
});
/* GitHub community feedback, explicitly kept distinct from submitted offline feedback. */
var list=$('community-list'),stats=$('community-stats');
var api='https://api.github.com/repos/h1collab/tutti-uguali-film/issues?state=all&per_page=100';
function addCommunity(items){
list.replaceChildren();
var seen=new Set(),reviews=[];
items.forEach(function(issue){
if(issue.pull_request||!issue.title||!issue.user)return;
var title=issue.title.match(/^\[Recensione\]\s*TUTTI UGUALI\s*[-—]\s*(10(?:[.,]0)?|[1-9](?:[.,][05])?)\/10$/i);
if(!title)return;
var score=Number(title[1].replace(',','.'));if(score<1||score>10)return;
/* One entry per GitHub user: prioritize the latest, which makes updates effective. */
if(seen.has(issue.user.login))return;seen.add(issue.user.login);
reviews.push({issue:issue,score:score});
});
if(!reviews.length){stats.textContent='Nessuna recensione pubblicata su GitHub';var blank=document.createElement('p');blank.className='empty-state';blank.textContent='Non ci sono ancora recensioni GitHub. Le recensioni condivise con ZORIX sono mostrate sopra, separatamente dalle recensioni GitHub.';list.append(blank);return;}
var mean=reviews.reduce(function(s,r){return s+r.score;},0)/reviews.length;
stats.textContent=reviews.length+' recensioni verificate tramite GitHub · Media '+formatScore(mean)+'/10';
reviews.slice(0,8).forEach(function(r,i){
var issue=r.issue,article=document.createElement('article');article.className='review-card is-new';article.style.animationDelay=(i*.06)+'s';
var top=document.createElement('div');top.className='review-top';
var source=document.createElement('span');source.className='review-source';
var badge=document.createElement('span');badge.className='avatar';badge.textContent=(issue.user.login||'?').slice(0,2).toUpperCase();
var name=document.createElement('a');name.href=issue.html_url;name.target='_blank';name.rel='noopener noreferrer';name.textContent=issue.user.login;name.style.color='#dfe8e9';name.style.textDecoration='none';
source.append(badge,name);
var rating=document.createElement('span');rating.className='rating-pill';rating.textContent=formatScore(r.score)+' / 10';top.append(source,rating);article.append(top);
var m=(issue.body||'').match(/Recensione:\s*([\s\S]*?)(?:\n---|$)/i);var content=m?m[1].trim():'';
if(content&&content!=='Solo valutazione.'){var quote=document.createElement('blockquote');quote.textContent=content.slice(0,1000);article.append(quote);}
var date=document.createElement('p');date.className='review-details';date.textContent='Pubblicato su GitHub · '+new Date(issue.created_at).toLocaleDateString('it-IT');article.append(date);list.append(article);
});
}
async function readReviews(){
try{
var cached=null;try{cached=JSON.parse(localStorage.getItem('zorix-github-ratings-v2')||'null');}catch(e){}
if(cached&&Date.now()-cached.time<15*60*1000){addCommunity(cached.data);return;}
var response=await fetch(api,{headers:{Accept:'application/vnd.github+json'}});
if(!response.ok)throw new Error('HTTP '+response.status);
var data=await response.json();
addCommunity(data);
try{localStorage.setItem('zorix-github-ratings-v2',JSON.stringify({time:Date.now(),data:data}));}catch(e){}
}catch(e){stats.textContent='Recensioni GitHub temporaneamente non disponibili';list.replaceChildren();var p=document.createElement('p');p.className='empty-state';p.textContent='Impossibile recuperare le recensioni in questo momento. Riprova più tardi.';list.append(p);}
}
readReviews();
})();