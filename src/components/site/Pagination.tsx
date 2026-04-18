import Link from 'next/link'

type Props = {
  basePath: string
  currentPage: number
  totalPages: number
}

function buildPageHref(basePath: string, page: number) {
  if (page <= 1) {
    return basePath
  }

  return `${basePath}?page=${page}`
}

export function Pagination({ basePath, currentPage, totalPages }: Props) {
  if (totalPages <= 1) {
    return null
  }

  return (
    <nav aria-label="Paginação" className="pagination">
      <Link
        aria-disabled={currentPage <= 1}
        className={`pagination__link${currentPage <= 1 ? ' is-disabled' : ''}`}
        href={currentPage <= 1 ? basePath : buildPageHref(basePath, currentPage - 1)}
      >
        Página anterior
      </Link>

      <span className="pagination__status">
        Página {currentPage} de {totalPages}
      </span>

      <Link
        aria-disabled={currentPage >= totalPages}
        className={`pagination__link${currentPage >= totalPages ? ' is-disabled' : ''}`}
        href={currentPage >= totalPages ? buildPageHref(basePath, totalPages) : buildPageHref(basePath, currentPage + 1)}
      >
        Próxima página
      </Link>
    </nav>
  )
}
