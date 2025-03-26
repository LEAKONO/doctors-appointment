import { useDropzone } from "react-dropzone";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-hot-toast";

const ProfileUpload = ({ onSuccess }) => {
  const { user, updateUserProfile } = useAuth();

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/jpeg': ['.jpeg', '.jpg'],
      'image/png': ['.png'],
      'image/gif': ['.gif'],
      'image/webp': ['.webp']
    },
    multiple: false,
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024, // 5MB limit
    onDrop: async (acceptedFiles) => {
      if (acceptedFiles.length === 0) return;
      
      const file = acceptedFiles[0];
      const formData = new FormData();
      formData.append("profileImage", file);
      
      try {
        const { data } = await api.patch("/doctors/profile-image", formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        // Construct proper image URL - no need for REACT_APP_API_URL since we're using relative paths
        const imageUrl = data.profileImage.startsWith('/uploads') 
          ? `http://localhost:5000${data.profileImage}`
          : data.profileImage;

        updateUserProfile({
          ...user,
          doctorProfile: {
            ...user.doctorProfile,
            profileImage: imageUrl
          }
        });

        toast.success("Profile image updated successfully");
        if (onSuccess) onSuccess(data);
      } catch (error) {
        console.error("Upload error:", error);
        const errorMessage = error.response?.data?.message || 
                            error.response?.data?.error || 
                            error.message ||
                            "Failed to upload image";
        toast.error(errorMessage);
      }
    },
    onDropRejected: (rejectedFiles) => {
      const error = rejectedFiles[0].errors[0];
      let message = error.message;
      
      if (error.code === 'file-too-large') {
        message = "File is too large (max 5MB)";
      } else if (error.code === 'file-invalid-type') {
        message = "Invalid file type. Please upload an image (JPEG, PNG, GIF, WEBP)";
      }
      
      toast.error(message);
    }
  });

  return (
    <div {...getRootProps()} className="p-4 border-2 border-dashed rounded-lg cursor-pointer hover:border-blue-400 transition-colors">
      <input {...getInputProps()} />
      <div className="text-center">
        <img
          src={user?.doctorProfile?.profileImage || "/default-avatar.png"}
          className="w-32 h-32 rounded-full mx-auto mb-4 object-cover border-2 border-gray-200"
          alt="Profile"
          onError={(e) => {
            e.target.src = "/default-avatar.png";
          }}
        />
        <p className="text-gray-600">
          Drag & drop or click to upload profile image
        </p>
        <p className="text-sm text-gray-500 mt-2">
          (JPEG, PNG, GIF, WEBP only, max 5MB)
        </p>
      </div>
    </div>
  );
};

export default ProfileUpload;