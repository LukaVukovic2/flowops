/**
 * RecentAnnouncementsWidget Tests
 * Tests for the recent announcements dashboard widget
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import RecentAnnouncementsWidget from './RecentAnnouncementsWidget';

// Mock date formatter
vi.mock('../../utils/dateFormatter.js', () => ({
  formatDateTime: (date) => '15.01.2024 10:30'
}));

// Helper to render with router
const renderWithRouter = (component) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('RecentAnnouncementsWidget', () => {
  const mockAnnouncements = [
    {
      id: '1',
      title: 'Planirano održavanje sustava',
      published_at: '2024-01-15T10:30:00Z',
      author: {
        first_name: 'Ivan',
        last_name: 'Horvat'
      },
      category: {
        id: 'cat1',
        name: 'Održavanje',
        color: '#3B82F6'
      }
    },
    {
      id: '2',
      title: 'Nova verzija aplikacije',
      published_at: '2024-01-14T09:00:00Z',
      author: {
        first_name: 'Ana',
        last_name: 'Kovač'
      }
    },
    {
      id: '3',
      title: 'Sigurnosno ažuriranje',
      published_at: '2024-01-13T14:00:00Z',
      author: {
        first_name: 'Marko',
        last_name: 'Novak'
      }
    }
  ];

  it('renders widget title', () => {
    renderWithRouter(
      <RecentAnnouncementsWidget announcements={mockAnnouncements} loading={false} />
    );
    
    expect(screen.getByText('Nedavne objave')).toBeInTheDocument();
  });

  it('renders loading state', () => {
    renderWithRouter(
      <RecentAnnouncementsWidget announcements={[]} loading={true} />
    );
    
    // Check for loading skeletons (should have 5)
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('renders empty state when no announcements', () => {
    renderWithRouter(
      <RecentAnnouncementsWidget announcements={[]} loading={false} />
    );
    
    expect(screen.getByText('Nema objavljenih objava.')).toBeInTheDocument();
  });

  it('renders announcements list', () => {
    renderWithRouter(
      <RecentAnnouncementsWidget announcements={mockAnnouncements} loading={false} />
    );
    
    expect(screen.getByText('Planirano održavanje sustava')).toBeInTheDocument();
    expect(screen.getByText('Nova verzija aplikacije')).toBeInTheDocument();
    expect(screen.getByText('Sigurnosno ažuriranje')).toBeInTheDocument();
  });

  it('displays author names correctly', () => {
    renderWithRouter(
      <RecentAnnouncementsWidget announcements={mockAnnouncements} loading={false} />
    );
    
    expect(screen.getByText('Ivan Horvat')).toBeInTheDocument();
    expect(screen.getByText('Ana Kovač')).toBeInTheDocument();
    expect(screen.getByText('Marko Novak')).toBeInTheDocument();
  });

  it('displays formatted dates', () => {
    renderWithRouter(
      <RecentAnnouncementsWidget announcements={mockAnnouncements} loading={false} />
    );
    
    // Should show formatted dates for each announcement
    const dates = screen.getAllByText('15.01.2024 10:30');
    expect(dates.length).toBeGreaterThan(0);
  });

  it('limits display to 5 announcements', () => {
    const manyAnnouncements = Array(10).fill(null).map((_, i) => ({
      id: `${i}`,
      title: `Objava ${i + 1}`,
      published_at: '2024-01-15T10:30:00Z',
      author: {
        first_name: 'Test',
        last_name: 'User'
      }
    }));

    renderWithRouter(
      <RecentAnnouncementsWidget announcements={manyAnnouncements} loading={false} />
    );
    
    // Should show first 5 announcements
    expect(screen.getByText('Objava 1')).toBeInTheDocument();
    expect(screen.getByText('Objava 5')).toBeInTheDocument();
    
    // Should show link indicating more announcements
    expect(screen.getByText(/i još 5 objava/)).toBeInTheDocument();
  });

  it('renders link to all announcements', () => {
    renderWithRouter(
      <RecentAnnouncementsWidget announcements={mockAnnouncements} loading={false} />
    );
    
    const allAnnouncementsLinks = screen.getAllByText('Sve objave');
    expect(allAnnouncementsLinks.length).toBeGreaterThan(0);
    expect(allAnnouncementsLinks[0]).toHaveAttribute('href', '/announcements');
  });

  it('renders links to individual announcements', () => {
    renderWithRouter(
      <RecentAnnouncementsWidget announcements={mockAnnouncements} loading={false} />
    );
    
    const announcementLinks = screen.getAllByRole('link').filter(
      link => link.getAttribute('href')?.startsWith('/announcements/')
    );
    
    expect(announcementLinks.length).toBe(mockAnnouncements.length);
    expect(announcementLinks[0]).toHaveAttribute('href', '/announcements/1');
  });

  it('handles announcements without category', () => {
    const announcementWithoutCategory = [{
      id: '1',
      title: 'Objava bez kategorije',
      published_at: '2024-01-15T10:30:00Z',
      author: {
        first_name: 'Test',
        last_name: 'User'
      }
      // No category
    }];

    renderWithRouter(
      <RecentAnnouncementsWidget announcements={announcementWithoutCategory} loading={false} />
    );
    
    expect(screen.getByText('Objava bez kategorije')).toBeInTheDocument();
  });

  it('handles announcements without author', () => {
    const announcementWithoutAuthor = [{
      id: '1',
      title: 'Objava bez autora',
      published_at: '2024-01-15T10:30:00Z'
      // No author
    }];

    renderWithRouter(
      <RecentAnnouncementsWidget announcements={announcementWithoutAuthor} loading={false} />
    );
    
    expect(screen.getByText('Objava bez autora')).toBeInTheDocument();
  });
});
