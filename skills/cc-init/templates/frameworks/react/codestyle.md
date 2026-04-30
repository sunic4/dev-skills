# CodeStyle - React 项目

## 检测来源
{自动检测现有代码库的风格特征，或使用本模板默认值}

## 命名约定
| 类型 | 规则 | 示例 |
|------|------|------|
| 组件文件 | PascalCase | `UserProfile.tsx` |
| 组件函数 | PascalCase | `function UserProfile() {}` |
| Hook 文件 | camelCase + use 前缀 | `useAuth.ts` |
| Hook 函数 | use 前缀 | `useAuth` |
| 工具文件 | kebab-case | `format-date.ts` |
| 常量 | UPPER_SNAKE_CASE | `API_BASE_URL` |
| 类型/接口 | PascalCase | `UserProps`, `IUser` |

## 目录结构约定
```
src/
├── components/
│   ├── common/        # 通用组件
│   ├── layout/        # 布局组件
│   └── features/      # 功能组件
├── hooks/             # 自定义 hooks
├── pages/             # 页面组件 (如使用路由)
├── services/          # API 调用
├── stores/            # 状态管理
├── types/             # 类型定义
├── utils/             # 工具函数
tests/                 # 测试文件
```

## 组件规范

### 函数组件优先
```tsx
// 推荐
export function UserProfile({ user }: UserProfileProps) {
  return <div>{user.name}</div>
}

// 避免
class UserProfile extends React.Component { ... }
```

### Props 类型定义
```tsx
interface UserProfileProps {
  user: User
  onEdit?: () => void
}

export function UserProfile({ user, onEdit }: UserProfileProps) {
  // ...
}
```

### 组件结构
1. Hooks 调用
2. 派生状态 / memo
3. 事件处理函数
4. 副作用 (useEffect)
5. 渲染

## 状态管理
- 局部状态: `useState`
- 复杂状态: `useReducer`
- 全局状态: {Zustand / Jotai / Redux Toolkit}
- 服务端状态: {React Query / SWR}

## 样式方案
- {CSS Modules / Tailwind CSS / styled-components}
- 避免内联样式 (动态样式除外)

## 性能优化
- 使用 `React.memo` 包装纯组件
- 使用 `useMemo` / `useCallback` 避免不必要渲染
- 列表使用稳定的 `key`
- 代码分割: `React.lazy` + `Suspense`

## 禁止事项
- ❌ 在渲染函数中定义组件
- ❌ 在 useEffect 中直接调用 setState (无限循环)
- ❌ 使用 index 作为列表 key
- ❌ 直接修改 props
- ❌ 在组件内部定义 hook (条件调用)

## 测试约定
- 使用 React Testing Library
- 测试用户行为，而非实现细节
- 测试文件: `*.test.tsx` 或 `tests`
- 覆盖率要求: > 80%
