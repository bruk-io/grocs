---
id: decision-13
title: Kitchen create and join go through application commands
date: '2026-10-20 03:19'
status: accepted
---
## Context

TASK-1.20's backend is built:
- the `KitchenGateway` port (`createKitchen`, `joinKitchen` with five rejection reasons);
- the Cloud Functions behind it;
- `FirebaseKitchenGateway` and `MemoryKitchenGateway`;
- the security rules.

Its review left one design question for whoever wires the screens. Should the screens reach the gateway through `packages/application`'s command dispatcher, or directly on the composition root, the way `GoogleSignIn` and the demo's `signInAsDemoMember()` (decision-12) are wired?

R28 says only the application layer calls ports. The sign-ins sit on the composition root because they change who is signed in and dispatch no domain event. Creating a kitchen and joining one are domain actions. Each has a result the screen acts on and five ways a join can be refused, and each needs a signed-in member.

## Decision

Kitchen create and join are application commands, `CreateKitchen` and `JoinKitchen`. They are dispatched like `AddItem`, call the `KitchenGateway` port, and return the outcome. A refused join is a normal result carrying its reason, not a thrown error. Each has scenario tests on the fake gateway, covering every rejection reason. The screens dispatch these commands and never touch the gateway. The composition root picks the gateway, as it picks every other provider: Firebase in the real app, in-memory in the demo.

Decided by Bruk on Oct 19, 2026, from the two options the orchestrator offered (application commands, or the composition root).

## Consequences

- Sign-in stays on the composition root (decision-12, and `GoogleSignIn`), and kitchen membership goes through the application layer. The line between them is whether the action is a domain action with rules and outcomes, or a change of who is signed in.
- TASK-1.20's remaining work splits by layer. The application commands come first, then the app wiring of KitchenSetupTemplate and the join screen with route tests.
- A returning member on a new phone needs a way to find their kitchen, and no port offers one yet. The gateway only creates and joins. That lookup is backend work (a port, providers and rules), filed separately for the backend side. Until it lands, the app holds the kitchen it created or joined in session state.
