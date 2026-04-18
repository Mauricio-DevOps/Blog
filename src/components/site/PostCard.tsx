import Link from 'next/link'

import { MediaFigure } from '@/components/MediaFigure'
import type { Post } from '@/payload-types'

import {
  formatPublishedDate,
  getMediaAlt,
  getMedia,
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

export function PostCard({ post }: Props) {
  const section = getSection(post)
  const coverMedia = getMedia(post.coverImage)
  const imageUrl = getMediaUrl(post.coverImage)
  const imageAlt = getMediaAlt(post.coverImage, post.title)

  return (
    <article
      className="post-card"
      data-tone={getSectionTone(section)}
      style={getSectionToneStyle(section)}
    >
      <Link className="post-card__image" href={getPostHref(post)}>
        {imageUrl ? (
          <MediaFigure
            alt={imageAlt}
            height={coverMedia?.height || 900}
            sizes="(max-width: 820px) 100vw, 50vw"
            src={imageUrl}
            width={coverMedia?.width || 1600}
          />
        ) : (
          <span>Sem capa</span>
        )}
      </Link>

      <div className="post-card__body">
        <div className="post-card__meta">
          <Link href={getSectionHref(post.section)}>{getSectionLabel(post.section)}</Link>
          <span>{getPostTypeLabel(post.postType)}</span>
          <span>{formatPublishedDate(post.publishedAt)}</span>
        </div>

        <div className="post-card__copy">
          <Link href={getPostHref(post)}>
            <h3>{post.title}</h3>
          </Link>
          <p>{post.excerpt}</p>
        </div>
      </div>
    </article>
  )
}
