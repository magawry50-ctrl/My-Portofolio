/* Public approved wording only. No spreadsheet, account, owner notes, or review exports. */
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const fixture=require('./fixtures/approved-copy202.json'),source=fs.readFileSync('index.html','utf8'),notfound=fs.readFileSync('404.html','utf8');
const motion203=require('./fixtures/approved-motion203-ui.json');
const actionLabelOverrides=motion203.folder204.actionLabelOverrides;
assert.deepEqual(actionLabelOverrides,{'COPY-0613':{en:'Open project details',ar:'فتح تفاصيل المشروع'}},'Only the FOLDER204 primary action label may replace approved copy');
const hash=s=>crypto.createHash('sha256').update(s).digest('hex');
const a=source.indexOf('const I18N = '),b=source.indexOf('// --- Language Switching Logic',a),dictionary=vm.runInNewContext(source.slice(a,b)+'\nI18N');
const decode=s=>s.replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;|&apos;/g,"'").replace(/&nbsp;/g,' ');
const plain=s=>decode(s.replace(/<br\b[^>]*>/gi,'\n').replace(/<\/?(?:ul|li)\b[^>]*>/gi,'\n').replace(/<[^>]*>/g,'')).split('\n').map(s=>s.trim()).filter(Boolean).join('\n');
const normalize=s=>s.replace(/\s+/g,' ').trim();
assert.equal(fixture.units.length,796);assert.equal(fixture.sectionCount,27);
assert.equal(Object.keys(dictionary.en).length,625);assert.equal(Object.keys(dictionary.ar).length,625);
let keyCount=0,composites=0,dormant=0;
const missing=[];
for(const u of fixture.units){
 if(u.dormant)dormant++;
 if(u.keys.length){
  for(const lang of ['en','ar']){
   for(const key of u.keys){assert.equal(dictionary[lang][key],u.keyValues[key][lang],`${u.id}/${lang}/${key} exact rich string`);keyCount++;}
   const actual=u.keys.map(k=>plain(dictionary[lang][k])).join(' ');
   assert.equal(normalize(actual),normalize(u[lang]),`${u.id}/${lang} exact complete unit`);
  }
  if(u.keys.length>1)composites++;
 }else{
  const text=u.file==='404.html'?notfound:source;
  for(const lang of ['en','ar']){
   const value=actionLabelOverrides[u.id]?.[lang]??u[lang],variants=[value,JSON.stringify(value).slice(1,-1),value.replace(/'/g,"\\'"),value.replace(/&/g,'&amp;').replace(/"/g,'&quot;')];
   // The copyright year and decorative acronym are existing runtime composition, not literals.
   if(u.id==='COPY-0040'){assert(text.includes('id="footer-year"'));assert(text.includes(lang==='ar'?'محمد المغاوري':'Mohamed Al-Maghawry'));continue;}
   if(u.id==='COPY-0515'){assert(text.includes('<span>M</span><span>O</span><span>P</span><span>A</span><span>A</span><span>C</span><span>E</span>'));continue;}
   if(u.id>='COPY-0075'&&u.id<='COPY-0111'&&u.kind==='Tooltip'){assert(text.includes("arabic ? ' · زيارة الموقع' : ' · Open website'"));assert.equal(u[lang],u.en.replace(' · Open website','')+(lang==='ar'?' · زيارة الموقع':' · Open website'));continue;}
   if(!variants.some(v=>text.includes(v)))missing.push({id:u.id,lang,value});
  }
 }
}
assert.deepEqual(missing,[],'Every non-dictionary approved unit has its exact existing value or the single separately pinned FOLDER204 action label');
// Preserve the design, paths and media. Added list items have no layout classes.
assert.equal(motion203.copy202ApprovalSHA256,fixture.approvalSHA256);
assert.equal(motion203.previousInlineCssSHA256,fixture.baseline.cssSHA256);
assert.equal(hash([...source.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)].map(m=>m[1]).join('\n')),motion203.inlineCssSHA256,'Inline CSS differs only by the separately reviewed MOTION203 closed/open sheet pointer gates');
const staticPart=source.slice(0,a);
assert.deepEqual(motion203.removedStaticClasses,['concept-carousel-controls']);
assert.deepEqual(motion203.addedStaticClasses,['concepts-disclosure']);
const retainedClasses=fixture.baseline.staticClasses.filter(value=>!motion203.removedStaticClasses.includes(value));
assert.equal(retainedClasses.length,fixture.baseline.staticClasses.length-1,'Only the removed Concepts arrow host leaves the old class sequence');
const actualClasses=[...staticPart.matchAll(/\bclass="([^"]*)"/g)].map(m=>m[1]);let originalClass=0;const addedClasses=[];
for(const value of actualClasses){if(value===retainedClasses[originalClass])originalClass++;else addedClasses.push(value);}
assert.equal(originalClass,retainedClasses.length,'Every retained static layout class remains in order');
assert.deepEqual(addedClasses.sort(),[...Array(3).fill('list-disc list-inside ml-5 space-y-1 mt-2'),...motion203.addedStaticClasses].sort(),'Only the existing three rich lists and reviewed Concepts disclosure add layout classes');
assert.deepEqual(motion203.removedControlIds,['concepts-previous','concepts-next']);
motion203.removedControlIds.forEach(id=>assert(!staticPart.includes(`id="${id}"`)));
assert.equal(motion203.addedControlId,'concepts-show-more');
assert(source.includes(`<button id="concepts-show-more" class="concepts-disclosure" type="button" aria-expanded="false" aria-controls="glass-folders-grid restricted-project-launcher">${motion203.newCopy.en.show}</button>`),'The one added control has pinned semantics and initial wording');
for(const lang of ['en','ar'])for(const state of ['show','hide'])assert(source.includes(`'${motion203.newCopy[lang][state]}'`),'Every new disclosure word is separately pinned');
assert.deepEqual([...staticPart.matchAll(/\b(?:href|src|data-src|data-media-src)="([^"]*)"/g)].map(m=>m[0]),fixture.baseline.linksAndAssets,'All authored links/assets preserved');
// Verify all 357 initial data-i18n fallbacks as users see them before locale initialization.
let fallbacks=0;
for(const m of staticPart.matchAll(/<([a-z][\w:-]*)\b[^>]*data-i18n="([^"]+)"[^>]*>/gi)){
 const tag=m[1],key=m[2],tokens=new RegExp('<\\/?'+tag+'\\b[^>]*>','gi');tokens.lastIndex=m.index+m[0].length;let depth=1,end;
 for(let t;(t=tokens.exec(staticPart));){depth+=t[0].startsWith('</')?-1:1;if(!depth){end=t.index;break;}}
 assert(end!==undefined,key);assert.equal(normalize(plain(staticPart.slice(m.index+m[0].length,end))),normalize(plain(dictionary.en[key])),key+' initial fallback');fallbacks++;
}
assert.equal(fallbacks,357);
// Test the shipped locale boundary against real static localized attributes and its repeated use.
const nodes=[...staticPart.matchAll(/<[^>]+\bdata-copy-en="[^"]*"[^>]*>/g)].map(m=>{
 const attrs=Object.fromEntries([...m[0].matchAll(/([\w-]+)="([^"]*)"/g)].map(x=>[x[1],decode(x[2])]));
 return{attrs,textContent:'',getAttribute(k){return this.attrs[k]??null},setAttribute(k,v){this.attrs[k]=v}};
});
const simple=()=>({attrs:{},getAttribute(k){return this.attrs[k]??null},setAttribute(k,v){this.attrs[k]=v},replaceChildren(v){this.textContent=v}});
const mainNav=simple(),navText=simple(),hero=simple(),theme=simple(),loader=simple(),tile=simple(),inputs=Array.from({length:6},simple);
let dark=false;
const document={documentElement:{classList:{contains:()=>dark}},querySelectorAll:q=>q==='[data-copy-en]'?nodes:q==='img'||q==='.mh-brand-item'?[]:inputs,querySelector:q=>q.includes('.sr-only')?navText:q.includes('.notch-main')?mainNav:q==='#hero-main-photo-capsule'?hero:tile,getElementById:id=>id==='theme-toggle'?theme:loader};
const from=source.indexOf('    function refreshLocalizedPortfolioAttributes('),to=source.indexOf('    const setLanguage =',from),ctx=vm.createContext({document});vm.runInContext(source.slice(from,to),ctx);
for(const lang of ['ar','en','ar','en'])for(const isDark of [true,false]){
 dark=isDark;ctx.refreshLocalizedPortfolioAttributes(lang);
 for(const node of nodes){const value=node.attrs[lang==='ar'?'data-copy-ar':'data-copy-en'],attribute=node.attrs['data-copy-attribute'];assert.equal(attribute?node.attrs[attribute]:node.textContent,value);}
 assert.equal(navText.textContent,lang==='ar'?'فتح قائمة التنقل':'Open navigation menu');
 assert.equal(mainNav.attrs['aria-label'],lang==='ar'?'التنقّل الرئيسي':'Main navigation');
 assert.equal(hero.attrs.title,lang==='ar'?'محمد المغاوري':'Mohamed Al-Maghawry');
 assert.equal(theme.attrs.title,lang==='ar'?(dark?'التبديل للوضع النهاري':'التبديل للوضع الليلي'):(dark?'Switch to light theme':'Switch to dark theme'));
 inputs.forEach((n,i)=>assert.equal(n.attrs['aria-label'],lang==='ar'?`الخانة ${i+1} من رمز المعاينة`:`Preview code digit ${i+1}`));
}
console.log(`COPY202 PASS: ${fixture.units.length} original units / ${fixture.sectionCount} sections; ${keyCount} exact keyed locale values; ${composites} composed units; ${dormant} dormant units; ${fallbacks} fallbacks; ${nodes.length} static localized occurrences; repeated EN/AR and theme labels; only separately pinned MOTION203 UI delta and FOLDER204 primary action label; all links/assets preserved.`);
