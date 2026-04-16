import React, { useState, useContext, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
import { authFetch } from '../authFetch';
import AnimatedPage from '../components/AnimatedPage';

const BACKEND = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

function TypingIndicator() {
  return (
    <div className="chat-bubble ai" style={{ display: 'flex', gap: 6, padding: '20px 24px', background: 'rgba(212,175,55,0.05)' }}>
      <motion.span className="typing-dot" animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1, repeat: Infinity }} />
      <motion.span className="typing-dot" animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1, repeat: Infinity, delay: 0.2 }} />
      <motion.span className="typing-dot" animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1, repeat: Infinity, delay: 0.4 }} />
    </div>
  );
}

import ReactMarkdown from 'react-markdown';

function Message({ msg, isLast }) {
  const isAI = msg.role === 'ai';
  
  return (
    <motion.div
      // 1. Entry Layer: Soft scale-in with blur reduction
      initial={{ opacity: 0, scale: 0.9, filter: 'blur(15px)', y: 30 }}
      animate={{ 
        opacity: 1, 
        scale: 1, 
        filter: 'blur(0px)', 
        y: 0,
        transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
      }}
      className={`chat-bubble ${isAI ? 'ai' : 'user'}`}
      style={{
        alignSelf: isAI ? 'flex-start' : 'flex-end',
        marginBottom: 24,
        position: 'relative',
        maxWidth: '85%'
      }}
    >
      {/* 2. Neural Signature: Pulsing trace for AI nodes */}
      {isAI && (
        <motion.div 
          className="neural-tracer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          style={{
            position: 'absolute',
            top: -10, left: -10, right: -10, bottom: -10,
            borderRadius: 'inherit',
            border: '1px solid rgba(212,175,55,0.2)',
            zIndex: -1,
            background: 'radial-gradient(circle at center, rgba(212,175,55,0.05) 0%, transparent 70%)'
          }}
        />
      )}

      {/* 3. Message Content */}
      <div style={{ position: 'relative', zIndex: 2 }}>
        <div style={{ 
          fontSize: '0.65rem', 
          opacity: 0.5, 
          marginBottom: 8, 
          fontWeight: 900, 
          textTransform: 'uppercase', 
          letterSpacing: '0.15em',
          color: isAI ? 'var(--accent)' : 'inherit'
        }}>
          {isAI ? 'Neural Core [V2.0]' : 'Subject Identity'}
        </div>
        <div className="markdown-content" style={{ fontSize: '0.95rem', lineHeight: 1.7 }}>
          {isAI ? (
            <ReactMarkdown>{msg.content}</ReactMarkdown>
          ) : (
            msg.content
          )}
        </div>
        
        {/* Active Processing Dot (Only for last AI message) */}
        {isAI && isLast && (
          <motion.div 
            style={{ width: 6, height: 6, background: 'var(--accent)', borderRadius: '50%', marginTop: 12 }}
            animate={{ opacity: [0.2, 1, 0.2] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        )}
      </div>
    </motion.div>
  );
}

export default function AIAssistantPage() {
  const { user, token, refreshUserStatus } = useContext(AuthContext);
  const [messages, setMessages] = useState([
    { role: 'ai', content: 'Neural uplink established. I am your Codex-integrated intelligence node. How shall we expand your knowledge base today?' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    // Force a DB-sync on mount to catch manual role updates
    if (token) refreshUserStatus();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: 'user', content: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const resp = await authFetch(`${BACKEND}/api/ai/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userMsg.content }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        const errMsg = res.status === 403
          ? '🔒 Node Restriction: AI Cognition requires a Premium identity.'
          : (data.message || 'Transmission failed.');
        setMessages((prev) => [...prev, { role: 'ai', content: errMsg }]);
      } else {
        setMessages((prev) => [...prev, { role: 'ai', content: data.result || data.response || data.text || 'Empty telemetry received.' }]);
      }
    } catch {
      setMessages((prev) => [...prev, { role: 'ai', content: '📡 Data stream link failed. Connection unstable.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!user?.isPremium) {
    return (
      <AnimatedPage>
        <div className="main-content">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="premium-lock glass-card"
            style={{ padding: '64px', borderRadius: '32px' }}
          >
            <motion.span 
              className="brand-pill" 
              style={{backgroundColor:'rgba(212,175,55,0.1)', color:'var(--accent)', border: '1px solid rgba(212,175,55,0.2)'}}
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Access Restricted
            </motion.span>
            <h2 className="mt-8 text-3xl font-bold">Neural Cognition Hub</h2>
            <p className="mt-4 text-muted" style={{ maxWidth: 420, lineHeight: 1.8 }}>
              Unlock the full power of Gemini-Pro logic. Upgrade to Pro Identity to synthesize answers, summaries, and complex academic insights.
            </p>
            <Link to="/plans" className="btn btn-primary mt-12" style={{ padding: '20px 48px', fontSize: '1rem' }}>Upgrade Knowledge Node →</Link>
          </motion.div>
        </div>
      </AnimatedPage>
    );
  }

  return (
    <AnimatedPage>
      <div className="main-content" style={{ maxWidth: 1000, paddingBottom: '30px' }}>
        <header className="page-header mb-12">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="hero-badge" style={{ background: 'rgba(212,175,55,0.05)', color: 'var(--accent)' }}>Neural Interface V2</span>
            <h1 className="text-gradient">Gemini Analytics</h1>
            <p className="text-muted mt-2">Real-time academic data synthesis and cognitive expansion.</p>
          </motion.div>
        </header>

        <motion.div 
          className="glass-card flex flex-col" 
          style={{ 
            height: '45vh', 
            minHeight: 380, 
            borderRadius: '24px',
            background: 'var(--bg-glass)',
            border: '1px solid rgba(255,255,255,0.05)',
            boxShadow: '0 40px 100px rgba(0,0,0,0.4)',
            overflow: 'hidden'
          }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          <div className="chat-messages" style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
            <AnimatePresence>
              {messages.map((msg, i) => (
                <Message key={i} msg={msg} isLast={i === messages.length - 1} />
              ))}
              {loading && <TypingIndicator key="typing" />}
            </AnimatePresence>
            <div ref={bottomRef} />
          </div>

          <div className="chat-input-area" style={{ 
            padding: '40px', 
            background: 'rgba(255,255,255,0.01)', 
            borderTop: '1px solid rgba(255,255,255,0.05)',
            display: 'flex',
            gap: 24,
            alignItems: 'center'
          }}>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Query the neural network..."
              disabled={loading}
              rows={1}
              style={{ 
                border: 'none', 
                background: 'transparent', 
                backdropFilter: 'none', 
                fontSize: '1.1rem',
                flex: 1,
                color: 'var(--text-primary)',
                outline: 'none'
              }}
            />
            <motion.button
              className="btn btn-primary"
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{ borderRadius: '16px', padding: '14px 28px' }}
            >
              Uplink ↗
            </motion.button>
          </div>
        </motion.div>
      </div>
    </AnimatedPage>
  );
}
