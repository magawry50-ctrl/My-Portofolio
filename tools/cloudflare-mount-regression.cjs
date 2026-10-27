/* Actual mounted owner over HTTP + real SQLite. All configured content/access values below are synthetic. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),http=require('node:http'),vm=require('node:vm'),{DatabaseSync}=require('node:sqlite');
const {createCloudflarePreview}=require('./serve-cloudflare-preview.cjs');
const hash=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
async function main(){
 const manifest=JSON.parse(fs.readFileSync('cloudflare/bundle-manifest.json')),publicFiles=manifest.files.filter(record=>record.path.startsWith('public/'));
 assert.deepEqual(fs.readFileSync('cloudflare/bundle-manifest.json'),fs.readFileSync('docs/cloudflare-release-baseline.json'),'Mounted bundle equals reviewed baseline');
 assert(fs.readFileSync('cloudflare/private-preview-worker.mjs').equals(fs.readFileSync('server/private-preview-worker.mjs')),'Protected handler byte identity');
 const config=JSON.parse(fs.readFileSync('cloudflare/wrangler.jsonc'));assert.equal(config.assets.run_worker_first,true);assert.equal(config.assets.html_handling,'none');assert.equal(config.assets.not_found_handling,'none');assert.equal(config.workers_dev,false);
 assert.deepEqual(config.routes.map(route=>route.pattern),['pinexen.com/mhalmaghawry*','pinexen.com/founder*','www.pinexen.com/mhalmaghawry*','www.pinexen.com/founder*']);
 assert(!publicFiles.some(record=>/^public\/(?:_worker.js|_routes.json|_headers|_redirects|build-manifest.json|robots.txt|server|tools|docs|08_ARCHIVES)(?:\/|$)/.test(record.path)),'Asset binding contains no control/source/docs/company robots');
 const {createMountedPortfolio}=await import('../cloudflare/mount-worker.mjs');
 const edge=createMountedPortfolio({assetPaths:publicFiles.map(record=>record.path.slice(7)),fetchOrigin:()=>new Response('origin',{status:202})});
 const edgeEnv={ASSETS:{fetch:()=>new Response('asset')}};
 assert.equal((await edge.fetch(new Request('https://pinexen.com/mhalmaghawry/'),edgeEnv)).status,200,'Canonical HTTPS apex serves rather than redirect-looping');
 for(const host of ['pinexen.com','www.pinexen.com'])for(const pathname of ['/','/company','/founder-other','/mhalmaghawry-other'])assert.equal((await edge.fetch(new Request('http://'+host+pathname),edgeEnv)).status,202,'HTTP company/lookalike paths remain origin-owned');
 assert.equal((await edge.fetch(new Request('https://www.pinexen.com/mhalmaghawry/?lang=ar'),edgeEnv)).headers.get('Location'),'https://pinexen.com/mhalmaghawry/?lang=ar');
 const virtualSize=20*1024*1024,mediaFile='assets/videos/virtual-detail.mp4',modified='Wed, 21 Oct 2015 07:28:00 GMT';
 const mediaOwner=createMountedPortfolio({assetPaths:[mediaFile],assetSizes:{[mediaFile]:virtualSize}});
 const nativeFixed=globalThis.FixedLengthStream,fixedLengths=[];
 globalThis.FixedLengthStream=class{constructor(length){fixedLengths.push(length);let bytes=0;const stream=new TransformStream({transform(chunk,controller){bytes+=chunk.byteLength;assert(bytes<=length);controller.enqueue(chunk);},flush(){assert.equal(bytes,length);}});this.readable=stream.readable;this.writable=stream.writable;}};
 try{
  async function ignoringRange(range,ifRange,method='GET'){
   let produced=0,cancelled=false,calls=0;
   const binding={fetch:async()=>{calls++;let offset=0;return new Response(new ReadableStream({pull(controller){if(offset>=virtualSize){controller.close();return;}const bytes=Math.min(65536,virtualSize-offset),chunk=new Uint8Array(bytes);for(let n=0;n<bytes;n++)chunk[n]=(offset+n)%256;offset+=bytes;produced+=bytes;controller.enqueue(chunk);},cancel(){cancelled=true;}}),{headers:{'Content-Type':'video/mp4',ETag:'"synthetic-media"','Last-Modified':modified}});}};
   const headers={};if(range)headers.Range=range;if(ifRange)headers['If-Range']=ifRange;
   const response=await mediaOwner.fetch(new Request('https://pinexen.com/mhalmaghawry/'+mediaFile,{method,headers}),{ASSETS:binding});
   return {response,stats:()=>({produced,cancelled,calls})};
  }
  let sample=await ignoringRange('bytes=1-9');assert.equal(sample.response.status,206);assert.equal(sample.response.headers.get('Content-Range'),'bytes 1-9/'+virtualSize);assert.equal(sample.response.headers.get('Content-Length'),'9');assert.equal(sample.response.headers.get('ETag'),'"synthetic-media"');assert.match(sample.response.headers.get('Cache-Control'),/max-age=0/);assert.deepEqual([...new Uint8Array(await sample.response.arrayBuffer())],[1,2,3,4,5,6,7,8,9]);assert(sample.stats().cancelled);assert(sample.stats().produced<=131072,'Small early range never drains/buffers the20MiB source');
  for(const range of ['bytes=999999999-','bytes=-0','bytes=9-1']){sample=await ignoringRange(range);assert.equal(sample.response.status,416);assert.equal(sample.response.headers.get('Content-Range'),'bytes */'+virtualSize);assert.equal((await sample.response.arrayBuffer()).byteLength,0);assert(sample.stats().cancelled);assert(sample.stats().produced<=65536);}
  sample=await ignoringRange('bytes=-4');assert.equal(sample.response.status,206);assert.deepEqual([...new Uint8Array(await sample.response.arrayBuffer())],[252,253,254,255]);
  for(const validator of ['"synthetic-media"',modified]){sample=await ignoringRange('bytes=20-22',validator);assert.equal(sample.response.status,206);assert.deepEqual([...new Uint8Array(await sample.response.arrayBuffer())],[20,21,22]);}
  for(const validator of ['"other"','W/"synthetic-media"','Thu, 22 Oct 2015 07:28:00 GMT']){sample=await ignoringRange('bytes=1-9',validator);assert.equal(sample.response.status,200);assert.equal(sample.response.headers.get('Content-Range'),null);assert.equal(sample.response.headers.get('Content-Length'),String(virtualSize));await sample.response.body.cancel();}
  sample=await ignoringRange('bytes=1-9',null,'HEAD');assert.equal(sample.response.status,200);assert.equal(sample.response.body,null);assert.equal(sample.response.headers.get('Content-Length'),String(virtualSize));assert.equal(sample.response.headers.get('Accept-Ranges'),'bytes');assert(sample.stats().cancelled);
  assert(fixedLengths.includes(9)&&fixedLengths.includes(virtualSize),'Actual fallback exercises native FixedLengthStream-compatible length path');
 }finally{if(nativeFixed===undefined)delete globalThis.FixedLengthStream;else globalThis.FixedLengthStream=nativeFixed;}
 const preview=await createCloudflarePreview({port:0});
 try{
  const get=(route,options)=>fetch(preview.url+route,options);
  const atHost=(route,host)=>new Promise((resolve,reject)=>{http.get(preview.url+route,{headers:{Host:host}},message=>{const chunks=[];message.on('data',chunk=>chunks.push(chunk));message.on('end',()=>resolve(new Response(Buffer.concat(chunks),{status:message.statusCode,headers:message.headers})));}).on('error',reject);});
  for(const route of ['/mhalmaghawry','/founder','/founder/']){const r=await get(route+'?lang=ar',{redirect:'manual'});assert.equal(r.status,308);assert.equal(r.headers.get('Location'),preview.url+'/mhalmaghawry/?lang=ar');}
  for(const host of ['pinexen.com','www.pinexen.com']){
   for(const route of ['/mhalmaghawry','/founder','/founder/']){const r=await atHost(route+'?lang=ar',host);assert.equal(r.status,308);assert.equal(r.headers.get('Location'),'https://pinexen.com/mhalmaghawry/?lang=ar');}
   for(const route of ['/','/company','/mhalmaghawry-other','/founder-other']){const r=await atHost(route,host);assert.equal(r.headers.get('X-Local-Origin-Passthrough'),'true');}
  }
  for(const host of ['pinexen.com','www.pinexen.com'])for(const route of ['/mhalmaghawry/','/mhalmaghawry/assets/private-previews.js','/mhalmaghawry/missing/deep']){const r=await atHost(route+'?lang=en',host);assert.equal(r.status,308);assert.equal(r.headers.get('Location'),'https://pinexen.com'+route+'?lang=en');}
  assert.equal((await atHost('/mhalmaghawry/','unrelated.example')).headers.get('X-Local-Origin-Passthrough'),'true','Unapproved host never serves portfolio');
  const crawlerHeaders={'User-Agent':'facebookexternalhit/1.1 SHARE194-local-metadata-check'};
  let r=await get('/mhalmaghawry/?lang=en',{headers:crawlerHeaders});assert.equal(r.status,200);const html=await r.text();
  assert(html.includes('rel="canonical" href="https://pinexen.com/mhalmaghawry/"'));assert(!html.includes('almaghawry.com'));assert(!html.includes('@MoAlMaghawry'));assert(html.includes('@mhalmaghawry'));
  const metadata=markup=>Object.fromEntries([...markup.slice(0,markup.indexOf('</head>')).matchAll(/<meta\b[^>]*>/g)].map(match=>Object.fromEntries([...match[0].matchAll(/([\w:-]+)="([^"]*)"/g)].map(attr=>[attr[1],attr[2]]))).filter(attrs=>attrs.property||attrs.name).map(attrs=>[attrs.property||attrs.name,attrs.content]));
  const tags=metadata(html),shareBytes=fs.readFileSync('og-image.png'),shareVersion='194-'+hash(shareBytes).slice(0,12),shareURL='https://pinexen.com/mhalmaghawry/og-image.png?v='+shareVersion;
  const approvedDescription='Mohamed Al-Maghawry - Business & Product Developer. Bridging strategic thinking and practical innovation to build scalable systems.';
  assert.equal(tags['og:title'],'Mohamed Al-Maghawry');assert.equal(tags['twitter:title'],tags['og:title']);assert.equal(tags['og:description'],approvedDescription);assert.equal(tags['twitter:description'],approvedDescription);assert.equal(tags.description,approvedDescription);
  assert.equal(tags['og:locale'],'en_US');assert.equal(tags['og:locale:alternate'],'ar_EG');assert.equal(tags['og:image'],shareURL);assert.equal(tags['twitter:image'],shareURL);assert.equal(tags['og:image:type'],'image/png');assert(tags['og:image:alt'].includes(tags['og:title']));assert.equal(tags['twitter:image:alt'],tags['og:image:alt']);assert.equal(tags['og:image:width'],'1200');assert.equal(tags['og:image:height'],'630');assert(!html.includes('<base'));
  const arabicQueryHTML=await(await get('/mhalmaghawry/?lang=ar',{headers:crawlerHeaders})).text();assert.deepEqual(metadata(arabicQueryHTML),tags,'Static crawler metadata is deliberately English for both language queries; no JS/server localization required');
  const imageRoute=new URL(shareURL).pathname+new URL(shareURL).search;r=await get(imageRoute,{headers:crawlerHeaders});assert.equal(r.status,200);assert.match(r.headers.get('Content-Type'),/^image\/png/);const deliveredPNG=Buffer.from(await r.arrayBuffer());assert(deliveredPNG.equals(shareBytes),'Versioned crawler image body equals approved asset');assert.equal(deliveredPNG.subarray(0,8).toString('hex'),'89504e470d0a1a0a');assert.equal(deliveredPNG.readUInt32BE(16),1200);assert.equal(deliveredPNG.readUInt32BE(20),630);
  r=await get(imageRoute,{method:'HEAD',headers:crawlerHeaders});assert.equal(r.status,200);assert.match(r.headers.get('Content-Type'),/^image\/png/);assert.equal(Number(r.headers.get('Content-Length')),shareBytes.length);assert.equal((await r.arrayBuffer()).byteLength,0);
  assert.equal(metadata(fs.readFileSync('dist/index.html','utf8'))['og:image'],'/og-image.png?v='+shareVersion,'Root-mode metadata keeps its valid origin-relative image path');
  const source=fs.readFileSync('dist/index.html','utf8');assert.equal(html.slice(html.indexOf('<body')),source.slice(source.indexOf('<body')),'Entire body/design/controller unchanged');
  for(const route of ['/','/?lang=ar','/company','/mhalmaghawry-other','/founder-other']){r=await get(route);assert.equal(r.headers.get('X-Local-Origin-Passthrough'),'true','Company route passes to origin');}
  for(const route of ['tools/check-private-release.cjs','server/private-preview-worker.mjs','_worker.js','_routes.json','_headers','build-manifest.json','docs/ARCHITECTURE.md','missing/deep/page','assets%2fprivate-previews.js']){r=await get('/mhalmaghawry/'+route);assert.equal(r.status,404);assert(!(await r.text()).includes('configured(env)'));}
  r=await get('/mhalmaghawry/missing/deep/page');const missing=await r.text();assert(missing.includes('href="/mhalmaghawry/"'));assert(missing.includes('/mhalmaghawry/assets/fonts/'));
  for(const record of publicFiles){r=await get('/mhalmaghawry/'+record.path.slice(7),{method:'HEAD'});assert.equal(r.status,record.path==='public/index.html'?200:200,record.path);assert.equal((await r.arrayBuffer()).byteLength,0);}
  for(const file of ['assets/private-previews.js','assets/loader-cast-ii/material-aux.png','assets/fonts/Inter-Latin.woff2'].filter(file=>publicFiles.some(record=>record.path==='public/'+file))){r=await get('/mhalmaghawry/'+file);assert.equal(hash(Buffer.from(await r.arrayBuffer())),hash(fs.readFileSync('cloudflare/public/'+file)));}
  const video=publicFiles.find(record=>record.path.endsWith('-detail.mp4')).path.slice(7);r=await get('/mhalmaghawry/'+video,{headers:{Range:'bytes=1-9'}});assert.equal(r.status,206);assert.equal((await r.arrayBuffer()).byteLength,9);assert.match(r.headers.get('Content-Range'),/^bytes 1-9\//);
  r=await get('/mhalmaghawry/'+video,{headers:{Range:'bytes=999999999-'}});assert.equal(r.status,416);
  for(const method of ['GET','HEAD','POST']){r=await get('/mhalmaghawry/api/previews/classified-vault/'+(method==='POST'?'unlock':'content'),{method,headers:{'Content-Type':'application/json'},body:method==='POST'?'{}':undefined});assert.equal(r.status,503);assert.match(r.headers.get('Cache-Control'),/no-store/);if(method==='HEAD')assert.equal((await r.arrayBuffer()).byteLength,0);}
  const webmanifest=await(await get('/mhalmaghawry/site.webmanifest')).json();assert.equal(webmanifest.scope,'/mhalmaghawry/');assert.equal(webmanifest.start_url,'/mhalmaghawry/');assert(webmanifest.icons.every(icon=>icon.src.startsWith('/mhalmaghawry/')));
 }finally{await preview.close();}
 const db=new DatabaseSync(':memory:');db.exec(fs.readFileSync('server/private-preview-schema.sql','utf8'));
 function prepare(sql){let values=[];return{bind(...args){values=args;return this;},first(){return db.prepare(sql).get(...values)||null;},run(){return db.prepare(sql).run(...values);},all(){return db.prepare(sql).all(...values);}};}
 const D1={prepare,batch(statements){db.exec('BEGIN IMMEDIATE');try{const rows=statements.map(statement=>({success:true,results:statement.all()}));db.exec('COMMIT');return rows;}catch(error){db.exec('ROLLBACK');throw error;}}};
 const env={PREVIEW_DB:D1,PREVIEW_SESSION_SECRET:'synthetic-mount-regression-session-secret-123456789',PRIVATE_PREVIEWS:{get:async key=>key.endsWith('/content.json')?{json:async()=>({schema:1,id:key.split('/')[1],authored:true,fields:{resultsKeys:[]},i18n:{},media:{'video-preview.mp4':'previews/classified-vault/media/video-preview.mp4','video-detail.mp4':'previews/classified-vault/media/video-detail.mp4',background:'previews/classified-vault/media/background'}})}:{body:new Uint8Array([1,2,3]),size:3,httpMetadata:{contentType:'video/mp4'}},head:async()=>({size:3,httpMetadata:{contentType:'video/mp4'}})}};
 for(const key of ['PREVIEW_CODE_CLASSIFIED_VAULT','PREVIEW_CODE_VSCCD','PREVIEW_CODE_LB_127']){env[key]='123456';env[key+'_EXPIRES_AT']=new Date(Date.now()+1200000).toISOString();}
 const configured=await createCloudflarePreview({port:0,env});
 try{
  const base=configured.url+'/mhalmaghawry/api/previews/classified-vault/';
  let r=await fetch(base+'unlock',{method:'POST',headers:{Origin:configured.url,'Content-Type':'application/json','CF-Connecting-IP':'192.0.2.55'},body:JSON.stringify({code:'123456'})});assert.equal(r.status,200);const setCookie=r.headers.get('Set-Cookie');assert.match(setCookie,/^__Host-preview-classified-vault=[a-f0-9]{64}; Path=\/;/);assert.match(setCookie,/HttpOnly; Secure; SameSite=Strict/);const cookie=setCookie.split(';')[0];
  r=await fetch(base+'content',{headers:{Cookie:cookie}});const data=await r.json();assert.equal(r.status,200);assert.equal(data.fields.video,'/mhalmaghawry/api/previews/classified-vault/media/video.mp4');assert.equal(data.fields.bgImage,'/mhalmaghawry/api/previews/classified-vault/media/background');
  r=await fetch(base+'content',{method:'HEAD',headers:{Cookie:cookie}});assert.equal(r.status,200);assert.equal((await r.arrayBuffer()).byteLength,0);
  r=await fetch(base+'media/video-detail.mp4',{headers:{Cookie:cookie}});assert.equal(r.status,200);assert.equal((await r.arrayBuffer()).byteLength,3);
  r=await fetch(base+'media/video-detail.mp4');assert.equal(r.status,401);
 }finally{await configured.close();db.close();}
 // Execute the shipped client at both script locations; path queries/hashes cannot choose its API authority.
 for(const prefix of ['','/mhalmaghawry']){const calls=[],window={fetch:async(url)=>{calls.push(url);return{ok:false,status:503,json:async()=>({error:'unavailable'})};}},document={currentScript:{src:'https://pinexen.com'+prefix+'/assets/private-previews.js'}};vm.runInNewContext(fs.readFileSync('assets/private-previews.js','utf8'),{window,document,URL,AbortController,Date,Map,Set,Error});await window.createPortfolioPrivatePreviews().load('classified-vault','ar').catch(()=>{});assert.equal(calls[0],prefix+'/api/previews/classified-vault/content?lang=ar');}
 console.log('PASS mounted HTTP: canonical aliases/query, '+publicFiles.length+' asset HEADs, static no-JS crawler share metadata/versioned PNG GET+HEAD, unchanged body, private handler identity, source denials, company passthrough, Range/HEAD, unset503, real SQLite scoped content/media, valid host-cookie Path, root/mounted shipped client.');
}
main().catch(error=>{console.error(error);process.exitCode=1;});
