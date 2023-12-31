# @kdx/shared

### This package was created to share resources across other packages.

_How do I know if my code snippet belongs here?_

Whenever either _ADDING A NEW CODE SNIPPET_ or _REMOVING OR ADDING A CODE SNIPPET DEPENDANT_, you must follow this:

```
1. Does your code snippet have more than one dependant, OR, are you absolutely certain it will have more than one dependant in the future?
  |
  ├─ NO
  |   └─ Does not belong on @kdx/shared
  YES
  |
2. Does it make sense to add this code snippet in a package that all of these dependants already use?
For example, it makes sense to place shared zod schemas on @kdx/api. It's in an apropriate context, and
because all app folder dependants can use them.
It might not make sense however, to add a "function that is used to format a string in a specific standardized format" to @kdx/api though, because it's not api specific.
  |
  ├─ NO
  |   └─ Does not belong on @kdx/shared
  YES
  |
Belongs in @kdx/shared
```
