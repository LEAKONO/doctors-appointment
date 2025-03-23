import { useDropzone } from 'react-dropzone';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const ProfileUpload = () => {
  const { user, setUser } = useAuth();
  
  const { getRootProps, getInputProps } = useDropzone({
    accept: 'image/*',
    multiple: false,
    onDrop: async ([file]) => {
      const formData = new FormData();
      formData.append('profileImage', file);
      
      try {
        const { data } = await api.patch('/doctors/profile-image', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setUser({ ...user, doctorProfile: { ...user.doctorProfile, ...data } });
      } catch (error) {
        console.error('Upload error:', error);
      }
    }
  });

  return (
    <div {...getRootProps()} className="p-4 border-2 border-dashed rounded-lg cursor-pointer">
      <input {...getInputProps()} />
      <div className="text-center">
        <img 
          src={user?.doctorProfile?.profileImage || '/default-avatar.png'} 
          className="w-32 h-32 rounded-full mx-auto mb-4"
          alt="Profile"
        />
        <p className="text-gray-600">Drag & drop or click to upload profile image</p>
      </div>
    </div>
  );
};

export default ProfileUpload;