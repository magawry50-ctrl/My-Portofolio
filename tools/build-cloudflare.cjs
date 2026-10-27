/* Isolated Workers Assets package; the existing root preview/build remains a separate target. */
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {buildProduction}=require('./build-production.cjs');
const root=path.resolve(__dirname,'..'),output=path.join(root,'cloudflare'),hash=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
const mount='/mhalmaghawry/',canonical='https://pinexen.com'+mount;
function transform(file,bytes){
 let text=bytes.toString('utf8');
 if(file==='index.html'){
  text=text.replace(/https:\/\/almaghawry\.com\//g,canonical).replace(/@MoAlMaghawry/g,'@mhalmaghawry');
  text=text.replace(/(<meta (?:property="og:image"|name="twitter:image") content=")\/og-image\.png(\?[^" ]*)?"/g,(_,prefix,query='')=>prefix+canonical+'og-image.png'+query+'"');
  if(/rel="canonical"/.test(text))throw Error('Unexpected source canonical; review mounted metadata');
  text=text.replace('</title>','</title>\n    <link rel="canonical" href="'+canonical+'">');
 }else if(file==='404.html'){
  text=text.replace(/(href|src)="(?:\.\/|\/)(?!\/)([^"]*)"/g,(_,attribute,value)=>attribute+'="'+mount+value+'"');
 }else if(file==='site.webmanifest'){
  const manifest=JSON.parse(text);manifest.id=mount;manifest.scope=mount;manifest.start_url=mount;
  for(const icon of manifest.icons)icon.src=mount+icon.src.replace(/^\//,'');
  text=JSON.stringify(manifest,null,2)+'\n';
 }else if(file==='sitemap.xml')text=text.replace(/https:\/\/almaghawry\.com\//g,canonical).replace(/\s*<!-- Update this URL[^>]*-->/,'');
 return Buffer.from(text);
}
function inventory(directory){const files=[];if(!fs.existsSync(directory))return files;for(const entry of fs.readdirSync(directory,{withFileTypes:true})){const target=path.join(directory,entry.name);if(entry.isSymbolicLink())throw Error('Linked Cloudflare output is not allowed');if(entry.isDirectory())files.push(...inventory(target));else files.push(target);}return files;}
function writeOwned(files){
 if(output!==path.join(root,'cloudflare'))throw Error('Unsafe Cloudflare output');
 const ownedPath=relative=>{const target=path.resolve(output,relative);if(typeof relative!=='string'||relative.split(/[\\/]/).includes('..')||!target.startsWith(output+path.sep))throw Error('Unsafe Cloudflare path');return target;};
 const manifestPath=path.join(output,'bundle-manifest.json');
 const previous=fs.existsSync(manifestPath)?JSON.parse(fs.readFileSync(manifestPath)):null;
 if(previous&&previous.owner!=='portfolio-cloudflare-mount-v1')throw Error('Unowned Cloudflare output');
 for(const record of previous?.files||[])ownedPath(record.path);
 const known=new Map((previous?.files||[]).map(record=>[record.path,record]));
 for(const target of inventory(output)){
  const relative=path.relative(output,target).replace(/\\/g,'/');if(relative==='bundle-manifest.json'&&previous)continue;
  if(!known.has(relative)||hash(fs.readFileSync(target))!==known.get(relative).sha256)throw Error('Unapproved/modified Cloudflare output; refusing overwrite');
 }
 for(const relative of known.keys())if(!files.has(relative))fs.unlinkSync(ownedPath(relative));
 for(const[relative,bytes]of files){const target=ownedPath(relative);fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,bytes);}
 const records=[...files].map(([file,bytes])=>({path:file,bytes:bytes.length,sha256:hash(bytes)})).sort((a,b)=>a.path.localeCompare(b.path));
 const manifest={owner:'portfolio-cloudflare-mount-v1',canonical,files:records};fs.writeFileSync(manifestPath,JSON.stringify(manifest,null,2)+'\n');
 const actual=inventory(output).map(file=>path.relative(output,file).replace(/\\/g,'/')).sort();
 if(JSON.stringify(actual)!==JSON.stringify(['bundle-manifest.json',...files.keys()].sort()))throw Error('Cloudflare output tree mismatch');
 return manifest;
}
async function buildCloudflare(){
 await buildProduction();
 const source=JSON.parse(fs.readFileSync(path.join(root,'dist/build-manifest.json'))),files=new Map(),assets=[];
 const excluded=new Set(['_worker.js','_routes.json','_headers','_redirects','robots.txt']);
 for(const record of source.files){if(excluded.has(record.path))continue;
  const bytes=fs.readFileSync(path.join(root,'dist',record.path));if(hash(bytes)!==record.sha256)throw Error('Root build bytes changed');
  files.set('public/'+record.path,['index.html','404.html','site.webmanifest','sitemap.xml'].includes(record.path)?transform(record.path,bytes):bytes);assets.push(record.path);
 }
 const sizes=Object.fromEntries(assets.map(file=>[file,files.get('public/'+file).length]));
 const entry="import {createMountedPortfolio} from './mount-worker.mjs';\nexport const assetPaths="+JSON.stringify(assets.sort())+";\nexport const assetSizes="+JSON.stringify(sizes)+";\nexport default createMountedPortfolio({assetPaths,assetSizes});\n";
 files.set('worker.mjs',Buffer.from(entry));
 files.set('mount-worker.mjs',fs.readFileSync(path.join(root,'server/portfolio-mount-worker.mjs')));
 files.set('private-preview-worker.mjs',fs.readFileSync(path.join(root,'server/private-preview-worker.mjs')));
 files.set('wrangler.jsonc',Buffer.from(JSON.stringify({name:'pinexen-portfolio',account_id:'c02a47d974d1e7155c844a9ebd50cc78',main:'worker.mjs',compatibility_date:'2026-10-23',workers_dev:false,preview_urls:false,assets:{directory:'./public',binding:'ASSETS',run_worker_first:true,html_handling:'none',not_found_handling:'none'},routes:['pinexen.com','www.pinexen.com'].flatMap(host=>['mhalmaghawry','founder'].map(segment=>({pattern:host+'/'+segment+'*',zone_id:'386ffc51918789b1b3f013d85f4c02f1'})))},null,2)+'\n'));
 require('./check-private-release.cjs').scanPrivateRelease(files);
 for(const bytes of files.values())if(bytes.length>25*1024*1024)throw Error('Cloudflare file exceeds 25 MiB');
 const manifest=writeOwned(files);return {assets:assets.length,bundleFiles:manifest.files.length,bytes:manifest.files.reduce((sum,file)=>sum+file.bytes,0),manifestSHA256:hash(fs.readFileSync(path.join(output,'bundle-manifest.json'))),canonical};
}
module.exports={buildCloudflare,transform,output};if(require.main===module)buildCloudflare().then(report=>console.log(JSON.stringify(report))).catch(error=>{console.error(error.message);process.exitCode=1;});
