# TypeScript 项目 - AGENTS.md 约定参考

> 本文件用于帮助 Agent 推断项目约定，**不是固定模板**
> Agent 应根据代码库实际情况选择相关内容

## 应关注的约定维度

### 1. 类型系统
- `interface` vs `type` 的使用偏好
- 是否禁止 `any`
- 类型导出方式
- 泛型使用模式

### 2. 模块化
- ES Modules vs CommonJS
- 路径别名配置
- 导入顺序规范
- barrel file (`index.ts`) 使用

### 3. 异步处理
- async/await vs .then()
- 错误处理模式
- Promise 并行处理方式

### 4. 测试
- 测试框架 (Jest/Vitest)
- 测试文件命名
- Mock 策略
- 覆盖率要求

### 5. 代码质量
- Linter 配置 (ESLint)
- Formatter 配置 (Prettier/Biome)
- 严格模式设置

## 推断方法

| 维度 | 检测方法 | 示例 |
|------|---------|------|
| 类型偏好 | 统计 interface/type 使用比例 | interface: 80%, type: 20% |
| 异步模式 | 搜索 await/.then 使用情况 | async/await: 95% |
| 导入顺序 | 分析现有文件的 import 块 | 标准库→第三方→本地 |

## 常见反模式（应记录到关键约定）

- 使用 any 类型
- 嵌套回调而非 async/await
- 循环中的顺序 await（应使用 Promise.all）
- 未处理的 Promise rejection
