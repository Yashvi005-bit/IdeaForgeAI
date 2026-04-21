import React, { useEffect, useRef, useState, useCallback } from 'react'

// ─── Canvas-based 3D Particle + Neural Network Engine ───────────────────────

function usePreloaderCanvas(canvasRef, progress) {
  const animRef = useRef(null)
  const stateRef = useRef({
    particles: [],
    nodes: [],
    connections: [],
    rings: [],
    streaks: [],
    scanY: 0,
    time: 0,
  })

  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const W = canvas.width = window.innerWidth
    const H = canvas.height = window.innerHeight
    const cx = W / 2
    const cy = H / 2
    const s = stateRef.current

    // ── Floating Particles ──
    s.particles = Array.from({ length: 180 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      z: Math.random() * 600 + 100,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      vz: (Math.random() - 0.5) * 0.5,
      r: Math.random() * 1.8 + 0.4,
      hue: Math.random() > 0.6 ? 195 : 260, // cyan vs purple
      alpha: Math.random() * 0.6 + 0.2,
    }))

    // ── Neural Network Nodes ──
    s.nodes = Array.from({ length: 24 }, () => ({
      x: cx + (Math.random() - 0.5) * W * 0.9,
      y: cy + (Math.random() - 0.5) * H * 0.85,
      birthTime: Math.random() * 200,
      life: 0,
      maxLife: 300 + Math.random() * 200,
      hue: Math.random() > 0.5 ? 195 : 270,
    }))

    // ── Rotating Rings (centered) ──
    s.rings = [
      { rx: 260, ry: 90, angleX: 0, angleY: 0, speedX: 0.003, speedY: 0.007, hue: 195, alpha: 0.35 },
      { rx: 190, ry: 60, angleX: 0.5, angleY: 1.0, speedX: -0.005, speedY: 0.004, hue: 270, alpha: 0.3 },
      { rx: 340, ry: 110, angleX: 1.0, angleY: 0.3, speedX: 0.004, speedY: -0.006, hue: 230, alpha: 0.2 },
    ]

    // ── Light Streaks ──
    s.streaks = Array.from({ length: 14 }, () => createStreak(W, H))

    s.scanY = -H
    s.time = 0
  }, [canvasRef])

  const createStreak = (W, H) => ({
    x: Math.random() * W,
    y: Math.random() * H - H,
    length: Math.random() * 120 + 40,
    speed: Math.random() * 4 + 2,
    alpha: Math.random() * 0.5 + 0.1,
    hue: Math.random() > 0.5 ? 195 : 260,
    width: Math.random() * 1.2 + 0.3,
  })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    initCanvas()

    const onResize = () => initCanvas()
    window.addEventListener('resize', onResize)

    const ctx = canvas.getContext('2d')

    const drawRing3D = (ctx, cx, cy, ring) => {
      const { rx, ry, angleX, angleY, hue, alpha } = ring
      const pts = 120
      ctx.beginPath()
      for (let i = 0; i <= pts; i++) {
        const t = (i / pts) * Math.PI * 2
        // Ellipse in 3D-ish projection
        const x3 = rx * Math.cos(t)
        const y3 = ry * Math.sin(t) * Math.cos(angleX) - rx * 0.15 * Math.sin(t) * Math.sin(angleX)
        const x2 = x3 * Math.cos(angleY) - y3 * Math.sin(angleY) * 0.2
        const y2 = y3 * Math.cos(angleX * 0.3)
        if (i === 0) ctx.moveTo(cx + x2, cy + y2)
        else ctx.lineTo(cx + x2, cy + y2)
      }
      ctx.closePath()
      ctx.strokeStyle = `hsla(${hue}, 100%, 65%, ${alpha})`
      ctx.lineWidth = 1.2
      ctx.shadowBlur = 15
      ctx.shadowColor = `hsla(${hue}, 100%, 65%, 0.6)`
      ctx.stroke()
      ctx.shadowBlur = 0
    }

    const draw = () => {
      const W = canvas.width
      const H = canvas.height
      const cx = W / 2
      const cy = H / 2
      const s = stateRef.current
      s.time++

      // Background
      ctx.fillStyle = 'rgba(4, 4, 12, 0.18)'
      ctx.fillRect(0, 0, W, H)

      // ── Radial ambient glow (center) ──
      const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, 420)
      grd.addColorStop(0, `rgba(0, 180, 255, 0.04)`)
      grd.addColorStop(0.5, `rgba(100, 60, 255, 0.025)`)
      grd.addColorStop(1, 'transparent')
      ctx.fillStyle = grd
      ctx.fillRect(0, 0, W, H)

      // ── Rings ──
      s.rings.forEach(ring => {
        ring.angleX += ring.speedX
        ring.angleY += ring.speedY
        drawRing3D(ctx, cx, cy, ring)
      })

      // ── Neural Network ──
      s.nodes.forEach((node, i) => {
        if (s.time < node.birthTime) return
        node.life = Math.min(node.life + 1, node.maxLife)
        const lifeFrac = node.life / node.maxLife
        const pulse = 0.5 + 0.5 * Math.sin(s.time * 0.04 + i)
        const nodeAlpha = lifeFrac < 0.1 ? lifeFrac * 10 : lifeFrac > 0.9 ? (1 - lifeFrac) * 10 : 1

        // Connections between nearby nodes
        s.nodes.forEach((other, j) => {
          if (j <= i || s.time < other.birthTime) return
          const dist = Math.hypot(node.x - other.x, node.y - other.y)
          if (dist < 220) {
            const linkAlpha = nodeAlpha * (1 - dist / 220) * 0.4
            ctx.beginPath()
            ctx.moveTo(node.x, node.y)
            ctx.lineTo(other.x, other.y)
            ctx.strokeStyle = `hsla(${node.hue}, 90%, 65%, ${linkAlpha})`
            ctx.lineWidth = 0.7
            ctx.stroke()
          }
        })

        // Node dot
        ctx.beginPath()
        ctx.arc(node.x, node.y, 2.5 * pulse, 0, Math.PI * 2)
        ctx.fillStyle = `hsla(${node.hue}, 100%, 70%, ${nodeAlpha * 0.9})`
        ctx.shadowBlur = 12
        ctx.shadowColor = `hsla(${node.hue}, 100%, 70%, 0.7)`
        ctx.fill()
        ctx.shadowBlur = 0

        // Reset dead nodes
        if (node.life >= node.maxLife) {
          node.x = cx + (Math.random() - 0.5) * W * 0.9
          node.y = cy + (Math.random() - 0.5) * H * 0.85
          node.life = 0
          node.birthTime = 0
          node.maxLife = 280 + Math.random() * 200
          node.hue = Math.random() > 0.5 ? 195 : 270
        }
      })

      // ── Particles ──
      s.particles.forEach(p => {
        const focalLength = 600
        const scale = focalLength / (focalLength + p.z)
        const px = cx + (p.x - cx) * scale
        const py = cy + (p.y - cy) * scale
        const pr = p.r * scale
        const pulse = 0.5 + 0.5 * Math.sin(s.time * 0.03 + p.x)

        ctx.beginPath()
        ctx.arc(px, py, pr, 0, Math.PI * 2)
        ctx.fillStyle = `hsla(${p.hue}, 100%, 70%, ${p.alpha * pulse})`
        ctx.shadowBlur = 8
        ctx.shadowColor = `hsla(${p.hue}, 100%, 70%, 0.5)`
        ctx.fill()
        ctx.shadowBlur = 0

        // Move
        p.x += p.vx
        p.y += p.vy
        p.z += p.vz
        if (p.x < 0) p.x = W
        if (p.x > W) p.x = 0
        if (p.y < 0) p.y = H
        if (p.y > H) p.y = 0
        if (p.z < 50 || p.z > 700) p.vz *= -1
      })

      // ── Light Streaks (falling) ──
      s.streaks.forEach((streak, i) => {
        const grad = ctx.createLinearGradient(streak.x, streak.y, streak.x, streak.y + streak.length)
        grad.addColorStop(0, `hsla(${streak.hue}, 100%, 70%, 0)`)
        grad.addColorStop(0.5, `hsla(${streak.hue}, 100%, 70%, ${streak.alpha})`)
        grad.addColorStop(1, `hsla(${streak.hue}, 100%, 70%, 0)`)
        ctx.beginPath()
        ctx.moveTo(streak.x, streak.y)
        ctx.lineTo(streak.x, streak.y + streak.length)
        ctx.strokeStyle = grad
        ctx.lineWidth = streak.width
        ctx.stroke()
        streak.y += streak.speed
        if (streak.y > H + streak.length) {
          s.streaks[i] = createStreak(W, H)
          s.streaks[i].y = -s.streaks[i].length
        }
      })

      // ── Subtle Scan Line ──
      s.scanY += 2.5
      if (s.scanY > H + 60) s.scanY = -60
      const scanGrad = ctx.createLinearGradient(0, s.scanY - 30, 0, s.scanY + 30)
      scanGrad.addColorStop(0, 'transparent')
      scanGrad.addColorStop(0.5, `rgba(0, 200, 255, 0.04)`)
      scanGrad.addColorStop(1, 'transparent')
      ctx.fillStyle = scanGrad
      ctx.fillRect(0, s.scanY - 30, W, 60)

      // ── Energy Wave on text center (synced to progress) ──
      const waveRadius = 60 + progress * 2.2
      const waveAlpha = 0.06 + 0.06 * Math.sin(s.time * 0.08)
      const waveGrd = ctx.createRadialGradient(cx, cy, waveRadius * 0.5, cx, cy, waveRadius + 80)
      waveGrd.addColorStop(0, `rgba(0,200,255,${waveAlpha})`)
      waveGrd.addColorStop(1, 'transparent')
      ctx.fillStyle = waveGrd
      ctx.fillRect(cx - waveRadius - 100, cy - waveRadius - 100, (waveRadius + 100) * 2, (waveRadius + 100) * 2)

      animRef.current = requestAnimationFrame(draw)
    }

    animRef.current = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(animRef.current)
      window.removeEventListener('resize', onResize)
    }
  }, [initCanvas, progress])
}

