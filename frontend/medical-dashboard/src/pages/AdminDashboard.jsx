import Sidebar from '../components/Sidebar';
import UserManagementTable from '../components/UserManagementTable';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen">
      <Sidebar role="admin" />
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-8">Admin Dashboard</h1>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">User Management</h2>
          <UserManagementTable />
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;