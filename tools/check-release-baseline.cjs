const fs=require('node:fs'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const expected=fs.readFileSync('docs/release-baseline.json'),actual=fs.readFileSync('dist/build-manifest.json');
assert.deepEqual(actual,expected,'Runtime output differs from the reviewed release baseline; inspect intended changes before updating it');
console.log('PASS reviewed runtime baseline: '+JSON.parse(actual).files.length+' files; manifest '+crypto.createHash('sha256').update(actual).digest('hex'));
