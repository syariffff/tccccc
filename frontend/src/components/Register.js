import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Lock, Shield, Mail } from "lucide-react";
import axios from "axios";
import './Register.css';

function Register() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        nama: '',
        email: '',
        password: '',
        confirm_password: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when user starts typing
        if (error) setError('');
    };

    // Validate form data
    const validateForm = () => {
        if (!formData.nama || !formData.email || !formData.password || !formData.confirm_password) {
            setError('Semua field harus diisi');
            return false;
        }

        if (formData.nama.length < 3) {
            setError('nama harus minimal 3 karakter');
            return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setError('Format email tidak valid');
            return false;
        }

        if (formData.password.length < 6) {
            setError('Password harus minimal 6 karakter');
            return false;
        }

        if (formData.password !== formData.confirm_password) {
            setError('Password dan konfirmasi password tidak cocok');
            return false;
        }

        return true;
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;

        setLoading(true);
        setError('');

        try {
            // Adjust the API endpoint URL according to your backend
            const response = await axios.post('http://localhost:5000/register', {
                nama: formData.nama,
                email: formData.email,
                password: formData.password,
                confirm_password: formData.confirm_password
            }); 
            // Redirect to login page
            navigate('/login');
        } catch (err) {
            // Handle different types of errors
            if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else if (err.response?.status === 400) {
                setError('Data yang dimasukkan tidak valid');
            } else if (err.response?.status === 409) {
                setError('nama atau email sudah terdaftar');
            } else if (err.code === 'NETWORK_ERROR') {
                setError('Tidak dapat terhubung ke server');
            } else {
                setError('Terjadi kesalahan saat mendaftar. Silakan coba lagi.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-container">
            <div className="register-card">
                <div className="register-header">
                    <Shield className="register-icon" />
                    <h1>Daftar Akun</h1>
                    <p>Sistem Pelaporan Kerusakan Sarana Prasarana</p>
                </div>

                {error && (
                    <div className="error-message">
                        <p>{error}</p>
                    </div>
                )}

                <form className="register-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="nama">nama</label>
                        <div className="input-wrapper">
                            <User className="input-icon" size={18} />
                            <input
                                type="text"
                                id="nama"
                                name="nama"
                                value={formData.nama}
                                onChange={handleChange}
                                placeholder="Masukkan nama"
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <div className="input-wrapper">
                            <Mail className="input-icon" size={18} />
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Masukkan email"
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <div className="input-wrapper">
                            <Lock className="input-icon" size={18} />
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Masukkan password"
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirm_password">Konfirmasi Password</label>
                        <div className="input-wrapper">
                            <Lock className="input-icon" size={18} />
                            <input
                                type="password"
                                id="confirm_password"
                                name="confirm_password"
                                value={formData.confirm_password}
                                onChange={handleChange}
                                placeholder="Konfirmasi password"
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        className="register-button"
                    >
                        {loading ? 'Mendaftar...' : 'Daftar'}
                    </button>
                </form>

                <div className="register-footer">
                    <p>
                        Sudah punya akun? 
                        <Link to="/login" className="login-link"> Login di sini</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Register;