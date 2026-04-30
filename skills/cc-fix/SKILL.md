---
name: "cc-fix"
description: "Bug诊断与修复。问题报告→根因分析→修复→回归验证。"
triggers: [bug, 修复, 报错, 异常, 崩溃, 问题, 出错, debug]
---

# Fix - 问题修复

## 职责
问题报告 → 根因分析 → 修复实施 → 回归验证

## cc-fix vs cc-feat 边界判定（必须先执行）

在开始 fix 流程前，用以下决策树判断：

> **核心原则: 边界判定看"影响面"而非"代码行数"。1 行权限检查删除的影响 > 200 行 UI 调整。**

```
用户描述的问题
    ↓
影响面评估（优先级从高到低）:
    ├─ 安全/权限/数据完整性相关?
    │   → ✅ 走 fix 修复（无论行数，安全优先）
    │
    ├─ 影响公共 API / 跨模块接口?
    │   → 判断:
    │     ├─ 纯恢复原有行为 → fix + 标记 severity=major
    │     └─ 行为变更/新能力 → 转 cc-feat
    │
    ├─ 仅影响内部模块，恢复预期行为?
    │   → ✅ 走 fix 修复
    │
    └─ 修复需要重构/架构变更?
        → ⚠️ cc-fix 先止血 + cc-feat 做长期方案

代码量参考（非判定标准，仅辅助）:
    ├─ ≤ 50 行: 大概率 fit fix
    ├─ 50-200 行: 需结合影响面判断
    └─ > 200 行: 强烈建议走 cc-feat
```

**边界判定补充规则**:

| 场景 | 判定 | 理由 |
|------|------|------|
| 修复 bug 时发现需要重构 | cc-fix → cc-feat | 重构超出修复范围 |
| 修复 bug 时顺便优化性能 | cc-fix (如果 ≤50行) 或 cc-feat | 看改动量 |
| 修复 bug 时发现设计缺陷 | cc-fix 先止血 + 新建 cc-feat | 分离紧急修复和长期改进 |
| 安全漏洞修复 | cc-fix (P0 走 hotfix) | 安全修复优先级最高 |
| 文档/配置错误 | cc-fix (轻量) | 无需 cc-feat 流程 |
| UI 文案/样式微调 | cc-fix (如果 ≤20行) | 不涉及逻辑变更 |
| 数据修复脚本 | cc-fix (一次性) + cc-feat (如果需持久化工具) | 区分临时和长期方案 |

**cc-fix → cc-feat 转换流程**:
1. cc-fix 先完成紧急止血（最小修复使系统恢复可用）
2. 在 fix-report 中记录"衍生 build"标记：`derived_build: {feat-id}`
3. 创建新 cc-feat，在 design.md frontmatter 中记录 `origin_fix: {fix-id}`
4. cc-feat 完成后，回填 fix-report 的 `derived_build` 状态

**歧义时** → 使用 AskUserQuestion 确认: "这主要是修复已有问题，还是趁机改进/新增能力？"

## 工作流程

### issue-report 问题报告

**输出**: `{project-path}/wiki/issues/{slug}-report.md`

frontmatter 格式：
```yaml
---
id: "login-timeout"
type: issue
status: reported                  # reported | analyzing | fixing | fixed | closed | wontfix
title: "登录超时问题"
depends_on: []                    # 通常为空，除非与某需求或特性关联
severity: major                   # critical | major | minor | trivial
created: "2026-04-26T09:00"
updated: "2026-04-26T09:00"
stale: false
---
```

**正文必须包含**:
1. 问题描述（现象）
2. 复现步骤（Step by step）
3. 期望行为 vs 实际行为
4. 环境信息（浏览器/OS/版本）
5. 严重度: critical / major / minor / trivial

文档结构见 `templates/report.md`

### issue-analyze 根因分析

**输出**: `{project-path}/wiki/issues/{slug}-analysis.md` (可选，非显然时才创建)

**分析方法**:

| 方法 | 适用场景 | 决策指引 |
|------|---------|---------|
| 错误分类 | **首先执行**——确定问题类型 | 见下方分类决策树 |
| 5 Whys | 根因不在表面（"为什么反复出现"） | 错误分类后，根因不明确时使用 |
| 二分排查 | 问题范围大、不确定哪部分出错 | 错误分类为"运行时错误"且范围不明时 |
| 日志/断点 | 需要定位具体代码行 | 错误分类后确定排查方向时 |

**错误分类决策树**（新增）:

```
报错/异常
    ├─ 编译/类型错误 → 读错误信息 → 定位类型不匹配的代码
    ├─ 运行时崩溃 → 读堆栈 → 定位 crash 位置 → 判断: null/undefined? 边界? 异步?
    ├─ 逻辑错误（行为不符预期）→ 写最小复现 → 对比期望/实际 → 逐步缩小差异
    ├─ 性能问题 → 定位瓶颈（CPU/内存/网络）→ 分析热点代码
    └─ 样式/UI 问题 → 检查 CSS/渲染逻辑 → 对比设计稿/预期
```

**分析完成后**: 确定修复方案（快速修复 vs 彻底修复），评估影响范围

### issue-fix 修复实施

