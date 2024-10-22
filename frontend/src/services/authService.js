// src/services/authService.js
import axios from "axios";

export const register = async (userData) => {
  return axios.post("/auth/register", userData); // No need for full URL
};

export const login = async (userData) => {
  return axios.post("/auth/login", userData); // Proxy will handle the URL
};
