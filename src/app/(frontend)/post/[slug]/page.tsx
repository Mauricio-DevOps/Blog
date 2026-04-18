import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { AdSlot } from '@/components/AdSlot'
import { AffiliateDisclosure } from '@/components/AffiliateDisclosure'
import { MediaFigure } from '@/components/MediaFigure'
import { NewsletterSignup } from '@/components/NewsletterSignup'
import { RichText } from '@/components/RichText'
import { Breadcrumbs } from '@/components/site/Breadcrumbs'
import { PostCard } from '@/components/site/PostCard'
import {
  formatPublishedDate,
  getAuthor,
  getCanonicalPostURL,
  getMediaAlt,
  getMediaUrl,
  getSection,
  getSectionHref,
  getSectionLabel,
  getSectionTone,
  getSectionToneStyle,
  getTagHref,
  getTags,
} from '@/lib/relations'
import { getPublishedPostBySlug, getRelatedPublishedPosts } from '@/lib/queries'
import { readSearchParam } from '@/lib/request'
import { getAbsoluteURL, siteConfig } from '@/lib/site'

type PageProps = {
  params: Promise<{
    slug: string
  }>
  searchParams: Promise<{
    newsletter?: string | string[]
  }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await getPublishedPostBySlug(slug)

  if (!post) {
    return {
      title: siteConfig.name,
    }
  }

  const imageUrl = getMediaUrl(post.coverImage)

  return {
    alternates: {
      canonical: getCanonicalPostURL(post),
    },
    description: post.seoDescription || post.excerpt,
    openGraph: {
      description: post.seoDescription || post.excerpt,
      images: imageUrl ? [getAbsoluteURL(imageUrl)] : undefined,
      title: post.seoTitle || post.title,
      type: 'article',
    },
    title: post.seoTitle || post.title,
  }
}

export default async function PostPage({ params, searchParams }: PageProps) {
  const { slug } = await params
  const post = await getPublishedPostBySlug(slug)

  if (!post) {
    notFound()
  }

  const resolvedSearchParams = await searchParams
  const author = getAuthor(post)
  const tags = getTags(post)
  const section = getSection(post)
  const relatedPosts = await getRelatedPublishedPosts(post)
  const imageUrl = getMediaUrl(post.coverImage)
  const imageAlt = getMediaAlt(post.coverImage, post.title)
  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    articleSection: section?.title,
    author: [
      {
        '@type': 'Person',
        name: author?.name || siteConfig.name,
      },
    ],
    datePublished: post.publishedAt,
    description: post.seoDescription || post.excerpt,
    headline: post.seoTitle || post.title,
    image: imageUrl ? [getAbsoluteURL(imageUrl)] : undefined,
    mainEntityOfPage: getCanonicalPostURL(post),
  }

  return (
    <article
      className="shell article-page"
      data-tone={getSectionTone(section)}
      style={getSectionToneStyle(section)}
    >
      <script
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleJsonLd),
        }}
        type="application/ld+json"
      />

      <Breadcrumbs
        items={[
          { href: '/', label: 'Inicio' },
          section
            ? { href: getSectionHref(post.section), label: getSectionLabel(post.section) }
            : { href: '/', label: 'Editorial' },
          { label: post.title },
        ]}
      />

      <header className="article-header">
        <div className="article-header__copy">
          <div className="article-header__meta">
            <Link href={getSectionHref(post.section)}>{getSectionLabel(post.section)}</Link>
            <span>{formatPublishedDate(post.publishedAt)}</span>
            {author ? <span>Por {author.name}</span> : null}
          </div>

          <h1>{post.title}</h1>
          <p>{post.excerpt}</p>

          {post.affiliateDisclosure ? <AffiliateDisclosure /> : null}

          {tags.length > 0 ? (
            <ul className="tag-row">
              {tags.map((tag) => (
                <li key={tag.id}>
                  <Link href={getTagHref(tag)}>{tag.name}</Link>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <div className="article-header__media">
          {imageUrl ? <MediaFigure alt={imageAlt} priority sizes="(max-width: 1080px) 100vw, 420px" src={imageUrl} /> : null}
        </div>
      </header>

      <div className="article-layout">
        <div className="article-main">
          <RichText content={post.content} />

          <AdSlot placement={`post-${post.slug}-inline`} />

          <NewsletterSignup
            compact
            description="Entre na lista para transformar leitura pontual em recorrencia editorial."
            heading="Continuar acompanhando"
            interests={section?.slug ? [section.slug] : []}
            returnTo={`/post/${post.slug}`}
            source="post"
            status={readSearchParam(resolvedSearchParams.newsletter)}
          />
        </div>

        <aside className="article-rail">
          <AdSlot placement="article-rail" />
        </aside>
      </div>

      {relatedPosts.length > 0 ? (
        <section className="related-posts">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Proximos passos</span>
              <h2>Continue nessa trilha</h2>
            </div>
          </div>

          <div className="post-grid">
            {relatedPosts.map((relatedPost) => (
              <PostCard key={relatedPost.id} post={relatedPost} />
            ))}
          </div>
        </section>
      ) : null}
    </article>
  )
}
