import crypto from 'node:crypto'

import { cookies } from 'next/headers'

import { getPayloadClient } from '@/lib/payload'
import type { NewsletterLead, NewsletterMember } from '@/payload-types'

export const NEWSLETTER_CONTEXT_COOKIE = 'nebulosa-newsletter-context'

export const validNewsletterInterests = ['filmes', 'series', 'animes', 'games'] as const

export type NewsletterInterest = (typeof validNewsletterInterests)[number]
export type NewsletterProvider = 'google' | 'local' | 'microsoft'
export type NewsletterContext = {
  interests: NewsletterInterest[]
  returnTo: string
  source: string
}

type UpsertNewsletterMemberArgs = {
  email: string
  interests?: NewsletterInterest[]
  name?: string | null
  password?: string
  provider: NewsletterProvider
  source?: string
}

function mergeUniqueStrings(values: Array<null | string | undefined>) {
  return [...new Set(values.map((value) => String(value || '').trim()).filter(Boolean))]
}

function mergeUniqueInterests(values: Array<NewsletterInterest | null | undefined>) {
  return [...new Set(values.filter(Boolean))] as NewsletterInterest[]
}

function parseRelativeURL(pathname: string) {
  try {
    return new URL(pathname, 'http://localhost:3000')
  } catch (_error) {
    return new URL('/', 'http://localhost:3000')
  }
}

export function buildStatusRedirect(pathname: string, param: 'contact' | 'newsletter', status: string, hash?: string) {
  const url = parseRelativeURL(pathname)
  url.searchParams.set(param, status)

  return `${url.pathname}${url.search}${hash ? `#${hash}` : ''}`
}

export function normalizeEmail(value: FormDataEntryValue | null) {
  return String(value || '')
    .trim()
    .toLowerCase()
}

export function normalizeOptionalText(value: FormDataEntryValue | null) {
  const normalized = String(value || '').trim()
  return normalized || null
}

export function normalizeRequiredText(value: FormDataEntryValue | null) {
  return String(value || '').trim()
}

export function normalizeNewsletterSource(value: FormDataEntryValue | null) {
  const normalized = String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')

  return normalized || 'homepage'
}

export function normalizeReturnTo(value: FormDataEntryValue | null) {
  const rawValue = String(value || '').trim()
  return rawValue.startsWith('/') ? rawValue : '/'
}

export function normalizeInterests(value: FormDataEntryValue | null) {
  const rawValue = String(value || '').trim()

  if (!rawValue) {
    return []
  }

  return rawValue
    .split(',')
    .map((item) => item.trim())
    .filter((item): item is NewsletterInterest =>
      validNewsletterInterests.includes(item as NewsletterInterest),
    )
}

export async function setNewsletterContextCookie(context: NewsletterContext) {
  const cookieStore = await cookies()
  const serializedValue = JSON.stringify(context)

  cookieStore.set(NEWSLETTER_CONTEXT_COOKIE, serializedValue, {
    httpOnly: true,
    maxAge: 60 * 10,
    path: '/',
    sameSite: 'lax',
  })
}

export async function getNewsletterContextCookie() {
  const cookieStore = await cookies()
  const cookieValue = cookieStore.get(NEWSLETTER_CONTEXT_COOKIE)?.value

  if (!cookieValue) {
    return null
  }

  try {
    const parsed = JSON.parse(cookieValue) as Partial<NewsletterContext>
    return {
      interests: Array.isArray(parsed.interests)
        ? parsed.interests.filter((item): item is NewsletterInterest =>
            validNewsletterInterests.includes(item as NewsletterInterest),
          )
        : [],
      returnTo:
        typeof parsed.returnTo === 'string' && parsed.returnTo.startsWith('/')
          ? parsed.returnTo
          : '/',
      source:
        typeof parsed.source === 'string' && parsed.source.trim()
          ? normalizeNewsletterSource(parsed.source)
          : 'homepage',
    } satisfies NewsletterContext
  } catch (_error) {
    return null
  }
}

export async function clearNewsletterContextCookie() {
  const cookieStore = await cookies()
  cookieStore.delete(NEWSLETTER_CONTEXT_COOKIE)
}

async function getLegacyNewsletterLead(email: string) {
  const payload = await getPayloadClient()
  const existingLead = await payload.find({
    collection: 'newsletter-leads',
    limit: 1,
    overrideAccess: true,
    where: {
      email: {
        equals: email,
      },
    },
  })

  return existingLead.docs[0] || null
}

function mergeLegacyLeadData(lead: NewsletterLead | null, interests: NewsletterInterest[], source?: string) {
  const mergedInterests = mergeUniqueInterests([
    ...interests,
    ...((lead?.interests || []) as NewsletterInterest[]),
  ])
  const mergedSources = mergeUniqueStrings([source, lead?.source || undefined])

  return {
    interests: mergedInterests,
    source: mergedSources,
    usedLegacyLead: Boolean(lead),
  }
}

export async function findNewsletterMemberByEmail(email: string) {
  const payload = await getPayloadClient()
  const existingMember = await payload.find({
    collection: 'newsletter-members',
    limit: 1,
    overrideAccess: true,
    where: {
      email: {
        equals: email,
      },
    },
  })

  return existingMember.docs[0] || null
}

export async function upsertNewsletterMember(args: UpsertNewsletterMemberArgs) {
  const payload = await getPayloadClient()
  const email = normalizeEmail(args.email)
  const source = args.source ? normalizeNewsletterSource(args.source) : undefined
  const interests = Array.isArray(args.interests) ? args.interests : []
  const existingMember = await findNewsletterMemberByEmail(email)
  const legacyLead = await getLegacyNewsletterLead(email)
  const merged = mergeLegacyLeadData(legacyLead, interests, source)

  if (existingMember) {
    const updatedMember = await payload.update({
      collection: 'newsletter-members',
      data: {
        interests: mergeUniqueInterests([
          ...merged.interests,
          ...((existingMember.interests || []) as NewsletterInterest[]),
        ]),
        lastLoginAt: new Date().toISOString(),
        name: args.name || existingMember.name,
        provider: args.provider,
        source: mergeUniqueStrings([
          ...merged.source,
          ...((existingMember.source || []) as string[]),
        ]),
        subscriptionStatus: 'active',
        ...(args.password ? { password: args.password } : {}),
      },
      id: existingMember.id,
      overrideAccess: true,
    })

    return {
      member: updatedMember as NewsletterMember,
      status: merged.usedLegacyLead ? 'updated' : 'success',
    } as const
  }

  const createdMember = await payload.create({
    collection: 'newsletter-members',
    data: {
      email,
      interests: merged.interests,
      lastLoginAt: new Date().toISOString(),
      name: args.name || undefined,
      password: args.password || crypto.randomUUID(),
      provider: args.provider,
      source: merged.source,
      subscriptionStatus: 'active',
    },
    overrideAccess: true,
  })

  return {
    member: createdMember as NewsletterMember,
    status: merged.usedLegacyLead ? 'updated' : 'success',
  } as const
}
