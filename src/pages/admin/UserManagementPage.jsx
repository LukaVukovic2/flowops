/**
 * User Management Page
 * Administrator interface for managing users
 * Requirements: 5.5, 5.9, 12.1
 */

import React, { useState, useEffect } from 'react';
import * as userService from '../../services/userService.js';
import { useNotification } from '../../context/NotificationContext.jsx';
import Button from '../../components/common/Button.jsx';
import Badge from '../../components/common/Badge.jsx';
import Modal from '../../components/common/Modal.jsx';

const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [newRole, setNewRole] = useState('');
  
  const { showSuccess, showError } = useNotification();

  // Available roles in Croatian
  const roles = [
    { value: 'Posjetitelj', label: 'Posjetitelj', variant: 'default' },
    { value: 'Registrirani_Korisnik', label: 'Registrirani Korisnik', variant: 'info' },
    { value: 'Tehničar', label: 'Tehničar', variant: 'purple' },
    { value: 'Administrator', label: 'Administrator', variant: 'danger' },
  ];

  // Load users on mount
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await userService.getUsers();
      setUsers(data.users || data);
    } catch (err) {
      console.error('Error loading users:', err);
      setError('Greška pri učitavanju korisnika');
      showError('Greška pri učitavanju korisnika');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenRoleModal = (user) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setShowRoleModal(true);
  };

  const handleOpenDeactivateModal = (user) => {
    setSelectedUser(user);
    setShowDeactivateModal(true);
  };

  const handleCloseModals = () => {
    setShowRoleModal(false);
    setShowDeactivateModal(false);
    setSelectedUser(null);
    setNewRole('');
  };

  const handleChangeRole = async () => {
    if (!selectedUser || !newRole) return;

    try {
      setActionLoading(true);
      await userService.updateUserRole(selectedUser.id, newRole);
      showSuccess('Uloga korisnika uspješno promijenjena');
      handleCloseModals();
      loadUsers(); // Reload users list
    } catch (err) {
      console.error('Error changing role:', err);
      const message = err.response?.data?.message || 'Greška pri promjeni uloge';
      showError(message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleActive = async () => {
    if (!selectedUser) return;

    try {
      setActionLoading(true);
      
      if (selectedUser.isActive) {
        await userService.deactivateUser(selectedUser.id);
        showSuccess('Korisnik uspješno deaktiviran');
      } else {
        await userService.activateUser(selectedUser.id);
        showSuccess('Korisnik uspješno aktiviran');
      }
      
      handleCloseModals();
      loadUsers(); // Reload users list
    } catch (err) {
      console.error('Error toggling user status:', err);
      const message = err.response?.data?.message || 'Greška pri promjeni statusa korisnika';
      showError(message);
    } finally {
      setActionLoading(false);
    }
  };

  const getRoleBadgeVariant = (role) => {
    const roleConfig = roles.find((r) => r.value === role);
    return roleConfig?.variant || 'default';
  };

  const getRoleLabel = (role) => {
    const roleConfig = roles.find((r) => r.value === role);
    return roleConfig?.label || role;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Učitavanje korisnika...</p>
        </div>
      </div>
    );
  }

  if (error && users.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={loadUsers}>Pokušaj ponovno</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Upravljanje korisnicima</h1>
          <p className="mt-2 text-gray-600">
            Pregledajte i upravljajte svim korisnicima sustava
          </p>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Korisnik
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Uloga
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Akcije
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {user.firstName && user.lastName
                        ? `${user.firstName} ${user.lastName}`
                        : 'Nema ime'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={getRoleBadgeVariant(user.role)}>
                      {getRoleLabel(user.role)}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={user.isActive ? 'success' : 'danger'}>
                      {user.isActive ? 'Aktivan' : 'Neaktivan'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="small"
                        variant="outline"
                        onClick={() => handleOpenRoleModal(user)}
                      >
                        Promijeni ulogu
                      </Button>
                      <Button
                        size="small"
                        variant={user.isActive ? 'danger' : 'success'}
                        onClick={() => handleOpenDeactivateModal(user)}
                      >
                        {user.isActive ? 'Deaktiviraj' : 'Aktiviraj'}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {users.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">Nema korisnika za prikaz</p>
            </div>
          )}
        </div>
      </div>

      {/* Role Change Modal */}
      <Modal
        isOpen={showRoleModal}
        onClose={handleCloseModals}
        title="Promjena uloge korisnika"
        footer={
          <>
            <Button variant="outline" onClick={handleCloseModals} disabled={actionLoading}>
              Odustani
            </Button>
            <Button
              variant="primary"
              onClick={handleChangeRole}
              loading={actionLoading}
              disabled={!newRole || newRole === selectedUser?.role}
            >
              Potvrdi promjenu
            </Button>
          </>
        }
      >
        {selectedUser && (
          <div className="space-y-4">
            <p className="text-gray-600">
              Mijenjate ulogu korisnika <strong>{selectedUser.email}</strong>
            </p>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nova uloga
              </label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {roles.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-800">
                ⚠️ Promjena uloge odmah stupa na snagu i utječe na korisnikove dozvole u sustavu.
              </p>
            </div>
          </div>
        )}
      </Modal>

      {/* Deactivate/Activate Modal */}
      <Modal
        isOpen={showDeactivateModal}
        onClose={handleCloseModals}
        title={selectedUser?.isActive ? 'Deaktivacija korisnika' : 'Aktivacija korisnika'}
        footer={
          <>
            <Button variant="outline" onClick={handleCloseModals} disabled={actionLoading}>
              Odustani
            </Button>
            <Button
              variant={selectedUser?.isActive ? 'danger' : 'success'}
              onClick={handleToggleActive}
              loading={actionLoading}
            >
              {selectedUser?.isActive ? 'Deaktiviraj' : 'Aktiviraj'}
            </Button>
          </>
        }
      >
        {selectedUser && (
          <div className="space-y-4">
            <p className="text-gray-600">
              {selectedUser.isActive ? (
                <>
                  Jeste li sigurni da želite deaktivirati korisnika{' '}
                  <strong>{selectedUser.email}</strong>?
                </>
              ) : (
                <>
                  Jeste li sigurni da želite aktivirati korisnika{' '}
                  <strong>{selectedUser.email}</strong>?
                </>
              )}
            </p>

            {selectedUser.isActive && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-800">
                  ⚠️ Deaktivirani korisnik neće se moći prijaviti u sustav sve dok ga ponovno ne aktivirate.
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default UserManagementPage;
