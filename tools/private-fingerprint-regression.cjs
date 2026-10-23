const fs=require('node:fs'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const {validatePolicy,createMatcher}=require('./private-fingerprint-policy.cjs'),{scanPrivateRelease}=require('./check-private-release.cjs');
const hash=s=>crypto.createHash('sha256').update(s).digest('hex');
const policy=JSON.parse(fs.readFileSync('tools/private-text-fingerprints.json')),deny=JSON.parse(fs.readFileSync('tools/private-preview-denylist.json'));
assert.equal(validatePolicy(policy,deny).entries.length,15);
for(const mutate of [p=>p.version=2,p=>p.entries=[],p=>p.textValueCount=0,p=>p.integritySHA256='0'.repeat(64),p=>p.entries[0].representations[0].utf16Length=0,p=>p.retiredValueHashes=[]]){
 const p=structuredClone(policy);mutate(p);assert.throws(()=>validatePolicy(p,deny),/fingerprint policy/);
}
const p=structuredClone(policy);p.entries=[];p.textValueCount=0;const {integritySHA256,...body}=p;p.integritySHA256=hash(JSON.stringify(body));assert.throws(()=>validatePolicy(p,deny),/fingerprint policy/,'Recomputed checksum cannot authorize an empty deny policy');
const dummy='A synthetic "restricted" example\nfor future fixtures — فقط للاختبار';
for(const form of [dummy,JSON.stringify(dummy).slice(1,-1),Buffer.from(dummy).toString('base64'),[...dummy].map(c=>'\\u'+c.charCodeAt(0).toString(16).padStart(4,'0')).join(''),[...dummy].map(c=>'&#'+c.charCodeAt(0)+';').join(''),encodeURIComponent(dummy)])assert.throws(()=>scanPrivateRelease(new Map([['fixture.js',Buffer.from('prefix '+form+' suffix')]]),{additionalForbidden:[dummy]}),/confidential scan failed/);
assert.equal(createMatcher(policy,['ababa'])(['xxababaxx']).has(hash('ababa')),true,'Sliding windows match a substring away from offset zero');
assert.equal(createMatcher(policy,['ababa'])(['xxababbxx']).size,0,'Near matches do not pass SHA confirmation');
const collision={entries:[{sha256:hash('unrelated'),representations:[{utf16Length:1,rolling32:'00000062',sha256:hash('z')}]}]};assert.equal(createMatcher(collision)(['a']).size,0,'Rolling collisions never bypass SHA confirmation');
assert.equal(scanPrivateRelease(new Map([['ok.js',Buffer.from('ordinary public fixture')]])).findings,0);
console.log('PASS portable fingerprint policy: schema/checksum/nonempty integrity, encoded future prose, substring windows, SHA-confirmed prefilters and no archive input.');
