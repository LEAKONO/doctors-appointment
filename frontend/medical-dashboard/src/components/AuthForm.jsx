import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const AuthForm = ({ isLogin }) => {
  const { login, setUser, user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    passwordConfirm: ''
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        // If it's the login form, attempt to log the user in
        await login(formData.email, formData.password);
        navigate(`/${user.role}`); // Navigate to the role-based page
      } else {
        // If it's the registration form
        if (formData.password !== formData.passwordConfirm) {
          throw new Error('Passwords do not match');
        }

        // Send the registration request
        const { data } = await api.post('/users/register', {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          // We assume 'patient' as default role on the server side
        });

        if (!data.token || !data.user) {
          throw new Error('Registration failed');
        }

        // Store token and user data
        localStorage.setItem('token', data.token);
        setUser({
          id: data.user._id,
          name: data.user.name,
          email: data.user.email,
          role: 'patient' // Setting role as patient by default
        });

        // Log the user in immediately after registration
        await login(formData.email, formData.password);

        // Redirect to the correct page based on role
        navigate(`/${user.role}`);
      }
    } catch (error) {
      console.error("Error during signup/login:", error);
      toast.error(error.response?.data?.msg || error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {!isLogin && (
        <div>
          <label className="block text-sm font-medium mb-1">Full Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border rounded-md"
            required
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-1">Email</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border rounded-md"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Password</label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border rounded-md"
          minLength="6"
          required
        />
      </div>

      {!isLogin && (
        <div>
          <label className="block text-sm font-medium mb-1">Confirm Password</label>
          <input
            type="password"
            name="passwordConfirm"
            value={formData.passwordConfirm}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border rounded-md"
            required
          />
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className={`w-full py-2 px-4 rounded-md text-white ${
          loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {loading ? 'Processing...' : isLogin ? 'Login' : 'Create Account'}
      </button>
    </form>
  );
};

export default AuthForm;
