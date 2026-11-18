/**
 * AssetList Component Tests
 * Tests for list view with pagination (Requirement 8.9)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AssetList from './AssetList';
import * as assetService from '../../services/assetService';

// Mock the asset service
vi.mock('../../services/assetService', () => ({
  getAssets: vi.fn()
}));

// Mock child components
vi.mock('./AssetCard', () => ({
  default: ({ asset, onClick }) => (
    <div data-testid={`asset-card-${asset.id}`} onClick={onClick}>
      {asset.name}
    </div>
  )
}));

vi.mock('../common/Button', () => ({
  default: ({ children, onClick }) => (
    <button onClick={onClick}>{children}</button>
  )
}));

vi.mock('../common/Input', () => ({
  default: ({ value, onChange, placeholder }) => (
    <input
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      data-testid="search-input"
    />
  )
}));

vi.mock('../common/Select', () => ({
  default: ({ options, value, onChange }) => (
    <select value={value} onChange={onChange} data-testid="filter-select">
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  )
}));

vi.mock('../common/LoadingSkeleton', () => ({
  default: () => <div data-testid="loading-skeleton">Loading...</div>
}));

vi.mock('../common/Pagination', () => ({
  default: ({ currentPage, totalPages, onPageChange }) => (
    <div data-testid="pagination">
      <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>
        Previous
      </button>
      <span>Page {currentPage} of {totalPages}</span>
      <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}>
        Next
      </button>
    </div>
  )
}));

describe('AssetList', () => {
  const mockAssets = [
    {
      id: '1',
      name: 'Server Dell R740',
      type: 'Hardware',
      status: 'Active',
      location: 'Server soba A'
    },
    {
      id: '2',
      name: 'Windows Server 2022',
      type: 'Software',
      status: 'Active',
      location: 'Cloud'
    },
    {
      id: '3',
      name: 'Cisco Switch',
      type: 'Network',
      status: 'Maintenance',
      location: 'Server soba B'
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Pagination (Requirement 8.9)', () => {
    it('displays pagination when there are multiple pages', async () => {
      assetService.getAssets.mockResolvedValue({
        assets: mockAssets,
        pagination: {
          page: 1,
          totalPages: 3,
          total: 60,
          limit: 20
        }
      });

      render(<AssetList />);

      await waitFor(() => {
        expect(screen.getByTestId('pagination')).toBeInTheDocument();
        expect(screen.getByText(/Page 1 of 3/)).toBeInTheDocument();
      });
    });

    it('does not display pagination when there is only one page', async () => {
      assetService.getAssets.mockResolvedValue({
        assets: mockAssets,
        pagination: {
          page: 1,
          totalPages: 1,
          total: 3,
          limit: 20
        }
      });

      render(<AssetList />);

      await waitFor(() => {
        expect(screen.queryByTestId('pagination')).not.toBeInTheDocument();
      });
    });

    it('changes page when pagination controls are clicked', async () => {
      assetService.getAssets.mockResolvedValue({
        assets: mockAssets,
        pagination: {
          page: 1,
          totalPages: 3,
          total: 60,
          limit: 20
        }
      });

      render(<AssetList />);

      await waitFor(() => {
        expect(screen.getByText(/Page 1 of 3/)).toBeInTheDocument();
      });

      // Click next page
      const nextButton = screen.getByText('Next');
      fireEvent.click(nextButton);

      await waitFor(() => {
        expect(assetService.getAssets).toHaveBeenCalledWith(
          expect.objectContaining({ page: 2 })
        );
      });
    });
  });

  describe('Asset List Display', () => {
    it('renders asset cards for all assets', async () => {
      assetService.getAssets.mockResolvedValue({
        assets: mockAssets,
        pagination: { page: 1, totalPages: 1 }
      });

      render(<AssetList />);

      await waitFor(() => {
        expect(screen.getByTestId('asset-card-1')).toBeInTheDocument();
        expect(screen.getByTestId('asset-card-2')).toBeInTheDocument();
        expect(screen.getByTestId('asset-card-3')).toBeInTheDocument();
      });
    });

    it('shows loading state while fetching assets', () => {
      assetService.getAssets.mockReturnValue(new Promise(() => {})); // Never resolves

      render(<AssetList />);

      expect(screen.getAllByTestId('loading-skeleton').length).toBeGreaterThan(0);
    });

    it('displays error message when fetch fails', async () => {
      assetService.getAssets.mockRejectedValue({
        response: { data: { message: 'Greška pri učitavanju' } }
      });

      render(<AssetList />);

      await waitFor(() => {
        expect(screen.getByText('Greška pri učitavanju')).toBeInTheDocument();
      });
    });

    it('displays empty state when no assets found', async () => {
      assetService.getAssets.mockResolvedValue({
        assets: [],
        pagination: { page: 1, totalPages: 1 }
      });

      render(<AssetList />);

      await waitFor(() => {
        expect(screen.getByText('Nema pronađene imovine')).toBeInTheDocument();
      });
    });
  });

  describe('Filtering', () => {
    it('applies type filter when changed', async () => {
      assetService.getAssets.mockResolvedValue({
        assets: mockAssets,
        pagination: { page: 1, totalPages: 1 }
      });

      render(<AssetList />);

      await waitFor(() => {
        expect(screen.getByTestId('asset-card-1')).toBeInTheDocument();
      });

      // Change type filter
      const selects = screen.getAllByTestId('filter-select');
      fireEvent.change(selects[0], { target: { value: 'Hardware' } });

      await waitFor(() => {
        expect(assetService.getAssets).toHaveBeenCalledWith(
          expect.objectContaining({ type: 'Hardware', page: 1 })
        );
      });
    });

    it('applies status filter when changed', async () => {
      assetService.getAssets.mockResolvedValue({
        assets: mockAssets,
        pagination: { page: 1, totalPages: 1 }
      });

      render(<AssetList />);

      await waitFor(() => {
        expect(screen.getByTestId('asset-card-1')).toBeInTheDocument();
      });

      // Change status filter
      const selects = screen.getAllByTestId('filter-select');
      fireEvent.change(selects[1], { target: { value: 'Active' } });

      await waitFor(() => {
        expect(assetService.getAssets).toHaveBeenCalledWith(
          expect.objectContaining({ status: 'Active', page: 1 })
        );
      });
    });

    it('filters assets locally by search term', async () => {
      assetService.getAssets.mockResolvedValue({
        assets: mockAssets,
        pagination: { page: 1, totalPages: 1 }
      });

      render(<AssetList />);

      await waitFor(() => {
        expect(screen.getByTestId('asset-card-1')).toBeInTheDocument();
        expect(screen.getByTestId('asset-card-2')).toBeInTheDocument();
        expect(screen.getByTestId('asset-card-3')).toBeInTheDocument();
      });

      // Enter search term
      const searchInput = screen.getByTestId('search-input');
      fireEvent.change(searchInput, { target: { value: 'Dell' } });

      await waitFor(() => {
        expect(screen.getByTestId('asset-card-1')).toBeInTheDocument();
        expect(screen.queryByTestId('asset-card-2')).not.toBeInTheDocument();
        expect(screen.queryByTestId('asset-card-3')).not.toBeInTheDocument();
      });
    });
  });

  describe('User Interactions', () => {
    it('calls onAssetClick when asset card is clicked', async () => {
      const handleAssetClick = vi.fn();
      assetService.getAssets.mockResolvedValue({
        assets: mockAssets,
        pagination: { page: 1, totalPages: 1 }
      });

      render(<AssetList onAssetClick={handleAssetClick} />);

      await waitFor(() => {
        expect(screen.getByTestId('asset-card-1')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('asset-card-1'));
      expect(handleAssetClick).toHaveBeenCalledWith(mockAssets[0]);
    });

    it('calls onCreateClick when create button is clicked', async () => {
      const handleCreateClick = vi.fn();
      assetService.getAssets.mockResolvedValue({
        assets: mockAssets,
        pagination: { page: 1, totalPages: 1 }
      });

      render(<AssetList onCreateClick={handleCreateClick} />);

      await waitFor(() => {
        expect(screen.getByText(/Nova imovina/)).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText(/Nova imovina/));
      expect(handleCreateClick).toHaveBeenCalled();
    });
  });

  describe('Array Response Handling', () => {
    it('handles response when API returns array directly', async () => {
      assetService.getAssets.mockResolvedValue(mockAssets);

      render(<AssetList />);

      await waitFor(() => {
        expect(screen.getByTestId('asset-card-1')).toBeInTheDocument();
        expect(screen.getByTestId('asset-card-2')).toBeInTheDocument();
        expect(screen.getByTestId('asset-card-3')).toBeInTheDocument();
      });
    });
  });
});
