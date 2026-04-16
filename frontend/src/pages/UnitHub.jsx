import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import jwtDecode from "jwt-decode";
import { getToken } from "../authFetch";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import AnimatedPage from "../components/AnimatedPage";

function ResourceCard({ res, index, isPremium }) {
  const cardRef = React.useRef(null);
  
  // 1. Kinetic Layer: Vertical shelf parallax
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["start end", "end start"]
  });

  const shelfYProgress = useTransform(scrollYProgress, [0, 1], [30, -30]);
  const springShelfY = useSpring(shelfYProgress, { stiffness: 100, damping: 30 });
  
  const locked = res.status === "Premium" && !isPremium;

  return (
    <div ref={cardRef} style={{ perspective: '1200px' }}>
      {/* 2. Entry Layer: Handles shelf-lift emergence */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 60 }}
        whileInView={{ 
          opacity: 1, 
          scale: 1, 
          y: 0,
          transition: { 
            duration: 0.8, 
            delay: (index % 4) * 0.12, 
            ease: [0.16, 1, 0.3, 1] 
          } 
        }}
        viewport={{ once: true, margin: "-40px" }}
      >
        {/* 3. Kinetic Layer: Parallel depth physics */}
        <motion.div
          className="glass-card flex flex-col justify-between"
          whileHover={{ 
            y: -8, 
            borderColor: 'var(--accent)', 
            boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
            transition: { duration: 0.2 }
          }}
          style={{ 
            y: springShelfY,
            minHeight: 200, 
            position: 'relative', 
            overflow: 'hidden' 
          }}
        >
          {/* Subtle Glow Overlay */}
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '2px', background: 'linear-gradient(90deg, transparent, var(--accent), transparent)', opacity: 0.3 }} />
          
          <div style={{ padding: '24px' }}>
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-mono uppercase tracking-widest text-muted" style={{ opacity: 0.6 }}>{res.type}</span>
              <span className={`badge ${res.status === 'Premium' ? 'badge-premium' : 'badge-success'}`}>
                {res.status}
              </span>
            </div>
            <h3 className="text-xl font-bold mb-2" style={{ lineHeight: 1.3 }}>{res.title}</h3>
          </div>

          <div style={{ padding: '24px', paddingTop: 0 }}>
            {locked ? (
              <div className="mt-4 p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <p className="text-xs text-muted mb-3 flex items-center gap-2">
                  <span style={{ fontSize: '1rem' }}>🔒</span> Premium Identity Required
                </p>
                <Link to="/plans" className="btn btn-primary w-full text-center block no-underline" style={{padding: '12px', fontSize: '0.85rem'}}>
                  Upgrade Access
                </Link>
              </div>
            ) : (
              <a
                href={res.link}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary mt-4 w-full text-center block no-underline"
                style={{padding: '12px', fontSize: '0.85rem', borderColor: 'rgba(255,255,255,0.1)'}}
              >
                Sync Data Stream →
              </a>
            )}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default function UnitHub() {
  const { unitCode } = useParams();
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const token = getToken();
      if (!token) {
        setIsPremium(false);
        setLoading(false);
        return;
      }
      const payload = jwtDecode(token);
      setIsPremium(!!payload.isPremium);
    } catch (err) {
      console.error("Error decoding token:", err);
      setIsPremium(false);
    } finally {
      setLoading(false);
    }
  }, []);

  if (loading) return (
    <div className="main-content text-center py-20">
      <div className="loader" />
      <p className="text-muted mt-4">Decrypting repository nodes...</p>
    </div>
  );

  const resources = [
    // --- SIT313 ---
    { unitCode: "SIT313", title: "Firebase Authentication Setup", type: "Video", link: "https://www.youtube.com/watch?v=cyqDCloxPNE", status: "Free" },
    { unitCode: "SIT313", title: "Image Upload & Storage", type: "Video", link: "https://www.youtube.com/watch?v=oxM78lxiFR0", status: "Premium" },
    { unitCode: "SIT313", title: "Password Hashing: Best Practices", type: "Video", link: "https://www.youtube.com/watch?v=esa_t_-PJ6A", status: "Free" },
    { unitCode: "SIT313", title: "2FA (Two-Factor Auth) Implementation", type: "Video", link: "https://www.youtube.com/watch?v=dndLA0EPQWY", status: "Premium" },
    { unitCode: "SIT313", title: "Stripe Payment Gateway Integration", type: "Video", link: "https://www.youtube.com/watch?v=15l6QTz1T4o", status: "Free" },

    // --- SIT221 ---
    { unitCode: "SIT221", title: "DSA Lecture Slides (Full)", type: "PPTX", link: "https://docs.google.com/presentation/d/1q1-xoSo0hYBQtnYk5g6DDYRo8C39jy2s/edit?usp=sharing&ouid=115277504076119909578&rtpof=true&sd=true", status: "Premium" },
    { unitCode: "SIT210", title: "Embedded Systems Notes (Full)", type: "PDF", link: "https://drive.google.com/file/d/1ZUkVtb3aiMIvnAcxvlBxIuwogu1x1y4B/view?usp=sharing", status: "Premium" },
  ];

  const filtered = resources.filter(
    (r) => r.unitCode === (unitCode || "").toUpperCase()
  );

  return (
    <AnimatedPage>
      <div className="main-content" style={{ paddingBottom: '30vh' }}>
        <header className="page-header mb-16">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            <span className="hero-badge">Collective Knowledge</span>
            <h1 className="text-gradient">Unit Repository</h1>
            <p className="text-muted mt-2">Syncing academic data for <span className="text-accent" style={{ color: 'var(--accent)', fontWeight: 700 }}>{(unitCode || "").toUpperCase()}</span></p>
          </motion.div>
        </header>

        {filtered.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card text-center py-32"
          >
            <p className="text-muted">No resources mapped for this unit identifier.</p>
            <Link to="/home" className="btn btn-secondary mt-8">Back to Hub</Link>
          </motion.div>
        ) : (
          <div className="resource-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '32px' }}>
            {filtered.map((res, index) => (
              <ResourceCard key={index} res={res} index={index} isPremium={isPremium} />
            ))}
          </div>
        )}
      </div>
    </AnimatedPage>
  );
}
