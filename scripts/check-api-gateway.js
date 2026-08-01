/**
 * API Gateway & Gateway Endpoint Health Probe
 * Project: KCM Ministries Church Platform
 */

const http = require('http');
const https = require('https');

const TARGET_HOST = process.env.TARGET_HOST || 'http://localhost:3000';
const BACKEND_HOST = process.env.BACKEND_HOST || 'http://localhost:3001';

const GATEWAY_ENDPOINTS = [
  { name: 'Sermons Stream API Gateway', url: `${TARGET_HOST}/api/sermons` },
  { name: 'Featured Sermons API Gateway', url: `${TARGET_HOST}/api/sermons/featured` },
  { name: 'Latest Sermons API Gateway', url: `${TARGET_HOST}/api/sermons/latest` },
  { name: 'Event Manager API Gateway', url: `${TARGET_HOST}/api/events` },
  { name: 'Upcoming Events API Gateway', url: `${TARGET_HOST}/api/events/upcoming` },
  { name: 'Church Branches API Gateway', url: `${TARGET_HOST}/api/branches` },
  { name: 'Donation Purposes Gateway', url: `${TARGET_HOST}/api/donations/purposes` },
  { name: 'OpenClaw AI Orchestrator Gateway', url: `${TARGET_HOST}/api/openclaw/skills` },
  { name: 'NGO Projects API Gateway', url: `${TARGET_HOST}/api/ngo/projects` },
  { name: 'Gallery Media API Gateway', url: `${TARGET_HOST}/api/gallery` },
  { name: 'Backend Microservice Health Check', url: `${BACKEND_HOST}/health` }
];

function fetchEndpoint(url) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const client = url.startsWith('https') ? https : http;
    
    const req = client.get(url, { timeout: 4000 }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          latencyMs: Date.now() - startTime,
          dataLength: data.length
        });
      });
    });

    req.on('error', (err) => {
      resolve({
        statusCode: 0,
        error: err.message,
        latencyMs: Date.now() - startTime
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        statusCode: 408,
        error: 'Timeout',
        latencyMs: Date.now() - startTime
      });
    });
  });
}

async function runGatewayCheck() {
  console.log('===============================================================');
  console.log(' KCM MINISTRIES API GATEWAY HEALTH AUDIT');
  console.log('===============================================================\n');

  let passed = 0;
  let total = GATEWAY_ENDPOINTS.length;

  for (const ep of GATEWAY_ENDPOINTS) {
    const res = await fetchEndpoint(ep.url);
    const is200OK = res.statusCode === 200;

    if (is200OK) passed++;

    const statusBadge = is200OK 
      ? '🟢 200 OK' 
      : (res.statusCode > 0 ? `🟡 HTTP ${res.statusCode}` : `🔴 FAILED (${res.error})`);

    console.log(`[${is200OK ? 'PASS' : 'WARN'}] ${ep.name.padEnd(35)} -> ${statusBadge} (${res.latencyMs}ms)`);
  }

  console.log('\n---------------------------------------------------------------');
  console.log(`[GATEWAY AUDIT RESULT] ${passed}/${total} Endpoints Returned HTTP 200 OK.`);
  console.log('===============================================================\n');
}

runGatewayCheck();
