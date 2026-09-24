import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import Navbar from '../../components/Navbar';

describe('Navbar Component', () => {
    it('renders logo and brand name', () => {
        render(
            <MemoryRouter>
                <Navbar />
            </MemoryRouter>
        );
        expect(screen.getByText('PeraWave')).toBeInTheDocument();
        expect(screen.getByAltText('PeraWave Logo')).toBeInTheDocument();
    });

    it('renders login and create account buttons when not logged in', () => {
        render(
            <MemoryRouter>
                <Navbar isLoggedIn={false} />
            </MemoryRouter>
        );
        expect(screen.getByText('Log in')).toBeInTheDocument();
        expect(screen.getByText('Create an account')).toBeInTheDocument();
    });

    it('renders user profile and search bar when logged in', () => {
        render(
            <MemoryRouter>
                <Navbar isLoggedIn={true} userName="TestUser" />
            </MemoryRouter>
        );
        expect(screen.getByText('TestUser')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Search PeraWave...')).toBeInTheDocument();
        expect(screen.queryByText('Log in')).not.toBeInTheDocument();
    });
});
