import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/solid";
import { Home, Calendar, User, Users, LogOut } from "lucide-react";

const Sidebar = ({ role }) => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const handleNavClick = (item) => {
    if (item.scrollId) {
      const element = document.getElementById(item.scrollId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
      setIsOpen(false);
    }
  };

  const navItems = {
    patient: [
      { name: "Home", path: "/patient", icon: <Home size={20} /> },
      { name: "Appointments", scrollId: "appointments-section", icon: <Calendar size={20} /> },
      { name: "Profile", path: "/profile", icon: <User size={20} /> },
      { name: "Logout", action: logout, icon: <LogOut size={20} />, isLogout: true },
    ],
    doctor: [
      { name: "Appointments", scrollId: "appointments-section", icon: <Calendar size={20} /> },
      { name: "Set Availability", scrollId: "availability-section", icon: <Calendar size={20} /> },
      { name: "Profile", path: "/profile", icon: <User size={20} /> },
      { name: "Logout", action: logout, icon: <LogOut size={20} />, isLogout: true },
    ],
    admin: [
      { name: "Users", path: "/admin", icon: <Users size={20} /> },
      { name: "Manage Doctors", scrollId: "manage-doctors-section", icon: <User size={20} /> },
      { name: "Profile", scrollId: "profile-section", icon: <User size={20} /> },
      { name: "Logout", action: logout, icon: <LogOut size={20} />, isLogout: true },
    ],
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 right-4 p-2 z-[60] bg-gray-900 text-white rounded shadow"
      >
        {isOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
      </button>

      {/* Sidebar */}
      <aside
        className={`md:relative md:translate-x-0 fixed top-0 left-0 w-64 bg-gray-900 text-white shadow-lg transform transition-transform duration-300 ease-in-out z-50 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ minHeight: '100vh', height: 'auto' }}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-gray-700">
            <h2 className="text-xl font-bold capitalize">{user?.role} Dashboard</h2>
            <p className="text-sm text-gray-300 truncate">{user?.email}</p>
          </div>

          {/* Navigation Items */}
          <nav className="p-4 space-y-2 flex-1">
            {navItems[role].map((item) => {
              if (item.isLogout) {
                return (
                  <div
                    key={item.name}
                    onClick={item.action}
                    className="flex items-center gap-2 p-2 rounded-md transition-colors cursor-pointer hover:bg-red-700 text-red-400"
                  >
                    {item.icon} {item.name}
                  </div>
                );
              }
              return (
                <div
                  key={item.name}
                  onClick={() => item.action ? item.action() : handleNavClick(item)}
                  className={`flex items-center gap-2 p-2 rounded-md transition-colors cursor-pointer ${
                    location.pathname === item.path ? "bg-gray-700" : "hover:bg-gray-800"
                  }`}
                >
                  {item.icon} {item.name}
                </div>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;