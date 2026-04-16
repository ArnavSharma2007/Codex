import React, { useState, useContext, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { AuthContext } from '../AuthContext';
import AnimatedPage from '../components/AnimatedPage';

const BACKEND = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const cardRef = useRef(null);

  // 1. Kinetic Layer: Magnetic Focus (Shift based on scroll depth)
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["start end", "end start"]
  });

  const rotateX = useTransform(scrollYProgress, [0, 0.5, 1], [15, 0, -15]);
  const rotateY = useTransform(scrollYProgress, [0, 0.5, 1], [-10, 0, 10]);
  const springRotateX = useSpring(rotateX, { stiffness: 60, damping: 20 });
  const springRotateY = useSpring(rotateY, { stiffness: 60, damping: 20 });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Authentication failed');
      login(data.token, data.user);
      navigate('/home');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatedPage className="flex items-center justify-center min-h-[90vh]">
      <div className="main-content" style={{ padding: '60px 20px', width: '100%', maxWidth: '460px' }}>
        <div ref={cardRef} style={{ perspective: '1200px' }}>
          {/* 2. Entry Layer: Heavy Spring Drop */}
          <motion.div
            initial={{ opacity: 0, y: -100, scale: 0.8, rotateX: -20 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1, 
              rotateX: 0,
              transition: { type: 'spring', stiffness: 100, damping: 15, duration: 1.2 }
            }}
          >
            {/* 3. Kinetic Layer: Magnetic Tilt */}
            <motion.div 
              className="glass-card" 
              style={{ 
                rotateX: springRotateX, 
                rotateY: springRotateY,
                padding: '48px',
                borderRadius: '32px',
                border: '1px solid rgba(212,175,55,0.15)',
                boxShadow: '0 40px 100px rgba(0,0,0,0.5)',
                background: 'linear-gradient(135deg, rgba(20,20,20,0.9), rgba(5,5,5,0.95))'
              }}
              whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
            >
              <div className="text-center mb-10">
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 0.6, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-xs font-mono uppercase tracking-widest text-accent mb-4"
                >
                  Neural Uplink v2.1
                </motion.div>
                <h1 className="text-3xl font-bold text-gradient">Authenticate</h1>
                <p className="text-muted mt-2">Access your Codex workspace.</p>
              </div>

              {error && <div className="alert alert-error mb-6" style={{ borderRadius: '12px' }}>{error}</div>}

              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <div>
                  <label className="text-xs font-mono uppercase tracking-widest text-muted block mb-2 px-1">Interface Email</label>
                  <input
                    name="email" type="email" placeholder="arnav@deakin.edu.au" required
                    className="glass-input w-full" style={{ padding: '16px 20px', borderRadius: '16px' }}
                    onChange={handleChange}
                    value={form.email}
                  />
                </div>
                <div>
                  <label className="text-xs font-mono uppercase tracking-widest text-muted block mb-2 px-1">Access Key</label>
                  <input
                    name="password" type="password" placeholder="••••••••" required
                    className="glass-input w-full" style={{ padding: '16px 20px', borderRadius: '16px' }}
                    onChange={handleChange}
                    value={form.password}
                  />
                </div>

                <motion.button
                  type="submit" disabled={loading}
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}
                  className="btn btn-primary w-full mt-4" 
                  style={{ padding: '18px', borderRadius: '16px', fontSize: '1rem', fontWeight: 800 }}
                >
                  {loading ? 'Decrypting Stream...' : 'Initialize Session'}
                </motion.button>
              </form>

              <footer className="mt-10 text-center text-sm text-muted">
                Identity not established? <Link to="/signup" className="text-accent hover:underline font-bold">Register Node</Link>
              </footer>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </AnimatedPage>
  );
}
