/**
 * AnnouncementCard Component Tests
 * Requirements: 3.3, 3.9, 3.10, 12.2
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AnnouncementCard from './AnnouncementCard.jsx';

describe('AnnouncementCard Component', () => {
  const mockAnnouncement = {
    id: '1',
    title: 'Planirano održavanje',
    content: 'U subotu 20.1. između 02:00 i 06:00 planirano je održavanje glavnog servera. Tijekom tog vremena sustav neće biti dostupan.',
    imageUrl: 'https://example.com/image.jpg',
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
    render(<AnnouncementCard announcement={mockAnnouncement} />);
    expect(screen.getByText('Planirano održavanje')).toBeInTheDocument();
  });

  it('renders truncated content preview', () => {
    const longContent = 'A'.repeat(200);
    const announcement = { ...mockAnnouncement, content: longContent };
    
    render(<AnnouncementCard announcement={announcement} />);
    const preview = screen.getByText(/A{150}\.\.\./);
    expect(preview).toBeInTheDocument();
  });

  it('renders full content when under 150 characters', () => {
    const shortContent = 'Kratka objava';
    const announcement = { ...mockAnnouncement, content: shortContent };
    
    render(<AnnouncementCard announcement={announcement} />);
    expect(screen.getByText('Kratka objava')).toBeInTheDocument();
  });

  it('renders category badge', () => {
    render(<AnnouncementCard announcement={mockAnnouncement} />);
    expect(screen.getByText('Održavanje')).toBeInTheDocument();
  });

  it('renders author name when firstName and lastName are provided', () => {
    render(<AnnouncementCard announcement={mockAnnouncement} />);
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
    
    render(<AnnouncementCard announcement={announcement} />);
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });

  it('formats and displays published date in Croatian format', () => {
    render(<AnnouncementCard announcement={mockAnnouncement} />);
    // Croatian format: dd.MM.yyyy HH:mm
    expect(screen.getByText(/15\.01\.2024/)).toBeInTheDocument();
  });

  it('uses createdAt when publishedAt is not available', () => {
    const announcement = {
      ...mockAnnouncement,
      publishedAt: null,
      createdAt: '2024-01-10T12:00:00Z'
    };
    
    render(<AnnouncementCard announcement={announcement} />);
    expect(screen.getByText(/10\.01\.2024/)).toBeInTheDocument();
  });

  it('renders image when imageUrl is provided', () => {
    render(<AnnouncementCard announcement={mockAnnouncement} />);
    const image = screen.getByAltText('Planirano održavanje');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'https://example.com/image.jpg');
  });

  it('does not render image when imageUrl is not provided', () => {
    const announcement = { ...mockAnnouncement, imageUrl: null };
    render(<AnnouncementCard announcement={announcement} />);
    
    const image = screen.queryByAltText('Planirano održavanje');
    expect(image).not.toBeInTheDocument();
  });

  it('calls onClick with announcement id when clicked', () => {
    const handleClick = vi.fn();
    render(<AnnouncementCard announcement={mockAnnouncement} onClick={handleClick} />);
    
    const card = screen.getByRole('article');
    fireEvent.click(card);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
    expect(handleClick).toHaveBeenCalledWith('1');
  });

  it('applies cursor-pointer class for clickable card', () => {
    render(<AnnouncementCard announcement={mockAnnouncement} onClick={vi.fn()} />);
    const card = screen.getByRole('article');
    expect(card.className).toContain('cursor-pointer');
  });

  it('does not render category badge when category is null', () => {
    const announcement = { ...mockAnnouncement, category: null };
    render(<AnnouncementCard announcement={announcement} />);
    
    // Only one element with badge styling should be present (none in this case)
    expect(screen.queryByText('Održavanje')).not.toBeInTheDocument();
  });

  it('does not render author section when author is null', () => {
    const announcement = { ...mockAnnouncement, author: null };
    render(<AnnouncementCard announcement={announcement} />);
    
    // Check that author name/email is not rendered
    expect(screen.queryByText('Ivan Horvat')).not.toBeInTheDocument();
  });
});
