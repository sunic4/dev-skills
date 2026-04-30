#!/usr/bin/env node

import { mkdirSync, writeFileSync, existsSync, readdirSync, copyFileSync } from 'fs';
import { resolve, relative } from 'path';
import { fileURLToPath } from 'url';

const SELF = fileURLToPath(import.meta.url);

const DIRS = [
  { path: 'wiki/tools', owner: 'cc-init' },
  { path: 'wiki/raw/inputs', owner: 'cc-req' },
  { path: 'wiki/raw/research', owner: 'cc-arch' },
  { path: 'wiki/raw/references', owner: 'cc' },
  { path: 'wiki/req', owner: 'cc-req' },
  { path: 'wiki/arch', owner: 'cc-arch' },
  { path: 'wiki/arch/adrs', owner: 'cc-arch' },
  { path: 'wiki/arch/modules', owner: 'cc-arch' },
  { path: 'wiki/features', owner: 'cc-feat / cc-review' },
  { path: 'wiki/issues', owner: 'cc-fix' },
  { path: 'wiki/kb/raw', owner: 'cc-kb / cc-retro' },
  { path: 'wiki/kb/patterns', owner: 'cc-kb' },
  { path: 'wiki/kb/lessons', owner: 'cc-kb' },
  { path: 'wiki/kb/adrs', owner: 'cc-kb' },
  { path: 'wiki/kb/refs', owner: 'cc-kb' },
  { path: 'wiki/kb/_archive', owner: 'cc-kb' },
  { path: 'wiki/retro', owner: 'cc-retro' },
  { path: 'wiki/spikes', owner: 'cc-arch' }
];

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = { root: null, list: false };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--root' && args[i + 1]) opts.root = args[++i];
    else if (args[i] === '--list' || args[i] === '-l') opts.list = true;
    else if (!args[i].startsWith('--')) opts.root = args[i];
  }
  return opts;
}

function ensureDir(dirPath) {
  if (!existsSync(dirPath)) {
    mkdirSync(dirPath, { recursive: true });
    return 'created';
  }
  return 'exists';
}

function touchGitKeep(dirPath) {
  const gitkeep = resolve(dirPath, '.gitkeep');
  if (!existsSync(gitkeep)) {
    writeFileSync(gitkeep, '');
  }
}

function installSelf(targetRoot) {
  const toolsDir = resolve(targetRoot, 'wiki/tools');
  ensureDir(toolsDir);
  const target = resolve(toolsDir, 'init-wiki-dirs.mjs');

  if (existsSync(target)) {
    console.log(`[SKIP] wiki/tools/init-wiki-dirs.mjs already exists`);
    return;
  }

  copyFileSync(SELF, target);
  console.log(`[OK] Installed: wiki/tools/init-wiki-dirs.mjs`);
}

function listWikiContents(root) {
  const wikiDir = resolve(root, 'wiki');
  if (!existsSync(wikiDir)) {
    console.log('(empty — wiki directory not found)');
    return;
  }

  function walk(dir, prefix = '') {
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = resolve(dir, entry.name);
      const rel = relative(wikiDir, full);
      if (entry.isDirectory()) {
        console.log(`${prefix}${rel}/`);
        walk(full, prefix + '  ');
      } else if (entry.name !== '.gitkeep') {
        console.log(`${prefix}${rel}`);
      }
    }
  }
  walk(wikiDir);
}

function main() {
  const opts = parseArgs();
  const root = opts.root ? resolve(opts.root) : process.cwd();

  if (opts.list) {
    console.log(`Wiki contents at: ${root}`);
    listWikiContents(root);
    return;
  }

  console.log('\n=== Initializing Full Wiki Directory Structure ===\n');

  for (const dir of DIRS) {
    const fullPath = resolve(root, dir.path);
    const status = ensureDir(fullPath);

    if (status === 'created') {
      console.log(`[OK]   ${dir.path.padEnd(35)} (${dir.owner})`);
    } else {
      console.log(`[SKIP] ${dir.path.padEnd(35)} (${dir.owner})`);
    }

    touchGitKeep(fullPath);
  }

  installSelf(root);

  console.log('\n=== Done! Directory structure ===\n');
  listWikiContents(root);
  console.log('');
  console.log('Usage in your project:');
  console.log('  node wiki/tools/init-wiki-dirs.mjs');
  console.log('  node wiki/tools/init-wiki-dirs.mjs --list\n');
}

main();
