import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from 'framer-motion';
import { AuthContext } from '../AuthContext';
import { authFetch } from '../authFetch';
import AnimatedPage from '../components/AnimatedPage';

const BACKEND = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

function NoteCard({ note, index }) {
  const cardRef = React.useRef(null);
  
  // 1. Kinetic Layer (Scroll-linked Parallax)
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["start end", "end start"]
  });

  const yParallax = useTransform(scrollYProgress, [0, 1], [40, -40]);
  const rotateY = useTransform(scrollYProgress, [0, 1], [index % 2 === 0 ? 5 : -5, index % 2 === 0 ? -5 : 5]);
  const springY = useSpring(yParallax, { stiffness: 100, damping: 30 });
  const springRotate = useSpring(rotateY, { stiffness: 100, damping: 30 });

  const preview = note.quillDelta?.ops
    ?.map((op) => (typeof op.insert === 'string' ? op.insert : ''))
    .join('')
    .slice(0, 100) || '';

  const date = new Date(note.updatedAt).toLocaleDateString('en-AU', {
    day: 'numeric', month: 'short'
  });

  return (
    <div ref={cardRef} style={{ perspective: '1200px' }}>
      {/* 2. Entry Layer: Handles visibility and "pop" on arrival */}
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        whileInView={{ 
          opacity: 1, 
          y: 0, 
          scale: 1,
          transition: { 
            duration: 0.8, 
            delay: (index % 6) * 0.1, 
            ease: [0.16, 1, 0.3, 1] 
          } 
        }}
        viewport={{ once: true, margin: "-50px" }}
      >
        {/* 3. Kinetic Layer: Nested to separate scroll physics from entry physics */}
        <motion.div style={{ y: springY, rotateY: springRotate }}>
          <Link to={`/notes/${note._id}`} className="note-card glass-card block no-underline" style={{ overflow: 'hidden' }}>
            {/* Ambient Shine Effect */}
            <motion.div 
              className="shine"
              initial={{ x: '-100%' }}
              whileHover={{ x: '100%' }}
              transition={{ duration: 1, ease: "easeInOut" }}
              style={{
                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.05), transparent)',
                zIndex: 1
              }}
            />
            
            <div className="flex justify-between items-start mb-3" style={{ position: 'relative', zIndex: 2 }}>
              <h3 className="text-xl font-bold truncate pr-4">{note.title || 'Untitled Node'}</h3>
              <span className={`badge ${note.isPrivate ? 'badge-premium' : 'badge-success'}`}>
                {note.isPrivate ? 'Private' : 'Sync'}
              </span>
            </div>
            
            {preview ? (
              <p className="text-sm text-secondary line-clamp-2 mb-4 h-10" style={{ position: 'relative', zIndex: 2 }}>{preview}...</p>
            ) : (
              <div className="text-sm text-muted italic mb-4 h-10" style={{ position: 'relative', zIndex: 2 }}>Empty node stream...</div>
            )}
            
            <div className="flex items-center gap-4 text-xs font-mono text-muted uppercase tracking-widest pt-4 border-t border-white/5" style={{ position: 'relative', zIndex: 2 }}>
              <span>{date}</span>
            </div>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default function NotesList() {
  const { token } = useContext(AuthContext);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const res = await authFetch(`${BACKEND}/api/notes`, token);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to load notes');
        setNotes(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchNotes();
  }, [token]);

  const filtered = notes.filter((n) =>
    n.title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AnimatedPage>
      <div className="main-content" style={{ paddingBottom: '30vh' }}>
        <header className="page-header flex justify-between items-end mb-12">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <span className="hero-badge">Knowledge Stream</span>
            <h1 className="text-gradient">Memory Nodes</h1>
            <p className="text-muted mt-2">
              {loading ? 'Decrypting repository...' : `Syncing ${notes.length} active nodes.`}
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Link to="/create-note" className="btn btn-primary" style={{padding: '16px 28px'}}>
              Create Node
            </Link>
          </motion.div>
        </header>

        {/* Search Neural Interface */}
        {!loading && notes.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mb-10"
          >
            <div className="search-wrapper glass-card" style={{padding: '4px 16px', borderRadius: '16px', border: '1px solid rgba(212,175,55,0.1)'}}>
              <input
                type="text"
                placeholder="Find node by title identifier..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{border: 'none', background:'transparent', color:'var(--text-primary)', width:'100%', outline:'none', padding: '12px'}}
              />
            </div>
          </motion.div>
        )}

        {error && <div className="alert alert-error mb-8">{error}</div>}

        <div className="relative min-h-[400px]">
          {loading ? (
            <div className="notes-grid">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="skeleton skeleton-card" style={{height: 180}} />
              ))}
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {filtered.length > 0 ? (
                <div className="notes-grid">
                  {filtered.map((note, i) => (
                    <NoteCard key={note._id} note={note} index={i} />
                  ))}
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="text-center py-32 glass-card"
                >
                  <p className="text-muted">Repository empty or identifier mismatch.</p>
                  <Link to="/create-note" className="btn btn-secondary mt-6">Initialize First Node</Link>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </div>
    </AnimatedPage>
  );
}