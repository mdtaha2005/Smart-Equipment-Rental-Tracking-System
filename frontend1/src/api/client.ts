import axios from 'axios';

// Support both VITE_API_BASE_URL and VITE_API_URL in case of naming variation
const envUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Strip any trailing slashes to prevent malformed URLs like https://api.com//api
const rawBase = envUrl.replace(/\/+$/, '');

export const API_BASE_URL = rawBase;

export const apiClient = axios.create({
  baseURL: `${rawBase}/api`,
  timeout: 60000, // 60-second timeout to gracefully handle cloud free-tier cold starts
  headers: {
    'Content-Type': 'application/json'
  }
});
