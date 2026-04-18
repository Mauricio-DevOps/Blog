import Link from 'next/link'

type Props = {
  compact?: boolean
  placement: string
}

export function AdSlot({ compact = false, placement }: Props) {
  const href = `/contato?subject=patrocinio&origin=${encodeURIComponent(placement)}`

  return (
    <aside className={`ad-slot${compact ? ' ad-slot--compact' : ''}`}>
      <span className="eyebrow">Patrocinio</span>
      <h3>Espaco patrocinavel</h3>
      <p>
        Tem interesse em colocar um anuncio ou patrocinar o nosso blog? Entre em contato com a
        gente e o seu anuncio ficara aqui.
      </p>
      <Link className="button button--solid ad-slot__cta" href={href}>
        Entrar em contato
      </Link>
    </aside>
  )
}
