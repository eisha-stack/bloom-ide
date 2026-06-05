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
    color: 'rgba(255, 105, 180, 0.22)',
    size: 320,
    top: '10%',
    left: '5%',
    duration: 18,
    delay: 0,
  },
  {
    id: 'lavender',
    color: 'rgba(205, 180, 219, 0.18)',
    size: 280,
    top: '55%',
    left: '60%',
    duration: 22,
    delay: 2,
  },
  {
    id: 'purple',
    color: 'rgba(168, 85, 247, 0.15)',
    size: 360,
    top: '30%',
    left: '75%',
    duration: 20,
    delay: 1,
  },
  {
    id: 'blush',
    color: 'rgba(255, 200, 221, 0.12)',
    size: 240,
    top: '70%',
    left: '15%',
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
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(21,19,29,0.4)_70%)]" />
    </div>
  )
}
