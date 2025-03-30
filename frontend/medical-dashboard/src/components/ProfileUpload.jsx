import { useDropzone } from "react-dropzone";
import { useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-hot-toast";
import { FiUpload, FiImage } from "react-icons/fi";

const ProfileUpload = ({ onSuccess }) => {
  const { user, updateUserProfile } = useAuth();
  const [isUploading, setIsUploading] = useState(false);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/jpeg': ['.jpeg', '.jpg'],
      'image/png': ['.png'],
      'image/gif': ['.gif'],
      'image/webp': ['.webp']
    },
    multiple: false,
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024,
    onDrop: async (acceptedFiles) => {
      if (!acceptedFiles.length) return;
      
      const file = acceptedFiles[0];
      const formData = new FormData();
      formData.append("image", file);

      try {
        setIsUploading(true);
        const { data } = await api.post("/doctors/upload-profile", formData, {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        });

        if (data?.success) {
          const updatedImage = data.profileImage 
            ? `${data.profileImage}?v=${Date.now()}`
            : null;
          
          updateUserProfile({
            ...user,
            doctorProfile: {
              ...user.doctorProfile,
              profileImage: updatedImage
            }
          });
          
          toast.success("Profile image updated!");
          onSuccess?.(updatedImage);
        }
      } catch (error) {
        const message = error.response?.data?.message || 
                       error.message || 
                       "Failed to upload image";
        toast.error(message);
      } finally {
        setIsUploading(false);
      }
    },
    onDropRejected: (rejectedFiles) => {
      const error = rejectedFiles[0].errors[0];
      const message = error.code === 'file-too-large' 
        ? "File too large (max 5MB)" 
        : "Invalid file type (JPEG, PNG, GIF, WEBP only)";
      toast.error(message);
    }
  });

  return (
    <div {...getRootProps()} className={`p-4 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
      isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
    } ${isUploading ? 'opacity-70' : ''}`}>
      <input {...getInputProps()} />
      <div className="flex flex-col items-center justify-center text-center">
        {user?.doctorProfile?.profileImage ? (
          <img
            src={user.doctorProfile.profileImage}
            className="w-32 h-32 rounded-full mx-auto mb-4 object-cover border-2 border-gray-200"
            alt="Profile"
            onError={(e) => {
              e.target.src = "/default-avatar.png";
            }}
          />
        ) : (
          <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <FiImage className="text-gray-400 text-4xl" />
          </div>
        )}
        <p className="text-gray-600">
          {isUploading ? "Uploading..." : 
           isDragActive ? "Drop image here" : 
           <><FiUpload className="inline mr-2" />Drag or click to upload</>}
        </p>
        <p className="text-sm text-gray-500 mt-2">
          JPEG, PNG, GIF, WEBP (Max 5MB)
        </p>
      </div>
    </div>
  );
};

export default ProfileUpload;