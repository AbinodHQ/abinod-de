import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import process from 'node:process';
import * as deepl from 'deepl-node';
import * as cheerio from 'cheerio';

const flags = new Set(process.argv.slice(2));
const apply = flags.has('--apply');
const force = flags.has('--force');
const args = process.argv.slice(2);
const argValue = (name, fallback) => {
  const i = args.indexOf(name);
  return i < 0 ? fallback : args[i + 1];
};
const root = process.cwd();
const source = path.resolve(root, argValue('--source', '../abinod'));
const target = path.resolve(root, argValue('--target', '.'));
const configFile = path.resolve(root, argValue('--config', './scripts/localization.config.json'));
const config = JSON.parse(await fs.readFile(configFile, 'utf8'));
const stateDir = path.resolve(root, config.stateDir ?? './.localization');
const statePath = path.join(stateDir, 'state.json');
const cachePath = path.join(stateDir, 'cache.json');
const hash = (data) => crypto.createHash('sha256').update(data).digest('hex');
const normalize = (x) => x.replace(/\\/g, '/');
const excludedDirs = new Set(['.git', 'node_modules', '.vercel', '.next', 'dist', 'build', '.localization']);
const excludedFiles = config.excludeFiles ?? [];
const protectedNames = config.protectedTerms ?? ['Abinod', 'Ambiten', 'VeriNodo', 'PureConsent'];
const translateAttrs = ['alt', 'aria-label', 'title', 'placeholder', 'aria-description'];
const metaNames = new Set(['description', 'twitter:title', 'twitter:description']);
const metaProperties = new Set(['og:title', 'og:description']);
let api = null;

async function jsonOrEmpty(file) {
  try { return JSON.parse(await fs.readFile(file, 'utf8')); }
  catch (e) { if (e.code === 'ENOENT') return {}; throw e; }
}
const state = await jsonOrEmpty(statePath);
const cache = await jsonOrEmpty(cachePath);
const skipped = [];
const planned = [];

async function walk(dir) {
  const files = [];
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    if (entry.isSymbolicLink()) continue;
    const absolute = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!excludedDirs.has(entry.name)) files.push(...await walk(absolute));
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.html')) {
      files.push(absolute);
    }
  }
  return files.sort();
}

