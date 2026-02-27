import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const response = await api.get('/users/me');
                    setUser(response.data);
                } catch (error) {
                    console.error("Auth init error:", error);
                    localStorage.removeItem('token');
                }
            }
            setLoading(false);
        };

        initAuth();
    }, []);

    const login = async (email, password) => {
        try {
            // OAuth2 requires form data
            const formData = new URLSearchParams();
            formData.append('username', email);
            formData.append('password', password);

            const response = await api.post('/auth/login', formData, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });

            const { access_token } = response.data;
            localStorage.setItem('token', access_token);

            // Fetch user profile
            const userRes = await api.get('/users/me');
            setUser(userRes.data);
            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.detail || "Login failed"
            };
        }
    };

    const register = async (userData) => {
        try {
            await api.post('/auth/register', userData);
            // Automatically login after successful registration
            return await login(userData.email, userData.password);
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.detail || "Registration failed"
            };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    const updatePreferences = async (prefs) => {
        try {
            const response = await api.put('/users/preferences', prefs);
            setUser(response.data);
            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.detail || "Failed to update preferences"
            };
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, updatePreferences }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
