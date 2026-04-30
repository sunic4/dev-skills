# Arch 输出文档结构

## ADR 决策记录 (`adrs/{slug}.md`)

```markdown
---
id: "{slug}"
type: architecture
status: accepted
title: "{ADR 标题}"
depends_on:
  - "road-map/{slug}.md"
created: "YYYY-MM-DD HH:MM"
updated: "YYYY-MM-DD HH:MM"
stale: false
---

# ADR: {标题}

## 状态: {accepted | implemented | superseded | deprecated}

## 背景
{为什么需要做这个决策？当前的问题或驱动力是什么？}
{引用需求约束：来自 `road-map/{slug}.md` 的哪些约束驱动了此决策}

## 决策
{最终选择了什么方案？一句话概括}

## 理由
{为什么选了这个方案？满足哪些约束？}

## 后果
### 正面影响
{这个决策带来的好处}

### 负面影响 / 风险
{需要付出的代价或需要注意的风险}

### 影响范围
{哪些代码/模块会受影响}

## 验证假设
{此决策依赖哪些前提假设？如何验证？}

## 可逆性评估
{此决策是否可逆？回退成本多大？}
```

## 模块设计 (`modules/{slug}-module.md`)

```markdown
---
id: "{slug}"
type: architecture
status: accepted
title: "{模块名} 模块设计"
depends_on:
  - "road-map/{slug}.md"
created: "YYYY-MM-DD HH:MM"
updated: "YYYY-MM-DD HH:MM"
stale: false
---

# {模块名} 模块设计

## 职责
{这个模块负责什么？不负责什么？（边界）}

## 对外接口
{本模块暴露给外部的能力}

| 接口 | 类型 | 说明 |
|------|------|------|
| ... | Function / Class / Type | ... |

## 内部结构
| 目录/文件 | 职责 |
|----------|------|
| ... | ... |

## 依赖关系
- **依赖上游**: {列表}
- **被下游依赖**: {列表}

## 与 Feat 设计的分工
⚠️ 本文档定义模块级契约（接口、职责、边界）
   具体实现在 feat design.md 中详细展开
```

**arch module vs feat design 分工规则**:
- arch/module 写: **"这个模块有什么职责、暴露什么接口、依赖谁"**
- feat/design 写: **"这次具体怎么实现、改哪些文件、数据流细节"**
- 如果一个 module 只会被一个 feat 实现，可以只在 feat design 中写，跳过 arch module
