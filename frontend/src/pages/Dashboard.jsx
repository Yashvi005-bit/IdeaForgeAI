import React, { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Sparkles, Brain, Trophy, Zap, Rocket, Copy, CheckCircle,
  ChevronRight, ChevronLeft, ArrowLeft, Lightbulb, Target,
  Code, Users, Clock, Star, RefreshCw, Check
} from 'lucide-react'

// Determine API base: Use localhost for development, Render for production
const API_BASE = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? 'http://localhost:5000/api'
  : 'https://idea-forage-backend.onrender.com/api'

// ─── Reusable UI ─────────────────────────────────────────────────────────────

function LoadingDots() {
  return (
    <div className="loading-dots" style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
      <span /><span /><span />
    </div>
  )
}

function GlassCard({ children, style = {}, className = '', glow = '' }) {
  const glowStyle = glow === 'blue'
    ? { border: '1px solid rgba(0,212,255,0.2)', boxShadow: '0 0 40px rgba(0,212,255,0.06)' }
    : glow === 'purple'
      ? { border: '1px solid rgba(168,85,247,0.2)', boxShadow: '0 0 40px rgba(168,85,247,0.06)' }
      : {}
  return (
    <div className={`glass ${className}`}
      style={{
        borderRadius: 20,
        padding: '32px',
        ...glowStyle,
        ...style,
      }}>
      {children}
    </div>
  )
}

function SectionHeader({ icon, label, color = '#00d4ff', step }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
      {step && (
        <div style={{
          width: 32, height: 32, borderRadius: 10,
          background: `linear-gradient(135deg, ${color}30, ${color}10)`,
          border: `1px solid ${color}40`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 12, fontWeight: 700, color,
        }}>{step}</div>
      )}
      <div style={{
        width: 44, height: 44, borderRadius: 12,
        background: `${color}15`,
        border: `1px solid ${color}30`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color,
      }}>
        {icon}
      </div>
      <h2 style={{
        fontFamily: "'Outfit', sans-serif",
        fontSize: 22,
        fontWeight: 700,
        color: 'white',
        margin: 0,
      }}>{label}</h2>
    </div>
  )
}

function ScoreBar({ score, color }) {
  const [width, setWidth] = React.useState(0)
  React.useEffect(() => {
    setTimeout(() => setWidth(score), 100)
  }, [score])
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div className="score-bar" style={{ flex: 1 }}>
        <div
          className="score-bar-fill"
          style={{
            width: `${width}%`,
            background: `linear-gradient(90deg, ${color}80, ${color})`,
          }}
        />
      </div>
      <span style={{ color, fontWeight: 700, fontSize: 15, minWidth: 36 }}>{score}</span>
    </div>
  )
}

function CopyButton({ text, label = 'Copy' }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback
      const el = document.createElement('textarea')
      el.value = text
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }
  return (
    <button
      id="copy-btn"
      onClick={handleCopy}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '8px 18px', borderRadius: 10,
        background: copied ? 'rgba(16,185,129,0.15)' : 'rgba(0,212,255,0.1)',
        border: `1px solid ${copied ? 'rgba(16,185,129,0.4)' : 'rgba(0,212,255,0.3)'}`,
        color: copied ? '#10b981' : '#00d4ff',
        fontSize: 13, fontWeight: 600,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      }}
    >
      {copied ? <Check size={14} /> : <Copy size={14} />}
      {copied ? 'Copied!' : label}
    </button>
  )
}

// ─── Phase Components ─────────────────────────────────────────────────────────

