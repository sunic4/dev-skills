# Review Report 结构

## review-report.yaml 完整 schema

```yaml
meta:
  feature_id: "{slug}"
  reviewer: "agent-reviewer"
  reviewed_at: "YYYY-MM-DD HH:MM"
  verdict: approved | request_changes | rejected

summary:
  total_files_changed: N
  lines_added: N
  lines_removed: N
  change_size: small | medium | large

axes:
  correctness:
    score: 1-5
    findings:
      - severity: nit | optional | fyi | should | must
        file: "relative/path.ts"
        line: N
        description: "问题描述"
        suggestion: "修复建议"
  security:
    score: 1-5
    findings: []
  performance:
    score: 1-5
    findings: []
  maintainability:
    score: 1-5
    findings: []
  test_coverage:
    score: 1-5
    findings: []

action_items:
  - id: N
    finding_ref: "axis.key[index]"
    action: "fix before merge | fix after merge | improve later | waive with reason"
    status: open | in_progress | done | deferred
```

## Verdict 速查

| verdict | 含义 | 下一步 |
|---------|------|--------|
| approved | 无阻塞性问题 | 进入 ship |
| request_changes | 有 should/must 级别问题 | 修复后必须 re-review |
| rejected | 严重问题（correctness <2 或 security must） | 打回重做 |

## 五轴评分参考

| 分数 | 含义 |
|------|------|
| 5 | 优秀，无明显改进空间 |
| 4 | 良好，有小改进点(optional/fyi) |
| 3 | 及格，有应修复项(should) |
| 2 | 不及格，有问题必须修(must) |
| 1 | 严重，需要重新设计 |
