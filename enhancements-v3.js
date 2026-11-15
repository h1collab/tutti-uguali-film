/* ZORIX cinema enhancement: PNG upgrade and store-style review controls */
(function(){
'use strict';
function swapOriginalPoster(){
 var url=new URL('../poster.png',document.baseURI).href;
 var img=new Image();
 img.onload=function(){
  document.querySelectorAll('img[data-poster]').forEach(function(el){el.src=url;});
  document.documentElement.style.setProperty('--poster-image','url("'+url+'")');
  var video=document.getElementById('video');
  if(video)video.poster=url;
 };
 img.onerror=function(){};
 img.src=url;
}
swapOriginalPoster();
var section=document.getElementById('editorial-reviews');
if(!section)return;
var reviews=Array.from(section.querySelectorAll('[data-editorial-review]'));
var filter='all',sort='default';
var buttons=Array.from(document.querySelectorAll('[data-review-filter]'));
var sorter=document.getElementById('review-sort');
function update(){
 buttons.forEach(function(button){
  var active=button.getAttribute('data-review-filter')===filter;
  button.classList.toggle('is-selected',active);
  button.setAttribute('aria-pressed',String(active));
 });
 var visible=reviews.filter(function(card){
   var rating=Number(card.dataset.rating);
   return filter==='all'||(filter==='high'&&rating>=9)||(filter==='critical'&&card.dataset.critique==='true');
 });
 visible.sort(function(a,b){
   if(sort==='highest')return Number(b.dataset.rating)-Number(a.dataset.rating);
   if(sort==='lowest')return Number(a.dataset.rating)-Number(b.dataset.rating);
   return Number(a.dataset.originalIndex)-Number(b.dataset.originalIndex);
 });
 reviews.forEach(function(r){r.hidden=true;});
 visible.forEach(function(r){
  r.hidden=false;
  section.appendChild(r);
  r.classList.remove('is-highlight');
  if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches){
   void r.offsetWidth;
   r.classList.add('is-highlight');
  }
 });
}
buttons.forEach(function(button){button.addEventListener('click',function(){filter=this.dataset.reviewFilter;update();});});
if(sorter)sorter.addEventListener('change',function(){sort=this.value;update();});
update();
})();