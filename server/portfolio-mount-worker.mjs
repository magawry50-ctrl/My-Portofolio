/* Exact path mount. The company origin remains the authority outside these two boundaries. */
import privatePreviews from './private-preview-worker.mjs';
export const MOUNT='/mhalmaghawry';
const security={'X-Content-Type-Options':'nosniff','Referrer-Policy':'strict-origin-when-cross-origin','X-Frame-Options':'SAMEORIGIN','Permissions-Policy':'camera=(), microphone=(), geolocation=()'};
const privateMedia=/^\/api\/previews\/(?:classified-vault|vsccd|lb-127)\/media\/[a-zA-Z0-9._-]+$/;
const cancel=body=>body?.cancel().catch(()=>{});
function matchesIfRange(value,headers){
 if(!value)return true;
 if(value.startsWith('"'))return value===headers.get('ETag')&&!headers.get('ETag')?.startsWith('W/');
 if(value.startsWith('W/'))return false;
 const modified=headers.get('Last-Modified');return !!modified&&Number.isFinite(Date.parse(value))&&Date.parse(value)===Date.parse(modified);
}
function fixedLength(body,length){
 if(typeof FixedLengthStream==='undefined')return body;
 const fixed=new FixedLengthStream(length);body.pipeTo(fixed.writable).catch(()=>{});return fixed.readable;
}
function sliceStream(body,from,to){
 const reader=body.getReader();let position=0,finished=false;
 return new ReadableStream({async pull(controller){try{
  while(!finished){const {done,value}=await reader.read();if(done){finished=true;controller.error(new Error('Asset stream ended before declared range'));return;}
   const begin=Math.max(0,from-position),end=Math.min(value.byteLength,to+1-position);position+=value.byteLength;
   if(end>begin)controller.enqueue(value.subarray(begin,end));
   if(position>to){finished=true;controller.close();reader.cancel().catch(()=>{});return;}
   if(end>begin)return;
  }
 }catch(error){finished=true;controller.error(error);}},cancel(reason){finished=true;return reader.cancel(reason);}});
}
export function createMountedPortfolio({assetPaths,assetSizes={},fetchOrigin=request=>fetch(request),allowedHosts=['pinexen.com','www.pinexen.com']}){
 const paths=new Set(assetPaths);
 const hosts=new Set(allowedHosts);
 async function asset(request,env,path,status){
  if(!env.ASSETS?.fetch)return new Response('Unavailable',{status:503,headers:{...security,'Cache-Control':'no-store'}});
  const url=new URL(request.url);url.pathname='/'+path;
  const upstreamHeaders=new Headers(request.headers),range=request.method==='GET'&&status===undefined?request.headers.get('Range'):null;
  if(range)upstreamHeaders.set('Accept-Encoding','identity');
  let result=await env.ASSETS.fetch(new Request(url,{method:request.method,headers:upstreamHeaders,signal:request.signal}));
  if(range&&result.status===206&&!matchesIfRange(request.headers.get('If-Range'),result.headers)){
   cancel(result.body);upstreamHeaders.delete('Range');upstreamHeaders.delete('If-Range');result=await env.ASSETS.fetch(new Request(url,{headers:upstreamHeaders,signal:request.signal}));
  }
  const headers=new Headers(result.headers);Object.entries(security).forEach(([k,v])=>headers.set(k,v));
  headers.set('Cache-Control',/^assets\/tailwind-[^/]+\.[a-f0-9]+\.css$/.test(path)?'public, max-age=31536000, immutable':'public, max-age=0, must-revalidate');
  const unencoded=!headers.has('Content-Encoding')||headers.get('Content-Encoding')==='identity';
  const declared=headers.get('Content-Length'),size=Number.isSafeInteger(assetSizes[path])?assetSizes[path]:/^\d+$/.test(declared||'')?Number(declared):null;
  const known=unencoded&&Number.isSafeInteger(size)&&size>=0;
  if(result.status===200&&known){
   headers.set('Accept-Ranges','bytes');headers.set('Content-Length',String(size));
   if(range&&matchesIfRange(request.headers.get('If-Range'),headers)&&range.startsWith('bytes=')&&!range.includes(',')){
    const match=/^bytes=(\d*)-(\d*)$/.exec(range);let from=0,to=size-1,valid=!!match&&(!!match[1]||!!match[2])&&size>0;
    if(valid){if(match[1]){from=Number(match[1]);if(match[2])to=Math.min(Number(match[2]),to);}else{const suffix=Number(match[2]);from=Math.max(0,size-suffix);valid=suffix>0;}valid=valid&&Number.isSafeInteger(from)&&Number.isSafeInteger(to)&&from<=to&&from<size;}
    if(!valid){cancel(result.body);headers.set('Content-Range','bytes */'+size);headers.set('Content-Length','0');return new Response(new Uint8Array(0),{status:416,headers});}
    const length=to-from+1;headers.set('Content-Range',`bytes ${from}-${to}/${size}`);headers.set('Content-Length',String(length));headers.delete('Transfer-Encoding');
    return new Response(fixedLength(sliceStream(result.body,from,to),length),{status:206,headers});
   }
  }
  if(request.method==='HEAD')cancel(result.body);
  if(result.status===200&&known&&request.method==='GET'&&/\.(?:mp4|webm)$/.test(path))return new Response(fixedLength(result.body,size),{status:status??result.status,headers});
  return new Response(request.method==='HEAD'?null:result.body,{status:status??result.status,headers});
 }
 return {async fetch(request,env,ctx){
  const url=new URL(request.url),pathname=url.pathname;
  if(!hosts.has(url.hostname))return fetchOrigin(request);
  if((url.hostname==='www.pinexen.com'||url.hostname==='pinexen.com'&&url.protocol!=='https:')&&(pathname==='/founder'||pathname==='/founder/'||pathname===MOUNT||pathname.startsWith(MOUNT+'/'))){
   url.protocol='https:';url.hostname='pinexen.com';url.port='';
   if(pathname==='/founder'||pathname==='/founder/'||pathname===MOUNT||pathname===MOUNT+'/index.html')url.pathname=MOUNT+'/';
   return new Response(null,{status:308,headers:{...security,Location:url.href,'Cache-Control':'no-store'}});
  }
  if(pathname==='/founder'||pathname==='/founder/'||pathname===MOUNT){
   url.pathname=MOUNT+'/';return new Response(null,{status:308,headers:{...security,Location:url.href,'Cache-Control':'no-store'}});
  }
  if(!pathname.startsWith(MOUNT+'/'))return fetchOrigin(request);
  const relative=pathname.slice(MOUNT.length+1);
  // Refuse encoded separators/dot segments instead of allowing the asset binding to normalize them.
  if(/%|\\|\/\//.test(relative)||relative.split('/').some(part=>part==='.'||part==='..'))return new Response('Not found',{status:404,headers:security});
  if(relative.startsWith('api/previews/')){
   const internal=new URL(url);internal.pathname='/'+relative;
   const result=await privatePreviews.fetch(new Request(internal,request),env,ctx);
   if(request.method==='HEAD'||!/^api\/previews\/(?:classified-vault|vsccd|lb-127)\/content$/.test(relative)||!result.ok)return result;
   const data=await result.json();
   for(const key of ['video','bgImage'])if(typeof data.fields?.[key]==='string'&&privateMedia.test(data.fields[key]))data.fields[key]=MOUNT+data.fields[key];
   return new Response(JSON.stringify(data),{status:result.status,headers:result.headers});
  }
  if(!['GET','HEAD'].includes(request.method))return new Response('Method not allowed',{status:405,headers:{...security,Allow:'GET, HEAD'}});
  if(relative==='index.html'){url.pathname=MOUNT+'/';return new Response(null,{status:308,headers:{...security,Location:url.href,'Cache-Control':'no-store'}});}
  const file=relative||'index.html';
  return paths.has(file)?asset(request,env,file):asset(request,env,'404.html',404);
 }};
}
