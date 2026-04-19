import Link from 'next/link'

import { MediaFigure } from '@/components/MediaFigure'
import type { Post, Section } from '@/payload-types'

import {
  formatPublishedDate,
  getMediaAlt,
  getMediaUrl,
  getPostHref,
  getPostTypeLabel,
  getSectionTone,
  getSectionToneStyle,
} from '@/lib/relations'

type Props = {
  posts: Post[]
  section: Section
}

export function SectionSpotlight({ posts, section }: Props) {
  if (posts.length === 0) {
    return null
  }

  return (
    <section
      className="section-spotlight"
      data-tone={getSectionTone(section)}
      style={getSectionToneStyle(section)}
    >
      <div className="section-spotlight__header">
        <div>
          <span className="eyebrow">Editoria</span>
          <h2>{section.title}</h2>
          <p>{section.description}</p>
        </div>
        <Link className="button button--ghost" href={`/${section.slug}`}>
          Ver tudo
        </Link>
      </div>

      <div className="section-spotlight__shelf">
        {posts.map((post) => {
          const imageUrl = getMediaUrl(post.coverImage)
          const imageAlt = getMediaAlt(post.coverImage, post.title)

          return (
            <article className="section-spotlight-card" key={post.id}>
              <Link className="section-spotlight-card__image" href={getPostHref(post)}>
                {imageUrl ? (
                  <MediaFigure alt={imageAlt} sizes="(max-width: 820px) 76vw, 220px" src={imageUrl} />
                ) : (
                  <span aria-hidden="true" className="section-spotlight-card__image-fallback" />
                )}
              </Link>

              <div className="section-spotlight-card__body">
                <div className="section-spotlight-card__meta">
                  <span>{getPostTypeLabel(post.postType)}</span>
                  <span>{formatPublishedDate(post.publishedAt)}</span>
                </div>

                <Link href={getPostHref(post)}>
                  <h3>{post.title}</h3>
                </Link>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
