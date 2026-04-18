import Link from 'next/link'
import type { CSSProperties } from 'react'

import { MediaFigure } from '@/components/MediaFigure'

export type LatestNewsItem = {
  description: string
  href: string
  id: string
  imageAlt: string
  imageUrl: null | string
  meta: string[]
  title: string
  tone: string
  style?: CSSProperties
}

type Props = {
  items: LatestNewsItem[]
}

export function LatestNewsList({ items }: Props) {
  return (
    <div className="latest-news-list">
      {items.map((item, index) => {
        const isReversed = index % 2 === 1

        return (
          <article
            className={`latest-news-card ${isReversed ? 'is-reversed' : ''}`}
            data-tone={item.tone}
            style={item.style}
            key={item.id}
          >
            <Link className="latest-news-card__media" href={item.href}>
              {item.imageUrl ? (
                <MediaFigure
                  alt={item.imageAlt}
                  sizes="(max-width: 820px) 100vw, 42vw"
                  src={item.imageUrl}
                />
              ) : (
                <span aria-hidden="true" className="latest-news-card__media-fallback" />
              )}
            </Link>

            <div className="latest-news-card__body">
              <div className="latest-news-card__meta">
                {item.meta.map((metaItem) => (
                  <span key={`${item.id}-${metaItem}`}>{metaItem}</span>
                ))}
              </div>

              <div className="latest-news-card__copy">
                <Link href={item.href}>
                  <h3>{item.title}</h3>
                </Link>
                <p>{item.description}</p>
              </div>

              <Link className="latest-news-card__cta" href={item.href}>
                Ler noticia
              </Link>
            </div>
          </article>
        )
      })}
    </div>
  )
}