function IdeaInput({ onSubmit, loading }) {
  const [idea, setIdea] = useState('')

  return (
    <GlassCard glow="blue" style={{ maxWidth: 760, margin: '0 auto' }}>
      <SectionHeader icon={<Lightbulb size={22} />} label="Your Idea" color="#00d4ff" step="1" />

      <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 15, marginBottom: 20, lineHeight: 1.6 }}>
        Describe your hackathon idea. Don't worry about perfection — our AI will guide you through refining it.
      </p>

      <textarea
        id="idea-textarea"
        value={idea}
        onChange={e => setIdea(e.target.value)}
        placeholder="e.g. An app that uses AI to match volunteers with local NGOs based on skills and availability..."
        style={{
          width: '100%',
          minHeight: 160,
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 14,
          padding: '18px 20px',
          color: 'white',
          fontSize: 15,
          lineHeight: 1.7,
          resize: 'vertical',
          fontFamily: "'Inter', sans-serif",
          transition: 'border-color 0.2s ease',
        }}
      />

      <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end' }}>
        <div className="magnetic-area">
          <button
            id="start-thinking-btn"
            onClick={() => idea.trim() && onSubmit(idea.trim())}
            disabled={loading || !idea.trim()}
            className="btn-neon"
            style={{
              padding: '14px 32px',
              borderRadius: 12,
              fontSize: 15, fontWeight: 700,
              display: 'flex', alignItems: 'center', gap: 10,
              opacity: !idea.trim() ? 0.5 : 1,
              cursor: !idea.trim() ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? (
              <><LoadingDots /><span style={{ position: 'relative', zIndex: 1 }}>Analyzing...</span></>
            ) : (
              <><Brain size={18} style={{ position: 'relative', zIndex: 1 }} /><span style={{ position: 'relative', zIndex: 1 }}>Start Thinking</span></>
            )}
          </button>
        </div>
      </div>
    </GlassCard>
  )
}

function ThinkingMode({ questions, onSubmit, loading, idea }) {
  const [answers, setAnswers] = useState({})

  const handleSubmit = () => {
    const answersText = questions
      .map((q, i) => `Q: ${q}\nA: ${answers[i] || '(skipped)'}`)
      .join('\n\n')
    onSubmit(answersText)
  }

  return (
    <GlassCard glow="purple" style={{ maxWidth: 760, margin: '0 auto' }}>
      <SectionHeader icon={<Brain size={22} />} label="Thinking Mode" color="#a855f7" step="2" />

      <div style={{
        padding: '12px 16px',
        borderRadius: 10,
        background: 'rgba(168,85,247,0.08)',
        border: '1px solid rgba(168,85,247,0.2)',
        marginBottom: 28,
        fontSize: 14,
        color: 'rgba(255,255,255,0.6)',
        lineHeight: 1.5,
      }}>
        💡 Idea: <span style={{ color: 'rgba(255,255,255,0.85)' }}>{idea}</span>
      </div>

      <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 14, marginBottom: 24 }}>
        Answer these questions to help our AI understand your idea better. You can skip any.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {questions.map((q, i) => (
          <div key={i}>
            <label style={{
              display: 'block',
              color: 'rgba(255,255,255,0.85)',
              fontSize: 14,
              fontWeight: 500,
              marginBottom: 8,
              lineHeight: 1.5,
            }}>
              <span style={{ color: '#a855f7', fontWeight: 700, marginRight: 6 }}>Q{i + 1}.</span>
              {q}
            </label>
            <textarea
              id={`answer-${i}`}
              value={answers[i] || ''}
              onChange={e => setAnswers(prev => ({ ...prev, [i]: e.target.value }))}
              placeholder="Your thoughts..."
              style={{
                width: '100%',
                minHeight: 70,
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.09)',
                borderRadius: 10,
                padding: '12px 16px',
                color: 'white',
                fontSize: 14,
                lineHeight: 1.6,
                resize: 'vertical',
                fontFamily: "'Inter', sans-serif",
              }}
            />
          </div>
        ))}
      </div>

      <div style={{ marginTop: 28, display: 'flex', justifyContent: 'flex-end' }}>
        <div className="magnetic-area">
          <button
            id="get-judged-btn"
            onClick={handleSubmit}
            disabled={loading}
            className="btn-neon"
            style={{
              padding: '14px 32px',
              borderRadius: 12,
              fontSize: 15, fontWeight: 700,
              display: 'flex', alignItems: 'center', gap: 10,
            }}
          >
            {loading ? (
              <><LoadingDots /><span style={{ position: 'relative', zIndex: 1 }}>Evaluating...</span></>
            ) : (
              <><Trophy size={18} style={{ position: 'relative', zIndex: 1 }} /><span style={{ position: 'relative', zIndex: 1 }}>Get Judged</span></>
            )}
          </button>
        </div>
      </div>
    </GlassCard>
  )
}

