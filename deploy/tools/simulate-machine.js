#!/usr/bin/env node

/**
 * Machine cycle simulator.
 *
 * Usage:
 *   node simulate-machine.js <machines> <intervalSeconds> [--url http://...]
 *
 *   machines        Single number or comma-separated list: 1  or  1,2,5
 *   intervalSeconds Cycle pulse interval in seconds (decimals ok): 5  or  2.5
 *   --url           Base API URL (default: http://localhost/api)
 *
 * Examples:
 *   node simulate-machine.js 1 5
 *   node simulate-machine.js 1,2,3 3
 *   node simulate-machine.js 1 5 --url http://localhost:3000/api
 *
 * Controls (while running):
 *   q + Enter   Stop all machines and exit
 *   p + Enter   Pause / resume all pulses
 */

const http  = require('http');
const https = require('https');

// ── CLI args ──────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);

// Named flag helper (for --url only)
const getFlag = (flag, def) => {
  const idx = args.indexOf(flag);
  return idx !== -1 && args[idx + 1] !== undefined ? args[idx + 1] : def;
};

// Positional args — walk the array, skipping flag+value pairs
const positional = [];
for (let i = 0; i < args.length; i++) {
  if (args[i].startsWith('--')) { i++; } // skip flag and its value
  else { positional.push(args[i]); }
}

if (positional.length < 2) {
  console.error('Usage: node simulate-machine.js <machines> <intervalSeconds> [--url http://...]');
  console.error('  Example: node simulate-machine.js 1 5');
  console.error('  Example: node simulate-machine.js 1,2,3 3');
  process.exit(1);
}

const machines   = positional[0].split(',').map((s) => parseInt(s.trim(), 10)).filter((n) => n > 0);
const intervalMs = Math.round(parseFloat(positional[1]) * 1000);
const baseUrl    = getFlag('--url', 'http://localhost/api');

if (machines.length === 0 || isNaN(intervalMs) || intervalMs < 100) {
  console.error('Invalid arguments. Machines must be positive integers, interval must be >= 0.1 seconds.');
  process.exit(1);
}

// ── HTTP helper ───────────────────────────────────────────────────────────────

const parsedBase = new URL(baseUrl);
const endpoint   = `${parsedBase.pathname.replace(/\/$/, '')}/production-plan/machine-cycle`;
const lib        = parsedBase.protocol === 'https:' ? https : http;

function postCycle(machineNumber) {
  return new Promise((resolve) => {
    const body = JSON.stringify({ machineNumber });
    const opts = {
      hostname: parsedBase.hostname,
      port:     parsedBase.port || (parsedBase.protocol === 'https:' ? 443 : 80),
      path:     endpoint,
      method:   'POST',
      headers: {
        'Content-Type':   'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    };
    const req = lib.request(opts, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ ok: res.statusCode === 200, status: res.statusCode, json });
        } catch {
          resolve({ ok: false, status: res.statusCode, json: null });
        }
      });
    });
    req.on('error', (err) => resolve({ ok: false, status: 0, error: err.message }));
    req.write(body);
    req.end();
  });
}

// ── State ─────────────────────────────────────────────────────────────────────

let paused  = false;
let stopped = false;
let cycleN  = 0;

const counts = {};
machines.forEach((m) => { counts[m] = 0; });

// ── Helpers ───────────────────────────────────────────────────────────────────

const pad  = (n, w = 2) => String(n).padStart(w, '0');
const time = () => { const d = new Date(); return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`; };
const tag  = (m) => `[M${m}]`;

function printStatus(machineNumber, result) {
  cycleN++;
  counts[machineNumber]++;
  const total = Object.values(counts).reduce((s, v) => s + v, 0);
  if (result.ok) {
    const c = result.json?.content;
    const produced    = c?.producedQuantity ?? '?';
    const planned     = c?.plannedQuantity  ?? '?';
    const cavities    = c?.cavities         ?? 1;
    const remaining   = c?.remaining        ?? '?';
    const norm        = c?.normPerShift     != null ? `norm=${c.normPerShift}` : 'norm=null';
    const endDate     = c?.newEndDate       != null ? `end→${c.newEndDate.slice(0, 16)}` : 'end=unchanged';
    console.log(
      `${time()}  ${tag(machineNumber)}  ✓  +${cavities}  ${produced}/${planned}  rem=${remaining}  ${norm}  ${endDate}  (#${counts[machineNumber]} / ${total})`
    );
  } else {
    const msg = result.error ?? result.json?.message ?? `HTTP ${result.status}`;
    console.log(`${time()}  ${tag(machineNumber)}  ✗  ${msg}  (pulse #${counts[machineNumber]})`);
  }
}

// ── Main loop ─────────────────────────────────────────────────────────────────

async function tick() {
  if (stopped || paused) return;
  await Promise.all(machines.map(async (m) => {
    const result = await postCycle(m);
    printStatus(m, result);
  }));
}

// ── Startup banner ────────────────────────────────────────────────────────────

console.log('');
console.log('  Machine cycle simulator');
console.log('  ────────────────────────────────────────────────────────');
console.log(`  Machines : ${machines.join(', ')}`);
console.log(`  Interval : ${intervalMs / 1000}s`);
console.log(`  Endpoint : ${parsedBase.origin}${endpoint}`);
console.log('  ────────────────────────────────────────────────────────');
console.log('  Controls : q + Enter → quit   |   p + Enter → pause/resume');
console.log('');

// Fire immediately on start, then on every interval.
tick();
const timer = setInterval(tick, intervalMs);

// ── Keyboard controls ─────────────────────────────────────────────────────────

process.stdin.setEncoding('utf8');
process.stdin.resume();

// Raw mode for clean single-key handling, with graceful fallback.
try { process.stdin.setRawMode(true); } catch { /* non-TTY — line mode works fine */ }

process.stdin.on('data', (key) => {
  const k = key.toString().toLowerCase().trim();

  if (k === 'q' || k === '' /* Ctrl+C */) {
    console.log(`\n  Stopping — ${cycleN} total pulses sent.`);
    stopped = true;
    clearInterval(timer);
    process.exit(0);
  }

  if (k === 'p') {
    paused = !paused;
    console.log(`\n  ${paused ? 'Paused  ⏸' : 'Resumed ▶'}`);
  }
});

process.on('SIGINT', () => {
  console.log(`\n  Interrupted — ${cycleN} total pulses sent.`);
  process.exit(0);
});