/* index.js — Average Servicer — zero deps */
(function(){
  'use strict';

  /* 1 · Hero staggered fade */
  var hi = document.querySelectorAll('#hero .fi');
  hi.forEach(function(el,i){
    el.style.cssText='opacity:0;transform:translateY(14px);transition:opacity .65s ease '+(i*.12+.1)+'s,transform .65s cubic-bezier(.22,.68,0,1.18) '+(i*.12+.1)+'s';
  });
  requestAnimationFrame(function(){requestAnimationFrame(function(){
    hi.forEach(function(el){el.style.opacity='1';el.style.transform='none';});
  });});

  /* 2 · Scroll reveal */
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(!e.isIntersecting) return;
      var el=e.target, sib=Array.from(el.parentElement.children).filter(function(c){return c.classList.contains('card')||c.classList.contains('pill');});
      el.style.transitionDelay=(sib.indexOf(el)*.09)+'s';
      el.classList.add('visible');
      io.unobserve(el);
    });
  },{threshold:.08,rootMargin:'0px 0px -24px 0px'});
  document.querySelectorAll('.card,.pill').forEach(function(el){io.observe(el);});

  /* 3 · Nav opacity */
  var nav=document.getElementById('nav');
  window.addEventListener('scroll',function(){
    nav.style.background='rgba(252,252,252,'+Math.min(.97,.78+window.scrollY/300)+')';
  },{passive:true});

  /* 4 · Card tilt (skip .soon) */
  document.querySelectorAll('.card:not(.soon)').forEach(function(c){
    c.addEventListener('mousemove',function(e){
      var r=c.getBoundingClientRect(),dx=(e.clientX-r.left-r.width/2)/(r.width/2),dy=(e.clientY-r.top-r.height/2)/(r.height/2);
      c.style.transform='translateY(-5px) perspective(700px) rotateX('+(dy*-4)+'deg) rotateY('+(dx*4)+'deg)';
    });
    c.addEventListener('mouseleave',function(){c.style.transform='';});
  });

  /* 5 · Block right-click */
  document.addEventListener('contextmenu',function(e){e.preventDefault();});

}());
