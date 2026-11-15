#!/usr/bin/env node
// Serves the built site (./out) the way a plain static web host would, so it can be checked before it is uploaded.
// It needs nothing but Node:
//
//   npm run build && npm start
//
// Options:  --port 3000   --dir out
// A site built for a folder of its domain (NEXT_PUBLIC_BASE_PATH=/astrology) is served under that folder.
import { createReadStream, existsSync, readFileSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const args = process.argv.slice(2);
const option = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
};

const root = resolve(fileURLToPath(new URL('..', import.meta.url)), option('dir', 'out'));
const port = Number(option('port', process.env.PORT || 3000));

if (!existsSync(join(root, 'index.html'))) {
  console.error(`Nothing to serve: ${root} has no index.html. Run "npm run build" first.`);
  process.exit(1);
}

// The folder the site was built for is written into every page, in front of "/_next/". Read it back,
// so the site is served at the address its own links expect.
const builtFor = readFileSync(join(root, 'index.html'), 'utf8').match(/(?:src|href)="(\/[^"]*)?\/_next\/static\//);
const base = option('base', builtFor?.[1] ?? '').replace(/\/+$/, '');

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.map': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
};

const isFile = (path) => existsSync(path) && statSync(path).isFile();
const isDirectory = (path) => existsSync(path) && statSync(path).isDirectory();

function send(req, res, status, file, headers = {}) {
  const type = TYPES[extname(file).toLowerCase()] || 'application/octet-stream';
  // Files under _next/static carry a fingerprint in their name and never change; pages must always be fresh.
  const cache = file.includes(`${sep}_next${sep}static${sep}`) ? 'public, max-age=31536000, immutable' : 'no-cache';
  res.writeHead(status, { 'Content-Type': type, 'Content-Length': statSync(file).size, 'Cache-Control': cache, ...headers });
  if (req.method === 'HEAD') return res.end();
  createReadStream(file).pipe(res);
}

function redirect(res, location) {
  res.writeHead(301, { Location: location });
  res.end();
}

function notFound(req, res) {
  const page = join(root, '404.html');
  if (isFile(page)) return send(req, res, 404, page);
  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Not found');
}

const server = createServer((req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { Allow: 'GET, HEAD' });
    return res.end();
  }

  const url = new URL(req.url, 'http://localhost');
  let path;
  try {
    path = decodeURIComponent(url.pathname);
  } catch {
    return notFound(req, res);
  }

  if (base) {
    if (path === '/') return redirect(res, `${base}/`);
    if (path === base) return redirect(res, `${base}/${url.search}`);
    if (!path.startsWith(`${base}/`)) return notFound(req, res);
    path = path.slice(base.length);
  }

  // Never step outside the folder being served.
  const target = normalize(join(root, path));
  if (target !== root && !target.startsWith(root + sep)) return notFound(req, res);

  if (isDirectory(target)) {
    if (!path.endsWith('/')) return redirect(res, `${base}${path}/${url.search}`);
    const index = join(target, 'index.html');
    return isFile(index) ? send(req, res, 200, index) : notFound(req, res);
  }
  if (isFile(target)) return send(req, res, 200, target);
  if (isFile(`${target}.html`)) return send(req, res, 200, `${target}.html`);
  return notFound(req, res);
});

server.listen(port, '0.0.0.0', () => {
  console.log(`Static site from ${root}`);
  console.log(`  http://localhost:${port}${base}/`);
});
