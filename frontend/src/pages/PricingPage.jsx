import React from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { useAuth } from '../AuthContext';
import AnimatedPage from '../components/AnimatedPage';

function PlanCard({ children, isPremium, index }) {
  const cardRef = React.useRef(null);
  
  // 1. Kinetic Layer: Structural Breath (Scroll-linked scale and shadow intensity)
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["start end", "end start"]
  });

  const scrollScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.95, 1.05, 0.95]);
  const scrollGlow = useTransform(scrollYProgress, [0, 0.5, 1], [0, 20, 0]);
  const springScale = useSpring(scrollScale, { stiffness: 100, damping: 30 });
  const springGlow = useSpring(scrollGlow, { stiffness: 100, damping: 30 });

  return (
    <div ref={cardRef} style={{ perspective: '1200px' }}>
      {/* 2. Entry Layer: Handles magnetic emergence on arrival */}
      <motion.div
        initial={{ opacity: 0, y: 60, scale: 0.9 }}
        whileInView={{ 
          opacity: 1, 
          y: 0, 
          scale: 1,
          transition: { 
            duration: 1, 
            delay: index * 0.15, 
            ease: [0.16, 1, 0.3, 1] 
          } 
        }}
        viewport={{ once: true, margin: "-50px" }}
      >
        {/* 3. Kinetic Layer: Dynamic focus physics */}
        <motion.div
          style={{ 
            scale: springScale,
            boxShadow: isPremium ? `0 0 ${springGlow}px rgba(212, 175, 55, 0.3)` : 'none',
            padding: '48px 40px', 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column', 
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {isPremium && (
            <div style={{ position: 'absolute', top: 0, right: 0, padding: '8px 24px', background: 'var(--accent)', color: '#000', fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase', borderRadius: '0 0 0 16px' }}>
              Most Selected
            </div>
          )}
          {children}
        </motion.div>
      </motion.div>
    </div>
  );
}

export default function PricingPage() {
  const { isPremium } = useAuth();

  return (
    <AnimatedPage>
      <div className="main-content" style={{ paddingBottom: '20vh' }}>
        <header className="page-header text-center mb-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: 'easeOut' }}
          >
            <span className="hero-badge" style={{ backgroundColor: 'rgba(212,175,55,0.05)', color: 'var(--accent)' }}>Membership Tiers</span>
            <h1 className="text-gradient">Choose Your Identity</h1>
            <p className="mt-4 text-muted" style={{ maxWidth: 500, margin: '16px auto 0' }}>Elevate your academic data stream with high-performance neural modules.</p>
          </motion.div>
        </header>

        <div 
          className="plans-container"
          style={{ 
            display: 'flex', 
            gap: '40px', 
            justifyContent: 'center', 
            flexWrap: 'wrap',
            maxWidth: '1100px', 
            margin: '0 auto' 
          }}
        >
          <PlanCard index={0}>
            <div style={{ flex: 1 }}>
              <div className="plan-name" style={{ fontSize: '1.25rem', opacity: 0.6 }}>Standard Node</div>
              <div className="plan-price" style={{ fontSize: '3.5rem', margin: '24px 0' }}>$0<span>/mo</span></div>
              <ul className="plan-features mt-8" style={{ listStyle: 'none', padding: 0 }}>
                <li style={{ marginBottom: 16, display: 'flex', gap: 12 }}><span>✓</span> Community Access</li>
                <li style={{ marginBottom: 16, display: 'flex', gap: 12 }}><span>✓</span> Basic Node Sync</li>
                <li style={{ marginBottom: 16, display: 'flex', gap: 12 }}><span>✓</span> Global Community Flow</li>
              </ul>
            </div>
            <div className="mt-12">
              <button className="plan-button disabled" style={{ borderRadius: '12px', padding: '16px' }} disabled>Default State Active</button>
            </div>
          </PlanCard>

          <PlanCard isPremium index={1}>
            <div style={{ flex: 1 }}>
              <div className="plan-name" style={{ fontSize: '1.25rem', color: 'var(--accent)' }}>Pro Identity Suite</div>
              <div className="plan-price" style={{ fontSize: '3.5rem', margin: '24px 0' }}>$10<span>/mo</span></div>
              <p className="plan-desc" style={{ fontSize: '0.9rem', opacity: 0.7, marginBottom: 32 }}>Full neural integration for peak academic performance.</p>
              <ul className="plan-features" style={{ listStyle: 'none', padding: 0 }}>
                <li style={{ marginBottom: 16, display: 'flex', gap: 12 }}><span style={{ color: 'var(--accent)' }}>★</span> AI Logic Assistant (Pro)</li>
                <li style={{ marginBottom: 16, display: 'flex', gap: 12 }}><span style={{ color: 'var(--accent)' }}>★</span> Private Resource Streams</li>
                <li style={{ marginBottom: 16, display: 'flex', gap: 12 }}><span style={{ color: 'var(--accent)' }}>★</span> Priority Uplink Support</li>
                <li style={{ marginBottom: 16, display: 'flex', gap: 12 }}><span style={{ color: 'var(--accent)' }}>★</span> Pro Visual Workspace</li>
              </ul>
            </div>
            <div className="mt-12">
              {isPremium ? (
                <button className="plan-button disabled" style={{ borderRadius: '12px', padding: '16px' }} disabled>Your Active Identity</button>
              ) : (
                <Link to="/plans" className="btn btn-primary w-full" style={{padding:'20px', textAlign: 'center', display: 'block', borderRadius: '16px', fontWeight: 700}}>
                  Initialize Upgrade ↗
                </Link>
              )}
            </div>
          </PlanCard>
        </div>
      </div>
    </AnimatedPage>
  );
}
