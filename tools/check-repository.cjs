/* Validate the explicit source inventory, never stage or mutate Git. */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),inventory=require('./repository-allowlist.json');
assert.equal(inventory.schema,1);assert.equal(new Set(inventory.files).size,inventory.files.length);
for(const file of inventory.files){
 const target=path.resolve(root,file);assert(target.startsWith(root+path.sep)&&!file.includes('..'),'Unsafe repository path');
 assert(fs.existsSync(target)&&fs.statSync(target).isFile()&&!fs.lstatSync(target).isSymbolicLink(),'Missing/linked repository input: '+file);
 assert(!/(?:^|\/)(?:node_modules|dist|08_ARCHIVES|\.git|\.impeccable)(?:\/|$)|_BEFORE|_REDACTED|\.dev\.vars|\.env$/.test(file),'Local/private artifact in repository inventory');
 assert(file.split('/').every(part=>!/^(?:con|prn|aux|nul|com[1-9¹²³]|lpt[1-9¹²³]|conin\$|conout\$|clock\$)(?:\.|$)/i.test(part)&&!/[. ]$/.test(part)&&!/[<>:"|?*]/.test(part)),'Nonportable Windows filename: '+file);
}
for(const file of inventory.retainedTrackedFiles)assert(inventory.files.includes(file),'Previously tracked input omitted: '+file);
const runtime=require('./build-production.cjs').collect().files;
for(const file of runtime.keys())assert(['_worker.js','_routes.json'].includes(file)||inventory.files.includes(file),'Runtime source absent from Git inventory: '+file);
assert(fs.readFileSync('.gitattributes','utf8').includes('* -text'),'Exact-byte checkout policy is required');
console.log('PASS repository inventory: '+inventory.files.length+' inputs, '+inventory.retainedTrackedFiles.length+' retained tracked files, complete runtime source closure, no private/history/dependency outputs.');
