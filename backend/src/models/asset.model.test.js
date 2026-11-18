/**
 * Asset Model Tests
 * Unit tests for asset data access layer
 * Requirements: 8.1, 8.2, 8.3
 */

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import * as AssetModel from './asset.model.js';
import supabase from '../config/database.js';

describe('Asset Model', () => {
  let testAssetId;
  const createdAssetIds = [];

  // Cleanup function to remove test assets
  after(async () => {
    for (const assetId of createdAssetIds) {
      try {
        await supabase.from('assets').delete().eq('id', assetId);
      } catch (error) {
        console.error(`Failed to cleanup asset ${assetId}:`, error.message);
      }
    }
  });

  describe('createAsset', () => {
    it('should create an asset with required fields', async () => {
      const assetData = {
        name: 'Dell PowerEdge R740',
        type: 'Hardware',
        status: 'Active',
      };

      const asset = await AssetModel.createAsset(assetData);

      assert.ok(asset);
      assert.strictEqual(asset.name, assetData.name);
      assert.strictEqual(asset.type, assetData.type);
      assert.strictEqual(asset.status, assetData.status);
      assert.ok(asset.id);
      assert.ok(asset.created_at);
      assert.ok(asset.updated_at);

      testAssetId = asset.id;
      createdAssetIds.push(asset.id);
    });

    it('should create an asset with all optional fields', async () => {
      const assetData = {
        name: 'Cisco Catalyst 9300',
        type: 'Network',
        status: 'Active',
        serialNumber: 'SN123456789',
        model: 'C9300-48P',
        manufacturer: 'Cisco',
        location: 'Server Room A',
        purchaseDate: '2024-01-15',
        warrantyExpiry: '2027-01-15',
        notes: 'Primary network switch',
      };

      const asset = await AssetModel.createAsset(assetData);

      assert.ok(asset);
      assert.strictEqual(asset.name, assetData.name);
      assert.strictEqual(asset.serial_number, assetData.serialNumber);
      assert.strictEqual(asset.model, assetData.model);
      assert.strictEqual(asset.manufacturer, assetData.manufacturer);
      assert.strictEqual(asset.location, assetData.location);
      assert.strictEqual(asset.notes, assetData.notes);

      createdAssetIds.push(asset.id);
    });

    it('should validate type enum - Hardware', async () => {
      const assetData = {
        name: 'HP ProLiant Server',
        type: 'Hardware',
        status: 'Active',
      };

      const asset = await AssetModel.createAsset(assetData);
      assert.strictEqual(asset.type, 'Hardware');
      createdAssetIds.push(asset.id);
    });

    it('should validate type enum - Software', async () => {
      const assetData = {
        name: 'Microsoft Office 365',
        type: 'Software',
        status: 'Active',
      };

      const asset = await AssetModel.createAsset(assetData);
      assert.strictEqual(asset.type, 'Software');
      createdAssetIds.push(asset.id);
    });

    it('should validate type enum - Network', async () => {
      const assetData = {
        name: 'Ubiquiti UniFi AP',
        type: 'Network',
        status: 'Active',
      };

      const asset = await AssetModel.createAsset(assetData);
      assert.strictEqual(asset.type, 'Network');
      createdAssetIds.push(asset.id);
    });

    it('should validate type enum - Peripheral', async () => {
      const assetData = {
        name: 'HP LaserJet Pro',
        type: 'Peripheral',
        status: 'Active',
      };

      const asset = await AssetModel.createAsset(assetData);
      assert.strictEqual(asset.type, 'Peripheral');
      createdAssetIds.push(asset.id);
    });

    it('should validate status enum - Active', async () => {
      const assetData = {
        name: 'Active Asset',
        type: 'Hardware',
        status: 'Active',
      };

      const asset = await AssetModel.createAsset(assetData);
      assert.strictEqual(asset.status, 'Active');
      createdAssetIds.push(asset.id);
    });

    it('should validate status enum - Inactive', async () => {
      const assetData = {
        name: 'Inactive Asset',
        type: 'Hardware',
        status: 'Inactive',
      };

      const asset = await AssetModel.createAsset(assetData);
      assert.strictEqual(asset.status, 'Inactive');
      createdAssetIds.push(asset.id);
    });

    it('should validate status enum - Maintenance', async () => {
      const assetData = {
        name: 'Maintenance Asset',
        type: 'Hardware',
        status: 'Maintenance',
      };

      const asset = await AssetModel.createAsset(assetData);
      assert.strictEqual(asset.status, 'Maintenance');
      createdAssetIds.push(asset.id);
    });

    it('should validate status enum - Retired', async () => {
      const assetData = {
        name: 'Retired Asset',
        type: 'Hardware',
        status: 'Retired',
      };

      const asset = await AssetModel.createAsset(assetData);
      assert.strictEqual(asset.status, 'Retired');
      createdAssetIds.push(asset.id);
    });

    it('should reject invalid type enum', async () => {
      const assetData = {
        name: 'Invalid Type Asset',
        type: 'InvalidType',
        status: 'Active',
      };

      await assert.rejects(
        async () => await AssetModel.createAsset(assetData),
        {
          message: /Invalid asset type/,
        }
      );
    });

    it('should reject invalid status enum', async () => {
      const assetData = {
        name: 'Invalid Status Asset',
        type: 'Hardware',
        status: 'InvalidStatus',
      };

      await assert.rejects(
        async () => await AssetModel.createAsset(assetData),
        {
          message: /Invalid asset status/,
        }
      );
    });

    it('should reject missing required fields', async () => {
      const assetData = {
        name: 'Missing Status',
        type: 'Hardware',
      };

      await assert.rejects(
        async () => await AssetModel.createAsset(assetData),
        {
          message: /required fields/,
        }
      );
    });
  });

  describe('getAssetById', () => {
    it('should retrieve an asset by ID', async () => {
      const asset = await AssetModel.getAssetById(testAssetId);

      assert.ok(asset);
      assert.strictEqual(asset.id, testAssetId);
      assert.strictEqual(asset.name, 'Dell PowerEdge R740');
      assert.strictEqual(asset.type, 'Hardware');
      assert.strictEqual(asset.status, 'Active');
    });

    it('should return null for non-existent asset', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const asset = await AssetModel.getAssetById(fakeId);

      assert.strictEqual(asset, null);
    });
  });

  describe('getAssets', () => {
    before(async () => {
      // Create additional test assets for filtering
      const testAssets = [
        {
          name: 'Test Software 1',
          type: 'Software',
          status: 'Active',
          location: 'Cloud',
        },
        {
          name: 'Test Hardware 1',
          type: 'Hardware',
          status: 'Maintenance',
          location: 'Server Room B',
        },
        {
          name: 'Test Network 1',
          type: 'Network',
          status: 'Retired',
          location: 'Server Room A',
        },
      ];

      for (const assetData of testAssets) {
        const asset = await AssetModel.createAsset(assetData);
        createdAssetIds.push(asset.id);
      }
    });

    it('should retrieve all assets with pagination', async () => {
      const result = await AssetModel.getAssets({ page: 1, limit: 10 });

      assert.ok(result);
      assert.ok(Array.isArray(result.assets));
      assert.ok(result.assets.length > 0);
      assert.ok(result.pagination);
      assert.strictEqual(result.pagination.page, 1);
      assert.strictEqual(result.pagination.limit, 10);
      assert.ok(result.pagination.total > 0);
    });

    it('should filter assets by type', async () => {
      const result = await AssetModel.getAssets({ type: 'Software' });

      assert.ok(result);
      assert.ok(result.assets.length > 0);

      // Verify all returned assets have the correct type
      for (const asset of result.assets) {
        assert.strictEqual(asset.type, 'Software');
      }
    });

    it('should filter assets by status', async () => {
      const result = await AssetModel.getAssets({ status: 'Active' });

      assert.ok(result);
      assert.ok(result.assets.length > 0);

      // Verify all returned assets have the correct status
      for (const asset of result.assets) {
        assert.strictEqual(asset.status, 'Active');
      }
    });

    it('should filter assets by location', async () => {
      const result = await AssetModel.getAssets({ location: 'Server Room' });

      assert.ok(result);
      assert.ok(result.assets.length > 0);

      // Verify all returned assets have locations containing the search term
      for (const asset of result.assets) {
        assert.ok(asset.location.includes('Server Room'));
      }
    });

    it('should combine multiple filters', async () => {
      const result = await AssetModel.getAssets({
        type: 'Hardware',
        status: 'Maintenance',
      });

      assert.ok(result);

      // Verify all returned assets match both filters
      for (const asset of result.assets) {
        assert.strictEqual(asset.type, 'Hardware');
        assert.strictEqual(asset.status, 'Maintenance');
      }
    });

    it('should reject invalid type filter', async () => {
      await assert.rejects(
        async () => await AssetModel.getAssets({ type: 'InvalidType' }),
        {
          message: /Invalid asset type filter/,
        }
      );
    });

    it('should reject invalid status filter', async () => {
      await assert.rejects(
        async () => await AssetModel.getAssets({ status: 'InvalidStatus' }),
        {
          message: /Invalid asset status filter/,
        }
      );
    });
  });

  describe('updateAsset', () => {
    it('should update asset fields', async () => {
      const updates = {
        name: 'Updated Asset Name',
        location: 'Updated Location',
        notes: 'Updated notes',
      };

      const updatedAsset = await AssetModel.updateAsset(testAssetId, updates);

      assert.ok(updatedAsset);
      assert.strictEqual(updatedAsset.name, updates.name);
      assert.strictEqual(updatedAsset.location, updates.location);
      assert.strictEqual(updatedAsset.notes, updates.notes);
      assert.strictEqual(updatedAsset.id, testAssetId);
    });

    it('should update asset status', async () => {
      const updates = {
        status: 'Maintenance',
      };

      const updatedAsset = await AssetModel.updateAsset(testAssetId, updates);

      assert.ok(updatedAsset);
      assert.strictEqual(updatedAsset.status, 'Maintenance');
    });

    it('should update asset type', async () => {
      const updates = {
        type: 'Network',
      };

      const updatedAsset = await AssetModel.updateAsset(testAssetId, updates);

      assert.ok(updatedAsset);
      assert.strictEqual(updatedAsset.type, 'Network');
    });

    it('should reject invalid type in update', async () => {
      const updates = {
        type: 'InvalidType',
      };

      await assert.rejects(
        async () => await AssetModel.updateAsset(testAssetId, updates),
        {
          message: /Invalid asset type/,
        }
      );
    });

    it('should reject invalid status in update', async () => {
      const updates = {
        status: 'InvalidStatus',
      };

      await assert.rejects(
        async () => await AssetModel.updateAsset(testAssetId, updates),
        {
          message: /Invalid asset status/,
        }
      );
    });

    it('should reject update with no valid fields', async () => {
      const updates = {};

      await assert.rejects(
        async () => await AssetModel.updateAsset(testAssetId, updates),
        {
          message: /No valid fields to update/,
        }
      );
    });
  });

  describe('deleteAsset', () => {
    it('should delete an asset', async () => {
      // Create a temporary asset to delete
      const tempAsset = await AssetModel.createAsset({
        name: 'Temp Asset for Deletion',
        type: 'Hardware',
        status: 'Active',
      });

      const result = await AssetModel.deleteAsset(tempAsset.id);

      assert.strictEqual(result, true);

      // Verify asset is deleted
      const deletedAsset = await AssetModel.getAssetById(tempAsset.id);
      assert.strictEqual(deletedAsset, null);
    });
  });

  describe('getValidTypes', () => {
    it('should return valid asset types', () => {
      const types = AssetModel.getValidTypes();

      assert.ok(Array.isArray(types));
      assert.strictEqual(types.length, 4);
      assert.ok(types.includes('Hardware'));
      assert.ok(types.includes('Software'));
      assert.ok(types.includes('Network'));
      assert.ok(types.includes('Peripheral'));
    });
  });

  describe('getValidStatuses', () => {
    it('should return valid asset statuses', () => {
      const statuses = AssetModel.getValidStatuses();

      assert.ok(Array.isArray(statuses));
      assert.strictEqual(statuses.length, 4);
      assert.ok(statuses.includes('Active'));
      assert.ok(statuses.includes('Inactive'));
      assert.ok(statuses.includes('Maintenance'));
      assert.ok(statuses.includes('Retired'));
    });
  });
});
