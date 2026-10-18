---
id: DRAFT-1
title: Generate the layer agents and the launch hook
status: Draft
assignee: []
created_date: '2026-10-18 18:16'
labels:
  - size-5
  - agents
milestone: m-1
dependencies: []
parent_task_id: TASK-1
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
From decision-3. Waits on the walking skeleton (TASK-1.4), whose files are the examples. Template, six layer configs, generator, a check that committed definitions match and agree with the route table, the write guard, and the agent-launch hook.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 18 agent definitions are generated from one template and six configs, with pinned models and efforts
- [ ] #2 A check fails when a committed definition differs from the generated one or disagrees with the route table
- [ ] #3 The launch hook blocks a mismatched layer, model or size, and a size-1 task without numbered steps, with the reason
- [ ] #4 The write guard blocks an edit outside the calling agent's layer, with the reason
<!-- AC:END -->
