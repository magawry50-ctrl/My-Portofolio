/* Same configuration as the accepted Tailwind Play CDN 3.4.17 page. */
module.exports = {
  darkMode: 'class',
  content: ['./index.html', './assets/*.js'],
  safelist: ['bg-[#32d5ff]', 'bg-amber-400', 'animate-pulse'],
  theme: { extend: { colors: {
    teal: { 50:'#eaf2ff',100:'#dae9ff',200:'#bad5ff',300:'#70aaff',400:'#32d5ff',500:'#003ea0',600:'#003080',700:'#06286c',800:'#04185a',900:'#0c1836',950:'#070d1e' },
    'brand-teal':'var(--brand-teal)'
  } } }
};
