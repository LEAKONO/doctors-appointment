import { useState, useEffect } from "react";
import api from "../api/axios";
import { TrashIcon, UserPlusIcon } from "@heroicons/react/24/outline";
import { toast } from "react-toastify";
import UpgradeDoctorForm from "./UpgradeDoctorForm";

const UserManagementTable = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUpgradeForm, setShowUpgradeForm] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      const response = await api.get("/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const normalizedUsers = response.data.users.map(user => ({
        ...user,
        _id: user._id || user.id,
      }));
      
      setUsers(normalizedUsers || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error(error.response?.data?.msg || "Failed to fetch users");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [refreshTrigger]);

  const handleUpgrade = async (formData) => {
    if (!selectedUser?._id) return toast.error("No valid user selected for upgrade");

    const token = localStorage.getItem("token");
    if (!token) return toast.error("Authentication token missing");

    try {
      const submissionData = new FormData();
      submissionData.append("userId", selectedUser._id);
      submissionData.append("specialty", formData.get("specialty"));
      submissionData.append("qualifications", formData.get("qualifications"));

      const profileImage = formData.get("profileImage");
      if (profileImage instanceof File) {
        submissionData.append("profileImage", profileImage);
      }

      await api.post("/users/upgrade", submissionData, {
        headers: { Authorization: `Bearer ${token}` },
        transformRequest: (data, headers) => {
          delete headers['Content-Type'];
          return data;
        }
      });

      toast.success("User upgraded successfully");
      setRefreshTrigger(prev => !prev);
      setShowUpgradeForm(false);
      setSelectedUser(null);
    } catch (error) {
      console.error("Upgrade error:", error);
      toast.error(error.response?.data?.msg || "Failed to upgrade user.");
    }
  };

  const handleDelete = async (userId) => {
    if (!userId || !window.confirm("Are you sure you want to delete this user?")) return;
    
    const token = localStorage.getItem("token");
    if (!token) return toast.error("Authentication token missing");

    setDeletingId(userId);
    try {
      const response = await api.delete(`/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUsers(prevUsers => prevUsers.filter(user => user._id !== userId));
      toast.success(response.data.msg || "User deleted successfully");
      setRefreshTrigger(prev => !prev);
    } catch (error) {
      console.error("Delete failed:", error);
      toast.error(error.response?.data?.msg || "Failed to delete user");
    } finally {
      setDeletingId(null);
    }
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <div className="animate-pulse flex flex-col items-center">
        <div className="w-16 h-16 bg-blue-500 rounded-full mb-4"></div>
        <div className="h-4 bg-gray-300 rounded w-32"></div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {showUpgradeForm && selectedUser && (
        <UpgradeDoctorForm
          user={selectedUser}
          onUpgrade={handleUpgrade}
          onCancel={() => {
            setShowUpgradeForm(false);
            setSelectedUser(null);
          }}
        />
      )}

      {!showUpgradeForm && (
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
          <div className="p-6 bg-gradient-to-r from-blue-600 to-indigo-700">
            <h1 className="text-2xl font-bold text-white">User Management</h1>
            <p className="text-blue-100 mt-1">Manage all system users and their roles</p>
          </div>
          
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <div className="relative w-full max-w-md">
                <input
                  type="text"
                  placeholder="Search users..."
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <svg
                  className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <div className="text-sm text-gray-500">
                {filteredUsers.length} {filteredUsers.length === 1 ? 'user' : 'users'} found
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <tr 
                        key={user._id} 
                        className="hover:bg-gray-50 transition-colors duration-150"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 flex items-center justify-center text-white font-semibold">
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{user.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{user.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.role === 'admin' 
                              ? 'bg-purple-100 text-purple-800' 
                              : user.role === 'doctor' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-blue-100 text-blue-800'
                          }`}>
                            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-3">
                            {user.role === "patient" && (
                              <button
                                onClick={() => {
                                  setSelectedUser(user);
                                  setShowUpgradeForm(true);
                                }}
                                className="text-indigo-600 hover:text-indigo-900 transition-colors duration-200 group"
                                title="Upgrade to doctor"
                              >
                                <div className="flex items-center space-x-1">
                                  <UserPlusIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                  <span className="hidden md:inline text-sm">Upgrade</span>
                                </div>
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(user._id)}
                              disabled={deletingId === user._id}
                              className={`text-red-600 hover:text-red-900 transition-colors duration-200 group ${
                                deletingId === user._id ? "opacity-50 cursor-not-allowed" : ""
                              }`}
                              title={deletingId === user._id ? "Deleting..." : "Delete user"}
                            >
                              <div className="flex items-center space-x-1">
                                <TrashIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                <span className="hidden md:inline text-sm">Delete</span>
                              </div>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="px-6 py-8 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <svg
                            className="mx-auto h-12 w-12 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1}
                              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                            />
                          </svg>
                          <h3 className="mt-2 text-lg font-medium text-gray-900">No users found</h3>
                          <p className="mt-1 text-gray-500">
                            {searchTerm ? "Try a different search term" : "Add a new user to get started"}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredUsers.length}</span> of{' '}
              <span className="font-medium">{filteredUsers.length}</span> results
            </div>
            <div className="flex space-x-2">
              <button className="px-4 py-2 border rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50">
                Previous
              </button>
              <button className="px-4 py-2 border rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50">
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagementTable;