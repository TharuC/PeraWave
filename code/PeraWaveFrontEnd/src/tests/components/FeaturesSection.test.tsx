import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import FeaturesSection from '../../components/FeaturesSection';

describe('FeaturesSection Component', () => {
    it('renders the main title', () => {
        render(<FeaturesSection />);
        expect(screen.getByText('Why PeraWave?')).toBeInTheDocument();
    });

    it('renders all feature cards', () => {
        render(<FeaturesSection />);
        expect(screen.getByText('Targeted Feeds')).toBeInTheDocument();
        expect(screen.getByText('Anonymity Control')).toBeInTheDocument();
        expect(screen.getByText('Save & Upvote')).toBeInTheDocument();
        expect(screen.getByText('Safe Community')).toBeInTheDocument();
    });
});
