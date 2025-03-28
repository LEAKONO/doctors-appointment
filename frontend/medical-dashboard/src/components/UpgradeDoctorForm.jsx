import { useState } from "react";
import { toast } from "react-toastify";
import PropTypes from "prop-types";
import { XMarkIcon } from "@heroicons/react/24/outline";

const UpgradeDoctorForm = ({ user, onUpgrade, onCancel }) => {
  const [formData, setFormData] = useState({
    specialty: "General",
    qualifications: "MBBS",
    profileImage: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        profileImage: file,
      }));
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFormData((prev) => ({
      ...prev,
      profileImage: null,
    }));
    setPreviewImage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user?._id) {
      toast.error("Invalid user information");
      return;
    }

    if (!formData.specialty || !formData.qualifications) {
      toast.error("Specialty and qualifications are required");
      return;
    }

    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("userId", user._id);
      formDataToSend.append("specialty", formData.specialty);
      formDataToSend.append("qualifications", formData.qualifications);

      if (formData.profileImage instanceof File) {
        formDataToSend.append("profileImage", formData.profileImage);
      }

      await onUpgrade(formDataToSend);
      toast.success("User upgraded to doctor successfully!");
      onCancel();
    } catch (error) {
      console.error("Upgrade error:", error);
      toast.error(
        error.response?.data?.msg || error.message || "Failed to upgrade user"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all duration-300 ease-in-out">
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 p-6 text-white relative">
          <div className="flex flex-col">
            <h2 className="text-2xl font-bold">
              Upgrade {user?.name || "User"} to Doctor
            </h2>
            <p className="mt-1 opacity-90 text-blue-100">Fill in the doctor's details below</p>
          </div>
          <button
            onClick={onCancel}
            className="absolute top-4 right-4 text-white hover:text-blue-200 transition-colors duration-200"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-1">
            <label
              htmlFor="specialty"
              className="block text-sm font-medium text-gray-700"
            >
              Specialty *
            </label>
            <select
              id="specialty"
              name="specialty"
              value={formData.specialty}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition-all duration-200"
              required
              disabled={isSubmitting}
            >
              <option value="General">General Practitioner</option>
              <option value="Cardiologist">Cardiologist</option>
              <option value="Dermatologist">Dermatologist</option>
              <option value="Pediatrician">Pediatrician</option>
              <option value="Neurologist">Neurologist</option>
              <option value="Endocrinologist">Endocrinologist</option>
              <option value="Gastroenterologist">Gastroenterologist</option>
              <option value="Hematologist">Hematologist</option>
              <option value="Nephrologist">Nephrologist</option>
              <option value="Oncologist">Oncologist</option>
              <option value="Ophthalmologist">Ophthalmologist</option>
              <option value="Orthopedic">Orthopedic Surgeon</option>
              <option value="Otolaryngologist">
                Otolaryngologist (ENT Specialist)
              </option>
              <option value="Pulmonologist">Pulmonologist</option>
              <option value="Rheumatologist">Rheumatologist</option>
              <option value="Urologist">Urologist</option>
              <option value="Allergist">Allergist/Immunologist</option>
              <option value="Anesthesiologist">Anesthesiologist</option>
              <option value="PlasticSurgeon">Plastic Surgeon</option>
              <option value="Pathologist">Pathologist</option>
              <option value="Psychiatrist">Psychiatrist</option>
              <option value="Radiologist">Radiologist</option>
              <option value="SportsMedicine">Sports Medicine Specialist</option>
              <option value="VascularSurgeon">Vascular Surgeon</option>
              <option value="InfectiousDisease">
                Infectious Disease Specialist
              </option>
              <option value="Geriatrician">Geriatrician</option>
              <option value="ObGyn">Obstetrician/Gynecologist</option>
              <option value="ThoracicSurgeon">Thoracic Surgeon</option>
              <option value="CriticalCare">Critical Care Specialist</option>
            </select>
          </div>

          <div className="space-y-1">
            <label
              htmlFor="qualifications"
              className="block text-sm font-medium text-gray-700"
            >
              Qualifications *
            </label>
            <input
              type="text"
              id="qualifications"
              name="qualifications"
              value={formData.qualifications}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition-all duration-200"
              required
              disabled={isSubmitting}
              placeholder="MD, MBBS, etc."
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Profile Image
            </label>
            {previewImage ? (
              <div className="relative group">
                <img
                  src={previewImage}
                  alt="Preview"
                  className="h-32 w-32 rounded-full object-cover mx-auto border-2 border-gray-300 shadow-md"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors duration-200 transform -translate-y-1/4 translate-x-1/4 group-hover:opacity-100 opacity-90"
                  title="Remove image"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-center w-full">
                <label
                  htmlFor="profileImage"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg
                      className="w-10 h-10 mb-3 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      ></path>
                    </svg>
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG, JPEG (MAX. 5MB)</p>
                  </div>
                  <input
                    id="profileImage"
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                    disabled={isSubmitting}
                    accept="image/*"
                  />
                </label>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors duration-200"
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Processing...
                </>
              ) : (
                "Upgrade to Doctor"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

UpgradeDoctorForm.propTypes = {
  user: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    role: PropTypes.string.isRequired,
  }).isRequired,
  onUpgrade: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default UpgradeDoctorForm;