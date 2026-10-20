---
id: DRAFT-14
title: The app reads its kitchen's name and members
status: Draft
assignee: []
created_date: '2026-10-20 21:36'
labels:
  - size-3
dependencies: []
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Asked for by the UI side (Oct 20, 2026). Settings and the Household screen still show sample text ('Our kitchen', 'your partner') and the Household invite card has no live Share or Copy, because nothing reads a kitchen's name or its members once it exists; KitchenGateway only creates, joins and finds the member's kitchen id. Backend side: a port (or a gateway method), the Firebase and in-memory providers with contract tests, security rules letting a member read only their own kitchen, and an application query beside findMyKitchen. The UI wiring follows in apps/mobile once the query exists.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 An application query returns the signed-in member's kitchen name and members (display names, and which one is the caller), on every provider, with contract tests
- [ ] #2 Security rules let a member read only their own kitchen's name and members, with allow and deny tests
<!-- AC:END -->
