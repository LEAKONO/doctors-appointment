import Sidebar from '../components/Sidebar';
import UserManagementTable from '../components/UserManagementTable';
import { useAuth } from '../context/AuthContext';
import { 
  ChartBarIcon, 
  UsersIcon, 
  CogIcon, 
  BellIcon, 
  MagnifyingGlassIcon as SearchIcon 
} from '@heroicons/react/24/outline';
import { useState, useEffect } from 'react';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    newUsers: 0,
    doctors: 0
  });
  const [notifications, setNotifications] = useState([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  // Simulate fetching data
  useEffect(() => {
    // In a real app, you would fetch these from your API
    setStats({
      totalUsers: 1243,
      activeUsers: 892,
      newUsers: 42,
      doctors: 156
    });
    
    setNotifications([
      { id: 1, title: 'New user registered', message: 'John Doe just signed up', time: '2 mins ago', read: false },
      { id: 2, title: 'System update', message: 'New version available (v2.3.1)', time: '1 hour ago', read: false },
      { id: 3, title: 'Appointment reminder', message: 'Dr. Smith has an upcoming appointment', time: '3 hours ago', read: true }
    ]);
    
    setUnreadNotifications(2);
  }, []);

  const markAsRead = (id) => {
    setNotifications(notifications.map(n => 
      n.id === id ? {...n, read: true} : n
    ));
    setUnreadNotifications(unreadNotifications - 1);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Enhanced Sidebar */}
      <Sidebar role="admin" />
      
      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {/* Top Navigation Bar */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-full leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Search..."
              />
            </div>
            
            <button className="relative p-1 text-gray-500 hover:text-gray-700 focus:outline-none">
              <BellIcon className="h-6 w-6" />
              {unreadNotifications > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
                  {unreadNotifications}
                </span>
              )}
            </button>
            
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-medium text-gray-700">{user?.name}</span>
            </div>
          </div>
        </header>
        
        {/* Dashboard Content */}
        <main className="p-6 overflow-y-auto h-[calc(100vh-72px)]">
          {/* Welcome Banner */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-6 mb-6 text-white shadow-lg">
            <h2 className="text-2xl font-bold mb-2">Welcome back, {user?.name}</h2>
            <p className="opacity-90">Here's what's happening with your platform today</p>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Users</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.totalUsers}</p>
                </div>
                <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                  <UsersIcon className="h-6 w-6" />
                </div>
              </div>
              <p className="mt-2 text-xs text-green-600 font-medium">+12% from last month</p>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Active Users</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.activeUsers}</p>
                </div>
                <div className="p-3 rounded-full bg-green-100 text-green-600">
                  <UsersIcon className="h-6 w-6" />
                </div>
              </div>
              <p className="mt-2 text-xs text-green-600 font-medium">+8% from last month</p>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-purple-500 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">New Users</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.newUsers}</p>
                </div>
                <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                  <UsersIcon className="h-6 w-6" />
                </div>
              </div>
              <p className="mt-2 text-xs text-green-600 font-medium">+24% from last week</p>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-indigo-500 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Doctors</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.doctors}</p>
                </div>
                <div className="p-3 rounded-full bg-indigo-100 text-indigo-600">
                  <UsersIcon className="h-6 w-6" />
                </div>
              </div>
              <p className="mt-2 text-xs text-green-600 font-medium">+5% from last month</p>
            </div>
          </div>
          
          {/* Main Content Area */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* User Management Section */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">User Management</h2>
                  <div className="flex space-x-2">
                    <button className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors duration-200">
                      Export
                    </button>
                    <button className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors duration-200">
                      Add User
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <UserManagementTable />
                </div>
              </div>
            </div>
            
            {/* Recent Activity Sidebar */}
            <div className="space-y-6">
              {/* Notifications Card */}
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
                </div>
                <div className="divide-y divide-gray-200">
                  {notifications.map((notification) => (
                    <div 
                      key={notification.id} 
                      className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors duration-150 ${!notification.read ? 'bg-blue-50' : ''}`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex items-start">
                        <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${!notification.read ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                          <BellIcon className="h-5 w-5" />
                        </div>
                        <div className="ml-3">
                          <p className={`text-sm font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-500'}`}>
                            {notification.title}
                          </p>
                          <p className="text-sm text-gray-500">{notification.message}</p>
                          <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-6 py-3 bg-gray-50 text-center">
                  <button className="text-sm font-medium text-blue-600 hover:text-blue-800">
                    View all notifications
                  </button>
                </div>
              </div>
              
              {/* Quick Stats Card */}
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Platform Overview</h2>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-gray-500">Storage</span>
                        <span className="font-medium text-gray-900">65% used</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: '65%' }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-gray-500">Memory</span>
                        <span className="font-medium text-gray-900">42% used</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ width: '42%' }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-gray-500">CPU</span>
                        <span className="font-medium text-gray-900">28% used</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-purple-500 h-2 rounded-full" 
                          style={{ width: '28%' }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;