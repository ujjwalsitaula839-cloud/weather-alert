import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Settings, CloudLightning, LogOut, Save } from 'lucide-react';

export default function Dashboard() {
    const { user, logout, updatePreferences } = useAuth();

    // Local state initialized with user preferences
    const [formData, setFormData] = useState({
        city: user?.city || '',
        phone_number: user?.phone_number || '',
        rain_threshold_mm: user?.rain_threshold_mm || 1.0,
        alerts_enabled: user?.alerts_enabled ?? true
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');

        // Parse threshold as float
        const payload = {
            ...formData,
            rain_threshold_mm: parseFloat(formData.rain_threshold_mm)
        };

        const result = await updatePreferences(payload);
        if (result.success) {
            setMessage('Preferences saved successfully!');
        } else {
            setError(result.error);
        }
        setLoading(false);
    };

    return (
        <div className="dashboard-layout">
            <nav className="navbar">
                <div className="navbar-brand">
                    <CloudLightning size={28} color="var(--accent-color)" />
                    Rain Alert System
                </div>
                <button onClick={logout} className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>
                    <LogOut size={18} /> Logout
                </button>
            </nav>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>

                {/* Welcome Card */}
                <div className="glass-container">
                    <h2>Welcome, {user?.email ? user.email.split(/[.@]/)[0].charAt(0).toUpperCase() + user.email.split(/[.@]/)[0].slice(1) : ''}</h2>
                    <p>Your current alert status is:</p>
                    <div style={{
                        marginTop: '1rem',
                        padding: '1rem',
                        background: formData.alerts_enabled ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        borderLeft: `4px solid ${formData.alerts_enabled ? 'var(--success-color)' : 'var(--danger-color)'}`,
                        borderRadius: '4px'
                    }}>
                        <strong>{formData.alerts_enabled ? '🔔 ACTIVE' : '🔕 PAUSED'}</strong>
                        <p style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>
                            {formData.alerts_enabled
                                ? `Monitoring weather for ${formData.city}. You will receive an SMS via ${formData.phone_number} if rain exceeds ${formData.rain_threshold_mm}mm.`
                                : 'Alerts are currently disabled. You will not receive any SMS notifications.'}
                        </p>
                    </div>
                </div>

                {/* Settings Card */}
                <div className="glass-container">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                        <Settings size={24} color="var(--accent-color)" />
                        <h2 style={{ margin: 0 }}>Alert Settings</h2>
                    </div>

                    {message && <div style={{ color: 'var(--success-color)', marginBottom: '1rem' }}>{message}</div>}
                    {error && <div className="error-message" style={{ marginBottom: '1rem' }}>{error}</div>}

                    <form onSubmit={handleSave}>
                        <div className="form-group" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div>
                                <label style={{ margin: 0, fontSize: '1rem', color: 'var(--text-primary)' }}>Enable SMS Alerts</label>
                                <p style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>Toggle notifications on or off</p>
                            </div>
                            <label className="toggle-switch">
                                <input
                                    type="checkbox"
                                    name="alerts_enabled"
                                    checked={formData.alerts_enabled}
                                    onChange={handleChange}
                                />
                                <span className="slider"></span>
                            </label>
                        </div>

                        <div className="form-group">
                            <label>Target City</label>
                            <input
                                type="text"
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Phone Number</label>
                            <input
                                type="tel"
                                name="phone_number"
                                value={formData.phone_number}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Rain Threshold (mm in next 12h)</label>
                            <input
                                type="number"
                                step="0.1"
                                min="0.1"
                                name="rain_threshold_mm"
                                value={formData.rain_threshold_mm}
                                onChange={handleChange}
                                required
                            />
                            <p style={{ fontSize: '0.75rem', marginTop: '0.5rem' }}>
                                Lower values (e.g., 0.5) = Alerts for minimal drizzles.<br />
                                Higher values (e.g., 5.0) = Alerts only for heavy rain.
                            </p>
                        </div>

                        <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: '1rem' }}>
                            {loading ? <div className="loader" style={{ width: '16px', height: '16px', borderWidth: '2px' }} /> : <><Save size={18} /> Save Preferences</>}
                        </button>
                    </form>
                </div>

            </div>
        </div>
    );
}
