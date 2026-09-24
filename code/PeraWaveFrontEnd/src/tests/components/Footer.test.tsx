import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Footer from '../../components/Footer';

describe('Footer Component', () => {
    it('renders the copyright text with current year', () => {
        render(<Footer />);
        const currentYear = new Date().getFullYear();
        expect(screen.getByText(new RegExp(currentYear.toString(), 'i'))).toBeInTheDocument();
        expect(screen.getByText(/PeraWave. All rights reserved./i)).toBeInTheDocument();
    });

    it('renders the contact email link', () => {
        render(<Footer />);
        const emailLink = screen.getByRole('link', { name: /support@perawave.com/i });
        expect(emailLink).toBeInTheDocument();
        expect(emailLink).toHaveAttribute('href', 'mailto:support.perawave@gmail.com');
    });
});
