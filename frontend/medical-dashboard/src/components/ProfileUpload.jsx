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
      if (acceptedFiles.length === 0) return;
      
      const file = acceptedFiles[0];
      const formData = new FormData();
      formData.append("image", file);
      
      try {
        setIsUploading(true);
        const { data } = await api.post("/doctors/upload-profile", formData);

        updateUserProfile({
          ...user,
          doctorProfile: {
            ...user.doctorProfile,
            profileImage: data.profileImage
          }
        });

        toast.success("Profile image updated successfully");
        if (onSuccess) onSuccess(data.profileImage);
      } catch (error) {
        console.error("Upload error:", error);
        let errorMessage = "Failed to upload image";
        
        if (error.response) {
          if (error.response.status === 404) {
            errorMessage = "Upload endpoint not found (404)";
          } else if (error.response.data?.message) {
            errorMessage = error.response.data.message;
          }
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        toast.error(errorMessage);
      } finally {
        setIsUploading(false);
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
    <div 
      {...getRootProps()} 
      className={`p-4 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
        isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
      } ${isUploading ? 'opacity-70 pointer-events-none' : ''}`}
    >
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
          {isUploading ? (
            "Uploading..."
          ) : isDragActive ? (
            "Drop the image here"
          ) : (
            <>
              <FiUpload className="inline mr-2" />
              Drag & drop or click to upload profile image
            </>
          )}
        </p>
        <p className="text-sm text-gray-500 mt-2">
          (JPEG, PNG, GIF, WEBP only, max 5MB)
        </p>
      </div>
    </div>
  );
};

export default ProfileUpload;