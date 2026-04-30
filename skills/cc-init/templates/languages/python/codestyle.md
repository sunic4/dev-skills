# CodeStyle - Python 项目

## 检测来源
{自动检测现有代码库的风格特征，或使用本模板默认值}

## 命名约定
| 类型 | 规则 | 示例 |
|------|------|------|
| 模块/包 | snake_case | `user_service.py` |
| 类 | PascalCase | `UserService` |
| 函数/方法 | snake_case | `get_user_by_id` |
| 变量 | snake_case | `user_name` |
| 常量 | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT` |
| 私有属性 | _leading_underscore | `_internal_cache` |
| 类型别名 | PascalCase | `UserId = int` |

## 目录结构约定
```
src/
├── {package_name}/   # 主包
│   ├── __init__.py
│   ├── api/          # API 路由
│   ├── services/     # 业务逻辑
│   ├── models/       # 数据模型
│   ├── repositories/ # 数据访问
│   └── utils/        # 工具函数
├── tests/            # 测试目录
├── pyproject.toml    # 项目配置
└── README.md
```

## 代码格式化
- 使用 Black (默认 88 字符行宽)
- 使用 isort 排序导入
- 使用 Ruff 或 Flake8 检查
- 配置文件: `pyproject.toml` 或 `ruff.toml`

## 类型注解
- Python 3.10+ 使用内置类型 (`list[str]` 而非 `List[str]`)
- 所有公共函数必须有类型注解
- 使用 `typing` 模块的类型工具
- 使用 `pydantic` 进行数据验证

## 导入顺序
1. 标准库
2. 第三方库
3. 本地模块

## 文档字符串
- 使用 Google 风格或 NumPy 风格
- 公共函数/类必须有 docstring

```python
def get_user(user_id: int) -> User | None:
    """根据 ID 获取用户.

    Args:
        user_id: 用户唯一标识

    Returns:
        用户对象，如果不存在返回 None
    """
```

## 禁止事项
- ❌ 使用裸 `except`
- ❌ 导入 `*`
- ❌ 可变默认参数
- ❌ 未使用的导入
- ❌ 魔法数字（应定义为常量）

## 测试约定
- 使用 pytest
- 测试文件命名: `test_*.py`
- 测试类命名: `Test*`
- 测试函数命名: `test_*`
- 使用 `pytest.fixture` 管理测试数据
- 覆盖率要求: > 80%
