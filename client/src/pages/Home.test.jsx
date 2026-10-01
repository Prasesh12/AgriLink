import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import '../locales/i18n';
import { AuthProvider } from '../context/AuthContext';
import Home from './Home';

describe('Home', () => {
  it('renders the app name', () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <Home />
        </AuthProvider>
      </MemoryRouter>,
    );
    expect(screen.getByText('AgriLink')).toBeInTheDocument();
  });
});
