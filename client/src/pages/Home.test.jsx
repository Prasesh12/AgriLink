import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import '../locales/i18n';
import Home from './Home';

describe('Home', () => {
  it('renders the app name', () => {
    render(<Home />);
    expect(screen.getByText('AgriLink')).toBeInTheDocument();
  });
});
