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
        id: userData._id,
        name: userData.name,
        email: userData.email,
        role: userData.role || 'patient',
        doctorProfile: null
      };

      if (completeUser.role === 'doctor') {
        try {
          const { data: profileData } = await api.get("/doctors/profile");
          completeUser.doctorProfile = profileData;
        } catch (profileError) {
          console.error("Doctor profile fetch error:", profileError);
        }
      }

      setUser(completeUser);
      updateLocalStorage(completeUser);

      navigate(`/${completeUser.role}`);
      return completeUser;

    } catch (error) {
      console.error("Login error:", error);
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
      
      const { data } = await api.post("/users/register", {
        name: userData.name,
        email: userData.email,
        password: userData.password,
        role: userData.role || 'patient'
      });

      localStorage.setItem("token", data.token);
      
      const newUser = {
        id: data.userId || data._id,
        name: data.name,
        email: data.email,
        role: data.role || 'patient',
        doctorProfile: null
      };

      setUser(newUser);
      updateLocalStorage(newUser);
      navigate(`/${newUser.role}`);

      return data;
    } catch (error) {
      console.error("Registration error:", error);
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

  const updateUserProfile = useCallback((profileData) => {
    setUser(prev => {
      if (!prev) return prev;
      
      const updatedUser = {
        ...prev,
        doctorProfile: {
          ...prev.doctorProfile,
          ...profileData
        }
      };
      
      updateLocalStorage(updatedUser);
      return updatedUser;
    });
  }, [updateLocalStorage]);

  const checkAuth = useCallback(async () => {
    setIsInitializing(true);
    setError(null);
    const token = localStorage.getItem("token");
    
    if (!token) {
      setIsInitializing(false);
      return;
    }

    try {
      const { data } = await api.get("/users/me");
      const userData = {
        id: data._id,
        name: data.name,
        email: data.email,
        role: data.role || 'patient',
        doctorProfile: null
      };

      if (data.role === 'doctor') {
        try {
          const { data: profileData } = await api.get("/doctors/profile");
          userData.doctorProfile = profileData;
        } catch (profileError) {
          console.error("Couldn't fetch doctor profile", profileError);
        }
      }

      setUser(userData);
      updateLocalStorage(userData);
      
      // Redirect if not on correct role-based route
      const currentPath = window.location.pathname;
      if (!currentPath.startsWith(`/${userData.role}`)) {
        navigate(`/${userData.role}`);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      logout();
    } finally {
      setIsInitializing(false);
    }
  }, [logout, navigate, updateLocalStorage]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        setUser,
        login, 
        register, 
        logout, 
        loading,
        isInitializing,
        error,
        updateUserProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};