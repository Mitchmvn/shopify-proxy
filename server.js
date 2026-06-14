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

const DASHBOARD = `<!DOCTYPE html>
<html lang="nl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Vijgen Command Center</title>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@2.44.0/tabler-icons.min.css">
<script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js"></script>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f5f5f4;color:#1a1a19;height:100vh;overflow:hidden}
.app{display:flex;height:100vh}
.sb{width:196px;flex-shrink:0;background:#fff;border-right:1px solid #e5e5e3;display:flex;flex-direction:column;overflow-y:auto}
.logo{padding:.875rem 1.125rem;border-bottom:1px solid #e5e5e3}
.logo-n{font-size:14px;font-weight:700;color:#1a1a19}
.logo-s{font-size:10px;color:#999;margin-top:2px}
.nv{font-size:9px;font-weight:700;color:#bbb;letter-spacing:.07em;text-transform:uppercase;padding:.625rem .75rem .15rem}
.ni{display:flex;align-items:center;gap:7px;padding:6px 1.125rem;font-size:12px;color:#555;cursor:pointer;border:none;background:none;width:100%;text-align:left;font-family:inherit}
.ni:hover{background:#f5f5f4;color:#1a1a19}
.ni.on{background:#f0f0ef;color:#1a1a19;font-weight:600;border-left:2px solid #185FA5;padding-left:calc(1.125rem - 2px)}
.ni i{font-size:14px}
.sb-ft{margin-top:auto;padding:.75rem 1.125rem;border-top:1px solid #e5e5e3}
.mn{flex:1;overflow-y:auto;padding:1.25rem;background:#f5f5f4}
.s{display:none}.s.on{display:block}
.ph{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:.875rem}
.pt{font-size:15px;font-weight:700;color:#1a1a19}
.ps{font-size:11px;color:#888;margin-top:2px}
.mg{display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:8px;margin-bottom:.875rem}
.mc{background:#fff;border:1px solid #e5e5e3;border-radius:10px;padding:.75rem .875rem}
.ml{font-size:10px;color:#888;margin-bottom:3px}
.mv{font-size:20px;font-weight:700;color:#1a1a19;line-height:1}
.ms{font-size:10px;color:#bbb;margin-top:3px}
.mv.pos{color:#0a6e3e}.mv.neg{color:#c00}.mv.warn{color:#b45}
.cd{background:#fff;border:1px solid #e5e5e3;border-radius:10px;padding:.875rem 1.125rem;margin-bottom:.75rem}
.ch{display:flex;align-items:center;justify-content:space-between;margin-bottom:.75rem}
.ct{font-size:12px;font-weight:700;color:#1a1a19;display:flex;align-items:center;gap:5px}
.ct i{font-size:13px;color:#888}
.tw{display:grid;grid-template-columns:1fr 1fr;gap:.75rem;margin-bottom:.75rem}
.pl{display:inline-flex;align-items:center;font-size:10px;padding:2px 7px;border-radius:7px;font-weight:600}
.pl-g{background:#e8f5e9;color:#2e7d32}
.pl-w{background:#fff3e0;color:#e65100}
.pl-r{background:#fce4ec;color:#c62828}
.pl-b{background:#e3f2fd;color:#1565c0}
.pl-m{background:#f5f5f4;color:#999}
.pl-nl{background:#e3f2fd;color:#0d47a1}
.pl-be{background:#e8f5e9;color:#1b5e20}
.rw{display:flex;align-items:center;justify-content:space-between;padding:6px 0;border-bottom:1px solid #f0f0ef;font-size:11px}
.rw:last-child{border-bottom:none;padding-bottom:0}
.btn{display:inline-flex;align-items:center;gap:4px;padding:6px 12px;border-radius:7px;border:1px solid #ddd;background:#fff;color:#1a1a19;font-size:11px;cursor:pointer;font-family:inherit;font-weight:600}
.btn:hover{background:#f5f5f4}
.btn-p{background:#185FA5;color:#fff;border-color:#185FA5}
.btn-p:hover{background:#0c4480}
.ir{display:flex;align-items:center;gap:8px;margin-bottom:8px}
.il{font-size:11px;color:#666;width:120px;flex-shrink:0}
.ir input{flex:1;font-size:12px;padding:6px 9px;border-radius:7px;border:1px solid #ddd;background:#fafafa;color:#1a1a19;font-family:inherit}
.ab{padding:8px 11px;border-radius:8px;font-size:11px;margin-bottom:6px;display:flex;align-items:flex-start;gap:7px;line-height:1.5}
.ab i{font-size:13px;flex-shrink:0;margin-top:1px}
.ab-r{background:#fce4ec;color:#b71c1c}
.ab-g{background:#e8f5e9;color:#1b5e20}
.ab-b{background:#e3f2fd;color:#0d47a1}
.ab-w{background:#fff3e0;color:#e65100}
.spin{display:inline-block;width:14px;height:14px;border:2px solid #ddd;border-top-color:#185FA5;border-radius:50%;animation:sp .7s linear infinite;vertical-align:middle}
@keyframes sp{to{transform:rotate(360deg)}}
.bw{flex:1;height:5px;background:#f0f0ef;border-radius:3px;overflow:hidden;margin:0 8px}
.bf{height:100%;border-radius:3px}
.og{display:grid;grid-template-columns:56px 1fr 34px 68px 72px 52px;gap:5px;align-items:center;padding:6px 0;border-bottom:1px solid #f0f0ef;font-size:11px}
.og:last-child{border-bottom:none}
.oh{font-size:10px;font-weight:600;color:#888}
.conn-dot{display:inline-block;width:7px;height:7px;border-radius:50%;margin-right:5px;vertical-align:middle}
.kpi-row{display:flex;align-items:center;gap:8px;padding:7px 10px;border-radius:7px;background:#f8f9fa;margin-bottom:4px}
.kpi-n{font-size:11px;font-weight:600;width:145px;flex-shrink:0}
.kpi-t{flex:1;height:5px;background:#e5e5e3;border-radius:3px;overflow:hidden}
.kpi-f{height:100%;border-radius:3px}
.kpi-v{font-size:11px;font-weight:700;min-width:38px;text-align:right}
.kpi-g{font-size:10px;color:#bbb;min-width:56px;text-align:right}
.scale-b{background:#f8f9fa;border-radius:8px;padding:9px 11px;margin-bottom:5px;display:flex;align-items:center;gap:10px}
.lvl-d{width:9px;height:9px;border-radius:50%;flex-shrink:0}
.dv{border:none;border-top:1px solid #f0f0ef;margin:.75rem 0}
.loading-overlay{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(255,255,255,0.9);display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:999;font-size:14px;color:#555;gap:12px}
</style>
</head>
<body>

<div id="loading-overlay" class="loading-overlay">
  <div class="spin" style="width:24px;height:24px;border-width:3px"></div>
  <div id="loading-msg">Verbinding maken met Shopify...</div>
</div>

<div class="app">
  <aside class="sb">
    <div class="logo">
      <div class="logo-n">Vijgen OS</div>
      <div class="logo-s">€70k → €1M+</div>
    </div>
    <span class="nv">Command</span>
    <button class="ni on" onclick="nav('dashboard')" id="n-dashboard"><i class="ti ti-layout-dashboard"></i>Dashboard</button>
    <button class="ni" onclick="nav('scale')" id="n-scale"><i class="ti ti-rocket"></i>Scaling engine</button>
    <button class="ni" onclick="nav('kpi')" id="n-kpi"><i class="ti ti-target"></i>KPI targets</button>
    <span class="nv">Finance</span>
    <button class="ni" onclick="nav('finance')" id="n-finance"><i class="ti ti-coin"></i>P&L & cashflow</button>
    <button class="ni" onclick="nav('ads')" id="n-ads"><i class="ti ti-speakerphone"></i>Ads & ROAS</button>
    <span class="nv">Operaties</span>
    <button class="ni" onclick="nav('orders')" id="n-orders"><i class="ti ti-shopping-cart"></i>Orders</button>
    <button class="ni" onclick="nav('countries')" id="n-countries"><i class="ti ti-world"></i>Per land</button>
    <button class="ni" onclick="nav('products')" id="n-products"><i class="ti ti-chart-bar"></i>Producten</button>
    <button class="ni" onclick="nav('fulfillment')" id="n-fulfillment"><i class="ti ti-truck"></i>Fulfillment</button>
    <button class="ni" onclick="nav('service')" id="n-service"><i class="ti ti-message-circle"></i>Klantenservice</button>
    <button class="ni" onclick="nav('listings')" id="n-listings"><i class="ti ti-tag"></i>Listings</button>
    <button class="ni" onclick="nav('bugs')" id="n-bugs"><i class="ti ti-bug"></i>Bugs & fixes</button>
    <div class="sb-ft">
      <div style="font-size:10px;color:#555;display:flex;align-items:center;">
        <span class="conn-dot" id="conn-dot" style="background:#ccc"></span>
        <span id="conn-label">Laden...</span>
      </div>
      <div style="font-size:10px;color:#bbb;margin-top:2px" id="conn-info"></div>
      <button class="btn" onclick="loadData()" style="margin-top:6px;font-size:10px;padding:4px 8px;width:100%;justify-content:center;"><i class="ti ti-refresh"></i> Vernieuwen</button>
    </div>
  </aside>

  <main class="mn">

    <!-- DASHBOARD -->
    <div class="s on" id="s-dashboard">
      <div class="ph">
        <div><div class="pt">Dashboard</div><div class="ps" id="dash-sub">Live Shopify data</div></div>
        <div style="display:flex;gap:5px;">
          <div style="display:flex;gap:2px;background:#f0f0ef;padding:2px;border-radius:7px;">
            <button class="btn" style="padding:3px 9px;font-size:11px;background:#fff;border:1px solid #ddd;" id="f-all" onclick="filterC('all',this)">Totaal</button>
            <button class="btn" style="padding:3px 9px;font-size:11px;border:none;background:none;" id="f-nl" onclick="filterC('NL',this)">NL</button>
            <button class="btn" style="padding:3px 9px;font-size:11px;border:none;background:none;" id="f-be" onclick="filterC('BE',this)">BE</button>
          </div>
          <select id="days-sel" onchange="changeDays()" style="font-size:11px;padding:4px 8px;border-radius:7px;border:1px solid #ddd;background:#fff;">
            <option value="30">30 dagen</option>
            <option value="7">7 dagen</option>
            <option value="60">60 dagen</option>
            <option value="90">90 dagen</option>
          </select>
        </div>
      </div>
      <div class="mg">
        <div class="mc"><div class="ml">Omzet</div><div class="mv" id="d-omzet">—</div><div class="ms" id="d-omzet-s">—</div></div>
        <div class="mc"><div class="ml">Nettowinst</div><div class="mv pos" id="d-winst">—</div><div class="ms" id="d-marge">—</div></div>
        <div class="mc"><div class="ml">Orders</div><div class="mv" id="d-orders">—</div><div class="ms" id="d-orders-s">—</div></div>
        <div class="mc"><div class="ml">Gem. order</div><div class="mv" id="d-aov">—</div><div class="ms">per bestelling</div></div>
        <div class="mc"><div class="ml">Klanten</div><div class="mv" id="d-klanten">—</div><div class="ms">uniek</div></div>
        <div class="mc"><div class="ml">Retouren</div><div class="mv" id="d-refunds">—</div><div class="ms" id="d-refunds-s">—</div></div>
      </div>
      <div class="tw">
        <div class="cd">
          <div class="ch"><div class="ct"><i class="ti ti-world"></i>NL vs BE</div></div>
          <div id="nl-be-bars">laden...</div>
        </div>
        <div class="cd">
          <div class="ch"><div class="ct"><i class="ti ti-chart-pie"></i>Status verdeling</div></div>
          <div style="position:relative;height:140px;"><canvas id="statusChart"></canvas></div>
          <div id="status-legend" style="display:flex;flex-wrap:wrap;gap:6px;margin-top:6px;font-size:10px;color:#777;"></div>
        </div>
      </div>
      <div class="cd">
        <div class="ch"><div class="ct"><i class="ti ti-chart-line"></i>Omzet per dag</div></div>
        <div style="position:relative;height:155px;"><canvas id="trendChart"></canvas></div>
      </div>
    </div>

    <!-- SCALING ENGINE -->
    <div class="s" id="s-scale">
      <div class="ph"><div><div class="pt">Scaling engine</div><div class="ps">Van €70k naar €1M+ — jouw roadmap</div></div></div>
      <div class="cd">
        <div class="ch"><div class="ct"><i class="ti ti-rocket"></i>Jouw traject nu</div></div>
        <div class="scale-b" style="background:#f0f7ff;border:1px solid #b3d4f5;">
          <div class="lvl-d" style="background:#185FA5"></div>
          <div style="flex:1;font-size:12px;"><strong style="color:#185FA5">Je zit hier — €30k-€100k/maand</strong><br><span style="color:#555;font-size:11px;">Op €70k. Nog €30k naar het eerste milestone.</span></div>
          <div style="font-size:13px;font-weight:700;color:#185FA5">70%</div>
        </div>
        <div class="scale-b"><div class="lvl-d" style="background:#ef9f27"></div><div style="flex:1;font-size:11px;"><strong>Volgende: €100k-€300k/maand</strong><br><span style="color:#555">Live API's + CS tool + winnaar systeem</span></div></div>
        <div class="scale-b"><div class="lvl-d" style="background:#1D9E75"></div><div style="flex:1;font-size:11px;"><strong>Later: €300k-€1M+/maand</strong><br><span style="color:#555">Multi-store + private label + AI team OS</span></div></div>
      </div>
      <div class="cd">
        <div class="ch"><div class="ct"><i class="ti ti-list-check"></i>Acties voor deze week</div></div>
        <div class="ab ab-g"><i class="ti ti-trending-up"></i><div><strong>Meta budget +40% op top winnaar</strong> — zodra ROAS stabiel >4x, verhoog wekelijks budget 30-40%.</div></div>
        <div class="ab ab-r"><i class="ti ti-ad-off"></i><div><strong>Pauzeer campagnes onder 2x ROAS direct</strong> — budget herplaatsen naar winnaars.</div></div>
        <div class="ab ab-w"><i class="ti ti-flask"></i><div><strong>Start 2-3 nieuwe producttests</strong> — €150 testbudget, 7 dagen, drempel 2,5x ROAS.</div></div>
        <div class="ab ab-w"><i class="ti ti-headset"></i><div><strong>CS tool instellen vóór €100k</strong> — Gorgias koppelen, AI beantwoordt 80% automatisch.</div></div>
      </div>
      <div class="cd">
        <div class="ch"><div class="ct"><i class="ti ti-stairs"></i>Mijlpalen & wat er nodig is</div></div>
        <div class="rw"><span class="pl pl-b">€100k</span><span style="flex:1;padding-left:8px;font-size:11px;">Live Ads API (Meta + Google via WeTracked) — schalen op echte data</span></div>
        <div class="rw"><span class="pl pl-b">€100k</span><span style="flex:1;padding-left:8px;font-size:11px;">Gorgias CS — WhatsApp onschaalbaar bij 300+ orders/dag</span></div>
        <div class="rw"><span class="pl pl-b">€150k</span><span style="flex:1;padding-left:8px;font-size:11px;">Tweede markt DE of FR — multifeed uitrollen</span></div>
        <div class="rw"><span class="pl pl-b">€200k</span><span style="flex:1;padding-left:8px;font-size:11px;">Tweede dropship store of niche store toevoegen</span></div>
        <div class="rw"><span class="pl pl-b">€300k</span><span style="flex:1;padding-left:8px;font-size:11px;">Private label top 3 producten — marge van 22% naar 45%+</span></div>
        <div class="rw" style="border:none;"><span class="pl pl-b">€500k+</span><span style="flex:1;padding-left:8px;font-size:11px;">Brand + dropship portfolio — underwear brand als anker</span></div>
      </div>
    </div>

    <!-- KPI -->
    <div class="s" id="s-kpi">
      <div class="ph"><div><div class="pt">KPI targets</div><div class="ps">Live performance vs jouw doelen</div></div></div>
      <div class="cd">
        <div class="ch"><div class="ct"><i class="ti ti-target"></i>Financiële KPI's</div></div>
        <div class="kpi-row"><span class="kpi-n">Maandomzet</span><div class="kpi-t"><div class="kpi-f" id="kpi-omzet-bar" style="background:#185FA5;width:0%"></div></div><span class="kpi-v" id="kpi-omzet-val" style="color:#185FA5">—</span><span class="kpi-g">doel: €100k</span></div>
        <div class="kpi-row"><span class="kpi-n">Nettomarge</span><div class="kpi-t"><div class="kpi-f" id="kpi-marge-bar" style="background:#ef9f27;width:0%"></div></div><span class="kpi-v" id="kpi-marge-val" style="color:#b45">—</span><span class="kpi-g">doel: 25%</span></div>
        <div class="kpi-row"><span class="kpi-n">MoM groei</span><div class="kpi-t"><div class="kpi-f" style="background:#1D9E75;width:90%"></div></div><span class="kpi-v" style="color:#0a6e3e">+18%</span><span class="kpi-g">doel: +20%</span></div>
        <div class="kpi-row"><span class="kpi-n">Ad spend ratio</span><div class="kpi-t"><div class="kpi-f" style="background:#ef9f27;width:78%"></div></div><span class="kpi-v" style="color:#b45">27,6%</span><span class="kpi-g">max: 30%</span></div>
      </div>
      <div class="tw">
        <div class="cd">
          <div class="ch"><div class="ct"><i class="ti ti-speakerphone"></i>Ads KPI's</div></div>
          <div class="kpi-row"><span class="kpi-n">ROAS totaal</span><div class="kpi-t"><div class="kpi-f" style="width:100%;background:#1D9E75"></div></div><span class="kpi-v" style="color:#0a6e3e">3,6x</span><span class="kpi-g">doel: 3,5x</span></div>
          <div class="kpi-row"><span class="kpi-n">Meta ROAS</span><div class="kpi-t"><div class="kpi-f" style="width:100%;background:#1D9E75"></div></div><span class="kpi-v" style="color:#0a6e3e">4,2x</span><span class="kpi-g">doel: 3,5x</span></div>
          <div class="kpi-row"><span class="kpi-n">Google ROAS</span><div class="kpi-t"><div class="kpi-f" style="width:54%;background:#ef9f27"></div></div><span class="kpi-v" style="color:#b45">2,7x</span><span class="kpi-g">doel: 3x</span></div>
          <div class="kpi-row"><span class="kpi-n">CPA</span><div class="kpi-t"><div class="kpi-f" style="width:82%;background:#185FA5"></div></div><span class="kpi-v" style="color:#185FA5">€21,90</span><span class="kpi-g">max: €25</span></div>
        </div>
        <div class="cd">
          <div class="ch"><div class="ct"><i class="ti ti-truck"></i>Operationele KPI's</div></div>
          <div class="kpi-row"><span class="kpi-n">Gem. levertijd</span><div class="kpi-t"><div class="kpi-f" style="width:84%;background:#185FA5"></div></div><span class="kpi-v" style="color:#185FA5">8,4d</span><span class="kpi-g">max: 10d</span></div>
          <div class="kpi-row"><span class="kpi-n">Retourrate</span><div class="kpi-t"><div class="kpi-f" id="kpi-retour-bar" style="width:0%;background:#1D9E75"></div></div><span class="kpi-v" id="kpi-retour-val">—</span><span class="kpi-g">max: 8%</span></div>
          <div class="kpi-row"><span class="kpi-n">CS responstijd</span><div class="kpi-t"><div class="kpi-f" style="width:75%;background:#ef9f27"></div></div><span class="kpi-v" style="color:#b45">18u</span><span class="kpi-g">doel: &lt;12u</span></div>
          <div class="kpi-row"><span class="kpi-n">Chargeback %</span><div class="kpi-t"><div class="kpi-f" id="kpi-cb-bar" style="width:0%;background:#1D9E75"></div></div><span class="kpi-v" id="kpi-cb-val">—</span><span class="kpi-g">max: 1%</span></div>
        </div>
      </div>
      <div class="cd">
        <div class="ch"><div class="ct"><i class="ti ti-calendar"></i>Tijdlijn doelen</div></div>
        <div class="rw"><span style="font-weight:700;width:88px;font-size:11px;">3 maanden</span><span style="font-size:11px;color:#555;flex:1">€100k omzet · 25% marge · CS geautomatiseerd</span><span class="pl pl-w">Q3 2026</span></div>
        <div class="rw"><span style="font-weight:700;width:88px;font-size:11px;">6 maanden</span><span style="font-size:11px;color:#555;flex:1">€180k · 2e markt (DE/FR) · 10+ winnaars</span><span class="pl pl-m">Q4 2026</span></div>
        <div class="rw"><span style="font-weight:700;width:88px;font-size:11px;">12 maanden</span><span style="font-size:11px;color:#555;flex:1">€300k · brand live · private label top 3</span><span class="pl pl-m">Q2 2027</span></div>
        <div class="rw" style="border:none;"><span style="font-weight:700;width:88px;font-size:11px;">24 maanden</span><span style="font-size:11px;color:#555;flex:1">€1M+ · portfolio stores + brand · team OS</span><span class="pl pl-m">2028</span></div>
      </div>
    </div>

    <!-- FINANCE -->
    <div class="s" id="s-finance">
      <div class="ph"><div><div class="pt">P&L & cashflow</div><div class="ps">Live Shopify omzet + jouw kosten</div></div></div>
      <div class="tw">
        <div class="cd">
          <div class="ch"><div class="ct"><i class="ti ti-pencil"></i>Kosten invoeren</div><button class="btn btn-p" style="font-size:10px;" onclick="calcPL()">Bereken</button></div>
          <div class="ab ab-g" id="live-omzet-box"><i class="ti ti-shopping-cart"></i>Live omzet laden...</div>
          <div style="margin-top:8px;">
            <div class="ir"><span class="il">Inkoop / COGS (€)</span><input type="number" id="pl-inkoop" placeholder="0" oninput="calcPL()"/></div>
            <div class="ir"><span class="il">Meta Ads (€)</span><input type="number" id="pl-meta" placeholder="0" oninput="calcPL()"/></div>
            <div class="ir"><span class="il">Google Ads (€)</span><input type="number" id="pl-google" placeholder="0" oninput="calcPL()"/></div>
            <div class="ir"><span class="il">Shopify + apps (€)</span><input type="number" id="pl-shopify" placeholder="420" oninput="calcPL()"/></div>
            <div class="ir"><span class="il">Overige kosten (€)</span><input type="number" id="pl-overig" placeholder="0" oninput="calcPL()"/></div>
          </div>
          <div class="dv"></div>
          <div style="display:flex;justify-content:space-between;font-size:13px;font-weight:700;padding:3px 0;"><span>Nettowinst</span><span id="pl-winst" style="color:#0a6e3e">—</span></div>
          <div style="display:flex;justify-content:space-between;font-size:11px;color:#777;padding-top:3px;"><span>Nettomarge</span><span id="pl-marge">—</span></div>
        </div>
        <div class="cd">
          <div class="ch"><div class="ct"><i class="ti ti-cash"></i>Schaalbudget</div></div>
          <div class="mc" style="margin-bottom:7px;"><div class="ml">Beschikbare cashflow</div><div class="mv" id="cf-total">—</div></div>
          <div class="mc" style="margin-bottom:7px;"><div class="ml">Veilig investeren (60%)</div><div class="mv pos" id="cf-invest">—</div><div class="ms">ads + nieuwe producten</div></div>
          <div class="mc"><div class="ml">Reserve houden (40%)</div><div class="mv" id="cf-reserve">—</div><div class="ms">buffer + inkoop</div></div>
          <div class="dv"></div>
          <div style="font-size:11px;font-weight:700;margin-bottom:7px;">3-maands projectie (+20%/maand)</div>
          <div class="rw"><span style="font-size:11px;color:#777">Maand 1</span><span class="pl pl-b" id="proj1">—</span></div>
          <div class="rw"><span style="font-size:11px;color:#777">Maand 2</span><span class="pl pl-g" id="proj2">—</span></div>
          <div class="rw" style="border:none;"><span style="font-size:11px;color:#777">Maand 3</span><span class="pl pl-g" id="proj3">—</span></div>
        </div>
      </div>
    </div>

    <!-- ADS -->
    <div class="s" id="s-ads">
      <div class="ph"><div><div class="pt">Ads & ROAS</div><div class="ps">Meta + Google · NL vs BE · via WeTracked</div></div></div>
      <div class="mg">
        <div class="mc"><div class="ml">Meta ROAS NL</div><div class="mv pos">4,8x</div></div>
        <div class="mc"><div class="ml">Meta ROAS BE</div><div class="mv">3,1x</div></div>
        <div class="mc"><div class="ml">Google ROAS NL</div><div class="mv">3,2x</div></div>
        <div class="mc"><div class="ml">Google ROAS BE</div><div class="mv neg">1,8x</div></div>
        <div class="mc"><div class="ml">Totaal spend</div><div class="mv warn">€19.400</div></div>
        <div class="mc"><div class="ml">Gem. CPA</div><div class="mv">€21,90</div></div>
      </div>
      <div class="ab ab-r"><i class="ti ti-ad-off"></i><strong>Pauzeer BE Google direct</strong> — ROAS 1,8x, verliesgevend. Budget → Meta NL.</div>
      <div class="ab ab-g"><i class="ti ti-trending-up"></i><strong>Meta NL budget verhogen</strong> — ROAS 4,8x stabiel. +30-40% per week opschalen.</div>
      <div class="tw" style="margin-top:.75rem;">
        <div class="cd">
          <div class="ch"><div class="ct"><i class="ti ti-brand-meta"></i>Meta Ads invoer</div></div>
          <div class="ir"><span class="il">NL spend (€)</span><input type="number" id="m-nl-s" value="6840" oninput="calcAds()"/></div>
          <div class="ir"><span class="il">NL omzet (€)</span><input type="number" id="m-nl-r" value="32832" oninput="calcAds()"/></div>
          <div class="ir"><span class="il">BE spend (€)</span><input type="number" id="m-be-s" value="4560" oninput="calcAds()"/></div>
          <div class="ir"><span class="il">BE omzet (€)</span><input type="number" id="m-be-r" value="14136" oninput="calcAds()"/></div>
          <div class="dv"></div>
          <div style="font-size:11px;">NL ROAS: <strong id="m-nl-roas">4,8x</strong> · BE ROAS: <strong id="m-be-roas">3,1x</strong></div>
        </div>
        <div class="cd">
          <div class="ch"><div class="ct"><i class="ti ti-brand-google"></i>Google Ads invoer</div></div>
          <div class="ir"><span class="il">NL spend (€)</span><input type="number" id="g-nl-s" value="4800" oninput="calcAds()"/></div>
          <div class="ir"><span class="il">NL omzet (€)</span><input type="number" id="g-nl-r" value="15360" oninput="calcAds()"/></div>
          <div class="ir"><span class="il">BE spend (€)</span><input type="number" id="g-be-s" value="3200" oninput="calcAds()"/></div>
          <div class="ir"><span class="il">BE omzet (€)</span><input type="number" id="g-be-r" value="5760" oninput="calcAds()"/></div>
          <div class="dv"></div>
          <div style="font-size:11px;">NL ROAS: <strong id="g-nl-roas">3,2x</strong> · BE ROAS: <strong id="g-be-roas" style="color:#c00">1,8x</strong></div>
        </div>
      </div>
    </div>

    <!-- ORDERS -->
    <div class="s" id="s-orders">
      <div class="ph">
        <div><div class="pt">Orders</div><div class="ps" id="orders-sub">Live bestellingen</div></div>
        <div style="display:flex;gap:2px;background:#f0f0ef;padding:2px;border-radius:7px;">
          <button class="btn" style="padding:3px 8px;font-size:11px;background:#fff;border:1px solid #ddd;" onclick="filterO('all')">Alle</button>
          <button class="btn" style="padding:3px 8px;font-size:11px;border:none;background:none;" onclick="filterO('NL')">NL</button>
          <button class="btn" style="padding:3px 8px;font-size:11px;border:none;background:none;" onclick="filterO('BE')">BE</button>
          <button class="btn" style="padding:3px 8px;font-size:11px;border:none;background:none;" onclick="filterO('paid')">Betaald</button>
          <button class="btn" style="padding:3px 8px;font-size:11px;border:none;background:none;" onclick="filterO('refunded')">Retour</button>
        </div>
      </div>
      <div class="cd">
        <div style="display:grid;grid-template-columns:56px 1fr 34px 68px 72px 52px;gap:5px;padding:4px 0;border-bottom:1px solid #e5e5e3;">
          <span class="oh">#Order</span><span class="oh">Klant</span><span class="oh">Land</span><span class="oh" style="text-align:right;">Bedrag</span><span class="oh">Status</span><span class="oh">Datum</span>
        </div>
        <div id="orders-list" style="font-size:11px;color:#bbb;padding:10px 0;">Laden...</div>
      </div>
    </div>

    <!-- PER LAND -->
    <div class="s" id="s-countries">
      <div class="ph"><div><div class="pt">Per land</div><div class="ps">Live NL vs BE + alle landen</div></div></div>
      <div class="mg" style="grid-template-columns:repeat(auto-fit,minmax(130px,1fr));">
        <div class="mc"><div class="ml">NL omzet</div><div class="mv" id="nl-omzet">—</div><div class="ms" id="nl-cnt">—</div></div>
        <div class="mc"><div class="ml">NL gem. order</div><div class="mv" id="nl-aov">—</div><div class="ms" id="nl-pct">—</div></div>
        <div class="mc"><div class="ml">BE omzet</div><div class="mv" id="be-omzet">—</div><div class="ms" id="be-cnt">—</div></div>
        <div class="mc"><div class="ml">BE gem. order</div><div class="mv" id="be-aov">—</div><div class="ms" id="be-pct">—</div></div>
      </div>
      <div class="cd">
        <div class="ch"><div class="ct"><i class="ti ti-world"></i>Alle landen — omzet ranking</div></div>
        <div id="all-countries" style="font-size:11px;color:#bbb;">Laden...</div>
      </div>
    </div>

    <!-- PRODUCTEN -->
    <div class="s" id="s-products">
      <div class="ph"><div><div class="pt">Producten</div><div class="ps">Live top producten + listing velocity</div></div></div>
      <div class="mg">
        <div class="mc"><div class="ml">Actieve listings</div><div class="mv" id="p-active">—</div></div>
        <div class="mc"><div class="ml">Draft listings</div><div class="mv warn" id="p-draft">—</div></div>
        <div class="mc"><div class="ml">Nieuw (periode)</div><div class="mv pos" id="p-new">—</div></div>
        <div class="mc"><div class="ml">Top product</div><div class="mv" id="p-top" style="font-size:12px;">—</div></div>
      </div>
      <div class="tw">
        <div class="cd">
          <div class="ch"><div class="ct"><i class="ti ti-trophy"></i>Top producten op omzet</div></div>
          <div id="top-products" style="font-size:11px;color:#bbb;">Laden...</div>
        </div>
        <div class="cd">
          <div class="ch"><div class="ct"><i class="ti ti-tag"></i>Listing velocity</div></div>
          <div id="listing-velocity" style="font-size:11px;color:#bbb;margin-bottom:8px;">Laden...</div>
          <div style="position:relative;height:110px;"><canvas id="listChart"></canvas></div>
        </div>
      </div>
    </div>

    <!-- FULFILLMENT -->
    <div class="s" id="s-fulfillment">
      <div class="ph"><div><div class="pt">Fulfillment</div><div class="ps">Leveringen · partner taken</div></div></div>
      <div class="mg">
        <div class="mc"><div class="ml">Onvervuld</div><div class="mv" id="ff-open">—</div></div>
        <div class="mc"><div class="ml">Verzonden</div><div class="mv" id="ff-shipped">—</div></div>
        <div class="mc"><div class="ml">Geleverd</div><div class="mv pos" id="ff-delivered">—</div></div>
        <div class="mc"><div class="ml">Geannuleerd</div><div class="mv" id="ff-cancelled">—</div></div>
      </div>
      <div class="cd">
        <div class="ch"><div class="ct"><i class="ti ti-users"></i>Fulfillment partner taken</div></div>
        <div id="ff-tasks">
          <div class="rw"><div style="display:flex;align-items:center;gap:7px;"><input type="checkbox" onchange="this.closest('.rw').style.opacity=this.checked?'.4':'1'"><span style="font-size:11px">Supplier contacteren voor vertraagde orders</span></div><span class="pl pl-r">Urgent</span></div>
          <div class="rw"><div style="display:flex;align-items:center;gap:7px;"><input type="checkbox" onchange="this.closest('.rw').style.opacity=this.checked?'.4':'1'"><span style="font-size:11px">Retouren verwerken deze week</span></div><span class="pl pl-w">Deze week</span></div>
          <div class="rw" style="border:none;"><div style="display:flex;align-items:center;gap:7px;"><input type="checkbox" onchange="this.closest('.rw').style.opacity=this.checked?'.4':'1'"><span style="font-size:11px">Nieuwe inkoop plaatsen top producten</span></div><span class="pl pl-m">Gepland</span></div>
        </div>
        <div style="display:flex;gap:7px;margin-top:9px;">
          <input type="text" id="ff-inp" placeholder="Taak toevoegen..." style="flex:1;font-size:11px;padding:6px 9px;border-radius:7px;border:1px solid #ddd;font-family:inherit;">
          <button class="btn" onclick="addFFTask()"><i class="ti ti-plus"></i></button>
        </div>
      </div>
    </div>

    <!-- KLANTENSERVICE -->
    <div class="s" id="s-service">
      <div class="ph"><div><div class="pt">Klantenservice</div><div class="ps">Live issues · retouren · chargebacks</div></div></div>
      <div class="mg">
        <div class="mc"><div class="ml">Open issues</div><div class="mv warn" id="cs-open">—</div></div>
        <div class="mc"><div class="ml">Retouren</div><div class="mv" id="cs-refunds">—</div></div>
        <div class="mc"><div class="ml">Geannuleerd</div><div class="mv" id="cs-cancelled">—</div></div>
        <div class="mc"><div class="ml">Retourrate</div><div class="mv" id="cs-rate">—</div></div>
      </div>
      <div class="cd">
        <div class="ch"><div class="ct"><i class="ti ti-list"></i>Actieve issues</div></div>
        <div id="cs-list" style="font-size:11px;color:#bbb;">Laden...</div>
      </div>
    </div>

    <!-- LISTINGS -->
    <div class="s" id="s-listings">
      <div class="ph"><div><div class="pt">Listings</div><div class="ps">Activiteit · draft → actief · pijplijn</div></div></div>
      <div class="mg">
        <div class="mc"><div class="ml">Actief</div><div class="mv" id="l-active">—</div></div>
        <div class="mc"><div class="ml">Draft</div><div class="mv warn" id="l-draft">—</div></div>
        <div class="mc"><div class="ml">Gearchiveerd</div><div class="mv" id="l-archived">—</div></div>
        <div class="mc"><div class="ml">Nieuw (periode)</div><div class="mv pos" id="l-new">—</div></div>
      </div>
      <div class="cd">
        <div class="ch"><div class="ct"><i class="ti ti-clock"></i>Draft listings — wacht op publicatie</div></div>
        <div id="draft-list" style="font-size:11px;color:#bbb;">Laden...</div>
      </div>
    </div>

    <!-- BUGS -->
    <div class="s" id="s-bugs">
      <div class="ph">
        <div><div class="pt">Bugs & fixes</div><div class="ps">Frontend + backend · prioriteit</div></div>
        <button class="btn btn-p" onclick="addBug()" style="font-size:11px;"><i class="ti ti-plus"></i>Bug melden</button>
      </div>
      <div class="cd">
        <div class="ch"><div class="ct"><i class="ti ti-bug"></i>Actieve bugs</div></div>
        <div id="bug-list">
          <div class="rw"><div style="display:flex;align-items:center;gap:7px;"><span class="pl pl-r">Kritiek</span><div><div style="font-size:11px;font-weight:600">Checkout — betaling mislukt mobiel BE</div><div style="font-size:10px;color:#777">iDEAL redirect · conversieverlies</div></div></div></div>
          <div class="rw"><div style="display:flex;align-items:center;gap:7px;"><span class="pl pl-w">Hoog</span><div><div style="font-size:11px;font-weight:600">Productfoto's traag op mobiel</div><div style="font-size:10px;color:#777">Laadtijd >4s · beïnvloedt conversie</div></div></div></div>
          <div class="rw" style="border:none;"><div style="display:flex;align-items:center;gap:7px;"><span class="pl pl-m">Laag</span><div><div style="font-size:11px;font-weight:600">Kortingscode werkt niet bij bundle</div><div style="font-size:10px;color:#777">Shopify discount conflict</div></div></div></div>
        </div>
      </div>
    </div>

  </main>
</div>

<script>
const PROXY = '';
let D = null;
let charts = {};
let oFilter = 'all';
let currentDays = 30;

function nav(s) {
  document.querySelectorAll('.s').forEach(e => e.classList.remove('on'));
  document.querySelectorAll('.ni').forEach(e => e.classList.remove('on'));
  document.getElementById('s-' + s).classList.add('on');
  document.getElementById('n-' + s).classList.add('on');
}
function g(id) { return document.getElementById(id); }
function set(id, v) { const e = g(id); if(e) e.textContent = v; }
function html(id, v) { const e = g(id); if(e) e.innerHTML = v; }
function fmt(n) { return '€' + Math.round(n).toLocaleString('nl-NL'); }
function fmtD(n) { return '€' + Number(n).toFixed(2).replace('.', ','); }
function cc(o) { return ((o.shipping_address && o.shipping_address.country_code) || (o.billing_address && o.billing_address.country_code) || '??').toUpperCase(); }

async function fetchWithTimeout(url, ms) {
  const ctrl = new AbortController();
  const tid = setTimeout(() => ctrl.abort(), ms);
  try {
    const r = await fetch(url, { signal: ctrl.signal });
    clearTimeout(tid);
    return r;
  } catch(e) {
    clearTimeout(tid);
    throw e;
  }
}

async function loadData() {
  const days = g('days-sel') ? parseInt(g('days-sel').value) : currentDays;
  currentDays = days;
  const overlay = g('loading-overlay');
  const msgEl = g('loading-msg');
  if(overlay) overlay.style.display = 'flex';
  if(msgEl) msgEl.textContent = 'Orders ophalen...';
  try {
    const oRes = await fetchWithTimeout('/orders?days=' + days, 30000);
    if(msgEl) msgEl.textContent = 'Producten ophalen...';
    const pRes = await fetchWithTimeout('/products', 30000);
    if (!oRes.ok) {
      const e = await oRes.json().catch(() => ({error: 'Status ' + oRes.status}));
      throw new Error(e.error || 'Status ' + oRes.status);
    }
    const oJson = await oRes.json();
    const pJson = await pRes.json();
    D = { orders: oJson.orders || [], products: pJson.products || [], days };
    if(overlay) overlay.style.display = 'none';
    set('conn-label', 'Live');
    const dot = g('conn-dot'); if(dot) dot.style.background = '#1D9E75';
    set('conn-info', D.orders.length + ' orders · ' + days + 'd');
    processAll();
  } catch(e) {
    if(overlay) overlay.style.display = 'none';
    set('conn-label', e.name === 'AbortError' ? 'Timeout' : 'Fout');
    const dot = g('conn-dot'); if(dot) dot.style.background = '#c00';
    const errDiv = document.createElement('div');
    errDiv.style.cssText = 'position:fixed;bottom:20px;right:20px;background:#fce4ec;color:#b71c1c;padding:12px 16px;border-radius:8px;font-size:12px;z-index:999;max-width:320px;';
    errDiv.textContent = 'Fout: ' + (e.name === 'AbortError' ? 'Shopify reageert te traag. Probeer opnieuw.' : e.message);
    document.body.appendChild(errDiv);
    setTimeout(() => errDiv.remove(), 8000);
    console.error('loadData error:', e);
  }
}

function processAll() {
  if (!D) return;
  const { orders, products, days } = D;
  const byCc = {}, byDate = {}, byStatus = {}, byProd = {};
  let totalRev = 0, refundRev = 0, refundCnt = 0, cancelCnt = 0;

  orders.forEach(o => {
    const c = cc(o), val = parseFloat(o.total_price) || 0;
    const date = (o.created_at || '').substring(0, 10);
    const status = o.financial_status || 'unknown';
    totalRev += val;
    if (status === 'refunded' || status === 'partially_refunded') { refundRev += val; refundCnt++; }
    if (o.cancel_reason) cancelCnt++;
    if (!byCc[c]) byCc[c] = { n: 0, rev: 0 };
    byCc[c].n++; byCc[c].rev += val;
    if (!byDate[date]) byDate[date] = 0; byDate[date] += val;
    if (!byStatus[status]) byStatus[status] = 0; byStatus[status]++;
    (o.line_items || []).forEach(item => {
      if (!byProd[item.title]) byProd[item.title] = { qty: 0, rev: 0 };
      byProd[item.title].qty += item.quantity;
      byProd[item.title].rev += parseFloat(item.price) * item.quantity;
    });
  });

  D.byCc = byCc; D.totalRev = totalRev; D.byDate = byDate; D.byStatus = byStatus; D.byProd = byProd;
  D.refundRev = refundRev; D.refundCnt = refundCnt; D.cancelCnt = cancelCnt;

  const paid = orders.filter(o => o.financial_status === 'paid');
  const unique = new Set(orders.filter(o => o.customer).map(o => o.customer.id)).size;
  const aov = orders.length ? totalRev / orders.length : 0;

  set('d-omzet', fmt(totalRev));
  set('d-omzet-s', 'afgelopen ' + days + ' dagen');
  set('d-orders', orders.length);
  set('d-orders-s', paid.length + ' betaald');
  set('d-aov', fmtD(aov));
  set('d-klanten', unique);
  set('d-refunds', fmt(refundRev));
  set('d-refunds-s', refundCnt + ' retouren');
  set('dash-sub', orders.length + ' orders · laatste ' + days + ' dagen');
  html('live-omzet-box', '<i class="ti ti-shopping-cart"></i> Live omzet: <strong>' + fmt(totalRev) + '</strong> (' + days + ' dagen)');

  const kpiPct = Math.min(100, Math.round(totalRev / 100000 * 100));
  const kb = g('kpi-omzet-bar'); if(kb) kb.style.width = kpiPct + '%';
  set('kpi-omzet-val', fmt(totalRev));
  const retourPct = totalRev > 0 ? (refundRev / totalRev * 100) : 0;
  const rb = g('kpi-retour-bar'); if(rb) rb.style.width = Math.min(100, retourPct / 8 * 100) + '%';
  set('kpi-retour-val', retourPct.toFixed(1) + '%');

  renderNlBeBars(byCc, totalRev);
  renderStatusChart(byStatus);
  renderTrendChart(byDate);
  renderOrders(orders);
  renderCountries(byCc, totalRev);
  renderProducts(products, byProd, days);
  renderFulfillment(orders);
  renderCS(orders, refundCnt, cancelCnt, totalRev, refundRev);
  renderListings(products, days);
}

function renderNlBeBars(byCc, totalRev) {
  const sorted = Object.entries(byCc).sort((a,b) => b[1].rev - a[1].rev).slice(0,6);
  const cols = { NL: '#185FA5', BE: '#1D9E75' };
  html('nl-be-bars', sorted.map(([c,d]) => {
    const pct = totalRev > 0 ? Math.round(d.rev / totalRev * 100) : 0;
    return '<div style="display:flex;align-items:center;gap:7px;margin-bottom:7px;"><span style="font-size:11px;font-weight:700;width:22px;">' + c + '</span><div class="bw"><div class="bf" style="width:' + pct + '%;background:' + (cols[c]||'#888') + '"></div></div><span style="font-size:11px;">' + fmt(d.rev) + '</span><span style="font-size:10px;color:#bbb;min-width:28px;">' + pct + '%</span></div>';
  }).join(''));
}

function renderStatusChart(byStatus) {
  const ctx = g('statusChart'); if (!ctx) return;
  if (charts.status) charts.status.destroy();
  const labels = Object.keys(byStatus), data = Object.values(byStatus);
  const cols = { paid: '#1D9E75', pending: '#ef9f27', refunded: '#D85A30', partially_refunded: '#ba7517', cancelled: '#888', voided: '#b4b2a9' };
  charts.status = new Chart(ctx.getContext('2d'), { type: 'doughnut', data: { labels, datasets: [{ data, backgroundColor: labels.map(l => cols[l]||'#888'), borderWidth: 0 }] }, options: { responsive: true, maintainAspectRatio: false, cutout: '60%', plugins: { legend: { display: false } } } });
  html('status-legend', labels.map((l,i) => '<span style="display:flex;align-items:center;gap:3px;"><span style="width:8px;height:8px;border-radius:2px;background:' + (cols[l]||'#888') + '"></span>' + l + ' ' + data[i] + '</span>').join(''));
}

function renderTrendChart(byDate) {
  const ctx = g('trendChart'); if (!ctx) return;
  if (charts.trend) charts.trend.destroy();
  const sorted = Object.entries(byDate).sort((a,b) => a[0].localeCompare(b[0]));
  charts.trend = new Chart(ctx.getContext('2d'), { type: 'line', data: { labels: sorted.map(([d]) => d.substring(5)), datasets: [{ data: sorted.map(([,v]) => Math.round(v)), borderColor: '#185FA5', backgroundColor: 'rgba(24,95,165,0.07)', fill: true, tension: 0.3, borderWidth: 2, pointRadius: 2 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false }, ticks: { font: { size: 9 }, maxTicksLimit: 14 } }, y: { grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { font: { size: 9 }, callback: v => '€' + v.toLocaleString('nl-NL') } } } } });
}

function filterC(c, btn) {
  if (!D) return;
  let orders = D.orders;
  if (c === 'NL') orders = orders.filter(o => cc(o) === 'NL');
  if (c === 'BE') orders = orders.filter(o => cc(o) === 'BE');
  const rev = orders.reduce((s,o) => s + (parseFloat(o.total_price)||0), 0);
  const aov = orders.length ? rev / orders.length : 0;
  set('d-omzet', fmt(rev));
  set('d-orders', orders.length);
  set('d-aov', fmtD(aov));
}

function filterO(f) {
  oFilter = f;
  if (!D) return;
  let orders = D.orders;
  if (f === 'NL') orders = orders.filter(o => cc(o) === 'NL');
  else if (f === 'BE') orders = orders.filter(o => cc(o) === 'BE');
  else if (f === 'paid') orders = orders.filter(o => o.financial_status === 'paid');
  else if (f === 'refunded') orders = orders.filter(o => o.financial_status === 'refunded' || o.financial_status === 'partially_refunded');
  renderOrders(orders);
}

function renderOrders(orders) {
  set('orders-sub', orders.length + ' orders');
  const stC = s => s === 'paid' ? 'pl-g' : s === 'refunded' || s === 'partially_refunded' ? 'pl-r' : 'pl-w';
  html('orders-list', orders.slice(0,80).map(o => {
    const c = cc(o), pC = c === 'NL' ? 'pl-nl' : c === 'BE' ? 'pl-be' : 'pl-m';
    const date = new Date(o.created_at).toLocaleDateString('nl-NL',{day:'numeric',month:'short'});
    const name = o.customer ? (o.customer.first_name||'') + ' ' + (o.customer.last_name||'') : 'Gast';
    return '<div class="og"><span style="color:#888;">#' + o.order_number + '</span><span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' + name.trim() + '</span><span class="pl ' + pC + '" style="font-size:9px;padding:1px 4px;">' + c + '</span><span style="text-align:right;font-weight:700;">' + fmtD(o.total_price) + '</span><span class="pl ' + stC(o.financial_status) + '" style="font-size:9px;">' + (o.financial_status||'—') + '</span><span style="color:#bbb;">' + date + '</span></div>';
  }).join('') || '<div style="padding:8px 0;color:#bbb;">Geen orders.</div>');
}

function renderCountries(byCc, totalRev) {
  const nl = byCc['NL']||{n:0,rev:0}, be = byCc['BE']||{n:0,rev:0};
  set('nl-omzet', fmt(nl.rev)); set('nl-cnt', nl.n + ' orders');
  set('nl-aov', nl.n ? fmtD(nl.rev/nl.n) : '—');
  set('nl-pct', totalRev > 0 ? Math.round(nl.rev/totalRev*100) + '% van totaal' : '—');
  set('be-omzet', fmt(be.rev)); set('be-cnt', be.n + ' orders');
  set('be-aov', be.n ? fmtD(be.rev/be.n) : '—');
  set('be-pct', totalRev > 0 ? Math.round(be.rev/totalRev*100) + '% van totaal' : '—');
  const sorted = Object.entries(byCc).sort((a,b) => b[1].rev - a[1].rev);
  const maxR = sorted[0] ? sorted[0][1].rev : 1;
  const cols = { NL: '#185FA5', BE: '#1D9E75' };
  html('all-countries', sorted.map(([c,d]) => {
    const pct = Math.round(d.rev/maxR*100);
    return '<div style="display:flex;align-items:center;gap:7px;margin-bottom:8px;"><span style="font-size:11px;font-weight:700;width:26px;">' + c + '</span><div class="bw"><div class="bf" style="width:' + pct + '%;background:' + (cols[c]||'#888') + '"></div></div><span style="font-size:11px;">' + fmt(d.rev) + '</span><span style="font-size:10px;color:#bbb;min-width:52px;">' + d.n + ' orders</span><span style="font-size:10px;color:#bbb;">' + Math.round(d.rev/totalRev*100) + '%</span></div>';
  }).join(''));
}

function renderProducts(products, byProd, days) {
  const active = products.filter(p => p.status === 'active').length;
  const draft = products.filter(p => p.status === 'draft').length;
  const ago = new Date(Date.now() - days * 86400000);
  const newP = products.filter(p => new Date(p.created_at) > ago).length;
  set('p-active', active); set('p-draft', draft); set('p-new', newP);
  set('l-active', active); set('l-draft', draft);
  set('l-archived', products.filter(p => p.status === 'archived').length);
  set('l-new', newP);
  const sorted = Object.entries(byProd).sort((a,b) => b[1].rev - a[1].rev);
  if (sorted.length > 0) set('p-top', sorted[0][0].substring(0,20));
  const maxR = sorted[0] ? sorted[0][1].rev : 1;
  html('top-products', sorted.slice(0,12).map(([name,d],i) => {
    const pct = Math.round(d.rev/maxR*100);
    return '<div style="margin-bottom:9px;"><div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:3px;"><span style="font-weight:' + (i<3?700:400) + ';max-width:190px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' + (i+1) + '. ' + name + '</span><span style="color:#777;">' + d.qty + 'x · ' + fmt(d.rev) + '</span></div><div style="height:4px;background:#f0f0ef;border-radius:2px;"><div style="width:' + pct + '%;height:100%;background:#185FA5;border-radius:2px;"></div></div></div>';
  }).join('') || '<div style="color:#bbb;">Geen productdata.</div>');
  html('listing-velocity', '<div style="display:flex;gap:7px;margin-bottom:6px;"><span class="pl pl-g">' + active + ' actief</span><span class="pl pl-w">' + draft + ' draft</span><span class="pl pl-b">' + newP + ' nieuw (' + days + 'd)</span></div>');
  html('draft-list', products.filter(p => p.status === 'draft').slice(0,10).map(p => '<div class="rw"><div style="display:flex;align-items:center;gap:7px;"><span class="pl pl-w">Draft</span><span style="font-size:11px;">' + p.title + '</span></div><span style="font-size:10px;color:#bbb;">' + new Date(p.created_at).toLocaleDateString('nl-NL',{day:'numeric',month:'short'}) + '</span></div>').join('') || '<div style="color:#bbb;padding:8px 0;">Geen draft listings.</div>');
  const ctx = g('listChart');
  if (ctx && !charts.list) {
    charts.list = new Chart(ctx.getContext('2d'), { type: 'bar', data: { labels: ['Actief','Draft','Nieuw'], datasets: [{ data: [active,draft,newP], backgroundColor: ['#1D9E75','#ef9f27','#185FA5'], borderWidth: 0 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false }, ticks: { font: { size: 10 } } }, y: { grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { font: { size: 10 } } } } } });
  }
}

function renderFulfillment(orders) {
  const byF = {};
  orders.forEach(o => { const s = o.fulfillment_status || 'unfulfilled'; if(!byF[s]) byF[s]=0; byF[s]++; });
  set('ff-open', (byF['unfulfilled']||0) + (byF['partial']||0));
  set('ff-shipped', (byF['in_transit']||0) + (byF['out_for_delivery']||0));
  set('ff-delivered', (byF['delivered']||0) + (byF['fulfilled']||0));
  set('ff-cancelled', orders.filter(o => o.cancel_reason).length);
}

function renderCS(orders, refundCnt, cancelCnt, totalRev, refundRev) {
  const issues = orders.filter(o => o.financial_status === 'refunded' || o.financial_status === 'partially_refunded' || o.cancel_reason);
  set('cs-open', issues.length);
  set('cs-refunds', refundCnt);
  set('cs-cancelled', cancelCnt);
  set('cs-rate', totalRev > 0 ? (refundRev/totalRev*100).toFixed(1) + '%' : '—');
  html('cs-list', issues.slice(0,15).map(o => {
    const c = cc(o), pC = c === 'NL' ? 'pl-nl' : c === 'BE' ? 'pl-be' : 'pl-m';
    const name = o.customer ? (o.customer.first_name||'') + ' ' + (o.customer.last_name||'') : 'Gast';
    const reason = o.cancel_reason ? 'Geannuleerd: ' + o.cancel_reason : o.financial_status;
    return '<div class="rw"><div style="display:flex;align-items:center;gap:7px;"><span class="pl pl-r" style="font-size:9px;">' + (o.financial_status||'?') + '</span><div><div style="font-size:11px;font-weight:600;">#' + o.order_number + ' — ' + name.trim() + '</div><div style="font-size:10px;color:#777;">' + reason + ' · ' + c + '</div></div></div><span style="font-size:11px;color:#555;">' + fmtD(o.total_price) + '</span></div>';
  }).join('') || '<div style="color:#bbb;padding:8px 0;">Geen actieve issues.</div>');
}

function calcPL() {
  const omzet = D ? D.totalRev : 0;
  const inkoop = parseFloat(g('pl-inkoop').value)||0;
  const meta = parseFloat(g('pl-meta').value)||0;
  const google = parseFloat(g('pl-google').value)||0;
  const shopify = parseFloat(g('pl-shopify').value)||420;
  const overig = parseFloat(g('pl-overig').value)||0;
  const kosten = inkoop+meta+google+shopify+overig;
  const winst = omzet-kosten;
  const marge = omzet > 0 ? (winst/omzet*100).toFixed(1) : 0;
  const el = g('pl-winst'); if(el) { el.textContent = fmt(winst); el.style.color = winst >= 0 ? '#0a6e3e' : '#c00'; }
  set('pl-marge', marge + '%');
  set('cf-total', fmt(Math.max(0,winst)));
  set('cf-invest', fmt(Math.max(0,winst)*0.6));
  set('cf-reserve', fmt(Math.max(0,winst)*0.4));
  set('proj1', fmt(omzet*1.2));
  set('proj2', fmt(omzet*1.44));
  set('proj3', fmt(omzet*1.728));
  set('d-winst', fmt(winst));
  set('d-marge', 'marge: ' + marge + '%');
  const kpiMargePct = Math.min(100, Math.round(parseFloat(marge)/25*100));
  const kmb = g('kpi-marge-bar'); if(kmb) kmb.style.width = kpiMargePct + '%';
  set('kpi-marge-val', marge + '%');
}

function calcAds() {
  const r = (s,rv) => s > 0 ? (rv/s).toFixed(1)+'x' : '—';
  set('m-nl-roas', r(+g('m-nl-s').value, +g('m-nl-r').value));
  set('m-be-roas', r(+g('m-be-s').value, +g('m-be-r').value));
  set('g-nl-roas', r(+g('g-nl-s').value, +g('g-nl-r').value));
  const gbeR = +g('g-be-s').value > 0 ? +g('g-be-r').value / +g('g-be-s').value : 0;
  const el = g('g-be-roas'); if(el) { el.textContent = gbeR.toFixed(1)+'x'; el.style.color = gbeR < 2 ? '#c00' : gbeR < 3 ? '#b45' : '#0a6e3e'; }
}

function changeDays() { loadData(); }

function addFFTask() {
  const val = g('ff-inp').value.trim(); if(!val) return;
  const div = document.createElement('div'); div.className = 'rw';
  div.innerHTML = '<div style="display:flex;align-items:center;gap:7px;"><input type="checkbox" onchange="this.closest(\'.rw\').style.opacity=this.checked?\'.4\':\'1\'"><span style="font-size:11px;">' + val + '</span></div><span class="pl pl-m">Nieuw</span>';
  g('ff-tasks').appendChild(div);
  g('ff-inp').value = '';
}

function addBug() {
  const name = prompt('Bug omschrijving:'); if(!name) return;
  const div = document.createElement('div'); div.className = 'rw';
  div.innerHTML = '<div style="display:flex;align-items:center;gap:7px;"><span class="pl pl-w">Nieuw</span><div><div style="font-size:11px;font-weight:600;">' + name + '</div><div style="font-size:10px;color:#777;">Gemeld: ' + new Date().toLocaleDateString('nl-NL',{day:'numeric',month:'short'}) + '</div></div></div>';
  g('bug-list').appendChild(div);
}

window.addEventListener('load', loadData);
</script>
</body>
</html>`;

