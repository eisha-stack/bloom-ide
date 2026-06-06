import { motion } from 'framer-motion'

type BlobConfig = {
  id: string
  colorVar: string
  size: number
  top: string
  left: string
  duration: number
  delay: number
}

const BLOBS: BlobConfig[] = [
  { id: 'pink', colorVar: '--blob-pink', size: 420, top: '-5%', left: '-8%', duration: 18, delay: 0 },
  { id: 'lavender', colorVar: '--blob-lavender', size: 380, top: '50%', left: '55%', duration: 22, delay: 2 },
  { id: 'purple', colorVar: '--blob-purple', size: 480, top: '20%', left: '70%', duration: 20, delay: 1 },
  { id: 'blush', colorVar: '--blob-blush', size: 300, top: '75%', left: '10%', duration: 16, delay: 3 },
]

export function GradientBlobs() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {BLOBS.map((blob) => (
        <motion.div
          key={blob.id}
          className="absolute rounded-full blur-[80px]"
          style={{
            width: blob.size,
            height: blob.size,
            top: blob.top,
            left: blob.left,
            background: `var(${blob.colorVar})`,
          }}
          animate={{
            x: [0, 30, -20, 0],
            y: [0, -25, 15, 0],
            scale: [1, 1.08, 0.95, 1],
          }}
          transition={{
            duration: blob.duration,
            delay: blob.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}

      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 70% at 50% 40%, transparent 0%, color-mix(in srgb, var(--bg-primary) 55%, transparent) 100%)',
        }}
      />
    </div>
  )
}
