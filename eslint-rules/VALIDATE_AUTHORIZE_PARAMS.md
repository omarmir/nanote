# ESLint Rule: validate-authorize-params

## Overview

This ESLint rule validates that `authorize()` calls in server routes have the correct parameters based on the ability being used. This helps catch parameter mismatches at lint time rather than at runtime or in tests.

**Fully Dynamic Parameter Detection**: The rule automatically reads ability definitions from `shared/utils/abilities/**/*.ts` and extracts the complete parameter signature - including parameter names, types, and whether they're optional. It validates that `authorize()` calls provide the exact parameters in the correct order.

## Rule Details

The rule checks that:
1. The first parameter is always the `event` object
2. The second parameter is an ability identifier  
3. The remaining parameters (before roleMap) match the ability's signature exactly
4. The last parameter is `event.context.$roleMap`

**The rule works with ANY ability signature** - it dynamically extracts all parameters regardless of type or quantity.

## How Parameter Detection Works

The rule parses ability definitions and extracts the complete parameter list:

```typescript
// Example 1: Simple ability (no extra params)
export const listResources = defineAbility(
  (user: Session, roleAbilityMap?: RoleToAbilityMap | null) => { ... }
)
// Detected params: [] (none between user and roleMap)
// Expected authorize: authorize(event, listResources, event.context.$roleMap)

// Example 2: Ability with programId
export const readResource = defineAbility(
  (user: Session, programId: number, roleAbilityMap?: RoleToAbilityMap | null) => { ... }
)
// Detected params: [{ name: 'programId', type: 'number', optional: false }]
// Expected authorize: authorize(event, readResource, programId, event.context.$roleMap)

// Example 3: Ability with multiple params
export const complexOperation = defineAbility(
  (user: Session, programId: number, orgId: number, streamId?: number, roleAbilityMap?: RoleToAbilityMap | null) => { ... }
)
// Detected params: [
//   { name: 'programId', type: 'number', optional: false },
//   { name: 'orgId', type: 'number', optional: false },
//   { name: 'streamId', type: 'number', optional: true }
// ]
// Expected authorize: authorize(event, complexOperation, programId, orgId, streamId, event.context.$roleMap)

// Example 4: Ability with complex types
export const validateWithContext = defineAbility(
  (user: Session, context: { orgId: number; permissions: string[] }, roleAbilityMap?: RoleToAbilityMap | null) => { ... }
)
// Detected params: [{ name: 'context', type: '{ orgId: number; permissions: string[] }', optional: false }]
// Expected authorize: authorize(event, validateWithContext, context, event.context.$roleMap)
```

### Supported Type Patterns

The rule correctly handles:
- Primitive types: `number`, `string`, `boolean`
- Custom types: `ProgramId`, `Organization`
- Generic types: `Array<string>`, `Map<number, string>`
- Union types: `number | string`
- Object types: `{ id: number; name: string }`
- Nested generics: `Array<Map<string, number>>`
- Optional parameters: `param?: type` or `param: type = default`

## Examples

### ✅ Correct Usage

```typescript
// Simple ability (no extra params)
await authorize(event, listAgreements, event.context.$roleMap)

// Ability with programId
await authorize(event, readAgreement, agreement.programId, event.context.$roleMap)

// Ability with multiple params
await authorize(event, complexOperation, programId, orgId, streamId, event.context.$roleMap)

// Ability with complex types
const context = { orgId: 123, permissions: ['read', 'write'] }
await authorize(event, validateWithContext, context, event.context.$roleMap)
```

### ❌ Incorrect Usage

```typescript
// Missing parameter
await authorize(event, readAgreement, event.context.$roleMap)
// Error: authorize(readAgreement) expects 4 parameters but got 3
// Expected: authorize(event, readAgreement, programId, event.context.$roleMap)

// Extra parameter
await authorize(event, listAgreements, programId, event.context.$roleMap)
// Error: authorize(listAgreements) expects 3 parameters but got 4
// Expected: authorize(event, listAgreements, event.context.$roleMap)

// Missing roleMap
await authorize(event, readAgreement, programId)
// Error: Last parameter must be event.context.$roleMap (expected as parameter 4)

// Wrong order
await authorize(readAgreement, event, programId, event.context.$roleMap)
// Error: First parameter must be the event object
```

## Error Messages

The rule provides clear, actionable error messages:

- **wrongParamCount**: Shows expected vs actual parameter count with full signature
  - Example: `authorize(readAgreement) expects 4 parameters but got 3. Expected signature: authorize(event, readAgreement, programId, event.context.$roleMap)`

- **missingEvent**: First parameter must be the event object

- **missingAbility**: Second parameter must be an ability identifier

- **missingRoleMap**: Last parameter must be `event.context.$roleMap`
  - Example: `Last parameter must be event.context.$roleMap (expected as parameter 4)`

- **unknownAbility**: Ability not found in `shared/utils/abilities/**/*.ts`
  - Example: `Unknown ability "myAbility". Could not find ability definition in shared/utils/abilities/**/*.ts`

- **wrongParameterType**: Hints about expected parameter type (informational)

## Adding New Abilities

**No configuration needed!** The rule automatically detects abilities regardless of their parameter signature.

### Steps

1. **Define the ability** in `shared/utils/abilities/*.ts` with ANY parameter signature:

```typescript
// Any number of parameters, any types
export const myNewAbility = defineAbility(
  (user: Session, param1: Type1, param2: Type2, param3?: Type3, roleAbilityMap?: RoleToAbilityMap | null) => {
    // ... implementation
  }
)
```

2. **Use it in your API routes** - the ESLint rule will automatically validate:

```typescript
// The rule knows exactly what parameters myNewAbility expects
await authorize(event, myNewAbility, param1, param2, param3, event.context.$roleMap)
```

**That's it!** The rule:
- Automatically scans the abilities directory
- Extracts the full parameter signature
- Validates all `authorize()` calls that use it
- Provides clear error messages if parameters don't match

## Configuration

The rule is automatically enabled for all files in `server/api/**/*.ts` and `server/api/**/*.js`.

To disable the rule for a specific line:

```typescript
// eslint-disable-next-line local/validate-authorize-params
await authorize(event, customAbility, ...customParams)
```

To disable for an entire file:

```typescript
/* eslint-disable local/validate-authorize-params */
```

## Benefits

1. **Full Type Safety**: Catches parameter mismatches for ANY ability signature
2. **Zero Configuration**: Works with any parameter combination automatically
3. **Early Detection**: Catches errors at lint time, not runtime or in tests
4. **Clear Error Messages**: Shows exact expected signature
5. **Maintainability**: Refactor ability signatures safely - all usages are automatically validated
6. **Flexibility**: Supports simple to complex parameter patterns
7. **Documentation**: Error messages serve as inline documentation

## Technical Details

### Parameter Extraction Algorithm

1. Find workspace root by locating `package.json`
2. Scan `shared/utils/abilities/**/*.ts` files
3. For each file, extract ability definitions using regex: `export const abilityName = defineAbility\((.*?)\) =>`
4. Parse the callback parameters, handling:
   - Generic types with nested brackets
   - Object literal types  
   - Union types
   - Optional parameters
   - Default values
5. Remove first parameter (user/session) and last parameter (roleMap)
6. Store remaining parameters with name, type, and optional flag
7. Calculate total expected parameters for `authorize()`: `2 + middleParams.length + 1`

### Caching

Ability signatures are cached during a single ESLint run for performance, so files are only parsed once even when checking multiple server files.

## Related Rules

- `local/require-authorize`: Ensures all server routes have authorization checks
