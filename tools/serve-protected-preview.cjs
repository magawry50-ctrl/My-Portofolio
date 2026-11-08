/* Native local review: the actual Worker owns API paths; unset real bindings intentionally return 503. */
const http=require('node:http'),path=require('node:path'),fs=require('node:fs'),{pathToFileURL}=require('node:url');
const {createPortfolioServer}=require('./serve-portfolio.cjs');
(async()=>{
 const worker=(await import(pathToFileURL(path.resolve(__dirname,'../server/private-preview-worker.mjs')).href)).default;
 const workspace=path.resolve(__dirname,'..'),root=path.resolve(workspace,process.argv[3]||'.');if(![workspace,path.join(workspace,'dist')].includes(root))throw Error('Preview root must be workspace or verified dist');
 if(root!==workspace){const manifest=JSON.parse(fs.readFileSync(path.join(root,'build-manifest.json')));if(manifest.owner!=='portfolio-production-build-v1'||!fs.readFileSync(path.join(root,'_worker.js')).equals(fs.readFileSync(path.join(workspace,'server/private-preview-worker.mjs'))))throw Error('Verified output Worker mismatch');}
 const staticServer=createPortfolioServer({root}),port=Number(process.argv[2]||4178);if(!Number.isInteger(port)||port<1||port>65535)throw Error('Invalid preview port');
 const server=http.createServer(async(req,res)=>{
  if(/^\/(?:_worker\.js|_routes\.json|_headers|_redirects)(?:[?#]|$)/.test(req.url)){res.writeHead(404);res.end();return;}
  if(!req.url.startsWith('/api/')){staticServer.emit('request',req,res);return;}
  try{
   const request=new Request('http://127.0.0.1:'+port+req.url,{method:req.method,headers:req.headers,body:['GET','HEAD'].includes(req.method)?undefined:req,duplex:'half'});
   const response=await worker.fetch(request,{});res.writeHead(response.status,Object.fromEntries(response.headers));res.end(req.method==='HEAD'?undefined:Buffer.from(await response.arrayBuffer()));
  }catch(_){res.writeHead(503,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end('{"error":"unavailable"}');}
 });
 server.on('error',error=>{console.error(error.message);process.exitCode=1;});server.listen(port,'127.0.0.1',()=>console.log('Protected-boundary preview http://127.0.0.1:'+port+' (bindings unset; private endpoints safely unavailable)'));
})().catch(error=>{console.error(error.message);process.exitCode=1;});