http.createServer((req, res) => {
  if (req.method === 'OPTIONS') { res.writeHead(200, CORS); res.end(); return; }

  const p = url.parse(req.url, true);
  const pathname = p.pathname;

  // Serve dashboard HTML
  if (pathname === '/' || pathname === '/dashboard') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(DASHBOARD);
    return;
  }

  const send = (status, data) => {
    res.writeHead(status, CORS);
    res.end(typeof data === 'string' ? data : JSON.stringify(data));
  };

  if (!TOKEN) { send(401, { error: 'No token — set SHOPIFY_TOKEN in Railway variables' }); return; }

  if (pathname === '/health') {
    send(200, { status: 'ok', store: STORE, tokenConfigured: true, tokenPreview: TOKEN.substring(0, 10) + '...' });
    return;
  }

  const days = parseInt(p.query.days) || 30;
  const since = new Date(Date.now() - days * 86400000).toISOString();

  const routes = {
    '/orders': '/orders.json?status=any&created_at_min=' + since + '&limit=250&fields=id,order_number,total_price,subtotal_price,financial_status,fulfillment_status,created_at,shipping_address,billing_address,line_items,customer,cancel_reason,refunds',
    '/products': '/products.json?limit=250&fields=id,title,status,variants,created_at,updated_at,published_at,product_type,vendor',
    '/customers': '/customers/count.json',
    '/shop': '/shop.json'
  };

  const apiPath = routes[pathname];
  if (!apiPath) { send(404, { error: 'Not found' }); return; }

  shopifyGet(apiPath, (err, status, data) => {
    if (err) { send(500, { error: err.message }); return; }
    send(status, data);
  });

}).listen(PORT, () => {
  console.log('Vijgen OS proxy + dashboard on port', PORT);
  console.log('Dashboard URL: https://shopify-proxy-production-9644.up.railway.app');
  console.log('Token:', TOKEN ? 'CONFIGURED' : 'NOT SET');
});
