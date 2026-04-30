# AGENTS.md - 智能体工作指南

## 项目概述

dev-skills 是一套结构化开发工作流技能体系，通过清晰的职责划分和流程守卫，确保软件工程各环节的高质量执行。

---

## 技能清单 (8个)

| 技能 | 用途 | 输出位置 |
|------|------|---------|
| **cc-init** | 项目初始化 | `{project-path}/wiki/raw/` + `codestyle.md` + `AGENTS.md` |
| **cc-req** | 需求收集/分析/规划 | `{project-path}/wiki/road-map/` |
| **cc-arch** | 架构设计 + ADR | `{project-path}/wiki/arch/` |
| **cc-feat** | 特性开发 (design→impl→accept) | `{project-path}/wiki/features/` |
| **cc-fix** | Bug修复 (report→analyze→fix) | `{project-path}/wiki/issues/` |
| **cc-review** | 五轴代码审查 | `{project-path}/wiki/features/*/review-report.yaml` |
| **cc-kb** | 知识沉淀整理 | `{project-path}/wiki/kb/` |
| **cc-retro** | 项目复盘与技能评估 | `{project-path}/wiki/kb/raw/` + retro report |

---

## Wiki 结构

```
{project-path}/wiki/
├── raw/                  # 原始输入
├── road-map/             # 需求文档 (cc-req)
├── arch/                 # 架构设计 (cc-arch, overview + adrs + modules)
├── features/             # 特性开发 (cc-feat)
├── issues/               # 问题修复 (cc-fix)
├── kb/                   # 知识库 (cc-kb)
├── tools/                # 工具脚本 (cc-init 安装)
└── spikes/               # 技术验证 (cc-arch spike)
```

---

## 标准工作流

```
新项目:     cc-req → cc-arch → cc-init → cc-feat → cc-review
简单功能:   cc-req → cc-feat → cc-review
Bug修复:    cc-fix → cc-review
迭代复盘:   cc-retro (项目结束/版本发布后)
```

---

## Frontmatter 规范

```yaml
---
status: {枚举}            # ✋ 必填
title: "{标题}"           # ✋ 必填
version: N                # 重大变更递增
id/type/depends_on/created/updated/stale  # 自动推断或生成
---
```

| type | status 枚举 |
|------|------------|
| requirement | draft → planning → approved → implemented → deprecated |
| architecture | proposed → accepted → implemented → superseded |
| feature | designing → implementing → done → abandoned |
| issue | reported → analyzing → fixing → fixed → closed → wontfix; reopened → analyzing |
| spike | validated → failed |
| knowledge | draft → verified |

---

## 全局执行守则

### G0: 目录自建

- 任何技能写入 `{project-path}/wiki/` 子目录时，目录不存在则自动创建
- 无需等待 cc-init 或 cc-arch 先行创建

### G1: 反重复输出

- 禁止连续输出语义相同的过渡性语句
- 动作只描述一次
- 调研步骤静默执行，完成后直接输出结果

### G2: 产出保障

- 技能退出前必须自检产出
- 产出清单前置声明，结束时逐项勾选
- 决策即持久化
- 禁止空退出

### G3: 规模自适应

| 规模 | 判定 | 流程调整 |
|------|------|---------|
| micro | <5文件,<100行 | 一句话需求，跳过 arch |
| small | ≤6文件,≤300行 | 标准流程 |
| medium | >6文件或>300行 | 完整流程 |
| large | >10文件或>500行 | **必须拆分** |

---

## 变更传播机制

**stale 阻断 (硬性约束)**:
1. 文档变更 → 设 `stale: true`
2. 下游读取 stale 文档 → **暂停 → 同步 → 继续**
3. 不可跳过，不可仅警告

## 技能规范

### 技能设计原则

- 明确技能定位与边界，保持单一职责原则，跨场景适用性要强
- 命名清晰、简洁、动词化，描述准确
- 技能描述包含功能和使用场景，原则上不超过 50 字
- 复用已有工具和技能，优先组合而非重复造轮子
- 技能内容只包含：如何做？遇到问题/错误如何处理？
- 认真考虑上下文腐烂问题

### 技能编写规则

#### Frontmatter 必须包含

```yaml
---
name: {技能名}            # 全小写、连字符分隔，如 cc-feat
description: {≤50字}     # 功能一句话说使用场景
triggers: []             # 触发关键词列表，增强隐式触发准确性
---
```

#### 产出约定

每个技能必须明确其产出位置，遵循以下规则：

- 技能产出目录与技能名对应，不可混用
- 决策类产物（如架构决策、功能设计）必须写入对应 `{project-path}/wiki/` 子目录
- 产出文件须包含完整的 frontmatter 元数据
- 技能退出前必须自检：产出清单是否齐全？

#### 触发机制

| 触发方式 | 说明 |
|----------|------|
| 显式命令 | 用户输入 `/skill-name` 精确调用 |
| 隐式触发 | 用户输入匹配 triggers 关键词列表 |
| 流程委托 | 上游技能完成时自动触发下游技能 |

#### 技能组合规则

- **调用语法**：`/skill-name` 显式委托任务
- **依赖声明**：在 frontmatter 的 `depends_on` 中声明依赖链
- **冲突处理**：后调用的技能覆盖先前的同名决策（Last-Write-Wins），变更必须记录
- **禁止循环依赖**：技能依赖关系必须是有向无环图（DAG）

#### 上下文交接协议

- 技能完成后，关键决策和中间产物写入目标 `{project-path}/wiki/` 目录
- 使用 frontmatter 的 `status` / `stale` 标记文档状态
- 下游技能读取时若发现 `stale: true`，**必须**先同步再继续
- 交接时须明确传递：决策结论、待解决问题、依赖假设

#### References 管理规范

- references/ 目录下的模板须标注适用版本范围
- 超过 3 个模板时，须说明各自的适用场景
- references 本身的 stale 由父技能负责维护
- 大段逻辑转场优先放入 references，skill.md 只确保"什么时候该怎么做"

### 技能分类

| 分类 | 技能 | 说明 |
|------|------|------|
| 阶段型 | cc-req → cc-arch → cc-feat → cc-review | 按开发流程顺序执行 |
| 响应型 | cc-fix | 被动触发，处理问题报告 |
| 支撑型 | cc-init, cc-kb, cc-retro | 独立于流程，提供基础设施/知识管理/复盘 |

### 目录参考

```
{skill-name}/
├── SKILL.md                # 必需（含 YAML frontmatter + Markdown 指令）
├── scripts/                # 可选（可执行脚本，优先 mjs 跨平台）
├── references/             # 可选（参考文档）
├── templates/             # 可选（参考模板）
└── assets/                 # 可选（模板、图片等资源）
```
