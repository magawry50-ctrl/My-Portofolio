/* Local HTTP adapter for the actual mounted Worker; no Cloudflare credentials or remote actions. */
const http=require('node:http'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),{pathToFileURL}=require('node:url');
const {createPortfolioServer}=require('./serve-portfolio.cjs');
async function createCloudflarePreview({port=4180,env={}}={}){
 const directory=path.resolve(__dirname,'../cloudflare'),manifest=JSON.parse(fs.readFileSync(path.join(directory,'bundle-manifest.json')));
 if(manifest.owner!=='portfolio-cloudflare-mount-v1')throw Error('Unverified mounted output');
 for(const record of manifest.files)if(crypto.createHash('sha256').update(fs.readFileSync(path.join(directory,record.path))).digest('hex')!==record.sha256)throw Error('Mounted output hash mismatch');
 const {assetPaths,assetSizes}=await import(pathToFileURL(path.join(directory,'worker.mjs')).href);
 const {createMountedPortfolio}=await import(pathToFileURL(path.join(directory,'mount-worker.mjs')).href);
 const assetServer=createPortfolioServer({root:path.join(directory,'public')});await new Promise(resolve=>assetServer.listen(0,'127.0.0.1',resolve));
 const assetPort=assetServer.address().port;
 const worker=createMountedPortfolio({assetPaths,assetSizes,allowedHosts:['pinexen.com','www.pinexen.com','127.0.0.1'],fetchOrigin:()=>new Response('Company origin passthrough (local preview)',{status:404,headers:{'X-Local-Origin-Passthrough':'true'}})});
 const binding={fetch:request=>{const target=new URL(request.url);target.host='127.0.0.1:'+assetPort;target.protocol='http:';const headers=new Headers(request.headers);headers.set('Accept-Encoding','identity');return fetch(new Request(target,{method:request.method,headers}));}};
 const server=http.createServer(async(req,res)=>{try{
  const request=new Request('http://'+req.headers.host+req.url,{method:req.method,headers:req.headers,body:['GET','HEAD'].includes(req.method)?undefined:req,duplex:'half'});
  const response=await worker.fetch(request,{...env,ASSETS:binding});
  res.writeHead(response.status,Object.fromEntries(response.headers));res.end(req.method==='HEAD'?undefined:Buffer.from(await response.arrayBuffer()));
 }catch(_){res.writeHead(503,{'Cache-Control':'no-store'});res.end('Unavailable');}});
 await new Promise(resolve=>server.listen(port,'127.0.0.1',resolve));
 return {server,assetServer,url:'http://127.0.0.1:'+server.address().port,async close(){await Promise.all([new Promise(resolve=>server.close(resolve)),new Promise(resolve=>assetServer.close(resolve))]);}};
}
module.exports={createCloudflarePreview};if(require.main===module)createCloudflarePreview({port:Number(process.argv[2]||4180)}).then(({url})=>console.log('Mounted Worker preview '+url+'/mhalmaghawry/ (private bindings unset; company routes pass through to a local 404 marker)')).catch(error=>{console.error(error.message);process.exitCode=1;});
