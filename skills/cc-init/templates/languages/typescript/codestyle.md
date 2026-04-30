# CodeStyle - TypeScript 项目

## 检测来源
{自动检测现有代码库的风格特征，或使用本模板默认值}

## 命名约定
| 类型 | 规则 | 示例 |
|------|------|------|
| 文件 | kebab-case | `user-service.ts` |
| 组件文件 | PascalCase | `UserProfile.tsx` |
| 变量 | camelCase | `userName` |
| 常量 | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT` |
| 类/接口/类型 | PascalCase | `UserService`, `IUserRepository` |
| 类型别名 | PascalCase | `UserDTO` |
| 枚举 | PascalCase | `UserRole` |
| 枚举值 | PascalCase | `UserRole.Admin` |

## 目录结构约定
```
src/
├── components/     # UI 组件
├── hooks/          # 自定义 hooks
├── services/       # 业务逻辑/ API 调用
├── types/          # 类型定义
├── utils/          # 工具函数
├── constants/      # 常量

tests/                  # 测试文件     # 测试文件
```

## 代码格式化
- 使用 ESLint + Prettier
- 配置文件: `.eslintrc.js`, `.prettierrc`
- 缩进: 2 spaces
- 分号: 必须
- 引号: 单引号
- 尾随逗号: ES5 兼容

## 类型系统
- 优先使用 `interface` 定义对象类型
- 使用 `type` 定义联合类型、工具类型
- 避免使用 `any`，使用 `unknown` 或具体类型
- 导出所有公共类型

## 导入顺序
1. 外部依赖 (React, lodash 等)
2. 内部模块 (别名路径)
3. 相对路径导入
4. 类型导入 (使用 `import type`)

## 禁止事项
- ❌ 使用 `any` 类型
- ❌ 在组件中直接调用 API
- ❌ 嵌套超过 3 层的三元表达式
- ❌ 在循环中使用 `await`
- ❌ 未处理的 Promise

## 测试约定
- 测试文件命名: `*.test.ts` 或 `*.spec.ts`
- 测试目录: 与源文件同级 `tests/` 或 `*.test.ts`
- 使用 Jest 或 Vitest
- 覆盖率要求: > 80%
