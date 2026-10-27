/* Reuse the actual navigation harness, supplying DOM paint/geometry APIs for finite morph tests.
   Historical whole-site restoration adapters are deliberately outside this focused owner check. */
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const context={makeFixture:require('./fixtures/navigation.cjs').fixture};
function environment(lang='en'){
 const e=context.makeFixture({animated:true,railMotion:true,lang});e.flush();
 const base=e.document.createElement,all=node=>node.children.flatMap(child=>[child,...all(child)]),copyNodes=[],controls=[];
 const enrich=node=>{
  const get=node.getAttribute.bind(node);node.getAttribute=name=>get(name)??null;
  node.querySelectorAll=selector=>all(node).filter(child=>selector==='*'||selector==='button'&&child.tagName==='BUTTON'||selector.split(',').some(s=>child.getAttribute('class')===s.replace(/^\./,'')));
  node.cloneNode=deep=>{const clone=make(node.tagName||'span');for(const key of ['class','id','data-i18n']){const value=node.getAttribute(key);if(value!==null)clone.setAttribute(key,value);}if(deep)node.children.forEach(child=>clone.appendChild(child.cloneNode(true)));return clone;};
  const animate=node.animate;node.animate=function(keys,options){const animation=animate.call(this,keys,options);this.paintAnimation=animation;const cancel=animation.cancel;animation.cancel=()=>{cancel.call(animation);if(this.paintAnimation===animation)this.paintAnimation=null;};return animation;};
  node.getBoundingClientRect=()=>{const parent=node.parent?.getBoundingClientRect?.()||e.main.getBoundingClientRect(),key=node.paintAnimation?.keys[0]||{};return{left:parent.left+(parseFloat(key.left??node.style.left)||0),top:parent.top+(parseFloat(key.top??node.style.top)||0),width:parseFloat(key.width??node.style.width)||0,height:parseFloat(key.height??node.style.height)||0};};
  return node;
 };
 const make=tag=>enrich(base(tag));e.document.createElement=make;e.document.timeline={currentTime:1000};
 e.buttons.forEach((button,index)=>{
  enrich(button);
  button.getBoundingClientRect=()=>e.header.dataset.compact==='true'?{left:28,top:76+index*56,width:44,height:44}:{left:24,top:70+index*104,width:376,height:100};
  for(const name of ['rail-route-copy','rail-route-chevron']){
   const node=make('span');node.setAttribute('class',name);node.setAttribute('data-i18n','fixture-label');button.appendChild(node);copyNodes.push(node);
   node.getBoundingClientRect=()=>e.header.dataset.compact==='true'?{width:0,height:0}:{left:lang==='ar'?190:104,top:84+index*104,width:name==='rail-route-copy'?240:16,height:42};
  }
 });
 e.utilities.querySelectorAll=selector=>selector==='button'?controls:[];
 for(let index=0;index<3;index++){
  const node=make('button');node.getBoundingClientRect=()=>({left:e.header.dataset.compact==='true'?27:27+index*55,top:e.header.dataset.compact==='true'?270+index*50:360,width:44,height:44});controls.push(node);
 }
 e.language.getBoundingClientRect=()=>({left:24,top:e.header.dataset.compact==='true'?262:352,width:e.header.dataset.compact==='true'?54:108,height:e.header.dataset.compact==='true'?108:54});
 e.language.setAttribute('style','background-color:var(--seg-bg);border:1px solid var(--seg-border)');
 e.desktopSettings.getBoundingClientRect=()=>({left:24,top:e.header.dataset.compact==='true'?250:340,width:e.header.dataset.compact==='true'?54:376,height:e.header.dataset.compact==='true'?162:70});
 const computed=e.context.getComputedStyle;e.context.getComputedStyle=(node,pseudo)=>({...computed(node,pseudo),opacity:node.sampleOpacity??node.paintAnimation?.keys[0]?.opacity??'1',color:'#52627a',direction:lang==='ar'?'rtl':'ltr',textAlign:'start',transform:lang==='ar'&&node.getAttribute?.('class')==='rail-route-chevron'?'matrix(-1,0,0,1,0,0)':'none',background:node.style?.background||(node.classList?.contains('is-active')?'#003ea0':'#eef3f9'),border:'1px solid #dce5ef',borderRadius:'14px',boxShadow:'none',borderTopColor:'#dce5ef'});
 let openingSqueezes=0;e.context.elasticToggleManager.squeeze=()=>openingSqueezes++;
 return{e,all,copyNodes,controls,get openingSqueezes(){return openingSqueezes;}};
}
(async()=>{
 for(const lang of ['en','ar']){
  const env=environment(lang),{e,all,copyNodes,controls}=env;
  e.primary.emit('pointerenter',{pointerType:'mouse'});assert.equal(e.header.dataset.railMorph,'opening');
  const opening=e.animations.slice();assert(opening.length>=10);
  for(const a of opening){assert.equal(a.options.duration,420);assert.equal(a.options.delay,undefined);assert.equal(a.options.easing,'cubic-bezier(.22,1,.36,1)');assert.equal(a.startTime,1000);assert.equal(a.keys.length,2,'No isolated chrome overshoot or unrelated sub-timeline');}
  for(const node of controls)assert(opening.some(a=>a.node===node&&a.keys[0].translate!==a.keys[1].translate),'Original settings controls participate in the shared FLIP');
  assert.equal(env.openingSqueezes,0,'Opening does not start the independent language-choice squeeze');
  const sampledWash=opening.find(a=>a.node.dataset.railRowPaint==='0');assert(sampledWash);sampledWash.keys[0]={left:'20px',top:'20px',width:'210px',height:'76px',borderRadius:'12px'};
  opening.find(a=>a.node.getAttribute?.('class')==='rail-route-copy').node.sampleOpacity='.64';
  const frameCount=e.frames.size;e.header.emit('pointerleave',{pointerType:'mouse'});e.paint({width:238,height:390,radius:24});e.flush();
  const closing=e.animations.slice(opening.length);assert.equal(closing[0].keys[0].width,'238px');
  const paint=e.main.children.find(node=>node.dataset.railPaint==='true');assert(paint?.inert);assert.equal(paint.getAttribute('aria-hidden'),'true');assert.equal(paint.style.pointerEvents,'none');
  const outgoing=all(paint).find(node=>node.getAttribute('class')==='rail-route-copy');assert(outgoing?.inert);assert.equal(outgoing.getAttribute('id'),null);assert.equal(outgoing.getAttribute('data-i18n'),null);
  assert.equal(outgoing.parent.dataset.railRowPaint,'0');assert.equal(outgoing.parent.style.overflow,'hidden','White active text remains clipped to the moving blue wash throughout early closing');assert.equal(outgoing.parent.style.background,'#003ea0');
  const closeWash=closing.find(a=>a.node===outgoing.parent);assert.equal(closeWash.keys[0].width,'210px','Closing samples the actual partially expanded wash');assert.equal(closeWash.keys[0].height,'76px');assert.equal(closeWash.keys.at(-1).width,'44px');assert.equal(closing.find(a=>a.node===outgoing).keys[0].opacity,.64);const washPosition=outgoing.parent.getBoundingClientRect();
  if(lang==='ar')assert.equal(all(paint).find(node=>node.getAttribute('class')==='rail-route-chevron').style.transform,'matrix(-1,0,0,1,0,0)','Outgoing chevron retains its original RTL mirror');
  outgoing.sampleOpacity='.37';outgoing.getBoundingClientRect=()=>({left:130,top:120,width:240,height:42});
  const count=e.animations.length;e.primary.emit('pointerenter',{pointerType:'mouse'});const reverse=e.animations.slice(count),copyMotion=reverse.find(a=>a.node.getAttribute?.('class')==='rail-route-copy'&&a.keys[0].opacity===.37);assert(copyMotion,'Reopening preserves current outbound paint opacity');assert.equal(copyMotion.keys[0].translate,(130-washPosition.left-(lang==='ar'?166:80))+'px '+(120-washPosition.top-14)+'px','Reversal starts at the current painted location relative to its current wash');assert(!e.main.children.includes(paint));
  e.context.manager.updateLabels();assert.equal(e.header.dataset.railMorph,undefined);assert(!e.main.children.some(node=>node.dataset.railPaint));assert.equal(e.language.getAttribute('style'),'background-color:var(--seg-bg);border:1px solid var(--seg-border)');
  e.header.emit('pointerleave',{pointerType:'mouse'});e.flush();
  const finishing=e.animations.filter(a=>!a.cancelled);assert(finishing.length);finishing.forEach(a=>a.resolve());for(let i=0;i<5;i++)await Promise.resolve();assert.equal(e.header.dataset.railMorph,undefined,'The shared finish barrier removes all temporary paint/styles');assert(!e.main.children.some(node=>node.dataset.railPaint));assert.equal(e.buttons[0].getAttribute('style'),null,'Sampled row paint restores the original button style attribute');
  e.primary.emit('pointerenter',{pointerType:'mouse'});e.reduce();assert.equal(e.header.dataset.railMorph,undefined);assert(e.animations.every(a=>a.cancelled));
  e.context.manager.destroy();await Promise.resolve();assert.equal(e.frames.size+e.timers.size,0);assert(!e.main.children.some(node=>node.dataset.railPaint));
 }
 // NAV188: passive scroll updates the spy/closing preference, never the opening intent.
 for(const lang of ['en','ar'])for(const entry of ['home','impact','collaborate']){
  const e=context.makeFixture({animated:true,lang});e.flush();e.context.manager.goToSection(entry,{historyMode:'none',smooth:false,focus:false});e.flush();
  const scroll=y=>{e.window.scrollY=y;e.emit('scroll',{},true);e.flush()};
  assert.equal(e.header.dataset.compact,'true');scroll(800);assert.notEqual(e.header.dataset.currentSection,entry,'The actual scrollspy keeps tracking sections');
  for(const y of [600,580,400,121,120,90,30,0,430,414,250,240,800,700,10,0]){scroll(y);assert.equal(e.header.dataset.compact,'true','Passive up/down/near-top scroll cannot open the '+lang+' '+entry+' rail at '+y);}
  e.primary.emit('pointerenter',{pointerType:'mouse'});assert.equal(e.header.dataset.compact,'false','Intentional primary hover still opens');scroll(600);scroll(420);assert.equal(e.header.dataset.compact,'false','Scrolling cannot override an active deliberate hover');e.header.emit('pointerleave',{pointerType:'mouse'});e.flush();assert.equal(e.header.dataset.compact,'true');
  e.buttons[1].focus();e.header.emit('focusin',{target:e.buttons[1]});assert.equal(e.header.dataset.compact,'false','Keyboard focus still opens');scroll(300);assert.equal(e.header.dataset.compact,'false','Focused navigation remains visible');e.sections[entry].focus();e.header.emit('focusout');e.emit('focusin',{target:e.sections[entry]});e.flush();assert.equal(e.header.dataset.compact,'true');
  e.header.emit('click',{target:e.primary});assert.equal(e.header.dataset.compact,'false','Explicit background toggle still opens');scroll(700);scroll(500);scroll(0);assert.equal(e.header.dataset.compact,'false','Explicitly pinned navigation retains user ownership');e.header.emit('click',{target:e.primary});assert.equal(e.header.dataset.compact,'true','Explicit toggle still closes');scroll(440);scroll(420);assert.equal(e.header.dataset.compact,'true');
  e.context.manager.destroy();assert.equal(e.frames.size+e.timers.size,0);
 }
 for(const lang of ['en','ar']){const e=context.makeFixture({animated:true,width:390,lang});e.flush();for(const y of [800,600,120,0]){e.window.scrollY=y;e.emit('scroll',{},true);e.flush();assert.equal(e.header.dataset.compact,'false','Desktop compact preference never changes the phone layout');}e.context.manager.showMenu('about');assert.equal(e.header.dataset.expanded,'true');e.context.manager.closeMenu();e.context.manager.destroy();assert.equal(e.frames.size+e.timers.size,0);}
 const theme=environment().e;theme.primary.emit('pointerenter',{pointerType:'mouse'});assert.equal(theme.header.dataset.railMorph,'opening');theme.theme.emit('click');assert.equal(theme.header.dataset.railMorph,undefined,'The actual theme control cancels stale palette paint before switching');assert(theme.animations.every(a=>a.cancelled));assert(!theme.main.children.some(node=>node.dataset.railPaint));theme.context.manager.destroy();
 const phone=context.makeFixture({animated:true,railMotion:true,width:320});phone.flush();phone.context.manager.showMenu('about');assert.equal(phone.header.dataset.railMorph,undefined);assert.equal(phone.animations.length,0,'Desktop morph does not run for the phone disclosure');phone.context.manager.destroy();
 console.log('PASS NAV159 actual owner: one420ms clock, two-endpoint nested chrome, settings FLIP, inert outgoing paint, partial reversal position/opacity, locale/reduced/disposal cleanup; no opening squeeze or idle loop; NAV188 passive scroll never opens while deliberate hover/focus/toggle and scrollspy remain intact.');
})().catch(error=>{console.error(error);process.exitCode=1;});
