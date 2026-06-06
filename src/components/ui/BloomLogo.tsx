export const BLOOM_LOGO_SRC = '/flower.png'

export type BloomLogoSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

const SIZE_PX: Record<BloomLogoSize, number> = {
  xs: 14,
  sm: 20,
  md: 28,
  lg: 40,
  xl: 56,
}

type BloomLogoProps = {
  size?: BloomLogoSize
  className?: string
  glow?: boolean
  alt?: string
}

export function BloomLogo({
  size = 'md',
  className = '',
  glow = false,
  alt = 'BloomCode',
}: BloomLogoProps) {
  const px = SIZE_PX[size]

  return (
    <span
      className={[
        'relative inline-flex shrink-0 items-center justify-center',
        glow && 'before:absolute before:inset-[-20%] before:rounded-full before:bg-gradient-to-br before:from-[rgba(255,105,180,0.35)] before:to-[rgba(168,85,247,0.25)] before:blur-md before:content-[""]',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <img
        src={BLOOM_LOGO_SRC}
        alt={alt}
        width={px}
        height={px}
        draggable={false}
        className="relative object-contain"
        style={{ width: px, height: px }}
      />
    </span>
  )
}
