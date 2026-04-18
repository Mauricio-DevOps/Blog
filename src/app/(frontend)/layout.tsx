import type { Metadata } from 'next'
import { Source_Serif_4, Space_Grotesk } from 'next/font/google'
import React from 'react'

import { newsletterAuthProviderAvailability } from '@/auth'
import { AppProviders } from '@/components/providers/AppProviders'
import { Footer } from '@/components/site/Footer'
import { Header } from '@/components/site/Header'
import { getNavigationSections } from '@/lib/queries'
import { getSiteURL, siteConfig } from '@/lib/site'
import { siteThemeInitScript } from '@/lib/theme'

import { authenticateNewsletterMember, startNewsletterOAuth } from './actions'
import './styles.css'

const displayFont = Space_Grotesk({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-display',
})

const bodyFont = Source_Serif_4({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-body',
})

export const metadata: Metadata = {
  description: siteConfig.description,
  metadataBase: new URL(getSiteURL()),
  openGraph: {
    description: siteConfig.description,
    locale: 'pt_BR',
    siteName: siteConfig.name,
    title: siteConfig.name,
    type: 'website',
  },
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props
  const sections = await getNavigationSections()

  return (
    <html
      className={`${displayFont.variable} ${bodyFont.variable}`}
      data-theme="dark"
      lang="pt-BR"
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: siteThemeInitScript }} />
      </head>
      <body>
        <AppProviders
          authenticateAction={authenticateNewsletterMember}
          oauthAction={startNewsletterOAuth}
          providerAvailability={newsletterAuthProviderAvailability}
        >
          <div className="site-shell">
            <Header sections={sections} />
            <main>{children}</main>
            <Footer sections={sections} />
          </div>
        </AppProviders>
      </body>
    </html>
  )
}
