import { useState } from "react";
import { toast } from "react-toastify";
import PropTypes from "prop-types";

const UpgradeDoctorForm = ({ user, onUpgrade, onCancel }) => {
  const [formData, setFormData] = useState({
    specialty: "General",
    qualifications: "MBBS",
    profileImage: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      profileImage: e.target.files[0] || null,
    }));
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

      // Verify FormData before sending
      console.log("Submitting with:", {
        userId: user._id,
        specialty: formData.specialty,
        qualifications: formData.qualifications,
        hasProfileImage: !!formData.profileImage,
      });

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
    <div className="bg-white shadow rounded-lg p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        Upgrade {user?.name || "User"} to Doctor
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="specialty"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Specialty *
          </label>
          <select
            id="specialty"
            name="specialty"
            value={formData.specialty}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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

        <div>
          <label
            htmlFor="qualifications"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Qualifications *
          </label>
          <input
            type="text"
            id="qualifications"
            name="qualifications"
            value={formData.qualifications}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
            disabled={isSubmitting}
            placeholder="MD, MBBS, etc."
          />
        </div>

        <div>
          <label
            htmlFor="profileImage"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Profile Image
          </label>
          <input
            type="file"
            id="profileImage"
            name="profileImage"
            onChange={handleFileChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={isSubmitting}
            accept="image/*"
          />
        </div>

        <div className="flex justify-between mt-6">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
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
              </span>
            ) : (
              "Upgrade"
            )}
          </button>
        </div>
      </form>
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
