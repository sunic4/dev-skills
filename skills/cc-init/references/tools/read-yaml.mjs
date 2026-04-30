#!/usr/bin/env node

import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { resolve } from 'path';
import { simpleYamlParse, parseValue, yamlVal } from './yaml-utils.mjs';

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = { file: null, query: null, flat: false, summary: false, format: null };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--query' && args[i + 1]) { opts.query = args[++i]; }
    else if (args[i] === '--flat') { opts.flat = true; }
    else if (args[i] === '--summary') { opts.summary = true; }
    else if (args[i] === '--format' && args[i + 1]) { opts.format = args[++i]; }
    else if (args[i] === '--dump') { opts.dump = true; }
    else if (!args[i].startsWith('--')) { opts.file = args[i]; }
  }
  return opts;
}

function unwrapArrays(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(unwrapArrays);
  for (const [key, val] of Object.entries(obj)) {
    if (val && typeof val === 'object' && !Array.isArray(val) && '_items' in val) {
      const keys = Object.keys(val).filter(k => k !== '_items');
      if (keys.length === 0) {
        obj[key] = val._items.map(unwrapArrays);
      } else {
        obj[key] = unwrapArrays(val);
      }
    } else if (val && typeof val === 'object') {
      obj[key] = unwrapArrays(val);
    }
  }
  return obj;
}

function resolvePath(obj, path) {
  const parts = path.replace(/\[(\*)\]/g, '.$1').replace(/\[(\w+)\]/g, '.$1').split('.').filter(Boolean);
  let current = obj;
  for (const part of parts) {
    if (current == null) return undefined;
    if (part === '*') return current;
    if (Array.isArray(current)) {
      const idx = parseInt(part, 10);
      if (!isNaN(idx) && idx >= 0 && idx < current.length) {
        current = current[idx];
      } else {
        return undefined;
      }
    } else if (typeof current === 'object' && part in current) {
      current = current[part];
    } else {
      return undefined;
    }
  }
  return current;
}

function parseQuery(queryStr) {
  const fields = [];
  for (const q of queryStr.split(',')) {
    const trimmed = q.trim();
    if (!trimmed) continue;
    let filterMatch = trimmed.match(/^(.+?)\[\?(\w+)==(.+?)\](?:\.(.+))?$/);
    if (filterMatch) {
      fields.push({
        basePath: filterMatch[1],
        filterField: filterMatch[2],
        filterValue: parseValue(filterMatch[3]),
        subPath: filterMatch[4] || null,
        hasFilter: true
      });
      continue;
    }
    let starMatch = trimmed.match(/^(.+?)\[\*\](?:\.(.+))?$/);
    if (starMatch) {
      fields.push({
        basePath: starMatch[1],
        subPath: starMatch[2] || null,
        isStar: true
      });
      continue;
    }
    fields.push({ path: trimmed });
  }
  return fields;
}

function executeQuery(data, queryFields) {
  const result = {};

  for (const field of queryFields) {
    if (field.hasFilter) {
      const arr = resolvePath(data, field.basePath);
      if (!Array.isArray(arr)) continue;
      const filtered = arr.filter(item =>
        item && typeof item === 'object' && item[field.filterField] === field.filterValue
      );
      if (field.subPath) {
        const extracted = filtered.map(item => resolvePath(item, field.subPath));
        const keyName = `${field.basePath}[?${field.filterField}==${field.filterValue}].${field.subPath}`;
        result[keyName] = extracted;
      } else {
        const keyName = `${field.basePath}[?${field.filterField}==${field.filterValue}]`;
        result[keyName] = filtered;
      }
    } else if (field.isStar) {
      const arr = resolvePath(data, field.basePath);
      if (!Array.isArray(arr)) continue;
      if (field.subPath) {
        const extracted = arr.map(item => resolvePath(item, field.subPath)).filter(v => v !== undefined);
        result[field.basePath] = extracted;
      } else {
        result[field.basePath] = arr;
      }
    } else {
      const val = resolvePath(data, field.path);
      if (val !== undefined) {
        result[field.path] = val;
      }
    }
  }

  return result;
}

