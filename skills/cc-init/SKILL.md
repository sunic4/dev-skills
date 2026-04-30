---
name: "cc-init"
description: "项目初始化。生成codestyle.md和AGENTS.md。"
triggers: [初始化, 新项目, 项目设置, codestyle, 项目规范]
---

# Init - 项目初始化

## 职责

生成 `codestyle.md` 和 `AGENTS.md`，建立项目编码规范和智能体工作指南。

---

## 执行流程

### Step 1: 技术栈检测

| 检测项 | 方法 |
|--------|------|
| 编程语言 | 文件扩展名分布 (.ts/.py/.rs/.go) |
| 包管理器 | 锁文件 (package-lock/yarn.lock/pnpm-lock/Cargo.lock) |
| 框架 | 依赖配置 (package.json/pyproject.toml) |
| 构建工具 | 配置文件 (vite.config/tsconfig.json) |
| 测试/质量工具 | ESLint/Prettier/Ruff/Clippy 配置 |

如有 REQ/ARCH 文档，合并其技术约束和决策，优先级: ARCH > road-map > 自动检测。

记录检测结果到 `{project-path}/wiki/raw/project-tech-stack.yaml`:
```yaml
language: typescript
framework: react
confidence: high  # high/medium/low
source: auto_detected  # auto_detected / user_specified
```

### Step 2: 模板选择 + CodeStyle 生成

从 `templates/{languages,frameworks}/` 选择:
1. 先选语言模板 → 再选框架模板 (可选) → 合并
2. 无对应模板 → 用最接近的 + 标注 `{需人工补充}`
3. 不确定时询问用户

**CodeStyle 生成策略**:

| 场景 | 策略 |
|------|------|
| 有代码 + 有 REQ/ARCH | 模板 + ARCH决策优先 + 代码推断 |
| 有代码 + 无 REQ/ARCH | 模板 + 代码推断 |
| 无代码 (全新项目) | 模板 + `{待确认}` 占位符 |
| 已存在 codestyle.md | 不覆盖，仅标注待确认项 |

### Step 3: 生成 AGENTS.md

在**项目根目录**创建。

**核心原则**: 信息密集、准确反映项目、结构化易扫描

**必须章节**:

| 章节 | 内容来源 | 必填 |
|------|---------|------|
| 1. 项目概述 | package.json description / README | ✅ |
| 2. 技术栈 | Step 1 检测结果 (表格形式) | ✅ |
| 3. 关键约定 | 从代码库推断 (引用 codestyle.md) | ✅ |
| 4. 目录结构 | 实际目录树 (2-3层深度) | 推荐 |
| 5. 常用命令 | package.json scripts (3-5个最常用) | 推荐 |

**行数指南**: micro/small ≤80行; medium ≤150行; large ≤250行
**❌ 不包含**: 技能使用说明、工作流流程图、详细编码规范、通用最佳实践

**质量检查**:
- [ ] 行数符合规模上限
- [ ] 技术栈与实际一致
- [ ] 约定来自代码库推断，非模板复制
- [ ] 目录结构与实际匹配

---

## 技术栈变更重新初始化

当以下情况发生时，重新执行 Step 1-3 (**增量更新，不删除**):

| 触发条件 | 影响范围 |
|---------|---------|
| 新增主要依赖 | codestyle.md + AGENTS.md 技术栈章节 |
| 换框架/核心库 | 全部重新生成 |
| 项目规模增长 >50% | AGENTS.md 目录结构章节 |

---

## 输出规范

| 项目 | 路径 |
|------|------|
| 技术栈记录 | `{project-path}/wiki/raw/project-tech-stack.yaml` |
| 代码规范 | `codestyle.md` 或 `AGENTS.md` 的「关键约定」章节 |
| 智能体指南 | `AGENTS.md` |

---

## 注意事项

- **不覆盖已有文件**: 只补缺，不清理
- **AGENTS.md 只生成一次初始版本**: 后续由各技能增量更新索引

## 常见问题

| 问题 | 处理方式 |
|------|---------|
| 已有 codestyle.md/AGENTS.md | 不覆盖，只标注待确认项 |
| 技术栈检测置信度低 | 标注 `{需人工确认}`，询问用户 |
| 模板不存在 | 用最接近的模板 + 标注 `{需人工补充}` |
| 用户有冲突要求 | 优先 ARCH > road-map > 自动检测 |
