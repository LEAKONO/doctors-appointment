import { useEffect, useState } from 'react';
import api from '../api/axios';
import { TrashIcon, UserPlusIcon } from '@heroicons/react/24/outline';

const UserManagementTable = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await api.get('/auth/users');
        setUsers(data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    fetchUsers();
  }, []);

  const handleUpgrade = async (userId) => {
    try {
      await api.post('/auth/upgrade', { userId });
      setUsers(users.map(u => u._id === userId ? { ...u, role: 'doctor' } : u));
    } catch (error) {
      console.error('Upgrade error:', error);
    }
  };

  const handleDelete = async (userId) => {
    try {
      await api.delete(`/auth/${userId}`);
      setUsers(users.filter(u => u._id !== userId));
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  return (
    <div className="overflow-x-auto rounded-lg shadow">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left">Name</th>
            <th className="px-6 py-3 text-left">Email</th>
            <th className="px-6 py-3 text-left">Role</th>
            <th className="px-6 py-3 text-left">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {users.map(user => (
            <tr key={user._id}>
              <td className="px-6 py-4">{user.name}</td>
              <td className="px-6 py-4">{user.email}</td>
              <td className="px-6 py-4 capitalize">{user.role}</td>
              <td className="px-6 py-4 space-x-2">
                {user.role === 'patient' && (
                  <button
                    onClick={() => handleUpgrade(user._id)}
                    className="text-green-600 hover:text-green-800"
                  >
                    <UserPlusIcon className="w-5 h-5" />
                  </button>
                )}
                <button
                  onClick={() => handleDelete(user._id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserManagementTable;