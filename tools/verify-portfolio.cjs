/* Static regression checks. Run: node tools/verify-portfolio.cjs */
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const failures = [];
const check = (ok, message) => { if (!ok) failures.push(message); };
const scripts = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)];
let parsed = 0;
for (const [i, entry] of scripts.entries()) {
  if (/\bsrc\s*=/.test(entry[1]) || /application\/ld\+json/.test(entry[1])) continue;
  try { new vm.Script(entry[2], { filename: `inline-script-${i + 1}` }); parsed++; }
  catch (error) { failures.push(error.message); }
}
const start = html.indexOf('const I18N = ');
const end = html.indexOf('// --- Language Switching Logic', start);
check(start >= 0 && end > start, 'Dictionary boundary not found');
let dictionary;
if (start >= 0 && end > start) {
  try { dictionary = vm.runInNewContext(html.slice(start, end) + '\nI18N', Object.create(null), { timeout: 1000 }); }
  catch (error) { failures.push(`Dictionary: ${error.message}`); }
}
if (dictionary) {
  const ar = Object.keys(dictionary.ar || {}), en = Object.keys(dictionary.en || {});
  check(ar.length > 0 && en.length > 0, 'Empty locale dictionary');
  for (const key of new Set([...ar, ...en])) {
    check(typeof dictionary.ar[key] === 'string', `Missing Arabic key: ${key}`);
    check(typeof dictionary.en[key] === 'string', `Missing English key: ${key}`);
  }
  for (const key of new Set([...html.matchAll(/\bdata-i18n=["']([^"']+)["']/g)].map(m => m[1]))) {
    for (const lang of ['ar', 'en']) check(typeof dictionary[lang]?.[key] === 'string', `Uncovered ${lang} data-i18n: ${key}`);
  }
  console.log(`Locales: ${ar.length} Arabic / ${en.length} English keys`);
}
// Inspect actual markup rather than dynamic template strings in inline JavaScript.
const markup = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
const ids = new Set();
for (const [, id] of markup.matchAll(/\bid=["']([^"']+)["']/g)) { check(!ids.has(id), `Duplicate ID: ${id}`); ids.add(id); }
const refs = new Set();
for (const [, value] of markup.matchAll(/\b(?:src|href|poster)=["']([^"']+)["']/g)) {
  if (/^(?:[a-z]+:|\/\/|#|\?)/i.test(value)) continue;
  const clean = decodeURIComponent(value.split(/[?#]/)[0]);
  if (!clean || clean === '/') continue;
  refs.add(clean);
  const target = path.resolve(root, clean.replace(/^\/+/, ''));
  check(target.startsWith(root + path.sep) && fs.existsSync(target), `Missing local asset: ${value}`);
}
console.log(`Parsed ${parsed} inline scripts; ${ids.size} unique markup IDs; checked ${refs.size} local asset references.`);



// Execute only the isolated persistence adapter against denied storage, without DOM mocks.
const storageSource = scripts.find(entry => /const safeStorage\s*=/.test(entry[2]))?.[2];
if (!storageSource) failures.push('Safe persistence adapter missing');
else {
  const deniedWindow = {};
  Object.defineProperty(deniedWindow, 'localStorage', { get() { throw new Error('Storage denied'); } });
  try {
    const adapter = vm.runInNewContext(storageSource + '\nsafeStorage', { window: deniedWindow }, { timeout: 1000 });
    check(adapter.getItem('theme') === null, 'Denied storage must allow default theme');
    adapter.setItem('theme', 'dark');
  } catch (error) { failures.push(`Denied storage: ${error.message}`); }
}
const localeInit = html.match(/let currentLang\s*=([^;]+);/);
if (!localeInit) failures.push('Initial locale selection missing');
else for (const [paramLang, saved, expected] of [
  ['ar', 'en', 'ar'], ['en', 'ar', 'en'], ['invalid', 'ar', 'ar'], ['invalid', 'invalid', 'en'], [null, null, 'en'], [null, 'ar', 'ar']
]) {
  try {
    const actual = vm.runInNewContext(localeInit[1], { paramLang, safeStorage: { getItem: () => saved }, resolvePortfolioLanguage: vm.runInNewContext(storageSource + '\nresolvePortfolioLanguage', { window: {} }) }, { timeout: 1000 });
    check(actual === expected, `Locale fallback failed: URL ${paramLang}, saved ${saved}`);
  } catch (error) { failures.push(`Locale fallback: ${error.message}`); }
}
// Source-presence contracts only: these do not emulate CSS media or browser rendering.
const noScript = html.match(/<noscript>([\s\S]*?)<\/noscript>/i)?.[1] || '';
check(/#page-loader\s*\{[^}]*display:\s*none/.test(noScript), 'No-JS fallback must hide blocking loader');
check(/body\.loader-active\s*\{[^}]*overflow:\s*auto/.test(noScript), 'No-JS fallback must allow scrolling');
check(/\.scroll-reveal-card[^}]*opacity:\s*1/.test(noScript), 'No-JS fallback must expose reveal content');
check(/@media\s*\(prefers-reduced-motion:\s*reduce\)/.test(html), 'Reduced-motion CSS contract missing');
check(html.includes("else if (motion.matches) fallback('reduced-motion');"), 'Reduced-motion loader still/release bypass missing');
console.log('Behavior contracts: denied storage, six locale default/deep-link cases; static no-JS/reduced-motion guards checked.');




const errorHtml = fs.readFileSync(path.join(root, '404.html'), 'utf8');
for (const [i, entry] of [...errorHtml.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)].entries()) {
  if (/\bsrc\s*=/.test(entry[1])) continue;
  try { new vm.Script(entry[2], { filename: `404-inline-script-${i + 1}` }); }
  catch (error) { failures.push(error.message); }
}
check(/<html\b[^>]*lang="en"[^>]*dir="ltr"/.test(errorHtml), 'Default 404 must declare English LTR');

if (failures.length) { console.error(failures.join('\n')); process.exitCode = 1; }
else console.log('PASS: static and isolated behavior checks including 404 (browser rendering not simulated)');
