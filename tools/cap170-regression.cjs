const fs=require('fs'),assert=require('assert/strict'),vm=require('vm');
const {environment}=require('./fixtures/surfaces.cjs');
const end=(n,name='capability-card-enter',elapsedTime=.26)=>n.listeners.get('animationend')?.({target:n,animationName:name,elapsedTime});
{
 const e=environment({capability:true}),panel={},layout={dataset:{capabilityPhase:'exiting'}};
 e.nodes.forEach(n=>{n.active=false;n.closest=q=>q==='[data-capability-panel]'?panel:q==='.cap-layout'?layout:null});e.frame();e.frame();const o=e.observers[0];
 o.deliver(e.nodes.map(target=>({target,isIntersecting:true})));assert(e.nodes.every(n=>n.dataset.surfaceReveal==='pending'),'Hidden panel never consumes child one-shot');
 e.nodes.forEach(n=>n.active=true);o.deliver(e.nodes.map(target=>({target,isIntersecting:true})));assert(e.nodes.every(n=>n.dataset.surfaceReveal==='pending'),'Outgoing phase cannot begin incoming child stagger');
 layout.dataset.capabilityPhase='entering';e.docEvents.get('portfolio:capabilitychange')();o.deliver([...e.nodes].reverse().map(target=>({target,isIntersecting:true})));
 assert.deepEqual(e.nodes.map(n=>n.styles.get('--surface-delay')),Array.from({length:20},(_,i)=>i*35+'ms'));assert.equal(19*35+260,925);
 end(e.nodes[0],'wrong',.26);assert.equal(e.nodes[0].dataset.surfaceReveal,'entering');end(e.nodes[0]);assert.equal(e.nodes[0].dataset.surfaceReveal,'settled');
 e.nodes.slice(1).forEach(n=>n.active=false);e.docEvents.get('portfolio:capabilitychange')();assert(e.nodes.slice(1).every(n=>n.dataset.surfaceReveal==='pending'));
 e.nodes.forEach(n=>n.active=true);e.docEvents.get('portfolio:capabilitychange')();o.deliver(e.nodes.map(target=>({target,isIntersecting:true})));assert.equal(e.nodes[1].styles.get('--surface-delay'),'0ms','Interrupted incoming stage starts a fresh bounded queue');
 o.deliver([{target:e.nodes[1],isIntersecting:false}]);assert.equal(e.nodes[1].dataset.surfaceReveal,'pending','Offscreen unfinished card rearms');o.deliver([{target:e.nodes[1],isIntersecting:true}]);
 e.nodes[1].listeners.get('focusin')();assert.equal(e.nodes[1].dataset.surfaceReveal,'settled','Keyboard exposes card immediately');
 e.context.window.innerWidth=390;e.docEvents.get('window:resize')();assert(e.nodes.every(n=>n.dataset.surfaceReveal==='settled'),'Resize cancels running work and phone remains static');assert.equal(e.timers.size,0);e.manager.destroy();assert.equal(e.docEvents.size,0);assert.equal(e.timers.size,0);assert(e.observers.every(o=>o.targets.size===0));
}
for(const cfg of [{capability:true,width:390},{capability:true,reduce:true},{capability:true,observerAvailable:false}]){const e=environment(cfg);assert(e.nodes.every(n=>n.dataset.surfaceReveal==='settled'));e.manager.destroy();assert.equal(e.frames.size,0);}
{
 const e=environment({mindset:true,width:390});e.frame();e.frame();e.observers[0].deliver(e.nodes.map(target=>({target,isIntersecting:true})));assert.deepEqual(e.nodes.map(n=>n.styles.get('--surface-delay')),['0ms','120ms','240ms','360ms']);e.nodes.forEach(n=>end(n,'mindset-card-enter',.6));assert(e.nodes.every(n=>n.dataset.surfaceReveal==='settled'));e.manager.destroy();
}
{
 const e=environment({capability:true}),events=e.docEvents,doc=e.document,animations=[];
 class N{constructor(dataset={}){this.dataset=dataset;this.attrs={};this.handlers=new Map();this.children=[];this.id='';}setAttribute(k,v){this.attrs[k]=v}getAttribute(k){return this.attrs[k]}removeAttribute(k){delete this.attrs[k]}contains(n){return n===this||this.children.includes(n)}addEventListener(k,f){this.handlers.set(k,f)}removeEventListener(k){this.handlers.delete(k)}focus(){doc.activeElement=this;this.handlers.get('focus')?.()}animate(frames,options){const a={frames,options,cancel(){}};animations.push(a);return a}}
 const ids=['mindset','skills','tools'],tabs=ids.map(id=>new N({capabilityTab:id})),panels=ids.map(id=>new N({capabilityPanel:id})),list=new N(),layout=new N(),section=new N();panels.forEach((p,i)=>p.id=['strengths','cap-panel-skills','cap-panel-tools'][i]);list.querySelectorAll=()=>tabs;layout.querySelector=()=>list;layout.querySelectorAll=()=>panels;section.querySelector=()=>layout;
 e.nodes.forEach(n=>{panels[2].children.push(n);n.closest=q=>q==='[data-capability-panel]'?panels[2]:q==='.cap-layout'?layout:null});
 doc.documentElement={dir:'ltr'};doc.getElementById=()=>section;doc.dispatchEvent=ev=>events.get(ev.type)?.(ev);e.context.Event=class{constructor(type){this.type=type}};e.context.listenMediaChange=()=>()=>{};e.context.initCapabilitiesScroll=()=>null;e.context.getComputedStyle=()=>({opacity:'1',transform:'none'});e.context.isPortfolioElementActive=n=>n.closest?.('[data-capability-panel]')?.getAttribute('aria-hidden')!=='true';e.context.window.location={hash:''};
 const source=fs.readFileSync('index.html','utf8'),a=source.indexOf('    function initCapabilitiesPanels()'),b=source.indexOf('    // Native reading intervals:',a);vm.runInContext(source.slice(a,b),e.context);const ctl=e.context.initCapabilitiesPanels();e.frame();e.frame();const layoutObserver=e.observers[0],revealObserver=e.observers[1];layoutObserver.deliver([{target:layout,isIntersecting:true}]);
 tabs[2].handlers.get('click')({preventDefault(){}});assert.equal(layout.dataset.capabilityPhase,'exiting');revealObserver.deliver(e.nodes.map(target=>({target,isIntersecting:true})));assert(e.nodes.every(n=>n.dataset.surfaceReveal==='pending'));
 animations[0].onfinish();assert.equal(layout.dataset.capabilityPhase,'entering');assert(e.nodes.every(n=>revealObserver.targets.has(n)),'Actual incoming controller event reobserves original children');revealObserver.deliver(e.nodes.map(target=>({target,isIntersecting:true})));assert.deepEqual(e.nodes.map(n=>n.styles.get('--surface-delay')),Array.from({length:20},(_,i)=>i*35+'ms'));
 animations[1].onfinish();e.nodes.forEach(n=>end(n));assert(e.nodes.every(n=>n.dataset.surfaceReveal==='settled'));ctl.destroy();e.manager.destroy();assert.equal(e.timers.size,0);
}
{
 const e=environment({mindset:true,mixed:true});e.frame();e.frame();e.observers[0].deliver(e.nodes.map(target=>({target,isIntersecting:true})));assert.deepEqual(e.nodes.slice(0,4).map(n=>n.styles.get('--surface-delay')),['0ms','35ms','70ms','105ms']);assert.deepEqual(e.nodes.slice(4).map(n=>n.styles.get('--surface-delay')),['140ms','140ms'],'Unrelated generic roots retain prior legacy queue arithmetic');e.manager.destroy();assert(e.nodes.every(n=>n.dataset.capabilityReveal===undefined));
}
console.log('CAP170 actual surface/panel owners: stage handoff,20 sequential starts,hidden/offscreen/rearm,phone/reduced/focus/resize/disposal PASS');
