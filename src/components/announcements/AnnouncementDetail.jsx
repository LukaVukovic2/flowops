/**
 * AnnouncementDetail Component
 * Displays full announcement content with all details, edit and delete options
 * Requirements: 3.3, 3.6, 3.7, 3.8, 12.1
 */

import React, { useState, useEffect } from 'react';
import { Calendar, User, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import Badge from '../common/Badge';
import Button from '../common/Button';
import Modal from '../common/Modal';
import LoadingSkeleton from '../common/LoadingSkeleton';
import { formatDateTime } from '../../utils/dateFormatter';
import { getAnnouncementById, deleteAnnouncement, publishAnnouncement } from '../../services/announcementService';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';

const AnnouncementDetail = ({ announcementId, onClose, onUpdate, onDelete, onEdit }) => {
  const { user } = useAuth();
  const { showSuccess, showError } = useNotification();
  const [announcement, setAnnouncement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    loadAnnouncement();
  }, [announcementId]);

  const loadAnnouncement = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAnnouncementById(announcementId);
      setAnnouncement(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Greška pri učitavanju objave');
      console.error('Failed to load announcement:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await deleteAnnouncement(announcementId);
      showSuccess('Objava je uspješno obrisana');
      onDelete?.(announcementId);
      onClose?.();
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Greška pri brisanju objave';
      setError(errorMessage);
      showError(errorMessage);
      console.error('Failed to delete announcement:', err);
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handlePublishToggle = async () => {
    try {
      setPublishing(true);
      const newPublishStatus = !announcement.isPublished;
      const updatedAnnouncement = await publishAnnouncement(announcementId, newPublishStatus);
      setAnnouncement(updatedAnnouncement);
      onUpdate?.(updatedAnnouncement);
      
      // Show success notification based on action
      if (newPublishStatus) {
        showSuccess('Objava je uspješno objavljena');
      } else {
        showSuccess('Objava je uspješno uklonjena');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Greška pri promjeni statusa objave';
      setError(errorMessage);
      showError(errorMessage);
      console.error('Failed to toggle publish status:', err);
    } finally {
      setPublishing(false);
    }
  };

  // Check permissions
  const canEdit = user?.role === 'Administrator' || 
    (user?.role === 'Tehničar' && announcement?.authorId === user?.id);
  const canDelete = user?.role === 'Administrator' || 
    (user?.role === 'Tehničar' && announcement?.authorId === user?.id);
  const canPublish = user?.role === 'Administrator' || user?.role === 'Tehničar';

  if (loading) {
    return (
      <div className="space-y-4">
        <LoadingSkeleton className="h-8 w-3/4" />
        <LoadingSkeleton className="h-64 w-full" />
        <LoadingSkeleton className="h-4 w-full" />
        <LoadingSkeleton className="h-4 w-full" />
        <LoadingSkeleton className="h-4 w-2/3" />
      </div>
    );
  }

  if (error || !announcement) {
    return (
      <div className="text-center py-8">
        <p className="text-red-400 mb-4">{error || 'Objava nije pronađena'}</p>
        <Button variant="secondary" onClick={onClose}>
          Zatvori
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with category and status */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          {announcement.category ? (
            <Badge
              variant="info"
              style={announcement.category.color ? { backgroundColor: announcement.category.color } : {}}
            >
              {announcement.category.name}
            </Badge>
          ) : (
            <Badge variant="default">Bez kategorije</Badge>
          )}
          
          {announcement.isPublished ? (
            <Badge variant="success">
              <Eye size={14} className="mr-1" />
              Objavljeno
            </Badge>
          ) : (
            <Badge variant="warning">
              <EyeOff size={14} className="mr-1" />
              Skica
            </Badge>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {canPublish && (
            <Button
              variant={announcement.isPublished ? "warning" : "success"}
              size="small"
              onClick={handlePublishToggle}
              loading={publishing}
              disabled={publishing}
            >
              {announcement.isPublished ? (
                <>
                  <EyeOff size={16} className="mr-1" />
                  Ukloni objavu
                </>
              ) : (
                <>
                  <Eye size={16} className="mr-1" />
                  Objavi
                </>
              )}
            </Button>
          )}
          
          {canEdit && (
            <Button
              variant="secondary"
              size="small"
              onClick={() => onEdit?.(announcement)}
            >
              <Edit size={16} className="mr-1" />
              Uredi
            </Button>
          )}
          
          {canDelete && (
            <Button
              variant="danger"
              size="small"
              onClick={() => setShowDeleteConfirm(true)}
            >
              <Trash2 size={16} className="mr-1" />
              Obriši
            </Button>
          )}
        </div>
      </div>

      {/* Title */}
      <h1 className="text-3xl font-bold text-white">
        {announcement.title}
      </h1>

      {/* Metadata */}
      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 border-b border-gray-700 pb-4">
        {announcement.author && (
          <div className="flex items-center gap-2">
            <User size={16} />
            <span>{announcement.author.firstName} {announcement.author.lastName}</span>
          </div>
        )}
        
        {announcement.isPublished && announcement.publishedAt ? (
          <div className="flex items-center gap-2">
            <Calendar size={16} />
            <span>Objavljeno: {formatDateTime(announcement.publishedAt)}</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Calendar size={16} />
            <span>Kreirano: {formatDateTime(announcement.createdAt)}</span>
          </div>
        )}
        
        {announcement.updatedAt && announcement.updatedAt !== announcement.createdAt && (
          <div className="flex items-center gap-2">
            <Calendar size={16} />
            <span>Ažurirano: {formatDateTime(announcement.updatedAt)}</span>
          </div>
        )}
      </div>

      {/* Image */}
      {announcement.imageUrl && (
        <div className="w-full rounded-lg overflow-hidden bg-gray-900">
          <img
            src={announcement.imageUrl}
            alt={announcement.title}
            className="w-full h-auto"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        </div>
      )}

      {/* Content */}
      <div className="prose prose-invert max-w-none">
        <div className="text-gray-300 whitespace-pre-wrap leading-relaxed">
          {announcement.content}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-900/20 border border-red-700 rounded-lg p-4 text-red-400">
          {error}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Potvrda brisanja"
        size="small"
      >
        <div className="space-y-4">
          <p className="text-gray-300">
            Jeste li sigurni da želite obrisati ovu objavu?
          </p>
          <p className="text-sm text-gray-400">
            Ova radnja se ne može poništiti.
          </p>
          <div className="flex items-center justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => setShowDeleteConfirm(false)}
              disabled={deleting}
            >
              Odustani
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              loading={deleting}
              disabled={deleting}
            >
              Obriši
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AnnouncementDetail;
