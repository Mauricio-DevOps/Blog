import type { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: DefaultSession['user'] & {
      id: string
      memberId: string
      provider?: null | string
    }
  }

  interface User {
    memberId?: string
    provider?: null | string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    memberId?: string
    provider?: null | string
  }
}
