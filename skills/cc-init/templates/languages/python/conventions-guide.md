# Python 项目 - AGENTS.md 约定参考

> 本文件用于帮助 Agent 推断项目约定，**不是固定模板**
> Agent 应根据代码库实际情况选择相关内容

## 应关注的约定维度

### 1. 类型系统
- Python 版本要求 (3.10+ / 3.11+)
- 类型注解风格 (X \| Y vs Union[X, Y])
- 类型检查工具 (mypy/pyright)
- Pydantic 使用

### 2. 项目结构
- src layout vs flat layout
- 包组织方式
- __init__.py 使用规范

### 3. 异步编程
- async/await 使用范围
- 异步框架 (asyncio/anyio)
- 同步/异步 API 设计

### 4. Web 框架特定
- FastAPI: 依赖注入、路由组织、中间件
- Django: App 结构、ORM 使用、模板
- Flask: Blueprint 组织、扩展使用

### 5. 错误处理
- 自定义异常类层次
- 日志框架和格式
- 错误响应格式

### 6. 测试
- pytest 配置和 fixtures
- Mock 策略
- 覆盖率工具

### 7. 代码质量
- Ruff/Flake8 配置
- Black/isort 配置
- pre-commit hooks

## 推断方法

| 维度 | 检测方法 | 示例 |
|------|---------|------|
| Python 版本 | pyproject.toml requires-python | >=3.10 |
| 类型注解覆盖率 | 统计函数是否有类型标注 | 85% |
| 异步使用 | 搜索 async def 数量 | 30% 函数为异步 |

## 常见反模式（应记录到关键约定）

- 裸 except 子句
- import *
- 可变默认参数
- 未使用的导入
- 魔法数字/字符串
