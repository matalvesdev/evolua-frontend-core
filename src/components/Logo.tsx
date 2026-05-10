/**
 * Logo Evolua — alinhado ao brand-kit (docs/brand-kit.html)
 *
 * Lockup canônico: glyph graphic_eq (5 rects) + wordmark EVOLUA
 * Variante padrão: Mono Primary (purple, sem quad) — preferência da marca.
 *
 * Variantes:
 *  - 'primary'  ★  glyph + wordmark em primary (#6C63FF)         — fundos canvas/surface
 *  - 'dark'        glyph neon + wordmark white                    — fundos ink/deep
 *  - 'on-primary'  glyph white + wordmark white                   — fundo primary
 *  - 'mono-white'  glyph white + wordmark white                   — sobre fotos escuras
 *  - 'mono-ink'    glyph ink + wordmark ink                       — impressão p/b
 *  - 'quad'        glyph neon dentro de quad deep + wordmark ink  — apresentações
 */

type Variant = 'primary' | 'dark' | 'on-primary' | 'mono-white' | 'mono-ink' | 'quad'
type Size = 'sm' | 'md' | 'lg'

interface LogoProps {
  variant?: Variant
  size?: Size
  className?: string
  ariaLabel?: string
}

const SIZES: Record<Size, { glyph: number; text: string }> = {
  sm: { glyph: 24, text: '0.95rem' },
  md: { glyph: 32, text: '1.25rem' },
  lg: { glyph: 44, text: '1.75rem' },
}

interface Tone {
  glyph: string         // cor do graphic_eq
  word: string          // cor do wordmark
  quadFill?: string     // se houver quad atrás do glyph
}

const TONES: Record<Variant, Tone> = {
  primary:      { glyph: '#6C63FF', word: '#6C63FF' },
  dark:         { glyph: '#C4F135', word: '#FFFFFF' },
  'on-primary': { glyph: '#FFFFFF', word: '#FFFFFF' },
  'mono-white': { glyph: '#FFFFFF', word: '#FFFFFF' },
  'mono-ink':   { glyph: '#1A1A2E', word: '#1A1A2E' },
  quad:         { glyph: '#C4F135', word: '#1A1A2E', quadFill: '#2D2B55' },
}

export function Logo({
  variant = 'primary',
  size = 'md',
  className = '',
  ariaLabel = 'Evolua',
}: LogoProps) {
  const { glyph, text } = SIZES[size]
  const tone = TONES[variant]

  return (
    <div
      className={`inline-flex items-center gap-2.5 leading-none ${className}`}
      aria-label={ariaLabel}
      role="img"
    >
      <Glyph size={glyph} tone={tone} />
      <span
        className="font-display font-bold uppercase"
        style={{
          fontSize: text,
          letterSpacing: '0.12em',
          color: tone.word,
          lineHeight: 1,
        }}
      >
        EVOLUA
      </span>
    </div>
  )
}

/**
 * Glyph graphic_eq — pattern 17/58/83/58/17% conforme brand-kit (Phase E).
 * 5 rects verticais, viewBox 24×24, centralizadas em y=12.
 */
function Glyph({ size, tone }: { size: number; tone: Tone }) {
  const padding = tone.quadFill ? 4 : 0
  const inner = 24 - padding * 2

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      {tone.quadFill && (
        <rect x="0" y="0" width="24" height="24" rx="1" fill={tone.quadFill} />
      )}
      <g
        transform={padding ? `translate(${padding} ${padding}) scale(${inner / 24})` : undefined}
        fill={tone.glyph}
      >
        {/* coords idênticas ao symbolSVG() do brand-kit (5 rects, viewBox 24×24) */}
        <rect x="3"  y="10" width="2" height="4"  rx="1" />
        <rect x="7"  y="5"  width="2" height="14" rx="1" />
        <rect x="11" y="2"  width="2" height="20" rx="1" />
        <rect x="15" y="5"  width="2" height="14" rx="1" />
        <rect x="19" y="10" width="2" height="4"  rx="1" />
      </g>
    </svg>
  )
}

export default Logo
