import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
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
    expect(screen.getByText('Dev@Deakin')).toBeInTheDocument();
    expect(screen.getByText('Codex')).toBeInTheDocument();
  });

  it('renders navigation links', () => {
    renderNavbar();
    expect(screen.getByText('Notes')).toBeInTheDocument();
    expect(screen.getByText('Home')).toBeInTheDocument();
    console.log('[TEST] Navbar: navigation links present ✅');
  });

  it('renders theme toggle button', () => {
    renderNavbar();
    const themeBtn = screen.getByTitle(/switch to/i);
    expect(themeBtn).toBeInTheDocument();
    console.log('[TEST] Navbar: theme toggle present ✅');
  });

  it('renders logout button for authenticated user', () => {
    renderNavbar();
    expect(screen.getByText('Logout')).toBeInTheDocument();
    console.log('[TEST] Navbar: logout button present for authenticated user ✅');
  });
});
