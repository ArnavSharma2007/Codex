import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// Mock framer-motion to completely bypass animations during tests
jest.mock('framer-motion', () => {
  const React = require('react');

  // Strip motion props so React doesn't complain about unrecognized attributes
  const cleanProps = (props) => {
    const {
      initial, animate, exit, transition, whileHover, whileTap,
      variants, style, layoutId, onHoverStart, onHoverEnd, ...rest
    } = props;
    return rest;
  };

  const createMockComponent = (Tag) => React.forwardRef((props, ref) => (
    <Tag ref={ref} {...cleanProps(props)} />
  ));

  return {
    __esModule: true, // Tell Jest this is an ES Module
    motion: {
      div: createMockComponent('div'),
      form: createMockComponent('form'),
      h1: createMockComponent('h1'),
      h2: createMockComponent('h2'),
      p: createMockComponent('p'),
      span: createMockComponent('span'),
      button: createMockComponent('button'),
      input: createMockComponent('input'),
      a: createMockComponent('a'),
      img: createMockComponent('img'),
      nav: createMockComponent('nav'),
      ul: createMockComponent('ul'),
      li: createMockComponent('li'),
    },
    AnimatePresence: ({ children }) => <>{children}</>,
    // Aggressively define these hooks as functions
    useScroll: function() { return { scrollYProgress: { get: () => 0 } }; },
    useTransform: function() { return { get: () => 0 }; },
    useSpring: function() { return { get: () => 0 }; },
    useAnimation: function() { return { start: jest.fn(), stop: jest.fn() }; },
    useInView: function() { return true; }
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
