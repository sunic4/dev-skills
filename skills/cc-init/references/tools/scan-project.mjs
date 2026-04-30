#!/usr/bin/env node

import { readFileSync, readdirSync, existsSync, statSync } from 'fs';
import { join, relative, extname, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

function walkDirectory(dir, callback) {
  try {
    if (!existsSync(dir) || !statSync(dir).isDirectory()) return;

    const items = readdirSync(dir, { withFileTypes: true });

    for (const item of items) {
      const fullPath = join(dir, item.name);

      if (item.isDirectory()) {
        walkDirectory(fullPath, callback);
      } else if (item.isFile()) {
        callback(fullPath, item.name);
      }
    }
  } catch (e) {
    // 忽略权限错误等
  }
}

function scanProject(wikiDir = 'wiki') {
  const result = {
    wiki_exists: false,
    detection_method: 'script',
    requirements_count: 0,
    features_count: 0,
    roadmaps_count: 0,
    stale_documents: [],
    in_progress_work: [],
    errors: []
  };

  if (!existsSync(wikiDir)) {
    result.wiki_exists = false;
    result.detection_method = 'manual';
    result.note = '新项目或工具未安装，将走 cc-req → cc-arch → cc-init 流程';
    return result;
  }

  result.wiki_exists = true;

  const scanFiles = (dir, pattern, maxResults = 5) => {
    const files = [];
    walkDirectory(dir, (fullPath, name) => {
      if (pattern.test(name) && files.length < maxResults) {
        files.push(fullPath);
      }
    });
    return files;
  };

  const grepInFiles = (dirs, pattern, maxResults = 5) => {
    const matches = [];

    dirs.forEach(dir => {
      walkDirectory(dir, (filePath, name) => {
        if (matches.length >= maxResults) return;
        if (extname(name) !== '.md' && extname(name) !== '.yaml') return;

        try {
          const content = readFileSync(filePath, 'utf-8');
          const lines = content.split('\n');

          lines.forEach((line, index) => {
            if (pattern.test(line) && matches.length < maxResults) {
              matches.push({
                file: relative(process.cwd(), filePath),
                line: index + 1,
                content: line.trim()
              });
            }
          });
        } catch (e) {
          // 忽略读取错误
        }
      });
    });

    return matches;
  };

  result.requirements_count = scanFiles(
    join(wikiDir, 'requirements'),
    /\.md$/
  ).length;

  result.features_count = scanFiles(
    join(wikiDir, 'features'),
    /impl-checklist\.yaml$/
  ).length;

  result.roadmaps_count = scanFiles(
    join(wikiDir, 'roadmaps'),
    /items\.yaml$/
  ).length;

  result.stale_documents = grepInFiles(
    [wikiDir],
    /stale:\s*true/i,
    5
  );

  result.in_progress_work = grepInFiles(
    [wikiDir],
    /status:\s*(implementing|doing|fixing|analyzing)/i,
    5
  );

  return result;
}

function quickConsistencyCheck(wikiDir = 'wiki') {
  const issues = [];

  walkDirectory(wikiDir, (filePath, name) => {
    if (extname(name) !== '.md' && extname(name) !== '.yaml') return;

    try {
      const content = readFileSync(filePath, 'utf-8');
      const lines = content.split('\n').slice(0, 20);

      lines.forEach((line, index) => {
        if (/stale:\s*true|status:/i.test(line)) {
          issues.push({
            file: relative(process.cwd(), filePath),
            line: index + 1,
            content: line.trim()
          });
        }
      });
    } catch (e) {
      // 忽略
    }
  });

  return issues;
}

function projectDashboard(wikiDir = 'wiki') {
  const dashboard = {
    summary: {
      wiki_exists: false,
      requirements: { total: 0, by_status: {} },
      features: { total: 0, by_status: {} },
      issues: { total: 0, by_status: {} },
      roadmaps: { total: 0, by_status: {} },
      spikes: { total: 0, by_status: {} },
      deprecations: { total: 0, by_status: {} },
      stale_documents: 0,
      last_ship: null,
      in_progress_features: 0,
      approved_unshipped: 0
    },
    alerts: []
  };

  if (!existsSync(wikiDir)) {
    dashboard.summary.wiki_exists = false;
    dashboard.alerts.push('wiki/ 不存在，项目未初始化');
    return dashboard;
  }

  dashboard.summary.wiki_exists = true;

  const countByStatus = (dir, statusPattern) => {
    const counts = {};
    walkDirectory(dir, (filePath, name) => {
      if (extname(name) !== '.md' && extname(name) !== '.yaml') return;
      try {
        const content = readFileSync(filePath, 'utf-8');
        const lines = content.split('\n').slice(0, 20);
        for (const line of lines) {
          const match = line.match(/status:\s*(\S+)/);
          if (match) {
            const s = match[1].toLowerCase();
            counts[s] = (counts[s] || 0) + 1;
            break;
          }
        }
      } catch (e) {}
    });
    return counts;
  };

  const countFiles = (dir, pattern) => {
    let count = 0;
    walkDirectory(dir, (fullPath, name) => {
      if (pattern.test(name)) count++;
    });
    return count;
  };

  const reqDir = join(wikiDir, 'requirements');
  const featDir = join(wikiDir, 'features');
  const issueDir = join(wikiDir, 'issues');
  const roadmapDir = join(wikiDir, 'roadmaps');
  const spikeDir = join(wikiDir, 'spikes');
  const deprecationDir = join(wikiDir, 'deprecations');

  dashboard.summary.requirements.total = countFiles(reqDir, /\.md$/);
  dashboard.summary.requirements.by_status = countByStatus(reqDir);
  dashboard.summary.features.total = countFiles(featDir, /impl-checklist\.yaml$/);
  dashboard.summary.features.by_status = countByStatus(featDir);
  dashboard.summary.issues.total = countFiles(issueDir, /\.md$/);
  dashboard.summary.issues.by_status = countByStatus(issueDir);
  dashboard.summary.roadmaps.total = countFiles(roadmapDir, /items\.yaml$/);
  dashboard.summary.roadmaps.by_status = countByStatus(roadmapDir);
  dashboard.summary.spikes.total = countFiles(spikeDir, /\.md$/);
  dashboard.summary.spikes.by_status = countByStatus(spikeDir);
  dashboard.summary.deprecations.total = countFiles(deprecationDir, /\.md$/);
  dashboard.summary.deprecations.by_status = countByStatus(deprecationDir);

  let staleCount = 0;
  walkDirectory(wikiDir, (filePath, name) => {
    if (extname(name) !== '.md' && extname(name) !== '.yaml') return;
    try {
      const content = readFileSync(filePath, 'utf-8');
      if (/stale:\s*true/i.test(content.split('\n').slice(0, 20).join('\n'))) {
        staleCount++;
      }
    } catch (e) {}
  });
  dashboard.summary.stale_documents = staleCount;

  let inProgress = 0;
  walkDirectory(featDir, (filePath, name) => {
    if (extname(name) !== '.yaml') return;
    try {
      const content = readFileSync(filePath, 'utf-8');
      if (/status:\s*implementing/i.test(content)) inProgress++;
    } catch (e) {}
  });
  dashboard.summary.in_progress_features = inProgress;

  let approvedUnshipped = 0;
  walkDirectory(featDir, (filePath, name) => {
    if (!name.includes('review-report')) return;
    try {
      const content = readFileSync(filePath, 'utf-8');
      if (/verdict:\s*approved/i.test(content)) approvedUnshipped++;
    } catch (e) {}
  });
  dashboard.summary.approved_unshipped = approvedUnshipped;

  if (staleCount > 0) dashboard.alerts.push(`${staleCount} 个 stale 文档需要同步`);
  if (inProgress > 3) dashboard.alerts.push(`${inProgress} 个 feature 实现中，可能需要关注`);
  if (approvedUnshipped > 0) dashboard.alerts.push(`${approvedUnshipped} 个 feature 已 review 未 ship`);

  return dashboard;
}

const args = process.argv.slice(2);
const command = args[0] || 'scan';
const wikiDir = args[1] || 'wiki';

switch (command) {
  case 'scan': {
    const result = scanProject(wikiDir);
    console.log(JSON.stringify(result, null, 2));
    break;
  }
  case 'consistency': {
    const issues = quickConsistencyCheck(wikiDir);
    console.log(JSON.stringify(issues, null, 2));
    break;
  }
  case 'dashboard': {
    const dashboard = projectDashboard(wikiDir);
    console.log(JSON.stringify(dashboard, null, 2));
    break;
  }
  case 'help':
  default:
    console.log(`
项目扫描工具 (跨平台兼容)

用法:
  node scan-project.mjs <command> [wiki-dir]

命令:
  scan         扫描项目状态 (默认)
  consistency  快速一致性检查
  dashboard    项目健康仪表盘
  help         显示帮助信息

示例:
  node scan-project.mjs scan wiki
  node scan-project.mjs consistency wiki
  node scan-project.mjs dashboard wiki

输出格式: JSON
`);
    break;
}
