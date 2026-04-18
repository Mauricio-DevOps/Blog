'use client'

import Link from 'next/link'
import type { CSSProperties } from 'react'
import { startTransition, useState } from 'react'

import { MediaFigure } from '@/components/MediaFigure'

export type EditorialShowcaseItem = {
  description: string
  href: string
  id: string
  imageAlt: string
  imageUrl: null | string
  publishedLabel: string
  sectionLabel: string
  sectionSlug: string
  title: string
  tone: string
  style?: CSSProperties
  typeLabel: string
  typeSlug: string
}

export type EditorialShowcaseSection = {
  label: string
  slug: string
}

export type EditorialShowcaseType = {
  description: string
  label: string
  slug: string
}

type Props = {
  items: EditorialShowcaseItem[]
  sections: EditorialShowcaseSection[]
  types: EditorialShowcaseType[]
}

export function EditorialShowcase({ items, sections, types }: Props) {
  const [activeTypeSlug, setActiveTypeSlug] = useState(types[0]?.slug || '')
  const [activeSectionSlug, setActiveSectionSlug] = useState('all')

  const activeType = types.find((type) => type.slug === activeTypeSlug) || types[0]
  const filteredItems = items
    .filter((item) => item.typeSlug === activeTypeSlug)
    .filter((item) => activeSectionSlug === 'all' || item.sectionSlug === activeSectionSlug)
    .slice(0, 4)

  return (
    <section className="home-section editorial-showcase">
      <div className="section-heading editorial-showcase__header">
        <div>
          <span className="eyebrow">Explorar por tipo</span>
          <h2>Escolha o formato do conteudo e depois refine pela editoria.</h2>
        </div>
        {activeType ? <p>{activeType.description}</p> : null}
      </div>

      <div className="editorial-showcase__controls">
        <div className="editorial-showcase__tabs" role="tablist">
          {types.map((type) => (
            <button
              aria-selected={type.slug === activeTypeSlug}
              className={`editorial-showcase__tab ${type.slug === activeTypeSlug ? 'is-active' : ''}`}
              key={type.slug}
              onClick={() => {
                startTransition(() => {
                  setActiveTypeSlug(type.slug)
                })
              }}
              role="tab"
              type="button"
            >
              {type.label}
            </button>
          ))}
        </div>

        <div className="editorial-showcase__filters">
          <button
            aria-pressed={activeSectionSlug === 'all'}
            className={`editorial-showcase__filter ${activeSectionSlug === 'all' ? 'is-active' : ''}`}
            onClick={() => {
              startTransition(() => {
                setActiveSectionSlug('all')
              })
            }}
            type="button"
          >
            Todos
          </button>

          {sections.map((section) => (
            <button
              aria-pressed={section.slug === activeSectionSlug}
              className={`editorial-showcase__filter ${section.slug === activeSectionSlug ? 'is-active' : ''}`}
              key={section.slug}
              onClick={() => {
                startTransition(() => {
                  setActiveSectionSlug(section.slug)
                })
              }}
              type="button"
            >
              {section.label}
            </button>
          ))}
        </div>
      </div>

      {filteredItems.length > 0 ? (
        <div className="editorial-showcase__grid">
          {filteredItems.map((item) => (
            <article className="editorial-showcase-card" data-tone={item.tone} style={item.style} key={item.id}>
              <Link className="editorial-showcase-card__image" href={item.href}>
                {item.imageUrl ? (
                  <MediaFigure
                    alt={item.imageAlt}
                    sizes="(max-width: 820px) 100vw, 32vw"
                    src={item.imageUrl}
                  />
                ) : (
                  <span aria-hidden="true" className="editorial-showcase-card__image-fallback" />
                )}
              </Link>

              <div className="editorial-showcase-card__body">
                <div className="editorial-showcase-card__meta">
                  <span>{item.sectionLabel}</span>
                  <span>{item.typeLabel}</span>
                  <span>{item.publishedLabel}</span>
                </div>

                <div className="editorial-showcase-card__copy">
                  <Link href={item.href}>
                    <h3>{item.title}</h3>
                  </Link>
                  <p>{item.description}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="editorial-showcase__empty">
          <strong>Nada publicado nesse filtro ainda.</strong>
          <p>Quando novos posts entrarem nessa combinacao, eles vao aparecer aqui.</p>
        </div>
      )}
    </section>
  )
}
