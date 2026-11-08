/* Opt-in local diagnostics. RAF delivery is not hardware FPS; these are not field CWV. */
(() => {
  const owners=[], tasks=[], support={}, pending=new Set();
  let out, finished=false, started=false, abortReason=null, boundary=null, marker='not-observed', frame=null, last=null, ms=0, frames=0, samples=[], lcp=null;
  let cls=0, session=0, shiftStart=0, shiftLast=0, shiftCount=0;
  const round=n=>Number.isFinite(n)?+n.toFixed(2):null;
  const observe=(type,consume)=>{
    support[type]='unsupported';
    try {
      if(!PerformanceObserver.supportedEntryTypes?.includes(type))return;
      const owner=new PerformanceObserver(list=>{if(!finished)consume(list.getEntries());});
      owner.observe({type,buffered:true}); owners.push({owner,consume}); support[type]='observing';
    }catch(_){support[type]='unavailable';}
  };
  observe('longtask',entries=>{for(const e of entries)if(tasks.length<2000)tasks.push({start:e.startTime,duration:e.duration});});
  observe('largest-contentful-paint',entries=>{for(const e of entries)lcp={timeMs:round(e.startTime),size:e.size,tag:e.element?.tagName||null,id:e.element?.id||null};});
  observe('layout-shift',entries=>{for(const e of entries){if(e.hadRecentInput)continue;if(!shiftCount||e.startTime-shiftLast>1000||e.startTime-shiftStart>5000){session=0;shiftStart=e.startTime;}session+=e.value;cls=Math.max(cls,session);shiftLast=e.startTime;shiftCount++;}});
  function mark(){if(boundary===null){boundary=performance.now();marker='portfolio:ready';}}
  document.addEventListener('portfolio:ready',mark,{once:true});
  const next=fn=>{const id=requestAnimationFrame(now=>{pending.delete(id);fn(now);});pending.add(id);};
  function cleanup(){
    for(const {owner,consume}of owners){if(!finished)consume(owner.takeRecords());owner.disconnect();}
    finished=true;if(frame!==null)cancelAnimationFrame(frame);frame=null;pending.forEach(cancelAnimationFrame);pending.clear();
    document.removeEventListener('visibilitychange',visibility);window.removeEventListener('pagehide',pagehide);
    document.removeEventListener('portfolio:ready',mark);document.removeEventListener('portfolio:ready',afterLoader);document.removeEventListener('DOMContentLoaded',ready);
  }
  function loading(){
    const nav=performance.getEntriesByType('navigation')[0], resources=performance.getEntriesByType('resource'),groups=new Map();
    const navigation=nav?Object.fromEntries(['startTime','responseStart','responseEnd','domInteractive','domContentLoadedEventEnd','loadEventEnd','transferSize','encodedBodySize','decodedBodySize'].map(k=>[k,nav[k]>0||k==='startTime'?round(nav[k]):null])):null;
    for(const r of resources){let origin='unknown';try{origin=new URL(r.name,location.href).origin===location.origin?'same-origin':'cross-origin';}catch(_){}const key=origin+'/'+(r.initiatorType||'other'),g=groups.get(key)||{group:key,count:0,reportedTransferBytes:0,encodedBodyBytes:0,zeroTransferEntries:0};g.count++;g.reportedTransferBytes+=r.transferSize||0;g.encodedBodyBytes+=r.encodedBodySize||0;if(!r.transferSize)g.zeroTransferEntries++;groups.set(key,g);}
    const before=tasks.filter(t=>boundary!==null&&t.start<boundary),after=tasks.filter(t=>boundary!==null&&t.start>=boundary),sum=list=>({count:list.length,durationMs:round(list.reduce((n,t)=>n+t.duration,0))});
    return {navigation,resources:{count:resources.length,groups:[...groups.values()],note:'Reported Resource Timing bytes only. Zero transfer can mean cache, cross-origin restrictions, or unfinished requests; not total downloaded bytes.'},loader:{readyAtMs:round(boundary),marker},startupLongTasks:{status:support.longtask,...sum(before)},postLoaderLongTasks:{status:support.longtask,...sum(after)},longTaskBufferCapped:tasks.length===2000,lcp:{status:support['largest-contentful-paint'],candidate:lcp,note:'Latest lab candidate at sample cutoff; not field LCP.'},cls:{status:support['layout-shift'],value:round(cls),eligibleEntries:shiftCount,note:'Maximum session window, 1s gap / 5s duration; recent-input shifts excluded. Observation ends with this sample.'}};
  }
  function emitAbort(){if(out){out.textContent=JSON.stringify({status:'aborted',reason:abortReason,frames,windowMs:Math.round(ms),loading:loading()},null,2);out.dataset.complete='true';}}
  function abort(reason){if(finished)return;abortReason=reason;cleanup();emitAbort();}
  function visibility(){if(document.hidden)abort('Tab became hidden; reload for an uninterrupted visible sample.');}
  function pagehide(){abort('Page left before sample completion.');}
  document.addEventListener('visibilitychange',visibility);window.addEventListener('pagehide',pagehide);
  function summarize(){
    cleanup();const sorted=samples.slice().sort((a,b)=>a-b),canvases=[...document.querySelectorAll('canvas')],after=tasks.filter(t=>boundary!==null&&t.start>=boundary);
    out.textContent=JSON.stringify({status:'complete',measurement:'5 uninterrupted visible seconds after loader dismissal; RAF delivery, not hardware FPS. No INP or field CWV measured.',renderCounts:window.portfolioRenderMetrics||null,playingVideos:[...document.querySelectorAll('video')].filter(v=>!v.paused).length,windowMs:Math.round(ms),viewport:[innerWidth,innerHeight],dpr:devicePixelRatio,frames,medianMs:round(sorted[Math.floor(sorted.length*.5)]||0),p95Ms:round(sorted[Math.floor(sorted.length*.95)]||0),framesOver33ms:samples.filter(t=>t>33.5).length,longTasks:after.length,longTaskMs:Math.round(after.reduce((n,t)=>n+t.duration,0)),loading:loading(),canvasCount:canvases.length,canvasBufferPixels:canvases.reduce((n,c)=>n+c.width*c.height,0),canvases:canvases.filter(c=>c.id||c.dataset.expertiseScene).map(c=>({name:c.id||c.dataset.expertiseScene,size:[c.width,c.height]})),renderPolicy:window.portfolioRenderPolicy||null},null,2);out.dataset.complete='true';
  }
  function sample(now){frame=null;if(finished)return;if(document.hidden){visibility();return;}if(last!==null){samples.push(now-last);ms+=now-last;frames++;}last=now;if(ms>=5000)summarize();else frame=requestAnimationFrame(sample);}
  function afterLoader(){next(()=>next(ready));}
  function ready(){
    if(!document.body||out||started)return;if(!finished&&document.hidden)visibility();
    if(!finished&&document.body.classList.contains('loader-active')){document.addEventListener('portfolio:ready',afterLoader,{once:true});return;}
    out=document.createElement('pre');out.id='perf-probe';out.setAttribute('aria-label','Local performance diagnostics');
    Object.assign(out.style,{position:'fixed',bottom:'80px',left:'8px',zIndex:'99999',font:'11px/1.4 monospace',background:'#fff',color:'#111',padding:'10px',maxWidth:'340px',maxHeight:'45vh',overflow:'auto',pointerEvents:'none',direction:'ltr',whiteSpace:'pre-wrap'});document.body.appendChild(out);
    if(finished){emitAbort();return;}if(boundary===null){boundary=performance.now();marker='loader-already-dismissed; probe-start boundary';}
    started=true;out.textContent='Sampling frame delivery for 5 uninterrupted visible seconds…';frame=requestAnimationFrame(sample);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ready,{once:true});else ready();
})();
