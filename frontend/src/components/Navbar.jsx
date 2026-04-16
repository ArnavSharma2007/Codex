import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useContext } from 'react';
import { AuthContext } from '../AuthContext';
import { useTheme } from '../hooks/useTheme';

const NAV_LINKS = [
  { href: '/home', label: 'Home' },
  { href: '/notes', label: 'Notes' },
  { href: '/posts', label: 'Posts' },
  { href: '/ai-assistant', label: 'AI Assistant' },
  { href: '/plans', label: 'Pricing' },
];

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const { theme, toggleTheme, isDark } = useTheme();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <motion.nav
      className="navbar glass-card"
      style={{
        margin: '16px',
        borderRadius: '20px',
        padding: '12px 24px',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        backdropFilter: 'blur(16px) saturate(180%)'
      }}
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link to="/home" className="navbar-brand flex items-center gap-2 no-underline">
        <span className="text-xl font-black tracking-tighter uppercase" style={{color:'var(--text-primary)'}}>Codex</span>
        <span className="brand-pill" style={{padding:'2px 8px', fontSize:'0.7rem'}}>v1.1</span>
      </Link>

      <div className="navbar-links flex gap-8 items-center">
        {NAV_LINKS.map(({ href, label }) => {
          const isActive = location.pathname === href ||
            (href !== '/home' && location.pathname.startsWith(href));
          return (
            <Link
              key={href}
              to={href}
              className={isActive ? 'active' : ''}
              style={{ 
                color: isActive ? 'var(--accent-cyber)' : 'var(--text-secondary)',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.9rem',
                transition: 'all 0.3s ease',
                textDecoration: 'none'
              }}
            >
              {label}
              {isActive && (
                <motion.span
                  layoutId="nav-glow"
                  className="absolute -bottom-1 left-0 w-full h-0.5"
                  style={{ background: 'var(--accent-cyber)', boxShadow: '0 0 10px var(--accent-cyber)' }}
                />
              )}
            </Link>
          );
        })}
      </div>

      <div className="navbar-right flex items-center gap-6">
        {user && (
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
              <span className="text-xs font-bold uppercase tracking-widest text-muted" style={{fontSize:'0.6rem'}}>User Node</span>
              <span className="text-sm font-medium">{user.name || user.email}</span>
            </div>
            <motion.button
              className="btn btn-secondary"
              onClick={handleLogout}
              whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.05)' }}
              whileTap={{ scale: 0.95 }}
              style={{ padding: '8px 16px', borderRadius: '12px', fontSize: '0.75rem' }}
            >
              Terminal Off
            </motion.button>
          </div>
        )}
      </div>
    </motion.nav>
  );
}
