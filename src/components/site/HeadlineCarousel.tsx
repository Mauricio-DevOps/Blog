'use client'

import Link from 'next/link'
import type { CSSProperties } from 'react'
import { startTransition, useEffect, useEffectEvent, useState } from 'react'

import { MediaFigure } from '@/components/MediaFigure'

export type HeadlineSlide = {
  description: string
  href: string
  id: string
  imageAlt: string
  imageUrl: null | string
  label: string
  meta: string[]
  title: string
  tone: string
  style?: CSSProperties
}

type Props = {
  slides: HeadlineSlide[]
}

export function HeadlineCarousel({ slides }: Props) {
  const [activeIndex, setActiveIndex] = useState(0)

  const advanceSlide = useEffectEvent(() => {
    startTransition(() => {
      setActiveIndex((current) => (current + 1 >= slides.length ? 0 : current + 1))
    })
  })

  useEffect(() => {
    if (slides.length < 2) {
      return
    }

    const intervalId = window.setInterval(() => {
      advanceSlide()
    }, 6500)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [slides.length])

  if (slides.length === 0) {
    return null
  }

  const resolvedActiveIndex = activeIndex >= slides.length ? 0 : activeIndex
  const activeSlide = slides[resolvedActiveIndex] || slides[0]
  const featureCategory = activeSlide.meta[0] || 'Destaque'
  const featureDate = activeSlide.meta[2] || activeSlide.meta[1] || 'Em breve'

  return (
    <section className="headline-carousel">
      <div className="section-heading headline-carousel__header">
        <div>
          <span className="eyebrow">Em alta agora</span>
          <h1>Voce viu isso?</h1>
        </div>
        <p>
          Fique por dentro de todas as noticias e destaques do momento. Noticias quentes,
          analises exclusivas e tudo o que voce precisa saber para estar sempre atualizado.
        </p>
      </div>

      <div className="headline-carousel__grid">
        <Link
          className="headline-carousel__feature"
          data-tone={activeSlide.tone}
          style={activeSlide.style}
          href={activeSlide.href}
        >
          <div className="headline-carousel__feature-top">
            <h2>{activeSlide.title}</h2>

            <div className="headline-carousel__meta">
              <span>{featureCategory}</span>
              <span>{featureDate}</span>
            </div>
          </div>

          {activeSlide.imageUrl ? (
            <div className="headline-carousel__media">
              <MediaFigure
                alt={activeSlide.imageAlt}
                className="headline-carousel__media-image"
                priority
                sizes="(max-width: 1080px) 100vw, 70vw"
                src={activeSlide.imageUrl}
              />
            </div>
          ) : (
            <div
              aria-hidden="true"
              className="headline-carousel__media headline-carousel__media--fallback"
            />
          )}

          <div className="headline-carousel__content">
            <p>{activeSlide.description}</p>
            <span className="headline-carousel__cta">Abrir destaque</span>
          </div>
        </Link>

        <div className="headline-carousel__rail">
          <div className="headline-carousel__preview-list">
            {slides.map((slide, index) => (
              <button
                aria-pressed={index === resolvedActiveIndex}
                className={`headline-carousel__preview ${index === resolvedActiveIndex ? 'is-active' : ''}`}
                key={slide.id}
                onClick={() => {
                  startTransition(() => {
                    setActiveIndex(index)
                  })
                }}
                type="button"
              >
                <span className="headline-carousel__preview-label">{slide.label}</span>
                <strong>{slide.title}</strong>
                <small>{slide.meta[0] || 'Destaque'}</small>
              </button>
            ))}
          </div>

          <div aria-label="Destaques da home" className="headline-carousel__dots" role="tablist">
            {slides.map((slide, index) => (
              <button
                aria-label={`Mostrar ${slide.label}`}
                className={`headline-carousel__dot ${index === resolvedActiveIndex ? 'is-active' : ''}`}
                key={slide.id}
                onClick={() => {
                  startTransition(() => {
                    setActiveIndex(index)
                  })
                }}
                type="button"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
