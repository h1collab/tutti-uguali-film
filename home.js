/* ZORIX Movies homepage: high-resolution poster enhancement */
(function(){
'use strict';
document.documentElement.classList.add('js');
function upgradePoster(){
 var url=new URL('poster.png',document.baseURI).href;
 var check=new Image();
 check.onload=function(){
   document.querySelectorAll('img[data-poster]').forEach(function(el){el.src=url;});
   document.documentElement.style.setProperty('--poster-image','url("'+url+'")');
 };
 check.onerror=function(){/* A compressed fallback remains while the PNG is not on the server. */};
 check.src=url;
}
upgradePoster();
var reduced=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if(!reduced&&'IntersectionObserver' in window){
 var els=document.querySelectorAll('.principle,.film-card,.tools-grid,.closing-inner');
 els.forEach(function(el){el.classList.add('reveal');});
 var io=new IntersectionObserver(function(entries){
  entries.forEach(function(entry){if(entry.isIntersecting){entry.target.classList.add('visible');io.unobserve(entry.target);}});
 },{threshold:.07,rootMargin:'0px 0px -10px 0px'});
 els.forEach(function(el){io.observe(el);});
}else document.querySelectorAll('.reveal').forEach(function(el){el.classList.add('visible');});
})();