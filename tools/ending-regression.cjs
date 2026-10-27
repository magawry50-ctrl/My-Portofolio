const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const source=fs.readFileSync('index.html','utf8'),code=source.slice(source.indexOf('    function initBusinessCardOverlay()'),source.indexOf('    function initSurfaceReveals()'));
assert(!/<a class="journey-next"/.test(source),'CARDS131 removes the actual Next footer rather than hiding it');
const dictionary=vm.runInNewContext(source.slice(source.indexOf('const I18N ='),source.indexOf('// --- Language Switching Logic'))+'\nI18N');
function fixture({io=true,reduced=false,width=1288,lang='en'}={}){
 const events=new Map(),animations=[],frames=new Map(),observers=[],micro=[];let frameId=0,near=false,exactTop=null,dialog=null,focused=null,measurements=0,resets=0;
 class N{
  constructor(){this.dataset={};this.attrs={};this.children=[];this.handlers=new Map();this.hidden=false;this.inert=false;this.isConnected=true;}
  appendChild(n){if(n.parentElement)n.parentElement.children=n.parentElement.children.filter(x=>x!==n);this.children.push(n);n.parentElement=this;}
  contains(n){return this===n||this.children.some(c=>c.contains(n));}
  querySelector(){return null;}setAttribute(k,v){this.attrs[k]=v;}getAttribute(k){return this.attrs[k];}hasAttribute(k){return Object.hasOwn(this.attrs,k);}removeAttribute(k){delete this.attrs[k];}
  addEventListener(k,f){if(!this.handlers.has(k))this.handlers.set(k,new Set());this.handlers.get(k).add(f);}removeEventListener(k,f){this.handlers.get(k)?.delete(f);}emit(k,e={}){[...(this.handlers.get(k)||[])].forEach(f=>f(e));}dispatchEvent(event){this.emit(event.type,event);}
  focus(){focused=this;}blur(){focused=null;}closest(){for(let n=this;n;n=n.parentElement)if(n.hidden||n.inert)return n;return null;}getClientRects(){return this.closest()?[]:[{}];}
  getBoundingClientRect(){measurements++;const cardWidth=Math.min(this===journey?450:600,width-32);return{left:width-cardWidth-16,width:cardWidth};}
  animate(keys,options){const a={node:this,keys,options,cancelled:false,cancel(){this.cancelled=true;}};animations.push(a);return a;}
 }
 const body=new N(),viewport=new N(),stack=new N(),card=new N(),journey=new N(),action=new N(),nav=new N(),burger=new N(),viewRoot=new N(),dialogButton=new N();
 body.classList={contains:()=>false};body.appendChild(viewport);viewport.appendChild(stack);stack.appendChild(card);stack.appendChild(journey);card.appendChild(action);
 const fields=Object.fromEntries(['#journey-card-title','.journey-intro','.journey-primary'].map(k=>[k,new N()]));Object.values(fields).forEach(n=>journey.appendChild(n));journey.querySelector=q=>fields[q];for(const key of ['.journey-primary']){const field=fields[key],copy=new N(),arrow=new N();field.appendChild(copy);field.appendChild(arrow);field.copy=copy;field.arrow=arrow;field.querySelector=q=>q==='[data-journey-copy]'?copy:null;}
 nav.getClientRects=()=>window.innerWidth<768?[]:[{}];burger.getClientRects=()=>window.innerWidth<768?[{}]:[];
 const end={getBoundingClientRect:()=>({top:exactTop??(near?899:1700),bottom:(exactTop??(near?899:1700))+1})};
 const document=new N();Object.assign(document,{hidden:false,body,documentElement:{dataset:{portfolioView:'about'}},getElementById:id=>({'business-card':card,'journey-card':journey,'portfolio-end':end}[id]),querySelector:q=>q.includes('modal-open')?dialog:q==='.notch-trigger.is-active'?nav:q==='.glass-menu-toggle'?burger:q.includes('data-group-view')?viewRoot:null});Object.defineProperty(document,'activeElement',{get:()=>focused});
 const motion=new N();motion.matches=reduced;const window=new N();Object.assign(window,{innerWidth:width,innerHeight:900,matchMedia:()=>motion});if(io)window.IntersectionObserver=true;
 class IO{constructor(cb,options){this.cb=cb;this.options=options;observers.push(this);}observe(n){assert.equal(n,end);}disconnect(){this.dead=true;}}
 class MO{constructor(cb){this.cb=cb;observers.push(this);}observe(){}disconnect(){this.dead=true;}}
 const context=vm.createContext({document,window,Event,I18N:dictionary,currentLang:lang,initBusinessCardActions:()=>({reset(){resets++;},destroy(){resets++;}}),IntersectionObserver:IO,MutationObserver:MO,queueMicrotask:f=>micro.push(f),requestAnimationFrame:f=>{frames.set(++frameId,f);return frameId;},cancelAnimationFrame:id=>frames.delete(id)});
 vm.runInContext(code+'\nthis.manager=initBusinessCardOverlay();',context);
 const trigger=new N();trigger.closest=q=>q==='a[href="#business-card"]'?trigger:null;
 const click=target=>{let prevented=false;document.emit('click',{target,preventDefault(){prevented=true;}});return prevented;};
 const close=()=>viewport.emit('click',{target:{closest:q=>q==='[data-journey-dismiss]'?{}:null},preventDefault(){}});
 return{context,card,journey,stack,viewport,fields,action,nav,burger,viewRoot,dialogButton,document,window,motion,animations,frames,observers,trigger,close,click,manager:context.manager,get measurements(){return measurements;},get resets(){return resets;},set near(v){near=v;},set endTop(v){exactTop=v;},set focus(v){focused=v;},get focus(){return focused;},set modal(v){dialog=v?{querySelector:()=>dialogButton}:null;},flush(){const batch=[...frames.values()];frames.clear();batch.forEach(f=>f());while(micro.length)micro.shift()();}};
}
for(const lang of ['en','ar']){
 const e=fixture({lang});assert(e.card.hidden&&e.journey.hidden&&e.stack.hidden);
 e.near=true;e.manager.sync();assert(e.card.hidden&&!e.journey.hidden);assert.equal(e.fields['.journey-primary'].getAttribute('href'),'#impact');assert.equal(e.fields['#journey-card-title'].textContent,dictionary[lang].journey_about_title);
 assert.equal(e.fields['.journey-primary'].copy.textContent,dictionary[lang].journey_about_primary);assert.equal(e.fields['.journey-primary'].children[1],e.fields['.journey-primary'].arrow,'Decorative arrow remains separate from translated text');
 const first=e.animations.at(-1);assert.equal(first.options.duration,900);assert.equal(first.options.easing,'cubic-bezier(.22,.61,.36,1)');assert.equal(first.keys[0].opacity,0);assert.equal(e.journey.getBoundingClientRect().left+parseFloat(first.keys[0].translate),e.window.innerWidth+16);first.onfinish();assert.equal(e.journey.dataset.businessPhase,'shown');
 e.close();assert(e.card.hidden&&e.journey.hidden);assert.equal(e.viewport.dataset.journeySuppressed,'true');e.near=false;e.manager.sync();e.near=true;e.manager.sync();assert(e.journey.hidden,'X suppresses automatic reappearance for the entire current view visit');
 e.near=false;assert(e.click(e.trigger));assert(!e.card.hidden,'Explicit contact opens in the current view away from end');assert.equal(e.document.documentElement.dataset.portfolioView,'about');assert(e.journey.hidden);e.animations.at(-1).onfinish();assert.equal(e.focus,e.card);
 e.document.documentElement.dataset.portfolioView='work';e.manager.sync();assert(e.card.hidden);assert.equal(e.viewport.dataset.journeySuppressed,'false');assert.equal(e.focus,e.nav);e.near=true;e.manager.sync();assert(!e.journey.hidden&&e.card.hidden);assert.equal(e.fields['.journey-primary'].getAttribute('href'),'#collaborate');assert.equal(e.fields['#journey-card-title'].textContent,dictionary[lang].journey_work_title);assert.equal(e.fields['.journey-primary'].copy.textContent,dictionary[lang].journey_work_primary);
 e.click(e.trigger);assert(!e.card.hidden&&e.journey.hidden&&e.journey.inert,'Explicit contact replaces the journey in its one shared slot');const stale=e.animations.at(-1).onfinish;e.document.documentElement.dataset.portfolioView='collaborate';e.manager.sync();assert(e.journey.hidden&&!e.card.hidden);stale();assert.equal(e.card.dataset.businessView,'collaborate');
 e.focus=e.action;e.modal=true;e.manager.sync();assert.equal(e.focus,e.dialogButton);assert(e.card.hidden&&e.journey.hidden);e.focus=e.dialogButton;e.manager.sync();assert.equal(e.focus,e.dialogButton);e.modal=false;e.manager.sync();assert(!e.card.hidden);
 e.document.hidden=true;e.document.emit('visibilitychange');assert(e.card.hidden&&e.journey.hidden);e.document.hidden=false;e.document.emit('visibilitychange');assert(!e.card.hidden);
 e.motion.matches=true;e.motion.emit('change');assert.equal(e.card.dataset.businessPhase,'shown');e.near=false;e.focus=null;e.manager.sync();assert(e.card.hidden);e.near=true;e.manager.sync();e.close();assert(e.card.hidden);e.click(e.trigger);assert.equal(e.card.dataset.businessPhase,'shown','Explicit reopen also works with reduced motion');
 e.manager.destroy();assert(e.card.hidden&&e.journey.hidden&&e.stack.hidden);assert(e.observers.every(o=>o.dead));assert.equal(e.frames.size,0);const before=e.animations.length;e.click(e.trigger);assert.equal(e.animations.length,before);
}
for(const lang of ['en','ar'])for(const width of [320,1288])for(const reduced of [true,false]){
 const e=fixture({lang,width,reduced});e.window.scrollY=1234;e.near=true;e.manager.sync();e.journey.appendChild(e.trigger);e.focus=e.trigger;
 const oldJourney=e.animations.find(a=>a.node===e.journey),stale=oldJourney?.onfinish;assert(e.click(e.trigger));
 const exclusive=()=>assert([e.card,e.journey].filter(n=>!n.hidden).length<=1,'Never expose simultaneous journey/contact cards');
 exclusive();assert(e.journey.hidden&&e.journey.inert&&!e.card.hidden&&!e.card.inert);assert(!e.journey.contains(e.focus),'Focused initiator leaves the force-hidden journey');
 assert.equal(e.window.scrollY,1234);assert.equal(e.document.documentElement.dataset.portfolioView,'about');stale?.();exclusive();
 for(const near of [false,true,false,true]){e.near=near;e.manager.sync();exclusive();assert(e.journey.hidden&&!e.card.hidden,'Scroll direction cannot restore a replaced journey');}
 if(!reduced)e.animations.at(-1).onfinish();assert.equal(e.focus,e.card);e.close();exclusive();assert(e.card.hidden&&e.journey.hidden);e.near=false;e.manager.sync();e.near=true;e.manager.sync();assert(e.journey.hidden,'Dismissal still suppresses this visit');
 e.click(e.trigger);exclusive();assert(!e.card.hidden&&e.journey.hidden);e.document.documentElement.dataset.portfolioView='work';e.manager.sync();exclusive();assert(e.card.hidden&&!e.journey.hidden,'A new view resets explicit replacement and selects its correct ending');e.manager.destroy();exclusive();
}
{
 const e=fixture({width:320});e.click(e.trigger);e.focus=e.action;e.document.documentElement.dataset.portfolioView='work';e.manager.sync();assert.equal(e.focus,e.burger,'Forced hide uses the visible phone burger, never hidden primary controls');e.click(e.trigger);e.focus=e.action;e.burger.focus=()=>{};e.trigger.isConnected=false;e.document.hidden=true;e.manager.sync();assert.equal(e.focus,e.viewRoot,'A failed burger focus hands off to the active view');e.manager.destroy();
}
for(const io of [true,false])for(const reduced of [true,false]){
 const e=fixture({io,reduced});if(io)assert.equal(e.observers[0].options.rootMargin,'0px 0px 1px 0px');
 e.endTop=900.203;e.manager.sync();assert(!e.journey.hidden);e.endTop=901.01;e.manager.sync();assert(e.journey.hidden);e.endTop=-1.01;e.manager.sync();assert(e.journey.hidden);
 if(!io){e.endTop=900;e.window.emit('scroll');e.window.emit('scroll');assert.equal(e.frames.size,1);e.flush();assert(!e.journey.hidden);}
 if(reduced)assert.equal(e.measurements,0,'Reduced motion bypasses entrance geometry');e.manager.destroy();
}
{
 const e=fixture();let phases=0,returns=0;e.document.addEventListener('portfolio:endingchange',()=>phases++);e.document.addEventListener('portfolio:endingfocusreturn',()=>returns++);
 e.near=true;e.manager.sync();assert.equal(phases,1);e.manager.sync();assert.equal(phases,1,'Stable sync does not produce duplicate end-state work');e.animations.at(-1).onfinish();assert.equal(phases,2,'Shown phase is delivered by actual animation completion');e.focus=e.fields['#journey-card-title'];e.close();assert(returns>0,'Focus destination is made reachable before forced closing');assert(e.journey.hidden);e.manager.destroy();
}
// CARD175: native cross-view routing must not expose a CTA at intermediate old-scroll geometry.
for(const lang of ['en','ar'])for(const reduced of [false,true]){
 const e=fixture({width:375,lang,reduced});e.document.documentElement.style={};e.window.scrollY=9824.5;
 e.near=true;e.manager.sync();const stale=e.animations.at(-1)?.onfinish;e.near=false;e.manager.sync();assert(e.journey.hidden,'Existing scroll-up behavior remains hidden');
 e.document.emit('portfolio:viewnavigationstart');e.document.documentElement.dataset.portfolioView='work';e.near=true;e.document.emit('portfolio:viewchange');assert(e.journey.hidden&&e.card.hidden,'Intermediate new-view end stays blocked');
 e.near=false;e.window.scrollY=32;e.document.emit('portfolio:viewnavigationsettled');stale?.();assert(e.journey.hidden&&e.card.hidden,'No new IO callback is necessary after native destination write');
 e.near=true;e.manager.sync();assert(!e.journey.hidden&&e.card.hidden,'The real new-view end remains eligible');e.close();e.near=false;e.manager.sync();e.near=true;e.manager.sync();assert(e.journey.hidden,'Normal visit suppression is retained');
 e.near=false;e.click(e.trigger);assert(!e.card.hidden&&e.journey.hidden,'Explicit Get in Touch remains immediate');e.manager.destroy();assert.equal(e.frames.size,0);
}
// Execute the actual route writer with the actual ending owner, including finally cleanup.
{
 const e=fixture({width:375}),ctx=e.context,trace=[];e.document.documentElement.style={};ctx.disposed=false;ctx.activeGroup='about';ctx.motion=e.motion;ctx.sectionStackManager=ctx.capabilitiesPanelsManager=ctx.pillarsGalleryManager=null;
 const entry=id=>({id,group:id==='collaborate'?'collaborate':'work',element:e.viewRoot});ctx.entryById=entry;ctx.closeMenu=ctx.readMetrics=ctx.setCurrent=()=>{};ctx.listen=(n,k,fn,o)=>n.addEventListener(k,fn,o);ctx.metrics=[{id:'impact',top:32,clearance:0},{id:'collaborate',top:32,clearance:0}];ctx.location={hash:''};ctx.history={pushState(_a,_b,hash){ctx.location.hash=hash}};
 ctx.activateGroup=group=>{const changed=ctx.activeGroup!==group;ctx.activeGroup=group;e.document.documentElement.dataset.portfolioView=group;e.near=true;trace.push('viewchange');e.document.emit('portfolio:viewchange');return changed};
 e.document.addEventListener('portfolio:viewnavigationstart',()=>trace.push('begin'));e.document.addEventListener('portfolio:viewnavigationsettled',()=>trace.push('settled'));
 e.window.scrollTo=options=>{assert(e.card.hidden&&e.journey.hidden,'Cards are reset throughout actual cross-view scroll write');e.window.scrollY=options.top;e.near=false;trace.push('scroll')};
 const start=source.indexOf('        function goToSection(id,'),end=source.indexOf('        const hoverMedia',start);vm.runInContext(source.slice(start,end)+'\nthis.route175=goToSection;',ctx);
 ctx.route175('impact');assert.deepEqual(trace,['begin','viewchange','scroll','settled']);assert(e.journey.hidden&&e.card.hidden);assert.equal(e.window.scrollY,32);
 e.near=true;e.manager.sync();assert(!e.journey.hidden,'Actual routed new view still reveals at its end');e.near=false;e.manager.sync();e.click(e.trigger);trace.length=0;e.window.scrollTo=()=>trace.push('scroll');ctx.route175('impact');assert(!trace.includes('begin')&&!trace.includes('settled'),'Same-view anchor route is not bracketed');assert(!e.card.hidden,'Same-view explicit contact is retained');
 e.window.scrollTo=()=>{throw Error('synthetic scroll failure')};assert.throws(()=>ctx.route175('collaborate'),/synthetic scroll failure/);assert.equal(trace.at(-1),'settled','Finally always releases the route guard');e.near=false;e.manager.sync();e.near=true;e.manager.sync();assert(!e.card.hidden,'No stuck automatic lock after exceptional route cleanup');e.manager.destroy();
}
console.log('PASS actual shared ending and route owners: exclusive contact,900ms entrance,visit suppression,focus/modal/reduced/disposal and cross-view transaction cleanup.');