**输出**: 修复代码 + 更新 report.md 的 status 为 `fixed`

**修复规则**:
- 注释说明修复原因 (Fix {slug}: ...)
- 添加防御性编程处理边界情况
- 同时添加/更新回归测试

**修复完成后必须执行**:

#### 回归检查清单

| 类别 | 检查项 | 强制性 |
|------|--------|--------|
| 功能验证 | 原问题已解决、相关功能未受影响 | **必须** |
| 运行检查 | 有测试则跑 `npm test` (或项目等价命令) | **必须**（无自动化测试则手动验证核心路径）|
| 类型检查 | 无 TS 编译错误 | TS 项目必须 |
| Lint | ESLint/Prettier 通过 | 已配置时必须 |
| 影响范围 | 确认没有引入新问题 | **必须** |

> **关键规则**: 所有修复必须满足统一质量标准 (Production Ready)，不因"只是小 bug fix"而降低要求。
>
> - "无测试配置" → 改用**手动验证**（原问题复现 + 修复验证 + 边界场景）
> - "非 TS 项目" → 跳过类型检查，但其他项仍需满足
> - "未配置 Lint" → 跳过 Lint，但代码质量仍需人工审查

**如果改动范围大** (影响多文件/公共API):
→ 可选触发 `feat-accept` 流程做完整验收

## 状态流转

```
reported → analyzing → fixing → fixed → closed
                        ↘ wontfix   ↘ reopened → analyzing
```

| 状态转换 | 条件 |
|---------|------|
| reported → analyzing | 信息足够开始排查 |
| analyzing → fixing | 根因已定位，方案已确定 |
| fixing → fixed | 代码已提交，回归检查通过 |
| fixed → closed | 确认无复发，写 {project-path}/wiki/kb/raw/ 记录 lesson |
| any → reopened | 问题复现或修复不完整 |

### Reopened 流程

当问题被 reopen 时，**回到 `analyzing` 状态**，但跳过已确认的信息：

1. **记录 reopen 原因**: 在 report.md 中追加 `## Reopen #{N}` 章节
2. **保留已有分析**: 不重做已确认的根因分析，只分析"为什么修复无效"
3. **重新评估方案**: 原方案是"止血"而非"根治"？→ 考虑 cc-feat 做长期方案
4. **reopen 计数**: report.md frontmatter 增加 `reopen_count: N`，超过 3 次 → 建议转为 cc-feat 彻底解决

```yaml
# report.md frontmatter 增加字段
reopen_count: 2
reopen_reasons:
  - reason: "边界场景未覆盖"
    reopened_at: "2026-04-28T10:00"
  - reason: "并发竞态未处理"
    reopened_at: "2026-04-29T14:00"
```

## 与其他技能的协作

| 场景 | 动作 | 目标技能 |
|------|------|---------|
| 修复范围超出边界 | → 转为 `feat` | 在 depends_on 中关联 ISS-ID |
| 修复涉及需求变更 | → 更新 `road-map` | 同步 road-map 文档的 frontmatter |
| 修复涉及架构调整 | → 调用 `arch` | 记录 ADR |
| 修复后有普遍性教训 | → **写 {project-path}/wiki/kb/raw/** (见 cc-kb Raw 写入规范) | 写 lesson |
| 修复后需完整验收 | → **可选触发 `feat-accept`** | 跑完整流程 |

---

## 依赖更新子流程

### 执行流程

```
触发 → Step1:影响评估 → Step2:兼容性验证 → Step3:升级实施 → Step4:回归测试
```

### Step 1: 影响评估

| 评估项 | 方法 |
|--------|------|
| Breaking changes | 阅读 CHANGELOG / Release Notes |
| 影响范围 | Grep 项目中引用该依赖的文件 |
| 生态兼容 | 检查其他依赖是否兼容新版本 |
| 安全等级 | CVE CVSS 评分 / EOL 时间线 |

**severity 标签**: 依赖更新使用 `dependency` 标签 + 原有 severity

### Step 2: 兼容性验证

- 有测试 → 跑完整测试套件
- 无测试 → 手动验证核心路径
- 大版本升级 → 建议先做 spike (cc-arch spike 子流程)

### Step 3: 升级实施

- 更新 `package.json` / `pyproject.toml` 等依赖配置
- 执行安装命令
- 修复 breaking changes 导致的编译/运行错误
- 记录升级原因: `Upgrade {dep}: {version} → {version} (Reason: CVE-XXXX / EOL)`

### Step 4: 回归测试

执行标准回归检查清单 (同 issue-fix 回归检查)。

**大版本升级额外检查**:
- [ ] 公共 API 行为一致
- [ ] 配置文件格式兼容
- [ ] 性能基线无退化
- [ ] 无新增 deprecation warning

> 依赖升级如涉及架构调整 (如框架大版本迁移) → 转 cc-feat(origin_refactor)

## 输出规范

| 项目 | 格式 |
|------|------|
| 报告文档 | `{project-path}/wiki/issues/{slug}-report.md` (含 frontmatter) |
| 分析文档 | `{project-path}/wiki/issues/{slug}-analysis.md` (可选) |
| ID 命名 | kebab-case 语义化名, 如 login-timeout / null-pointer-crash / memory-leak |
