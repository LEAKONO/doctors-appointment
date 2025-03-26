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
      
      const userData = {
        id: data.userId,
        name: data.name,
        email: data.email,
        role: data.role || 'patient', 
        doctorProfile: null
      };

      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));

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
        }
      }

      navigate(`/${data.role || 'patient'}`);
    } catch (error) {
      console.error("Login error:", error.response?.data?.message || error.message);
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const { data } = await api.post("/users/register", {
        name: userData.name,
        email: userData.email,
        password: userData.password
      });

      localStorage.setItem("token", data.token);
      
      const newUser = {
        id: data.userId,
        name: data.name,
        email: data.email,
        role: 'patient', 
        doctorProfile: null
      };

      setUser(newUser);
      localStorage.setItem("user", JSON.stringify(newUser));
      navigate('/patient'); 

      return data;
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };

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
        register,
        logout, 
        loading,
        updateUserProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);