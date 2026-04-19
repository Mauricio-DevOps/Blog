import type { Metadata } from 'next'

import { AdSlot } from '@/components/AdSlot'
import { NewsletterSignup } from '@/components/NewsletterSignup'
import { Breadcrumbs } from '@/components/site/Breadcrumbs'
import { readSearchParam } from '@/lib/request'
import { getAbsoluteURL, siteConfig } from '@/lib/site'

import { submitContactMessage } from '../actions'

type Props = {
  searchParams: Promise<{
    contact?: string | string[]
    newsletter?: string | string[]
    origin?: string | string[]
    subject?: string | string[]
  }>
}

const availableSubjects = [
  { label: 'Geral', value: 'geral' },
  { label: 'Patrocinio', value: 'patrocinio' },
  { label: 'Parceria', value: 'parceria' },
  { label: 'Pauta', value: 'pauta' },
  { label: 'Sugestao', value: 'sugestao' },
  { label: 'Outro', value: 'outro' },
] as const

export const metadata: Metadata = {
  alternates: {
    canonical: getAbsoluteURL('/contato'),
  },
  description: 'Pagina de contato e patrocinio do Perfeito é só....',
  title: `Fale Conosco | ${siteConfig.name}`,
}

export default async function ContatoPage({ searchParams }: Props) {
  const params = await searchParams
  const contactStatus = readSearchParam(params.contact)
  const newsletterStatus = readSearchParam(params.newsletter)
  const origin = readSearchParam(params.origin)
  const selectedSubject = availableSubjects.some(
    (subject) => subject.value === readSearchParam(params.subject),
  )
    ? (readSearchParam(params.subject) as (typeof availableSubjects)[number]['value'])
    : 'geral'
  const message =
    contactStatus === 'success'
      ? 'Sua mensagem foi recebida com sucesso. Nossa equipe retorna pelo canal informado.'
      : contactStatus === 'error'
        ? 'Nao foi possivel enviar sua mensagem agora. Revise os dados e tente novamente.'
        : null

  return (
    <div className="shell static-page">
      <Breadcrumbs items={[{ href: '/', label: 'Inicio' }, { label: 'Fale Conosco' }]} />

      <section className="page-hero page-hero--compact">
        <span className="eyebrow">Fale Conosco</span>
        <h1>Um unico canal para patrocinio, parcerias, pautas e mensagens gerais.</h1>
        <p>
          Preencha o formulario abaixo e nos diga o motivo do contato. Se voce veio de um espaco
          patrocinavel, o assunto ja chega preparado para agilizar a conversa.
        </p>
      </section>

      <div className="contact-grid">
        <section className="contact-panel">
          <div className="copy-card contact-panel__intro">
            <h2>Canal direto com o blog</h2>
            <p>
              Se preferir, voce tambem pode escrever para{' '}
              <a href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a>.
            </p>
            <p>
              O formulario abaixo ajuda a organizar contexto, assunto e origem do contato sem perder
              nenhuma informacao no caminho.
            </p>
          </div>

          <form action={submitContactMessage} className="contact-form" id="fale-conosco">
            <input name="origin" type="hidden" value={origin || ''} />

            <div className="contact-form__header">
              <div>
                <span className="eyebrow">Formulario</span>
                <h2>Envie sua mensagem</h2>
              </div>
              {message ? <p className={`status-banner status-banner--${contactStatus}`}>{message}</p> : null}
            </div>

            <div className="contact-form__grid">
              <label className="contact-form__field">
                <span>Nome</span>
                <input autoComplete="name" name="name" placeholder="Seu nome" required type="text" />
              </label>

              <label className="contact-form__field">
                <span>E-mail</span>
                <input autoComplete="email" name="email" placeholder="voce@exemplo.com" required type="email" />
              </label>

              <label className="contact-form__field">
                <span>Telefone ou WhatsApp</span>
                <input autoComplete="tel" name="phone" placeholder="(00) 00000-0000" type="text" />
              </label>

              <label className="contact-form__field">
                <span>Assunto</span>
                <select defaultValue={selectedSubject} name="subject">
                  {availableSubjects.map((subject) => (
                    <option key={subject.value} value={subject.value}>
                      {subject.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="contact-form__field">
              <span>Motivo do contato</span>
              <textarea
                name="message"
                placeholder="Conte o contexto, sua proposta ou a sua mensagem."
                required
                rows={7}
              />
            </label>

            <div className="contact-form__actions">
              <button className="button button--solid" type="submit">
                Enviar mensagem
              </button>
            </div>
          </form>
        </section>

        <aside className="contact-sidebar">
          <AdSlot placement="contact-sidebar" />
        </aside>
      </div>

      <NewsletterSignup
        compact
        description="Se o seu objetivo e acompanhar novidades do projeto, a newsletter resolve sem precisar mandar mensagem."
        heading="Receber novidades em vez de mandar e-mail"
        interests={['filmes', 'series', 'animes', 'games']}
        returnTo="/contato"
        source="contato"
        status={newsletterStatus}
        submitLabel="Quero participar"
      />
    </div>
  )
}
