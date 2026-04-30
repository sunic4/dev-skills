# Issue Report 文档结构

以下为 `{project-path}/wiki/issues/{slug}-report.md` 的标准章节结构。

```markdown
---
id: "{slug}"
type: issue
status: reported
title: "{标题}"
depends_on: []
severity: major
created: "YYYY-MM-DD HH:MM"
updated: "YYYY-MM-DD HH:MM"
stale: false
---

# {标题}

## 问题描述
{现象是什么？用户看到了什么错误信息？}

## 复现步骤
1. 步骤一
2. 步骤二
3. 步骤三
{必须可以按此步骤稳定复现}

## 期望行为 vs 实际行为
- **期望**: {应该发生什么}
- **实际**: {实际发生了什么}

## 环境信息
| 项目 | 值 |
|------|-----|
| 环境 | 本地 / 开发 / 生产 |
| OS / Browser | ... |
| 版本 | ... |
| 复现频率 | 总是 / 经偶发 / 一次 |

## 相关日志 / 截图
{错误堆栈、控制台输出、截图等证据}

## 初步分析 (可选)
{如果已有初步判断可在此记录，否则留空等 analyze 步骤}
```
