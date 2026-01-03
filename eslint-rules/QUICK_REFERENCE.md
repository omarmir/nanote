# Quick Reference: Authorization ESLint Rules

## ⚡ Quick Commands

```bash
# Check all API files
npx eslint 'server/api/**/*.ts'

# Check specific file
npx eslint server/api/your-file.ts

# Run with full project lint
npm run lint
```

---

## Rule 1: require-authorize

Ensures all API endpoints have authorization checks.

### ✅ Passing Example

```typescript
import { defineEventHandlerWithId } from '~~/server/wrappers/id'

export default defineEventHandlerWithId(async (event, id) => {
  const resource = await event.context.$db
    .selectFrom('table')
    .select('programId')
    .where('id', '=', id)
    .executeTakeFirstOrThrow()

  // ✅ Authorization check present
  await authorize(event, readResource, resource.programId, event.context.$roleMap)

  return resource
})
```

### ❌ Failing Example

```typescript
import { defineEventHandlerWithId } from '~~/server/wrappers/id'

export default defineEventHandlerWithId(async (event, id) => {
  // ❌ No authorization check - will trigger error
  return await event.context.$db.selectFrom('table').selectAll().where('id', '=', id).executeTakeFirstOrThrow()
})
```

### 🔓 Public Endpoint Exception

```typescript
// eslint-disable-next-line local/require-authorize
export default defineEventHandler(async (event) => {
  // This is a public endpoint - no auth required
  return { status: 'healthy' }
})
```

---

## Rule 2: validate-authorize-params

Validates that `authorize()` calls have correct parameters.

## 📋 Ability Signatures Cheat Sheet

### Abilities WITH programId (4 parameters)

```typescript
// createAgreement, readAgreement, updateAgreement
await authorize(event, readAgreement, programId, event.context.$roleMap)
```

### Abilities WITHOUT programId (3 parameters)

```typescript
// listAgreements, listOrganizations, createOrganizations,
// readOrganizations, updateOrganizations
await authorize(event, listAgreements, event.context.$roleMap)
```

## ✅ Correct Examples

```typescript
// With programId
await authorize(event, readAgreement, agreement.programId, event.context.$roleMap)
await authorize(event, updateAgreement, programId, event.context.$roleMap)

// Without programId
await authorize(event, listAgreements, event.context.$roleMap)
await authorize(event, listOrganizations, event.context.$roleMap)
```

## ❌ Common Mistakes

```typescript
// ❌ Missing programId
await authorize(event, readAgreement, event.context.$roleMap)
// Error: authorize(readAgreement) requires programId as third parameter

// ❌ Extra programId
await authorize(event, listAgreements, programId, event.context.$roleMap)
// Error: authorize(listAgreements) does not take programId

// ❌ Missing roleMap
await authorize(event, readAgreement, programId)
// Error: Last parameter must be event.context.$roleMap

// ❌ Wrong order
await authorize(readAgreement, event, programId, event.context.$roleMap)
// Error: First parameter must be the event object
```

## 🆕 Adding New Abilities

**No manual configuration needed!** The rule automatically detects abilities.

Just define your ability in `shared/utils/abilities/*.ts`:

```typescript
// Without programId:
export const myNewAbility = defineAbility((user: Session, roleAbilityMap?: RoleToAbilityMap | null) => {
  // ...
})
// Usage: authorize(event, myNewAbility, event.context.$roleMap)

// With programId:
export const myProgramAbility = defineAbility(
  (user: Session, programId: number, roleAbilityMap?: RoleToAbilityMap | null) => {
    // ...
  }
)
// Usage: authorize(event, myProgramAbility, programId, event.context.$roleMap)
```

The ESLint rule automatically:

- Scans `shared/utils/abilities/**/*.ts`
- Detects ability signatures
- Validates correct usage

---

## 🚫 Auto-Excluded Paths

These paths are automatically excluded from both rules:

- `server/wrappers/**` - Wrapper utilities (don't need authorize)
- `server/api/[...].ts` - Catch-all error handler
- `server/api/auth/**` - Authentication endpoints

## 🔧 Configuration

The rules are configured in `eslint.config.mjs`:

```javascript
import requireAuthorize from './eslint-rules/require-authorize.js'
import validateAuthorizeParams from './eslint-rules/validate-authorize-params.js'

// ... in config
.append({
  files: ['server/api/**/*.ts', 'server/api/**/*.js'],
  plugins: {
    'local': {
      rules: {
        'require-authorize': requireAuthorize,
        'validate-authorize-params': validateAuthorizeParams
      }
    }
  },
  rules: {
    'local/require-authorize': 'error',
    'local/validate-authorize-params': 'error'
  }
})
```

## 📚 Full Documentation

See `/eslint-rules/README.md` for complete documentation.
