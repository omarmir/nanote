// shared/types/auth.d.ts
declare module '#auth-utils' {
  interface User {
    role: 'root' | 'shared'
  }

  interface UserSession {
    secure?: {
      share?: { key: string; apiPath: string }
    }
    loggedInAt: Date
  }
}

export {}
