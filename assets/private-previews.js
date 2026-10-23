/* Confidential data is fetched only from the server. No code, payload, or validation fallback lives here. */
(() => {
 const IDS=new Set(['classified-vault','vsccd','lb-127']);
 const source=typeof document!=='undefined'?document.currentScript?.src:null;
 const apiBase=source?new URL('../api/previews',source).pathname:'/api/previews';
 window.createPortfolioPrivatePreviews=({fetcher=window.fetch.bind(window),now=Date.now}={})=>{
  const entries=new Map(),requests=new Set();let generation=0;
  const allowed=id=>{if(!IDS.has(id))throw Error('unknown_project');};
  function active(id){const entry=entries.get(id);if(entry&&entry.expiresAt>now())return entry;entries.delete(id);return null;}
  async function request(id,action,{code,lang='en',signal}={}){
   allowed(id);const epoch=generation,controller=new AbortController();requests.add(controller);
   const abort=()=>controller.abort();if(signal?.aborted)controller.abort();else signal?.addEventListener('abort',abort,{once:true});
   try{
    const response=await fetcher(apiBase+'/'+encodeURIComponent(id)+'/'+action+(action==='content'?'?lang='+lang:''),{method:action==='content'?'GET':'POST',credentials:'same-origin',cache:'no-store',headers:action==='content'?{}:{'Content-Type':'application/json'},body:action==='unlock'?JSON.stringify({code,lang}):action==='logout'?'{}':undefined,signal:controller.signal});
    const result=await response.json();if(epoch!==generation||controller.signal.aborted)throw Error('cancelled');
    if(!response.ok){const error=Error(response.status===429?'rate_limited':response.status===401?'unauthorized':'unavailable');error.status=response.status;throw error;}
    return result;
   }catch(error){if(controller.signal.aborted||epoch!==generation)throw Error('cancelled');throw error;}finally{requests.delete(controller);signal?.removeEventListener('abort',abort);}
  }
  async function load(id,lang,signal){
   const result=await request(id,'content',{lang,signal});
   if(!result||result.id!==id||!Number.isFinite(result.expiresAt)||result.expiresAt<=now()||typeof result.fields!=='object'||typeof result.strings!=='object')throw Error('unavailable');
   const previous=active(id),entry={fields:result.fields,strings:{...(previous?.strings||{}),[lang]:result.strings},expiresAt:result.expiresAt,authored:result.authored===true};entries.set(id,entry);return entry;
  }
  return {
   has:id=>!!active(id),entry:active,
   async unlock(id,code,lang,signal){await request(id,'unlock',{code,lang,signal});return load(id,lang,signal);},
   load,
   dictionary(lang){let strings={};for(const[id]of entries){const entry=active(id);if(entry)Object.assign(strings,entry.strings[lang]||{});}return strings;},
   revoke(id){entries.delete(id);return request(id,'logout').catch(()=>{});},
   invalidate(){generation++;requests.forEach(controller=>controller.abort());requests.clear();},
   destroy(){generation++;requests.forEach(controller=>controller.abort());requests.clear();entries.clear();}
  };
 };
})();
