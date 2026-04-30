#!/usr/bin/env node

import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { simpleYamlParse } from './yaml-utils.mjs';

const SCHEMAS = {
  impl_checklist_full: {
    required: ['meta', 'steps', 'files'],
    meta: ['feature_id', 'mode', 'status', 'created', 'updated', 'current_step'],
    meta_mode: ['full'],
    meta_status: ['designing', 'implementing', 'reviewing', 'done', 'abandoned'],
    step: ['id', 'name', 'status', 'evidence'],
    step_status: ['pending', 'in_progress', 'done', 'blocked'],
    file: ['path', 'status', 'changes'],
    file_status: ['pending', 'in_progress', 'done'],
    security_check_status: ['pending', 'passed', 'failed']
  },
  items: {
    required: ['roadmap', 'features'],
    feature: ['id', 'title', 'status', 'priority', 'depends_on', 'modules', 'estimated_files'],
    feature_status: ['todo', 'doing', 'done', 'skipped'],
    priority: ['p0', 'p1', 'p2'],
    shared_task: ['id', 'title', 'status', 'blocks'],
    shared_task_status: ['todo', 'doing', 'done']
  },
  review_report: {
    required: ['meta', 'summary', 'axes', 'action_items'],
    meta: ['feature_id', 'reviewer', 'reviewed_at', 'verdict'],
    verdict: ['approved', 'request_changes', 'rejected'],
    summary: ['total_files_changed', 'lines_added', 'lines_removed', 'change_size'],
    change_size: ['small', 'medium', 'large'],
    axis: ['correctness', 'security', 'performance', 'maintainability', 'test_coverage'],
    finding: ['severity', 'description', 'suggestion'],
    severity: ['nit', 'optional', 'fyi', 'should', 'must'],
    action_item: ['id', 'finding_ref', 'action', 'status'],
    action_status: ['open', 'in_progress', 'done', 'deferred']
  },
  kb_status: {
    required: ['meta', 'stats', 'pending_curation'],
    meta: ['last_curated', 'curator'],
    stats: ['raw_count', 'verified_count', 'archived_count'],
    pending: ['file', 'type', 'suggested_category', 'quality_score', 'auto_action'],
    auto_action: ['publish', 'needs_review', 'merge_with', 'skip_duplicate']
  },
  project_status: {
    required: ['meta', 'overview'],
    meta: ['generated_at', 'generator'],
    overview: ['active_features', 'open_issues', 'pending_reviews', 'knowledge_raw_pending', 'health_score']
  },
  rollback_plan: {
    required: ['rollback'],
    rollback: ['method', 'estimated_time', 'data_impact', 'notification_required', 'decision_maker'],
    method: ['git-revert', 'db-migration-down', 'feature-flag-off', 'container-rollback'],
    data_impact: ['none', 'partial', 'full']
  }
};

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = { file: null, schema: null, strict: false };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--schema' && args[i + 1]) { opts.schema = args[++i]; }
    else if (args[i] === '--strict') { opts.strict = true; }
    else if (!args[i].startsWith('--')) { opts.file = args[i]; }
  }
  return opts;
}

function loadYaml(filePath) {
  if (!existsSync(filePath)) {
    console.error(`ERROR: File not found: ${filePath}`);
    process.exit(1);
  }
  const content = readFileSync(filePath, 'utf-8');
  try {
    return simpleYamlParse(content);
  } catch (e) {
    console.error(`ERROR: Failed to parse YAML: ${filePath}`);
    console.error(e.message);
    process.exit(1);
  }
}

function detectSchema(data) {
  if (data.meta?.feature_id && data.files) {
    return 'impl_checklist';
  }
  if (data.roadmap && data.features) return 'items';
  if (data.meta?.feature_id && data.axes) return 'review_report';
  if (data.meta?.curator && data.stats) return 'kb_status';
  if (data.meta?.generator && data.overview) return 'project_status';
  if (data.rollback) return 'rollback_plan';
  return null;
}

