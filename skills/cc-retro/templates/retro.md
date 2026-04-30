# Retrospect Report 结构

## 完整报告示例（中大型项目）

```yaml
meta:
  project_name: "用户权限系统"
  retrospect_date: "2026-04-28"
  period_start: "2026-04-01"
  period_end: "2026-04-28"
  participants:
    - "agent-developer"
    - "agent-reviewer"
  total_features: 8
  total_bugs_fixed: 2

statistics:
  skills_used:
    cc-req: 5
    cc-arch: 2
    cc-feat: 8
    cc-fix: 2
    cc-review: 6
    cc-kb: 3
    cc-retro: 1

  skills_skipped:
    - skill: cc-feat
      used: true
      skipped_reason: null
      notes: "8 个功能：全部使用统一质量标准 (Production Ready)"
    - skill: cc-fix
      used: true
      skipped_reason: null
      notes: "2 个 bug 全部修复"
    - skill: cc-review
      used: true
      skipped_reason: null
      notes: "6 次审查：5 次通过，1 次需修改后 re-review"
    - skill: cc-kb
      used: true
      skipped_reason: null
      notes: "沉淀 3 条知识：1 pattern, 2 lessons"

completeness:
  - skill: cc-req
    total_invocations: 5
    fully_completed: 5
    partially_completed: 0
    incomplete: 0
    details: "所有需求都有验收标准"
  - skill: cc-feat
    total_invocations: 8
    fully_completed: 8
    partially_completed: 0
    incomplete: 0
    details: "全部满足统一 DoD 标准（构建/类型检查/测试/代码质量）"
  - skill: cc-fix
    total_invocations: 2
    fully_completed: 2
    partially_completed: 0
    incomplete: 0
    details: "全部执行了 report → analyze → fix"
  - skill: cc-review
    total_invocations: 6
    fully_completed: 6
    partially_completed: 0
    incomplete: 0
    details: "全部完成五轴评审"

transitions:
  - from: cc-req
    to: cc-feat
    count: 4
    issues: 0
    notes: "正确衔接"
  - from: cc-req
    to: cc-arch
    count: 1
    issues: 0
    notes: "JWT 认证需求正确衔接到 arch"
  - from: cc-arch
    to: cc-feat
    count: 1
    issues: 0
    notes: "架构决策后进入实现"
  - from: cc-feat
    to: cc-review
    count: 7
    issues: 1
    issue_detail: "1 次 review 返回 request_changes，修复后重新 review 通过"

issues:
  - id: I1
    category: process_improvement
    description: "大型 feat 需要更好的拆分指导"
    severity: medium
    impact: "1 个 feat 超过 300 行，导致 review 时间较长"
    root_cause: |
      Why 1: 开发者对功能大小上限不够敏感
      Why 2: cc-feat/SKILL.md 的规模原则不够突出
      Why 3: 缺乏自动化的规模检测提示
      根本原因: 需要在设计阶段增加规模预检
    suggestion: "在 cc-feat design 阶段增加规模量化检视步骤"
    status: pending
  - id: I2
    category: tool_bug
    description: "validate-yaml.mjs 在 Windows 下路径解析错误"
    severity: high
    impact: "Windows 用户无法验证 YAML 文件"
    root_cause: |
      Why 1: 路径分隔符使用了硬编码的 /
      Why 2: 未使用 path.normalize() 或 path.join()
      根本原因: 跨平台兼容性考虑不足
    suggestion: "使用 path.join() 替代字符串拼接"
    status: fixed
    fixed_at: "2026-04-20"

improvements:
  - priority: high
    target: cc-feat/SKILL.md
    action: "在 design 阶段增加规模量化检视和拆分建议"
    assignee: "技能维护者"
    due_date: "2026-05-01"
  - priority: medium
    target: cc-feat/SKILL.md
    action: "增加'重构'相关的意图识别关键词"
    assignee: "技能维护者"
    due_date: "2026-05-05"
  - priority: low
    target: cc-kb/SKILL.md
    action: "补充归档触发条件和流程"
    assignee: "技能维护者"
    due_date: "2026-05-10"

knowledge_captured:
  - title: "JWT 刷新令牌的最佳实践"
    category: pattern
    source: "cc-arch - 2026-04-10"
    location: "{project-path}/wiki/kb/patterns/jwt-refresh-token.md"
  - title: "避免在 useEffect 中直接使用 state"
    category: lesson
    source: "cc-fix - 2026-04-15"
    location: "{project-path}/wiki/kb/raw/20260415-1430-useeffect-state.md"
  - title: "React Query 缓存失效时机"
    category: lesson
    source: "cc-feat - 2026-04-20"
    location: "{project-path}/wiki/kb/raw/20260420-0930-react-query-cache.md"

previous_retrospect_actions:
  - action: "补充 security 技能的 Layer 2 检查项"
    status: completed
    completed_at: "2026-04-05"
  - action: "修复 read-yaml.mjs 的 glob 展开问题"
    status: completed
    completed_at: "2026-04-08"

next_actions:
  - "在 cc-feat design 阶段增加规模量化检视步骤"
  - "将 2 条 raw 知识条目整理到正式目录"
  - "安排下次复盘时间：2026-05-10"
```

## 简化报告示例（小型项目）

```yaml
meta:
  project_name: "工具脚本开发"
  retrospect_date: "2026-04-26"
  period_start: "2026-04-20"
  period_end: "2026-04-26"
  participants: []

statistics:
  skills_used:
    cc-feat: 2
    cc-fix: 1
  skills_skipped:
    - skill: cc-req
      reason: "需求简单明确，直接实现"
    - skill: cc-review
      reason: "micro 规模（<5文件, <100行），review 可选"

coverage:
  - skill: cc-feat
    used: true
    notes: "2 个功能，均满足统一 DoD 标准"
  - skill: cc-fix
    used: true
    notes: "1 个 bug 修复"

issues: []

improvements: []

knowledge_captured: []

next_actions:
  - "项目较小，无需特别改进"
```

## 问题分类说明

| 类别 | 说明 | 示例 |
|------|------|------|
| skill_definition | 技能定义不清晰 | 规模上限标准不够明确 |
| tool_bug | 工具执行出错 | Windows 路径解析错误 |
| process_gap | 流程缺失或断裂 | review 后不知道下一步 |
| documentation | 文档缺失或不准确 | SKILL.md 示例代码过时 |
| knowledge_not_captured | 知识未沉淀 | 解决问题后忘记记录 |
| process_improvement | 流程可优化 | 大型 feat 拆分指导不足 |
