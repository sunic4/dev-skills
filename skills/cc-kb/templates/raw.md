---
title: "{标题}"                    # ✋ 必填: 一句话概括
category: pattern | lesson | decision | reference  # ✋ 必填
source_skill: "{cc-feat|cc-fix|cc-arch|cc-req|cc-retro}"  # ✋ 必填
created: "YYYY-MM-DD"             # ✋ 必填
see_also: []                      # 可选: 关联已有条目
cross_project: false              # 可选: 是否跨项目通用 (默认 false)
cross_project_tags: []            # 可选: 跨项目标签 (如 ["auth", "error-handling"])
---

# {标题}

## 问题/场景
{什么情况下遇到}

## 解决方案
{具体做法}

## 为什么这样做
{原因分析}

---

## 各 category 额外必填项

| category | 额外必填 |
|----------|---------|
| **pattern** | 代码示例 + 反例 |
| **lesson** | 先错后对对比 + 预防措施 (至少2层5Whys) |
| **decision** | ADR引用或完整决策记录 |
| **reference** | 使用场景说明 |
