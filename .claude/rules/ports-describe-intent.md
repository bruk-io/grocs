---
paths:
  - "packages/ports/**"
---

# A port says what the app needs, not what the provider offers

Applies when adding or changing a port interface.

Name port methods by intent (`setItemFields`, `watchWeek`) and shape their arguments and results
from the domain's types. Do not copy an SDK's vocabulary (`updateDoc`, `onSnapshot`, `batch`) or
leak its types into a port.

Why: the backend can change by writing a new provider that passes the same contract suite, with
no change to the domain or UI (decision-1). A port shaped like Firestore makes that impossible.
Whether a name leaks an SDK is a judgement no script can make.

Every port method needs a contract test, an in-memory fake that passes it, and a check will fail
if one is missing (R48); the design of the method is the part left to you.
