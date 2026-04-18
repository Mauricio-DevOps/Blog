import Link from 'next/link'

import { MediaFigure } from '@/components/MediaFigure'
import type { Post } from '@/payload-types'

import {
  formatPublishedDate,
  getMediaAlt,
  getMediaUrl,
  getPostHref,
  getPostTypeLabel,
  getSection,
  getSectionHref,
  getSectionLabel,
  getSectionTone,
  getSectionToneStyle,
} from '@/lib/relations'

type Props = {
  post: Post
}

export function HeroPostCard({ post }: Props) {
  const section = getSection(post)
  const imageUrl = getMediaUrl(post.coverImage)
  const imageAlt = getMediaAlt(post.coverImage, post.title)

  return (
    <article
      className="hero-post"
      data-tone={getSectionTone(section)}
      style={getSectionToneStyle(section)}
    >
      <div className="hero-post__copy">
        <div className="hero-post__meta">
          <Link href={getSectionHref(post.section)}>{getSectionLabel(post.section)}</Link>
          <span>{getPostTypeLabel(post.postType)}</span>
          <span>{formatPublishedDate(post.publishedAt)}</span>
        </div>
        <Link href={getPostHref(post)}>
          <h2>{post.title}</h2>
        </Link>
        <p>{post.excerpt}</p>
        <div className="hero-post__actions">
          <Link className="button button--solid" href={getPostHref(post)}>
            Ler agora
          </Link>
          <Link className="button button--ghost" href={getSectionHref(post.section)}>
            Ver editoria
          </Link>
        </div>
      </div>

      <Link className="hero-post__media" href={getPostHref(post)}>
        {imageUrl ? (
          <MediaFigure
            alt={imageAlt}
            priority
            sizes="(max-width: 1080px) 100vw, 38vw"
            src={imageUrl}
          />
        ) : (
          <span>Sem capa</span>
        )}
      </Link>
    </article>
  )
}
