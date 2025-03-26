import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const login = async (email, password) => {
    try {
      const { data } = await api.post("/users/login", { email, password });
      localStorage.setItem("token", data.token);
      
      // Store basic user info first
      const userData = {
        id: data.userId,
        name: data.name,
        email: data.email,
        role: data.role,
        // Initialize doctorProfile as null - will be filled later if doctor
        doctorProfile: null
      };

      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));

      // If doctor, fetch profile separately
      if (data.role === 'doctor') {
        try {
          const profileRes = await api.get("/doctors/profile");
          setUser(prev => {
            const updatedUser = {
              ...prev,
              doctorProfile: profileRes.data
            };
            localStorage.setItem("user", JSON.stringify(updatedUser));
            return updatedUser;
          });
        } catch (profileError) {
          console.error("Couldn't fetch doctor profile", profileError);
          // Continue anyway with basic info
        }
      }

      navigate(`/${data.role}`);
    } catch (error) {
      console.error("Login error:", error.response?.data?.message || error.message);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };

  // Add this function to update user profile data
  const updateUserProfile = (profileData) => {
    setUser(prev => {
      if (!prev) return prev;
      
      const updatedUser = {
        ...prev,
        doctorProfile: {
          ...prev.doctorProfile,
          ...profileData
        }
      };
      
      localStorage.setItem("user", JSON.stringify(updatedUser));
      return updatedUser;
    });
  };

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        // First get basic user info
        const { data } = await api.get("/users/me");
        const userData = {
          id: data._id,
          name: data.name,
          email: data.email,
          role: data.role,
          doctorProfile: null
        };

        // If doctor, get profile data
        if (data.role === 'doctor') {
          try {
            const profileRes = await api.get("/doctors/profile");
            userData.doctorProfile = profileRes.data;
          } catch (profileError) {
            console.error("Couldn't fetch doctor profile", profileError);
          }
        }

        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
      } catch (error) {
        console.error("Auth check failed:", error);
        logout();
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        setUser,
        login, 
        logout, 
        loading,
        updateUserProfile // Add this to update profile data
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);