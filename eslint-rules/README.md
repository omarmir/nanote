# Custom ESLint Authorization Rules

This directory contains custom ESLint rules designed to enforce security and type-safety practices for the application's authorization system.

## Rules Summary

| Rule                              | Description                                                          | Type                   |
| --------------------------------- | -------------------------------------------------------------------- | ---------------------- |
| `local/require-authorize`         | Ensures API handlers include an authorization check.                 | Security               |
| `local/validate-authorize-params` | Validates that `authorize()` arguments match the ability definition. | Type Safety / Security |

---

## 1. `require-authorize`

**File:** [`require-authorize.js`](./require-authorize.js)

### Purpose

To prevent the accidental exposure of API endpoints. This rule requires that every API route handler (specifically in `server/api/`) calls the `authorize()` function at least once.

### Logic

The rule checks any file in `server/api/` that exports a handler using:

- `defineEventHandler`
- `defineEventHandlerWithDB`
- `defineEventHandlerWithId`

### Exceptions

The rule automatically skips:

- Files in `server/api/auth/` (Login/Registration endpoints)
- Wrapper functions in `server/wrappers/`
- Catch-all routes (`[...].ts`)
- Handlers using `NuxtAuthHandler`

### Usage

#### ✅ Correct Usage

```javascript
export default defineEventHandler(async event => {
  // Verification is present
  await authorize(event, 'read_dashboard')

  return { success: true }
})
```

#### ❌ Incorrect Usage

```javascript
export default defineEventHandler(async event => {
  // Error: API route handler must call authorize() to secure the endpoint.
  return fetchSensitiveData()
})
```

#### Public Endpoints (Exempting the Rule)

If an endpoint is intentionally public (e.g., a webhook or public data), you must explicitly disable the rule for that file or line to acknowledge the security decision:

```javascript
// eslint-disable-next-line local/require-authorize
export default defineEventHandler(async event => {
  return { publicData: true }
})
```

---

## 2. `validate-authorize-params`

**File:** [`validate-authorize-params.js`](./validate-authorize-params.js)

### Purpose

To ensure that calls to `authorize()` are consistent with the ability definitions found in `shared/utils/abilities/`. Since `authorize()` is a wrapper around the ability check, passing incorrect arguments can lead to false negatives or runtime errors.

### Mechanism

The rule performs static analysis by:

1. Dynamically scanning `shared/utils/abilities/*.ts` for `defineAbility` blocks.
2. Parsing the parameter signature of each ability.
3. Verifying that `authorize()` calls in your API handlers match these signatures.

**Note:** The `authorize` function automatically injects the `user` session as the first argument to the ability callback. Therefore, your `authorize()` call in the API handler should **pass the Event object first**, followed by the remaining arguments expected by the ability.

### Example

**Ability Definition:**

```typescript
// defined in shared/utils/abilities/posts.ts
export const editPost = defineAbility((user, postId: number, isDraft: boolean) => {
  return user.id === postId || isDraft
})
```

**Expected Authorize Call:**
`authorize(event, 'editPost', postId, isDraft)`

### Usage

#### ✅ Correct Usage

```javascript
// Matches signature: event + ability + postId + isDraft
await authorize(event, 'editPost', 123, true)
```

#### ❌ Incorrect Usage

**Missing Event:**

```javascript
// Error: First parameter of authorize() must be the event object
await authorize('editPost', 123, true)
```

**Wrong Parameter Count:**

```javascript
// Error: authorize(editPost) expects 4 parameters but got 3.
// Expected signature: authorize(event, editPost, postId, isDraft)
await authorize(event, 'editPost', 123)
```

**Unknown Ability:**

```javascript
// Error: Unknown ability "deleteWorld".
await authorize(event, 'deleteWorld')
```

## Configuration

To enable these rules, add them to your `.eslintrc.js` (or `package.json` config):

```javascript
rules: {
  'local/require-authorize': 'error',
  'local/validate-authorize-params': 'error'
}
```