function validate(data, schemaName, strict) {
  const schema = SCHEMAS[schemaName];
  if (!schema) {
    console.error(`ERROR: Unknown schema: ${schemaName}`);
    console.error(`Available: ${Object.keys(SCHEMAS).join(', ')}`);
    process.exit(1);
  }

  const errors = [];
  const warnings = [];

  for (const field of schema.required) {
    if (!(field in data)) {
      errors.push(`MISSING required field: ${field}`);
    }
  }

  function checkObj(obj, path, shape) {
    if (!obj || typeof obj !== 'object') return;
    for (const [key, expected] of Object.entries(shape)) {
      if (Array.isArray(expected)) {
        if (!(key in obj)) {
          errors.push(`MISSING ${path}.${key}`);
          continue;
        }
        const val = obj[key];
        if (Array.isArray(val)) {
          if (val.length === 0 && strict) {
            warnings.push(`EMPTY array at ${path}.${key}`);
          }
          const enumKey = key + (key.endsWith('s') ? key.slice(0, -1) : '');
          const enumValues = schema[enumKey] || schema[key];
          if (enumValues && Array.isArray(enumValues)) {
            for (let i = 0; i < val.length; i++) {
              if (!enumValues.includes(val[i])) {
                errors.push(`INVALID enum value "${val[i]}" at ${path}.${key}[${i}] (expected: ${enumValues.join('|')})`);
              }
            }
          }
        } else if (typeof expected[0] === 'string' && !Array.isArray(val)) {
          const enumValues = schema[key] || expected;
          if (enumValues.includes(val)) {
          } else if (strict) {
            warnings.push(`Unexpected scalar "${val}" at ${path}.${key} (expected enum or array)`);
          }
        }
      } else if (typeof expected === 'object' && !Array.isArray(expected)) {
        if (key in obj && typeof obj[key] === 'object') {
          checkObj(obj[key], `${path}.${key}`, expected);
        } else if (strict && !(key in obj)) {
          warnings.push(`MISSING optional object ${path}.${key}`);
        }
      }
    }
  }

  for (const [key, shape] of Object.entries(schema)) {
    if (key === 'required') continue;
    if (key in data) {
      if (typeof shape === 'object' && !Array.isArray(shape)) {
        checkObj(data[key], key, shape);
      }
    } else if (schema.required.includes(key)) {
    } else if (strict) {
      warnings.push(`MISSING optional top-level: ${key}`);
    }
  }

  if (data.steps && Array.isArray(data.steps)) {
    const stepSchema = schema.step || {};
    data.steps.forEach((step, i) => {
      checkObj(step, `steps[${i}]`, stepSchema);
    });
  }
  if (data.features && Array.isArray(data.features)) {
    const featureSchema = schema.feature || {};
    data.features.forEach((feature, i) => {
      checkObj(feature, `features[${i}]`, featureSchema);
    });
  }
  if (data.shared_tasks && Array.isArray(data.shared_tasks)) {
    const taskSchema = schema.shared_task || {};
    data.shared_tasks.forEach((task, i) => {
      checkObj(task, `shared_tasks[${i}]`, taskSchema);
    });
  }
  if (data.action_items && Array.isArray(data.action_items)) {
    const aiSchema = schema.action_item || {};
    data.action_items.forEach((ai, i) => {
      checkObj(ai, `action_items[${i}]`, aiSchema);
    });
  }

  return { errors, warnings };
}

function main() {
  const opts = parseArgs();

  if (!opts.file) {
    console.log(`Usage: node validate-yaml.mjs <file.yaml> [--schema <name>] [--strict]

Schemas: ${Object.keys(SCHEMAS).join(', ')}
Aliases: impl_checklist (auto-detects full/lite/ff from meta.mode)

If --schema is not provided, auto-detects from file content.`);
    process.exit(0);
  }

  const filePath = resolve(opts.file);
  const data = loadYaml(filePath);
  const schemaName = opts.schema || detectSchema(data);

  if (!schemaName) {
    console.log(`UNKNOWN: Could not detect schema for ${filePath}`);
    console.log(`Use --schema to specify explicitly.`);
    process.exit(1);
  }

  const { errors, warnings } = validate(data, schemaName, opts.strict);

  if (errors.length === 0 && warnings.length === 0) {
    console.log(`PASS [${schemaName}] ${filePath}`);
  } else {
    if (errors.length > 0) {
      console.error(`FAIL [${schemaName}] ${filePath}`);
      for (const e of errors) console.error(`  ERROR:   ${e}`);
    }
    if (warnings.length > 0) {
      console.warn(`WARN [${schemaName}] ${filePath}`);
      for (const w of warnings) console.warn(`  WARNING: ${w}`);
    }
    process.exit(errors.length > 0 ? 1 : 0);
  }
}

main();
