/* Execute shipped asynchronous OTP owner. Server outcomes are controlled; no real configured code is read. */
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),source=fs.readFileSync('index.html','utf8');
const stateStart=source.indexOf('        let otpValues ='),state=source.slice(stateStart,source.indexOf('        function getDict(langOverride)',stateStart));
const start=source.indexOf('        async function verifySecurityOtp()'),funcs=source.slice(start,source.indexOf('        if (otpCloseBtn)',start));
const lifecycle=source.slice(source.indexOf('        const cancelPrivateRequests ='),source.indexOf('        // Filter Buttons handling',source.indexOf('        const cancelPrivateRequests =')));
const ownerStart=source.indexOf('            onLanguageChange: (newLang) => {',start),ownerEnd=source.indexOf('            closeDialogs()',ownerStart),owner=source.slice(ownerStart,ownerEnd);
function environment(){
 const timers=new Map(),classes=new Set(['modal-closed']),requests=[];let timer=0,opened=[],rendered=0,focused=0;
 const banner=()=>({textContent:'',classList:{add(){},remove(){}}}),error= banner(),success=banner();
 const button={disabled:false,setAttribute(){},removeAttribute(){}},catalog=Array.from({length:11},(_,i)=>({id:'case-'+i,isRestricted:i>=8}));
 const listeners=new Set(),events={addEventListener(type,fn){listeners.add(fn);},removeEventListener(type,fn){listeners.delete(fn);}};
 const context=vm.createContext({AbortController,privateDisposed:false,caseLoadGeneration:0,activeModalIndex:null,conceptCarousel:null,grid:{querySelectorAll:()=>[]},closeModal(){},window:events,OTP_LENGTH:6,pendingRestrictedIdx:null,pendingRestrictedOpenFolderOnly:false,PROJECTS_CATALOG:catalog,otpModal:{classList:{contains:n=>classes.has(n),add:n=>classes.add(n),remove:n=>classes.delete(n)}},modal:{classList:{contains:()=>true}},otpSubmitBtn:button,otpErrorBanner:error,otpSuccessBanner:success,currentLang:'en',document:{...events,body:{style:{}},getElementById:()=>null},folderByIndex:i=>({setAttribute(){opened.push(['folder',i]);}}),getDict:()=>({otp_error_invalid:'invalid',otp_error_incomplete:'incomplete',otp_error_service_unavailable:'unavailable',otp_error_too_many_attempts:'limited'}),updateOtpUI(){},triggerOtpShake(){},rememberDialogOpener(){},focusOpenedDialog(){},renderFolders(){rendered++;},openCaseStudyModal:i=>opened.push(['detail',i]),privatePreviews:{invalidate(){},destroy(){},unlock(id,code,lang,signal){return new Promise((resolve,reject)=>requests.push({id,lang,signal,resolve,reject}));}},setTimeout(fn,delay){timers.set(++timer,{fn,delay});return timer;},clearTimeout:id=>timers.delete(id),recordFocus(){focused++;}});
 vm.runInContext(state+'\nfunction buildOtpInputsDOM(){otpInputs=[{input:{focus:recordFocus}}];}\n'+funcs+'\nthis.ops={open:openSecurityOtpModal,close:closeSecurityOtpModal,verify:verifySecurityOtp,cancel:cancelOtpTimers,fill:()=>{otpValues=Array(6).fill("1")},incomplete:()=>{otpValues=["1"]},status:()=>otpStatus};',context);
 vm.runInContext(lifecycle+'\nthis.owner={'+owner+'};',context);
 return{ops:context.ops,owner:context.owner,listeners,timers,requests,error,button,get opened(){return opened;},get rendered(){return rendered;},get focused(){return focused;},run(delay){for(const[id,item]of [...timers])if(item.delay===delay){timers.delete(id);item.fn();}}};
}
(async()=>{
 for(const index of [8,9,10])for(const only of [false,true]){
  const e=environment();e.ops.open(index,only);e.ops.fill();const pending=e.ops.verify();e.ops.verify();assert.equal(e.requests.length,1);assert.equal(e.button.disabled,true);assert.equal(e.requests[0].id,'case-'+index);
  e.requests[0].resolve();await pending;assert.equal(e.ops.status(),'success');assert.equal(e.button.disabled,false);e.run(520);assert.deepEqual(e.opened,only?[['folder',index]]:[['folder',index],['detail',index]]);assert.equal(e.rendered,1);assert.equal(e.timers.size,0);
 }
 for(const status of [401,429,503]){
  const e=environment();e.ops.open(8);e.ops.fill();const pending=e.ops.verify();const before=e.focused;e.requests[0].reject(Object.assign(Error('server'),{status}));await pending;assert.equal(e.ops.status(),'error');assert.equal(e.error.textContent,status===401?'invalid':status===429?'limited':'unavailable');assert.equal(e.focused,before+1,'Failed fetch restores a visible OTP input after submit is enabled');assert.equal(e.button.disabled,false);assert.equal([...e.timers.values()].filter(v=>v.delay===520).length,0);
 }
 {
  const e=environment();e.ops.open(8);e.ops.incomplete();await e.ops.verify();assert.equal(e.requests.length,0);assert.equal(e.error.textContent,'incomplete');
  e.ops.fill();const pending=e.ops.verify();e.ops.close();assert.equal(e.requests[0].signal.aborted,true);e.requests[0].resolve();await pending;e.run(520);assert.deepEqual(e.opened,[]);assert.equal(e.timers.size,0);
 }
 {
  const e=environment();e.ops.open(8);e.ops.fill();const old=e.ops.verify();e.ops.open(9);e.ops.fill();const next=e.ops.verify();e.requests[0].resolve();await old;assert.equal(e.ops.status(),'idle');e.requests[1].resolve();await next;e.run(520);assert.deepEqual(e.opened,[['folder',9],['detail',9]]);
 }
 {
  const e=environment();e.ops.open(8);e.ops.fill();const pending=e.ops.verify();e.requests[0].resolve();await pending;const saved=[...e.timers.values()].find(v=>v.delay===520).fn;e.ops.close();saved();assert.deepEqual(e.opened,[],'Saved success cannot reopen after cancellation');
 }
 for(const action of ['locale','destroy']){
  const e=environment();e.ops.open(8);e.ops.fill();const pending=e.ops.verify();if(action==='locale')e.owner.onLanguageChange('ar');else e.owner.destroy();assert.equal(e.requests[0].signal.aborted,true);e.requests[0].resolve();await pending;e.run(520);assert.deepEqual(e.opened,[]);assert.equal(e.error.textContent,'');assert.equal(e.ops.status(),'idle');if(action==='destroy'){assert.equal(e.timers.size,0);assert.equal(e.listeners.size,0);e.ops.open(9);assert.equal(e.timers.size,0);}else assert.equal(e.timers.size,1,'Only the fresh-language focus timer remains');
 }
 assert.match(source,/id="otp-error-banner" role="alert" aria-live="assertive"/);
 console.log('PASS: shipped async OTP owner, server outcomes, all3 identities, error focus/announcement, pending dedupe, locale/disposal abort, listener cleanup and stale timers.');
})().catch(error=>{console.error(error.message);process.exitCode=1;});
