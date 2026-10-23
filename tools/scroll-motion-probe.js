/* Explicit local six-second synthetic scroll. Opt-in only; RAF delivery is not hardware FPS. */
(() => {
 const boot=()=>{
  if(document.body.classList.contains('loader-active')){document.addEventListener('portfolio:ready',boot,{once:true});return;}
  const panel=document.createElement('aside');panel.id='scroll-motion-probe';panel.setAttribute('aria-label','Local synthetic scroll diagnostic');
  Object.assign(panel.style,{position:'fixed',left:'8px',bottom:'82px',zIndex:'99999',background:'#fff',color:'#111',border:'1px solid #999',padding:'8px',font:'11px/1.35 monospace',direction:'ltr',maxWidth:'220px',maxHeight:'180px',overflow:'auto'});
  const button=document.createElement('button');button.textContent='Run 6s scroll diagnostic';Object.assign(button.style,{minHeight:'44px',padding:'6px',background:'#111',color:'#fff',border:'0',borderRadius:'6px',font:'inherit'});
  const out=document.createElement('pre');out.style.whiteSpace='pre-wrap';out.style.margin='6px 0 0';out.textContent='Fresh reload per run. Synthetic RAF delivery, not physical-device FPS.';panel.append(button,out);document.body.appendChild(panel);
  let frame=0,deadline=0,running=false,taskObserver=null,last=null,start=null,oldBehavior='',gaps=[],tasks=[],samples=[],sampleCost=0,nextSample=0;
  const keyframes=new WeakMap();
  const snapshot=()=>{
   const began=performance.now();const metrics={activeAnimations:0,wordAnimations:0,narrativeAnimations:0,animatedFilter:0,animatedTextShadow:0,underEnteringSurface:0};
   for(const animation of document.getAnimations()){
    if(animation.playState!=='running'||animation.currentTime===null)continue;
    const effect=animation.effect,target=effect?.target;if(!(target instanceof Element)||panel.contains(target)||target.closest('[data-group-view]')?.hidden)continue;
    const timing=effect.getComputedTiming(),delay=effect.getTiming().delay||0;if(animation.currentTime<delay||animation.currentTime>=timing.endTime)continue;
    const rect=target.getBoundingClientRect();if(rect.width<=0||rect.height<=0||rect.bottom<=0||rect.top>=innerHeight)continue;
    metrics.activeAnimations++;if(target.classList.contains('reveal-word'))metrics.wordAnimations++;
    if(target.matches('.glowing-text-char,.glowing-text-word-glow'))metrics.narrativeAnimations++;
    if(target.closest('.surface-reveal-entering')!==null)metrics.underEnteringSurface++;
    let keys=keyframes.get(effect);if(!keys){const frames=effect.getKeyframes();keys={};for(const property of ['filter','textShadow'])keys[property]=new Set(frames.map(item=>item[property]).filter(value=>value!==undefined)).size>1;keyframes.set(effect,keys);}
    if(keys.filter)metrics.animatedFilter++;if(keys.textShadow)metrics.animatedTextShadow++;
   }
   samples.push({atMs:Math.round((last||began)-(start||began)),...metrics});sampleCost+=performance.now()-began;
  };
  const publish=(status,reason)=>{
   if(!running)return;running=false;cancelAnimationFrame(frame);clearTimeout(deadline);taskObserver?.disconnect();document.documentElement.style.scrollBehavior=oldBehavior;
   document.removeEventListener('visibilitychange',visibility);document.removeEventListener('portfolio:viewchange',viewChange);window.removeEventListener('pagehide',pagehide);
   const sorted=gaps.slice().sort((a,b)=>a-b),quantile=q=>+(sorted[Math.min(sorted.length-1,Math.floor(sorted.length*q))]||0).toFixed(2);
   const result={status,reason:reason||null,measurement:'6s deterministic linear synthetic scroll; RAF delivery under instrumented browser, not hardware FPS',viewport:[innerWidth,innerHeight],dpr:devicePixelRatio,lang:document.documentElement.lang,theme:document.documentElement.classList.contains('dark')?'dark':'light',group:document.documentElement.dataset.portfolioView,reducedMotion:matchMedia('(prefers-reduced-motion: reduce)').matches,windowMs:Math.round((last||0)-(start||0)),scrollTarget:button.dataset.target,frames:gaps.length,medianMs:quantile(.5),p95Ms:quantile(.95),maxGapMs:quantile(1),gapsOver25ms:gaps.filter(n=>n>25).length,gapsOver50ms:gaps.filter(n=>n>50).length,longTasks:tasks.length,longTaskMs:Math.round(tasks.reduce((n,t)=>n+t,0)),instrumentationMs:+sampleCost.toFixed(2),narrativeNodes:document.querySelectorAll('.glowing-text-char,.glowing-text-word-glow').length,revealWordNodes:document.querySelectorAll('.reveal-word').length,samples};
   window.scrollMotionResult=result;out.textContent=JSON.stringify(result,null,2);panel.dataset.complete='true';button.textContent='Finished — reload for comparison';
  };
  const visibility=()=>{if(document.hidden)publish('aborted','Tab hidden');},viewChange=()=>publish('aborted','Active view changed'),pagehide=()=>publish('aborted','Page left');
  button.addEventListener('click',()=>{
   if(running||panel.dataset.complete)return;running=true;button.disabled=true;oldBehavior=document.documentElement.style.scrollBehavior;document.documentElement.style.scrollBehavior='auto';
   const target=Math.max(0,document.documentElement.scrollHeight-innerHeight);button.dataset.target=String(target);window.scrollTo({top:0,behavior:'instant'});out.textContent='Running bounded synthetic scroll…';
   try{taskObserver=new PerformanceObserver(list=>{if(running)tasks.push(...list.getEntries().map(entry=>entry.duration));});taskObserver.observe({type:'longtask',buffered:false});}catch(_){}
   document.addEventListener('visibilitychange',visibility);document.addEventListener('portfolio:viewchange',viewChange);window.addEventListener('pagehide',pagehide);
   deadline=setTimeout(()=>publish('aborted','10s watchdog; no completed6s claim'),10000);
   const step=now=>{if(!running)return;if(document.hidden){visibility();return;}if(start===null){start=now;nextSample=now;}if(last!==null)gaps.push(now-last);last=now;const elapsed=now-start;
    window.scrollTo({top:target*Math.min(1,elapsed/6000),behavior:'instant'});if(now>=nextSample){snapshot();nextSample=now+500;}if(elapsed>=6000)publish('complete');else frame=requestAnimationFrame(step);
   };frame=requestAnimationFrame(step);
  });
 };
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
