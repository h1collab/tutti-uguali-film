/* ZORIX film: PNG image upgrade, owner-provided reviews, accessible sorting and pagination. */
(function(){
'use strict';
function swapOriginalPoster(){
 var url=new URL('../poster.png',document.baseURI).href;
 var img=new Image();
 img.onload=function(){
  document.querySelectorAll('img[data-poster]').forEach(function(el){el.src=url;});
  document.documentElement.style.setProperty('--poster-image','url("'+url+'")');
  var video=document.getElementById('video');if(video)video.poster=url;
 };
 img.onerror=function(){};
 img.src=url;
}
swapOriginalPoster();
var section=document.getElementById('editorial-reviews');
if(!section)return;
var additional=Array.isArray(window.ZORIX_ADDITIONAL_REVIEWS)?window.ZORIX_ADDITIONAL_REVIEWS:[];
/* Supplied feedback is not presented as independently verified GitHub reviews. */
additional.forEach(function(r,i){
 if(!r||!Number.isFinite(r.score)||r.score<1||r.score>10)return;
 var article=document.createElement('article');
 article.className='review-card reveal visible';
 article.dataset.editorialReview='true';
 article.dataset.originalIndex=String(i+4);
 article.dataset.rating=String(r.score);
 var critical=/ritmo|montaggio|continuit|transizion|scene|troppo veloc|sequenze|passaggi|affrettato|sviluppo/i.test(r.body||'');
 article.dataset.critique=String(critical);
 var head=document.createElement('div');head.className='review-top';
 var source=document.createElement('span');source.className='review-source';
 var avatar=document.createElement('span');avatar.className='avatar';avatar.textContent=String(i+5).padStart(2,'0');
 var author=document.createElement('span');author.textContent='Spettatore';
 var small=document.createElement('small');small.className='review-bylines';small.textContent='Feedback fornito a ZORIX';
 author.appendChild(small);
 source.append(avatar,author);
 var badge=document.createElement('span');badge.className='rating-pill';badge.textContent=r.score.toFixed(1).replace('.',',')+' / 10';
 head.append(source,badge);
 var title=document.createElement('h4');title.className='editorial-review-title';title.textContent=r.title||'Recensione del film';
 var quote=document.createElement('blockquote');quote.lang='it';quote.textContent=r.body||'';
 article.append(head,title,quote);section.appendChild(article);
});
var reviews=Array.from(section.querySelectorAll('[data-editorial-review]'));
var filter='all',sort='default',expanded=false;
var buttons=Array.from(document.querySelectorAll('[data-review-filter]'));
var sorter=document.getElementById('review-sort');
var filterCounts={
 all:reviews.length,
 high:reviews.filter(function(card){return Number(card.dataset.rating)>=9;}).length,
 critical:reviews.filter(function(card){return card.dataset.critique==='true';}).length
};
buttons.forEach(function(b){
 var key=b.dataset.reviewFilter;
 var count=b.querySelector('span');
 if(!count){count=document.createElement('span');b.appendChild(count);}
 count.textContent=String(filterCounts[key]||0);
});
var footer=document.createElement('div');footer.className='reviews-pagination';
var caption=document.createElement('span');caption.className='reviews-pagination-info';
var more=document.createElement('button');more.className='review-more';more.type='button';more.textContent='Mostra altre recensioni ↓';
footer.append(caption,more);
section.insertAdjacentElement('afterend',footer);
function reduceMotion(){return window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;}
function update(){
 buttons.forEach(function(button){
  var active=button.dataset.reviewFilter===filter;
  button.classList.toggle('is-selected',active);
  button.setAttribute('aria-pressed',String(active));
 });
 var visible=reviews.filter(function(card){
  return filter==='all'||(filter==='high'&&Number(card.dataset.rating)>=9)||(filter==='critical'&&card.dataset.critique==='true');
 });
 visible.sort(function(a,b){
  if(sort==='highest')return Number(b.dataset.rating)-Number(a.dataset.rating);
  if(sort==='lowest')return Number(a.dataset.rating)-Number(b.dataset.rating);
  return Number(a.dataset.originalIndex)-Number(b.dataset.originalIndex);
 });
 var count=expanded?visible.length:Math.min(6,visible.length);
 reviews.forEach(function(card){card.hidden=true;});
 visible.forEach(function(card,i){
  section.appendChild(card);
  if(i<count){
   card.hidden=false;
   card.classList.remove('is-highlight');
   if(!reduceMotion()){void card.offsetWidth;card.classList.add('is-highlight');}
  }
 });
 caption.textContent='Visualizzate '+count+' di '+visible.length+' recensioni';
 more.hidden=count>=visible.length;
 more.textContent='Mostra altre recensioni ('+(visible.length-count)+') ↓';
}
more.addEventListener('click',function(){expanded=true;update();});
buttons.forEach(function(b){b.addEventListener('click',function(){filter=b.dataset.reviewFilter;expanded=false;update();});});
if(sorter)sorter.addEventListener('change',function(){sort=sorter.value;expanded=false;update();});
update();
/* React to new reviews data only from the supplied static archive, not as GitHub-verified activity. */
})();