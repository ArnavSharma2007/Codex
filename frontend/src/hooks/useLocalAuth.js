import { useState, useEffect } from "react";

export function useLocalAuth() {
  const [authData, setAuthData] = useState({
    userId: null,
    isPremium: false,
    email: null,
  });

  useEffect(() => {
    try {
      const stored = localStorage.getItem("user");
      if (!stored) return;

      const user = JSON.parse(stored);

      setAuthData({
        userId: user._id || user.id || null,
        isPremium: user.isPremium || user.premium || false,
        email: user.email || null,
      });
    } catch (err) {
      console.error("Error parsing user from localStorage:", err);
    }
  }, []);

  return authData;
}