function toCompactYaml(obj, indent = 0) {
  const pad = '  '.repeat(indent);
  const lines = [];

  if (obj === null || obj === undefined) {
    return 'null';
  }

  if (typeof obj !== 'object') {
    return yamlVal(obj);
  }

  if (Array.isArray(obj)) {
    if (obj.length === 0) return '[]';
    for (const item of obj) {
      if (typeof item === 'object' && item !== null) {
        lines.push(`${pad}- ${toCompactYaml(item, indent + 1).trimStart()}`);
      } else {
        lines.push(`${pad}- ${yamlVal(item)}`);
      }
    }
    return lines.join('\n');
  }

  const entries = Object.entries(obj);
  for (const [key, val] of entries) {
    if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
      lines.push(`${pad}${key}:`);
      lines.push(toCompactYaml(val, indent + 1));
    } else if (Array.isArray(val)) {
      lines.push(`${pad}${key}:`);
      lines.push(toCompactYaml(val, indent + 1));
    } else {
      lines.push(`${pad}${key}: ${yamlVal(val)}`);
    }
  }
  return lines.join('\n');
}

function toFlatLines(result, prefix = '') {
  const lines = [];

  function flatten(obj, pfx) {
    if (obj === null || obj === undefined) { lines.push(`${pfx}=null`); return; }
    if (typeof obj !== 'object') { lines.push(`${pfx}=${yamlVal(obj)}`); return; }
    if (Array.isArray(obj)) {
      if (obj.length === 0) { lines.push(`${pfx}=[]`); return; }
      obj.forEach((item, i) => {
        if (typeof item === 'object' && item !== null) {
          flatten(item, `${pfx}[${i}]`);
        } else {
          lines.push(`${pfx}[${i}]=${yamlVal(item)}`);
        }
      });
      return;
    }
    for (const [k, v] of Object.entries(obj)) {
      const newPfx = pfx ? `${pfx}.${k}` : k;
      flatten(v, newPfx);
    }
  }

  flatten(result, prefix);
  return lines;
}

function generateSummary(data) {
  const summary = {};

  if (data.meta) {
    summary._meta = {
      id: data.meta.feature_id || data.meta.roadmap_id || null,
      status: data.meta.status || null,
      mode: data.meta.mode || null,
    };
    if (data.meta.current_step != null) summary._meta.step = data.meta.current_step;
  }

  if (Array.isArray(data.files)) {
    const total = data.files.length;
    const done = data.files.filter(f => f.status === 'done').length;
    const inProgress = data.files.filter(f => f.status === 'in_progress').length;
    const pending = data.files.filter(f => f.status === 'pending').length;
    summary._files = { total, done, in_progress: inProgress, pending };
    const paths = data.files.map(f => f.path).filter(Boolean);
    if (paths.length > 0) summary._files.paths = paths;
  }

  if (Array.isArray(data.steps)) {
    const doneSteps = data.steps.filter(s => s.status === 'done').length;
    const totalSteps = data.steps.length;
    if (totalSteps > 0) summary._steps = { done: doneSteps, total: totalSteps };
  }

  if (data.security_check) {
    summary._security = data.security_check.status || null;
  }

  if (Array.isArray(data.features)) {
    const byStatus = {};
    for (const f of data.features) {
      const s = f.status || 'unknown';
      byStatus[s] = (byStatus[s] || 0) + 1;
    }
    summary._features = byStatus;
    const doing = data.features.filter(f => f.status === 'doing' || f.status === 'in_progress');
    if (doing.length > 0) summary._features.active = doing.map(f => f.id);
  }

  if (data.axes) {
    const scores = {};
    for (const [axis, info] of Object.entries(data.axes)) {
      if (info && typeof info === 'object' && 'score' in info) {
        scores[axis] = info.score;
        if (Array.isArray(info.findings) && info.findings.length > 0) {
          scores[axis + '_findings'] = info.findings.length;
        }
      }
    }
    if (Object.keys(scores).length > 0) summary._review = scores;
    if (data.meta?.verdict) summary._review.verdict = data.meta.verdict;
  }

  if (data.verdict !== undefined) {
    summary._verdict = data.verdict;
  }

  if (data.critical_findings) {
    summary._critical = data.critical_findings.length;
  }

  const remaining = Object.keys(data).filter(k =>
    !['meta', 'steps', 'files', 'security_check', 'features', 'axes', 'verdict', 'critical_findings'].includes(k)
  );
  if (remaining.length > 0) {
    summary._other = remaining;
  }

  return summary;
}

