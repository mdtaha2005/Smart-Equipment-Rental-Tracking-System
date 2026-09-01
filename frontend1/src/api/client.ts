import axios from 'axios';

// Strip any trailing slashes to prevent malformed URLs like https://api.com//api
const rawBase = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace(/\/+$/, '');

export const API_BASE_URL = rawBase;

export const apiClient = axios.create({
  baseURL: `${rawBase}/api`,
  timeout: 60000, // 60-second timeout to gracefully handle cloud free-tier cold starts
  headers: {
    'Content-Type': 'application/json'
  }
});
