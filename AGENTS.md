# AGENTS.md - 智能体工作指南

## 项目概述

dev-skills 是一套结构化开发工作流技能体系，通过清晰的职责划分和流程守卫，确保软件工程各环节的高质量执行。

---

## 技能清单 (6个)

| 技能 | 用途 | 输出位置 |
|------|------|---------|
| **cc-init** | 项目初始化 | `codestyle.md` + `AGENTS.md` |
| **cc-req** | 需求收集/分析/规划 | `wiki/requirements/` |
| **cc-arch** | 架构设计 + ADR | `wiki/architecture/` |
| **cc-feat** | 特性开发 (design→impl→accept) | `wiki/features/` |
| **cc-fix** | Bug修复 (report→analyze→fix) | `wiki/issues/` |
| **cc-review** | 五轴代码审查 | `wiki/features/*/review-report.yaml` |
| **cc-kb** | 知识沉淀整理 | `wiki/knowledge/` |

---

## Wiki 结构

```
wiki/
├── raw/                  # 原始输入
├── requirements/         # 需求文档
├── architecture/         # 架构设计 (overview + adrs)
├── features/             # 特性开发
├── issues/              # 问题修复
└── knowledge/           # 知识库
```

---

## 标准工作流

```
新项目:     cc-req → cc-arch → cc-init → cc-feat → cc-review
简单功能:   cc-req → cc-feat → cc-review
Bug修复:    cc-fix → cc-review
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
| requirement | draft → approved → implemented → deprecated |
| architecture | proposed → accepted → implemented → superseded |
| feature | designing → implementing → done → abandoned |
| issue | reported → analyzing → fixing → fixed → closed |
| knowledge | draft → verified |

---

## 全局执行守则

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

## 重要

- 明确技能定位与边界,保持单一职责原则,跨场景适用性要强
- 命名清晰、简洁、动词化, 描述准确,
- 技能描述: 包含技能的功能和使用场景,原则上不超过50字
- 复用已有工具,技能
- 技能内容,只包含:如何做? 遇到问题/错误如何处理? 
- 认真考虑上下文腐烂问题, 
    - 必要时优先增加 references 存放模板或tools 存放脚本(mjs)
    - 可以考虑大段逻辑转场之类的是否可以考虑references,skill.md 只确保什么时候该怎么做

- 逻辑/内容固定优先使用脚本/模板,不确定时,务必给出选项提问
- 量化决策,禁止评分,时间等估算用于决策