import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { authFetch } from '../authFetch';
import AnimatedPage from '../components/AnimatedPage';

export default function CreatePost() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const containerRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  // Unique Motion for Workspace: The Minimalist Peel
  const headerOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const headerY = useTransform(scrollYProgress, [0, 0.15], [0, -30]);
  const formScale = useTransform(scrollYProgress, [0, 0.15], [1, 1.02]);
  
  const springFormScale = useSpring(formScale, { stiffness: 100, damping: 30 });

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!title || !content) { setError('Payload incomplete: title and content required.'); return; }
    try {
      const res = await authFetch((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/posts', {
        method: 'POST',
        body: JSON.stringify({ title, content })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Transmission failed');
      navigate('/posts');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <AnimatedPage>
      <div className="workspace-container" style={{ maxWidth: '700px' }} ref={containerRef}>
        <motion.header 
          style={{ opacity: headerOpacity, y: headerY }}
          className="mb-10 text-center"
        >
          <span className="section-label">Communication Node</span>
          <h1 className="text-gradient">Broadcast Doubt</h1>
          <p className="text-muted mt-2">Engage with the student network to find solutions.</p>
        </motion.header>

        <motion.div 
          style={{ scale: springFormScale }}
          className="glass-card p-10"
        >
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-medium">
              ⚠️ {error}
            </div>
          )}
          
          <form onSubmit={handlePostSubmit}>
            <div className="form-group mb-8">
              <label>Broadcasting Title</label>
              <input 
                type="text" 
                value={title} 
                onChange={(e)=>setTitle(e.target.value)} 
                placeholder="Ex: Need help with SIT313 Task 1.1..."
                required 
              />
            </div>

            <div className="form-group mb-8">
              <label>Doubt Matrix (Content)</label>
              <textarea 
                value={content} 
                onChange={(e)=>setContent(e.target.value)} 
                placeholder="Deconstruct your problem here..."
                rows={8} 
                style={{ resize: 'none' }}
              />
            </div>

            <motion.button 
              type="submit" 
              className="btn btn-primary w-full" 
              style={{ padding: '16px' }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Initialize Broadcast
            </motion.button>
          </form>
        </motion.div>
        
        {/* Fill space for scroll effect */}
        <div style={{ height: '20vh' }} />
      </div>
    </AnimatedPage>
  );
}
