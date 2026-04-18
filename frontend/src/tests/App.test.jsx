import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// Mock framer-motion to prevent useScroll crashes and strip animation props
jest.mock('framer-motion', () => {
  const React = require('react');
  
  // Helper to remove motion-specific props so React doesn't throw warnings
  const cleanProps = (props) => {
    const { initial, animate, exit, transition, whileHover, whileTap, variants, style, ...rest } = props;
    return rest;
  };

  return {
    motion: {
      div: React.forwardRef((props, ref) => <div ref={ref} {...cleanProps(props)} />),
      form: React.forwardRef((props, ref) => <form ref={ref} {...cleanProps(props)} />),
      h1: React.forwardRef((props, ref) => <h1 ref={ref} {...cleanProps(props)} />),
      h2: React.forwardRef((props, ref) => <h2 ref={ref} {...cleanProps(props)} />),
      p: React.forwardRef((props, ref) => <p ref={ref} {...cleanProps(props)} />),
      span: React.forwardRef((props, ref) => <span ref={ref} {...cleanProps(props)} />),
      button: React.forwardRef((props, ref) => <button ref={ref} {...cleanProps(props)} />),
      input: React.forwardRef((props, ref) => <input ref={ref} {...cleanProps(props)} />),
    },
    AnimatePresence: ({ children }) => <>{children}</>,
    // Provide safe dummy returns for motion hooks
    useScroll: () => ({ scrollYProgress: { get: () => 0 } }),
    useTransform: () => ({ get: () => 0 }),
    useSpring: () => ({ get: () => 0 }),
    useAnimation: () => ({ start: jest.fn(), stop: jest.fn() }),
  };
});

// Mock Lenis (used in main.jsx but not in App)
jest.mock('lenis', () => {
  return jest.fn().mockImplementation(() => ({
    raf: jest.fn(),
  }));
});

// Mock framer-motion to avoid animation issues in test
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    nav: ({ children, ...props }) => <nav {...props}>{children}</nav>,
    button: ({ children, ...props }) => <button {...props}>{children}</button>,
    span: ({ children, ...props }) => <span {...props}>{children}</span>,
  },
  AnimatePresence: ({ children }) => <>{children}</>,
  useAnimation: () => ({ start: jest.fn() }),
}));

// Mock AuthContext
jest.mock('../AuthContext', () => {
  const React = require('react'); // <-- Bring React into the mock's scope
  return {
    AuthContext: React.createContext({ 
      user: null, 
      token: null, 
      login: jest.fn(), 
      logout: jest.fn() 
    }),
    AuthProvider: ({ children }) => children,
  };
});

// Simple smoke tests for routes
describe('App — Route Rendering', () => {
  it('renders login page at /login without crashing', () => {
    // We just test that the LoginPage renders — not the full route
    const LoginPage = require('../pages/LoginPage').default;
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );
    console.log('[TEST] LoginPage rendered without crash ✅');
    // The auth container should exist
    expect(document.querySelector('form')).toBeTruthy();
  });

  it('renders signup page at /signup without crashing', () => {
    const SignUpPage = require('../pages/SignUpPage').default;
    render(
      <MemoryRouter>
        <SignUpPage />
      </MemoryRouter>
    );
    console.log('[TEST] SignUpPage rendered without crash ✅');
    expect(document.querySelector('form')).toBeTruthy();
  });
});
