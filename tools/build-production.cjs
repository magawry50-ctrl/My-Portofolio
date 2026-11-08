/* Fail-closed runtime closure. Only an owned output folder is writable; workspace files are never removed. */
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {buildStyles}=require('./build-styles.cjs');
const root=path.resolve(__dirname,'..'),output=path.resolve(root,'dist'),hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const roots=['index.html','404.html','_headers','_redirects','robots.txt','sitemap.xml','site.webmanifest','favicon.svg','favicon.png','favicon.ico','apple-touch-icon.png','og-image.png'];
const licenses=['assets/lucide-LICENSE.txt','assets/fonts/Inter-LICENSE.txt','assets/tailwind-LICENSE.txt'];
const diagnostics=/<script>if \(new URLSearchParams\(location\.search\)\.get\('(?:scrollProbe|perfProbe|surfaceProbe)'\)[\s\S]*?<\/script>/g;
const isText=file=>/\.(?:html|css|js|json|webmanifest|svg|txt|xml)$/.test(file);
function safe(relative){const resolved=path.resolve(root,relative);if(!resolved.startsWith(root+path.sep)||relative.split(/[\\/]/).includes('..'))throw Error('Unsafe runtime reference');return resolved;}
function collect(){
 const files=new Map(),queue=[],generatedMedia=[],external=[];
 const add=(relative,from='root allowlist')=>{
  relative=relative.replace(/\\/g,'/').replace(/^\.\//,'').replace(/^\//,'');
  if(files.has(relative))return;
  if(!roots.includes(relative)&&!/^((assets|images|icons)\/)/.test(relative))throw Error(`Runtime path outside allowlist: ${relative}`);
  const file=safe(relative);if(!fs.existsSync(file)||!fs.statSync(file).isFile())throw Error(`Missing runtime dependency: ${relative} (${from})`);
  if(fs.lstatSync(file).isSymbolicLink())throw Error('Runtime symlink is not allowed');
  let bytes=fs.readFileSync(file);
  if(relative==='index.html')bytes=Buffer.from(bytes.toString('utf8').replace(diagnostics,''));
  files.set(relative,bytes);if(isText(relative))queue.push(relative);
 };
 roots.forEach(r=>add(r));licenses.filter(r=>fs.existsSync(safe(r))).forEach(r=>add(r));
 for(const file of JSON.parse(fs.readFileSync(path.join(__dirname,'font-vendor-manifest.json'),'utf8')).files)if(/LICENSE|OFL|APACHE/.test(file.path))add(file.path);
 const local=(url,owner)=>{
  url=url.trim().replace(/^['"]|['"]$/g,'');if(!url||url.startsWith('#')||/^(?:data:|mailto:|tel:|javascript:)/i.test(url)||url.includes('${'))return;
  if(/^https?:\/\//.test(url)){external.push({owner,url:url.split(/[?#]/)[0]});return;}
  const clean=decodeURIComponent(url.split(/[?#]/)[0]);if(!clean)return;
  const relative=(clean.startsWith('/')?clean.slice(1):path.posix.join(path.posix.dirname(owner),clean)).replace(/^\.\//,'');
  if(relative.endsWith('.mp4')&&relative.startsWith('assets/videos/')){
   const base=relative.slice(0,-4),variants=['-preview.mp4','-preview.webm','-detail.mp4','-detail.webm','-poster.webp'].map(suffix=>base+suffix);
   variants.forEach(r=>add(r,owner));generatedMedia.push({base:relative,variants});return;
  }
  add(relative,owner);
 };
 while(queue.length){
  const owner=queue.shift(),text=files.get(owner).toString('utf8');
  // Literal catalog/media paths, including those inside runtime HTML templates.
  for(const m of text.matchAll(/(?:\.\/)?((?:assets|images|icons)\/[A-Za-z0-9_@./%()+ \-]+\.(?:css|js|png|webp|jpe?g|svg|ico|webm|mp4|woff2?|ttf|txt))/g))local('/'+m[1],owner);
  if(/\.(?:html|svg)$/.test(owner)){
   for(const m of text.matchAll(/<(?:script|img|source|link|image)\b[^>]*?\b(?:src|href)=["']([^"']+)["'][^>]*>/g))local(m[1],owner);
  }
  if(owner.endsWith('.css'))for(const m of text.matchAll(/url\(([^)]+)\)/g))local(m[1],owner);
  if(owner==='site.webmanifest')for(const icon of JSON.parse(text).icons||[])local(icon.src,owner);
 }
 files.set('_worker.js',fs.readFileSync(path.join(root,'server/private-preview-worker.mjs')));
 files.set('_routes.json',Buffer.from(JSON.stringify({version:1,include:['/api/previews/*'],exclude:[]},null,2)+'\n'));
 if(external.length)throw Error('External render dependency remains: '+JSON.stringify(external));
 return {files,generatedMedia:[...new Map(generatedMedia.map(r=>[r.base,r])).values()].sort((a,b)=>a.base.localeCompare(b.base))};
}
function writeOwned(files){
 if(output!==path.join(root,'dist')||!output.startsWith(root+path.sep))throw Error('Invalid verified output path');
 const manifestFile=path.join(output,'build-manifest.json');let previous=null;
 const blockedNotice='No public portfolio artifact. Confidential preview protection must be implemented and independently verified before rebuilding.\n';
 const inventory=()=>{
  const result=[];function walk(directory){for(const entry of fs.readdirSync(directory,{withFileTypes:true})){const target=path.join(directory,entry.name);if(entry.isSymbolicLink())throw Error('Output symlink is not permitted');if(entry.isDirectory())walk(target);else result.push(path.relative(output,target).replace(/\\/g,'/'));}}if(fs.existsSync(output))walk(output);return result.sort();
 };
 if(fs.existsSync(output)){
  if(fs.existsSync(manifestFile)){previous=JSON.parse(fs.readFileSync(manifestFile,'utf8'));if(previous.owner!=='portfolio-production-build-v1')throw Error('Invalid build ownership');}
  const known=new Set(previous?['build-manifest.json',...previous.files.map(r=>r.path)]:['RELEASE_BLOCKED.txt']);
  for(const relative of inventory())if(!known.has(relative))throw Error('Unapproved output file; refusing build');
  if(!previous&&fs.existsSync(path.join(output,'RELEASE_BLOCKED.txt'))&&fs.readFileSync(path.join(output,'RELEASE_BLOCKED.txt'),'utf8')!==blockedNotice)throw Error('Output notice was modified; refusing build');
  if(previous)for(const record of previous.files){const target=path.resolve(output,record.path);if(!target.startsWith(output+path.sep))throw Error('Unsafe old manifest path');if(fs.existsSync(target)&&hash(fs.readFileSync(target))!==record.sha256)throw Error('Modified owned output file; refusing build');}
 }
 if(previous)for(const record of previous.files){
  if(files.has(record.path))continue;const target=path.resolve(output,record.path);
  if(!target.startsWith(output+path.sep))throw Error('Unsafe old manifest path');
  if(fs.existsSync(target)){if(hash(fs.readFileSync(target))!==record.sha256)throw Error('Changed output file requires human review');fs.unlinkSync(target);}
 }
 fs.mkdirSync(output,{recursive:true});
 if(fs.existsSync(path.join(output,'RELEASE_BLOCKED.txt')))fs.unlinkSync(path.join(output,'RELEASE_BLOCKED.txt'));
 for(const[relative,bytes]of files){const target=path.resolve(output,relative);if(!target.startsWith(output+path.sep))throw Error('Unsafe output target');fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,bytes);}
 const records=[...files].map(([relative,b])=>({path:relative,bytes:b.length,sha256:hash(b)})).sort((a,b)=>a.path.localeCompare(b.path));
 const manifest={owner:'portfolio-production-build-v1',files:records};fs.writeFileSync(manifestFile,JSON.stringify(manifest,null,2)+'\n');
 const expected=['build-manifest.json',...records.map(r=>r.path)].sort();if(JSON.stringify(inventory())!==JSON.stringify(expected))throw Error('Final output tree differs from allowlisted manifest');
 for(const record of records)if(hash(fs.readFileSync(path.join(output,record.path)))!==record.sha256)throw Error('Final output bytes differ from manifest');
 return manifest;
}
async function buildProduction(){
 const policy=JSON.parse(fs.readFileSync(path.join(root,'server/private-preview-policy.json'),'utf8'));
 if(policy.mediaPolicy==='pending'||policy.privateBoundaryVerified!==true)throw new Error('RELEASE BLOCKED: confidential preview media policy/protected-build verification is incomplete.');
 await buildStyles();
 fs.copyFileSync(path.join(root,'node_modules/tailwindcss/LICENSE'),path.join(root,'assets/tailwind-LICENSE.txt'));
 const {files,generatedMedia}=collect(),confidentialScan=require('./check-private-release.cjs').scanPrivateRelease(files),manifest=writeOwned(files);
 const report={output:'dist',fileCount:manifest.files.length,bytes:manifest.files.reduce((n,f)=>n+f.bytes,0),manifestSHA256:hash(fs.readFileSync(path.join(output,'build-manifest.json'))),generatedMedia,confidentialScan,externalRenderDependencies:[],excluded:{workspaceRootReports:true,tools:true,sourceVideoOriginals:true,confidentialPayloads:true},diagnostics:'Opt-in development injector scripts stripped from output only; /tools is not published.'};
 fs.writeFileSync(path.join(root,'PERF154_BUILD_REPORT.json'),JSON.stringify(report,null,2)+'\n');return report;
}
module.exports={buildProduction,collect,writeOwned,output};if(require.main===module)buildProduction().then(r=>console.log(JSON.stringify({files:r.fileCount,bytes:r.bytes,manifestSHA256:r.manifestSHA256}))).catch(e=>{console.error(e.message);process.exitCode=1;});
