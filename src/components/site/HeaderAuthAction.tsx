'use client'

import { signOut, useSession } from 'next-auth/react'

import { NewsletterDialogButton } from '@/components/newsletter/NewsletterDialogButton'

export function HeaderAuthAction() {
  const { status } = useSession()

  if (status === 'loading') {
    return null
  }

  if (status === 'authenticated') {
    return (
      <button
        className="site-header__cta"
        onClick={() =>
          signOut({
            callbackUrl: '/',
          })
        }
        type="button"
      >
        Sair
      </button>
    )
  }

  return (
    <NewsletterDialogButton
      className="site-header__cta"
      interests={['filmes', 'series', 'animes', 'games']}
      label="Assinar"
      source="header"
    />
  )
}
