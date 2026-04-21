import React, { useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useScroll, useTransform, useSpring } from 'framer-motion'
import {
  Zap, Brain, Trophy, Rocket, ChevronRight,
  Sparkles, ArrowRight, Lightbulb, Code, Target, Star
} from 'lucide-react'
import ParticleBackground from './ParticleBackground'
import { SplineScene } from '../components/SplineScene'
import NeuralNetwork3D from '../components/NeuralNetwork3D'


// ─── Components ───────────────────────────────────────────────────────────────

function Nav() {
  const navigate = useNavigate()
  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
      padding: '20px 48px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      background: 'rgba(10,10,15,0.7)',
      backdropFilter: 'blur(15px)',
      borderBottom: '1px solid rgba(255,255,255,0.05)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: 'linear-gradient(135deg, var(--neon-blue), var(--neon-purple))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 20px rgba(0, 212, 255, 0.3)',
        }}>
          <Sparkles size={16} color="white" />
        </div>
        <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em' }}>
          IdeaForge <span className="gradient-text">AI</span>
        </span>
      </div>

      <div className="magnetic-area">
        <button
          onClick={() => navigate('/dashboard')}
          className="btn-neon"
          style={{
            padding: '10px 24px', borderRadius: 100,
            fontSize: 14, fontWeight: 700,
            display: 'flex', alignItems: 'center', gap: 8,
          }}
        >
          <span>Get Started</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </nav>
  )
}

