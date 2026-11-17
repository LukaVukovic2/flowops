/**
 * AnnouncementsPage Component
 * Main page for announcement management with list, create, detail, and edit views
 * Requirements: 3.1, 3.2, 3.3, 3.6, 3.7, 3.8, 12.1, 17.2
 */

import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import AnnouncementList from '../../components/announcements/AnnouncementList';
import AnnouncementDetail from '../../components/announcements/AnnouncementDetail';
import AnnouncementForm from '../../components/announcements/AnnouncementForm';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import { getAnnouncements, createAnnouncement, updateAnnouncement } from '../../services/announcementService';
import { useAuth } from '../../context/AuthContext';

const AnnouncementsPage = () => {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({});
  const [selectedAnnouncementId, setSelectedAnnouncementId] = useState(null);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadAnnouncements();
  }, [filters]);

  const loadAnnouncements = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAnnouncements(filters);
      setAnnouncements(data.announcements || data);
    } catch (err) {
      setError(err.response?.data?.message || 'Greška pri učitavanju objava');
      console.error('Failed to load announcements:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleAnnouncementClick = (announcement) => {
    setSelectedAnnouncementId(announcement.id);
    setIsDetailModalOpen(true);
  };

  const handleCreateAnnouncement = async (formData) => {
    try {
      setSubmitting(true);
      const newAnnouncement = await createAnnouncement(formData);
      setAnnouncements(prev => [newAnnouncement, ...prev]);
      setIsCreateModalOpen(false);
      
      // Show success message (you could add a notification here)
      console.log('Announcement created successfully');
    } catch (err) {
      console.error('Failed to create announcement:', err);
      // Error will be shown in the form
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditAnnouncement = async (formData) => {
    try {
      setSubmitting(true);
      const updatedAnnouncement = await updateAnnouncement(editingAnnouncement.id, formData);
      setAnnouncements(prev =>
        prev.map(announcement =>
          announcement.id === updatedAnnouncement.id ? updatedAnnouncement : announcement
        )
      );
      setIsEditModalOpen(false);
      setEditingAnnouncement(null);
      
      // Show success message
      console.log('Announcement updated successfully');
    } catch (err) {
      console.error('Failed to update announcement:', err);
      // Error will be shown in the form
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  const handleAnnouncementUpdate = (updatedAnnouncement) => {
    setAnnouncements(prev =>
      prev.map(announcement =>
        announcement.id === updatedAnnouncement.id ? updatedAnnouncement : announcement
      )
    );
  };

  const handleAnnouncementDelete = (announcementId) => {
    setAnnouncements(prev => prev.filter(announcement => announcement.id !== announcementId));
    setIsDetailModalOpen(false);
  };

  const handleEditClick = (announcement) => {
    setEditingAnnouncement(announcement);
    setIsDetailModalOpen(false);
    setIsEditModalOpen(true);
  };

  // Check if user can create announcements (Tehničar or Administrator)
  const canCreateAnnouncement = user?.role === 'Tehničar' || user?.role === 'Administrator';

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white">Objave</h1>
            <p className="text-gray-400 mt-1">
              {canCreateAnnouncement 
                ? 'Pregledajte, kreirajte i upravljajte objavama'
                : 'Pregledajte objave i obavijesti'}
            </p>
          </div>
          {canCreateAnnouncement && (
            <Button
              variant="primary"
              onClick={() => setIsCreateModalOpen(true)}
            >
              <Plus size={20} className="mr-2" />
              Nova objava
            </Button>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-900/20 border border-red-700 rounded-lg p-4 text-red-400">
            {error}
          </div>
        )}

        {/* Announcement List */}
        <AnnouncementList
          announcements={announcements}
          loading={loading}
          onAnnouncementClick={handleAnnouncementClick}
          onFilterChange={handleFilterChange}
          showFilters={true}
          emptyMessage={
            filters.categoryId || filters.authorId
              ? 'Nema objava koje odgovaraju odabranim filterima'
              : 'Nema objava za prikaz'
          }
        />

        {/* Create Announcement Modal */}
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Nova objava"
          size="large"
        >
          <AnnouncementForm
            onSubmit={handleCreateAnnouncement}
            onCancel={() => setIsCreateModalOpen(false)}
            isLoading={submitting}
          />
        </Modal>

        {/* Edit Announcement Modal */}
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingAnnouncement(null);
          }}
          title="Uredi objavu"
          size="large"
        >
          {editingAnnouncement && (
            <AnnouncementForm
              announcement={editingAnnouncement}
              onSubmit={handleEditAnnouncement}
              onCancel={() => {
                setIsEditModalOpen(false);
                setEditingAnnouncement(null);
              }}
              isLoading={submitting}
            />
          )}
        </Modal>

        {/* Announcement Detail Modal */}
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title="Detalji objave"
          size="xlarge"
        >
          {selectedAnnouncementId && (
            <AnnouncementDetail
              announcementId={selectedAnnouncementId}
              onClose={() => setIsDetailModalOpen(false)}
              onUpdate={handleAnnouncementUpdate}
              onDelete={handleAnnouncementDelete}
              onEdit={handleEditClick}
            />
          )}
        </Modal>
      </div>
    </div>
  );
};

export default AnnouncementsPage;
