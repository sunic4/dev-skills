---
name: "cc-feat"
description: "特性设计与实现。需求→设计→编码→验收。"
triggers: [特性, 功能开发, 实现, 编码, design, impl, accept, 开发]
---

# Feat - 特性开发

## 职责

将需求/架构转化为可交付代码：**技术设计 → 编码实现 → 验收测试**

## 规模上限

| 维度 | 上限 |
|------|------|
| 文件变更数 | ≤ 6 个 (新建+修改) |
| 代码行数 | ≤ 300 行 (git diff) |
| 公共 API | ≤ 4 个 |
| 函数/方法 | ≤ 8 个 (含私有) |
| 模块跨度 | ≤ 2 个一级目录 |

超出任一维度 → 拆分为多个子 feat，每个独立满足完整 DoD

---

## 前置检查（全部通过才可启动）

1. **Stale 检测**: REQ/ARCH 任一 `stale=true` → 暂停并同步
2. **冲突检测**: 检查 `status: designing/implementing` 的 feat 是否有文件路径重叠（design 阶段即检测）
3. **依赖顺序**: `depends_on` 引用的 FEAT 未完成 → 等待
4. **Road-map 对齐** (关联时): 提取 priority/depends_on + 接口契约
5. **接口合规** (多模块时): design 接口须与 road-map 定义一致
6. **入口来源验证**: 支持以下驱动方式

### 入口来源

| origin_type | 含义 | 前置条件 | design.md 额外字段 |
|-------------|------|---------|-------------------|
| `req` (默认) | 需求驱动 | REQ 存在且 status=approved | 无 |
| `origin_fix` | Bug 修复衍生 | fix-report 存在且 status=fixed | `origin_fix: "{fix-slug}"` |
| `origin_refactor` | 重构/技术债 | 无硬性前置 | `origin_refactor: true` + `refactor_motivation:` |
| `origin_spike` | Spike 验证后实现 | spike 存在且 status=validated | `origin_spike: "{spike-slug}"` |

#### Spike 结论传递 (origin_spike 时)

cc-feat 直接继承 spike 已验证结论，无需重复验证：

- 从 spike 文档提取"可复用结论"，写入 design.md 并标注 `[spike-validated]`
- cc-review 遇到 `[spike-validated]` 标注项 → 跳过技术可行性审查
- spike 发现的"实现约束"必须在 impl 中严格遵守

design.md 引用格式：
```markdown
### 要点: {标题}
- 方案可行性: [spike-validated] {结论摘要} (见 spikes/{slug}-spike.md)
- 实现约束: {来自spike的约束}
```

> 非 REQ 驱动的 feat 通过 accept 后不更新 road-map status（无关联），但仍同步 road-map（如关联）

---

## 子流程

### 1. feat-design 技术设计

**输入**: REQ + ARCH (或替代来源)  
**输出**: `{project-path}/wiki/features/{slug}/index.md` + `impl-checklist.yaml`

design.md 必填内容：

1. 实现思路概述
2. 文件变更清单 (新建/修改/删除)
3. 接口与类型定义
4. **测试策略**
   - 测试金字塔比例 (推荐 7:2:1)
   - Mock 策略 (外部依赖如何 mock/stub)
   - 关键路径覆盖 (≥3 个核心场景)
   - 边界测试 (≥2 个：空值/异常/并发)
5. 风险与依赖
6. **DoD 验收标准**

> checklist 格式详见 `templates/design.md`

### 2. feat-impl 编码实现

**输入**: design.md + impl-checklist.yaml  
**输出**: 实际代码 + 更新的 checklist.yaml

**编码规范**:
- 先类型定义，后实现逻辑
- 遵循项目现有代码风格
- 小步提交，每完成一个文件更新 checklist status 并运行 validate-yaml 校验
- 避免 `any` 类型

**异常处理**:

| 场景 | 动作 |
|------|------|
| 需求不清 | ↩ 回退 cc-req 补充缺失点 |
| 设计不可行 | ↩ 回退 feat-design 修改 |
| 发现 bug | → 创建 issue 分支处理 |
| 发现好模式 | → 记录到 `{project-path}/wiki/kb/raw/` (不中断主流程) |

**迭代机制**:

```
design(v1) → impl(发现问题) → design(v2) → impl(继续) → accept
                                     ↑              │
                                     └─ 回退≤3次 ───┘
```

同一功能回退 >3 次 → 暂停，评估是否需求问题，回退 cc-req

### 3. feat-accept 验收测试

#### DoD (Definition of Done)

```yaml
must_have:
  build: ["构建零错误"]
  typecheck: ["类型检查零 error (允许 deprecated 警告)"]
  test: ["单元测试100%通过", "核心路径覆盖率≥90%"]
  code_quality:
    - Lint零error
    - 格式一致
    - 无 console.log/debugger/TODO/HACK/FIXME 残留
  documentation:
    - 公共 API 有 JSDoc
    - 复杂逻辑有解释性注释 (why not how)
  checklist_complete:
    - impl-checklist.yaml 所有条目=done
    - 所有文件变更已记录
```

任一 must_have 不满足 → ❌ 不通过

#### 结果处理

| 结果 | 动作 |
|------|------|
| ✅ 通过 | `meta.status: done`; road-map `status: implemented`; 同步 road-map |
| ❌ 不通过 | ↩ 回退 feat-impl 或 feat-design |

验收通过后 → 触发 **cc-review**

---

## 安全检查 (feat-impl 阶段)

编码完成后自动执行 OWASP Top 10 核心检查：

| # | 检查项 | 级别 |
|---|--------|------|
| S1 | 输入验证与清洗 (XSS/SQL注入) | Critical |
| S2 | 认证与授权 (越权访问) | Critical |
| S3 | 敏感数据处理 (明文密码/token) | High |
| S4 | 依赖安全 (已知CVE) | Medium |
| S5 | 错误信息泄露 (堆栈暴露) | Medium |

- 全部通过 → 进入 feat-accept
- 有 Critical/High 问题 → **阻止验收**，必须修复后重检

> cc-review Axis 2 读取 `security_check` 字段跳过已通过项

---

## 输出产物

| 产物 | 路径 | 时机 |
|------|------|------|
| Feature 目录 | `{project-path}/wiki/features/{slug}/` | design 开始时创建 |
| 设计文档 | `index.md` | feat-design 完成 |
| 进度追踪 | `impl-checklist.yaml` | design 创建，impl 持续更新 |
| 审查报告 | `{slug}-review-report.yaml` | accept 后由 review-generate.mjs 生成 |
