import React, { useContext, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { AuthContext } from '../AuthContext';
import AnimatedPage from '../components/AnimatedPage';

const FEATURES = [
  { icon: '📝', title: 'Smart Notes', desc: 'Rich-text notes with Notion-style editing, sharing by email, and privacy controls.' },
  { icon: '🤖', title: 'AI Assistant', desc: 'Powered by Gemini AI — get intelligent answers, summaries, and study help.' },
  { icon: '📚', title: 'Unit Hub', desc: 'Browse and share resources organized by unit code for your Deakin courses.' },
  { icon: '💬', title: 'Community Posts', desc: 'Share knowledge with fellow students through a collaborative post board.' },
  { icon: '🔒', title: 'Secure & Private', desc: 'JWT authentication, private notes, and granular sharing controls.' },
  { icon: '⚡', title: 'Lightning Fast', desc: 'Built on React + Vite with lazy loading, code splitting, and optimised assets.' },
];

const STATS = [
  { value: '10k+', label: 'Notes Created' },
  { value: '3k+', label: 'Students' },
  { value: '50+', label: 'Units Covered' },
  { value: '99.9%', label: 'Uptime' },
];

function StatCounter({ value, label }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      style={{ textAlign: 'center' }}
    >
      <div style={{ fontSize: '2.5rem', fontStyle: 'italic', fontWeight: 900, letterSpacing: '-0.04em', color: 'var(--accent)' }}>{value}</div>
      <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 4 }}>{label}</div>
    </motion.div>
  );
}

function FeatureCard({ icon, title, desc, index }) {
  const cardRef = useRef(null);
  
  // 1. Kinetic Layer: Parallel depth shift on scroll
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["start end", "end start"]
  });

  const rotateX = useTransform(scrollYProgress, [0, 0.5, 1], [10, 0, -10]);
  const springRotateX = useSpring(rotateX, { stiffness: 100, damping: 30 });

  return (
    <div ref={cardRef} style={{ perspective: '1000px' }}>
      <motion.div
        className="feature-card"
        // 2. Base Entry: Ensure visibility on view
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        whileInView={{ 
          opacity: 1, 
          y: 0, 
          scale: 1,
          transition: { duration: 0.6, delay: (index % 3) * 0.1 } 
        }}
        viewport={{ once: true, margin: "-50px" }}
        
        // 3. Kinetic Layer: Applied on top
        style={{ rotateX: springRotateX }}
        whileHover={{ y: -10, borderColor: 'var(--accent)', boxShadow: '0 20px 40px rgba(212, 175, 55, 0.15)' }}
      >
        <span className="feature-icon">{icon}</span>
        <h3>{title}</h3>
        <p>{desc}</p>
      </motion.div>
    </div>
  );
}

export default function HomePage() {
  const { user } = useContext(AuthContext);
  const targetRef = useRef(null);
  
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end start"]
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.9]);
  const y = useTransform(scrollYProgress, [0, 0.5], [0, 100]);
  
  // Smooth out the hero parallax
  const springY = useSpring(y, { stiffness: 400, damping: 90 });

  return (
    <AnimatedPage>
      <div className="home-container" ref={targetRef} style={{ paddingBottom: '100px' }}>
        {/* ── Hero ──────────────────────────────────────── */}
        <motion.section 
          className="hero-section"
          style={{ opacity, scale, y: springY }}
        >
          {/* Ambient blur dot — Gold Edition */}
          <motion.div 
            className="blur-dot" 
            style={{ 
              width: 500, height: 500, 
              background: 'radial-gradient(circle, rgba(212, 175, 55, 0.15) 0%, transparent 70%)',
              top: '0%', left: '50%', 
              transform: 'translateX(-50%)',
              zIndex: 0
            }} 
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          />

          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="hero-badge"
          >
            <span style={{ marginRight: 8 }}>⚡</span>
            <span>Unleashing Peak Deakin Academic Performance</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="hero-title"
          >
            Your Academic<br />Knowledge Hub
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="hero-sub"
          >
            The premium workspace for the modern student. Notes, AI, and Community—perfectly unified in gold-tier design.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.8, ease: "easeOut" }}
            className="hero-cta"
          >
            <Link to="/notes" className="btn btn-primary">
              Initialize Sync
            </Link>
            <Link to="/ai-assistant" className="btn btn-secondary">
              Activate AI
            </Link>
          </motion.div>
        </motion.section>

        {/* ── Stats ─────────────────────────────────────── */}
        <motion.section
          className="stats-section"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 24,
            padding: '48px 24px',
            background: 'var(--bg-glass)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-2xl)',
            marginBottom: 100,
            backdropFilter: 'blur(30px)',
            boxShadow: '0 0 40px rgba(0,0,0,0.5)'
          }}
        >
          {STATS.map((s) => <StatCounter key={s.label} {...s} />)}
        </motion.section>

        {/* ── Features ──────────────────────────────────── */}
        <section style={{ paddingBottom: 100 }}>
          <div style={{ textAlign: 'center', marginBottom: 80 }}>
            <motion.p 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 1 }}
              className="section-label"
            >
              System Capabilities
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              style={{ fontSize: '3rem', fontWeight: 900, color: 'white' }}
            >
              Architected for Excellence
            </motion.h2>
          </div>

          <div className="features-grid">
            {FEATURES.map((f, i) => (
              <FeatureCard key={f.title} {...f} index={i} />
            ))}
          </div>
        </section>

        {/* ── Call to Action ────────────────────────────── */}
        <motion.section
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          style={{ 
            textAlign: 'center', 
            padding: '120px 40px',
            background: 'radial-gradient(circle at center, rgba(212,175,55,0.05) 0%, transparent 70%)',
            borderRadius: 'var(--radius-3xl)',
            border: '1px solid rgba(212,175,55,0.1)'
          }}
        >
          <span className="section-label">The Future is Here</span>
          <h2 style={{ fontSize: '3.5rem', marginBottom: 32 }}>Elevate Your Workflow</h2>
          <div style={{ display: 'flex', gap: 24, justifyContent: 'center' }}>
            <Link to="/signup" className="btn btn-primary" style={{ padding: '20px 48px' }}>Get Started Free</Link>
            <Link to="/plans" className="btn btn-secondary" style={{ padding: '20px 48px' }}>View Pro Edition</Link>
          </div>
        </motion.section>
      </div>
    </AnimatedPage>
  );
}
