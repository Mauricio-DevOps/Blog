import Link from 'next/link'

import type { Section } from '@/payload-types'

import { getSectionTone, getSectionToneStyle } from '@/lib/relations'
import { siteConfig } from '@/lib/site'

import { HeaderAuthAction } from './HeaderAuthAction'
import { ThemeToggle } from './ThemeToggle'

type Props = {
  sections: Section[]
}

export function Header({ sections }: Props) {
  return (
    <header className="site-header">
      <div className="shell site-header__inner">
        <Link className="site-header__brand" href="/">
          <span className="site-header__brand-mark">NP</span>
          <span className="site-header__brand-copy">
            <strong>{siteConfig.name}</strong>
            <small>{siteConfig.tagline}</small>
          </span>
        </Link>

        <nav aria-label="Secoes principais" className="site-header__nav">
          {sections.map((section) => (
            <Link
              className="site-header__nav-link"
              data-tone={getSectionTone(section)}
              style={getSectionToneStyle(section)}
              href={`/${section.slug}`}
              key={section.id}
            >
              {section.title}
            </Link>
          ))}
        </nav>

        <div className="site-header__actions">
          <Link className="site-header__ghost-link" href="/contato">
            Fale Conosco
          </Link>
          <Link className="site-header__ghost-link" href="/sobre">
            Sobre
          </Link>
          <ThemeToggle />
          <HeaderAuthAction />
        </div>
      </div>
    </header>
  )
}
