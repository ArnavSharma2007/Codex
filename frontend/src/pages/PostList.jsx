import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from 'framer-motion';
import AnimatedPage from '../components/AnimatedPage';

function PostItem({ p, idx }) {
  const itemRef = React.useRef(null);
  
  // 1. Kinetic Layer: Structural Weave (Scroll-linked lateral rotation)
  const { scrollYProgress } = useScroll({
    target: itemRef,
    offset: ["start end", "end start"]
  });

  const rotateY = useTransform(scrollYProgress, [0, 1], [idx % 2 === 0 ? 12 : -12, idx % 2 === 0 ? -12 : 12]);
  const xDepth = useTransform(scrollYProgress, [0, 1], [idx % 2 === 0 ? -25 : 25, idx % 2 === 0 ? 25 : -25]);
  const springRotate = useSpring(rotateY, { stiffness: 100, damping: 30 });
  const springX = useSpring(xDepth, { stiffness: 100, damping: 30 });

  return (
    <div ref={itemRef} style={{ perspective: '1200px', marginBottom: '32px' }}>
      {/* 2. Entry Layer: Handles structural emergence on arrival */}
      <motion.div
        initial={{ opacity: 0, x: idx % 2 === 0 ? -40 : 40, filter: 'blur(10px)' }}
        whileInView={{ 
          opacity: 1, 
          x: 0, 
          filter: 'blur(0px)',
          transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } 
        }}
        viewport={{ once: true, margin: "-100px" }}
      >
        {/* 3. Kinetic Layer: Weaving flow applied on top */}
        <motion.article
          style={{ 
            rotateY: springRotate, 
            x: springX
          }}
          className="post-card glass-card"
          whileHover={{ 
            y: -5, 
            borderColor: 'var(--accent)',
            boxShadow: '0 10px 30px rgba(212,175,55,0.1)' 
          }}
        >
          <div className="flex justify-between items-start">
            <h3 className="text-xl font-bold">{p.title}</h3>
            <span className="badge badge-premium" style={{ border: '1px solid rgba(212,175,55,0.3)', color: 'var(--accent)' }}>Doubt Stream</span>
          </div>
          <p className="post-meta mt-2 text-sm">
            by <span className="text-accent">{p.authorEmail}</span> • {new Date(p.createdAt).toLocaleDateString()}
          </p>
          <div className="divider" style={{margin:'14px 0', opacity: 0.1}} />
          <div className="post-body">
            <pre style={{whiteSpace:'pre-wrap', color:'var(--text-secondary)', fontSize:'0.95rem', fontSans: 'inherit', lineHeight: 1.6}}>{p.content}</pre>
          </div>
        </motion.article>
      </motion.div>
    </div>
  );
}

export default function PostList() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch((import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/posts');
        const data = await res.json();
        setPosts(data || []);
      } catch (e) {
        console.error("Posts fetch fail:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <AnimatedPage>
      <div className="main-content" style={{ paddingBottom: '30vh' }}>
        <header className="page-header flex justify-between items-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="hero-badge">Collective Intelligence</span>
            <h1 className="text-gradient">Community Stream</h1>
            <p className="text-muted mt-2">Learn, share, and solve with fellow students.</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Link to="/create-post" className="btn btn-primary" style={{padding: '16px 28px'}}>
              Dispatch Doubt
            </Link>
          </motion.div>
        </header>

        <div className="mt-8">
          <AnimatePresence mode="popLayout">
            {loading ? (
              <div className="card-grid">
                {[1, 2, 3].map(i => (
                  <div key={i} className="skeleton skeleton-card" style={{height:220}} />
                ))}
              </div>
            ) : posts.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-32 glass-card"
              >
                <p className="text-muted">The stream is quiet. Be the first to emit a signal.</p>
                <Link to="/create-post" className="btn btn-secondary mt-6">Initialize First Doubt</Link>
              </motion.div>
            ) : (
              <div className="posts-list" style={{ maxWidth: '850px', margin: '0 auto' }}>
                {posts.map((p, idx) => (
                  <PostItem key={p._id} p={p} idx={idx} />
                ))}
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </AnimatedPage>
  );
}
