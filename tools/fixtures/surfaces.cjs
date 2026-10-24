/* Execute the shipped surface manager, including loader/frame/observer/keyboard lifecycle. */
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const source = fs.readFileSync('index.html', 'utf8');
const start = source.indexOf('    function initSurfaceReveals() {');
const end = source.indexOf('    // Staggered Scroll Entrance Observer', start);
assert.ok(start >= 0 && end > start);
const actual = source.slice(start, end);

function node() {
  const classes = new Set(), listeners = new Map(), styles = new Map();
  return {
    id: '', dataset: {}, isConnected: true, fixed: false, focused: false, classes, listeners, styles,
    classList: { add: (...names) => names.forEach(name => classes.add(name)), remove: (...names) => names.forEach(name => classes.delete(name)), contains: name => classes.has(name) },
    style: { setProperty: (key, value) => styles.set(key, value), removeProperty: key => styles.delete(key) },
    addEventListener: (name, callback) => listeners.set(name, callback),
    removeEventListener: (name, callback) => { if (listeners.get(name) === callback) listeners.delete(name); },
    querySelector() { return this.fixed ? {} : null; },
    contains() { return this.focused; }
  };
}
function environment({ loading = false, reduce = false, observerAvailable = true, expertise = false, requested = false, mindset = false, interests = false, business = false, mixed = false, capability = false, capabilityCounts = null, width = 1288 } = {}) {
  const nodes = Array.from({ length: capabilityCounts ? capabilityCounts.reduce((a,b)=>a+b,0) : capability ? 20 : business ? 1 : interests ? 5 : mindset && !mixed ? 4 : expertise ? 3 : 6 }, node), gallery = node(), observers = [], docEvents = new Map(), frames = new Map(), timers = new Map();
  gallery.id='pillars-gallery';
  nodes.forEach((node,index)=>{node.matches=selector=>selector==='#skills .cap-mindset-card, #skills .cap-skill-chip, #skills .cap-tools-list > li'?(capability||mindset&&(!mixed||index<4)):selector==='#strengths .cap-mindset-card'?(mindset&&(!mixed||index<4)):selector==='#interests .interest-row'?interests:requested;if(business)node.id='business-card';if(requested)node.id=['academic','project-a','contact-a','expertise-a','phone-b','phone-c'][index];});
  const media = { matches: reduce, addEventListener: (name, callback) => { media.onChange = callback; }, removeEventListener: () => { media.onChange = null; } };
  let id = 0, now = 100;
  class Observer {
    constructor(callback, options) { this.callback = callback; this.options = options; this.targets = new Set(); this.observeCalls = []; observers.push(this); }
    observe(target) { this.targets.add(target); this.observeCalls.push(target); }
    unobserve(target) { this.targets.delete(target); }
    disconnect() { this.targets.clear(); }
    deliver(entries) { this.callback(entries); }
  }
  const window = { matchMedia: () => media, innerWidth: width, addEventListener: (k,f)=>docEvents.set("window:"+k,f), removeEventListener:k=>docEvents.delete("window:"+k) };
  if (observerAvailable) window.IntersectionObserver = Observer;
  const context = vm.createContext({
    window, IntersectionObserver: Observer, isPortfolioElementActive: element => element.active !== false && !element.closest?.('[data-group-view]')?.hidden, performance: { now: () => now },
    requestAnimationFrame: callback => { const key = ++id; frames.set(key, callback); return key; }, cancelAnimationFrame: key => frames.delete(key),
    setTimeout: (callback, delay) => { const key = ++id; callback.due = now + delay; timers.set(key, callback); return key; }, clearTimeout: key => timers.delete(key),
    document: { documentElement:{dataset:{portfolioView:'about'}}, body: { classList: { contains: () => loading } }, activeElement: {}, querySelectorAll: selectors => !expertise || selectors.includes('#pillars-gallery > .pillar-gallery-item') ? nodes : selectors.split(',').includes('#pillars-gallery') ? [gallery] : [],
      addEventListener: (name, callback) => docEvents.set(name, callback), removeEventListener: (name, callback) => { if (docEvents.get(name) === callback) docEvents.delete(name); } }
  });
  vm.runInContext(actual, context);
  const manager = context.initSurfaceReveals();
  const frame = () => { const batch = Array.from(frames.values()); frames.clear(); batch.forEach(callback => callback()); };
  const advance = ms => { now += ms; Array.from(timers).forEach(([key, callback]) => { if (callback.due <= now) { timers.delete(key); callback(); } }); };
  return { manager, nodes, gallery, observers, docEvents, media, frames, timers, frame, advance, document: context.document, context };
}

module.exports={environment};
