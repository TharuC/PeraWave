import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Welcome from '../../pages/Welcome';

// Mocking fetch globally
global.fetch = vi.fn();

describe('Welcome Page Component', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    it('renders Navbar, HeroSection, and empty state when no articles', async () => {
        // Mock empty wiki response
        (global.fetch as any).mockResolvedValueOnce({
            ok: true,
            json: async () => []
        });

        render(
            <MemoryRouter>
                <Welcome />
            </MemoryRouter>
        );

        // Wait for the fetch call to finish and update the UI
        await waitFor(() => {
            expect(screen.getByText('Be the First to Contribute!')).toBeInTheDocument();
        });
        
        expect(screen.getByText('University Heritage & Places')).toBeInTheDocument();
        // Since we render the actual Navbar, we should see the PeraWave logo
        expect(screen.getByAltText('PeraWave Logo')).toBeInTheDocument();
    });

    it('renders wiki articles after fetching successfully', async () => {
        const mockArticles = [
            { 
                id: 1, 
                title: 'WUS Canteen', 
                location: 'Near Arts Faculty', 
                imageUrls: [], 
                createdAt: '2023-01-01T00:00:00Z' 
            }
        ];

        (global.fetch as any).mockResolvedValueOnce({
            ok: true,
            json: async () => mockArticles
        });

        render(
            <MemoryRouter>
                <Welcome />
            </MemoryRouter>
        );

        // Wait for the component to render the mocked article
        await waitFor(() => {
            expect(screen.getByText('WUS Canteen')).toBeInTheDocument();
        });
        
        expect(screen.getByText('Near Arts Faculty')).toBeInTheDocument();
    });
});
