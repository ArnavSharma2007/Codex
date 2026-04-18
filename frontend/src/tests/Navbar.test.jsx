import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// Mock dependencies
jest.mock('framer-motion', () => ({
  motion: {
    nav: ({ children, ...props }) => <nav {...props}>{children}</nav>,
    span: ({ children, ...props }) => <span {...props}>{children}</span>,
    button: ({ children, ...props }) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

jest.mock('../AuthContext', () => {
  const React = require('react'); // <-- Bring React into the mock's scope
  return {
    AuthContext: React.createContext({
      user: { name: 'Test User', email: 'test@test.com', isPremium: false },
      logout: jest.fn(),
    }),
  };
});

jest.mock('../hooks/useTheme', () => ({
  useTheme: () => ({ theme: 'dark', toggleTheme: jest.fn(), isDark: true }),
}));

import Navbar from '../components/Navbar';

describe('Navbar Component', () => {
  const renderNavbar = () =>
    render(
      <MemoryRouter initialEntries={['/home']}>
        <Navbar />
      </MemoryRouter>
    );

  it('renders brand name', () => {
    renderNavbar();
    console.log('[TEST] Navbar: checking brand text ✅');
    expect(screen.getByText('Codex')).toBeInTheDocument();
  });

  it('renders navigation links', () => {
    renderNavbar();
    expect(screen.getByText('Notes')).toBeInTheDocument();
    expect(screen.getByText('Home')).toBeInTheDocument();
    console.log('[TEST] Navbar: navigation links present ✅');
  });

  it('renders logout button for authenticated user', () => {
    renderNavbar();
    expect(screen.getByText('Terminal Off')).toBeInTheDocument();
    console.log('[TEST] Navbar: logout button present for authenticated user ✅');
  });
});
