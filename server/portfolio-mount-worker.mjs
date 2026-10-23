/* Exact path mount. The company origin remains the authority outside these two boundaries. */
import privatePreviews from './private-preview-worker.mjs';
export const MOUNT='/mhalmaghawry';
const security={'X-Content-Type-Options':'nosniff','Referrer-Policy':'strict-origin-when-cross-origin','X-Frame-Options':'SAMEORIGIN','Permissions-Policy':'camera=(), microphone=(), geolocation=()'};
const privateMedia=/^\/api\/previews\/(?:classified-vault|vsccd|lb-127)\/media\/[a-zA-Z0-9._-]+$/;
export function createMountedPortfolio({assetPaths,fetchOrigin=request=>fetch(request),allowedHosts=['pinexen.com','www.pinexen.com']}){
 const paths=new Set(assetPaths);
 const hosts=new Set(allowedHosts);
 async function asset(request,env,path,status){
  if(!env.ASSETS?.fetch)return new Response('Unavailable',{status:503,headers:{...security,'Cache-Control':'no-store'}});
  const url=new URL(request.url);url.pathname='/'+path;
  const result=await env.ASSETS.fetch(new Request(url,request));
  const headers=new Headers(result.headers);Object.entries(security).forEach(([k,v])=>headers.set(k,v));
  headers.set('Cache-Control',/^assets\/tailwind-[^/]+\.[a-f0-9]+\.css$/.test(path)?'public, max-age=31536000, immutable':'public, max-age=0, must-revalidate');
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
