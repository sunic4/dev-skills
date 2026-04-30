# React 项目 - AGENTS.md 约定参考

> 本文件用于帮助 Agent 推断项目约定，**不是固定模板**
> Agent 应根据代码库实际情况选择相关内容

## 应关注的约定维度

### 1. 组件设计
- 函数组件 vs 类组件
- Props 类型定义方式
- 组件文件命名规则
- 组件组织结构 (components/hooks/utils)

### 2. 状态管理
- 局部状态方案 (useState/useReducer)
- 全局状态方案 (Zustand/Jotai/Redux/Context)
- 服务端状态方案 (React Query/SWR)
- 表单状态方案

### 3. 数据获取
- fetch 封装方式
- 错误处理策略
- Loading/Error 状态处理
- 缓存策略

### 4. 样式方案
- CSS Modules / Tailwind / styled-components / CSS-in-JS
- 响应式设计约定
- 主题系统

### 5. 性能优化
- memo 使用场景
- useMemo/callback 使用时机
- 代码分割策略
- 列表渲染 key 规则

### 6. 路由
- 路由库选择
- 路由组织方式
- 权限控制

## 推断方法

| 维度 | 检测方法 | 示例 |
|------|---------|------|
| 状态方案 | 检查依赖和 store 目录 | Zustand + React Query |
| 样式方案 | 检查 CSS 文件和依赖 | Tailwind CSS |
| 数据获取 | 搜索 fetch/axios 使用位置 | services/api.ts |

## 常见反模式（应记录到关键约定）

- 在 useEffect 中直接调用 setState（可能导致无限循环）
- 使用 index 作为列表 key
- 在组件内部定义子组件
- 直接修改 props
- 条件调用 hooks
