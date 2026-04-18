'use client'

import { useNewsletterDialog } from '@/components/providers/AppProviders'

type Props = {
  className?: string
  hideWhenAuthenticated?: boolean
  isAuthenticated?: boolean
  interests?: string[]
  label: string
  returnTo?: string
  source: string
}

export function NewsletterDialogButton({
  className,
  hideWhenAuthenticated = true,
  isAuthenticated = false,
  interests = [],
  label,
  returnTo,
  source,
}: Props) {
  const { openDialog } = useNewsletterDialog()

  if (hideWhenAuthenticated && isAuthenticated) {
    return null
  }

  return (
    <button
      className={className}
      onClick={() =>
        openDialog({
          interests,
          returnTo:
            returnTo ||
            `${window.location.pathname}${window.location.search}${window.location.hash || ''}`,
          source,
        })
      }
      type="button"
    >
      {label}
    </button>
  )
}
