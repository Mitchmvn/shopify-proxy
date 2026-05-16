# Shopify Proxy — Luxavo Command Center

## Deploy op Railway

1. Upload deze map naar een GitHub repository
2. Ga naar railway.app → New Project → Deploy from GitHub
3. Selecteer de repository
4. Voeg environment variable toe: SHOPIFY_STORE = luxavo-shop.myshopify.com
5. Railway geeft je een URL zoals: https://shopify-proxy-xxx.up.railway.app

## Endpoints

- GET /health — test of de proxy werkt
- GET /orders?days=30 — orders van afgelopen X dagen
- GET /products — alle producten
- GET /customers — klanten count
- GET /refunds — orders met terugbetalingen
- GET /shop — winkel info

## Authenticatie

Stuur je Shopify access token mee als header:
X-Shopify-Token: shpat_xxxxx
