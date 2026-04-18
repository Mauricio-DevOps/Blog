import { notFound } from 'next/navigation'

import { AdSlot } from '@/components/AdSlot'
import { NewsletterSignup } from '@/components/NewsletterSignup'
import { getSectionTone, getSectionToneStyle } from '@/lib/relations'
import { getSectionPosts } from '@/lib/queries'

import { Breadcrumbs } from './Breadcrumbs'
import { Pagination } from './Pagination'
import { PostCard } from './PostCard'

type Props = {
  newsletterStatus?: string
  page: number
  slug: string
}

export async function SectionArchive({ newsletterStatus, page, slug }: Props) {
  const data = await getSectionPosts(slug, page, 8)

  if (!data) {
    notFound()
  }

  const { posts, section } = data

  return (
    <div
      className="shell archive-page"
      data-tone={getSectionTone(section)}
      style={getSectionToneStyle(section)}
    >
      <Breadcrumbs items={[{ href: '/', label: 'Inicio' }, { label: section.title }]} />

      <section className="page-hero page-hero--compact">
        <span className="eyebrow">Editoria</span>
        <h1>{section.title}</h1>
        <p>{section.description}</p>
      </section>

      <div className="archive-layout">
        <div>
          <div className="post-grid">
            {posts.docs.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>

          <Pagination basePath={`/${slug}`} currentPage={posts.page || 1} totalPages={posts.totalPages || 1} />
        </div>

        <aside className="archive-layout__rail">
          <AdSlot placement={`section-${slug}-rail`} />
          <NewsletterSignup
            compact
            description={`Receba explicadores, curiosidades e novos textos de ${section.title.toLowerCase()} no seu ritmo.`}
            heading={`Entrar no radar de ${section.title}`}
            interests={[slug]}
            returnTo={`/${slug}`}
            source="section"
            status={newsletterStatus}
          />
        </aside>
      </div>
    </div>
  )
}
