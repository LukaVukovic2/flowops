/**
 * TicketsPage Component
 * Main page for ticket management with list, create, and detail views
 * Requirements: 2.3, 2.4, 2.5, 12.1
 */

import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import TicketList from '../../components/tickets/TicketList';
import TicketDetail from '../../components/tickets/TicketDetail';
import TicketForm from '../../components/tickets/TicketForm';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import { getTickets, createTicket } from '../../services/ticketService';
import { useAuth } from '../../context/AuthContext';

const TicketsPage = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({});
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadTickets();
  }, [filters]);

  const loadTickets = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Apply role-based filtering
      const queryFilters = { ...filters };
      if (user?.role === 'Registrirani_Korisnik') {
        queryFilters.creatorId = user.id;
      } else if (user?.role === 'Tehničar') {
        queryFilters.assigneeId = user.id;
      }
      
      const data = await getTickets(queryFilters);
      setTickets(data.tickets || data);
    } catch (err) {
      setError(err.response?.data?.message || 'Greška pri učitavanju tiketa');
      console.error('Failed to load tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleTicketClick = (ticket) => {
    setSelectedTicketId(ticket.id);
    setIsDetailModalOpen(true);
  };

  const handleCreateTicket = async (formData) => {
    try {
      setCreating(true);
      const newTicket = await createTicket(formData);
      setTickets(prev => [newTicket, ...prev]);
      setIsCreateModalOpen(false);
    } catch (err) {
      console.error('Failed to create ticket:', err);
      // Error will be shown in the form
      throw err;
    } finally {
      setCreating(false);
    }
  };

  const handleTicketUpdate = (updatedTicket) => {
    setTickets(prev =>
      prev.map(ticket =>
        ticket.id === updatedTicket.id ? updatedTicket : ticket
      )
    );
  };

  const handleTicketDelete = (ticketId) => {
    setTickets(prev => prev.filter(ticket => ticket.id !== ticketId));
    setIsDetailModalOpen(false);
  };

  const canCreateTicket = user?.role !== 'Posjetitelj';

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-white">Tiketi</h1>
          {canCreateTicket && (
            <Button
              variant="primary"
              onClick={() => setIsCreateModalOpen(true)}
            >
              <Plus size={20} className="mr-2" />
              Novi tiket
            </Button>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-900/20 border border-red-700 rounded-lg p-4 text-red-400">
            {error}
          </div>
        )}

        {/* Ticket List */}
        <TicketList
          tickets={tickets}
          loading={loading}
          onTicketClick={handleTicketClick}
          onFilterChange={handleFilterChange}
          showCreateButton={false} // We have our own button in the header
        />

        {/* Create Ticket Modal */}
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Novi tiket"
          size="large"
        >
          <TicketForm
            onSubmit={handleCreateTicket}
            onCancel={() => setIsCreateModalOpen(false)}
            isLoading={creating}
          />
        </Modal>

        {/* Ticket Detail Modal */}
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title="Detalji tiketa"
          size="xlarge"
        >
          {selectedTicketId && (
            <TicketDetail
              ticketId={selectedTicketId}
              onClose={() => setIsDetailModalOpen(false)}
              onUpdate={handleTicketUpdate}
              onDelete={handleTicketDelete}
            />
          )}
        </Modal>
      </div>
    </div>
  );
};

export default TicketsPage;
