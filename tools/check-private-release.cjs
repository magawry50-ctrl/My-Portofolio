/* Public artifact scanner: a portable reviewed fingerprint policy replaces private local inputs. */
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const hash=s=>crypto.createHash('sha256').update(s).digest('hex');
function scanPrivateRelease(files,{additionalForbidden=[],additionalRetiredFingerprints=[]}={}){
 const deny=JSON.parse(fs.readFileSync(path.join(__dirname,'private-preview-denylist.json'),'utf8'));
 const policy=require('./private-fingerprint-policy.cjs').loadPolicy(deny);
 const matcher=require('./private-fingerprint-policy.cjs').createMatcher(policy,additionalForbidden);
 const retired=new Set([...deny.retiredValueHashes,...additionalRetiredFingerprints]),findings=[];
 function check(text,file){
  const decode=value=>value.replace(/\\u([a-f0-9]{4})/gi,(_,n)=>String.fromCharCode(parseInt(n,16))).replace(/\\x([a-f0-9]{2})/gi,(_,n)=>String.fromCharCode(parseInt(n,16))).replace(/&#(?:x([a-f0-9]+)|(\d+));/gi,(original,a,b)=>{const n=parseInt(a||b,a?16:10);return n<=0x10ffff?String.fromCodePoint(n):original;}).replace(/(?:%[a-f0-9]{2})+/gi,run=>{try{return decodeURIComponent(run);}catch(_){return run;}});
  const forms=new Set([text]);let normalized=text;for(let i=0;i<3;i++){normalized=decode(normalized);forms.add(normalized);}
  for(const form of [...forms])for(const match of form.matchAll(/[A-Za-z0-9+/]{8,}={0,2}/g)){const decoded=Buffer.from(match[0],'base64').toString('utf8');forms.add(decoded);forms.add(decode(decoded));}
  for(const fingerprint of matcher(forms))findings.push({file,type:'confidential-text',fingerprint});
  const candidates=[...forms].flatMap(form=>[...form.matchAll(/\d{6}/g)].map(m=>m[0]));
  for(const value of candidates)if(retired.has(hash(value)))findings.push({file,type:'retired-configuration',fingerprint:hash(value)});
 }
 for(const[file,bytes]of files){if(/\.(?:html|css|js|mjs|json|svg|txt|xml|webmanifest)$/.test(file))check(bytes.toString('utf8'),file);if(/^tools\/|(?:_BEFORE|_REDACTED|REFERENCE|PERF\d)/.test(file))findings.push({file,type:'development-artifact'});}
 if(findings.length){const error=Error('Public artifact confidential scan failed ('+findings.length+' findings; values suppressed)');error.findings=findings;throw error;}
 return {textValuesChecked:policy.entries.length+additionalForbidden.length,retiredFingerprintsChecked:retired.size,findings:0};
}
module.exports={scanPrivateRelease};
