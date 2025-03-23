import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MenuIcon, XIcon } from '@heroicons/react/outline';

const Sidebar = ({ role }) => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = {
    patient: [
      { name: 'Dashboard', path: '/patient' },
      { name: 'Book Appointment', path: '/patient/book' },
    ],
    doctor: [
      { name: 'Appointments', path: '/doctor' },
      { name: 'Set Availability', path: '/doctor/availability' },
      { name: 'Profile', path: '/doctor/profile' },
    ],
    admin: [
      { name: 'Users', path: '/admin' },
      { name: 'Manage Doctors', path: '/admin/doctors' },
    ]
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 right-4 p-2 z-50 bg-white rounded shadow"
      >
        {isOpen ? (
          <XIcon className="w-6 h-6" />
        ) : (
          <MenuIcon className="w-6 h-6" />
        )}
      </button>

      {/* Sidebar */}
      <aside className={`md:static md:translate-x-0 fixed top-0 left-0 w-64 h-full bg-white shadow-md transform transition-transform duration-300 ease-in-out z-40 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold">{user?.role} Dashboard</h2>
          <p className="text-sm text-gray-600 truncate">{user?.email}</p>
        </div>
        
        <nav className="p-4">
          {navItems[role].map((item) => (
            <Link 
              key={item.name}
              to={item.path}
              className="block p-2 hover:bg-gray-50 rounded mb-1"
              onClick={() => setIsOpen(false)}
            >
              {item.name}
            </Link>
          ))}
          <button
            onClick={logout}
            className="w-full text-left p-2 hover:bg-gray-50 rounded text-red-600 mt-4"
          >
            Logout
          </button>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;