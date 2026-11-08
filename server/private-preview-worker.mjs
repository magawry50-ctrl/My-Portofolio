/* Pages advanced-mode entry. Confidential contents and access values MUST exist only in runtime bindings. */
const IDS=['classified-vault','vsccd','lb-127'];
const KEYS=['proj_classified_desc','proj_classified_concept','proj_classified_challenge','proj_classified_approach','proj_classified_result1','proj_classified_result2','proj_classified_result3','work_highlight_9'];
const CODES=['PREVIEW_CODE_CLASSIFIED_VAULT','PREVIEW_CODE_VSCCD','PREVIEW_CODE_LB_127'];
const EXPIRIES=CODES.map(key=>key+'_EXPIRES_AT');
const TTL=900000,WINDOW=900000,encoder=new TextEncoder();
const hex=bytes=>Array.from(new Uint8Array(bytes),n=>n.toString(16).padStart(2,'0')).join('');
const sha=async text=>hex(await crypto.subtle.digest('SHA-256',encoder.encode(text)));
const expiry=(env,id)=>Date.parse(env[EXPIRIES[IDS.indexOf(id)]]);
const version=(env,id)=>sha(env.PREVIEW_SESSION_SECRET+'\0'+id+'\0'+env[CODES[IDS.indexOf(id)]]+'\0'+expiry(env,id));
const equal=(a,b)=>{let difference=a.length^b.length;for(let i=0;i<Math.max(a.length,b.length);i++)difference|=(a.charCodeAt(i)||0)^(b.charCodeAt(i)||0);return difference===0;};
function configured(env){return env.PRIVATE_PREVIEWS?.get&&env.PREVIEW_DB?.prepare&&env.PREVIEW_DB?.batch&&typeof env.PREVIEW_SESSION_SECRET==='string'&&env.PREVIEW_SESSION_SECRET.length>=32&&CODES.every(key=>typeof env[key]==='string'&&/^\d{6}$/.test(env[key]))&&EXPIRIES.every(key=>typeof env[key]==='string'&&/^\d{4}-\d\d-\d\dT/.test(env[key])&&Number.isFinite(Date.parse(env[key])));}
function headers(extra={}){return {'Cache-Control':'no-store, private','Pragma':'no-cache','Vary':'Cookie','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer',...extra};}
const json=(status,value,extra={})=>new Response(JSON.stringify(value),{status,headers:headers({'Content-Type':'application/json; charset=utf-8',...extra})});
function tokenFor(request,id){const name='__Host-preview-'+id+'=';return(request.headers.get('Cookie')||'').split(';').map(v=>v.trim()).find(v=>v.startsWith(name))?.slice(name.length)||'';}
const cookie=(id,token,maxAge=900)=>`__Host-preview-${id}=${token}; Path=/; Max-Age=${maxAge}; HttpOnly; Secure; SameSite=Strict`;
function sameOrigin(request,url){return request.headers.get('Origin')===url.origin&&(!request.headers.get('Sec-Fetch-Site')||request.headers.get('Sec-Fetch-Site')==='same-origin');}
async function session(request,env,id,now){const token=tokenFor(request,id);if(!/^[a-f0-9]{64}$/.test(token))return null;const current=await version(env,id);await env.PREVIEW_DB.prepare('DELETE FROM preview_sessions WHERE project_id = ? AND (credential_version <> ? OR expires_at <= ?)').bind(id,current,now).run();return env.PREVIEW_DB.prepare('SELECT expires_at FROM preview_sessions WHERE token_hash = ? AND project_id = ? AND expires_at > ? AND credential_version = ?').bind(await sha(token),id,now,current).first();}
async function rateLimit(request,env,id,now){
 const ip=request.headers.get('CF-Connecting-IP');if(!ip)throw Error('unavailable');
 const key=await crypto.subtle.importKey('raw',encoder.encode(env.PREVIEW_SESSION_SECRET),{name:'HMAC',hash:'SHA-256'},false,['sign']);
 const identity=hex(await crypto.subtle.sign('HMAC',key,encoder.encode(ip))),window=Math.floor(now/WINDOW);
 const sql='INSERT INTO preview_attempts (scope, window_id, attempts) VALUES (?, ?, 1) ON CONFLICT(scope, window_id) DO UPDATE SET attempts = attempts + 1 RETURNING attempts';
 const results=await env.PREVIEW_DB.batch([
  env.PREVIEW_DB.prepare(sql).bind('ip:'+id+':'+identity,window),
  env.PREVIEW_DB.prepare(sql).bind('global',window),
  env.PREVIEW_DB.prepare('DELETE FROM preview_attempts WHERE window_id < ?').bind(window-1),
  env.PREVIEW_DB.prepare('DELETE FROM preview_sessions WHERE expires_at <= ?').bind(now)
 ]);
 if(!results[0]?.results?.[0]||!results[1]?.results?.[0])throw Error('unavailable');
 return results[0].results[0].attempts<=5&&results[1].results[0].attempts<=20;
}
async function body(request){
 if(!request.headers.get('Content-Type')?.toLowerCase().startsWith('application/json'))throw Error('bad_request');
 if(Number(request.headers.get('Content-Length')||0)>1024)throw Error('bad_request');
 if(!request.body)return{};const reader=request.body.getReader();let bytes=0,chunks=[];
 try{while(true){const {done,value}=await reader.read();if(done)break;bytes+=value.length;if(bytes>1024){await reader.cancel();throw Error('bad_request');}chunks.push(value);}}finally{reader.releaseLock();}
 const joined=new Uint8Array(bytes);let offset=0;for(const chunk of chunks){joined.set(chunk,offset);offset+=chunk.length;}return JSON.parse(new TextDecoder().decode(joined));
}
async function payload(env,id){const object=await env.PRIVATE_PREVIEWS.get('previews/'+id+'/content.json');if(!object)throw Error('unavailable');const data=await object.json();if(data?.id!==id||data.schema!==1)throw Error('unavailable');return data;}
function content(data,id,lang,expiresAt){
 if(data.authored!==true)return {id,expiresAt,authored:false,fields:{descKey:'otp_preview_content_unavailable',resultsKeys:[],link:null,video:null},strings:{}};
 const strings={};if(data.authored===true)for(const key of KEYS){const value=data.i18n?.[lang]?.[key];if(typeof value==='string'&&value.length<=12000)strings[key]=value;}
 const fields={};for(const key of ['descKey','conceptKey','challengeKey','approachKey','highlightKey'])if(typeof data.fields?.[key]==='string'&&(KEYS.includes(data.fields[key])||data.fields[key]==='otp_preview_content_unavailable'))fields[key]=data.fields[key];
 fields.resultsKeys=(data.fields?.resultsKeys||[]).filter(key=>KEYS.includes(key)).slice(0,10);fields.link=null;fields.video=null;
 if(data.media?.['video-preview.mp4']&&data.media?.['video-detail.mp4'])fields.video='/api/previews/'+id+'/media/video.mp4';
 if(data.media?.background)fields.bgImage='/api/previews/'+id+'/media/background';
 if(data.authored!==true)fields.descKey='otp_preview_content_unavailable';
 return {id,expiresAt,authored:data.authored===true,fields,strings};
}
async function handle(request,env){
 const url=new URL(request.url),parts=url.pathname.split('/').filter(Boolean);
 if(parts[0]!=='api'||parts[1]!=='previews'){
  if(/^\/(?:_worker\.js|server(?:\/|$)|tools(?:\/|$)|\.private|private-upload)/.test(url.pathname))return new Response('Not found',{status:404});
  return env.ASSETS?env.ASSETS.fetch(request):new Response('Unavailable',{status:503});
 }
 const id=parts[2],action=parts[3];if(!IDS.includes(id))return json(404,{error:'not_found'});
 if(!configured(env))return json(503,{error:'unavailable'});
 const now=Date.now();
 if(action==='unlock'&&parts.length===4){
  if(request.method!=='POST')return json(405,{error:'method_not_allowed'});
  if(!sameOrigin(request,url))return json(403,{error:'forbidden'});
  const deadline=expiry(env,id);if(deadline<=now||deadline>now+1800000)return json(503,{error:'unavailable'});
  let value;try{value=await body(request);}catch(_){return json(400,{error:'bad_request'});}
  if(typeof value.code!=='string'||!/^\d{6}$/.test(value.code))return json(400,{error:'bad_request'});
  if(!await rateLimit(request,env,id,now))return json(429,{error:'rate_limited'},{'Retry-After':'900'});
  if(!equal(await sha(value.code),await sha(env[CODES[IDS.indexOf(id)]])))return json(401,{error:'unauthorized'});
  // Confirm private storage exists before granting an access session.
  await payload(env,id);
  const token=hex(crypto.getRandomValues(new Uint8Array(32))),expiresAt=Math.min(now+TTL,deadline),current=await version(env,id);
  await env.PREVIEW_DB.prepare('DELETE FROM preview_sessions WHERE project_id = ? AND credential_version <> ?').bind(id,current).run();
  await env.PREVIEW_DB.prepare('INSERT INTO preview_sessions (token_hash, project_id, expires_at, credential_version) VALUES (?, ?, ?, ?)').bind(await sha(token),id,expiresAt,current).run();
  return json(200,{ok:true,expiresAt},{'Set-Cookie':cookie(id,token,Math.max(0,Math.floor((expiresAt-now)/1000)))});
 }
 if(action==='logout'&&parts.length===4){
  if(request.method!=='POST')return json(405,{error:'method_not_allowed'});if(!sameOrigin(request,url))return json(403,{error:'forbidden'});
  const token=tokenFor(request,id);if(token)await env.PREVIEW_DB.prepare('DELETE FROM preview_sessions WHERE token_hash = ? AND project_id = ?').bind(await sha(token),id).run();
  return json(200,{ok:true},{'Set-Cookie':cookie(id,'',0)});
 }
 if(!['GET','HEAD'].includes(request.method))return json(405,{error:'method_not_allowed'});
 const authorized=await session(request,env,id,now);if(!authorized)return json(401,{error:'unauthorized'});
 const data=await payload(env,id);
 if(action==='content'&&parts.length===4){const lang=url.searchParams.get('lang')==='ar'?'ar':'en';return json(200,content(data,id,lang,authorized.expires_at));}
 if(action==='media'&&parts.length===5){
  if(data.authored!==true)return json(404,{error:'not_found'});
  const key=data.media?.[parts[4]];if(typeof key!=='string'||!key.startsWith('previews/'+id+'/media/')||key.includes('..'))return json(404,{error:'not_found'});
  let range=null,metadata=null;const rangeHeader=request.method==='GET'?request.headers.get('Range'):null;
  if(rangeHeader||request.method==='HEAD'){
   metadata=await env.PRIVATE_PREVIEWS.head(key);if(!metadata)return json(404,{error:'not_found'});
   if(rangeHeader){
    const match=/^bytes=(\d*)-(\d*)$/.exec(rangeHeader);let offset=0,end=metadata.size-1,valid=!!match&&(!!match[1]||!!match[2])&&metadata.size>0;
    if(valid){if(match[1]){offset=Number(match[1]);if(match[2])end=Math.min(Number(match[2]),end);}else{const suffix=Number(match[2]);offset=Math.max(0,metadata.size-suffix);valid=suffix>0;}valid=valid&&Number.isSafeInteger(offset)&&Number.isSafeInteger(end)&&offset<=end&&offset<metadata.size;}
    if(!valid)return json(416,{error:'range_not_satisfiable'},{'Content-Range':'bytes */'+metadata.size});
    range={offset,length:end-offset+1};
   }
  }
  const object=request.method==='HEAD'?metadata:await env.PRIVATE_PREVIEWS.get(key,range?{range}:undefined);if(!object)return json(404,{error:'not_found'});
  const responseHeaders=new Headers(headers({'Content-Type':object.httpMetadata?.contentType||'application/octet-stream','Accept-Ranges':'bytes'}));
  let status=200;if(range){status=206;responseHeaders.set('Content-Range',`bytes ${range.offset}-${range.offset+range.length-1}/${object.size}`);responseHeaders.set('Content-Length',String(range.length));}else responseHeaders.set('Content-Length',String(object.size));
  return new Response(request.method==='HEAD'?null:object.body,{status,headers:responseHeaders});
 }
 return json(404,{error:'not_found'});
}
export default {async fetch(request,env){let response;try{response=await handle(request,env);}catch(_){response=json(503,{error:'unavailable'});}if(request.method==='HEAD'){response.body?.cancel().catch(()=>{});return new Response(null,{status:response.status,statusText:response.statusText,headers:response.headers});}return response;}};
