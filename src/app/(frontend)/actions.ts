'use server'

import { AuthError } from 'next-auth'
import { redirect } from 'next/navigation'

import { newsletterAuthProviderAvailability, signIn } from '@/auth'
import {
  buildStatusRedirect,
  findNewsletterMemberByEmail,
  normalizeEmail,
  normalizeInterests,
  normalizeNewsletterSource,
  normalizeOptionalText,
  normalizeRequiredText,
  normalizeReturnTo,
  setNewsletterContextCookie,
  upsertNewsletterMember,
} from '@/lib/newsletter'
import { getPayloadClient } from '@/lib/payload'
import { siteConfig } from '@/lib/site'

export type NewsletterAuthActionState = {
  error: null | string
  redirectTo?: string
  success: boolean
}

type ContactSubject = 'geral' | 'outro' | 'parceria' | 'patrocinio' | 'pauta' | 'sugestao'

const initialNewsletterState: NewsletterAuthActionState = {
  error: null,
  success: false,
}

const contactSubjects: Record<ContactSubject, string> = {
  geral: 'Geral',
  outro: 'Outro',
  parceria: 'Parceria',
  patrocinio: 'Patrocinio',
  pauta: 'Pauta',
  sugestao: 'Sugestao',
}

const validContactSubjects = Object.keys(contactSubjects) as ContactSubject[]

function escapeHTML(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function normalizeContactSubject(value: FormDataEntryValue | null) {
  const normalized = normalizeNewsletterSource(value)
  return validContactSubjects.includes(normalized as ContactSubject)
    ? (normalized as ContactSubject)
    : 'geral'
}

function buildContactRedirect(status: 'error' | 'success', subject?: string, origin?: string) {
  const url = new URL('/contato', 'http://localhost:3000')

  if (subject) {
    url.searchParams.set('subject', subject)
  }

  if (origin) {
    url.searchParams.set('origin', origin)
  }

  url.searchParams.set('contact', status)

  return `${url.pathname}${url.search}#fale-conosco`
}

export async function authenticateNewsletterMember(
  _previousState: NewsletterAuthActionState = initialNewsletterState,
  formData: FormData,
): Promise<NewsletterAuthActionState> {
  const mode = normalizeRequiredText(formData.get('mode')) === 'signup' ? 'signup' : 'login'
  const email = normalizeEmail(formData.get('email'))
  const name = normalizeOptionalText(formData.get('name'))
  const password = String(formData.get('password') || '').trim()
  const interests = normalizeInterests(formData.get('interests'))
  const returnTo = normalizeReturnTo(formData.get('returnTo'))
  const source = normalizeNewsletterSource(formData.get('source'))

  if (!email || !password || (mode === 'signup' && !name)) {
    return {
      error: 'Preencha os campos obrigatorios antes de continuar.',
      success: false,
    }
  }

  const payload = await getPayloadClient()

  try {
    if (mode === 'login') {
      const loginResult = await payload.login({
        collection: 'newsletter-members',
        data: {
          email,
          password,
        },
        overrideAccess: true,
      })

      if (!loginResult.user) {
        return {
          error: 'E-mail ou senha invalidos.',
          success: false,
        }
      }
    } else {
      const existingMember = await findNewsletterMemberByEmail(email)

      if (existingMember) {
        return {
          error: 'Ja existe uma conta para este e-mail. Use a aba Entrar.',
          success: false,
        }
      }
    }

    const result = await upsertNewsletterMember({
      email,
      interests,
      name,
      password: mode === 'signup' ? password : undefined,
      provider: 'local',
      source,
    })
    const redirectTo = buildStatusRedirect(returnTo, 'newsletter', result.status, 'newsletter')
    const signInResult = await signIn('credentials', {
      email,
      password,
      redirect: false,
      redirectTo,
    })

    return {
      error: null,
      redirectTo: typeof signInResult === 'string' ? signInResult : redirectTo,
      success: true,
    }
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        error: 'Nao foi possivel autenticar sua conta agora. Tente novamente.',
        success: false,
      }
    }

    return {
      error: 'Nao foi possivel concluir sua inscricao agora. Tente novamente.',
      success: false,
    }
  }
}

