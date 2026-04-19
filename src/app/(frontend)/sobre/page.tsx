import type { Metadata } from 'next'

import { NewsletterSignup } from '@/components/NewsletterSignup'
import { Breadcrumbs } from '@/components/site/Breadcrumbs'
import { readSearchParam } from '@/lib/request'
import { getAbsoluteURL, siteConfig } from '@/lib/site'

type Props = {
  searchParams: Promise<{
    newsletter?: string | string[]
  }>
}

export const metadata: Metadata = {
  alternates: {
    canonical: getAbsoluteURL('/sobre'),
  },
  description: 'Sobre o projeto editorial Perfeito é só....',
  title: `Sobre | ${siteConfig.name}`,
}

export default async function SobrePage({ searchParams }: Props) {
  const params = await searchParams

  return (
    <div className="shell static-page">
      <Breadcrumbs items={[{ href: '/', label: 'Inicio' }, { label: 'Sobre' }]} />

      <section className="page-hero page-hero--compact">
        <span className="eyebrow">Manifesto editorial</span>
        <h1>Um blog para tirar duvidas sem tratar o leitor como intruso.</h1>
        <p>
          O Perfeito é só... nasce para organizar contexto, curiosidade e repertorio em torno da cultura
          pop. O compromisso do projeto e tornar o universo nerd mais navegavel, principalmente para
          quem esta chegando agora.
        </p>
      </section>

      <div className="copy-grid">
        <article className="copy-card">
          <h2>Como pensamos a pauta</h2>
          <p>
            Cada post funciona como landing page editorial: responde uma duvida, entrega contexto
            rapido, aprofunda o necessario e aponta o proximo passo de leitura.
          </p>
        </article>

        <article className="copy-card">
          <h2>O que entra no v1</h2>
          <p>
            Filmes, series, animes e games. O desenho e de marca tematica, nao de diario pessoal,
            com home hibrida e painel simples para publicar pelo admin.
          </p>
        </article>

        <article className="copy-card">
          <h2>Como o projeto cresce</h2>
          <p>
            O crescimento vem de SEO, recorrencia por newsletter, arquitetura de clusters e
            monetizacao progressiva por ads, afiliados e parcerias editoriais.
          </p>
        </article>
      </div>

      <NewsletterSignup
        description="Entre cedo para acompanhar como o projeto editorial evolui com novas editorias e formatos."
        heading="Receber os proximos passos do blog"
        interests={['filmes', 'series', 'animes', 'games']}
        returnTo="/sobre"
        source="sobre"
        status={readSearchParam(params.newsletter)}
      />
    </div>
  )
}
