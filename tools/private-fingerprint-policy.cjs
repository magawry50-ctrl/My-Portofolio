/* Known retired text only: rolling hashes screen candidates; SHA256 confirms every match. */
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const hash=s=>crypto.createHash('sha256').update(s).digest('hex'),hex=/^[a-f0-9]{64}$/;
const rolling=s=>{let n=0;for(let i=0;i<s.length;i++)n=(Math.imul(n,257)+s.charCodeAt(i)+1)>>>0;return n;};
function validatePolicy(policy,deny){
 const fail=()=>{throw Error('Private fingerprint policy is missing, incomplete or invalid');};
 if(!policy||policy.version!==1||!Number.isInteger(policy.textValueCount)||policy.textValueCount<15||!Array.isArray(policy.entries)||policy.entries.length!==policy.textValueCount||!Array.isArray(policy.approvedGenericValueHashes))fail();
 const {integritySHA256,...body}=policy;if(!hex.test(integritySHA256)||hash(JSON.stringify(body))!==integritySHA256)fail();
 if(deny.publicArtifactAllowed!==false||!Array.isArray(deny.retiredValueHashes)||!deny.retiredValueHashes.length||!deny.retiredValueHashes.every(v=>hex.test(v))||!Array.isArray(deny.privateValueHashes))fail();
 if(JSON.stringify(policy.retiredValueHashes)!==JSON.stringify(deny.retiredValueHashes))fail();
 const primary=new Set();for(const entry of policy.entries){
  if(!hex.test(entry.sha256)||primary.has(entry.sha256)||!Array.isArray(entry.representations)||!entry.representations.length)fail();primary.add(entry.sha256);
  for(const r of entry.representations)if(!Number.isInteger(r.utf16Length)||r.utf16Length<1||r.utf16Length>8192||!/^[a-f0-9]{8}$/.test(r.rolling32)||!hex.test(r.sha256))fail();
  const literal=entry.representations.find(r=>r.sha256===entry.sha256),original=deny.privateValueHashes.find(r=>r.sha256===entry.sha256);
  if(!literal||!original||literal.utf16Length!==original.length)fail();
 }
 if(!policy.approvedGenericValueHashes.every(v=>hex.test(v)&&!primary.has(v)))fail();
 const protectedHashes=[...new Set([...primary,...policy.approvedGenericValueHashes])].sort();
 if(!deny.privateValueHashes.every(r=>hex.test(r.sha256))||JSON.stringify(protectedHashes)!==JSON.stringify([...new Set(deny.privateValueHashes.map(r=>r.sha256))].sort()))fail();
 return policy;
}
function loadPolicy(deny){return validatePolicy(JSON.parse(fs.readFileSync(path.join(__dirname,'private-text-fingerprints.json'),'utf8')),deny);}
function createMatcher(policy,additionalForbidden=[]){
 const entries=[...policy.entries,...additionalForbidden.map(value=>({sha256:hash(value),representations:[...new Set([value,JSON.stringify(value).slice(1,-1)])].map(text=>({utf16Length:text.length,rolling32:rolling(text).toString(16).padStart(8,'0'),sha256:hash(text)}))}))];
 const groups=new Map();for(const entry of entries)for(const r of entry.representations){if(!groups.has(r.utf16Length))groups.set(r.utf16Length,new Map());const group=groups.get(r.utf16Length),key=parseInt(r.rolling32,16);if(!group.has(key))group.set(key,[]);group.get(key).push({sha256:r.sha256,primary:entry.sha256});}
 return forms=>{
  const matches=new Set();for(const form of forms)for(const [length,group]of groups){
   if(form.length<length)continue;let power=1;for(let i=1;i<length;i++)power=Math.imul(power,257)>>>0;let n=rolling(form.slice(0,length));
   for(let i=0;i<=form.length-length;i++){
    const candidates=group.get(n);if(candidates){const digest=hash(form.slice(i,i+length));for(const candidate of candidates)if(candidate.sha256===digest)matches.add(candidate.primary);}
    if(i<form.length-length)n=(Math.imul((n-Math.imul(form.charCodeAt(i)+1,power))>>>0,257)+form.charCodeAt(i+length)+1)>>>0;
   }
  }return matches;
 };
}
module.exports={loadPolicy,validatePolicy,createMatcher};
