import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) setUser(JSON.parse(storedUser));
    } catch {
      localStorage.removeItem("user");
    }
  }, []);

  const login = (token, userData) => {
    const normalizedUser = {
      id: userData?.id || null,
      name: userData?.name || userData?.email?.split("@")[0] || "Usuario",
      email: userData?.email || "",
      role: userData?.role || "user",
      darkMode: userData?.darkMode ?? false,
      language: userData?.language || "es",
      farmName: userData?.farmName || null,
      location: userData?.location || null,
    };

    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(normalizedUser));
    setUser(normalizedUser);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };

  const getToken = () => localStorage.getItem("token");
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, login, logout, getToken, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);