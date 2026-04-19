import Link from 'next/link'

import { AdSlot } from '@/components/AdSlot'
import { NewsletterSignup } from '@/components/NewsletterSignup'
import { NewsletterDialogButton } from '@/components/newsletter/NewsletterDialogButton'
import { auth } from '@/auth'
import { EditorialShowcase, type EditorialShowcaseType } from '@/components/site/EditorialShowcase'
import { HeadlineCarousel } from '@/components/site/HeadlineCarousel'
import { LatestNewsList } from '@/components/site/LatestNewsList'
import { SectionSpotlight } from '@/components/site/SectionSpotlight'
import { getHomePageData } from '@/lib/queries'
import {
  formatPublishedDate,
  getMediaAlt,
  getMediaUrl,
  getPostHref,
  getPostTypeLabel,
  getSectionLabel,
  getSectionTone,
  getSectionToneStyle,
} from '@/lib/relations'
import { readSearchParam } from '@/lib/request'
import type { Post } from '@/payload-types'

const editorialShowcaseTypes: EditorialShowcaseType[] = [
  {
    description:
      'Guias, tutoriais e caminhos de entrada para ajudar o leitor a fazer ou entender algo na pratica.',
    label: 'Explicador',
    slug: 'explicador',
  },
  {
    description:
      'Posts curtos de contexto, bastidor e fatos interessantes no estilo "voce sabia?".',
    label: 'Curiosidade',
    slug: 'curiosidade',
  },
  {
    description:
      'Analises e opinioes para quando a ideia for avaliar uma obra, jogo, filme ou experiencia.',
    label: 'Review',
    slug: 'review',
  },
]

function buildHeadlineSlides(posts: Array<null | Post | undefined>) {
  const seen = new Set<number | string>()

  return posts
    .filter((post): post is Post => Boolean(post))
    .filter((post) => {
      if (seen.has(post.id)) {
        return false
      }

      seen.add(post.id)
      return true
    })
    .slice(0, 4)
    .map((post, index) => ({
      description: post.excerpt || 'Destaque pronto para puxar o clique logo na abertura da home.',
      href: getPostHref(post),
      id: String(post.id),
      imageAlt: getMediaAlt(post.coverImage, post.title),
      imageUrl: getMediaUrl(post.coverImage),
      label: `Post ${index + 1}`,
      meta: [
        getSectionLabel(post.section),
        getPostTypeLabel(post.postType),
        formatPublishedDate(post.publishedAt),
      ],
      title: post.title,
      tone: getSectionTone(typeof post.section === 'object' ? post.section : undefined),
      style: getSectionToneStyle(typeof post.section === 'object' ? post.section : undefined),
    }))
}

function buildLatestNewsItems(posts: Array<null | Post | undefined>) {
  const seen = new Set<number | string>()

  return posts
    .filter((post): post is Post => Boolean(post))
    .filter((post) => {
      if (seen.has(post.id)) {
        return false
      }

      seen.add(post.id)
      return true
    })
    .slice(0, 4)
    .map((post, index) => ({
      description:
        post.excerpt || 'Resumo rapido da noticia para orientar o clique sem depender so da imagem.',
      href: getPostHref(post),
      id: `latest-${post.id}`,
      imageAlt: getMediaAlt(post.coverImage, post.title),
      imageUrl: getMediaUrl(post.coverImage),
      meta: [
        getSectionLabel(post.section),
        `Post ${index + 1}`,
        formatPublishedDate(post.publishedAt),
      ],
      title: post.title,
      tone: getSectionTone(typeof post.section === 'object' ? post.section : undefined),
      style: getSectionToneStyle(typeof post.section === 'object' ? post.section : undefined),
    }))
}

