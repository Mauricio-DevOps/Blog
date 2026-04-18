import Image from 'next/image'

type Props = {
  alt: string
  className?: string
  height?: number
  priority?: boolean
  sizes: string
  src: string
  width?: number
}

export function MediaFigure({
  alt,
  className,
  height = 900,
  priority = false,
  sizes,
  src,
  width = 1600,
}: Props) {
  return (
    <Image
      alt={alt}
      className={className}
      height={height}
      priority={priority}
      sizes={sizes}
      src={src}
      unoptimized
      width={width}
    />
  )
}
