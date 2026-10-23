const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const html=fs.readFileSync('index.html','utf8');const start=html.indexOf('    const NAVIGATION_GROUPS ='),end=html.indexOf('    // --- Hero Photo Capsule',start),source=html.slice(start,end);
const dictionary=vm.runInNewContext(html.slice(html.indexOf('const I18N ='),html.indexOf('// --- Language Switching Logic'))+'\nI18N');
const viewIds={about:['home','clients-marquee','about','pillars','skills','strengths','academic','awards','interests'],work:['impact','experience','work','client-works','patents'],collaborate:['collaborate','value-offer','contact']};
function fixture({ reduce = false, lang = 'en', hash = '', loading = false, animated = false, width = 1288, nestedAwards = false, fine = true, railMotion = false } = {}) {
  const events = new Map(), windowEvents = new Map(), frames = new Map(), observers = [], animations = [], mediaObjects = [];let paintOverride = null;
  const timers = new Map(), motionHandlers = [];
  const timeoutDelays = [];
  let timerId = 0;
  let frameId = 0, reads = 0, modalOpen = false, focus = null;
  function element(id = '') {
    const classes = new Set(), attributes = {}, handlers = new Map();
    return {
      get parentNode(){return this.parent;}, get nextSibling(){return this.parent?.children[this.parent.children.indexOf(this)+1]||null;},
      id, animate:railMotion?function(keys,options){let resolve,reject;const a={node:this,keys,options,effect:{pseudoElement:options.pseudoElement},finished:new Promise((y,n)=>{resolve=y;reject=n}),resolve:()=>resolve(),cancel(){this.cancelled=true;reject(Error('cancelled'))}};animations.push(a);return a;}:undefined,dataset: {}, children: [], parent: null, hidden: false, isConnected: true, offsetParent: null,
      classList: { contains: key => classes.has(key), toggle(key, force) { if (force) classes.add(key); else classes.delete(key); }, add: key => classes.add(key), remove: key => classes.delete(key) },
      style: { setProperty(key, value) { this[key] = value; } },
      setAttribute(key, value) { attributes[key] = value; }, getAttribute: key => attributes[key], hasAttribute: key => Object.hasOwn(attributes, key), removeAttribute(key) { delete attributes[key]; },
      addEventListener(name, callback) { if (!handlers.has(name)) handlers.set(name, []); handlers.get(name).push(callback); },
      removeEventListener(name, callback) { handlers.set(name,(handlers.get(name)||[]).filter(fn=>fn!==callback)); },
      remove(){if(this.parent)this.parent.children=this.parent.children.filter(child=>child!==this);this.parent=null;},
      emit(name, event = {}) { for (const callback of handlers.get(name) || []) callback(event); },
      appendChild(child) { if (child.parent) child.parent.children = child.parent.children.filter(node => node !== child); this.children.push(child); child.parent = this; },
      insertBefore(child, before) { if(child===before)return; if (child.parent) child.parent.children = child.parent.children.filter(node => node !== child); this.children.splice(this.children.indexOf(before), 0, child); child.parent = this; }, replaceChildren() { this.children = []; },
      get textContent() { return this.children.length ? this.children.map(child => child.textContent || '').join('') : this.ownText || ''; }, set textContent(value) { this.ownText = value; },
      contains(candidate) { return this === candidate || this.children.some(child => child.contains(candidate)); },
      querySelectorAll(selector) { return selector === 'a' ? this.children.filter(child => child.tagName === 'A') : this.children.filter(child=>selector.split(',').some(part=>child.getAttribute('class')===part.slice(1))); },
      querySelector() { return null; },
      getBoundingClientRect() {if(railMotion&&this.getAttribute('class')?.includes('icon')){const compact=header.dataset.compact==='true',i=buttons.indexOf(this.parent),expandedIcon=this.getAttribute('class')==='rail-expanded-icon';if((expandedIcon&&compact)||(!expandedIcon&&i===2&&!compact))return{width:0,height:0};const width=compact?24:52,left=compact?28:36,top=compact?76+i*56:80+i*104;return{left,top,width,height:width}}return{top:0,bottom:52,height:52}; },
      focus() { focus = this; },
      closest(selector) { return selector === '[data-group-view]' && this.dataset.groupView || this.tagName === 'A' && (selector === 'a[data-section]' && this.dataset.section || selector === 'a[href^="#"]' && attributes.href?.startsWith('#')) ? this : this.parent?.closest(selector); }
    };
  }
  const views = Object.fromEntries(Object.entries(viewIds).map(([group]) => { const view = element('portfolio-view-' + group); view.dataset.groupView = group; view.offsetTop = 0; return [group, view]; }));
  const sections = Object.fromEntries(Object.entries(viewIds).flatMap(([group, ids]) => ids.map((id, index) => {
    const node = element(id); views[group].appendChild(node); node.offsetParent = views[group];
    Object.defineProperty(node, 'offsetTop', { get() { assert.equal(views[group].hidden, false, 'Never measure a hidden view section: ' + id); reads++; return nestedAwards && id === 'awards' ? 620 : index * 500; } });
    return [id, node];
  })));
  if (nestedAwards) { sections.academic.appendChild(sections.awards); sections.awards.offsetParent = sections.academic; }
  const header = element('portfolio-navigation'), drawer = element('notch-subnav'), list = element('notch-links'), main = element('notch-main'), expansion = element('notch-expansion'), backdrop = element('notch-backdrop');
  const primary = element('notch-primary'), burger=element('glass-menu-toggle'), groupsHost=element('glass-mobile-groups'), settingsHost=element('glass-mobile-settings'), desktopSettings=element('glass-desktop-settings'), language=element('elastic-lang-toggle'), theme=element('theme-toggle'), envelope=element('notch-envelope'), brand=element('glass-nav-brand'), caption=element('toggle-caption');
  burger.querySelector=()=>caption;
  const shell = element('notch-shell'), expansionInner = element('notch-expansion-inner'), utilities = element('toggle-wrapper');
  utilities.appendChild(language);utilities.appendChild(theme);utilities.querySelector=selector=>selector==='#elastic-lang-toggle'?language:null;
  utilities.getBoundingClientRect = () => railMotion?({left:22,right:76,top:250,bottom:412,height:162,width:54}):({ left:16,right:70,top: 16, bottom: 182, height: 166, width: 54 });
  expansionInner.appendChild(drawer);
  expansion.hidden = true; backdrop.hidden = true;
  header.dataset.compact='true';drawer.hidden = true; drawer.appendChild(list); shell.appendChild(main); main.appendChild(primary); main.appendChild(desktopSettings); main.appendChild(burger); expansionInner.appendChild(groupsHost); expansionInner.appendChild(settingsHost); expansion.appendChild(expansionInner); header.appendChild(shell); header.appendChild(expansion);
  const buttons = ['about', 'work', 'collaborate'].map(id => {
    const button = element('notch-' + id), span = element();
    button.dataset.notchGroup = id; button.querySelector = selector => selector === 'span' ? span : null;
    primary.appendChild(button); return button;
  });
  const body=element('body'); body.appendChild(header); body.appendChild(utilities);
  shell.getBoundingClientRect=()=>railMotion?{left:12,top:56,width:header.dataset.compact==='true'?76:400,height:header.dataset.compact==='true'?363:426}:{top:16,bottom:window.innerWidth<768?71:74,height:window.innerWidth<768?52:58};main.getBoundingClientRect=()=>({left:14,top:58,width:header.dataset.compact==='true'?72:396,height:header.dataset.compact==='true'?359:422});
  header.querySelectorAll = selector => selector === '[data-notch-group]' ? buttons : [];
  header.querySelector = selector => ({'.notch-primary':primary,'.glass-menu-toggle':burger,'.glass-mobile-groups':groupsHost,'.glass-mobile-settings':settingsHost,'.glass-desktop-settings':desktopSettings,'.notch-envelope':envelope,'.glass-nav-brand':brand}[selector]) || ['.notch-main','[data-notch-landmark]'].includes(selector) ? ({'.notch-primary':primary,'.glass-menu-toggle':burger,'.glass-mobile-groups':groupsHost,'.glass-mobile-settings':settingsHost,'.glass-desktop-settings':desktopSettings,'.notch-envelope':envelope,'.glass-nav-brand':brand}[selector]||main) : animated ? ({ '.notch-expansion': expansion, '.notch-expansion-inner': expansionInner, '.notch-shell': shell, '#toggle-wrapper': utilities }[selector] || null) : null;
  drawer.querySelector = selector => selector === '.notch-links' ? list : null;
  const document = {
    hidden: false, fonts: null, body, get activeElement(){return focus;}, documentElement: { dir: lang === 'ar' ? 'rtl' : 'ltr', dataset: {}, get scrollHeight() { return viewIds[this.dataset.portfolioView || 'about'].length * 500 + 200; }, style: { setProperty(key, value) { this[key] = value; } } },
    getElementById: id => ({ 'portfolio-navigation': header, 'notch-subnav': drawer, 'notch-backdrop': backdrop, 'toggle-wrapper': utilities, 'theme-toggle': theme }[id] || sections[id] || element(id)),
    createComment:()=>element(),
    createElement: tag => Object.assign(element(), { tagName: tag.toUpperCase() }),
    createElementNS: (_namespace, tag) => Object.assign(element(), { tagName: tag.toUpperCase() }),
    querySelector: () => modalOpen ? element('modal') : null,
    querySelectorAll: selector => selector === '[data-group-view]' ? Object.values(views) : [],
    addEventListener(name, callback) { if (!events.has(name)) events.set(name, []); events.get(name).push(callback); },
    removeEventListener(name, callback) { events.set(name,(events.get(name)||[]).filter(fn=>fn!==callback)); },
    dispatchEvent(event) { for (const callback of events.get(event.type) || []) callback(event); }
  };
  if (loading) document.body.classList.add('loader-active');
  const location = { hash }, historyCalls = [], scrolls = [];
  const window = {
    scrollY: 0, innerWidth: width, innerHeight: 700, ResizeObserver: true,
    matchMedia: query => {const m={matches:query.includes('pointer: fine')?fine:reduce,addEventListener(_type,handler){motionHandlers.push(handler)}};mediaObjects.push(m);return m;},
    scrollTo(options) { scrolls.push(options); window.scrollY = options.top; },
    addEventListener(name, callback) { if (!windowEvents.has(name)) windowEvents.set(name, []); windowEvents.get(name).push(callback); },
    removeEventListener(name, callback) { windowEvents.set(name,(windowEvents.get(name)||[]).filter(fn=>fn!==callback)); }
  };
  if(railMotion){window.KeyframeEffect=function(){};window.KeyframeEffect.prototype.pseudoElement=null;}
  const context = vm.createContext({ document, window, location,elasticToggleManager:{squeeze(){}}, sectionStackManager:null,capabilitiesPanelsManager:null,pillarsGalleryManager:null,getComputedStyle:(node,pseudo)=>{if(!railMotion)return{paddingBottom:'3px'};const compact=header.dataset.compact==='true',outer=node===shell,box=node.getBoundingClientRect();return pseudo&&paintOverride?{width:(outer?paintOverride.width:paintOverride.width-4)+'px',height:(outer?paintOverride.height:paintOverride.height-4)+'px',borderTopLeftRadius:(outer?paintOverride.radius:paintOverride.radius-2)+'px'}:{paddingBottom:'3px',width:box.width+'px',height:box.height+'px',borderTopLeftRadius:(compact?(outer?20:18):(outer?28:26))+'px'};}, I18N: dictionary, currentLang: lang,
    Event: class { constructor(type) { this.type = type; } },
    glassFolderShowcaseManager: { closeDialogs() { modalOpen = false; } },
    history: { pushState(_state, _title, url) { historyCalls.push(url); location.hash = url; } },
    requestAnimationFrame(callback) { frames.set(++frameId, callback); return frameId; },
    cancelAnimationFrame(id) { frames.delete(id); },
    setTimeout(callback, delay) { timeoutDelays.push(delay); timers.set(++timerId, callback); return timerId; }, clearTimeout(id) { timers.delete(id); },
    MutationObserver: class { constructor(callback) { observers.push(callback); } observe() {} disconnect(){} },
    ResizeObserver: class { observe() {} disconnect(){} }
  });
  vm.runInContext(source + '\nthis.manager = initSideNavigation(); this.groups = NAVIGATION_GROUPS;', context);
  const flush = () => { const batch = [...frames.values()]; frames.clear(); batch.forEach(callback => callback()); };
  return { context, header, drawer, list, buttons, sections, views, window, document, location, historyCalls, scrolls, frames, expansion, backdrop, timers, timeoutDelays, motionHandlers, shell, expansionInner, utilities,
    primary,burger,groupsHost,settingsHost,desktopSettings,language,theme,main,caption,brand,animations,paint:v=>paintOverride=v,reduce(){mediaObjects.forEach(m=>m.matches=true);motionHandlers.forEach(f=>f())}, get focused() { return focus; }, get reads() { return reads; }, flush,
    emit(name, event = {}, onWindow = false) { for (const callback of (onWindow ? windowEvents : events).get(name) || []) callback(event); },
    modal(value) { modalOpen = value; observers.forEach(callback => callback()); }
  };
}

module.exports={fixture};
