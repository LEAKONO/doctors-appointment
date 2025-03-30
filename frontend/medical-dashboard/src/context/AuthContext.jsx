import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem("user");
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error("Failed to parse user data", error);
      return null;
    }
  });
  
  const [loading, setLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const updateLocalStorage = useCallback((userData) => {
    try {
      localStorage.setItem("user", JSON.stringify(userData));
    } catch (error) {
      console.error("Failed to save user data", error);
    }
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      const { data: authData } = await api.post("/users/login", { email, password });
      localStorage.setItem("token", authData.token);

      const { data: userData } = await api.get("/users/me");
      const completeUser = {
        ...userData,
        doctorProfile: null
      };

      if (completeUser.role === 'doctor') {
        try {
          const { data: profileData } = await api.get("/doctors/profile");
          completeUser.doctorProfile = {
            ...profileData,
            profileImage: profileData.profileImage 
              ? `${profileData.profileImage}?v=${Date.now()}`
              : null
          };
        } catch (profileError) {
          console.error("Doctor profile fetch error:", profileError);
        }
      }

      setUser(completeUser);
      updateLocalStorage(completeUser);
      navigate(`/${completeUser.role}`);
      return completeUser;
    } catch (error) {
      setError(error.response?.data?.message || "Login failed");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await api.post("/users/register", userData);
      localStorage.setItem("token", data.token);
      
      const newUser = {
        ...data,
        doctorProfile: null
      };

      setUser(newUser);
      updateLocalStorage(newUser);
      navigate(`/${newUser.role}`);
      return data;
    } catch (error) {
      setError(error.response?.data?.message || "Registration failed");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  }, [navigate]);

  const updateUserProfile = useCallback((updates) => {
    setUser(prev => {
      if (!prev) return prev;
      
      const updatedUser = {
        ...prev,
        doctorProfile: {
          ...prev.doctorProfile,
          ...updates,
          profileImage: updates.profileImage 
            ? `${updates.profileImage.split('?')[0]}?v=${Date.now()}`
            : prev.doctorProfile?.profileImage
        }
      };
      
      updateLocalStorage(updatedUser);
      return updatedUser;
    });
  }, [updateLocalStorage]);

  const checkAuth = useCallback(async () => {
    setIsInitializing(true);
    const token = localStorage.getItem("token");
    if (!token) {
      setIsInitializing(false);
      return;
    }

    try {
      const { data } = await api.get("/users/me");
      const userData = {
        ...data,
        doctorProfile: null
      };

      if (data.role === 'doctor') {
        try {
          const { data: profileData } = await api.get("/doctors/profile");
          userData.doctorProfile = {
            ...profileData,
            profileImage: profileData.profileImage 
              ? `${profileData.profileImage}?v=${Date.now()}`
              : null
          };
        } catch (error) {
          console.error("Couldn't fetch doctor profile", error);
        }
      }

      setUser(userData);
      updateLocalStorage(userData);
    } catch (error) {
      logout();
    } finally {
      setIsInitializing(false);
    }
  }, [logout, updateLocalStorage]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <AuthContext.Provider 
      value={{ 
        user,
        login,
        register,
        logout,
        loading,
        error,
        isInitializing,
        updateUserProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);