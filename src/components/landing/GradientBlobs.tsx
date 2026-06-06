import { motion } from 'framer-motion'

type BlobConfig = {
  id: string
  color: string
  size: number
  top: string
  left: string
  duration: number
  delay: number
}

const BLOBS: BlobConfig[] = [
  {
    id: 'pink',
    color: 'rgba(255, 105, 180, 0.18)',
    size: 420,
    top: '-5%',
    left: '-8%',
    duration: 18,
    delay: 0,
  },
  {
    id: 'lavender',
    color: 'rgba(205, 180, 219, 0.14)',
    size: 380,
    top: '50%',
    left: '55%',
    duration: 22,
    delay: 2,
  },
  {
    id: 'purple',
    color: 'rgba(168, 85, 247, 0.12)',
    size: 480,
    top: '20%',
    left: '70%',
    duration: 20,
    delay: 1,
  },
  {
    id: 'blush',
    color: 'rgba(255, 200, 221, 0.1)',
    size: 300,
    top: '75%',
    left: '10%',
    duration: 16,
    delay: 3,
  },
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
            background: blob.color,
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

      {/* Soft vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_70%_at_50%_40%,transparent_0%,rgba(21,19,29,0.55)_100%)]" />
    </div>
  )
}
