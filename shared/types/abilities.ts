import type * as abilitiesModule from '#shared/utils/abilities'

// Get the actual function names at the type level
export type AbilityName = Exclude<keyof typeof abilitiesModule, symbol | number>
