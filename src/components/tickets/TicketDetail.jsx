/**
 * TicketDetail Component
 * Detailed view of a single ticket
 * Requirements: 2.1, 2.3, 2.4, 2.5, 12.1, 12.2, 15.8
 */

import React, { useState, useEffect } from 'react';
import { Clock, User, Edit, Trash2, CheckCircle } from 'lucide-react';
import StatusBadge from './StatusBadge';
import Button from '../common/Button';
import Modal from '../common/Modal';
import Select from '../common/Select';
import LoadingSkeleton from '../common/LoadingSkeleton';
import TicketForm from './TicketForm';
import TicketHistory from './TicketHistory';
import TicketComments from './TicketComments';
import { formatDateTime } from '../../utils/dateFormatter';
import { useAuth } from '../../context/AuthContext';
import {
  getTicketById,
  updateTicket,
  updateTicketStatus,
  deleteTicket
} from '../../services/ticketService';

const TicketDetail = ({ ticketId, onClose, onUpdate, onDelete }) => {
  const { user } = useAuth();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');

  // Determine permissions
  const canEdit = 
    user?.role === 'Administrator' ||
    (user?.role === 'Tehničar' && ticket?.assigneeId === user?.id) ||
    (user?.role === 'Registrirani_Korisnik' && ticket?.creatorId === user?.id);
  
  const canDelete = user?.role === 'Administrator';
  const canChangeStatus = user?.role === 'Administrator' || user?.role === 'Tehničar';

  useEffect(() => {
    loadTicket();
  }, [ticketId]);

  const loadTicket = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getTicketById(ticketId);
      setTicket(data);
      setSelectedStatus(data.status);
    } catch (err) {
      setError(err.response?.data?.message || 'Greška pri učitavanju tiketa');
      console.error('Failed to load ticket:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (formData) => {
    try {
      setActionLoading(true);
      const updated = await updateTicket(ticketId, formData);
      setTicket(updated);
      setIsEditModalOpen(false);
      if (onUpdate) onUpdate(updated);
    } catch (err) {
      setError(err.response?.data?.message || 'Greška pri ažuriranju tiketa');
      console.error('Failed to update ticket:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatusChange = async () => {
    if (!selectedStatus || selectedStatus === ticket.status) {
      setIsStatusModalOpen(false);
      return;
    }

    try {
      setActionLoading(true);
      const updated = await updateTicketStatus(ticketId, selectedStatus);
      setTicket(updated);
      setIsStatusModalOpen(false);
      if (onUpdate) onUpdate(updated);
    } catch (err) {
      setError(err.response?.data?.message || 'Greška pri promjeni statusa');
      console.error('Failed to update status:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setActionLoading(true);
      await deleteTicket(ticketId);
      setIsDeleteModalOpen(false);
      if (onDelete) onDelete(ticketId);
      if (onClose) onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Greška pri brisanju tiketa');
      console.error('Failed to delete ticket:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const statusOptions = [
    { value: 'Nova', label: 'Nova' },
    { value: 'U radu', label: 'U radu' },
    { value: 'Na čekanju', label: 'Na čekanju' },
    { value: 'Riješena', label: 'Riješena' },
    { value: 'Zatvorena', label: 'Zatvorena' }
  ];

  if (loading) {
    return <LoadingSkeleton variant="ticket-detail" />;
  }

  if (error || !ticket) {
    return (
      <div className="bg-red-900/20 border border-red-700 rounded-lg p-4 text-red-400">
        {error || 'Tiket nije pronađen'}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white mb-2">{ticket.title}</h2>
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={ticket.status} />
              <StatusBadge priority={ticket.priority} type="priority" />
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex items-center gap-2">
            {canChangeStatus && (
              <Button
                variant="outline"
                size="small"
                onClick={() => setIsStatusModalOpen(true)}
              >
                <CheckCircle size={16} className="mr-1" />
                Status
              </Button>
            )}
            {canEdit && (
              <Button
                variant="secondary"
                size="small"
                onClick={() => setIsEditModalOpen(true)}
              >
                <Edit size={16} className="mr-1" />
                Uredi
              </Button>
            )}
            {canDelete && (
              <Button
                variant="danger"
                size="small"
                onClick={() => setIsDeleteModalOpen(true)}
              >
                <Trash2 size={16} className="mr-1" />
                Obriši
              </Button>
            )}
          </div>
        </div>

        {/* Metadata */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-400">
          {ticket.creator && (
            <div className="flex items-center gap-2">
              <User size={16} />
              <span>
                <strong className="text-gray-300">Kreirao:</strong>{' '}
                {ticket.creator.firstName} {ticket.creator.lastName}
              </span>
            </div>
          )}

          {ticket.assignee && (
            <div className="flex items-center gap-2">
              <User size={16} />
              <span>
                <strong className="text-gray-300">Dodijeljen:</strong>{' '}
                {ticket.assignee.firstName} {ticket.assignee.lastName}
              </span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Clock size={16} />
            <span>
              <strong className="text-gray-300">Kreirano:</strong>{' '}
              {formatDateTime(ticket.createdAt)}
            </span>
          </div>

          {ticket.updatedAt && ticket.updatedAt !== ticket.createdAt && (
            <div className="flex items-center gap-2">
              <Clock size={16} />
              <span>
                <strong className="text-gray-300">Ažurirano:</strong>{' '}
                {formatDateTime(ticket.updatedAt)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-3">Opis</h3>
        <p className="text-gray-300 whitespace-pre-wrap">{ticket.description}</p>
      </div>

      {/* History */}
      <TicketHistory ticketId={ticketId} />

      {/* Comments */}
      <TicketComments ticketId={ticketId} />

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Uredi tiket"
        size="large"
      >
        <TicketForm
          ticket={ticket}
          onSubmit={handleEdit}
          onCancel={() => setIsEditModalOpen(false)}
          isLoading={actionLoading}
        />
      </Modal>

      {/* Status Change Modal */}
      <Modal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        title="Promijeni status"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setIsStatusModalOpen(false)}
              disabled={actionLoading}
            >
              Odustani
            </Button>
            <Button
              variant="primary"
              onClick={handleStatusChange}
              loading={actionLoading}
              disabled={actionLoading}
            >
              Spremi
            </Button>
          </>
        }
      >
        <Select
          label="Novi status"
          name="status"
          options={statusOptions}
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Potvrda brisanja"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={actionLoading}
            >
              Odustani
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              loading={actionLoading}
              disabled={actionLoading}
            >
              Obriši
            </Button>
          </>
        }
      >
        <p className="text-gray-300">
          Jeste li sigurni da želite obrisati ovaj tiket? Ova radnja se ne može poništiti.
        </p>
      </Modal>
    </div>
  );
};

export default TicketDetail;
