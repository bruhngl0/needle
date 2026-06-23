"use client";

import React, { createContext, useState, useEffect, useContext } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleLogout = () => {
    localStorage.removeItem("needle_token");
    setToken(null);
    setUser(null);
  };

  const handleLogin = async (email, password) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Failed to log in");
    }

    localStorage.setItem("needle_token", data.token);
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const handleRegister = async (name, email, password) => {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Failed to register account");
    }

    localStorage.setItem("needle_token", data.token);
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  // Safely read token on mount in browser
  useEffect(() => {
    const saved = localStorage.getItem("needle_token");
    if (saved) {
      setTimeout(() => {
        setToken(saved);
      }, 0);
    } else {
      setTimeout(() => {
        setLoading(false);
      }, 0);
    }
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) {
        setTimeout(() => {
          setLoading(false);
        }, 0);
        return;
      }

      try {
        const res = await fetch("/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          setUser(data);
        } else {
          // Token expired or invalid
          handleLogout();
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
        handleLogout();
      } finally {
        setTimeout(() => {
          setLoading(false);
        }, 0);
      }
    };

    fetchProfile();
  }, [token]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login: handleLogin,
        register: handleRegister,
        logout: handleLogout,
        isAdmin: user?.role === "admin",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
