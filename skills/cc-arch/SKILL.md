---
name: "cc-arch"
description: "架构设计与技术决策。技术选型/系统设计/接口定义/架构决策。"
triggers: [架构, 技术选型, 系统设计, ADR, 接口定义, 技术决策]
---

# Arch - 架构设计

## 职责

协助完成技术选型、架构设计与 ADR 决策记录。

> ⚠️ **定位**: cc-arch 是**设计决策阶段**，只产出文档，不生成生产代码。
> 代码实现由下游 `cc-feat` 负责。

**产出边界**:

| ✅ 应该产出 | ❌ 禁止产出 |
|-----------|-----------|
| ADR 决策记录 (`wiki/arch/adrs/*.md`) | 项目源码文件 (`.ts/.js/.py/...`) |
| 架构设计文档 (overview, modules) | 测试代码 / 配置文件 |
| 接口类型定义 (shared-types.md) | 数据库迁移脚本 |
| 技术调研报告 (research/*.md) | 任何可执行代码 |
| Spike 验证结论 (spikes/*-spike.md) | |

**唯一例外**: Spike 探索期间可写 PoC 代码，但必须：
- 放在临时目录或独立分支
- **不进入主分支**
- 结论记录后代码可丢弃

**核心原则**:
1. **协助不替代** — AI 分析建议，用户做最终决策
2. **决策即持久化** — 确认后立即写入 ADR，不等全部讨论完
3. **不确定交用户** — AI 有倾向可推荐，拿不准必须交给用户
4. **文档不代码** — 只写 `.md` 文档，不生成生产代码；接口定义写在 `shared-types.md`

---

## 工作流

### Phase 1: 启动检查

**前置条件（满足任一）**:
- 有对应 REQ 文档 (`{project-path}/wiki/road-map/{slug}.md` 且 `status ≠ deprecated`)
- 用户明确的设计目标 + 足够需求上下文

**目录处理**: `{project-path}/wiki/` 不存在时按 G0 规则自动创建，提示后续执行 `cc-init`

**Stale 阻断**: 上游 REQ `stale: true` → 先同步再继续

---

### Phase 2: 决策讨论

#### Step 1: 技术调研（如需要）

仅涉及不熟悉的技术时执行，输出到 `{project-path}/wiki/raw/research/{topic}.md`

> ⚠️ **静默执行**: 禁止输出过渡性文字，直接 WebSearch/WebFetch，完成后一次性输出结论

#### Step 2: 识别决策点

先列出所有决策点并展示进度：

```
📋 架构决策进度：
1. ⬜ 响应式系统 — 待讨论
2. ⬜ 渲染架构 — 待讨论
...

选择模式：
A) 逐项讨论 — 每次一个，详细确认
B) 批量确认 — 列出所有+推荐方案，快速确认
C) 全部采用推荐 — 跳过讨论，直接采用
```

#### Step 3: 逐项/批量讨论

**逐项模式流程**（每个决策点）：

| 步骤 | 内容 |
|------|------|
| 说明背景 | 为什么需要这个决策 (1-2句) |
| 列出备选 | 2-3个选项 + 优缺点 |
| 给出建议 | AI 推荐及理由（如有倾向） |
| 等待确认 | 用户选择 / 提新方案 / 要求更多选项 |

**用户反馈处理**:

| 反馈 | 动作 |
|------|------|
| 选择方案 | **立即写 ADR**，更新进度，进入下一个 |
| 不满意 | 补充备选重新展示 |
| 提新方案 | 评估后加入选项 |
| 信息不足 | 暂存 TBD，先做 PoC |
| "你决定" | AI 可决策，需说明理由并**立即写 ADR** |

**批量确认模式**：

一次列出所有决策点及推荐方案，用户可逐项修改或"全部OK"，确认后**批量写 ADR**。

**AI 推荐原则**:
- 有明确最佳选择 → 直接推荐
- 多个方案各有优劣 → 列出权衡点，让用户决定
- 不确定/缺乏上下文 → 必须交给用户

> ⚠️ **禁止**:
> - 不经确认替用户决策 / 先生成完整 ADR 再问"行不行"
> - 生成任何生产代码文件（源码、测试、配置、迁移脚本等）
> - 将接口定义写入项目源码（应写在 `shared-types.md`）

---

### Phase 3: 文档产出

#### ADR 写入

每个决策确认后立即写入 `{project-path}/wiki/arch/adrs/{slug}.md`

**ADR 模板**:

```yaml
---
id: "{slug}"  type: architecture  status: accepted
title: "{标题}"  depends_on: ["{project-path}/wiki/road-map/{slug}.md"]
created: "YYYY-MM-DD HH:MM"  updated: "YYYY-MM-DD HH:MM"  stale: false
---
```

**ADR 必含内容**:
1. 背景: 为什么需要这个决策
2. 结果: 选择了什么及理由
3. 后果: 正面影响、负面影响、风险
4. 验证假设: 依赖哪些前提？如何验证？
5. 可逆性评估: 是否可逆？回退量化指标？

**何时写 ADR**: 技术选型 / 架构模式 / 重要约束决策

**命名规则**: `{领域}-{具体决策}` (kebab-case, 10-50字符)

**可逆性分类**:

| 类别 | 量化指标 | 建议 |
|------|---------|------|
| 可逆 | ≤3文件，≤1模块，无数据迁移 | 可大胆尝试 |
| 部分可逆 | 4-10文件或2-3模块或有结构化数据迁移 | 需原型验证 |
| 不可逆 | >10文件或>3模块或非结构化数据迁移或Schema变更 | 必须 PoC |

**状态流转**: `accepted → implemented → superseded → deprecated`

#### 其他文档

| 类型 | 路径 | 内容 |
|------|------|------|
| 系统总览 | `overview.md` | 技术栈、分层、模块清单 (项目级，首次创建) |
| 模块设计 | `modules/{name}-module.md` | 单个模块的接口、依赖、结构 |
| 共享类型 | `shared-types.md` | 跨模块接口类型 (**唯一事实源**) |

**overview.md 增量更新**:
- 新增模块 → 追加条目
- 技术栈变更 → 更新对应行
- ADR 新增 → 追加链接
- 模块废弃 → 标记删除线 + deprecated 注释

> ❌ **禁止**: 每次变更全量重写 overview.md

---

### Phase 4: 收尾

#### 产出自检

退出前必须检查：

```
📋 cc-arch 产出检查：
- [ ] `{project-path}/wiki/raw/research/{topic}.md` — 技术调研 (如执行了)
- [ ] `{project-path}/wiki/arch/adrs/*.md` — 所有 ADR 已写入
- [ ] `{project-path}/wiki/arch/overview.md` — 系统总览
- [ ] `{project-path}/wiki/arch/modules/*-module.md` — 模块设计 (如需要)
- [ ] `{project-path}/wiki/arch/shared-types.md` — 共享类型 (如需要)
- [ ] ✅ 未生成任何生产代码文件（仅产出 .md 文档）
```

> ❌ **禁止空退出**: 决策已确认但 ADR 未写，必须补写才能退出
> ❌ **职责越界**: 如发现生成了代码文件，必须删除并移交给 `cc-feat`

#### 变更传播

ARCH 文档被修改时:
1. 更新自身 frontmatter (`updated` 时间戳, 重大变更设 `stale: true`)
2. Grep `"depends_on.*{当前ARCH id}"` 找下游 FEAT
3. 标记 downstream stale + 提示

---

## Spike/PoC 验证

### 流程

```
触发 → 假设定义 → 时间盒探索(≤4h) → 结论记录 → 结果回注
```

### 输出模板

写到 `{project-path}/wiki/spikes/{slug}-spike.md`:

```markdown
---
id: "{slug}"
type: spike
status: validated | failed
title: "{Spike 标题}"
depends_on:
  - "../architecture/adrs/{adr-slug}.md"
validated_at: "YYYY-MM-DD HH:MM"
validated_by: "spike"
created: "YYYY-MM-DD HH:MM"  updated: "YYYY-MM-DD HH:MM"  stale: false
---

# Spike: {标题}

## 验证假设
- 假设: {一句话描述}
- 成功标准: {通过标准}
- 失败标准: {失败标准}
- 时间盒: ≤4h

## 探索方法
{做了什么、用了什么技术}

## 结论
- ✅/❌ 假设验证结果
- 证据: {关键发现}

## 可复用结论 (feat 可直接引用)
- 已验证的技术事实
- 已验证的方案可行性
- 实现约束 (来自 spike 发现)

## 后续行动
- 通过 → cc-feat(origin_spike)
- 失败 → 回到 ADR 选备选
```

### 结果回注

| 结果 | 动作 |
|------|------|
| validated | 更新关联 ADR；正式实现 → cc-feat(origin_spike) |
| failed | 更新关联 ADR，排除该方案；回到选备选 |
| 超时未决 | 记录当前发现，ADR 标注"需进一步验证" |

### Spike → Feat 传递

- spike 文档 (`status: validated`) 是验证凭证
- feat 在实现要点中标注 `[spike-validated]`
- spike 的"实现约束"是 feat 的硬性约束

---

## 协作机制

### 下游触发

| 场景 | 下一步 |
|------|--------|
| 设计完成，新项目 | → `cc-init` (生成 CodeStyle/AGENTS.md) |
| 设计完成，已有项目 | → `cc-feat` |
| 需求不清 | ↩ 回 `cc-req` |
| 多需求共享架构 | depends_on 中列出所有 road-map |

### Shared Types 处理

当 `shared-types.md` 含 `source: auto-generated-by-road-map` 时:

1. **完整性检查** — 类型是否完整、命名一致
2. **补充完善** — 添加实现细节、JSDoc、使用示例
3. **状态更新** — `draft` → `accepted`
4. **变更传播** — 标记下游 cc-feat stale

> shared-types.md 是跨模块类型的唯一事实源
