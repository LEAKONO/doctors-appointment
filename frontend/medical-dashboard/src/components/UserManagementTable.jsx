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

  // Fetch Users
  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      const response = await api.get("/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Normalize user IDs
      const normalizedUsers = response.data.users.map(user => ({
        ...user,
        _id: user._id || user.id, // Standardize ID field
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
  }, []);

  // Handle User Upgrade
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
          delete headers['Content-Type']; // Let browser set Content-Type
          return data;
        }
      });
    } catch (error) {
      console.error("Upgrade error:", error);
      toast.error(error.response?.data?.msg || "Failed to upgrade user.");
    }
  };

  // Handle User Deletion
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
    } catch (error) {
      console.error("Delete failed:", error);
      toast.error(error.response?.data?.msg || "Failed to delete user");
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) return <div className="text-center py-8">Loading users...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
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
        <div className="overflow-x-auto rounded-lg shadow bg-white p-6">
          <table className="w-full border-collapse">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-4 text-left font-semibold">Name</th>
                <th className="px-6 py-4 text-left font-semibold">Email</th>
                <th className="px-6 py-4 text-left font-semibold">Role</th>
                <th className="px-6 py-4 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.length > 0 ? (
                users.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">{user.name}</td>
                    <td className="px-6 py-4">{user.email}</td>
                    <td className="px-6 py-4 capitalize">{user.role}</td>
                    <td className="px-6 py-4 flex space-x-3">
                      {user.role === "patient" && (
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowUpgradeForm(true);
                          }}
                          className="text-blue-600 hover:text-blue-800"
                          title="Upgrade to doctor"
                        >
                          <UserPlusIcon className="w-5 h-5" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(user._id)}
                        disabled={deletingId === user._id}
                        className={`text-red-600 hover:text-red-800 transition duration-200 ${
                          deletingId === user._id ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                        title={deletingId === user._id ? "Deleting..." : "Delete user"}
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UserManagementTable;