// ─── Letter Assembly Component ───────────────────────────────────────────────

const BRAND = 'IdeaForageAI'

function BrandText({ phase }) {
  // phase: 0=hidden, 1=assembling, 2=full glow, 3=surge
  const letters = BRAND.split('')
  return (
    <div style={{
      fontFamily: "'Outfit', 'Inter', sans-serif",
      fontSize: 'clamp(36px, 7vw, 88px)',
      fontWeight: 900,
      letterSpacing: '-0.02em',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      userSelect: 'none',
    }}>
      {/* 3D extrusion shadow layers */}
      {phase >= 1 && (
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'inherit',
          fontSize: 'inherit',
          fontWeight: 'inherit',
          letterSpacing: 'inherit',
          color: 'transparent',
          WebkitTextStroke: '1px rgba(0,180,255,0.08)',
          textShadow: `
            2px 2px 0 rgba(0,100,200,0.15),
            4px 4px 0 rgba(0,60,150,0.1),
            6px 6px 0 rgba(100,0,200,0.07)
          `,
          transform: 'translate(3px, 4px)',
          filter: 'blur(1px)',
          pointerEvents: 'none',
        }}>
          {BRAND}
        </div>
      )}

      {letters.map((char, i) => {
        const delay = i * 80
        const isAssembled = phase >= 1
        const charFrac = Math.max(0, (phase - 1) * 10 - i * 0.18)
        const opacity = phase === 0 ? 0 : Math.min(1, charFrac)
        const translateY = phase === 0 ? 40 : Math.max(0, 40 - charFrac * 40)
        const scale = phase === 0 ? 0.6 : Math.min(1, 0.6 + charFrac * 0.4)

        // Color: gradient across letters
        const frac = i / (letters.length - 1)
        const hue = 195 + frac * 70 // cyan to purple
        const isSurge = phase >= 3

        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              opacity,
              transform: `translateY(${translateY}px) scale(${scale})`,
              transition: `opacity 0.5s ${delay}ms cubic-bezier(0.22,1,0.36,1), transform 0.6s ${delay}ms cubic-bezier(0.22,1,0.36,1)`,
              background: isSurge
                ? `linear-gradient(135deg, #fff 0%, #00e5ff 40%, #a855f7 100%)`
                : `linear-gradient(135deg, hsl(${hue},100%,75%) 0%, hsl(${hue + 30},90%,65%) 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              textShadow: 'none',
              filter: isSurge
                ? `drop-shadow(0 0 30px rgba(0,200,255,0.9)) drop-shadow(0 0 60px rgba(168,85,247,0.7))`
                : `drop-shadow(0 0 ${8 + Math.random() * 4}px hsla(${hue},100%,65%,0.7))`,
              willChange: 'transform, opacity',
            }}
          >
            {char}
          </span>
        )
      })}
    </div>
  )
}

// ─── Circular Progress Ring ──────────────────────────────────────────────────

function ProgressRing({ progress, phase }) {
  const size = 220
  const stroke = 2.5
  const r = (size - stroke * 2) / 2
  const circ = 2 * Math.PI * r
  const dash = circ * Math.min(1, progress / 100)
  const gap = circ - dash

  return (
    <div style={{ position: 'relative', width: size, height: size, margin: '0 auto' }}>
      {/* Outer glow ring */}
      <svg width={size} height={size} style={{ position: 'absolute', top: 0, left: 0, transform: 'rotate(-90deg)' }}>
        {/* Track */}
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none"
          stroke="rgba(0,200,255,0.06)"
          strokeWidth={stroke}
        />
        {/* Progress arc */}
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none"
          stroke="url(#ringGrad)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${gap}`}
          style={{ transition: 'stroke-dasharray 0.3s ease', filter: 'drop-shadow(0 0 8px rgba(0,200,255,0.8))' }}
        />
        <defs>
          <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00e5ff" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
        </defs>
      </svg>

      {/* Inner spinning dashes */}
      <svg width={size} height={size} style={{
        position: 'absolute', top: 0, left: 0,
        animation: 'preloader-spin 8s linear infinite',
        opacity: 0.4,
      }}>
        {Array.from({ length: 16 }, (_, i) => {
          const angle = (i / 16) * Math.PI * 2 - Math.PI / 2
          const ir = r - 14
          return (
            <circle
              key={i}
              cx={size / 2 + ir * Math.cos(angle)}
              cy={size / 2 + ir * Math.sin(angle)}
              r={1.2}
              fill={i % 3 === 0 ? '#00e5ff' : 'rgba(168,85,247,0.5)'}
            />
          )
        })}
      </svg>

      {/* Center percentage */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{
          fontFamily: "'Outfit', sans-serif",
          fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em',
          background: 'linear-gradient(135deg, #00e5ff, #a855f7)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>
          {Math.round(progress)}%
        </span>
      </div>
    </div>
  )
}

// ─── Glitch / Pulse dots ─────────────────────────────────────────────────────

function StatusDots() {
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'center' }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          width: 5, height: 5, borderRadius: '50%',
          background: i === 0 ? '#00e5ff' : i === 1 ? '#7a5cff' : '#a855f7',
          animation: `preloader-dot 1.5s ease-in-out ${i * 0.25}s infinite`,
          boxShadow: `0 0 10px ${i === 0 ? '#00e5ff' : i === 1 ? '#7a5cff' : '#a855f7'}`,
        }} />
      ))}
    </div>
  )
}

