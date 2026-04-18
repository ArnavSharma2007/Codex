import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// ❌ The framer-motion mock was deleted from here.
// It will now safely inherit the robust mock from setupTests.jsx!

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
