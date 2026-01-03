// shared/types/auth.d.ts
declare module '#auth-utils' {
  interface User {
    role: 'root' | 'shared'
  }

  interface UserSession {
    shareKey: string
    role: 'root' | 'shared'
  }
}

export {}
