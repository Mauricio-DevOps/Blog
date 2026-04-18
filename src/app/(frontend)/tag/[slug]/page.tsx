import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { NewsletterSignup } from '@/components/NewsletterSignup'
import { Breadcrumbs } from '@/components/site/Breadcrumbs'
import { Pagination } from '@/components/site/Pagination'
import { PostCard } from '@/components/site/PostCard'
import { getTagPosts } from '@/lib/queries'
import { readSearchParam } from '@/lib/request'
import { getAbsoluteURL, siteConfig } from '@/lib/site'

type PageProps = {
  params: Promise<{
    slug: string
  }>
  searchParams: Promise<{
    newsletter?: string | string[]
    page?: string | string[]
  }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const data = await getTagPosts(slug, 1, 1)

  return {
    alternates: {
      canonical: getAbsoluteURL(`/tag/${slug}`),
    },
    description: data?.tag.description || siteConfig.description,
    title: data?.tag.name ? `Tag: ${data.tag.name}` : 'Tag',
  }
}

export default async function TagPage({ params, searchParams }: PageProps) {
  const { slug } = await params
  const resolvedSearchParams = await searchParams
  const page = Number(readSearchParam(resolvedSearchParams.page) || '1')
  const data = await getTagPosts(slug, page, 10)

  if (!data) {
    notFound()
  }

  return (
    <div className="shell archive-page">
      <Breadcrumbs items={[{ href: '/', label: 'Inicio' }, { label: `Tag: ${data.tag.name}` }]} />

      <section className="page-hero page-hero--compact">
        <span className="eyebrow">Tag</span>
        <h1>{data.tag.name}</h1>
        <p>{data.tag.description || 'Agrupamento editorial para cruzar assuntos recorrentes do blog.'}</p>
      </section>

      <div className="post-grid">
        {data.posts.docs.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>

      <Pagination basePath={`/tag/${slug}`} currentPage={data.posts.page || 1} totalPages={data.posts.totalPages || 1} />

      <NewsletterSignup
        compact
        description="Use tags para descobrir temas especificos e a newsletter para voltar quando sair coisa nova."
        heading="Assinar este radar"
        returnTo={`/tag/${slug}`}
        source="tag"
        status={readSearchParam(resolvedSearchParams.newsletter)}
      />
    </div>
  )
}
