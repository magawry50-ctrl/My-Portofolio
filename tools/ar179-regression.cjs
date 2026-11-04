/* AR179 locale behavior, with COPY202 approved wording replacing superseded frozen-copy assertions. */
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const source=fs.readFileSync('index.html','utf8'),approved=require('./fixtures/approved-copy202.json');
const ticker=source.slice(source.indexOf('<section id="clients-marquee"'),source.indexOf('<section id="about"'));
assert.equal((ticker.match(/title="To-Get\.me · Open website"/g)||[]).length,2);
assert.equal((ticker.match(/alt="To-Get\.me"/g)||[]).length,4);
assert(!/\b(?:title|alt)="To-Get Me/.test(ticker));
const a=source.indexOf('const I18N ='),b=source.indexOf('// --- Language Switching Logic',a),dictionary=vm.runInNewContext(source.slice(a,b)+';I18N');
for(const unit of approved.units)for(const key of unit.keys)for(const lang of ['en','ar'])assert.equal(dictionary[lang][key],unit.keyValues[key][lang],key+' approved '+lang);
function n(attrs={}){return{attrs:{...attrs},getAttribute(k){return this.attrs[k]??null},setAttribute(k,v){this.attrs[k]=v},hasAttribute(k){return k in this.attrs},replaceChildren(value){this.textContent=value}}}
const mappings=[{"match":"assets/photos/mohamed-hero-suit","ar":"محمد المغاوري"},{"match":"assets/photos/mohamed-executive","ar":"محمد المغاوري — معماري أنظمة واستراتيجي قيمة"},{"match":"assets/team/fp-team-","ar":"فريق عمل FP International"},{"match":"assets/photos/kreston-consultant-remote","ar":"مساحة عمل للاستشارات عن بُعد"},{"match":"assets/photos/kreston-consultant-office","ar":"استشارات العملاء والحلول"},{"match":"assets/photos/kreston-photo-","ar":"مستشار Kreston"},{"match":"assets/awards/award-commerce-startup","ar":"مسابقة ريادة الأعمال بكلية التجارة"},{"match":"assets/awards/award-gico-graduation","ar":"مسابقة مشروعات التخرج — GICO"},{"match":"assets/awards/award-mu-innovation","ar":"معرض الابتكار العلمي بجامعة المنصورة"},{"match":"assets/awards/award-cairo-exhibition","ar":"معرض القاهرة الدولي للابتكار"},{"match":"assets/patents/patent-cartless-shopping","ar":"نموذج التسوّق دون عربة VSCD"},{"match":"assets/patents/patent-beverage-cap","ar":"غطاء لحفظ ضغط المشروبات وتفريغه"},{"match":"assets/patents/patent-interactive-display","ar":"نظام العرض التفاعلي ISS"},{"match":"assets/photos/mohamed-warm-office-","ar":"محمد المغاوري — معماري أنظمة واستراتيجي قيمة"}];
const images=mappings.map((m,i)=>n({src:'data:image/svg+xml,placeholder','data-src':m.match+'640.webp',alt:'Original English '+i})),decorative=n({src:mappings[0].match+'.webp',alt:''});images.push(decorative);
const brands=['ToGet.me','Awamer','Swissnest™'].map(alt=>Object.assign(n(),{querySelector:()=>n({alt})}));
const inputs=Array.from({length:6},()=>Object.assign(n(),{value:'4'})),loader=n(),tile=n();
const document={documentElement:{classList:{contains:()=>false}},querySelectorAll:q=>q==='img'?images:q==='.mh-brand-item'?brands:q==='[data-copy-en]'?[]:inputs,getElementById:()=>loader,querySelector:()=>tile};
const start=source.indexOf('    function refreshLocalizedPortfolioAttributes('),end=source.indexOf('    const setLanguage =',start),ctx=vm.createContext({document});vm.runInContext(source.slice(start,end),ctx);
for(const locale of ['ar','en','ar','en']){
 ctx.refreshLocalizedPortfolioAttributes(locale);
 images.slice(0,-1).forEach((image,i)=>assert.equal(image.attrs.alt,locale==='ar'?mappings[i].ar:'Original English '+i));assert.equal(decorative.attrs.alt,'');
 inputs.forEach((input,i)=>{assert.equal(input.attrs['aria-label'],locale==='ar'?`الخانة ${i+1} من رمز المعاينة`:`Preview code digit ${i+1}`);assert.equal(input.value,'4','Locale refresh preserves real entered OTP values')});
 assert.equal(brands[0].attrs.title,locale==='ar'?'To-Get.me · زيارة الموقع':'To-Get.me · Open website');
 assert.equal(brands[2].attrs['aria-label'],locale==='ar'?'Swissnest™ · زيارة الموقع':'Swissnest™ · Open website');
 assert.equal(loader.attrs['aria-label'],locale==='ar'?'جارٍ تحميل الصفحة':'Loading page');
}
assert(source.includes('        refreshLocalizedPortfolioAttributes(lang);'));
const count={"id":"result-count-morphology","after":"const resultCount = results.length;\n            const metricsBadgeText = !isAr ? `${resultCount} Key Outcomes` : resultCount === 0 ? 'لا توجد مخرجات رئيسية' : resultCount === 1 ? 'مخرج رئيسي واحد' : resultCount === 2 ? 'مخرجان رئيسيان' : resultCount % 100 >= 3 && resultCount % 100 <= 10 ? `${resultCount} مخرجات رئيسية` : resultCount % 100 === 0 ? `${resultCount} مخرج رئيسي` : `${resultCount} مخرجًا رئيسيًا`;","examples":{"0":"لا توجد مخرجات رئيسية","1":"مخرج رئيسي واحد","2":"مخرجان رئيسيان","3":"3 مخرجات رئيسية","10":"10 مخرجات رئيسية","11":"11 مخرجًا رئيسيًا","100":"100 مخرج رئيسي","103":"103 مخرجات رئيسية"}};assert(source.includes(count.after));
for(const [number,expected]of Object.entries(count.examples)){assert.equal(vm.runInNewContext(count.after+';metricsBadgeText',{results:Array(+number),isAr:true}),expected);assert.equal(vm.runInNewContext(count.after+';metricsBadgeText',{results:Array(+number),isAr:false}),`${number} Key Outcomes`);}
console.log('AR179/COPY202 PASS:1250 approved locale values,14 image families/lazy placeholders/decorative exclusions,canonical brands,live6 OTP values and approved labels,loader names,repeated AR/EN switching and Arabic result-count grammar.');
