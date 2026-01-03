# Custom ESLint Rules

This directory contains custom ESLint rules for the GCT-OSC project to enforce security best practices and type safety for API authorization.

## Rules Overview

1. **require-authorize** - Ensures all API endpoints have authorization checks
2. **validate-authorize-params** - Validates that `authorize()` calls have correct parameters based on the ability

---

## Rule 1: require-authorize

This ESLint rule enforces that all API route handlers in the `server/api/` directory must call the `authorize()` function to ensure proper security checks are in place.

### Purpose

Security is critical for API endpoints. This rule helps prevent accidentally creating unsecured endpoints by requiring an explicit authorization check in every API handler.

### What it checks

The rule triggers an error when it finds:

- `defineEventHandler`
- `defineEventHandlerWithDB`
- `defineEventHandlerWithId`

...in files under `server/api/` that **do not** contain a call to `authorize()`.

### Exceptions

The following files/paths are automatically excluded from this rule:

- `server/wrappers/**` - Wrapper utility functions (like `defineEventHandlerWithId`, `defineEventHandlerWithDB`)
- `server/api/[...].ts` - Catch-all error handler
- `server/api/auth/**` - Authentication endpoints

**Note**: The wrappers themselves don't need authorization because they're just utility functions that wrap `defineEventHandler`. Only the actual API endpoint files that _use_ these wrappers need authorization.

### Example

#### ❌ Fails the rule:

```typescript
// server/api/organizations/[id].get.ts
import { defineEventHandlerWithId } from '~~/server/wrappers/id'

export default defineEventHandlerWithId(async (event, id): Promise<Organization> => {
  const orgQuery = await event.context.$db
    .selectFrom('organizations')
    .selectAll()
    .where('id', '=', id)
    .executeTakeFirstOrThrow()

  return orgQuery
})
```

#### ✅ Passes the rule:

```typescript
// server/api/agreements/[id].get.ts
import { defineEventHandlerWithId } from '~~/server/wrappers/id'
import { jsonObjectFrom, jsonArrayFrom } from 'kysely/helpers/postgres'

export default defineEventHandlerWithId(async (event, id): Promise<Agreement> => {
  const db = event.context.$db

  const agreement = db
    .selectFrom('agreements')
    .select('programId')
    .where('agreements.id', '=', id)
    .executeTakeFirstOrThrow()

  // Authorization check is present ✓
  await authorize(event, readAgreement, agreement, event.context.$roleMap)

  const agreementWithFD = await db
    .selectFrom('agreements')
    .selectAll('agreements')
    // ... rest of the query
    .executeTakeFirstOrThrow()

  return agreementWithFD as Agreement
})
```

### Disabling the rule for specific endpoints

If you have a legitimate reason for an endpoint to be public (not require authorization), you can disable the rule with a comment:

```typescript
// eslint-disable-next-line local/require-authorize
export default defineEventHandler(async (event) => {
  // This is a public endpoint
  return { status: 'ok' }
})
```

**Important:** Only disable this rule if you're absolutely certain the endpoint should be public. Document why it's public in a comment.

---

## Rule 2: validate-authorize-params

This ESLint rule validates that `authorize()` calls have the correct parameters based on the ability being used. This catches parameter mismatches at lint time rather than at runtime or in tests.

**Dynamic Detection**: The rule automatically reads ability definitions from `shared/utils/abilities/**/*.ts` to determine parameter requirements. No manual configuration needed!

### Purpose

When calling `authorize()`, different abilities require different parameters. For example, `readAgreement` needs a `programId`, but `listAgreements` doesn't. This rule ensures you pass the correct parameters every time.

### What it checks

The rule validates:

1. First parameter is the `event` object
2. Second parameter is an ability identifier
3. Remaining parameters match the ability's signature
4. Last parameter is `event.context.$roleMap`

### Ability Parameter Requirements

#### Abilities Requiring `programId`

These abilities operate on program-specific resources:

- `createAgreement`
- `readAgreement`
- `updateAgreement`

**Expected signature:**

```typescript
await authorize(event, abilityName, programId, event.context.$roleMap)
```

#### Abilities Without `programId`

These abilities operate globally:

- `listAgreements`
- `listOrganizations`
- `createOrganizations`
- `readOrganizations`
- `updateOrganizations`

**Expected signature:**

```typescript
await authorize(event, abilityName, event.context.$roleMap)
```

### Examples

#### ✅ Correct Usage

```typescript
// Ability requiring programId
await authorize(event, readAgreement, agreement.programId, event.context.$roleMap)

// Ability without programId
await authorize(event, listAgreements, event.context.$roleMap)
```

#### ❌ Incorrect Usage

```typescript
// Missing programId for readAgreement
await authorize(event, readAgreement, event.context.$roleMap)
// Error: authorize(readAgreement) requires programId as the third parameter

// Extra programId for listAgreements
await authorize(event, listAgreements, programId, event.context.$roleMap)
// Error: authorize(listAgreements) does not take programId

// Missing roleMap
await authorize(event, readAgreement, programId)
// Error: Last parameter must be event.context.$roleMap
```

### Adding New Abilities

**No configuration needed!** The rule automatically detects new abilities.

When you add a new ability, just define it in `shared/utils/abilities/*.ts`:

```typescript
// Without programId
export const listResources = defineAbility((user: Session, roleAbilityMap?: RoleToAbilityMap | null) => {
  // ...
})

// With programId
export const readResource = defineAbility(
  (user: Session, programId: number, roleAbilityMap?: RoleToAbilityMap | null) => {
    // ...
  }
)
```

The ESLint rule will automatically:

- Detect the new ability
- Determine if it requires `programId` by analyzing the function signature
- Validate all `authorize()` calls that use it

---

## Running the Rules

The rules run automatically when you run ESLint:

````bash
# Check all files
npm run lint

---

## Running the Rules

The rules run automatically when you run ESLint:

```bash
# Check all files
npm run lint

# Check specific file
npx eslint server/api/organizations/[id].get.ts

# Check all API files
npx eslint 'server/api/**/*.ts'
````

## Disabling Rules

### Disable for a specific line

```typescript
// eslint-disable-next-line local/require-authorize
// eslint-disable-next-line local/validate-authorize-params
await authorize(event, customAbility, customParams)
```

### Disable for an entire file

```typescript
/* eslint-disable local/require-authorize */
/* eslint-disable local/validate-authorize-params */
```

## Benefits

1. **Security**: Prevents accidentally creating unsecured API endpoints
2. **Type Safety**: Catches parameter mismatches at development time
3. **Early Detection**: No need to wait for tests to catch errors
4. **Documentation**: Serves as inline documentation for correct usage
5. **Maintainability**: Makes refactoring safer and easier
6. **Consistency**: Enforces consistent patterns across the codebase

## Development

The rules are defined in:

- `/eslint-rules/require-authorize.js`
- `/eslint-rules/validate-authorize-params.js`

Configuration is in `eslint.config.mjs`.

## Additional Documentation

- [VALIDATE_AUTHORIZE_PARAMS.md](./VALIDATE_AUTHORIZE_PARAMS.md) - Detailed documentation for the validate-authorize-params rule
- [DYNAMIC_DETECTION.md](./DYNAMIC_DETECTION.md) - Technical details on how dynamic ability detection works
- [TESTING.md](./TESTING.md) - Testing guide for both rules
- [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) - Quick reference for ability signatures
- [SUMMARY.md](./SUMMARY.md) - Project summary and benefits
