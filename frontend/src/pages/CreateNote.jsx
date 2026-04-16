import React, { useState, useRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { authFetch } from '../authFetch';
import AnimatedPage from '../components/AnimatedPage';

export default function CreateNote() {
  const [title, setTitle] = useState('');
  const [html, setHtml] = useState('');
  const [delta, setDelta] = useState(null);
  const [isPrivate, setIsPrivate] = useState(true);
  const navigate = useNavigate();
  const containerRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  // Unique Motion for Workspace: The Minimalist Peel
  // We want the distractions to fade/peel as the user scrolls into the editor
  const headerOpacity = useTransform(scrollYProgress, [0, 0.1], [1, 0]);
  const headerY = useTransform(scrollYProgress, [0, 0.1], [0, -20]);
  const editorScale = useTransform(scrollYProgress, [0, 0.1], [1, 1.02]);
  
  const springEditorScale = useSpring(editorScale, { stiffness: 100, damping: 30 });

  const handleSave = async () => {
    if (!title) { alert('Please enter a title'); return; }
    try {
      const res = await authFetch((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/notes', {
        method: 'POST',
        body: JSON.stringify({ title, quillDelta: delta, isPrivate })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Save failed');
      navigate(`/notes/${data._id}`);
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <AnimatedPage>
      <div className="workspace-container" ref={containerRef}>
        <motion.header 
          style={{ opacity: headerOpacity, y: headerY }}
          className="flex justify-between items-center mb-10"
        >
          <div>
            <span className="section-label">Memory Node</span>
            <h1 className="text-gradient">Draft New Knowledge</h1>
          </div>
          <motion.button 
            onClick={handleSave} 
            className="btn btn-primary" 
            style={{ padding: '12px 32px' }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Initialize Sync
          </motion.button>
        </motion.header>

        <motion.div 
          style={{ scale: springEditorScale }}
          className="glass-card p-10"
        >
          <input 
            className="mon-input"
            value={title} 
            onChange={(e)=>setTitle(e.target.value)} 
            placeholder="Document Identifier..." 
            autoFocus
          />
          
          <ReactQuill 
            theme="snow"
            placeholder="Type your academic insights here..."
            value={html} 
            onChange={(content, deltaObj, source, editor) => { 
              setHtml(content); 
              setDelta(editor.getContents()); 
            }} 
          />

          <motion.div 
            style={{ opacity: useTransform(scrollYProgress, [0, 0.05], [1, 0.3]) }}
            className="flex items-center gap-6 mt-8 p-4 rounded-xl bg-white/5 border border-white/5"
          >
            <span className="text-sm font-bold uppercase tracking-widest text-muted" style={{ fontSize: '0.65rem' }}>Access Control</span>
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={isPrivate} 
                onChange={e => setIsPrivate(e.target.checked)}
                className="w-4 h-4 accent-gold"
              />
              <span className="text-sm">{isPrivate ? 'Encrypt (Private)' : 'Broadcast (Public)'}</span>
            </label>
          </motion.div>
        </motion.div>
        
        {/* Fill space for scroll effect */}
        <div style={{ height: '30vh' }} />
      </div>
    </AnimatedPage>
  );
}
