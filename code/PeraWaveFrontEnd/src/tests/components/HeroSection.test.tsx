import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import HeroSection from '../../components/HeroSection';

describe('HeroSection Component', () => {
    it('renders welcome message', () => {
        render(<HeroSection />);
        expect(screen.getByText(/Welcome to/i)).toBeInTheDocument();
        expect(screen.getByText(/PeraWave/i)).toBeInTheDocument();
        expect(screen.getByText(/Connect. Share. Grow together./i)).toBeInTheDocument();
    });

    it('renders feature section within hero', () => {
        render(<HeroSection />);
        expect(screen.getByText('Targeted Feeds')).toBeInTheDocument();
    });
});