const JUDGES = [
  { key: 'technical', label: 'Technical Judge', icon: <Code size={20} />, color: '#00d4ff', desc: 'Feasibility & architecture' },
  { key: 'innovation', label: 'Innovation Judge', icon: <Star size={20} />, color: '#a855f7', desc: 'Creativity & uniqueness' },
  { key: 'business', label: 'Business Judge', icon: <Target size={20} />, color: '#f472b6', desc: 'Market fit & viability' },
]

function JudgePanel({ evaluation, onNext, loading }) {
  const avg = Math.round(
    (evaluation.technical.score + evaluation.innovation.score + evaluation.business.score) / 3
  )

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <GlassCard style={{ marginBottom: 24, textAlign: 'center' }} glow="blue">
        <div style={{ marginBottom: 6 }}>
          <span style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: 56,
            fontWeight: 900,
            background: avg >= 70
              ? 'linear-gradient(135deg, #10b981, #00d4ff)'
              : avg >= 50
                ? 'linear-gradient(135deg, #f59e0b, #a855f7)'
                : 'linear-gradient(135deg, #ef4444, #f472b6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>{avg}</span>
          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 22, marginLeft: 4 }}>/100</span>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, margin: 0 }}>Overall Score</p>
      </GlassCard>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20, marginBottom: 24 }}>
        {JUDGES.map(({ key, label, icon, color, desc }) => (
          <GlassCard key={key} style={{ padding: '28px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{
                width: 42, height: 42, borderRadius: 12,
                background: `${color}18`, border: `1px solid ${color}30`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color,
              }}>
                {icon}
              </div>
              <div>
                <div style={{ color: 'white', fontWeight: 700, fontSize: 15 }}>{label}</div>
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>{desc}</div>
              </div>
            </div>
            <ScoreBar score={evaluation[key].score} color={color} />
            <p style={{
              color: 'rgba(255,255,255,0.6)',
              fontSize: 13,
              lineHeight: 1.65,
              marginTop: 14,
              marginBottom: 0,
            }}>
              {evaluation[key].feedback}
            </p>
          </GlassCard>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <div className="magnetic-area">
          <button
            id="improve-idea-btn"
            onClick={onNext}
            disabled={loading}
            className="btn-neon"
            style={{ padding: '14px 32px', borderRadius: 12, fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 10 }}
          >
            {loading ? (
              <><LoadingDots /><span style={{ position: 'relative', zIndex: 1 }}>Improving...</span></>
            ) : (
              <><Zap size={18} style={{ position: 'relative', zIndex: 1 }} /><span style={{ position: 'relative', zIndex: 1 }}>Improve My Idea</span></>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

function IdeaImprovement({ improvement, onNext, loading }) {
  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <GlassCard style={{ marginBottom: 20 }}>
        <SectionHeader icon={<RefreshCw size={22} />} label="Original Idea" color="rgba(255,255,255,0.4)" step="4" />
        <p style={{
          color: 'rgba(255,255,255,0.55)',
          fontSize: 15,
          lineHeight: 1.7,
          fontStyle: 'italic',
          margin: 0,
        }}>
          "{improvement.originalIdea}"
        </p>
      </GlassCard>

      <GlassCard glow="blue" style={{ marginBottom: 20 }}>
        <SectionHeader icon={<Zap size={22} />} label="Enhanced Idea" color="#00d4ff" />
        <p style={{
          color: 'rgba(255,255,255,0.85)',
          fontSize: 15,
          lineHeight: 1.75,
          marginBottom: 24,
        }}>
          {improvement.improvedIdea}
        </p>

        {improvement.keyImprovements?.length > 0 && (
          <>
            <h4 style={{ color: '#00d4ff', fontSize: 13, fontWeight: 600, marginBottom: 12, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Key Improvements
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {improvement.keyImprovements.map((imp, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'flex-start', gap: 10,
                  padding: '10px 14px',
                  borderRadius: 10,
                  background: 'rgba(0,212,255,0.06)',
                  border: '1px solid rgba(0,212,255,0.1)',
                }}>
                  <CheckCircle size={16} color="#00d4ff" style={{ marginTop: 2, flexShrink: 0 }} />
                  <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14, lineHeight: 1.5 }}>{imp}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </GlassCard>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <div className="magnetic-area">
          <button
            id="generate-pitch-btn"
            onClick={onNext}
            disabled={loading}
            className="btn-neon"
            style={{ padding: '14px 32px', borderRadius: 12, fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 10 }}
          >
            {loading ? (
              <><LoadingDots /><span style={{ position: 'relative', zIndex: 1 }}>Generating...</span></>
            ) : (
              <><Rocket size={18} style={{ position: 'relative', zIndex: 1 }} /><span style={{ position: 'relative', zIndex: 1 }}>Generate Pitch</span></>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

function PitchGenerator({ pitch }) {
  const fullPitchText = `
🚀 IDEA PITCH

📌 Problem:
${pitch.problem}

💡 Solution:
${pitch.solution}

✨ Features:
${pitch.features?.map(f => `• ${f}`).join('\n')}

👥 Target Users:
${pitch.targetUsers}

🛠 Tech Stack:
${pitch.techStack?.join(', ')}

🎤 30-Second Pitch:
${pitch.pitch}
  `.trim()

  const blocks = [
    { icon: <Target size={18} />, label: 'Problem', color: '#ef4444', content: pitch.problem },
    { icon: <Lightbulb size={18} />, label: 'Solution', color: '#00d4ff', content: pitch.solution },
    { icon: <Users size={18} />, label: 'Target Users', color: '#10b981', content: pitch.targetUsers },
  ]

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <GlassCard style={{ marginBottom: 20, textAlign: 'center', padding: '20px 32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 8 }}>
          <Rocket size={24} color="#a855f7" />
          <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 24, fontWeight: 800, color: 'white', margin: 0 }}>
            Your Pitch is Ready!
          </h2>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14, margin: 0 }}>
          A complete startup pitch generated for your idea
        </p>
      </GlassCard>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16, marginBottom: 16 }}>
        {blocks.map(({ icon, label, color, content }) => (
          <GlassCard key={label} style={{ padding: '22px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: `${color}18`, border: `1px solid ${color}30`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color,
              }}>{icon}</div>
              <span style={{ color, fontWeight: 700, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14, lineHeight: 1.65, margin: 0 }}>{content}</p>
          </GlassCard>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* Features */}
        <GlassCard style={{ padding: '22px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'rgba(168,85,247,0.18)', border: '1px solid rgba(168,85,247,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#a855f7',
            }}><Star size={16} /></div>
            <span style={{ color: '#a855f7', fontWeight: 700, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Features</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {pitch.features?.map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <Check size={14} color="#a855f7" style={{ marginTop: 2, flexShrink: 0 }} />
                <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, lineHeight: 1.5 }}>{f}</span>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Tech Stack */}
        <GlassCard style={{ padding: '22px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'rgba(0,212,255,0.18)', border: '1px solid rgba(0,212,255,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#00d4ff',
            }}><Code size={16} /></div>
            <span style={{ color: '#00d4ff', fontWeight: 700, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tech Stack</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {pitch.techStack?.map((tech, i) => (
              <span key={i} style={{
                padding: '5px 12px', borderRadius: 100,
                background: 'rgba(0,212,255,0.08)',
                border: '1px solid rgba(0,212,255,0.2)',
                color: '#00d4ff',
                fontSize: 12, fontWeight: 600,
              }}>{tech}</span>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* 30-sec Pitch */}
      <GlassCard glow="purple" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'rgba(168,85,247,0.15)',
              border: '1px solid rgba(168,85,247,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#a855f7',
            }}><Clock size={18} /></div>
            <span style={{ color: 'white', fontWeight: 700, fontSize: 16 }}>30-Second Pitch</span>
          </div>
          <CopyButton text={pitch.pitch} label="Copy Pitch" />
        </div>
        <p style={{
          color: 'rgba(255,255,255,0.85)',
          fontSize: 15,
          lineHeight: 1.8,
          fontStyle: 'italic',
          margin: 0,
          padding: '16px 20px',
          borderRadius: 12,
          background: 'rgba(168,85,247,0.06)',
          border: '1px solid rgba(168,85,247,0.1)',
        }}>
          "{pitch.pitch}"
        </p>
      </GlassCard>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <CopyButton text={fullPitchText} label="Copy Full Pitch" />
      </div>
    </div>
  )
}

// ─── Progress Steps ───────────────────────────────────────────────────────────

const STEP_CONFIG = [
  { label: 'Idea', icon: <Lightbulb size={16} /> },
  { label: 'Thinking', icon: <Brain size={16} /> },
  { label: 'Judges', icon: <Trophy size={16} /> },
  { label: 'Improve', icon: <Zap size={16} /> },
  { label: 'Pitch', icon: <Rocket size={16} /> },
]

function ProgressBar({ currentStep }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 48, overflowX: 'auto', paddingBottom: 4 }}>
      {STEP_CONFIG.map((step, i) => {
        const done = i < currentStep
        const active = i === currentStep
        const color = active ? '#00d4ff' : done ? '#10b981' : 'rgba(255,255,255,0.25)'
        return (
          <React.Fragment key={i}>
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              gap: 8, minWidth: 80,
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: '50%',
                background: active ? 'linear-gradient(135deg, #00d4ff, #a855f7)' : done ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.06)',
                border: `2px solid ${color}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: done ? '#10b981' : active ? 'white' : 'rgba(255,255,255,0.3)',
                transition: 'all 0.3s ease',
                boxShadow: active ? '0 0 20px rgba(0,212,255,0.4)' : 'none',
              }}>
                {done ? <Check size={16} /> : step.icon}
              </div>
              <span style={{
                fontSize: 11, fontWeight: 600,
                color: active ? '#00d4ff' : done ? '#10b981' : 'rgba(255,255,255,0.3)',
                textTransform: 'uppercase', letterSpacing: '0.05em',
                whiteSpace: 'nowrap',
              }}>{step.label}</span>
            </div>
            {i < STEP_CONFIG.length - 1 && (
              <div style={{
                flex: 1, height: 2,
                background: done ? '#10b981' : 'rgba(255,255,255,0.07)',
                margin: '0 4px',
                marginBottom: 24,
                transition: 'background 0.5s ease',
                minWidth: 20,
              }} />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}

// ─── Error Toast ──────────────────────────────────────────────────────────────

function ErrorToast({ message, onClose }) {
  if (!message) return null
  return (
    <div style={{
      position: 'fixed', bottom: 32, right: 32, zIndex: 1000,
      padding: '14px 20px',
      borderRadius: 14,
      background: 'rgba(239,68,68,0.15)',
      border: '1px solid rgba(239,68,68,0.4)',
      WebkitBackdropFilter: 'blur(20px)',
      backdropFilter: 'blur(20px)',
      color: '#fca5a5',
      fontSize: 14, fontWeight: 500,
      maxWidth: 380,
      display: 'flex', alignItems: 'center', gap: 10,
      animation: 'fadeInUp 0.3s ease',
    }}>
      <span>⚠️ {message}</span>
      <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#fca5a5', cursor: 'pointer', padding: 0, fontSize: 18, lineHeight: 1 }}>×</button>
    </div>
  )
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function Dashboard() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)       // 0=idea, 1=thinking, 2=judges, 3=improve, 4=pitch
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [idea, setIdea] = useState('')
  const [questions, setQuestions] = useState([])
  const [evaluation, setEvaluation] = useState(null)
  const [improvement, setImprovement] = useState(null)
  const [pitch, setPitch] = useState(null)
  const [answers, setAnswers] = useState('')

  const topRef = useRef(null)
  const scrollTop = () => topRef.current?.scrollIntoView({ behavior: 'smooth' })

  const callApi = async (endpoint, body) => {
    const res = await fetch(`${API_BASE}/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.error || `Server error: ${res.status}`)
    }
    return res.json()
  }

  const handleIdeaSubmit = async (submittedIdea) => {
    setIdea(submittedIdea)
    setLoading(true)
    setError('')
    try {
      const data = await callApi('thinking', { idea: submittedIdea })
      setQuestions(data.questions || [])
      setStep(1)
      scrollTop()
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const handleThinkingSubmit = async (answersText) => {
    setAnswers(answersText)
    setLoading(true)
    setError('')
    try {
      const data = await callApi('judge', { idea, answers: answersText })
      setEvaluation(data)
      setStep(2)
      scrollTop()
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const handleImprove = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await callApi('improve', { idea, answers })
      setImprovement(data)
      setStep(3)
      scrollTop()
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const handlePitch = async () => {
    setLoading(true)
    setError('')
    try {
      const ideaToUse = improvement?.improvedIdea || idea
      const data = await callApi('pitch', { idea: ideaToUse })
      setPitch(data)
      setStep(4)
      scrollTop()
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const resetAll = () => {
    setStep(0); setIdea(''); setQuestions([]); setEvaluation(null)
    setImprovement(null); setPitch(null); setAnswers(''); setError('')
    scrollTop()
  }

  return (
    <div style={{ minHeight: '100vh', background: '#030712', fontFamily: "'Inter', sans-serif" }}>
      {/* Ambient orbs */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        background: 'radial-gradient(ellipse at 10% 20%, rgba(0,212,255,0.06) 0%, transparent 40%), radial-gradient(ellipse at 90% 80%, rgba(168,85,247,0.06) 0%, transparent 40%)',
      }} />

      {/* ── NAV ── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        padding: '14px 32px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'rgba(3,7,18,0.9)',
        WebkitBackdropFilter: 'blur(20px)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            id="back-to-home-btn"
            onClick={() => navigate('/')}
            style={{
              background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 14,
              transition: 'color 0.2s ease', padding: 0,
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'white'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
          >
            <ArrowLeft size={16} />
            <span>Home</span>
          </button>

          <span style={{ color: 'rgba(255,255,255,0.15)', margin: '0 8px' }}>|</span>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 8,
              background: 'linear-gradient(135deg, #00d4ff, #a855f7)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Sparkles size={14} color="white" />
            </div>
            <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 17, fontWeight: 700, color: 'white' }}>
              IdeaForge <span style={{ color: '#00d4ff' }}>AI</span>
            </span>
          </div>
        </div>

        <button
          id="new-idea-btn"
          onClick={resetAll}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 16px', borderRadius: 10,
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: 'rgba(255,255,255,0.6)',
            fontSize: 13, fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'white' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)' }}
        >
          <RefreshCw size={14} />
          New Idea
        </button>
      </nav>

      {/* ── MAIN ── */}
      <main style={{ maxWidth: 1000, margin: '0 auto', padding: '48px 24px 80px' }}>
        <div ref={topRef} />

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h1 style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: 'clamp(28px, 4vw, 42px)',
            fontWeight: 800, color: 'white',
            marginBottom: 10,
          }}>
            <span className="gradient-text">Forge</span> Your Idea
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 15 }}>
            AI-guided journey from raw concept to winning pitch
          </p>
        </div>

        {/* Progress */}
        <ProgressBar currentStep={step} />

        {/* Phase Content */}
        <div className="animate-fade-in-up" key={step}>
          {step === 0 && (
            <IdeaInput onSubmit={handleIdeaSubmit} loading={loading} />
          )}
          {step === 1 && questions.length > 0 && (
            <ThinkingMode
              questions={questions}
              onSubmit={handleThinkingSubmit}
              loading={loading}
              idea={idea}
            />
          )}
          {step === 2 && evaluation && (
            <>
              <div style={{ marginBottom: 24 }}>
                <SectionHeader icon={<Trophy size={22} />} label="AI Judge Panel" color="#f59e0b" step="3" />
              </div>
              <JudgePanel evaluation={evaluation} onNext={handleImprove} loading={loading} />
            </>
          )}
          {step === 3 && improvement && (
            <IdeaImprovement improvement={improvement} onNext={handlePitch} loading={loading} />
          )}
          {step === 4 && pitch && (
            <>
              <div style={{ marginBottom: 8 }}>
                <SectionHeader icon={<Rocket size={22} />} label="Pitch Generator" color="#a855f7" step="5" />
              </div>
              <PitchGenerator pitch={pitch} />
              <div style={{ textAlign: 'center', marginTop: 48 }}>
                <button
                  id="forge-another-btn"
                  onClick={resetAll}
                  className="btn-neon"
                  style={{ padding: '14px 36px', borderRadius: 12, fontSize: 15, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 10 }}
                >
                  <Sparkles size={18} style={{ position: 'relative', zIndex: 1 }} />
                  <span style={{ position: 'relative', zIndex: 1 }}>Forge Another Idea</span>
                </button>
              </div>
            </>
          )}
        </div>
      </main>

      <ErrorToast message={error} onClose={() => setError('')} />
    </div>
  )
}