function buildEditorialShowcaseItems(posts: Array<null | Post | undefined>) {
  const allowedTypes = new Set(editorialShowcaseTypes.map((type) => type.slug))

  return posts
    .filter((post): post is Post => Boolean(post))
    .filter((post) => allowedTypes.has(post.postType))
    .map((post) => ({
      description:
        post.excerpt || 'Resumo editorial pronto para orientar o clique e contextualizar o leitor.',
      href: getPostHref(post),
      id: `editorial-${post.id}`,
      imageAlt: getMediaAlt(post.coverImage, post.title),
      imageUrl: getMediaUrl(post.coverImage),
      publishedLabel: formatPublishedDate(post.publishedAt),
      sectionLabel: getSectionLabel(post.section),
      sectionSlug: typeof post.section === 'object' ? post.section.slug : 'filmes',
      title: post.title,
      tone: getSectionTone(typeof post.section === 'object' ? post.section : undefined),
      style: getSectionToneStyle(typeof post.section === 'object' ? post.section : undefined),
      typeLabel: getPostTypeLabel(post.postType),
      typeSlug: post.postType,
    }))
}

type Props = {
  searchParams: Promise<{
    newsletter?: string | string[]
  }>
}

export default async function HomePage({ searchParams }: Props) {
  const session = await auth()
  const { editorialPosts, featuredPost, latestPosts, sectionSpotlights, sections } =
    await getHomePageData()
  const params = await searchParams
  const newsletterStatus = readSearchParam(params.newsletter)
  const headlineSlides = buildHeadlineSlides([featuredPost, ...latestPosts, ...editorialPosts])
  const latestNewsItems = buildLatestNewsItems(latestPosts)
  const editorialShowcaseItems = buildEditorialShowcaseItems(editorialPosts)
  const editorialSections = sections.map((section) => ({
    label: section.title,
    slug: section.slug,
  }))

  return (
    <div className="shell home-page">
      {headlineSlides.length > 0 ? <HeadlineCarousel slides={headlineSlides} /> : null}

      {latestNewsItems.length > 0 ? (
        <div className="home-split">
          <section className="home-section" id="latest-news">
            <div className="section-heading">
              <div>
                <span className="eyebrow">Ultimas noticias</span>
                <h2>Aqui voce acompanha as ultimas noticias publicadas no nosso blog.</h2>
              </div>
            </div>
            <LatestNewsList items={latestNewsItems} />
          </section>

          <div className="home-sidebar">
            <AdSlot placement="home-premium" />
            <AdSlot compact placement="home-radar" />
          </div>
        </div>
      ) : null}

      <section className="home-intro">
        <div className="home-intro__copy">
          <span className="eyebrow">Novo por aqui?</span>
          <h2>Entre pelo assunto que faz mais sentido para voce agora.</h2>
          <p>
            Em vez de abrir a home explicando o projeto, a ideia agora e dar uma rota curta: ver os
            destaques, cair nas ultimas noticias ou ir direto para a editoria favorita.
          </p>
          <div className="home-intro__actions">
            <Link className="button button--solid" href="/#latest-news">
              Ver noticias
            </Link>
            <NewsletterDialogButton
              className="button button--ghost"
              hideWhenAuthenticated
              interests={['filmes', 'series', 'animes', 'games']}
              isAuthenticated={Boolean(session?.user)}
              label="Receber por e-mail"
              returnTo="/"
              source="homepage"
            />
          </div>
        </div>

        <div className="home-intro__panel">
          <span className="eyebrow">Rotas rapidas</span>
          <div className="quick-links">
            {sections.map((section) => (
              <Link
                className="quick-link"
                data-tone={getSectionTone(section)}
                style={getSectionToneStyle(section)}
                href={`/${section.slug}`}
                key={section.id}
              >
                <strong>{section.title}</strong>
                <span>Abrir editoria</span>
              </Link>
            ))}
          </div>
          <p className="home-intro__note">
            O bloco institucional continua existindo, mas deixou de ocupar a primeira decisao visual da
            home.
          </p>
        </div>
      </section>

      {editorialShowcaseItems.length > 0 ? (
        <EditorialShowcase
          items={editorialShowcaseItems}
          sections={editorialSections}
          types={editorialShowcaseTypes}
        />
      ) : null}

      <NewsletterSignup
        description="Entre na base desde cedo e use o admin para acompanhar quem entrou por cada editoria."
        heading="Receba o melhor da cultura pop no seu ritmo"
        interests={['filmes', 'series', 'animes', 'games']}
        returnTo="/"
        source="homepage"
        status={newsletterStatus}
      />

      {sectionSpotlights.map(({ posts, section }) => (
        <SectionSpotlight key={section.id} posts={posts} section={section} />
      ))}
    </div>
  )
}
