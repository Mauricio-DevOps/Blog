'use client'

import { useSession } from 'next-auth/react'

import { NewsletterDialogButton } from '@/components/newsletter/NewsletterDialogButton'

type Props = {
  compact?: boolean
  description: string
  heading: string
  interests?: string[]
  returnTo: string
  source: string
  status?: string
  submitLabel?: string
}

export function NewsletterSignup({
  compact = false,
  description,
  heading,
  interests = [],
  returnTo,
  source,
  status,
  submitLabel = 'Quero me manter atualizado',
}: Props) {
  const { status: sessionStatus } = useSession()

  if (sessionStatus !== 'unauthenticated') {
    return null
  }

  const message =
    status === 'success'
      ? 'Seu acesso a newsletter foi confirmado com sucesso.'
      : status === 'updated'
        ? 'Seus interesses de newsletter foram atualizados.'
        : status === 'error'
          ? 'Nao foi possivel concluir agora. Tente novamente.'
          : null

  return (
    <section className={`newsletter-signup${compact ? ' newsletter-signup--compact' : ''}`} id="newsletter">
      <div>
        <span className="eyebrow">Newsletter</span>
        <h2>{heading}</h2>
        <p>{description}</p>
      </div>
      <div className="newsletter-signup__actions">
        <NewsletterDialogButton
          className="button button--solid newsletter-signup__button"
          interests={interests}
          label={submitLabel}
          returnTo={returnTo}
          source={source}
        />
      </div>
      {message ? <p className="newsletter-signup__message">{message}</p> : null}
    </section>
  )
}
