'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

import type { Section } from '@/payload-types'

import { getSectionTone, getSectionToneStyle } from '@/lib/relations'
import { siteConfig } from '@/lib/site'

import { HeaderAuthAction } from './HeaderAuthAction'
import { ThemeToggle } from './ThemeToggle'

type Props = {
  sections: Section[]
}

function MenuDotsIcon() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
      <circle cx="5" cy="12" fill="currentColor" r="1.9" />
      <circle cx="12" cy="12" fill="currentColor" r="1.9" />
      <circle cx="19" cy="12" fill="currentColor" r="1.9" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
      <path
        d="M6 6 18 18M18 6 6 18"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.8"
      />
    </svg>
  )
}

const DRAWER_ID = 'site-header-mobile-drawer'

export function HeaderMobileMenu({ sections }: Props) {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (!isOpen) {
      return
    }

    const previousOverflow = document.body.style.overflow

    document.body.style.overflow = 'hidden'

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  function handleToggle() {
    setIsOpen((current) => !current)
  }

  function handleClose() {
    setIsOpen(false)
  }

  return (
    <>
      <button
        aria-controls={DRAWER_ID}
        aria-expanded={isOpen}
        aria-label={isOpen ? 'Fechar menu' : 'Abrir menu'}
        className="site-header__mobile-trigger"
        onClick={handleToggle}
        type="button"
      >
        {isOpen ? <CloseIcon /> : <MenuDotsIcon />}
      </button>

      <button
        aria-hidden={!isOpen}
        aria-label="Fechar menu"
        className={`site-header__mobile-backdrop${isOpen ? ' is-open' : ''}`}
        onClick={handleClose}
        type="button"
      />

      <aside
        aria-hidden={!isOpen}
        aria-label="Menu principal"
        className={`site-header__mobile-drawer${isOpen ? ' is-open' : ''}`}
        id={DRAWER_ID}
        role="dialog"
      >
        <div className="site-header__mobile-drawer-header">
          <Link className="site-header__mobile-brand" href="/" onClick={handleClose}>
            <span className="site-header__brand-mark">NP</span>
            <span className="site-header__mobile-brand-copy">
              <strong>{siteConfig.name}</strong>
              <small>Navegacao</small>
            </span>
          </Link>

          <button
            aria-label="Fechar menu"
            className="site-header__mobile-close"
            onClick={handleClose}
            type="button"
          >
            <CloseIcon />
          </button>
        </div>

        <nav aria-label="Secoes principais" className="site-header__mobile-nav">
          {sections.map((section) => (
            <Link
              className="site-header__mobile-nav-link"
              data-tone={getSectionTone(section)}
              href={`/${section.slug}`}
              key={section.id}
              onClick={handleClose}
              style={getSectionToneStyle(section)}
            >
              {section.title}
            </Link>
          ))}
        </nav>

        <div className="site-header__mobile-actions">
          <Link className="site-header__mobile-link" href="/contato" onClick={handleClose}>
            Fale Conosco
          </Link>
          <Link className="site-header__mobile-link" href="/sobre" onClick={handleClose}>
            Sobre
          </Link>

          <div className="site-header__mobile-utility">
            <ThemeToggle />
            <HeaderAuthAction />
          </div>
        </div>
      </aside>
    </>
  )
}
