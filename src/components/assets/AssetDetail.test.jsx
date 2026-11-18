/**
 * AssetDetail Component Tests
 * Tests for detailed asset view with linked tickets (Requirement 8.7)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AssetDetail from './AssetDetail';
import * as assetService from '../../services/assetService';
import { useAuth } from '../../context/AuthContext';

// Mock the services and context
vi.mock('../../services/assetService', () => ({
  getAssetById: vi.fn(),
  getAssetTickets: vi.fn(),
  deleteAsset: vi.fn()
}));

vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn()
}));

// Mock child components
vi.mock('./AssetTypeBadge', () => ({
  default: ({ type }) => <span data-testid="type-badge">{type}</span>
}));

vi.mock('./AssetStatusBadge', () => ({
  default: ({ status }) => <span data-testid="status-badge">{status}</span>
}));

vi.mock('../common/Button', () => ({
  default: ({ children, onClick, variant }) => (
    <button onClick={onClick} data-variant={variant}>
      {children}
    </button>
  )
}));

vi.mock('../common/Modal', () => ({
  default: ({ isOpen, children, title, footer }) => 
    isOpen ? (
      <div data-testid="modal">
        <h2>{title}</h2>
        {children}
        <div data-testid="modal-footer">{footer}</div>
      </div>
    ) : null
}));

vi.mock('../common/LoadingSkeleton', () => ({
  default: () => <div data-testid="loading-skeleton">Loading...</div>
}));

vi.mock('../tickets/TicketCard', () => ({
  default: ({ ticket, onClick }) => (
    <div data-testid={`ticket-card-${ticket.id}`} onClick={onClick}>
      {ticket.title}
    </div>
  )
}));

vi.mock('../../utils/dateFormatter', () => ({
  formatDate: (date) => new Date(date).toLocaleDateString('hr-HR')
}));

describe('AssetDetail', () => {
  const mockAsset = {
    id: 'asset-1',
    name: 'Dell PowerEdge R740',
    type: 'Hardware',
    status: 'Active',
    serialNumber: 'SN12345',
    model: 'R740',
    manufacturer: 'Dell',
    location: 'Server soba A',
    purchaseDate: '2023-01-15T00:00:00Z',
    warrantyExpiry: '2026-01-15T00:00:00Z',
    notes: 'Glavni web server',
    createdAt: '2023-01-15T10:00:00Z',
    updatedAt: '2023-06-20T14:30:00Z'
  };

  const mockLinkedTickets = [
    {
      id: 'ticket-1',
      title: 'Server ne odgovara',
      status: 'U radu',
      priority: 'Visoka'
    },
    {
      id: 'ticket-2',
      title: 'Potrebno ažuriranje',
      status: 'Nova',
      priority: 'Srednja'
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({
      user: { role: 'Administrator' }
    });
  });

  describe('Linked Tickets Display (Requirement 8.7)', () => {
    it('displays linked tickets section with ticket count', async () => {
      assetService.getAssetById.mockResolvedValue(mockAsset);
      assetService.getAssetTickets.mockResolvedValue(mockLinkedTickets);

      render(<AssetDetail assetId="asset-1" />);

      await waitFor(() => {
        expect(screen.getByText('Povezani tiketi')).toBeInTheDocument();
        expect(screen.getByText(/2 tiketa/)).toBeInTheDocument();
      });
    });

    it('displays all linked ticket cards', async () => {
      assetService.getAssetById.mockResolvedValue(mockAsset);
      assetService.getAssetTickets.mockResolvedValue(mockLinkedTickets);

      render(<AssetDetail assetId="asset-1" />);

      await waitFor(() => {
        expect(screen.getByTestId('ticket-card-ticket-1')).toBeInTheDocument();
        expect(screen.getByTestId('ticket-card-ticket-2')).toBeInTheDocument();
        expect(screen.getByText('Server ne odgovara')).toBeInTheDocument();
        expect(screen.getByText('Potrebno ažuriranje')).toBeInTheDocument();
      });
    });

    it('displays empty state when no linked tickets exist', async () => {
      assetService.getAssetById.mockResolvedValue(mockAsset);
      assetService.getAssetTickets.mockResolvedValue([]);

      render(<AssetDetail assetId="asset-1" />);

      await waitFor(() => {
        expect(screen.getByText('Povezani tiketi')).toBeInTheDocument();
        expect(screen.getByText(/Nema povezanih tiketa/)).toBeInTheDocument();
      });
    });

    it('calls onTicketClick when ticket card is clicked', async () => {
      const handleTicketClick = vi.fn();
      assetService.getAssetById.mockResolvedValue(mockAsset);
      assetService.getAssetTickets.mockResolvedValue(mockLinkedTickets);

      render(<AssetDetail assetId="asset-1" onTicketClick={handleTicketClick} />);

      await waitFor(() => {
        expect(screen.getByTestId('ticket-card-ticket-1')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('ticket-card-ticket-1'));
      expect(handleTicketClick).toHaveBeenCalledWith(mockLinkedTickets[0]);
    });

    it('handles tickets response as array', async () => {
      assetService.getAssetById.mockResolvedValue(mockAsset);
      assetService.getAssetTickets.mockResolvedValue(mockLinkedTickets);

      render(<AssetDetail assetId="asset-1" />);

      await waitFor(() => {
        expect(screen.getByTestId('ticket-card-ticket-1')).toBeInTheDocument();
      });
    });

    it('handles tickets response as object with tickets property', async () => {
      assetService.getAssetById.mockResolvedValue(mockAsset);
      assetService.getAssetTickets.mockResolvedValue({ tickets: mockLinkedTickets });

      render(<AssetDetail assetId="asset-1" />);

      await waitFor(() => {
        expect(screen.getByTestId('ticket-card-ticket-1')).toBeInTheDocument();
      });
    });

    it('handles ticket fetch error gracefully', async () => {
      assetService.getAssetById.mockResolvedValue(mockAsset);
      assetService.getAssetTickets.mockRejectedValue(new Error('Network error'));

      render(<AssetDetail assetId="asset-1" />);

      await waitFor(() => {
        expect(screen.getByText('Povezani tiketi')).toBeInTheDocument();
        expect(screen.getByText(/Nema povezanih tiketa/)).toBeInTheDocument();
      });
    });

    it('displays loading state while fetching tickets', async () => {
      assetService.getAssetById.mockResolvedValue(mockAsset);
      assetService.getAssetTickets.mockReturnValue(new Promise(() => {})); // Never resolves

      render(<AssetDetail assetId="asset-1" />);

      await waitFor(() => {
        expect(screen.getByText('Dell PowerEdge R740')).toBeInTheDocument();
      });

      // Tickets section should show loading
      const loadingSkeletons = screen.getAllByTestId('loading-skeleton');
      expect(loadingSkeletons.length).toBeGreaterThan(0);
    });
  });

  describe('Asset Information Display', () => {
    it('displays all asset details', async () => {
      assetService.getAssetById.mockResolvedValue(mockAsset);
      assetService.getAssetTickets.mockResolvedValue([]);

      render(<AssetDetail assetId="asset-1" />);

      await waitFor(() => {
        expect(screen.getByText('Dell PowerEdge R740')).toBeInTheDocument();
        expect(screen.getByTestId('type-badge')).toHaveTextContent('Hardware');
        expect(screen.getByTestId('status-badge')).toHaveTextContent('Active');
        expect(screen.getByText('Dell R740')).toBeInTheDocument();
        expect(screen.getByText('SN12345')).toBeInTheDocument();
        expect(screen.getByText('Server soba A')).toBeInTheDocument();
        expect(screen.getByText('Glavni web server')).toBeInTheDocument();
      });
    });

    it('shows loading state while fetching asset', () => {
      assetService.getAssetById.mockReturnValue(new Promise(() => {})); // Never resolves
      assetService.getAssetTickets.mockResolvedValue([]);

      render(<AssetDetail assetId="asset-1" />);

      expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
    });

    it('displays error message when asset fetch fails', async () => {
      assetService.getAssetById.mockRejectedValue({
        response: { data: { message: 'Asset not found' } }
      });
      assetService.getAssetTickets.mockResolvedValue([]);

      render(<AssetDetail assetId="asset-1" />);

      await waitFor(() => {
        expect(screen.getByText('Asset not found')).toBeInTheDocument();
      });
    });

    it('displays warranty expiring soon warning', async () => {
      const assetWithExpiringSoonWarranty = {
        ...mockAsset,
        warrantyExpiry: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString() // 15 days from now
      };
      assetService.getAssetById.mockResolvedValue(assetWithExpiringSoonWarranty);
      assetService.getAssetTickets.mockResolvedValue([]);

      render(<AssetDetail assetId="asset-1" />);

      await waitFor(() => {
        expect(screen.getByText(/Garancija uskoro ističe/)).toBeInTheDocument();
      });
    });

    it('displays expired warranty warning', async () => {
      const assetWithExpiredWarranty = {
        ...mockAsset,
        warrantyExpiry: '2020-01-15T00:00:00Z'
      };
      assetService.getAssetById.mockResolvedValue(assetWithExpiredWarranty);
      assetService.getAssetTickets.mockResolvedValue([]);

      render(<AssetDetail assetId="asset-1" />);

      await waitFor(() => {
        expect(screen.getByText(/Garancija je istekla/)).toBeInTheDocument();
      });
    });
  });

  describe('Role-Based Permissions', () => {
    it('shows edit button for Tehničar role', async () => {
      useAuth.mockReturnValue({ user: { role: 'Tehničar' } });
      assetService.getAssetById.mockResolvedValue(mockAsset);
      assetService.getAssetTickets.mockResolvedValue([]);

      render(<AssetDetail assetId="asset-1" />);

      await waitFor(() => {
        expect(screen.getByText(/Uredi/)).toBeInTheDocument();
      });
    });

    it('shows edit and delete buttons for Administrator role', async () => {
      useAuth.mockReturnValue({ user: { role: 'Administrator' } });
      assetService.getAssetById.mockResolvedValue(mockAsset);
      assetService.getAssetTickets.mockResolvedValue([]);

      render(<AssetDetail assetId="asset-1" />);

      await waitFor(() => {
        expect(screen.getByText(/Uredi/)).toBeInTheDocument();
        expect(screen.getByText(/Obriši/)).toBeInTheDocument();
      });
    });

    it('does not show edit/delete buttons for Registrirani_Korisnik', async () => {
      useAuth.mockReturnValue({ user: { role: 'Registrirani_Korisnik' } });
      assetService.getAssetById.mockResolvedValue(mockAsset);
      assetService.getAssetTickets.mockResolvedValue([]);

      render(<AssetDetail assetId="asset-1" />);

      await waitFor(() => {
        expect(screen.getByText('Dell PowerEdge R740')).toBeInTheDocument();
      });

      expect(screen.queryByText(/Uredi/)).not.toBeInTheDocument();
      expect(screen.queryByText(/Obriši/)).not.toBeInTheDocument();
    });
  });

  describe('Delete Functionality', () => {
    it('opens delete confirmation modal when delete button clicked', async () => {
      useAuth.mockReturnValue({ user: { role: 'Administrator' } });
      assetService.getAssetById.mockResolvedValue(mockAsset);
      assetService.getAssetTickets.mockResolvedValue([]);

      render(<AssetDetail assetId="asset-1" />);

      await waitFor(() => {
        expect(screen.getByText(/Obriši/)).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText(/Obriši/));

      await waitFor(() => {
        expect(screen.getByTestId('modal')).toBeInTheDocument();
        expect(screen.getByText('Potvrda brisanja')).toBeInTheDocument();
      });
    });

    it('shows warning in delete modal when asset has linked tickets', async () => {
      useAuth.mockReturnValue({ user: { role: 'Administrator' } });
      assetService.getAssetById.mockResolvedValue(mockAsset);
      assetService.getAssetTickets.mockResolvedValue(mockLinkedTickets);

      render(<AssetDetail assetId="asset-1" />);

      await waitFor(() => {
        expect(screen.getByText(/Obriši/)).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText(/Obriši/));

      await waitFor(() => {
        expect(screen.getByTestId('modal')).toBeInTheDocument();
        expect(screen.getByText(/2 povezanih tiketa/)).toBeInTheDocument();
      });
    });

    it('calls deleteAsset and onDelete callback when confirmed', async () => {
      const handleDelete = vi.fn();
      const handleClose = vi.fn();
      useAuth.mockReturnValue({ user: { role: 'Administrator' } });
      assetService.getAssetById.mockResolvedValue(mockAsset);
      assetService.getAssetTickets.mockResolvedValue([]);
      assetService.deleteAsset.mockResolvedValue();

      render(
        <AssetDetail
          assetId="asset-1"
          onDelete={handleDelete}
          onClose={handleClose}
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/Obriši/)).toBeInTheDocument();
      });

      // Open modal
      fireEvent.click(screen.getByText(/Obriši/));

      await waitFor(() => {
        expect(screen.getByTestId('modal')).toBeInTheDocument();
      });

      // Confirm delete
      const modalFooter = screen.getByTestId('modal-footer');
      const deleteButton = modalFooter.querySelector('[data-variant="danger"]');
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(assetService.deleteAsset).toHaveBeenCalledWith('asset-1');
        expect(handleDelete).toHaveBeenCalledWith('asset-1');
        expect(handleClose).toHaveBeenCalled();
      });
    });
  });

  describe('Edit Functionality', () => {
    it('calls onEdit callback when edit button clicked', async () => {
      const handleEdit = vi.fn();
      useAuth.mockReturnValue({ user: { role: 'Tehničar' } });
      assetService.getAssetById.mockResolvedValue(mockAsset);
      assetService.getAssetTickets.mockResolvedValue([]);

      render(<AssetDetail assetId="asset-1" onEdit={handleEdit} />);

      await waitFor(() => {
        expect(screen.getByText(/Uredi/)).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText(/Uredi/));
      expect(handleEdit).toHaveBeenCalledWith(mockAsset);
    });
  });
});