function expandGlob(pattern) {
  const normalized = pattern.replace(/\\/g, '/');
  if (!normalized.includes('*')) {
    return existsSync(pattern) ? [pattern] : [];
  }

  const parts = normalized.split('/');
  const results = [];

  function walk(segments, currentPath) {
    if (segments.length === 0) {
      if (existsSync(currentPath) && statSync(currentPath).isFile()) {
        results.push(resolve(currentPath));
      }
      return;
    }
    const [head, ...rest] = segments;
    if (head.includes('*')) {
      const regexStr = '^' + head.replace(/\*/g, '[^/]*').replace(/\?/g, '[^/]') + '$';
      const regex = new RegExp(regexStr);
      try {
        const entries = readdirSync(currentPath);
        for (const entry of entries) {
          if (regex.test(entry)) {
            walk(rest, currentPath + '/' + entry);
          }
        }
      } catch {}
    } else {
      walk(rest, currentPath + '/' + head);
    }
  }

  walk(parts, '');
  return results;
}

function main() {
  const opts = parseArgs();

  if (!opts.file) {
    console.log(`read-yaml.mfs — Selective YAML reader for agent context control

Usage:
  node read-yaml.mjs <file.yaml> --query <field-path>     Read specific fields
  node read-yaml.mjs <file.yaml> --summary                Auto-generate summary
  node read-yaml.mjs <glob-pattern> --query ... --flat     Multi-file flat output

Query syntax:
  meta.status                          Single field
  "meta.status,meta.current_step"      Multiple fields
  files[*].path                        All items, one field each
  files[?status==pending].path         Filtered array items
  files[?status==pending]              Full filtered objects

Examples:
  # Get checklist status only (~3 lines output)
  node read-yaml.mjs impl-checklist.yaml --query meta.status

  # Get active file list for conflict check (~5 lines)
  node read-yaml.mjs impl-checklist.yaml --query "meta.status,files[*].path"

  # Find pending files to work on next
  node read-yaml.mjs impl-checklist.yaml --query "files[?status==pending]"

  # Quick summary of any yaml file (~8 lines)
  node read-yaml.mjs impl-checklist.yaml --summary

  # Conflict detection across all features (flat format)
  node read-yaml.mjs "wiki/features/*/impl-checklist.yaml" \\
      --query "meta.status,files[*].path" --flat`);
    process.exit(0);
  }

  const files = expandGlob(opts.file);

  if (files.length === 0) {
    console.error(`ERROR: No files matching: ${opts.file}`);
    process.exit(1);
  }

  for (let fi = 0; fi < files.length; fi++) {
    const filePath = files[fi];

    if (!existsSync(filePath)) {
      console.error(`SKIP (not found): ${filePath}`);
      continue;
    }

    const content = readFileSync(filePath, 'utf-8');
    const data = unwrapArrays(simpleYamlParse(content));

    if (opts.dump) {
      console.log(JSON.stringify(data, null, 2));
      continue;
    }

    if (files.length > 1 || opts.flat) {
      console.log(`--- ${filePath}`);
    }

    if (opts.summary) {
      const summary = generateSummary(data);
      if (opts.flat) {
        console.log(toFlatLines(summary, '').join('\n'));
      } else {
        console.log(toCompactYaml(summary));
      }
    } else if (opts.query) {
      const queryFields = parseQuery(opts.query);
      const result = executeQuery(data, queryFields);
      if (Object.keys(result).length === 0) {
        console.log('(empty — no matching fields)');
      } else if (opts.flat) {
        console.log(toFlatLines(result, '').join('\n'));
      } else {
        console.log(toCompactYaml(result));
      }
    } else {
      console.log('(no --query or --summary specified, use one of them)');
    }

    if (fi < files.length - 1) console.log('');
  }
}

main();
