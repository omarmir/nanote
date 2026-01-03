# ESLint Rules Testing Guide

## Rule 1: require-authorize

Tests that all API routes have authorization checks.

### Test Case 1: File WITHOUT authorize (should fail)

```bash
npx eslint server/api/organizations/[id].get.ts
```

Expected output:

```
server/api/organizations/[id].get.ts
  6:16  error  API route handler must call authorize() to secure the endpoint...
```

### Test Case 2: File WITH authorize (should pass)

```bash
npx eslint server/api/agreements/[id].get.ts
```

Expected output: No errors

### Test Case 3: Auth endpoints (should be skipped)

```bash
npx eslint server/api/auth/[...].ts
```

Expected output: No errors (these files are automatically excluded)

### Test Case 4: All API files

```bash
npx eslint 'server/api/**/*.ts' --quiet
```

This will show all API endpoints that are missing authorization checks.

---

## Rule 2: validate-authorize-params

Tests that `authorize()` calls have correct parameters based on the ability being used.

**Note**: This rule automatically detects ability signatures from `shared/utils/abilities/**/*.ts` files. No manual configuration needed!

### Test Case 1: Correct usage with programId (should pass)

```typescript
// server/api/agreements/[id].get.ts
await authorize(event, readAgreement, programId, event.context.$roleMap)
```

```bash
npx eslint server/api/agreements/[id].get.ts
```

Expected output: No errors

### Test Case 2: Correct usage without programId (should pass)

```typescript
// server/api/agreements/index.get.ts
await authorize(event, listAgreements, event.context.$roleMap)
```

```bash
npx eslint server/api/agreements/index.get.ts
```

Expected output: No errors

### Test Case 3: Create test file with intentional errors

Create `server/api/test-authorize-params.ts`:

```typescript
import { defineEventHandlerWithDB } from '~~/server/wrappers/db'

export default defineEventHandlerWithDB(async (event, locale) => {
  const programId = 123

  // ❌ Missing programId - should trigger error
  await authorize(event, readAgreement, event.context.$roleMap)

  // ❌ Extra programId - should trigger error
  await authorize(event, listAgreements, programId, event.context.$roleMap)

  // ❌ Wrong parameter count - should trigger error
  await authorize(event, readAgreement, programId)

  // ✅ Correct usage
  await authorize(event, readAgreement, programId, event.context.$roleMap)
  await authorize(event, listAgreements, event.context.$roleMap)

  return 1
})
```

Run:

```bash
npx eslint server/api/test-authorize-params.ts
```

Expected errors:

```
server/api/test-authorize-params.ts
  6:3   error  authorize(readAgreement) requires programId as third parameter
  9:3   error  authorize(listAgreements) does not take programId
  12:3  error  authorize(readAgreement) expects 4 parameters but got 3
  12:45 error  Last parameter must be event.context.$roleMap
```

### Test All Server Routes

Check all server routes for correct authorize usage:

```bash
npx eslint 'server/api/**/*.ts'
```

### Quick Reference

**The rule automatically detects ability signatures!**

Current abilities (auto-detected from code):

- **With programId**: `createAgreement`, `readAgreement`, `updateAgreement`
- **Without programId**: `listAgreements`, `listOrganizations`, `createOrganizations`, `readOrganizations`, `updateOrganizations`

Usage patterns:

- **With programId**: `await authorize(event, ability, programId, event.context.$roleMap)`
- **Without programId**: `await authorize(event, ability, event.context.$roleMap)`

### Testing Dynamic Detection

To verify the rule correctly detects abilities:

1. **Add a new ability** in `shared/utils/abilities/test.ts`:

```typescript
export const testAbility = defineAbility(
  (user: Session, programId: number, roleAbilityMap?: RoleToAbilityMap | null) => {
    return true
  }
)
```

2. **Use it incorrectly** in a server route:

```typescript
await authorize(event, testAbility, event.context.$roleMap) // Missing programId
```

3. **Run ESLint**:

```bash
npx eslint server/api/your-test-file.ts
```

4. **Expected error**:

```
authorize(testAbility) requires programId as the third parameter
```

This confirms the rule dynamically detected that `testAbility` requires `programId`!

### Continuous Integration

Both rules run automatically during:

- Pre-commit hooks (if configured)
- CI/CD pipeline builds
- IDE real-time validation

## Integration into CI/CD

Add this to your CI/CD pipeline to prevent unauthorized endpoints from being merged:

```bash
# In your CI script
npx eslint 'server/api/**/*.ts'
```

The build will fail if any API endpoints are missing authorization checks.
