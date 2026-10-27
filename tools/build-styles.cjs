const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),postcss=require('postcss'),tailwind=require('tailwindcss');
const {loadAutoprefixer,loadCssNano}=require('tailwindcss/lib/cli/build/deps.js');
const root=path.resolve(__dirname,'..'),hash=b=>crypto.createHash('sha256').update(b).digest('hex');
async function buildStyles(){
 fs.copyFileSync(path.join(root,'node_modules/tailwindcss/LICENSE'),path.join(root,'assets/tailwind-LICENSE.txt'));
 const config=require('../tailwind.config.cjs'),input=fs.readFileSync(path.join(__dirname,'tailwind.input.css'),'utf8'),manifest={};
 const targets=[['main',config,'index.html'],['404',{darkMode:'class',content:[path.join(root,'404.html')],theme:{extend:{colors:{'brand-teal':'#14b8a6'}}}},'404.html']];
 for(const[name,settings,html]of targets){
  const result=await postcss([tailwind({...settings,content:name==='main'?[path.join(root,'index.html'),path.join(root,'assets/*.js')]:settings.content}),loadAutoprefixer(),loadCssNano()]).process(input,{from:path.join(__dirname,'tailwind.input.css')});
  // Use the exact pinned Tailwind CLI's bundled prefixer/minifier, including incumbent compatibility declarations.
  const compatible=postcss.parse(result.css);
  // Preserve the CDN's explicit Safari text-decoration transition fallbacks as well as modern properties.
  compatible.walkRules('.transition-colors',rule=>{const decl=rule.nodes.find(node=>node.type==='decl'&&node.prop==='transition-property');if(!decl)return;
   decl.cloneBefore({value:'color,background-color,border-color,fill,stroke,-webkit-text-decoration-color'});
   decl.cloneAfter({value:'color,background-color,border-color,text-decoration-color,fill,stroke,-webkit-text-decoration-color'});
  });
  const css=Buffer.from(compatible.toString()),sha=hash(css),relative=`assets/tailwind-${name}.${sha.slice(0,12)}.css`;
  fs.writeFileSync(path.join(root,relative),css);manifest[name]={path:relative,bytes:css.length,sha256:sha};
  const file=path.join(root,html),source=fs.readFileSync(file,'utf8'),pattern=/<link id="portfolio-tailwind"[^>]*>/;
  if(!pattern.test(source))throw Error(`Missing explicit final-head Tailwind slot in ${html}`);
  fs.writeFileSync(file,source.replace(pattern,`<link id="portfolio-tailwind" rel="stylesheet" href="./${relative}">`));
 }
 fs.writeFileSync(path.join(__dirname,'styles-manifest.json'),JSON.stringify(manifest,null,2)+'\n');return manifest;
}
module.exports={buildStyles};if(require.main===module)buildStyles().then(m=>console.log(JSON.stringify(m))).catch(e=>{console.error(e.message);process.exitCode=1;});
