/**
 * AnnouncementDetail Component Tests
 * Requirements: 3.3, 3.9, 3.10, 12.2
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AnnouncementDetail from './AnnouncementDetail.jsx';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('AnnouncementDetail Component', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  const mockAnnouncement = {
    id: '1',
    title: 'Planirano održavanje sustava',
    content: 'U subotu 20.1. između 02:00 i 06:00 planirano je održavanje glavnog servera. Tijekom tog vremena sustav neće biti dostupan. Molimo vas da planirate svoje aktivnosti sukladno tome.',
    imageUrl: 'https://example.com/maintenance.jpg',
    category: {
      id: 'cat-1',
      name: 'Održavanje',
      color: '#3B82F6'
    },
    author: {
      id: 'user-1',
      firstName: 'Ivan',
      lastName: 'Horvat',
      email: 'ivan.horvat@example.com'
    },
    publishedAt: '2024-01-15T10:30:00Z',
    createdAt: '2024-01-15T09:00:00Z'
  };

  it('renders announcement title', () => {
    render(
      <BrowserRouter>
        <AnnouncementDetail announcement={mockAnnouncement} />
      </BrowserRouter>
    );

    expect(screen.getByText('Planirano održavanje sustava')).toBeInTheDocument();
  });

  it('renders full announcement content', () => {
    render(
      <BrowserRouter>
        <AnnouncementDetail announcement={mockAnnouncement} />
      </BrowserRouter>
    );

    expect(screen.getByText(/U subotu 20\.1\. između 02:00 i 06:00/)).toBeInTheDocument();
  });

  it('renders category badge', () => {
    render(
      <BrowserRouter>
        <AnnouncementDetail announcement={mockAnnouncement} />
      </BrowserRouter>
    );

    expect(screen.getByText('Održavanje')).toBeInTheDocument();
  });

  it('renders author name when firstName and lastName are provided', () => {
    render(
      <BrowserRouter>
        <AnnouncementDetail announcement={mockAnnouncement} />
      </BrowserRouter>
    );

    expect(screen.getByText('Ivan Horvat')).toBeInTheDocument();
  });

  it('renders author email when firstName or lastName is missing', () => {
    const announcement = {
      ...mockAnnouncement,
      author: {
        id: 'user-1',
        email: 'test@example.com'
      }
    };

    render(
      <BrowserRouter>
        <AnnouncementDetail announcement={announcement} />
      </BrowserRouter>
    );

    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });

  it('formats and displays published date in Croatian format', () => {
    render(
      <BrowserRouter>
        <AnnouncementDetail announcement={mockAnnouncement} />
      </BrowserRouter>
    );

    // Croatian format: dd.MM.yyyy HH:mm
    expect(screen.getByText(/15\.01\.2024/)).toBeInTheDocument();
  });

  it('uses createdAt when publishedAt is not available', () => {
    const announcement = {
      ...mockAnnouncement,
      publishedAt: null,
      createdAt: '2024-01-10T12:00:00Z'
    };

    render(
      <BrowserRouter>
        <AnnouncementDetail announcement={announcement} />
      </BrowserRouter>
    );

    expect(screen.getByText(/10\.01\.2024/)).toBeInTheDocument();
  });

  it('renders image when imageUrl is provided', () => {
    render(
      <BrowserRouter>
        <AnnouncementDetail announcement={mockAnnouncement} />
      </BrowserRouter>
    );

    const image = screen.getByAltText('Planirano održavanje sustava');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'https://example.com/maintenance.jpg');
  });

  it('does not render image when imageUrl is not provided', () => {
    const announcement = { ...mockAnnouncement, imageUrl: null };
    
    render(
      <BrowserRouter>
        <AnnouncementDetail announcement={announcement} />
      </BrowserRouter>
    );

    const image = screen.queryByAltText('Planirano održavanje sustava');
    expect(image).not.toBeInTheDocument();
  });

  it('renders back button', () => {
    render(
      <BrowserRouter>
        <AnnouncementDetail announcement={mockAnnouncement} />
      </BrowserRouter>
    );

    expect(screen.getByText('Natrag')).toBeInTheDocument();
  });

  it('navigates back when back button is clicked', () => {
    render(
      <BrowserRouter>
        <AnnouncementDetail announcement={mockAnnouncement} />
      </BrowserRouter>
    );

    const backButton = screen.getByText('Natrag');
    fireEvent.click(backButton);

    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  it('displays not found message when announcement is null', () => {
    render(
      <BrowserRouter>
        <AnnouncementDetail announcement={null} />
      </BrowserRouter>
    );

    expect(screen.getByText('Objava nije pronađena')).toBeInTheDocument();
  });

  it('displays loading skeletons when loading', () => {
    render(
      <BrowserRouter>
        <AnnouncementDetail announcement={null} loading={true} />
      </BrowserRouter>
    );

    const skeletons = screen.getAllByTestId(/loading-skeleton/i);
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('does not render category badge when category is null', () => {
    const announcement = { ...mockAnnouncement, category: null };
    
    render(
      <BrowserRouter>
        <AnnouncementDetail announcement={announcement} />
      </BrowserRouter>
    );

    expect(screen.queryByText('Održavanje')).not.toBeInTheDocument();
  });

  it('does not render author section when author is null', () => {
    const announcement = { ...mockAnnouncement, author: null };
    
    render(
      <BrowserRouter>
        <AnnouncementDetail announcement={announcement} />
      </BrowserRouter>
    );

    expect(screen.queryByText('Ivan Horvat')).not.toBeInTheDocument();
  });

  it('preserves line breaks in content with whitespace-pre-wrap', () => {
    const announcement = {
      ...mockAnnouncement,
      content: 'Prva linija\n\nDruga linija\nTreća linija'
    };

    const { container } = render(
      <BrowserRouter>
        <AnnouncementDetail announcement={announcement} />
      </BrowserRouter>
    );

    const contentDiv = container.querySelector('.whitespace-pre-wrap');
    expect(contentDiv).toBeInTheDocument();
  });

  it('applies correct styling for article layout', () => {
    const { container } = render(
      <BrowserRouter>
        <AnnouncementDetail announcement={mockAnnouncement} />
      </BrowserRouter>
    );

    const article = container.querySelector('article');
    expect(article?.className).toContain('bg-gray-800');
    expect(article?.className).toContain('rounded-lg');
  });
});
