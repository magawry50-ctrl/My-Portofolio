/* CAP181 executes the shipped surface, panel, scroll policy and native interval owners together. */
const fs=require('fs'),assert=require('assert/strict'),vm=require('vm');
const {environment}=require('./fixtures/surfaces.cjs');
const source=fs.readFileSync('index.html','utf8');
const e=environment({capability:true,capabilityCounts:[4,9,20]}),doc=e.document,win=e.context.window;
const callbacks=new Map([...e.docEvents].map(([key,fn])=>[key,new Set([fn])]));
const add=(key,fn)=>{if(!callbacks.has(key))callbacks.set(key,new Set());callbacks.get(key).add(fn);};
const remove=(key,fn)=>{callbacks.get(key)?.delete(fn);if(!callbacks.get(key)?.size)callbacks.delete(key);};
const dispatch=(key,event={})=>[...(callbacks.get(key)||[])].forEach(fn=>fn(event));
doc.addEventListener=(key,fn)=>add(key,fn);doc.removeEventListener=(key,fn)=>remove(key,fn);doc.dispatchEvent=event=>dispatch(event.type,event);
win.addEventListener=(key,fn)=>add('window:'+key,fn);win.removeEventListener=(key,fn)=>remove('window:'+key,fn);
win.innerHeight=884;win.scrollY=0;win.location={hash:''};win.scrollTo=({top,behavior})=>{assert.equal(behavior,'auto');win.scrollY=top;dispatch('window:scroll');};
let available=true;const animations=[];
class N{
 constructor(dataset={}){this.dataset=dataset;this.attrs={};this.handlers=new Map();this.children=[];this.style={setProperty(k,v){this[k]=v}};this.classList={add(){},remove(){}};this.id='';this.parentNode=null;}
 setAttribute(k,v){this.attrs[k]=v}getAttribute(k){return this.attrs[k]}removeAttribute(k){delete this.attrs[k]}
 contains(n){return n===this||this.children.includes(n)}addEventListener(k,f){this.handlers.set(k,f)}removeEventListener(k){this.handlers.delete(k)}
 focus(){doc.activeElement=this;this.handlers.get('focus')?.()}
 appendChild(n){n.parentNode=this;this.children.push(n)}replaceWith(n){n.parentNode=parent;this.removed=true}
 getBoundingClientRect(){return{top:1000-win.scrollY,left:24,right:1240,width:1216,height:this.offsetHeight||0}}
 animate(frames,options){const a={frames,options,cancel(){this.cancelled=true}};animations.push(a);return a}
}
const ids=['mindset','skills','tools'],tabs=ids.map(id=>new N({capabilityTab:id})),panels=ids.map(id=>new N({capabilityPanel:id})),list=new N(),layout=new N(),section=new N(),frame=new N(),parent=new N();
parent.insertBefore=()=>{};frame.parentNode=parent;panels.forEach((p,i)=>{p.id=['strengths','cap-panel-skills','cap-panel-tools'][i];p.offsetHeight=[548,247,452][i];});
let offset=0;for(let g=0;g<3;g++){for(const n of e.nodes.slice(offset,offset+[4,9,20][g])){panels[g].children.push(n);n.closest=q=>q==='[data-capability-panel]'?panels[g]:q==='.cap-layout'?layout:null;n.contains=target=>n===target;}offset+=[4,9,20][g];}
list.querySelectorAll=()=>tabs;layout.querySelector=q=>q==='.cap-selector-list'?list:null;layout.querySelectorAll=()=>panels;section.querySelector=q=>q==='.cap-layout'?layout:null;
tabs.forEach(t=>t.querySelector=()=>({getBoundingClientRect:()=>({height:40})}));
doc.documentElement={dir:'ltr',style:{scrollBehavior:'smooth'}};doc.getElementById=id=>id==='skills'?section:null;doc.createElement=()=>new N();
e.context.Event=class{constructor(type){this.type=type}};e.context.listenMediaChange=()=>()=>{};
e.context.getComputedStyle=n=>({rowGap:'48px',opacity:'1',transform:'none',getPropertyValue:()=> '24px'});
e.context.isPortfolioElementActive=n=>available&&(!n.closest?.('[data-capability-panel]')||n.closest('[data-capability-panel]').getAttribute('aria-hidden')!=='true');
e.context.createReadingComposition=()=>({frame,observed:[],offset:()=>160,destroy(){}});
e.context.ResizeObserver=class{observe(){}disconnect(){}};
const from=source.indexOf('    function initCapabilitiesPanels()'),to=source.indexOf('    // Keep original header/body nodes together;',from);vm.runInContext(source.slice(from,to),e.context);
const ctl=e.context.initCapabilitiesPanels();e.frame();e.frame();
const track=frame.parentNode,layoutIO=e.observers[0],readingIO=e.observers[1],surfaceIO=e.observers[2];
layoutIO.deliver([{target:layout,isIntersecting:true}]);readingIO.deliver([{target:track,isIntersecting:true}]);e.frame();
assert.equal(track.dataset.readingStep,'860');assert.equal(track.style.height,'3296px');
function visible(){surfaceIO.deliver(e.nodes.map(target=>({target,isIntersecting:target.closest('[data-capability-panel]').dataset.capabilityPanel===layout.dataset.capabilityActive})));}
function finishChildren(id){const nodes=panels[ids.indexOf(id)].children;for(const n of nodes){const name=n.dataset.capabilityCycle==='again'?'capability-card-enter-again':'capability-card-enter';n.listeners.get('animationstart')?.({target:n,animationName:name});}e.advance(1000);for(const n of nodes){const name=n.dataset.capabilityCycle==='again'?'capability-card-enter-again':'capability-card-enter';n.listeners.get('animationend')?.({target:n,animationName:name,elapsedTime:.26});}assert(nodes.every(n=>n.dataset.surfaceReveal==='settled'));}
function page(index){win.scrollY=1000-24+index*860+150;dispatch('window:scroll');e.frame();assert.equal(layout.dataset.capabilityActive,ids[index]);assert.equal(panels.find(p=>p.dataset.capabilityPainted==='true'),panels[index]);assert.equal(layout.dataset.capabilityPhase,'idle');visible();}
function ordered(id){const nodes=panels[ids.indexOf(id)].children;assert(nodes.every(n=>n.dataset.surfaceReveal==='entering'),JSON.stringify({id,token:layout.dataset.capabilityActivation,phases:nodes.map(n=>n.dataset.surfaceReveal)}));assert.deepEqual(nodes.map(n=>n.styles.get('--surface-delay')),nodes.map((_,i)=>i*35+'ms'));}
// Two complete forward/reverse visits replay all4/9/20 children; absolute native positions never await parent exits.
for(let visit=0;visit<2;visit++)for(const i of visit?[1,2,1,0]:[0,1,2,1,0]){page(i);ordered(ids[i]);finishChildren(ids[i]);}
page(2);ordered('tools');finishChildren('tools');const thirdToken=layout.dataset.capabilityActivation;
for(const fraction of [2.1,2.3,2.65,2.95,3]){win.scrollY=976+fraction*860;dispatch('window:scroll');e.frame();assert.equal(layout.dataset.capabilityActive,'tools');assert.equal(layout.dataset.capabilityActivation,thirdToken,'Final full dwell retains its completed activation');}
page(0);ordered('mindset');finishChildren('mindset');
const stable=layout.dataset.capabilityActivation;for(let i=0;i<30;i++){win.scrollY+=3;dispatch('window:scroll');e.frame();}assert.equal(layout.dataset.capabilityActivation,stable,'Same interval never replays');
// A same-tab explicit click replays exactly once; alignment prevents focus recursion.
tabs[0].handlers.get('click')({preventDefault(){}});assert.equal(+layout.dataset.capabilityActivation,+stable+1);visible();ordered('mindset');finishChildren('mindset');
// Actual manual navigation keeps incumbent instant parent alignment and replays children.
tabs[2].handlers.get('click')({preventDefault(){}});assert.equal(layout.dataset.capabilityPhase,'idle');visible();ordered('tools');finishChildren('tools');
// The retained optional parent-transition API is also cancelled by the latest passive position.
ctl.select('mindset',false,true);assert.equal(layout.dataset.capabilityPhase,'exiting');const staleParent=animations.at(-1).onfinish;
page(1);ordered('skills');const token=layout.dataset.capabilityActivation;staleParent();assert.equal(layout.dataset.capabilityActivation,token);assert.equal(layout.dataset.capabilityActive,'skills');
// Old animation-end and timeout cannot settle a freshly armed generation.
const first=panels[1].children[0];const staleTimer=[...e.timers.values()][0];page(2);page(1);const fresh=first.dataset.capabilityCycle;
first.listeners.get('animationend')({target:first,animationName:fresh==='again'?'capability-card-enter':'capability-card-enter-again',elapsedTime:.26,timeStamp:0});staleTimer?.();assert.equal(first.dataset.surfaceReveal,'entering');finishChildren('skills');
// True departure/revisit rearms once; hidden document cancels unfinished and cannot consume completion.
layoutIO.deliver([{target:layout,isIntersecting:false}]);layoutIO.deliver([{target:layout,isIntersecting:true}]);visible();ordered('skills');doc.hidden=true;dispatch('visibilitychange');assert(panels[1].children.every(n=>n.dataset.surfaceReveal==='settled'));doc.hidden=false;dispatch('visibilitychange');visible();ordered('skills');finishChildren('skills');
// Focused children remain fully readable on a decorative replay.
doc.activeElement=first;ctl.select('skills',false,true,true);assert.equal(first.dataset.surfaceReveal,'settled');doc.activeElement={};
// Phone/desktop refit on the same controller stays readable and then permits a fresh fit activation.
win.innerWidth=390;dispatch('window:resize');e.frame();assert.equal(track.dataset.readingMode,'flow');assert(panels.every(p=>!p.inert));assert(e.nodes.every(n=>n.dataset.surfaceReveal==='settled'));win.innerWidth=1288;dispatch('window:resize');e.frame();assert.equal(track.dataset.readingMode,'fit');visible();ordered(layout.dataset.capabilityActive);
e.media.matches=true;dispatch('visibilitychange');e.media.onChange?.();assert(e.nodes.every(n=>n.dataset.surfaceReveal==='settled'));ctl.destroy();e.manager.destroy();assert.equal(e.timers.size,0);assert.equal(e.frames.size,0);assert(e.observers.every(o=>o.targets.size===0));assert.equal(callbacks.size,0);
// Omitted distance policy retains Expertise's exact .65vh/default geometry.
const otherFrame=new N();otherFrame.parentNode=parent;const other=e.context.createNativeReadingSequence({frame:otherFrame,items:panels,height:()=>548,fitPredicate:()=>true,modeChanged(){},changed(){},blocked:()=>false,ids:['a','b','c'],anchors:{},focus(){}});assert.equal(otherFrame.parentNode.dataset.readingStep,'575');assert.equal(otherFrame.parentNode.style.height,'2273px');other.destroy();assert.equal(callbacks.size,0);
console.log('CAP181 actual owners PASS:4/9/20 replay×2, same-tab,30 same-interval updates,860px absolute intervals/full third, passive latest paint, stale parent/child/timer, revisit,focus,hidden,phone/refit,reduced,disposal.');
