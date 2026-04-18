import React, { createContext, useContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("devcodex_token"));
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    if (token) refreshUserStatus();
  }, [token]);

  /**
   * DB-Live Status Sync
   * Hits the /api/auth/verify endpoint which now returns fresh DB state.
   */
  const refreshUserStatus = async () => {
    if (!token) return;
    try {
      const baseUrl = import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_URL || "http://localhost:5000";
      const res = await fetch(`${baseUrl}/api/auth/verify`, {
        headers: { Authorization: "Bearer " + token }
      });
      const data = await res.json();
      if (res.ok && data.user) {
        setUser(data.user);
        setIsPremium(data.user.isPremium);
        // Sync ID for local use
        // Explicitly pick fields to "sanitize" the object structure
        const safeUser = {
            id: String(userData.id),
            name: String(userData.name),
            email: String(userData.email),
            isPremium: Boolean(userData.isPremium)
        };
        localStorage.setItem('user', JSON.stringify(safeUser));
      } else {
        // If verification fails (e.g. user deleted in DB), clear session
        logout();
      }
    } catch (err) {
      console.error("Session sync failed:", err);
    }
  };

  const login = (newToken, newUser) => {
    localStorage.setItem("devcodex_token", newToken);
    localStorage.setItem("devcodex_userid", newUser._id || newUser.id);
    setToken(newToken);
    setUser(newUser);
    setIsPremium(newUser.isPremium);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setIsPremium(false);
    localStorage.removeItem("devcodex_token");
    localStorage.removeItem("devcodex_userid");
  };

  return (
    <AuthContext.Provider value={{ user, token, isPremium, login, logout, setIsPremium, refreshUserStatus }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
