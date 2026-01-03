# API Authorization ESLint Rules - Summary

## What Was Implemented

Two custom ESLint rules that enforce authorization security and type safety in API endpoints:

1. **require-authorize** - Ensures all API endpoints have authorization checks
2. **validate-authorize-params** - Validates that `authorize()` calls have correct parameters based on the ability

## Files Created/Modified

### Created Files:

1. `/eslint-rules/require-authorize.js` - Rule to enforce authorization checks
2. `/eslint-rules/validate-authorize-params.js` - Rule to validate authorize parameters
3. `/eslint-rules/README.md` - Comprehensive documentation for both rules
4. `/eslint-rules/VALIDATE_AUTHORIZE_PARAMS.md` - Detailed documentation for parameter validation
5. `/eslint-rules/QUICK_REFERENCE.md` - Quick reference guide with examples
6. `/eslint-rules/TESTING.md` - Testing instructions and test cases

### Modified Files:

1. `/eslint.config.mjs` - Updated to include both custom rules

## How They Work

### Rule 1: require-authorize

The rule scans all TypeScript files in `server/api/` and checks if they:

1. Use `defineEventHandler`, `defineEventHandlerWithDB`, or `defineEventHandlerWithId`
2. Contain a call to `authorize()` somewhere in the handler function

If a handler is found without an `authorize()` call, the rule reports an error.

### Rule 2: validate-authorize-params

The rule validates every `authorize()` call to ensure:

1. First parameter is the `event` object
2. Second parameter is a known ability identifier
3. If the ability requires `programId` (detected dynamically from ability definition), it must be the third parameter
4. Last parameter is `event.context.$roleMap`

**Dynamic ability detection**: The rule automatically scans `shared/utils/abilities/**/*.ts` files and analyzes each ability's function signature to determine if it requires `programId`. This means:

- No manual configuration needed when adding new abilities
- Changes to ability signatures are automatically detected
- The rule always stays in sync with your ability definitions

**How it detects:**

- `defineAbility((user, roleMap) => ...)` → No programId needed (3 params for authorize)
- `defineAbility((user, programId, roleMap) => ...)` → Requires programId (4 params for authorize)

**Example abilities (auto-detected):**

- Without programId: `listAgreements`, `listOrganizations`, `createOrganizations`, `readOrganizations`, `updateOrganizations`
- With programId: `createAgreement`, `readAgreement`, `updateAgreement`

## Automatic Exclusions

The following paths are automatically excluded from both rules:

- `server/wrappers/**` - Wrapper utility functions that define handlers (don't need `authorize()`)
- `server/api/[...].ts` - Catch-all error handler
- `server/api/auth/**` - Authentication endpoints

**Important**: The wrappers like `defineEventHandlerWithId` and `defineEventHandlerWithDB` are excluded because they are utility functions that return handlers. Only the actual API endpoint files that _use_ these wrappers need to call `authorize()`.

## Benefits

1. **Security**: Prevents accidentally creating unsecured API endpoints
2. **Type Safety**: Catches parameter mismatches at development time instead of runtime
3. **Early Detection**: No need to wait for tests to catch authorization errors
4. **Documentation**: Serves as inline documentation for correct `authorize()` usage
5. **Maintainability**: Makes refactoring abilities safer and easier
6. **Consistency**: Enforces consistent patterns across the codebase
7. **Developer Experience**: Clear error messages guide developers to the correct usage

## Usage

### Running the Rules

```bash
# Check all API files
npx eslint 'server/api/**/*.ts'

# Check specific file
npx eslint server/api/agreements/[id].get.ts

# Run full project lint
npm run lint
```

### Example: Fixing require-authorize Violations

To fix a violation, add an authorization check to your handler:

```typescript
import { readAgreement } from '#shared/utils/abilities'

export default defineEventHandlerWithId(async (event, id): Promise<Agreement> => {
  // Fetch the resource to get programId
  const { programId } = await event.context.$db
    .selectFrom('agreements')
    .select('programId')
    .where('id', '=', id)
    .executeTakeFirstOrThrow()

  // ✅ Add authorization check
  await authorize(event, readAgreement, programId, event.context.$roleMap)

  // Continue with the rest of your handler
  // ...
})
```

### Example: Fixing validate-authorize-params Violations

Ensure correct parameters based on ability type:

```typescript
// ❌ Before (incorrect - missing programId)
await authorize(event, readAgreement, event.context.$roleMap)

// ✅ After (correct - includes programId)
await authorize(event, readAgreement, agreement.programId, event.context.$roleMap)

// ❌ Before (incorrect - extra programId)
await authorize(event, listAgreements, programId, event.context.$roleMap)

// ✅ After (correct - no programId needed)
await authorize(event, listAgreements, event.context.$roleMap)
```

### For Public Endpoints

If an endpoint should truly be public (no authorization required), disable the rule with a comment:

```typescript
// eslint-disable-next-line local/require-authorize
export default defineEventHandler(async (event) => {
  // This is a public health check endpoint
  return { status: 'ok' }
})
```

## Maintenance

### Adding New Abilities

**No manual configuration needed!** The `validate-authorize-params` rule automatically detects abilities.

When you create a new ability:

1. **Define the ability** in `shared/utils/abilities/*.ts`:

   ```typescript
   export const myAbility = defineAbility((user, programId?, roleMap) => { ... })
   ```

2. **That's it!** The ESLint rule will:

   - Automatically detect the new ability
   - Analyze its parameter signature
   - Validate all `authorize()` calls that use it

3. **Test** with `npx eslint 'server/api/**/*.ts'`

No need to update ESLint configuration files!

### Modifying Ability Signatures

If you change an ability's parameters:

1. **Update ability definition** in `shared/utils/abilities/*.ts`
2. **Run ESLint** to find all usages: `npx eslint 'server/api/**/*.ts'`
   - The rule automatically detects the new signature
   - All incorrect usages will be flagged
3. **Fix all violations** shown by ESLint
4. **Verify** tests still pass

## Integration

### VS Code

The rules work automatically in VS Code:

- Errors appear in the Problems panel
- Red squiggly underlines show violations
- Hover for error messages

### CI/CD Pipeline

Add to your pipeline:

```yaml
- name: Lint
  run: npm run lint
```

This ensures no code with authorization issues can be merged.

## Example Test Results

### ✅ Passing (correct usage):

```bash
$ npx eslint server/api/agreements/[id].get.ts
# No errors
```

### ❌ Failing (missing authorize):

```bash
$ npx eslint server/api/organizations/[id].get.ts

server/api/organizations/[id].get.ts
  6:16  error  API route handler must call authorize() to secure the endpoint...

✖ 1 problem (1 error, 0 warnings)
```

## Maintenance

The rule is self-contained and requires minimal maintenance. To modify:

1. **Change excluded paths** - Edit the `skipPatterns` array in `eslint-rules/require-authorize.js`
2. **Add new handler types** - Add to the array in the `isEventHandler` check
3. **Modify error message** - Update the `messages` object in the rule's meta

## Integration with Existing Code

This rule integrates seamlessly with your existing:

- `nuxt-authorization` package
- Custom event handler wrappers (`defineEventHandlerWithDB`, `defineEventHandlerWithId`)
- Ability definitions in `shared/utils/abilities/`

No changes to existing code are required to use the rule - it works with your current authorization pattern.
