/* Local preview only. Run: node tools/serve-portfolio.cjs [port] (PORT also supported). */
const http = require('node:http');
const fs = require('node:fs');
const fsp = require('node:fs/promises');
const path = require('node:path');
const zlib = require('node:zlib');
const { promisify } = require('node:util');
const gzip = promisify(zlib.gzip), brotli = promisify(zlib.brotliCompress);
const MIME = { '.html':'text/html; charset=utf-8', '.css':'text/css; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.cjs':'text/javascript; charset=utf-8', '.json':'application/json; charset=utf-8', '.webmanifest':'application/manifest+json', '.svg':'image/svg+xml', '.webp':'image/webp', '.png':'image/png', '.jpg':'image/jpeg', '.jpeg':'image/jpeg', '.gif':'image/gif', '.ico':'image/x-icon', '.mp4':'video/mp4', '.webm':'video/webm', '.woff2':'font/woff2', '.woff':'font/woff', '.txt':'text/plain; charset=utf-8', '.md':'text/plain; charset=utf-8', '.pdf':'application/pdf' };
function createPortfolioServer({ root = path.resolve(__dirname, '..'), cacheMaxBytes = 16 * 1024 * 1024, cacheMaxEntries = 32 } = {}) {
    root = fs.realpathSync(root);
    const cache = new Map(); let cachedBytes = 0, compressing = 0;
    const inside = candidate => { const relative = path.relative(root, candidate); return relative === '' || (!relative.startsWith('..' + path.sep) && relative !== '..' && !path.isAbsolute(relative)); };
    const fail = (res, status, message, head) => { const body = Buffer.from(message); res.writeHead(status, { 'Content-Type':'text/plain; charset=utf-8', 'Content-Length':body.length, 'Cache-Control':'no-store', 'X-Content-Type-Options':'nosniff' }); res.end(head ? undefined : body); };
    const quality = (header, name) => {
        const tokens = String(header || '').toLowerCase().split(',').map(token => token.trim().split(';'));
        const token = tokens.find(([encoding]) => encoding === name) || tokens.find(([encoding]) => encoding === '*');
        if (!token) return 0;
        const value = token.slice(1).find(value => value.trim().startsWith('q='));
        const q = value ? Number(value.trim().slice(2)) : 1;
        return Number.isFinite(q) && q >= 0 && q <= 1 ? q : 0;
    };
    const compressed = async (file, stat, encoding) => {
        const key = file + ':' + stat.mtimeMs + ':' + stat.size + ':' + encoding;
        if (cache.has(key)) { const value = cache.get(key); cache.delete(key); cache.set(key, value); return value; }
        // Bound transient work as well as retained buffers. A busy preview may stream identity instead.
        if (compressing >= 4) return null;
        compressing++;
        try {
            const input = await fsp.readFile(file);
            const output = encoding === 'br' ? await brotli(input, { params: { [zlib.constants.BROTLI_PARAM_QUALITY]:4 } }) : await gzip(input, { level:6 });
            if (output.length <= cacheMaxBytes && cacheMaxEntries > 0) {
                while (cache.size && (cachedBytes + output.length > cacheMaxBytes || cache.size >= cacheMaxEntries)) { const oldest = cache.keys().next().value; cachedBytes -= cache.get(oldest).length; cache.delete(oldest); }
                // Another concurrent request can have populated the same key.
                if (cache.has(key)) cachedBytes -= cache.get(key).length;
                cache.set(key, output); cachedBytes += output.length;
            }
            return output;
        } finally { compressing--; }
    };
    return http.createServer(async (req, res) => {
        const head = req.method === 'HEAD';
        if (req.method !== 'GET' && !head) { res.setHeader('Allow', 'GET, HEAD'); fail(res, 405, 'Method not allowed', head); return; }
        try {
            let pathname;
            try { pathname = decodeURIComponent(req.url.split(/[?#]/, 1)[0]); } catch (_) { fail(res, 400, 'Malformed path', head); return; }
            const segments = pathname.replaceAll('\\', '/').split('/');
            if (!pathname.startsWith('/') || pathname.includes('\0')) { fail(res, 400, 'Malformed path', head); return; }
            if (segments.some(segment => segment === '..' || (segment.startsWith('.') && segment !== '.' && segment !== '.well-known'))) { fail(res, 403, 'Forbidden path', head); return; }
            let file = path.resolve(root, '.' + pathname);
            if (!inside(file)) { fail(res, 403, 'Forbidden path', head); return; }
            file = await fsp.realpath(file);
            if (!inside(file)) { fail(res, 403, 'Forbidden path', head); return; }
            let stat = await fsp.stat(file);
            if (stat.isDirectory()) { file = await fsp.realpath(path.join(file, 'index.html')); if (!inside(file)) { fail(res, 403, 'Forbidden path', head); return; } stat = await fsp.stat(file); }
            if (!stat.isFile()) { fail(res, 404, 'Not found', head); return; }
            const type = MIME[path.extname(file).toLowerCase()] || 'application/octet-stream';
            const compressible = /^(?:text\/|application\/(?:json|manifest\+json))/.test(type) || type === 'image/svg+xml';
            const etagFor = encoding => '"' + stat.size.toString(16) + '-' + stat.mtimeMs.toString(16) + '-' + encoding + '"';
            let encoding = 'identity', buffer = null;
            const rangeHeader = req.headers.range;
            if (compressible) res.setHeader('Vary', 'Accept-Encoding');
            if (!rangeHeader && compressible && stat.size >= 256 && stat.size <= 4 * 1024 * 1024) {
                const br = quality(req.headers['accept-encoding'], 'br'), gz = quality(req.headers['accept-encoding'], 'gzip');
                const preferred = br > 0 && br >= gz ? 'br' : gz > 0 ? 'gzip' : null;
                if (preferred) { buffer = await compressed(file, stat, preferred); if (buffer) encoding = preferred; }
            }
            const etag = etagFor(encoding);
            res.setHeader('Content-Type', type); res.setHeader('X-Content-Type-Options', 'nosniff');
            res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate'); res.setHeader('ETag', etag);
            res.setHeader('Last-Modified', stat.mtime.toUTCString()); res.setHeader('Accept-Ranges', 'bytes');
            if (encoding !== 'identity') res.setHeader('Content-Encoding', encoding);
            const matches = req.headers['if-none-match'];
            const notModified = matches ? matches.split(',').some(value => value.trim() === '*' || value.trim().replace(/^W\//, '') === etag) : req.headers['if-modified-since'] && Math.floor(stat.mtimeMs / 1000) <= Math.floor(Date.parse(req.headers['if-modified-since']) / 1000);
            if (notModified) { res.writeHead(304); res.end(); return; }
            let from = 0, to = stat.size - 1, status = 200;
            const ifRange = req.headers['if-range'];
            const useRange = rangeHeader && !head && (!ifRange || ifRange === etagFor('identity') || (!ifRange.startsWith('"') && !ifRange.startsWith('W/') && Math.floor(stat.mtimeMs / 1000) <= Math.floor(Date.parse(ifRange) / 1000)));
            if (useRange) {
                const match = /^bytes=(\d*)-(\d*)$/.exec(rangeHeader);
                let valid = Boolean(match && (match[1] || match[2]) && stat.size > 0);
                if (valid) {
                    if (match[1]) { from = Number(match[1]); to = match[2] ? Math.min(Number(match[2]), stat.size - 1) : stat.size - 1; }
                    else { const count = Number(match[2]); from = Math.max(0, stat.size - count); to = stat.size - 1; valid = count > 0; }
                    valid = valid && Number.isSafeInteger(from) && Number.isSafeInteger(to) && from <= to && from < stat.size;
                }
                if (!valid) { res.writeHead(416, { 'Content-Range':'bytes */' + stat.size, 'Content-Length':0 }); res.end(); return; }
                status = 206; res.setHeader('Content-Range', `bytes ${from}-${to}/${stat.size}`);
            }
            res.setHeader('Content-Length', buffer ? buffer.length : Math.max(0, to - from + 1));
            res.writeHead(status);
            if (head || stat.size === 0) { res.end(); return; }
            if (buffer) { res.end(buffer); return; }
            // In particular, video is never read wholly into memory or compressed.
            const stream = fs.createReadStream(file, { start:from, end:to });
            const abort = () => stream.destroy(); res.once('close', abort);
            stream.once('error', () => res.destroy()); stream.once('close', () => res.removeListener('close', abort)); stream.pipe(res);
        } catch (error) {
            if (res.headersSent) res.destroy();
            else fail(res, error.code === 'ENOENT' || error.code === 'ENOTDIR' ? 404 : error.code === 'EACCES' ? 403 : 500, error.code === 'ENOENT' || error.code === 'ENOTDIR' ? 'Not found' : 'Unable to serve file', head);
        }
    });
}
module.exports = { createPortfolioServer };
if (require.main === module) {
    const port = Number(process.argv[2] || process.env.PORT || 4173);
    if (!Number.isInteger(port) || port < 1 || port > 65535) throw Error('Port must be an integer from 1 to 65535');
    const server = createPortfolioServer();
    server.on('error', error => { console.error(error.message); process.exitCode = 1; });
    server.listen(port, '127.0.0.1', () => console.log(`Portfolio preview: http://127.0.0.1:${port}/`));
}
