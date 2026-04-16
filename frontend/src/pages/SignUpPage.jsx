import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import AnimatedPage from '../components/AnimatedPage';

export default function SignUpPage() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const cardRef = React.useRef(null);

  // 1. Kinetic Layer: Magnetic Focus (Shift based on scroll depth)
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["start end", "end start"]
  });

  const rotateX = useTransform(scrollYProgress, [0, 0.5, 1], [15, 0, -15]);
  const rotateY = useTransform(scrollYProgress, [0, 0.5, 1], [-10, 0, 10]);
  const springRotateX = useSpring(rotateX, { stiffness: 60, damping: 20 });
  const springRotateY = useSpring(rotateY, { stiffness: 60, damping: 20 });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) return setError('Passwords do not match');
    setLoading(true);
    try {
      const { name, email, password } = formData;
      const resp = await fetch((import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000') + '/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        if (data.errors && data.errors.length > 0) {
          throw new Error(data.errors[0].message);
        }
        throw new Error(data.message || 'Signup failed');
      }
      navigate('/login');
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <AnimatedPage className="flex items-center justify-center min-h-[90vh]">
      <div className="main-content" style={{ padding: '60px 20px', width: '100%', maxWidth: '480px' }}>
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
              whileHover={{ scale: 1.02 }}
            >
              <div className="text-center mb-10">
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4, type: 'spring' }}
                  style={{ fontSize: '3rem', marginBottom: '16px' }}
                >
                  ⚡
                </motion.div>
                <h1 className="text-3xl font-bold text-gradient">Initialize Identity</h1>
                <p className="text-muted mt-2">Access the Codex stream.</p>
              </div>

              {error && <div className="alert alert-error mb-6" style={{ borderRadius: '12px' }}>{error}</div>}

              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <div>
                  <label className="text-xs font-mono uppercase tracking-widest text-muted block mb-2 px-1">Full Name</label>
                  <input
                    name="name" type="text" placeholder="Arnav Sharma" required
                    className="glass-input w-full" style={{ padding: '14px 20px', borderRadius: '16px' }}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="text-xs font-mono uppercase tracking-widest text-muted block mb-2 px-1">Email Identifier</label>
                  <input
                    name="email" type="email" placeholder="arnav@deakin.edu.au" required
                    className="glass-input w-full" style={{ padding: '14px 20px', borderRadius: '16px' }}
                    onChange={handleChange}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-mono uppercase tracking-widest text-muted block mb-2 px-1">Pass-Key</label>
                    <input
                      name="password" type="password" required
                      className="glass-input w-full" style={{ padding: '14px 20px', borderRadius: '16px' }}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-mono uppercase tracking-widest text-muted block mb-2 px-1">Confirm</label>
                    <input
                      name="confirmPassword" type="password" required
                      className="glass-input w-full" style={{ padding: '14px 20px', borderRadius: '16px' }}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <motion.button
                  type="submit" disabled={loading}
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}
                  className="btn btn-primary w-full mt-4" 
                  style={{ padding: '18px', borderRadius: '16px', fontSize: '1rem', fontWeight: 800 }}
                >
                  {loading ? 'Processing Node...' : 'Evolve Now'}
                </motion.button>
              </form>

              <p className="mt-10 text-center text-sm text-muted">
                Already established? <Link to="/login" className="text-accent hover:underline font-bold">Resync Here</Link>
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </AnimatedPage>
  );
}
