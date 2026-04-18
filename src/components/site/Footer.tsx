import Link from 'next/link'

import type { Section } from '@/payload-types'

import { siteConfig } from '@/lib/site'

type Props = {
  sections: Section[]
}

export function Footer({ sections }: Props) {
  return (
    <footer className="site-footer">
      <div className="shell site-footer__grid">
        <div>
          <span className="eyebrow">Nebulosa Pop</span>
          <h2>Um blog para aprender antes de maratonar.</h2>
          <p>
            O foco deste MVP e organizar conteudo util, recorrente e navegavel em torno de filmes,
            series, animes e games.
          </p>
        </div>

        <div>
          <h3>Editorias</h3>
          <ul className="footer-list">
            {sections.map((section) => (
              <li key={section.id}>
                <Link href={`/${section.slug}`}>{section.title}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3>Atalhos</h3>
          <ul className="footer-list">
            <li>
              <Link href="/sobre">Sobre</Link>
            </li>
            <li>
              <Link href="/contato">Fale Conosco</Link>
            </li>
            <li>
              <Link href="/admin">Admin</Link>
            </li>
            <li>
              <a href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  )
}