export async function startNewsletterOAuth(formData: FormData) {
  const requestedProvider = normalizeRequiredText(formData.get('provider'))
  const returnTo = normalizeReturnTo(formData.get('returnTo'))
  const source = normalizeNewsletterSource(formData.get('source'))
  const interests = normalizeInterests(formData.get('interests'))
  const provider =
    requestedProvider === 'google'
      ? 'google'
      : requestedProvider === 'microsoft'
        ? 'microsoft'
        : null

  if (!provider) {
    redirect(buildStatusRedirect(returnTo, 'newsletter', 'error', 'newsletter'))
  }

  if (
    (provider === 'google' && !newsletterAuthProviderAvailability.google) ||
    (provider === 'microsoft' && !newsletterAuthProviderAvailability.microsoft)
  ) {
    redirect(buildStatusRedirect(returnTo, 'newsletter', 'error', 'newsletter'))
  }

  await setNewsletterContextCookie({
    interests,
    returnTo,
    source,
  })

  await signIn(provider === 'google' ? 'google' : 'microsoft-entra-id', {
    redirectTo: buildStatusRedirect(returnTo, 'newsletter', 'success', 'newsletter'),
  })
}

export async function submitContactMessage(formData: FormData) {
  const payload = await getPayloadClient()
  const email = normalizeEmail(formData.get('email'))
  const message = normalizeRequiredText(formData.get('message'))
  const name = normalizeRequiredText(formData.get('name'))
  const origin = normalizeOptionalText(formData.get('origin'))
  const phone = normalizeOptionalText(formData.get('phone'))
  const subject = normalizeContactSubject(formData.get('subject'))

  if (!email || !message || !name) {
    redirect(buildContactRedirect('error', subject, origin || undefined))
  }

  try {
    await payload.create({
      collection: 'contact-messages',
      data: {
        email,
        message,
        name,
        origin,
        phone,
        status: 'new',
        subject,
      },
      overrideAccess: true,
    })

    try {
      await payload.sendEmail({
        html: `
          <p>Voce recebeu uma nova mensagem do Fale Conosco.</p>
          <p><strong>Nome:</strong> ${escapeHTML(name)}</p>
          <p><strong>E-mail:</strong> ${escapeHTML(email)}</p>
          <p><strong>Telefone:</strong> ${escapeHTML(phone || 'Nao informado')}</p>
          <p><strong>Assunto:</strong> ${escapeHTML(contactSubjects[subject] || 'Geral')}</p>
          <p><strong>Origem:</strong> ${escapeHTML(origin || 'Direto')}</p>
          <p><strong>Mensagem:</strong></p>
          <p>${escapeHTML(message).replace(/\n/g, '<br />')}</p>
        `,
        subject: `[${siteConfig.name}] Novo contato - ${contactSubjects[subject] || 'Geral'}`,
        text: [
          'Voce recebeu uma nova mensagem do Fale Conosco.',
          `Nome: ${name}`,
          `E-mail: ${email}`,
          `Telefone: ${phone || 'Nao informado'}`,
          `Assunto: ${contactSubjects[subject] || 'Geral'}`,
          `Origem: ${origin || 'Direto'}`,
          '',
          message,
        ].join('\n'),
        to: process.env.CONTACT_NOTIFICATION_EMAIL || siteConfig.contactEmail,
      })
    } catch (emailError) {
      console.error('Falha ao enviar notificacao de contato', emailError)
    }

    redirect(buildContactRedirect('success'))
  } catch (_error) {
    redirect(buildContactRedirect('error', subject, origin || undefined))
  }
}
