const http = require('http');
const https = require('https');
const url = require('url');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const STORE = process.env.SHOPIFY_STORE || 'luxavo-shop.myshopify.com';
const TOKEN = process.env.SHOPIFY_TOKEN || '';

console.log('Vijgen OS starting — store:', STORE, '— token:', TOKEN ? 'SET' : 'NOT SET');

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json'
};

function shopifyGet(apiPath, cb) {
  const opts = {
    hostname: STORE,
    path: '/admin/api/2024-01' + apiPath,
    method: 'GET',
    headers: { 'X-Shopify-Access-Token': TOKEN, 'Content-Type': 'application/json' }
  };
  const req = https.request(opts, res => {
    let d = '';
    res.on('data', c => d += c);
    res.on('end', () => cb(null, res.statusCode, d));
  });
  req.on('error', e => cb(e));
  req.end();
}

http.createServer((req, res) => {
  if (req.method === 'OPTIONS') { res.writeHead(200, CORS); res.end(); return; }

  const p = url.parse(req.url, true);
  const pathname = p.pathname;

  const send = (status, data, type) => {
    res.writeHead(status, { ...CORS, 'Content-Type': type || 'application/json' });
    res.end(typeof data === 'string' ? data : JSON.stringify(data));
  };

  if (pathname === '/' || pathname === '/index.html') {
    const htmlPath = path.join(__dirname, 'index.html');
    fs.readFile(htmlPath, 'utf8', (err, data) => {
      if (err) { send(500, JSON.stringify({error: 'index.html not found'})); return; }
      send(200, data, 'text/html; charset=utf-8');
    });
    return;
  }

  if (pathname === '/health') {
    send(200, JSON.stringify({ status: 'ok', store: STORE, tokenConfigured: !!TOKEN }), 'application/json');
    return;
  }

  if (!TOKEN) { send(401, JSON.stringify({ error: 'No token configured' })); return; }

  const days = parseInt(p.query.days) || 30;
  const since = new Date(Date.now() - days * 86400000).toISOString();

  const routes = {
    '/orders': '/orders.json?status=any&created_at_min=' + since + '&limit=250&fields=id,order_number,total_price,subtotal_price,financial_status,fulfillment_status,created_at,shipping_address,billing_address,line_items,customer,cancel_reason,refunds',
    '/products': '/products.json?limit=250&fields=id,title,status,variants,created_at,updated_at,published_at,product_type,vendor',
    '/customers': '/customers/count.json',
    '/shop': '/shop.json'
  };

  const apiPath = routes[pathname];
  if (!apiPath) { send(404, JSON.stringify({ error: 'Not found' })); return; }

  shopifyGet(apiPath, (err, status, data) => {
    if (err) { send(500, JSON.stringify({ error: err.message })); return; }
    res.writeHead(status, CORS);
    res.end(data);
  });

}).listen(PORT, () => {
  console.log('Vijgen OS on port', PORT);
  console.log('Token:', TOKEN ? 'CONFIGURED' : 'NOT SET');
});