// ─── Main Preloader Component ────────────────────────────────────────────────

export default function PreloaderScreen({ onComplete }) {
  const canvasRef = useRef(null)
  const [progress, setProgress] = useState(0)
  const [phase, setPhase] = useState(0) // 0=init, 1=assembling, 2=loaded, 3=surge, 4=fadeout
  const [opacity, setOpacity] = useState(1)
  const progressRef = useRef(0)
  const phaseRef = useRef(0)

  usePreloaderCanvas(canvasRef, progressRef.current)

  useEffect(() => {
    let rafId
    let startTime = null

    // Duration: 3.5s total loading simulation
    const TOTAL_DURATION = 3500

    const tick = (ts) => {
      if (!startTime) startTime = ts
      const elapsed = ts - startTime

      // Ease-in-out progress curve
      let t = Math.min(elapsed / TOTAL_DURATION, 1)
      // Smooth cubic easing
      t = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
      const p = t * 100
      progressRef.current = p
      setProgress(p)

      // Phase transitions
      if (phaseRef.current === 0 && elapsed > 200) {
        phaseRef.current = 1
        setPhase(1) // start assembling letters
      }
      if (phaseRef.current === 1 && p >= 100) {
        phaseRef.current = 2
        setPhase(2) // full display
      }
      if (phaseRef.current === 2 && elapsed > TOTAL_DURATION + 300) {
        phaseRef.current = 3
        setPhase(3) // surge flash
      }
      if (phaseRef.current === 3 && elapsed > TOTAL_DURATION + 700) {
        phaseRef.current = 4
        setPhase(4) // fade out
        setOpacity(0)
        setTimeout(() => onComplete?.(), 900)
        return
      }

      rafId = requestAnimationFrame(tick)
    }

    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [onComplete])

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'radial-gradient(ellipse at 50% 40%, #050520 0%, #03030e 60%, #000000 100%)',
      opacity,
      transition: opacity === 0 ? 'opacity 0.85s cubic-bezier(0.4,0,0.2,1)' : 'none',
      overflow: 'hidden',
    }}>
      {/* Canvas background */}
      <canvas ref={canvasRef} style={{
        position: 'absolute', inset: 0,
        width: '100%', height: '100%',
        pointerEvents: 'none',
      }} />

      {/* Surge flash overlay */}
      {phase === 3 && (
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at center, rgba(0,200,255,0.18) 0%, transparent 70%)',
          animation: 'preloader-surge 0.5s ease-out forwards',
          pointerEvents: 'none',
          zIndex: 2,
        }} />
      )}

      {/* Content */}
      <div style={{
        position: 'relative', zIndex: 3,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', gap: 40,
        padding: '0 24px',
        textAlign: 'center',
      }}>
        {/* Glassmorphism card behind text */}
        <div style={{
          position: 'absolute',
          inset: '-40px -60px',
          background: 'rgba(0, 150, 255, 0.025)',
          backdropFilter: 'blur(2px)',
          borderRadius: 40,
          border: '1px solid rgba(0,200,255,0.07)',
          boxShadow: '0 0 120px rgba(0,150,255,0.06), inset 0 0 60px rgba(0,100,200,0.03)',
          pointerEvents: 'none',
        }} />

        {/* Brand Text */}
        <div style={{ position: 'relative' }}>
          {/* Holographic shimmer behind text */}
          <div style={{
            position: 'absolute',
            top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '110%', height: '200%',
            background: 'linear-gradient(135deg, transparent 30%, rgba(0,200,255,0.04) 50%, transparent 70%)',
            backgroundSize: '200% 200%',
            animation: 'preloader-shimmer 3s ease-in-out infinite',
            pointerEvents: 'none',
            borderRadius: 20,
          }} />
          <BrandText phase={phase} />
        </div>

        {/* Progress Ring */}
        <div style={{
          opacity: phase >= 1 ? 1 : 0,
          transform: phase >= 1 ? 'scale(1)' : 'scale(0.8)',
          transition: 'opacity 0.6s ease, transform 0.6s ease',
        }}>
          <ProgressRing progress={progress} phase={phase} />
        </div>

        {/* Status Dots */}
        <div style={{
          opacity: phase >= 1 ? 1 : 0,
          transition: 'opacity 0.5s 0.3s ease',
        }}>
          <StatusDots />
        </div>
      </div>

      {/* CSS keyframes injected inline */}
      <style>{`
        @keyframes preloader-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes preloader-dot {
          0%, 80%, 100% { transform: scale(0.5); opacity: 0.3; }
          40%            { transform: scale(1.3); opacity: 1;   }
        }
        @keyframes preloader-shimmer {
          0%   { background-position: 200% 200%; }
          100% { background-position: -200% -200%; }
        }
        @keyframes preloader-surge {
          0%   { opacity: 0; transform: scale(0.8); }
          30%  { opacity: 1; transform: scale(1.1); }
          100% { opacity: 0; transform: scale(1.4); }
        }
      `}</style>
    </div>
  )
}
