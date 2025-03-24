import { useEffect, useState } from 'react';
import api from '../api/axios';
import { TrashIcon, UserPlusIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';

const UserManagementTable = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await api.get('/users');
        setUsers(data);
      } catch (error) {
        console.error('Error fetching users:', error);
        toast.error('Failed to fetch users');
      }
    };
    fetchUsers();
  }, []);

  const handleUpgrade = async (userId) => {
    try {
      const { data } = await api.post('/users/upgrade', { userId });
      setUsers(users.map(u => u._id === userId ? { ...u, role: 'doctor' } : u));
      toast.success('User upgraded to doctor successfully');
    } catch (error) {
      console.error('Upgrade error:', error);
      toast.error('Failed to upgrade user');
    }
  };

  const handleDelete = async (userId) => {
    try {
      await api.delete(`/users/${userId}`);
      setUsers(users.filter(u => u._id !== userId));
      toast.success('User deleted successfully');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete user');
    }
  };

  return (
    <div className="overflow-x-auto rounded-lg shadow bg-white p-4">
      <table className="w-full border-collapse">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-6 py-3 text-left font-semibold">Name</th>
            <th className="px-6 py-3 text-left font-semibold">Email</th>
            <th className="px-6 py-3 text-left font-semibold">Role</th>
            <th className="px-6 py-3 text-left font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {users.length > 0 ? (
            users.map(user => (
              <tr key={user._id} className="hover:bg-gray-50">
                <td className="px-6 py-4">{user.name}</td>
                <td className="px-6 py-4">{user.email}</td>
                <td className="px-6 py-4 capitalize">{user.role}</td>
                <td className="px-6 py-4 flex space-x-3">
                  {user.role === 'patient' && (
                    <button
                      onClick={() => handleUpgrade(user._id)}
                      className="text-green-600 hover:text-green-800 transition duration-200"
                    >
                      <UserPlusIcon className="w-5 h-5" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(user._id)}
                    className="text-red-600 hover:text-red-800 transition duration-200"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="text-center py-6 text-gray-500">
                No users found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default UserManagementTable;
