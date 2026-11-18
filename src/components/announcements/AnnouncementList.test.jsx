/**
 * AnnouncementList Component Tests
 * Requirements: 3.3, 3.9, 3.10, 12.2
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AnnouncementList from './AnnouncementList.jsx';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('AnnouncementList Component', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  const mockAnnouncements = [
    {
      id: '1',
      title: 'Prva objava',
      content: 'Sadržaj prve objave',
      publishedAt: '2024-01-15T10:00:00Z',
      createdAt: '2024-01-15T09:00:00Z',
      category: { id: 'cat-1', name: 'Održavanje', color: '#3B82F6' },
      author: { id: 'user-1', firstName: 'Ivan', lastName: 'Horvat', email: 'ivan@example.com' }
    },
    {
      id: '2',
      title: 'Druga objava',
      content: 'Sadržaj druge objave',
      publishedAt: '2024-01-16T10:00:00Z',
      createdAt: '2024-01-16T09:00:00Z',
      category: { id: 'cat-2', name: 'Sigurnost', color: '#EF4444' },
      author: { id: 'user-2', firstName: 'Ana', lastName: 'Kovač', email: 'ana@example.com' }
    },
    {
      id: '3',
      title: 'Treća objava',
      content: 'Sadržaj treće objave',
      publishedAt: '2024-01-14T10:00:00Z',
      createdAt: '2024-01-14T09:00:00Z',
      category: { id: 'cat-1', name: 'Održavanje', color: '#3B82F6' },
      author: { id: 'user-1', firstName: 'Ivan', lastName: 'Horvat', email: 'ivan@example.com' }
    }
  ];

  it('renders list of announcements', () => {
    render(
      <BrowserRouter>
        <AnnouncementList announcements={mockAnnouncements} />
      </BrowserRouter>
    );

    expect(screen.getByText('Prva objava')).toBeInTheDocument();
    expect(screen.getByText('Druga objava')).toBeInTheDocument();
    expect(screen.getByText('Treća objava')).toBeInTheDocument();
  });

  it('displays announcements in reverse chronological order (newest first)', () => {
    render(
      <BrowserRouter>
        <AnnouncementList announcements={mockAnnouncements} />
      </BrowserRouter>
    );

    const articles = screen.getAllByRole('article');
    
    // Druga objava (2024-01-16) should be first
    expect(articles[0]).toHaveTextContent('Druga objava');
    // Prva objava (2024-01-15) should be second
    expect(articles[1]).toHaveTextContent('Prva objava');
    // Treća objava (2024-01-14) should be third
    expect(articles[2]).toHaveTextContent('Treća objava');
  });

  it('sorts by createdAt when publishedAt is not available', () => {
    const announcementsWithoutPublished = [
      {
        id: '1',
        title: 'Objava A',
        content: 'Sadržaj A',
        createdAt: '2024-01-10T10:00:00Z',
        category: null,
        author: null
      },
      {
        id: '2',
        title: 'Objava B',
        content: 'Sadržaj B',
        createdAt: '2024-01-12T10:00:00Z',
        category: null,
        author: null
      }
    ];

    render(
      <BrowserRouter>
        <AnnouncementList announcements={announcementsWithoutPublished} />
      </BrowserRouter>
    );

    const articles = screen.getAllByRole('article');
    
    // Objava B (2024-01-12) should be first
    expect(articles[0]).toHaveTextContent('Objava B');
    // Objava A (2024-01-10) should be second
    expect(articles[1]).toHaveTextContent('Objava A');
  });

  it('displays empty message when no announcements', () => {
    render(
      <BrowserRouter>
        <AnnouncementList announcements={[]} />
      </BrowserRouter>
    );

    expect(screen.getByText('Nema objava za prikaz')).toBeInTheDocument();
  });

  it('displays custom empty message', () => {
    render(
      <BrowserRouter>
        <AnnouncementList announcements={[]} emptyMessage="Nema rezultata" />
      </BrowserRouter>
    );

    expect(screen.getByText('Nema rezultata')).toBeInTheDocument();
  });

  it('shows loading skeletons when loading', () => {
    const { container } = render(
      <BrowserRouter>
        <AnnouncementList announcements={[]} loading={true} />
      </BrowserRouter>
    );

    // Should render 3 skeleton cards (check for animate-pulse class which is used by skeletons)
    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('uses responsive grid layout', () => {
    const { container } = render(
      <BrowserRouter>
        <AnnouncementList announcements={mockAnnouncements} />
      </BrowserRouter>
    );

    const grid = container.querySelector('.grid');
    expect(grid?.className).toContain('md:grid-cols-2');
    expect(grid?.className).toContain('lg:grid-cols-3');
  });

  it('handles empty announcements array gracefully', () => {
    render(
      <BrowserRouter>
        <AnnouncementList />
      </BrowserRouter>
    );

    expect(screen.getByText('Nema objava za prikaz')).toBeInTheDocument();
  });

  it('does not mutate original announcements array when sorting', () => {
    const originalAnnouncements = [...mockAnnouncements];
    
    render(
      <BrowserRouter>
        <AnnouncementList announcements={mockAnnouncements} />
      </BrowserRouter>
    );

    // Original array should remain unchanged
    expect(mockAnnouncements[0].id).toBe(originalAnnouncements[0].id);
    expect(mockAnnouncements[1].id).toBe(originalAnnouncements[1].id);
    expect(mockAnnouncements[2].id).toBe(originalAnnouncements[2].id);
  });
});
