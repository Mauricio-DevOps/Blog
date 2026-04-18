import type { CSSProperties } from 'react'

import type { Accent, Author, Media, Post, Section, Tag } from '@/payload-types'

import { getAbsoluteURL, postTypeLabels, sectionLabels } from '@/lib/site'

type MaybeRelation<T> = null | number | string | T | undefined

export function getRelationDoc<T extends { id: number | string }>(value: MaybeRelation<T>) {
  if (value && typeof value === 'object') {
    return value
  }

  return null
}

export function getRelationDocs<T extends { id: number | string }>(value?: Array<MaybeRelation<T>> | null) {
  if (!Array.isArray(value)) {
    return []
  }

  return value.map((item) => getRelationDoc(item)).filter(Boolean) as T[]
}

export function getAuthor(post: Pick<Post, 'author'>) {
  return getRelationDoc<Author>(post.author)
}

export function getSection(post: Pick<Post, 'section'>) {
  return getRelationDoc<Section>(post.section)
}

export function getAccent(section: MaybeRelation<Section>) {
  const doc = getRelationDoc<Section>(section)

  if (!doc || !doc.accent || typeof doc.accent !== 'object') {
    return null
  }

  return getRelationDoc<Accent>(doc.accent)
}

export function getTags(post: Pick<Post, 'tags'>) {
  return getRelationDocs<Tag>(post.tags)
}

export function getMedia(media: MaybeRelation<Media>) {
  return getRelationDoc<Media>(media)
}

export function getMediaUrl(media: MaybeRelation<Media>) {
  return getMedia(media)?.url || null
}

type MediaSizeVariant = {
  url?: null | string
}

export function getMediaSizeUrl(media: MaybeRelation<Media>, size: string) {
  const doc = getMedia(media) as Media & {
    sizes?: Record<string, MediaSizeVariant>
  }

  return doc?.sizes?.[size]?.url || null
}

export function getMediaAlt(media: MaybeRelation<Media>, fallback = '') {
  return getMedia(media)?.alt || fallback
}

export function getSectionHref(section: MaybeRelation<Section>) {
  const doc = getRelationDoc<Section>(section)
  return doc?.slug ? `/${doc.slug}` : '/'
}

export function getSectionLabel(section: MaybeRelation<Section>) {
  const doc = getRelationDoc<Section>(section)
  if (!doc?.slug) {
    return 'Editorial'
  }

  return sectionLabels[doc.slug] || doc.title
}

export function getSectionTone(section?: MaybeRelation<Section> | null) {
  const doc = getRelationDoc<Section>(section)

  if (!doc?.slug) {
    return 'default'
  }

  const accent = getAccent(doc)

  if (accent?.slug) {
    return accent.slug
  }

  if (doc.slug === 'filmes' || doc.slug === 'series' || doc.slug === 'animes' || doc.slug === 'games') {
    return doc.slug
  }

  return doc.slug
}

export function getSectionToneStyle(section?: MaybeRelation<Section> | null): CSSProperties | undefined {
  const accent = getAccent(section)

  if (!accent?.tone) {
    return undefined
  }

  return {
    ['--tone' as string]: accent.tone,
    ['--tone-soft' as string]: `color-mix(in srgb, ${accent.tone} 16%, transparent)`,
  }
}

export function getPostHref(post: Pick<Post, 'slug'>) {
  return `/post/${post.slug}`
}

export function getTagHref(tag: MaybeRelation<Tag>) {
  const doc = getRelationDoc<Tag>(tag)
  return doc?.slug ? `/tag/${doc.slug}` : '/tag'
}

export function getPostTypeLabel(postType?: null | string) {
  if (!postType) {
    return 'Post'
  }

  return postTypeLabels[postType] || 'Post'
}

export function formatPublishedDate(date?: null | string) {
  if (!date) {
    return 'Sem data'
  }

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'long',
  }).format(new Date(date))
}

export function getCanonicalPostURL(post: Pick<Post, 'slug'>) {
  return getAbsoluteURL(getPostHref(post))
}
