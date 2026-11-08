/* Paint-layer preservation and derived contrast checks; native composition is checked separately. */
const fs=require('node:fs'),assert=require('node:assert/strict'),postcss=require('postcss');
const css=fs.readFileSync('assets/night-theme.css','utf8'),html=fs.readFileSync('index.html','utf8'),tree=postcss.parse(css);
const paint=new Set(['background','background-color','background-image','color','border-color','outline-color','box-shadow']);
let rules=0,decls=0;
tree.walkRules(rule=>{assert(rule.selector.split(/,(?![^()]*\))/).every(s=>s.trim().startsWith('html.dark')),`Non-Night selector: ${rule.selector}`);assert(!/#home|page-entry-hero|pillar-gallery|gf-root|cap-tool-logo|\bimg\b|\bvideo\b|\bcanvas\b/.test(rule.selector),'Artwork excluded');rules++;});
tree.walkDecls(decl=>{assert(decl.prop.startsWith('--')||paint.has(decl.prop),`Geometry/motion mutation: ${decl.prop}`);decls++;});
const link=html.indexOf('href="./assets/night-theme.css"'),tail=html.indexOf('id="portfolio-tailwind"');assert(link>0&&tail>link&&tail<html.indexOf('</head>'),'Preserve final Tailwind head slot');
const sourceScopes=['#about','#skills','#strengths','#interests','#academic','#experience','#value-offer','#showcase-modal-container','#showcase-modal-body','#security-otp-card','#contact','#portfolio-navigation'];
for(const scope of sourceScopes)assert(html.includes(`id="${scope.slice(1)}"`)&&css.includes(scope),'Live mapping '+scope);
for(const klass of ['otp-input-active','otp-input-error','otp-input-success'])assert(html.includes(klass)&&css.includes(klass),'Actual OTP phase class');
for(const klass of ['dark:bg-zinc-800/35','dark:bg-zinc-900/70','dark:bg-zinc-800/60','dark:text-zinc-500'])assert(html.includes(klass)&&css.includes(klass),'Actual generated dialog class');
const p=JSON.parse(fs.readFileSync('docs/night-palette.json','utf8')).palette;
const lum=h=>{const a=h.match(/\w\w/g).map(v=>parseInt(v,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return .2126*a[0]+.7152*a[1]+.0722*a[2]},ratio=(a,b)=>{a=lum(a.slice(1));b=lum(b.slice(1));return(Math.max(a,b)+.05)/(Math.min(a,b)+.05)};
let comparisons=0;for(const fg of ['foreground','secondary','muted','link','icon','success','error','warning'])for(const bg of ['canvas','card','raised','overlay']){assert(ratio(p[fg],p[bg])>=4.5);comparisons++;}
for(const bg of ['canvas','card','raised','overlay']){assert(ratio(p.strokeControl,p[bg])>=3);comparisons++;}
// NAV173 explicitly supersedes the original opaque selected stroke with50% alpha.
const composite=(fg,bg)=>'#'+fg.slice(1).match(/../g).map((c,i)=>Math.round((parseInt(c,16)+parseInt(bg.slice(1).match(/../g)[i],16))/2).toString(16).padStart(2,'0')).join('');
assert(css.includes('inset 0 0 0 1px rgba(130,184,255,.5)'),'NAV173 half-opacity selected stroke');
assert(fs.readFileSync('assets/business-card.css','utf8').includes('linear-gradient(to right,#0152e9,#39c8ff)'));
assert(!css.includes('.contact-impact-accent'),'Exact157 gradient never overridden');
console.log(JSON.stringify({pass:true,nightOnlyRules:rules,paintDeclarations:decls,contrastComparisons:comparisons,activeCue173:{alpha:.5,compositedOnBlue:ratio(composite(p.link,'#003ea0'),'#003ea0'),compositedOnCard:ratio(composite(p.link,p.card),p.card),note:'Explicit user173 paint preference; no opaque-cue threshold claim'},nativeAcceptance:'separate root CUA pass; no claim of whole-site WCAG compliance'}));
