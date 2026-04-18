'use client'

import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { SessionProvider } from 'next-auth/react'

import type { NewsletterAuthActionState } from '@/app/(frontend)/actions'
import { NewsletterDialog } from '@/components/newsletter/NewsletterDialog'

type NewsletterDialogContextValue = {
  openDialog: (context: NewsletterDialogPayload) => void
}

type NewsletterDialogPayload = {
  interests: string[]
  returnTo: string
  source: string
}

type Props = {
  authenticateAction: (
    state: NewsletterAuthActionState | undefined,
    formData: FormData,
  ) => Promise<NewsletterAuthActionState>
  children: ReactNode
  oauthAction: (formData: FormData) => Promise<void>
  providerAvailability: {
    google: boolean
    microsoft: boolean
  }
}

const NewsletterDialogContext = createContext<NewsletterDialogContextValue | null>(null)

export function AppProviders({
  authenticateAction,
  children,
  oauthAction,
  providerAvailability,
}: Props) {
  const [dialogContext, setDialogContext] = useState<NewsletterDialogPayload>({
    interests: [],
    returnTo: '/',
    source: 'homepage',
  })
  const [dialogKey, setDialogKey] = useState(0)
  const [isOpen, setIsOpen] = useState(false)

  const value = useMemo<NewsletterDialogContextValue>(
    () => ({
      openDialog: (context) => {
        setDialogContext(context)
        setDialogKey((currentValue) => currentValue + 1)
        setIsOpen(true)
      },
    }),
    [],
  )

  return (
    <SessionProvider>
      <NewsletterDialogContext.Provider value={value}>
        {children}
        <NewsletterDialog
          authenticateAction={authenticateAction}
          context={dialogContext}
          dialogKey={dialogKey}
          isOpen={isOpen}
          oauthAction={oauthAction}
          onClose={() => setIsOpen(false)}
          providerAvailability={providerAvailability}
        />
      </NewsletterDialogContext.Provider>
    </SessionProvider>
  )
}

export function useNewsletterDialog() {
  const context = useContext(NewsletterDialogContext)

  if (!context) {
    throw new Error('useNewsletterDialog must be used within AppProviders.')
  }

  return context
}
