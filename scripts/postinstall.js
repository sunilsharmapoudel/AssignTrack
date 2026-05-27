#!/usr/bin/env node
/**
 * Patches expo-battery 9.0.2 — Battery.js uses bare ESM imports (missing .js
 * extensions) which breaks Node.js v22's strict ESM resolver when the expo CLI
 * loads the file. Metro and Jest are unaffected (different resolvers).
 *
 * Note: expo-battery must NOT appear in app.json plugins — it ships no config
 * plugin and including it causes the expo CLI to import its runtime code through
 * Node, triggering the chain below. The Battery module is only used by Metro/RN.
 */
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');

// ── Patch: expo-battery/build/Battery.js ─────────────────────────────────────
const batteryFile = path.join(root, 'node_modules', 'expo-battery', 'build', 'Battery.js');
if (fs.existsSync(batteryFile)) {
  let src = fs.readFileSync(batteryFile, 'utf8');
  const original = src;
  // Only patch Battery.types (no web variant exists — extension needed for Node ESM).
  // Do NOT patch ./ExpoBattery — Metro needs the bare specifier to resolve
  // ExpoBattery.web.js on web and ExpoBattery.js on native.
  src = src.replace("from './Battery.types'", "from './Battery.types.js'");
  if (src !== original) {
    fs.writeFileSync(batteryFile, src, 'utf8');
    console.log('postinstall: patched expo-battery/build/Battery.js (ESM bare imports → .js)');
  }
}

// ── Restore: expo-modules-core/package.json ───────────────────────────────────
// If a previous run accidentally changed "main" to "index.js", restore it to
// the correct "src/index.ts" so Metro can resolve it properly.
const corePackageFile = path.join(root, 'node_modules', 'expo-modules-core', 'package.json');
if (fs.existsSync(corePackageFile)) {
  const pkg = JSON.parse(fs.readFileSync(corePackageFile, 'utf8'));
  if (pkg.main === 'index.js') {
    pkg.main = 'src/index.ts';
    fs.writeFileSync(corePackageFile, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
    console.log('postinstall: restored expo-modules-core/package.json (main → src/index.ts)');
  }
}
