const http = require('http');
const https = require('https');
const url = require('url');

const PORT = process.env.PORT || 3000;
const ALLOWED_STORE = process.env.SHOPIFY_STORE || 'luxavo-shop.myshopify.com';
const SECRET = process.env.SHOPIFY_SECRET || '';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-Shopify-Token',
  'Content-Type': 'application/json'
};

function shopifyRequest(path, token, callback) {
  const options = {
    hostname: ALLOWED_STORE,
    path: `/admin/api/2024-01${path}`,
    method: 'GET',
    headers: {
      'X-Shopify-Access-Token': token,
      'Content-Type': 'application/json'
    }
  };
  const req = https.request(options, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => callback(null, res.statusCode, data));
  });
  req.on('error', (e) => callback(e));
  req.end();
}

const server = http.createServer((req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(200, CORS_HEADERS);
    res.end();
    return;
  }

  const parsed = url.parse(req.url, true);
  const pathname = parsed.pathname;
  const token = req.headers['x-shopify-token'] || parsed.query.token;

  if (!token) {
    res.writeHead(401, CORS_HEADERS);
    res.end(JSON.stringify({ error: 'No token provided' }));
    return;
  }

  // Health check
  if (pathname === '/health') {
    res.writeHead(200, CORS_HEADERS);
    res.end(JSON.stringify({ status: 'ok', store: ALLOWED_STORE }));
    return;
  }

  // Orders
  if (pathname === '/orders') {
    const days = parsed.query.days || 30;
    const since = new Date(Date.now() - days * 86400000).toISOString();
    const limit = parsed.query.limit || 250;
    const apiPath = `/orders.json?status=any&created_at_min=${since}&limit=${limit}&fields=id,order_number,total_price,subtotal_price,financial_status,fulfillment_status,created_at,shipping_address,billing_address,line_items,customer,cancel_reason,refunds`;
    shopifyRequest(apiPath, token, (err, status, data) => {
      if (err) { res.writeHead(500, CORS_HEADERS); res.end(JSON.stringify({ error: err.message })); return; }
      res.writeHead(status, CORS_HEADERS);
      res.end(data);
    });
    return;
  }

  // Products
  if (pathname === '/products') {
    shopifyRequest(`/products.json?limit=250&fields=id,title,status,variants,created_at,updated_at,published_at,product_type`, token, (err, status, data) => {
      if (err) { res.writeHead(500, CORS_HEADERS); res.end(JSON.stringify({ error: err.message })); return; }
      res.writeHead(status, CORS_HEADERS);
      res.end(data);
    });
    return;
  }

  // Customers count
  if (pathname === '/customers') {
    shopifyRequest(`/customers/count.json`, token, (err, status, data) => {
      if (err) { res.writeHead(500, CORS_HEADERS); res.end(JSON.stringify({ error: err.message })); return; }
      res.writeHead(status, CORS_HEADERS);
      res.end(data);
    });
    return;
  }

  // Refunds / returns
  if (pathname === '/refunds') {
    const since = new Date(Date.now() - 30 * 86400000).toISOString();
    shopifyRequest(`/orders.json?status=any&created_at_min=${since}&limit=250&fields=id,order_number,refunds,total_price,financial_status`, token, (err, status, data) => {
      if (err) { res.writeHead(500, CORS_HEADERS); res.end(JSON.stringify({ error: err.message })); return; }
      res.writeHead(status, CORS_HEADERS);
      res.end(data);
    });
    return;
  }

  // Shop info
  if (pathname === '/shop') {
    shopifyRequest(`/shop.json`, token, (err, status, data) => {
      if (err) { res.writeHead(500, CORS_HEADERS); res.end(JSON.stringify({ error: err.message })); return; }
      res.writeHead(status, CORS_HEADERS);
      res.end(data);
    });
    return;
  }

  res.writeHead(404, CORS_HEADERS);
  res.end(JSON.stringify({ error: 'Endpoint not found' }));
});

server.listen(PORT, () => {
  console.log(`Shopify proxy running on port ${PORT} for store: ${ALLOWED_STORE}`);
});
