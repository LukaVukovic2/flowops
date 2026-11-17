/**
 * AnnouncementList Component
 * Display list of announcements in reverse chronological order
 * Requirements: 3.3, 3.9, 3.10, 12.2
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import AnnouncementCard from './AnnouncementCard.jsx';
import LoadingSkeleton from '../common/LoadingSkeleton.jsx';

const AnnouncementList = ({ 
  announcements = [], 
  loading = false,
  emptyMessage = 'Nema objava za prikaz'
}) => {
  const navigate = useNavigate();

  const handleAnnouncementClick = (id) => {
    navigate(`/objave/${id}`);
  };

  // Sort announcements by publishedAt or createdAt in reverse chronological order
  const sortedAnnouncements = [...announcements].sort((a, b) => {
    const dateA = new Date(a.publishedAt || a.createdAt);
    const dateB = new Date(b.publishedAt || b.createdAt);
    return dateB - dateA; // Descending order (newest first)
  });

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
            <LoadingSkeleton className="h-48 w-full" />
            <div className="p-6">
              <LoadingSkeleton className="h-6 w-24 mb-3" />
              <LoadingSkeleton className="h-8 w-full mb-3" />
              <LoadingSkeleton className="h-20 w-full mb-4" />
              <LoadingSkeleton className="h-4 w-48" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (sortedAnnouncements.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400 text-lg">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {sortedAnnouncements.map((announcement) => (
        <AnnouncementCard
          key={announcement.id}
          announcement={announcement}
          onClick={handleAnnouncementClick}
        />
      ))}
    </div>
  );
};

export default AnnouncementList;
