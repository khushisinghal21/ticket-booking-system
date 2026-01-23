import axios from 'axios';

const API_URL = 'http://localhost:4000/api';

/**
 * Register a new user
 */
export const register = async (email, password, name) => {
    const response = await axios.post(`${API_URL}/auth/register`, {
        email,
        password,
        name
    });

    if (response.data.status === 'SUCCESS') {
        // Store token in localStorage
        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }

    return response.data;
};

/**
 * Login user
 */
export const login = async (email, password) => {
    const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password
    });

    if (response.data.status === 'SUCCESS') {
        // Store token in localStorage
        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }

    return response.data;
};

/**
 * Logout user
 */
export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
};

/**
 * Get current user from localStorage
 */
export const getCurrentUser = () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
};

/**
 * Get auth token
 */
export const getToken = () => {
    return localStorage.getItem('token');
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => {
    return !!getToken();
};
