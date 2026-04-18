import NextAuth from 'next-auth'
import type { NextAuthConfig } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import Google from 'next-auth/providers/google'
import MicrosoftEntraID from 'next-auth/providers/microsoft-entra-id'

import {
  clearNewsletterContextCookie,
  findNewsletterMemberByEmail,
  getNewsletterContextCookie,
  normalizeEmail,
  upsertNewsletterMember,
} from '@/lib/newsletter'
import { getPayloadClient } from '@/lib/payload'
import type { NewsletterMember } from '@/payload-types'

const googleEnabled = Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET)
const microsoftEnabled = Boolean(
  process.env.AUTH_MICROSOFT_ENTRA_ID_ID && process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET,
)

function mapAccountProvider(provider?: string | null) {
  if (provider === 'google') {
    return 'google' as const
  }

  if (provider === 'microsoft-entra-id') {
    return 'microsoft' as const
  }

  return 'local' as const
}

async function authorizeCredentials(credentials: Partial<Record<'email' | 'password', unknown>>) {
  const email = normalizeEmail((credentials.email as string | undefined) || '')
  const password = String(credentials.password || '')

  if (!email || !password) {
    return null
  }

  const payload = await getPayloadClient()
  const result = await payload.login({
    collection: 'newsletter-members',
    data: {
      email,
      password,
    },
    overrideAccess: true,
  })

  const member = result.user as NewsletterMember | undefined

  if (!member) {
    return null
  }

  return {
    email: member.email,
    id: String(member.id),
    memberId: String(member.id),
    name: member.name || member.email,
    provider: 'local',
  }
}

const providers: NonNullable<NextAuthConfig['providers']> = [
  Credentials({
    credentials: {
      email: { label: 'E-mail', type: 'email' },
      password: { label: 'Senha', type: 'password' },
    },
    authorize: authorizeCredentials,
  }),
]

if (googleEnabled) {
  providers.push(
    Google({
      clientId: process.env.AUTH_GOOGLE_ID || '',
      clientSecret: process.env.AUTH_GOOGLE_SECRET || '',
    }),
  )
}

if (microsoftEnabled) {
  providers.push(
    MicrosoftEntraID({
      clientId: process.env.AUTH_MICROSOFT_ENTRA_ID_ID || '',
      clientSecret: process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET || '',
      issuer: process.env.AUTH_MICROSOFT_ENTRA_ID_ISSUER || undefined,
    }),
  )
}

export const newsletterAuthProviderAvailability = {
  google: googleEnabled,
  microsoft: microsoftEnabled,
} as const

export const { auth, handlers, signIn, signOut } = NextAuth({
  callbacks: {
    async jwt({ account, token, user }) {
      if (user) {
        token.memberId = String((user as { memberId?: string }).memberId || user.id || '')
        token.provider =
          (user as { provider?: string | null }).provider || mapAccountProvider(account?.provider)
      }

      if ((!token.memberId || !token.provider) && token.email) {
        const member = await findNewsletterMemberByEmail(normalizeEmail(token.email))

        if (member) {
          token.memberId = String(member.id)
          token.provider = member.provider
        }
      }

      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = String(token.memberId || token.sub || '')
        session.user.memberId = String(token.memberId || token.sub || '')
        session.user.provider =
          typeof token.provider === 'string' ? token.provider : session.user.provider || null
      }

      return session
    },
    async signIn({ account, profile, user }) {
      const provider = mapAccountProvider(account?.provider)

      if (provider === 'local') {
        await clearNewsletterContextCookie()
        return true
      }

      const context = await getNewsletterContextCookie()
      const email = normalizeEmail(
        typeof user.email === 'string'
          ? user.email
          : typeof profile?.email === 'string'
            ? profile.email
            : typeof profile?.preferred_username === 'string'
              ? profile.preferred_username
              : '',
      )

      if (!email) {
        await clearNewsletterContextCookie()
        return false
      }

      const result = await upsertNewsletterMember({
        email,
        interests: context?.interests || [],
        name:
          typeof user.name === 'string'
            ? user.name
            : typeof profile?.name === 'string'
              ? profile.name
              : null,
        provider,
        source: context?.source || provider,
      })

      ;(user as { id?: string; memberId?: string; provider?: string }).id = String(result.member.id)
      ;(user as { id?: string; memberId?: string; provider?: string }).memberId = String(
        result.member.id,
      )
      ;(user as { id?: string; memberId?: string; provider?: string }).provider = provider

      await clearNewsletterContextCookie()

      return true
    },
  },
  providers,
  secret:
    process.env.AUTH_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    process.env.PAYLOAD_SECRET ||
    'troque-esta-chave-auth-em-desenvolvimento',
  session: {
    strategy: 'jwt',
  },
  trustHost: true,
})
