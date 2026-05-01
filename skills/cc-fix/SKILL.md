---
name: "cc-fix"
description: "Bug诊断与修复。问题报告→根因分析→修复→回归验证。"
triggers: [bug, 修复, 报错, 异常, 崩溃, 问题, 出错, debug]
---

# Fix - 问题修复

## 职责

问题报告 → 根因分析 → 修复实施 → 回归验证

---

## 前置：cc-fix vs cc-feat 边界判定

**核心原则：边界看"影响面"而非代码行数。1行权限删除的影响 > 200行UI调整。**

```
问题影响面评估（优先级从高到低）:
  安全/权限/数据完整性        → fix（无论行数）
  公共API/跨模块接口
    ├─ 恢复原有行为           → fix + severity=major
    └─ 行为变更/新能力        → cc-feat
  内部模块，恢复预期行为      → fix
  需要重构/架构变更           → fix 止血 + cc-feat 长期方案
```

| 场景 | 判定 |
|------|------|
| 修复时发现需重构 | fix → cc-feat |
| 修复时顺便优化 | ≤50行 fix，否则 cc-feat |
| 修复时发现设计缺陷 | fix 止血 + 新建 cc-feat |
| 安全漏洞 | fix（P0 走 hotfix） |
| 文档/配置错误 | fix（轻量） |
| UI 文案/样式微调 | ≤20行 fix |
| 数据修复脚本 | fix（一次性）+ cc-feat（需持久化工具时） |

**fix → feat 转换**：fix 先止血 → report 标记 `derived_build: {feat-id}` → 新建 cc-feat 标记 `origin_fix: {fix-id}` → feat 完成后回填

**歧义时** → AskUserQuestion："这主要是修复已有问题，还是趁机改进/新增能力？"

---

## 工作流程

### 1. issue-report 问题报告

**输出**: `{project-path}/wiki/issues/{slug}-report.md`

```yaml
---
id: "{slug}"
type: issue
status: reported
title: "{标题}"
depends_on: []
severity: major          # critical | major | minor | trivial
created: "YYYY-MM-DDTHH:MM"
updated: "YYYY-MM-DDTHH:MM"
stale: false
---
```

**正文必含**: 问题描述、复现步骤、期望vs实际行为、环境信息、严重度

> 文档结构见 `templates/report.md`

### 2. issue-analyze 根因分析

**输出**: `{project-path}/wiki/issues/{slug}-analysis.md`（非显然时才创建）

**错误分类 → 分析方法**（先分类，再选方法）:

| 错误类型 | 定位方式 | 适用分析方法 |
|----------|---------|-------------|
| 编译/类型错误 | 读错误信息，定位类型不匹配代码 | 直接定位 |
| 运行时崩溃 | 读堆栈，定位 crash 位置 | 二分排查（范围不明时）/ 日志断点 |
| 逻辑错误 | 写最小复现，对比期望/实际 | 逐步缩小差异 |
| 性能问题 | 定位瓶颈（CPU/内存/网络） | 分析热点代码 |
| 样式/UI问题 | 检查 CSS/渲染逻辑 | 对比设计稿/预期 |

**根因不明确时** → 5 Whys 追问；**范围不明时** → 二分排查

**分析完成后**: 确定修复方案（快速修复 vs 彻底修复），评估影响范围

### 3. issue-fix 修复实施

**输出**: 修复代码 + 更新 report.md status 为 `fixed`

**修复规则**:
- 注释说明修复原因 (`Fix {slug}: ...`)
- 添加防御性编程处理边界
- 同时添加/更新回归测试

**修复后必须执行回归检查**:

| 检查项 | 条件 |
|--------|------|
| 原问题已解决、相关功能未受影响 | **必须** |
| 运行测试（`npm test` 或等价命令） | 有测试时**必须**；无测试则手动验证核心路径 |
| TS 编译零错误 | TS 项目**必须** |
| Lint 通过 | 已配置时**必须** |
| 未引入新问题 | **必须** |

> **关键规则**: 所有修复满足统一质量标准（Production Ready），不因"小 bug fix"降低要求。

**改动范围大**（多文件/公共API）→ 可选触发 `feat-accept` 完整验收

---

## 状态流转

```
reported → analyzing → fixing → fixed → closed
                      ↘ wontfix   ↘ reopened → analyzing
```

| 转换 | 条件 |
|------|------|
| reported → analyzing | 信息足够开始排查 |
| analyzing → fixing | 根因已定位，方案已确定 |
| fixing → fixed | 代码已提交，回归检查通过 |
| fixed → closed | 确认无复发，写 `{project-path}/wiki/kb/raw/` 记录 lesson |
| any → reopened | 问题复现或修复不完整 |

### Reopened 流程

回到 `analyzing`，跳过已确认信息：

1. 在 report.md 追加 `## Reopen #{N}` 章节，记录原因
2. 不重做已确认的根因分析，只分析"为什么修复无效"
3. 原方案是"止血"非"根治"？→ 考虑 cc-feat 做长期方案
4. frontmatter 增加 `reopen_count: N` + `reopen_reasons: [{reason, reopened_at}]`；超过 3 次 → 建议转 cc-feat

---

## 依赖更新子流程

```
触发 → 影响评估 → 兼容性验证 → 升级实施 → 回归测试
```

| 步骤 | 要点 |
|------|------|
| 影响评估 | 读 CHANGELOG；Grep 项目引用；检查生态兼容；评估 CVE/EOL。severity 标签加 `dependency` |
| 兼容性验证 | 有测试→跑完整套件；无测试→手动验证核心路径；大版本升级→建议先 spike |
| 升级实施 | 更新依赖配置→安装→修 breaking changes；注释 `Upgrade {dep}: {old} → {new} (Reason: ...)` |
| 回归测试 | 执行标准回归检查清单；大版本升级额外检查：公共API行为一致、配置格式兼容、性能无退化、无新增 deprecation warning |

> 依赖升级涉及架构调整（如框架大版本迁移）→ 转 cc-feat(origin_refactor)

---

## 协作与输出

| 场景 | 动作 |
|------|------|
| 修复范围超出边界 | → cc-feat，depends_on 关联 |
| 修复涉及需求变更 | → 同步 road-map |
| 修复涉及架构调整 | → cc-arch，记录 ADR |
| 修复后有普遍性教训 | → `{project-path}/wiki/kb/raw/` |
| 修复后需完整验收 | → 可选 feat-accept |

**输出产物**:

| 产物 | 路径 |
|------|------|
| 报告文档 | `{project-path}/wiki/issues/{slug}-report.md`（含 frontmatter） |
| 分析文档 | `{project-path}/wiki/issues/{slug}-analysis.md`（可选） |
| ID 命名 | kebab-case 语义化，如 `login-timeout` / `null-pointer-crash` |
