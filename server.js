const http = require('http');
const https = require('https');
const url = require('url');

const PORT = process.env.PORT || 3000;
const STORE = process.env.SHOPIFY_STORE || 'luxavo-shop.myshopify.com';
const TOKEN = process.env.SHOPIFY_TOKEN || '';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-Shopify-Token',
  'Content-Type': 'application/json'
};

function shopifyGet(path, token, cb) {
  const opts = {
    hostname: STORE,
    path: `/admin/api/2024-01${path}`,
    method: 'GET',
    headers: { 'X-Shopify-Access-Token': token, 'Content-Type': 'application/json' }
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
  const path = p.pathname;
  const token = TOKEN || req.headers['x-shopify-token'] || p.query.token;

  const send = (status, data) => {
    res.writeHead(status, CORS);
    res.end(typeof data === 'string' ? data : JSON.stringify(data));
  };

  if (!token) { send(401, { error: 'No token — set SHOPIFY_TOKEN in Railway variables' }); return; }

  if (path === '/health') {
    send(200, { status: 'ok', store: STORE, tokenConfigured: !!TOKEN });
    return;
  }

  const days = p.query.days || 30;
  const since = new Date(Date.now() - days * 86400000).toISOString();

  const routes = {
    '/orders': `/orders.json?status=any&created_at_min=${since}&limit=250&fields=id,order_number,total_price,subtotal_price,financial_status,fulfillment_status,created_at,shipping_address,billing_address,line_items,customer,cancel_reason,refunds`,
    '/products': `/products.json?limit=250&fields=id,title,status,variants,created_at,updated_at,published_at,product_type,vendor`,
    '/customers': `/customers/count.json`,
    '/shop': `/shop.json`,
  };

  const apiPath = routes[path];
  if (!apiPath) { send(404, { error: 'Endpoint not found' }); return; }

  shopifyGet(apiPath, token, (err, status, data) => {
    if (err) { send(500, { error: err.message }); return; }
    send(status, data);
  });

}).listen(PORT, () => {
  console.log(`Vijgen Command Center proxy — port ${PORT}`);
  console.log(`Store: ${STORE}`);
  console.log(`Token: ${TOKEN ? 'configured ✓' : 'NOT SET — add SHOPIFY_TOKEN to Railway variables'}`);
});
