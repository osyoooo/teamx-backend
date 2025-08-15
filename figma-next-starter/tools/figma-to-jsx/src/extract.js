import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { getFileJson, getNodesJson } from './figma.js';
import { buildJsx } from './buildJsx.js';

const argv = yargs(hideBin(process.argv))
  .option('screens', { type: 'string', describe: 'screen prefixes like 12,13,14', default: process.env.SCREENS || '' })
  .parseSync();

const FILE_KEY = process.env.FIGMA_FILE_KEY;
if (!FILE_KEY) throw new Error('FIGMA_FILE_KEY is not set');

const OUT_DIR = path.resolve('out');
const CONFIG_DIR = path.resolve('config');
fs.mkdirSync(OUT_DIR, { recursive: true });

const prefixes = argv.screens
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

console.log('[*] Fetching file JSON...');
const fileJson = await getFileJson(FILE_KEY);
const doc = fileJson.document;

function walk(node, fn) {
  fn(node);
  if (node.children) for (const c of node.children) walk(c, fn);
}

function nodeName(n) {
  return (n.name || '').trim();
}

// Collect candidate frames by prefix (e.g., "12", "13"...)
const frames = [];
walk(doc, (n) => {
  if (n.type === 'FRAME' || n.type === 'COMPONENT' || n.type === 'GROUP') {
    const nm = nodeName(n);
    if (prefixes.length === 0) {
      frames.push(n);
    } else {
      if (prefixes.some(p => nm.startsWith(p))) frames.push(n);
    }
  }
});

// Deduplicate by name (prefer first)
const byName = new Map();
for (const f of frames) {
  if (!byName.has(f.name)) byName.set(f.name, f);
}
const selected = Array.from(byName.values());
console.log(`[*] Selected frames: ${selected.map(n => n.name).join(', ') || '(none)'}`);

// Extract Text nodes (fallback /nodes if characters missing)
async function extractTextNodes(frame) {
  const texts = [];
  walk(frame, (n) => {
    if (n.type === 'TEXT') {
      texts.push(n);
    }
  });
  const missing = texts.filter(t => typeof t.characters !== 'string');
  if (missing.length > 0 && texts.length > 0) {
    const ids = texts.map(t => t.id);
    const nodesJson = await getNodesJson(FILE_KEY, ids);
    for (const id of Object.keys(nodesJson.nodes || {})) {
      const tn = nodesJson.nodes[id].document;
      const idx = texts.findIndex(x => x.id === id);
      if (idx >= 0) texts[idx] = tn;
    }
  }
  return texts.map(t => ({
    id: t.id,
    name: t.name || '',
    text: typeof t.characters === 'string' ? t.characters : ''
  }));
}

// Load mapping config by screen keyword
function loadConfigForFrame(name) {
  const lower = name.toLowerCase();
  const files = fs.readdirSync(CONFIG_DIR).filter(f => f.endsWith('.json'));
  for (const f of files) {
    const pattern = f.replace('.json','').toLowerCase().replace('_','');
    if (lower.includes(pattern)) {
      const json = JSON.parse(fs.readFileSync(path.join(CONFIG_DIR,f), 'utf-8'));
      return json;
    }
  }
  // default
  return { screen: name.replace(/[^a-zA-Z0-9_]/g,'_'), entities: [], actions: [], fieldsMap: {} };
}

function mapToEntities(textNodes, cfg) {
  const fm = cfg.fieldsMap || {};
  const keys = Object.keys(fm);
  return textNodes.map(n => {
    // match by layer name first (exact/contains), then fallback by text content contains
    let pair = null;
    for (const k of keys) {
      if (!k) continue;
      if ((n.name || '').includes(k)) { pair = fm[k]; break; }
    }
    if (!pair) {
      for (const k of keys) {
        if (!k) continue;
        if ((n.text || '').includes(k)) { pair = fm[k]; break; }
      }
    }
    return {
      entity: pair ? pair[0] : 'Unknown',
      field: pair ? pair[1] : 'text',
      text: n.text
    };
  });
}

for (const frame of selected) {
  const cfg = loadConfigForFrame(frame.name);
  const textNodes = await extractTextNodes(frame);
  const elements = mapToEntities(textNodes, cfg);
  const jsx = buildJsx(cfg, elements);

  const safe = frame.name.replace(/[^a-zA-Z0-9_]/g,'_');
  const outPath = path.join(OUT_DIR, `${safe}.jsx`);
  fs.writeFileSync(outPath, jsx, 'utf-8');
  console.log(` [+] Wrote ${outPath}`);
}

console.log('[✓] Done. See the out/ directory.');