function protect(input) {
  let text = input;
  const tokens = [];
  for (const name of protectedNames) {
    const pattern = new RegExp(`\\b${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g');
    text = text.replace(pattern, () => {
      const token = `ZZZABINODTERM${tokens.length}ZZZ`;
      tokens.push([token, name]);
      return token;
    });
  }
  return { text, tokens };
}

async function translateStrings(values) {
  const result = new Map();
  const unique = [...new Set(values)].filter(v => v.trim());
  const missing = unique.filter(v => !Object.hasOwn(cache, `en-de:${v}`));
  if (missing.length) {
    if (!apply || !process.env.DEEPL_API_KEY) {
      if (apply) throw new Error('Set DEEPL_API_KEY before running --apply.');
      console.log(`Dry run: ${missing.length} uncached segments require a DeepL API key for translation.`);
    } else {
      api ??= new deepl.DeepLClient(process.env.DEEPL_API_KEY);
      for (let i = 0; i < missing.length; i += 30) {
        const originals = missing.slice(i, i + 30);
        const prepared = originals.map(protect);
        const translated = await api.translateText(
          prepared.map(x => x.text), 'en', 'de',
          { formality: 'prefer_more', preserveFormatting: true }
        );
        const array = Array.isArray(translated) ? translated : [translated];
        for (let j = 0; j < originals.length; j++) {
          let output = array[j].text;
          for (const [token, original] of prepared[j].tokens) {
            if (!output.includes(token)) {
              throw new Error(`Translation changed protected brand token ${token}. Source: ${originals[j]}`);
            }
            output = output.replaceAll(token, original);
          }
          cache[`en-de:${originals[j]}`] = output;
        }
      }
    }
  }
  for (const value of unique) result.set(value, cache[`en-de:${value}`] ?? value);
  return result;
}

function shouldSkipNode(node) {
  const blocked = new Set(['script', 'style', 'noscript', 'svg', 'code', 'pre', 'kbd', 'samp', 'textarea']);
  for (let p = node.parent; p; p = p.parent) {
    if (p.type === 'tag') {
      if (blocked.has(p.name)) return true;
      if (p.attribs?.translate === 'no' || p.attribs?.['data-no-translate'] !== undefined) return true;
    }
  }
  return false;
}

function collect($) {
  const items = [];
  $('*').contents().each((_, node) => {
    if (node.type !== 'text' || !node.data?.trim() || shouldSkipNode(node)) return;
    const original = node.data;
    const match = original.match(/^(\s*)([\s\S]*?)(\s*)$/);
    if (!match?.[2]?.trim()) return;
    // Avoid code-like or identifier-only text. Mark other exceptions with translate="no".
    const value = match[2];
    if (/^(https?:\/\/|mailto:|@|#[A-Za-z0-9_-]+|[\w./-]+\.(?:dev|com|de|js|ts))/.test(value)) return;
    items.push({ get: () => value, set: v => { node.data = match[1] + v + match[3]; } });
  });
  $('*').each((_, el) => {
    if (shouldSkipNode({parent: el})) return;
    for (const attr of translateAttrs) {
      if (el.attribs?.[attr]?.trim()) {
        const value = el.attribs[attr];
        items.push({ get: () => value, set: v => { el.attribs[attr] = v; } });
      }
    }
    if (el.name === 'input' && ['submit', 'button', 'reset'].includes((el.attribs?.type ?? '').toLowerCase()) && el.attribs?.value) {
      const value = el.attribs.value;
      items.push({ get: () => value, set: v => { el.attribs.value = v; } });
    }
  });
  $('meta').each((_, el) => {
    const name = (el.attribs?.name ?? '').toLowerCase();
    const property = (el.attribs?.property ?? '').toLowerCase();
    if ((metaNames.has(name) || metaProperties.has(property)) && el.attribs?.content?.trim()) {
      const value = el.attribs.content;
      items.push({ get: () => value, set: v => { el.attribs.content = v; } });
    }
  });
  return items;
}

async function main() {
  if (path.resolve(source) === path.resolve(target)) throw new Error('Source and target must differ.');
  const files = await walk(source);
  for (const file of files) {
    const relative = normalize(path.relative(source, file));
    if (excludedFiles.some(pattern => relative === pattern || (pattern.endsWith('/**') && relative.startsWith(pattern.slice(0, -3))))) {
      skipped.push(`${relative} (excluded)`); continue;
    }
    const destination = path.join(target, relative);
    const english = await fs.readFile(file, 'utf8');
    let current = null;
    try { current = await fs.readFile(destination, 'utf8'); }
    catch (e) { if (e.code !== 'ENOENT') throw e; }
    const recorded = state[relative];
    if (current !== null && recorded && recorded.outputHash !== hash(current) && !force) {
      skipped.push(`${relative} (manual edits detected; use --force only after review)`); continue;
    }
    if (current !== null && !recorded && !force) {
      skipped.push(`${relative} (pre-existing target; first adoption requires --force)`); continue;
    }
    if (recorded?.sourceHash === hash(english) && current !== null) {
      skipped.push(`${relative} (unchanged)`); continue;
    }
    const $ = cheerio.load(english, { decodeEntities: false });
    const items = collect($);
    const strings = items.map(x => x.get());
    const translations = await translateStrings(strings);
    for (const item of items) item.set(translations.get(item.get()) ?? item.get());
    $('html').attr('lang', 'de');
    // Add or replace reciprocal hreflang links; each output path remains identical.
    $('head link[rel="alternate"][hreflang]').remove();
    const urlPath = relative === 'index.html' ? '/' : '/' + relative.replace(/index\.html$/, '');
    const links = [
      ['de-DE', `https://www.abinod.de${urlPath}`],
      ['en', `https://www.abinod.com${urlPath}`],
      ['x-default', `https://www.abinod.com${urlPath}`],
    ];
    for (const [lang, href] of links) $('head').append(`<link rel="alternate" hreflang="${lang}" href="${href}" />`);
    $('head link[rel="canonical"]').remove();
    $('head').append(`<link rel="canonical" href="https://www.abinod.de${urlPath}" />`);
    const output = '<!doctype html>\n' + $.html().replace(/^<!doctype html>\s*/i, '');
    if (current === output) { skipped.push(`${relative} (already matches)`); continue; }
    planned.push(relative);
    if (apply) {
      await fs.mkdir(path.dirname(destination), { recursive: true });
      if (current !== null) {
        const backup = path.join(stateDir, 'backups', relative);
        await fs.mkdir(path.dirname(backup), { recursive: true });
        await fs.writeFile(backup, current, 'utf8');
      }
      await fs.writeFile(destination, output, 'utf8');
      state[relative] = { sourceHash: hash(english), outputHash: hash(output) };
    }
  }
  if (apply) {
    await fs.mkdir(stateDir, { recursive: true });
    await fs.writeFile(statePath, JSON.stringify(state, null, 2) + '\n');
    await fs.writeFile(cachePath, JSON.stringify(cache, null, 2) + '\n');
  }
  console.log(`${apply ? 'Written' : 'Would write'}: ${planned.length} page(s)`);
  planned.forEach(f => console.log('  +', f));
  console.log(`Skipped: ${skipped.length} page(s)`);
  skipped.forEach(f => console.log('  -', f));
  if (!apply) console.log('Dry run only. Use --apply; for existing duplicated pages use --apply --force once after backup/review.');
}

await main();
