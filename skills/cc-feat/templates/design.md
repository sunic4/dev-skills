# Feat Design 文档结构

以下为 `{project-path}/wiki/features/{slug}YYYYMMDDHHMM/{slug}-design.md` 的标准章节结构。

```markdown
---
id: "{slug}"
type: feature
status: designing
title: "{标题}"
depends_on:
  - "{project-path}/wiki/road-map/{slug}.md"
  - "{project-path}/wiki/arch/adrs/{slug}.md"
created: "YYYY-MM-DD HH:MM"
updated: "YYYY-MM-DD HH:MM"
stale: false
---

# {标题} - 技术设计

## 概述
{一段话描述实现思路和关键决策}

## 涉及模块
{列出本次改动涉及的项目模块/目录}

## 文件变更清单
{新建 / 修改 / 删除 + 路径 + 一句话说明改什么}

| 操作 | 文件路径 | 说明 |
|------|---------|------|
| 新建 | src/services/auth.ts | 认证服务核心逻辑 |
| 修改 | src/types/auth.ts | 新增 Token 类型 |
| 删除 | src/utils/old-auth.ts | 移除旧实现 }

*(此表同步写入 impl-checklist.yaml)*

## 接口与类型引用
> 跨模块接口类型引用 `{project-path}/wiki/arch/shared-types.md`，不在此私自定义。
> 仅本模块内部使用的类型可在此定义。

### 引用的共享类型
- `{TypeA}` from `shared-types.md`
- `{TypeB}` from `shared-types.md`

### 本模块内部类型（可选）
```typescript
// 仅本模块内部使用的类型
```

## 数据流
> 仅描述本模块内部的数据流转。跨模块数据流引用 `{project-path}/wiki/arch/shared-types.md` 和 {project-path}/wiki/road-map 接口契约。
{关键数据流转过程，ASCII 图或步骤描述}

```
用户输入 → 校验 → API调用 → 响应处理 → UI更新
```

## 实现要点
{实现中的关键技术点、注意事项、陷阱}

### 要点 1: {标题}
{具体说明}

### 要点 2: {标题}
{具体说明}

## 测试策略

### 测试金字塔
| 层级 | 比例 | 方法 | 范围 |
|------|------|------|------|
| 单元测试 | ~70% | jest/vitest | 核心逻辑函数 |
| 集成测试 | ~20% | 测试关键路径 | API 调用链路 |
| E2E | ~10% | 手动或 Playwright | 主流程 |

### Mock 策略
| 外部依赖 | Mock 方式 | 说明 |
|---------|----------|------|
| {API/DB/第三方} | {msw/vitest.mock/测试容器} | {为什么这样 mock} |

### 关键路径覆盖 (必填，≥3 个)
1. {核心场景 1}
2. {核心场景 2}
3. {核心场景 3}

### 边界测试 (必填，≥2 个)
1. {边界场景 1: 空值/异常/并发}
2. {边界场景 2}

## 风险与依赖
| 风险 | 量化影响 | 缓解措施 |
|------|------|---------|
| ... | ... | ... |
```
