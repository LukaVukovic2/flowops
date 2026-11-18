/**
 * Asset Schema Tests
 * Tests for asset validation schemas
 * Requirements: 8.1, 8.4, 12.1, 12.6
 */

import { describe, it, expect } from 'vitest';
import { assetSchema } from './assetSchemas';

describe('assetSchema', () => {
  describe('name field', () => {
    it('should accept valid name', () => {
      const result = assetSchema.safeParse({
        name: 'Dell PowerEdge R740',
        type: 'Hardware',
        status: 'Active'
      });
      
      expect(result.success).toBe(true);
    });

    it('should reject empty name', () => {
      const result = assetSchema.safeParse({
        name: '',
        type: 'Hardware',
        status: 'Active'
      });
      
      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toBe('Naziv je obavezan');
    });

    it('should reject name longer than 255 characters', () => {
      const longName = 'a'.repeat(256);
      const result = assetSchema.safeParse({
        name: longName,
        type: 'Hardware',
        status: 'Active'
      });
      
      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toContain('255');
    });
  });

  describe('type field', () => {
    it('should accept valid types', () => {
      const validTypes = ['Hardware', 'Software', 'Network', 'Peripheral'];
      
      validTypes.forEach(type => {
        const result = assetSchema.safeParse({
          name: 'Test Asset',
          type,
          status: 'Active'
        });
        
        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid type', () => {
      const result = assetSchema.safeParse({
        name: 'Test Asset',
        type: 'InvalidType',
        status: 'Active'
      });
      
      expect(result.success).toBe(false);
      // Zod enum messages may vary, just check it fails
      expect(result.error.issues.some(issue => issue.path.includes('type'))).toBe(true);
    });
  });

  describe('status field', () => {
    it('should accept valid statuses', () => {
      const validStatuses = ['Active', 'Inactive', 'Maintenance', 'Retired'];
      
      validStatuses.forEach(status => {
        const result = assetSchema.safeParse({
          name: 'Test Asset',
          type: 'Hardware',
          status
        });
        
        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid status', () => {
      const result = assetSchema.safeParse({
        name: 'Test Asset',
        type: 'Hardware',
        status: 'InvalidStatus'
      });
      
      expect(result.success).toBe(false);
      // Zod enum messages may vary, just check it fails
      expect(result.error.issues.some(issue => issue.path.includes('status'))).toBe(true);
    });
  });

  describe('optional fields', () => {
    it('should accept asset with only required fields', () => {
      const result = assetSchema.safeParse({
        name: 'Test Asset',
        type: 'Hardware',
        status: 'Active'
      });
      
      expect(result.success).toBe(true);
    });

    it('should accept asset with all fields', () => {
      const result = assetSchema.safeParse({
        name: 'Dell PowerEdge R740',
        type: 'Hardware',
        status: 'Active',
        serialNumber: 'SN123456',
        model: 'R740',
        manufacturer: 'Dell',
        location: 'Server Room A',
        purchaseDate: '2024-01-15',
        warrantyExpiry: '2027-01-15',
        notes: 'Main web server'
      });
      
      expect(result.success).toBe(true);
    });

    it('should accept empty string for optional fields', () => {
      const result = assetSchema.safeParse({
        name: 'Test Asset',
        type: 'Hardware',
        status: 'Active',
        serialNumber: '',
        model: '',
        manufacturer: '',
        location: '',
        notes: ''
      });
      
      expect(result.success).toBe(true);
    });

    it('should accept null for optional fields', () => {
      const result = assetSchema.safeParse({
        name: 'Test Asset',
        type: 'Hardware',
        status: 'Active',
        serialNumber: null,
        model: null,
        manufacturer: null,
        location: null,
        notes: null
      });
      
      expect(result.success).toBe(true);
    });
  });

  describe('serialNumber field', () => {
    it('should reject serial number longer than 100 characters', () => {
      const longSerial = 'S'.repeat(101);
      const result = assetSchema.safeParse({
        name: 'Test Asset',
        type: 'Hardware',
        status: 'Active',
        serialNumber: longSerial
      });
      
      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toContain('100');
    });
  });

  describe('date fields', () => {
    it('should accept valid purchase date', () => {
      const result = assetSchema.safeParse({
        name: 'Test Asset',
        type: 'Hardware',
        status: 'Active',
        purchaseDate: '2024-01-15'
      });
      
      expect(result.success).toBe(true);
    });

    it('should accept valid warranty expiry date', () => {
      const result = assetSchema.safeParse({
        name: 'Test Asset',
        type: 'Hardware',
        status: 'Active',
        warrantyExpiry: '2027-01-15'
      });
      
      expect(result.success).toBe(true);
    });

    it('should reject invalid purchase date', () => {
      const result = assetSchema.safeParse({
        name: 'Test Asset',
        type: 'Hardware',
        status: 'Active',
        purchaseDate: 'invalid-date'
      });
      
      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toBe('Nevažeći datum kupovine');
    });

    it('should reject invalid warranty expiry date', () => {
      const result = assetSchema.safeParse({
        name: 'Test Asset',
        type: 'Hardware',
        status: 'Active',
        warrantyExpiry: 'invalid-date'
      });
      
      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toBe('Nevažeći datum isteka garancije');
    });

    it('should accept empty string for dates', () => {
      const result = assetSchema.safeParse({
        name: 'Test Asset',
        type: 'Hardware',
        status: 'Active',
        purchaseDate: '',
        warrantyExpiry: ''
      });
      
      expect(result.success).toBe(true);
    });
  });

  describe('notes field', () => {
    it('should accept notes up to 2000 characters', () => {
      const notes = 'a'.repeat(2000);
      const result = assetSchema.safeParse({
        name: 'Test Asset',
        type: 'Hardware',
        status: 'Active',
        notes
      });
      
      expect(result.success).toBe(true);
    });

    it('should reject notes longer than 2000 characters', () => {
      const longNotes = 'a'.repeat(2001);
      const result = assetSchema.safeParse({
        name: 'Test Asset',
        type: 'Hardware',
        status: 'Active',
        notes: longNotes
      });
      
      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toContain('2000');
    });
  });

  describe('Croatian error messages', () => {
    it('should provide error messages in Croatian', () => {
      const result = assetSchema.safeParse({
        name: '',
        type: 'Hardware',
        status: 'Active'
      });
      
      expect(result.success).toBe(false);
      
      const messages = result.error.issues.map(issue => issue.message);
      expect(messages).toContain('Naziv je obavezan');
    });
  });
});
