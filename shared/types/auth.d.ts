// shared/types/auth.d.ts
declare module '#auth-utils' {
  interface User {
    role: 'root' | 'shared'
  }

  interface UserSession {
    user: User
    shareKey?: string
    loggedInAt: Date
  }
}

export {}
