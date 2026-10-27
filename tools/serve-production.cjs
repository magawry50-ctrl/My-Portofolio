/* Local inspection only. This server does not emulate Cloudflare _headers/_redirects. */
const fs=require('node:fs'),path=require('node:path'),{createPortfolioServer}=require('./serve-portfolio.cjs');
const root=path.resolve(__dirname,'../dist'),file=path.join(root,'build-manifest.json');
if(!fs.existsSync(file)||JSON.parse(fs.readFileSync(file,'utf8')).owner!=='portfolio-production-build-v1')throw Error('Run npm run build first');
const port=Number(process.argv[2]||4177);if(!Number.isInteger(port)||port<1||port>65535)throw Error('Invalid preview port');
const server=createPortfolioServer({root});server.on('error',e=>{console.error(e.message);process.exitCode=1;});
server.listen(port,'127.0.0.1',()=>console.log(`Clean production preview: http://127.0.0.1:${port}/`));
