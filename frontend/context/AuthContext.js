"use client";

import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

const TOKEN_KEY = "pulse_chat_token";
const USER_KEY = "pulse_chat_user";

export function AuthProvider({ children }) {
  const [token, setToken] = useState("");
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const savedToken = window.localStorage.getItem(TOKEN_KEY) || "";
    const savedUser = window.localStorage.getItem(USER_KEY);

    setToken(savedToken);
    setUser(savedUser ? JSON.parse(savedUser) : null);
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add("light");
    setAuthReady(true);
  }, []);

  useEffect(() => {
    if (!authReady || !token || user) {
      return;
    }

    fetchMe();
  }, [authReady, token, user]);

  const persistAuth = (nextToken, nextUser) => {
    setToken(nextToken);
    setUser(nextUser);
    window.localStorage.setItem(TOKEN_KEY, nextToken);
    window.localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
  };

  const clearAuth = () => {
    setToken("");
    setUser(null);
    window.localStorage.removeItem(TOKEN_KEY);
    window.localStorage.removeItem(USER_KEY);
  };

  const login = async (credentials) => {
    setAuthLoading(true);
    try {
      const { data } = await api.post("/auth/login", credentials);
      persistAuth(data.token, data);
      return data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Login failed");
    } finally {
      setAuthLoading(false);
    }
  };

  const register = async (payload) => {
    setAuthLoading(true);
    try {
      const { data } = await api.post("/auth/register", payload);
      persistAuth(data.token, data);
      return data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Registration failed");
    } finally {
      setAuthLoading(false);
    }
  };

  const fetchMe = async () => {
    if (!window.localStorage.getItem(TOKEN_KEY)) {
      return null;
    }

    try {
      const { data } = await api.get("/auth/me");
      setUser(data);
      window.localStorage.setItem(USER_KEY, JSON.stringify(data));
      return data;
    } catch (error) {
      clearAuth();
      return null;
    }
  };

  const logout = () => {
    clearAuth();
  };

  const updateCurrentUser = (updates) => {
    setUser((prev) => {
      if (!prev) {
        return prev;
      }

      const resolvedUpdates = typeof updates === "function" ? updates(prev) : updates;
      if (!resolvedUpdates || resolvedUpdates === prev) {
        return prev;
      }

      const nextUser = { ...prev, ...resolvedUpdates };

      if (JSON.stringify(nextUser) === JSON.stringify(prev)) {
        return prev;
      }

      window.localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
      return nextUser;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        authLoading,
        authReady,
        login,
        register,
        fetchMe,
        logout,
        updateCurrentUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
