/* Execute the shipped navigation, disclosure, sizing and folder interaction owners. */
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('index.html','utf8');
const extract=(from,to)=>source.slice(source.indexOf(from),source.indexOf(to,source.indexOf(from)));
class Node {
 constructor(index=0){this.index=index;this.hidden=false;this.attrs={};this.handlers=new Map();this.style={setProperty:(k,v)=>this.style[k]=v};this.classList={toggle(){}};}
 addEventListener(k,f){if(!this.handlers.has(k))this.handlers.set(k,new Set());this.handlers.get(k).add(f);}
 removeEventListener(k,f){this.handlers.get(k)?.delete(f);}
 emit(k,e={}){for(const f of this.handlers.get(k)||[])f({stopPropagation(){},...e});}
 click(){this.emit('click');} setAttribute(k,v){this.attrs[k]=String(v);}getAttribute(k){return this.attrs[k]??null;}removeAttribute(k){delete this.attrs[k];}
 contains(n){return n===this;}querySelector(q){return this.nodes?.[q]||null;}querySelectorAll(){return this.sheets||[];}
}
function stackFixture(){
 const handlers=new Map(),frames=new Map(),resizes=[];let serial=0,scrollY=0;
 const listen=(key,fn)=>{if(!handlers.has(key))handlers.set(key,new Set());handlers.get(key).add(fn);};
 const fire=key=>{for(const fn of handlers.get(key)||[])fn();};
 class Element extends Node{
  constructor(id=''){super();this.id=id;this.dataset={};this.children=[];this.tagName='DIV';this.style.removeProperty=k=>delete this.style[k];this.classList.contains=()=>false;}
  appendChild(n){n.remove();this.children.push(n);n.parentNode=this;return n;}
  remove(){if(this.parentNode)this.parentNode.children.splice(this.parentNode.children.indexOf(this),1);this.parentNode=null;}
  insertBefore(n,b){n.remove();this.children.splice(this.children.indexOf(b),0,n);n.parentNode=this;}
  replaceWith(n){this.parentNode.insertBefore(n,this);this.remove();}
  contains(n){return this===n||this.children.some(child=>child.contains(n));}
  closest(){return view;}
  querySelectorAll(){return [];}
  get offsetHeight(){return this.height||this.children.reduce((sum,n)=>sum+n.offsetHeight,0);}
  getBoundingClientRect(){
   if(this.owner){const r=this.owner.getBoundingClientRect();return{...r,top:r.top+this.local,height:44};}
   if(this.className==='section-stack-slot'){const section=this.children[0].children[0];return{top:topOf(section)-scrollY,left:28,width:1232,height:section.height};}
   if(this.className==='section-stack-sheet'&&this.style.position==='fixed')return{top:parseFloat(this.style.top),left:28,width:1232,height:this.offsetHeight};
   if(this.parentNode?.className==='section-stack-slot'||this.parentNode?.className==='section-stack-sheet')return this.parentNode.getBoundingClientRect();
   return{top:0,left:28,width:1232,height:this.offsetHeight};
  }
 }
 const view=new Element('portfolio-view-work');view.dataset.groupView='work';
 const sections=Object.fromEntries([['work',772],['client-works',912],['patents',488]].map(([id,height])=>{const n=new Element(id);n.height=height;view.appendChild(n);return[id,n];}));
 function topOf(section){let top=1000;for(const node of view.children){const original=node.className==='section-stack-slot'?node.children[0].children[0]:node;if(original===section)return top;top+=original.height+120;}return top;}
 const disclosure=sections.work.appendChild(new Element('concepts-show-more'));disclosure.owner=sections.work;disclosure.local=650;
 const doc={hidden:false,body:new Element('body'),activeElement:null,documentElement:{dataset:{portfolioView:'work'},style:{},clientWidth:1366,dir:'ltr',get scrollHeight(){return topOf(sections.patents)+sections.patents.height+400;}},getElementById:id=>sections[id],querySelector:()=>null,createElement:()=>new Element(),addEventListener:(k,f)=>listen('d:'+k,f),removeEventListener:(k,f)=>handlers.get('d:'+k)?.delete(f),dispatchEvent:e=>fire('d:'+e.type)};
 doc.body.appendChild(view);
 const win={innerWidth:1366,innerHeight:768,get scrollY(){return scrollY;},matchMedia:()=>({matches:false}),addEventListener:(k,f)=>listen('w:'+k,f),removeEventListener:(k,f)=>handlers.get('w:'+k)?.delete(f)};
 const ctx=vm.createContext({window:win,document:doc,capabilitiesPanelsManager:null,pillarsGalleryManager:null,getComputedStyle:()=>({getPropertyValue:()=> '24px'}),Event:class{constructor(type){this.type=type;}},requestAnimationFrame:fn=>{frames.set(++serial,fn);return serial;},cancelAnimationFrame:key=>frames.delete(key),ResizeObserver:class{constructor(fn){this.fn=fn;resizes.push(this);}observe(){}disconnect(){}},listenMediaChange:()=>()=>{}});
 vm.runInContext(extract('    function initSectionStacks()', '    let capabilitiesPanelsManager ='),ctx);
 const manager=ctx.initSectionStacks();
 const flush=()=>{for(const [key,fn]of [...frames]){frames.delete(key);fn();}};
 return{manager,sections,disclosure,view,doc,frames,topOf,scroll(value){scrollY=value;fire('w:scroll');flush();},resize(){resizes[0].fn();flush();}};
}
async function main(){
 // Real outer owner: normal-flow Concepts must never be fixed/faded under its successor.
 {
  const e=stackFixture(),work=e.sections.work,sheet=work.parentNode,slot=sheet.parentNode;
  assert.equal(e.disclosure.attrs['data-stack-fade-content'],undefined,'Disclosure is excluded from stack fade ownership');
  for(const height of [772,1800,772]){
   work.height=height;e.disclosure.local=height-90;e.resize();
   assert.equal(+slot.dataset.stackHeight,height,'Outer metrics track disclosure expansion and collapse');
   const successorTop=e.topOf(e.sections['client-works']);
   for(const y of [Math.max(0,+slot.dataset.stackStart),successorTop-700,successorTop-500,successorTop-100]){
    e.scroll(y);assert.equal(sheet.dataset.stackMode,'flow');assert.notEqual(sheet.style.position,'fixed');assert.equal(slot.dataset.stackPinned,'false');assert.equal(sheet.dataset.stackFading,'false');
    assert.equal(e.manager.documentTop(e.disclosure),1000+height-90,'Navigation uses the original flow geometry');
    const button=e.disclosure.getBoundingClientRect(),following=e.sections['client-works'].getBoundingClientRect();
    assert(following.top>button.top+button.height,'Following Selected Projects cannot overlap the disclosure hit rectangle');
   }
  }
  // The subsequent section retains its own finite tail-stack behavior after Concepts has left.
  const selected=e.sections['client-works'].parentNode,selectedSlot=selected.parentNode;e.scroll(+selectedSlot.dataset.stackStart);assert.equal(selectedSlot.dataset.stackPinned,'true');
  e.manager.destroy();assert.equal(work.parentNode,e.view);assert.equal(e.frames.size,0);
 }
 for(const lang of ['en','ar'])for(const reduced of [false,true]){
  const roots=Array.from({length:11},(_,i)=>{const n=new Node(i);n.setAttribute('data-project-index',i);n.setAttribute('data-category',i%2?'product':'venture');return n;});
  const grid=new Node(),restrictedHost=new Node(),toggle=new Node(),doc=new Node(),win=new Node(),anchorFrames=new Map(),scrolls=[];grid.querySelectorAll=()=>roots.slice(0,8);restrictedHost.querySelectorAll=()=>roots.slice(8);grid.clientWidth=1232;
  let reveals=0,stackRefreshes=0,navRefreshes=0,anchorSerial=0;doc.documentElement={dataset:{portfolioView:'work'},style:{scrollBehavior:'smooth'}};doc.activeElement=toggle;win.innerWidth=1366;win.matchMedia=()=>({matches:reduced});win.scrollY=3700;win.scrollTo=options=>{assert.equal(options.behavior,'auto');assert.equal(doc.documentElement.style.scrollBehavior,'auto');scrolls.push(options.top);win.scrollY=options.top;};
  const ctx=vm.createContext({grid,restrictedHost,collectionToggle:toggle,collectionAnchorFrame:null,collectionAnchorGeneration:0,privateDisposed:false,currentLang:lang,currentActiveFilter:'all',collectionExpanded:false,filterBtns:[],getDict:()=>({}),focusCollectionFallback(){throw Error('Unexpected focus fallback');},document:doc,window:win,surfaceRevealManager:{syncVisibility(){reveals++;}},sectionStackManager:{refresh(){stackRefreshes++;}},sideNavManager:{updateActiveNav(){navRefreshes++;}},listenPrivate:(node,type,fn)=>node.addEventListener(type,fn),folderRoots:()=>roots,requestAnimationFrame:fn=>{anchorFrames.set(++anchorSerial,fn);return anchorSerial;},cancelAnimationFrame:key=>anchorFrames.delete(key)});
  toggle.getBoundingClientRect=()=>({top:(ctx.collectionExpanded?4000:2500)-win.scrollY});
  vm.runInContext(extract('        function cancelCollectionAnchor()', '        // --- Mathematics and Procedural Liquid Noise Art'),ctx);
  const flushAnchor=()=>{for(const [key,fn]of [...anchorFrames]){anchorFrames.delete(key);fn();}};
  vm.runInContext(extract('        function applyCollectionVisibility(', '        // Render all 9 Glass Folders'),ctx);
  vm.runInContext(extract("        if (collectionToggle) listenPrivate(collectionToggle, 'click'",'        filterBtns.forEach(btn'),ctx);
  ctx.applyCollectionVisibility();assert.equal(roots.filter(r=>!r.hidden).length,4);assert(roots.slice(8).every(r=>r.hidden));assert(restrictedHost.hidden);assert.equal(toggle.attrs['aria-expanded'],'false');
  toggle.click();assert.equal(roots.filter(r=>!r.hidden).length,11);assert(!restrictedHost.hidden);assert.equal(toggle.attrs['aria-expanded'],'true');assert.equal(toggle.textContent,lang==='ar'?'عرض أقل':'Show less');
  ctx.currentLang=lang==='en'?'ar':'en';ctx.applyCollectionVisibility();assert.equal(roots.filter(r=>!r.hidden).length,11,'Locale rebuild retains expanded collection');assert.equal(toggle.textContent,ctx.currentLang==='ar'?'عرض أقل':'Show less');
  const priorTop=toggle.getBoundingClientRect().top;toggle.click();assert.equal(roots.filter(r=>!r.hidden).length,4);assert(roots.slice(4).every(r=>r.hidden));assert.equal(stackRefreshes,2);assert.equal(navRefreshes,2);assert(reveals>=4);
  assert.equal(scrolls.length,0,'Collapse first removes rows and refreshes flow metrics without immediate scroll');assert.equal(anchorFrames.size,1);win.scrollY=3400;flushAnchor();assert.equal(toggle.getBoundingClientRect().top,priorTop,'One correction preserves the clicked disclosure viewport position even after native partial scroll anchoring');assert.equal(scrolls.length,1);assert.equal(doc.activeElement,toggle);assert.equal(doc.documentElement.style.scrollBehavior,'smooth');assert.equal(anchorFrames.size,0,'There is no idle correction loop');assert.equal(win.handlers.get('wheel')?.size,0,'Input cancellation listeners only live during the pending frame');assert.equal(win.handlers.get('touchstart')?.size,0);
  toggle.click();toggle.click();const stale=[...anchorFrames.values()];toggle.click();stale.forEach(fn=>fn());assert.equal(scrolls.length,1,'Rapid re-expansion cancels the obsolete collapse correction');assert.equal(anchorFrames.size,0);
  for(const reason of ['route','hidden','wheel','touch','locale','disposed']){
   if(!ctx.collectionExpanded)toggle.click();toggle.click();const callbacks=[...anchorFrames.values()];
   if(reason==='route'){doc.documentElement.dataset.portfolioView='about';doc.emit('portfolio:viewchange');}
   if(reason==='hidden'){doc.hidden=true;doc.emit('visibilitychange');}
   if(reason==='wheel')win.emit('wheel');if(reason==='touch')win.emit('touchstart');if(reason==='locale')ctx.cancelCollectionAnchor();if(reason==='disposed'){ctx.privateDisposed=true;ctx.cancelCollectionAnchor();}
   callbacks.forEach(fn=>fn());assert.equal(scrolls.length,1,reason+' cannot deliver a late context scroll');assert.equal(anchorFrames.size,0);doc.documentElement.dataset.portfolioView='work';doc.hidden=false;ctx.privateDisposed=false;
  }
  vm.runInContext(extract('        function fitFolderRows()',"        const folderSizeObserver ="),ctx);
  for(const [viewport,width,columns]of [[320,288,1],[800,680,2],[1024,890,2],[1279,1145,2],[1280,1146,4],[1366,1232,4],[1920,1510,4]]){
   ctx.window.innerWidth=viewport;grid.clientWidth=width;ctx.fitFolderRows();const scale=+roots[0].style['--gf-scale'];assert(scale>0&&scale<=1);assert(340*scale*columns+24*(columns-1)<=width+.001,'Actual measured columns fit '+viewport);assert(roots.every(r=>+r.style['--gf-scale']===scale));
  }
 }
 // FOLDER204: primary activation goes straight to details; only the explicit menu unfolds files.
 for(const restricted of [false,true]){
  const root=new Node(),sheets=Array.from({length:3},()=>new Node());root.sheets=sheets;root.setAttribute('data-project-index','0');root.nodes=Object.fromEntries(['.gf-hit','.gf-key--more','.gf-menu','.gf-menu-toggle-folder','.gf-menu-open-study'].map(k=>[k,new Node()]));
  const doc=new Node(),gates=[];let details=0,unlocked=!restricted;
  const ctx=vm.createContext({grid:{querySelectorAll:()=>restricted?[]:[root]},restrictedHost:restricted?{querySelectorAll:()=>[root]}:null,PROJECTS_CATALOG:[{isRestricted:restricted}],captureSheetVideoSnapshot:()=>()=>{},folderInteractionCleanups:[],getDict:()=>({gf_open_folder:'Open folder',gf_close_folder:'Close folder'}),document:doc,surfaceRevealManager:null,isRestrictedProjectUnlocked:()=>unlocked,openSecurityOtpModal(idx,only){gates.push([idx,only]);},openCaseStudyModal(){details++;},requestAnimationFrame(){throw Error('Unexpected idle RAF');},cancelAnimationFrame(){}});
  vm.runInContext(extract('        function bindFolderInteractions()', '        // --- 6-Digit Security OTP'),ctx);ctx.bindFolderInteractions();
  assert(sheets.every(s=>s.inert&&s.tabIndex===-1&&s.attrs['aria-hidden']==='true'));sheets[0].click();assert.equal(details,0);assert.equal(gates.length,0);
  root.nodes['.gf-key--more'].click();assert.equal(root.nodes['.gf-menu'].attrs['data-open'],'true');
  root.nodes['.gf-hit'].click();assert.equal(root.nodes['.gf-menu'].attrs['data-open'],undefined,'Primary closes the options menu');
  if(restricted){assert.deepEqual(gates,[[0,false]]);assert.equal(details,0);assert(sheets.every(s=>s.inert));root.nodes['.gf-menu-toggle-folder'].click();assert.deepEqual(gates.at(-1),[0,true]);assert.equal(root.attrs['data-open'],undefined);unlocked=true;root.nodes['.gf-hit'].click();}
  assert.equal(details,1,'One primary activation opens one details popup');assert.equal(root.attrs['data-open'],undefined,'Primary never enters the full-open stage');assert.equal(root.nodes['.gf-hit'].attrs['aria-expanded'],undefined);assert(sheets.every(s=>s.inert&&s.tabIndex===-1));
  root.nodes['.gf-hit'].click();assert.equal(details,2,'Repeated primary activation opens details rather than toggling files');
  root.nodes['.gf-menu-toggle-folder'].click();assert.equal(root.attrs['data-open'],'true');assert.equal(root.nodes['.gf-menu-toggle-folder'].attrs['aria-expanded'],'true');assert(sheets.every(s=>!s.inert&&s.tabIndex===0&&s.attrs['aria-hidden']==='false'));sheets[0].click();assert.equal(details,3);
  if(restricted){unlocked=false;sheets[1].click();assert.equal(details,3,'Exposed private sheets remain fail-closed after authorization expires');assert.deepEqual(gates.at(-1),[0,false]);root.nodes['.gf-menu-open-study'].click();assert.equal(details,3);assert.deepEqual(gates.at(-1),[0,false]);unlocked=true;}
  root.nodes['.gf-menu-open-study'].click();assert.equal(details,4,'Explicit case-study menu action still opens details');
  root.nodes['.gf-menu-toggle-folder'].click();assert.equal(root.attrs['data-open'],undefined);assert.equal(root.nodes['.gf-menu-toggle-folder'].attrs['aria-expanded'],'false');assert(sheets.every(s=>s.inert&&s.tabIndex===-1));sheets[1].click();assert.equal(details,4);ctx.folderInteractionCleanups.forEach(fn=>fn());assert([...doc.handlers.values()].every(set=>!set.size));
 }
 const fixture=require('./fixtures/navigation.cjs').fixture;
 for(const lang of ['en','ar']){
  const e=fixture({animated:true,railMotion:true,lang});e.flush();let selections=0;const observations=[];
  for(const b of e.buttons){const toggle=b.classList.toggle;b.classList.toggle=(key,value)=>{if(key==='is-active')selections++;toggle(key,value);};}
  e.document.addEventListener('portfolio:viewchange',()=>observations.push([e.header.dataset.currentSection,e.header.dataset.currentGroup]));
  e.context.manager.goToSection('experience',{focus:false});assert.equal(selections,3,'Exactly one selection commit across three buttons');assert.deepEqual(observations.at(-1),['experience','work']);
  const first=e.animations.find(a=>a.node===e.views.work);assert(first);assert.equal(first.options.duration,220);
  e.context.manager.goToSection('contact',{focus:false});assert(first.cancelled);const second=e.animations.find(a=>a.node===e.views.collaborate);first.resolve();await Promise.resolve();assert(!second.cancelled,'Stale finish cannot clear replacement view motion');
  e.context.manager.goToSection('home',{focus:false});assert(second.cancelled);assert.deepEqual(observations.at(-1),['home','about']);
  const latest=()=>e.animations.filter(a=>Object.values(e.views).includes(a.node)).at(-1);
  e.context.manager.updateLabels();assert(latest().cancelled,'Locale boundary cancels view motion');
  e.context.manager.goToSection('impact',{focus:false});e.document.hidden=true;e.emit('visibilitychange');assert(latest().cancelled);e.document.hidden=false;
  e.context.manager.goToSection('contact',{focus:false});e.reduce();assert(latest().cancelled);e.context.manager.goToSection('home',{focus:false});assert.equal(e.animations.filter(a=>Object.values(e.views).includes(a.node)&&!a.cancelled).length,0,'Reduced motion commits endpoint immediately');
  e.context.manager.destroy();assert.equal(e.frames.size+e.timers.size,0);await Promise.resolve();
 }
 assert(!extract('    function initGlassFolderShowcase()', '    function initInterestsCarousel(').includes('initInterestsCarousel('),'Concepts is never registered for forced horizontal/page scroll');
 assert(!source.includes('id="concepts-previous"')&&!source.includes('id="concepts-next"'));
 assert(fs.readFileSync('assets/project-preview.css','utf8').includes('overflow:visible'));
 assert(/@media\(min-width:1280px\)\{[^}]*grid-template-columns:repeat\(4/.test(fs.readFileSync('assets/project-preview.css','utf8')),'The visual grid and measured owner share the tablet/desktop breakpoint');
 assert(fs.readFileSync('assets/liquid-glass.css','utf8').includes('transition-property:opacity!important'));
 const hitTemplates=[...source.matchAll(/<button type="button" class="gf-hit"([\s\S]*?)<\/button>/g)];assert.equal(hitTemplates.length,2);for(const hit of hitTemplates){assert(hit[1].includes('aria-haspopup="dialog"'));assert(!hit[1].includes('aria-expanded'));}assert(source.includes("'فتح تفاصيل المشروع' : 'Open project details'"));
 console.log('PASS MOTION203 + FOLDER204: flow-only4→11→4 Concepts disclosure, viewport/focus ownership,4/2/1 columns, direct primary details with no full-open intermediate, explicit menu/file actions, fail-closed private gates, dialog semantics, navigation motion and lifecycle cleanup.');
}
main().catch(e=>{console.error(e.stack);process.exitCode=1;});
