import React, { useState } from 'react';
import axios from '../api/axiosInstance'; // pastikan axiosInstance sudah disetup
import './Login.css';
import { useNavigate, Link } from 'react-router-dom';
import { User, Lock, Shield } from "lucide-react";

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    try {
      const response = await axios.post('/login', {
        email,
        password,
      });

      // Simpan access token ke localStorage
      const { accessToken, user } = response.data;
      console.log(response.data);
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('user', JSON.stringify(user));

      // Redirect berdasarkan role setelah login berhasil
      if (user.role === 'admin') {
        navigate('/homeadmin');
      } else {
        navigate('/home');
      }
    } catch (error) {
      // Tangani error dari server
      if (error.response) {
        setErrorMsg(error.response.data.message || 'Login gagal');
      } else {
        setErrorMsg('Server tidak merespon');
      }
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <Shield className="login-icon" />
          <h1>Login</h1>
          <p>Sistem Pelaporan Kerusakan Sarana Prasarana</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <div className="input-wrapper">
              <User className="input-icon" size={18} />
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Masukkan email"
                required
                autoComplete="email"
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password"
                required
                autoComplete="current-password"
              />
            </div>
          </div>

          {errorMsg && (
            <div className="error-message" role="alert" aria-live="assertive">
              {errorMsg}
            </div>
          )}

          <button type="submit" className="login-button">
            Login
          </button>
        </form>

        <div className="login-footer">
          <p>
            Belum punya akun? 
            <Link to="/register" className="register-link"> Daftar di sini</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;