function SectionCard({ children, index, total, title, icon, color }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  })

  // Entrance and Sticky behavior
  const y = useTransform(scrollYProgress, [0, 0.4, 0.6, 1], [400, 0, 0, -100])
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 1])
  const scale = useTransform(scrollYProgress, [0, 0.1, 0.9, 1], [0.95, 1, 1, 0.95])
  const blur = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [20, 0, 0, 0])

  return (
    <section
      ref={ref}
      style={{
        height: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        zIndex: 10 + index,
        pointerEvents: 'none',
      }}
    >
      <motion.div
        style={{
          y, opacity, scale,
          filter: `blur(0px)`, // dynamic blur handled by motion div if needed
          width: '90%',
          maxWidth: 1000,
          pointerEvents: 'auto',
        }}
        className="glass-premium"
        initial={{ opacity: 0 }}
      >
        <div style={{
          padding: '60px 80px',
          borderRadius: 32,
          border: `1px solid ${color}10`,
          background: `radial-gradient(circle at top right, ${color}08, transparent 40%)`,
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Section Icon Glow */}
          <div style={{
            position: 'absolute', top: -40, right: -40,
            width: 200, height: 200,
            background: color, opacity: 0.05,
            filter: 'blur(60px)',
            borderRadius: '50%',
          }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
            <div style={{
              width: 52, height: 52, borderRadius: 16,
              background: `${color}15`, border: `1px solid ${color}30`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color,
            }}>
              {icon}
            </div>
            <div>
              <span style={{ fontSize: 12, fontWeight: 800, color, textTransform: 'uppercase', letterSpacing: '0.2em' }}>Phase 0{index + 1}</span>
              <h2 style={{ fontSize: 32, fontWeight: 800, color: 'white' }}>{title}</h2>
            </div>
          </div>

          <div style={{ position: 'relative', zIndex: 1 }}>
            {children}
          </div>
        </div>
      </motion.div>
    </section>
  )
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function LandingPage() {
  const navigate = useNavigate()
  const pageRef = useRef(null)

  const { scrollY } = useScroll()
  const heroOpacity = useTransform(scrollY, [0, 600], [1, 0])
  const heroScale = useTransform(scrollY, [0, 600], [1, 0.9])
  const heroBlur = useTransform(scrollY, [0, 600], [0, 10])

  // Fade in the neural network background as the user scrolls down
  const neuralBackgroundOpacity = useTransform(scrollY, [300, 800], [0, 1])

  return (
    <div style={{
      minHeight: '400vh',
      background: 'transparent',
      color: 'white',
      overflowX: 'hidden'
    }}>
      <motion.div
        style={{
          position: 'fixed', inset: 0, zIndex: -2,
          opacity: neuralBackgroundOpacity, pointerEvents: 'none'
        }}
      >
        <NeuralNetwork3D />
      </motion.div>

      <ParticleBackground />
      <Nav />

      {/* ── HERO (Fixed Position) ── */}
      <motion.section
        style={{
          position: 'fixed',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 0,
          opacity: heroOpacity,
          scale: heroScale,
          filter: `blur(0px)`, // Placeholder for blur transform
          background: 'rgba(5, 5, 10, 0.4)', // Added light overlay to hero area for depth
        }}
      >
        <div style={{ position: 'absolute', inset: 0, zIndex: -1 }}>
          <SplineScene scene="https://prod.spline.design/pACBeqJaH3K8WMIw/scene.splinecode" />
        </div>
        <div style={{ textAlign: 'center', maxWidth: 900, padding: '0 24px' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            style={{
              padding: '8px 20px',
              borderRadius: 100,
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 32,
            }}
          >
            <Sparkles size={14} color="#00d4ff" />
            <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.6)' }}>NEXT GEN HACKATHON ACCELERATOR</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: 'clamp(48px, 8vw, 96px)',
              fontWeight: 900,
              lineHeight: 0.95,
              letterSpacing: '-0.04em',
              marginBottom: 32,
            }}
          >
            FORGE IDEAS<br />
            <span className="gradient-text">BEYOND POSSIBLE</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            style={{
              fontSize: 20,
              color: 'rgba(255,255,255,0.5)',
              maxWidth: 600,
              margin: '0 auto 48px',
              lineHeight: 1.6,
            }}
          >
            An advanced AI engine to refine, validate, and pitch your hackathon concepts in real-time.
          </motion.p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 24, alignItems: 'center' }}>
            <div className="magnetic-area">
              <button
                onClick={() => navigate('/dashboard')}
                className="btn-neon"
                style={{
                  padding: '18px 48px',
                  borderRadius: 16,
                  fontSize: 18,
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <span>Initialize Forge</span>
                <ChevronRight size={24} />
              </button>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          style={{
            position: 'absolute', bottom: 40,
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
            opacity: 0.4
          }}
        >
          <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.3em', textTransform: 'uppercase' }}>Scroll</span>
          <div style={{ width: 1, height: 50, background: 'linear-gradient(to bottom, #00d4ff, transparent)' }} />
        </motion.div>
      </motion.section>

      {/* ── SCROLL SPACER FOR HERO ── */}
      <div style={{ height: '100vh' }} />

      {/* ── SECTION CARDS ── */}

      <SectionCard
        index={0}
        title="Thinking Mode"
        icon={<Brain size={32} />}
        color="#00d4ff"
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 60, alignItems: 'center' }}>
          <div>
            <p style={{ fontSize: 22, lineHeight: 1.6, color: 'rgba(255,255,255,0.7)', marginBottom: 32 }}>
              Our AI mentor doesn't just evaluate; it <span style={{ color: '#00d4ff', fontWeight: 700 }}>co-thinks</span> with you. By asking the most critical "missing" questions, it helps you uncover market gaps and technical bottlenecks before a single line of code is written.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {['Problem Clarity', 'Technical Feasibility', 'User Adoption'].map((tag, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#00d4ff20', border: '1px solid #00d4ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#00d4ff' }} />
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>{tag}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="glass" style={{ height: 300, borderRadius: 24, border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              style={{ width: 140, height: 140, borderRadius: '50%', border: '2px dashed #00d4ff30', position: 'relative' }}
            >
              <div style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', width: 24, height: 24, borderRadius: '50%', background: '#00d4ff', boxShadow: '0 0 20px #00d4ff' }} />
              <div style={{ position: 'absolute', inset: 30, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Brain size={48} color="#00d4ff" opacity={0.5} />
              </div>
            </motion.div>
          </div>
        </div>
      </SectionCard>

      <SectionCard
        index={1}
        title="AI Judge Panel"
        icon={<Trophy size={32} />}
        color="#7a5cff"
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
          {[
            { label: 'Technical', icon: <Code size={20} />, score: 85 },
            { label: 'Innovation', icon: <Star size={20} />, score: 92 },
            { label: 'Business', icon: <Target size={20} />, score: 78 }
          ].map((j, i) => (
            <div key={i} className="glass" style={{ padding: 24, borderRadius: 20, textAlign: 'center' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(122,92,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#7a5cff' }}>
                {j.icon}
              </div>
              <h4 style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, textTransform: 'uppercase', marginBottom: 8 }}>{j.label}</h4>
              <div style={{ fontSize: 32, fontWeight: 800, color: 'white' }}>{j.score}%</div>
            </div>
          ))}
        </div>
        <p style={{ marginTop: 40, fontSize: 18, color: 'rgba(255,255,255,0.5)', textAlign: 'center', maxWidth: 600, margin: '40px auto 0' }}>
          Real-time scoring based on hackathon criteria. Get brutal, honest, and high-quality feedback to iterate faster.
        </p>
      </SectionCard>

      <SectionCard
        index={2}
        title="Idea Improvement"
        icon={<Zap size={32} />}
        color="#f472b6"
      >
        <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
          <div className="glass" style={{ flex: 1, padding: 32, borderRadius: 24, borderLeft: '4px solid rgba(255,255,255,0.1)' }}>
            <h5 style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, textTransform: 'uppercase', marginBottom: 12 }}>Original Idea</h5>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.5)', fontStyle: 'italic' }}>"An app that helps users track their watering schedule for indoor plants..."</p>
          </div>
          <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 2 }}>
            <ArrowRight color="#f472b6" />
          </motion.div>
          <div className="glass" style={{ flex: 1.2, padding: 32, borderRadius: 24, borderLeft: '4px solid #f472b6' }}>
            <h5 style={{ color: '#f472b6', fontSize: 11, textTransform: 'uppercase', marginBottom: 12 }}>Enhanced Idea</h5>
            <p style={{ fontSize: 16, color: 'white', fontWeight: 500 }}>"An AI plant biometrics engine that analyzes leaf patterns to predict disease before it spreads."</p>
          </div>
        </div>
      </SectionCard>

      <SectionCard
        index={3}
        title="Pitch Generator"
        icon={<Rocket size={32} />}
        color="#10b981"
      >
        <div style={{ textAlign: 'center' }}>
          <h3 style={{ fontSize: 42, fontWeight: 900, color: 'white', marginBottom: 24 }}>READY FOR TAKEOFF</h3>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 20, marginBottom: 48, maxWidth: 600, margin: '0 auto 48px' }}>
            Transform your refined idea into a professional startup pitch deck including Problem Statement, Solution, Tech Stack, and Feature Roadmap.
          </p>
          <div className="magnetic-area">
            <button
              onClick={() => navigate('/dashboard')}
              className="btn-neon"
              style={{ padding: '20px 60px', borderRadius: 16, fontSize: 20, background: 'linear-gradient(135deg, #10b981, #00d4ff)' }}
            >
              Start Generating
            </button>
          </div>
        </div>
      </SectionCard>

      <div style={{ height: '20vh' }} />

      {/* ── FOOTER ── */}
      <footer style={{
        padding: '60px 48px',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        textAlign: 'center',
        background: 'rgba(10,10,15,0.8)',
        backdropFilter: 'blur(20px)',
      }}>
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 14 }}>© 2026 IdeaForge AI. Built for the next generation of builders.</p>
      </footer>
    </div>
  )
}

