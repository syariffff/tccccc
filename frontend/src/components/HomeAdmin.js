import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import { Shield, Plus, FileText, AlertTriangle, CheckCircle, Clock, User, LogOut, Eye, Edit, Trash2, DollarSign, Calendar, MapPin, Wrench } from "lucide-react";
import axios from '../api/axiosInstance'; // Use your axios instance
import './Home.css';

function Home() {
    const [dashboardData, setDashboardData] = useState({
        stats: {
            pending: 0,
            proses: 0,
            selesai: 0,
            total: 0
        },
        reports: [],
        loading: true,
        error: null
    });

    const [user, setUser] = useState({
        nama: 'Loading...',
        email: ''
    });

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Get user data from localStorage
    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            try {
                const parsedUser = JSON.parse(userData);
                setUser(parsedUser);
            } catch (error) {
                console.error('Error parsing user data:', error);
            }
        }
    }, []);

    // Fetch dashboard data
    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setDashboardData(prev => ({ ...prev, loading: true, error: null }));

            const token = localStorage.getItem('accessToken');
            if (!token) {
                throw new Error('No access token found');
            }

            // Configure axios headers
            const config = {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            };

            // Fetch data laporan (untuk statistik dan laporan terbaru)
            const response = await axios.get('/laporan', config);
            const allReports = response.data.data.laporan || [];

            // Calculate statistics
            const statsData = {
                pending: allReports.filter(report => report.status === 'pending').length,
                proses: allReports.filter(report => report.status === 'proses').length,
                selesai: allReports.filter(report => report.status === 'selesai').length,
                total: allReports.length
            };

            // Set dashboard data
            setDashboardData({
                stats: statsData,
                reports: allReports,
                loading: false,
                error: null
            });
        } catch (error) {
            let errorMessage = 'Gagal memuat data dashboard';
            if (error.response) {
                errorMessage = error.response.data?.message || `Server error: ${error.response.status}`;
            } else if (error.request) {
                errorMessage = 'Server tidak merespon. Pastikan server backend berjalan.';
            } else {
                errorMessage = error.message;
            }

            setDashboardData(prev => ({
                ...prev,
                loading: false,
                error: errorMessage
            }));
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
    };

    const formatTimeAgo = (dateString) => {
        const now = new Date();
        const reportDate = new Date(dateString);
        const diffInMinutes = Math.floor((now - reportDate) / (1000 * 60));

        if (diffInMinutes < 60) {
            return `${diffInMinutes} menit yang lalu`;
        } else if (diffInMinutes < 1440) {
            const hours = Math.floor(diffInMinutes / 60);
            return `${hours} jam yang lalu`;
        } else {
            const days = Math.floor(diffInMinutes / 1440);
            return `${days} hari yang lalu`;
        }
    };

    const getStatusClass = (status) => {
        switch (status) {
            case 'pending': return 'pending';
            case 'proses': return 'progress';
            case 'selesai': return 'completed';
            default: return 'pending';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending': return <Clock size={16} />;
            case 'proses': return <AlertTriangle size={16} />;
            case 'selesai': return <CheckCircle size={16} />;
            default: return <Clock size={16} />;
        }
    };

    const formatCurrency = (amount) => {
        if (!amount) return '-';
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount);
    };

    if (dashboardData.loading) {
        return (
            <div className="home-container">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Memuat data dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="home-container">
            {/* Header */}
            <header className="home-header">
                <div className="header-content">
                    <div className="header-left">
                        <Shield className="header-icon" size={28} />
                        <div>
                            <h1>Dashboard Pelaporan</h1>
                            <p>Sistem Pelaporan Kerusakan Sarana Prasarana</p>
                        </div>
                    </div>
                    <div className="header-right">
                        <div className="user-info">
                            <User size={20} />
                            <span>{user.nama || user.name || 'User'}</span>
                        </div>
                        <button className="logout-btn" onClick={handleLogout}>
                            <LogOut size={18} />
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="home-main">
                <div className="main-content">
                    {/* Welcome Section */}
                    <section className="welcome-section">
                        <h2>Selamat Datang di Dashboard</h2>
                        <p>Kelola dan pantau laporan kerusakan sarana prasarana dengan mudah</p>
                    </section>

                    {/* Stats Cards */}
                    <section className="stats-section">
                        <div className="stats-grid">
                            <div className="stat-card">
                                <div className="stat-icon pending">
                                    <Clock size={24} />
                                </div>
                                <div className="stat-content">
                                    <h3>{dashboardData.stats.pending}</h3>
                                    <p>Laporan Pending</p>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon progress">
                                    <AlertTriangle size={24} />
                                </div>
                                <div className="stat-content">
                                    <h3>{dashboardData.stats.proses}</h3>
                                    <p>Sedang Diproses</p>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon completed">
                                    <CheckCircle size={24} />
                                </div>
                                <div className="stat-content">
                                    <h3>{dashboardData.stats.selesai}</h3>
                                    <p>Selesai</p>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon total">
                                    <FileText size={24} />
                                </div>
                                <div className="stat-content">
                                    <h3>{dashboardData.stats.total}</h3>
                                    <p>Total Laporan</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Reports List */}
                    <section className="reports-section">
                        <div style={{ background: 'white', borderRadius: '12px', padding: '30px', boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)' }}>
                            <h3 style={{ margin: '0 0 25px 0', color: '#333', fontSize: '20px', fontWeight: '600' }}>
                                Daftar Laporan ({dashboardData.reports.length})
                            </h3>

                            {dashboardData.reports.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                                    <FileText size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                                    <p>Tidak ada laporan yang ditemukan</p>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    {dashboardData.reports.map(report => (
                                        <div key={report.id} style={{
                                            border: '2px solid #f1f3f4',
                                            borderRadius: '12px',
                                            padding: '25px',
                                            transition: 'all 0.3s ease',
                                            cursor: 'pointer'
                                        }}>
                                            <div style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'flex-start',
                                                marginBottom: '15px'
                                            }}>
                                                <div style={{ flex: 1 }}>
                                                    <h4 style={{
                                                        margin: '0 0 8px 0',
                                                        color: '#333',
                                                        fontSize: '18px',
                                                        fontWeight: '600'
                                                    }}>
                                                        {report.judul}
                                                    </h4>
                                                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                                        <div className={`recent-status ${getStatusClass(report.status)}`}>
                                                            {getStatusIcon(report.status)}
                                                        </div>
                                                        <span className={`recent-badge ${getStatusClass(report.status)}`} style={{ fontSize: '12px' }}>
                                                            {report.status === 'pending' ? 'Pending' :
                                                                report.status === 'proses' ? 'Diproses' : 'Selesai'}
                                                        </span>
                                                        <span style={{
                                                            padding: '4px 12px',
                                                            borderRadius: '20px',
                                                            fontSize: '12px',
                                                            fontWeight: '500',
                                                            backgroundColor: report.prioritas === 'tinggi' ? '#ff4757' :
                                                                report.prioritas === 'sedang' ? '#ffa502' : '#2ed573',
                                                            color: 'white'
                                                        }}>
                                                            {report.prioritas.charAt(0).toUpperCase() + report.prioritas.slice(1)}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    <button style={{
                                                        padding: '8px',
                                                        border: 'none',
                                                        borderRadius: '6px',
                                                        background: '#667eea',
                                                        color: 'white',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center'
                                                    }}>
                                                        <Eye size={16} />
                                                    </button>
                                                    <button
                                                        //onClick={() => handleEditClick(report)}
                                                        style={{
                                                            padding: '8px',
                                                            border: 'none',
                                                            borderRadius: '6px',
                                                            background: '#11998e',
                                                            color: 'white',
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center'
                                                        }}
                                                    >
                                                        <Edit size={16} />
                                                    </button>
                                                    <button style={{
                                                        padding: '8px',
                                                        border: 'none',
                                                        borderRadius: '6px',
                                                        background: '#ff4757',
                                                        color: 'white',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center'
                                                    }}>
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                            {/* Content */}
                                            <div style={{ marginBottom: '20px' }}>
                                                <p style={{
                                                    margin: '0 0 15px 0',
                                                    color: '#666',
                                                    fontSize: '14px',
                                                    lineHeight: '1.5'
                                                }}>
                                                    {report.deskripsi}
                                                </p>
                                            </div>

                                            {/* Details Grid */}
                                            <div style={{
                                                display: 'grid',
                                                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                                gap: '15px',
                                                marginBottom: '15px'
                                            }}>
                                                <div>
                                                    <div style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '8px',
                                                        marginBottom: '5px'
                                                    }}>
                                                        <FileText size={16} style={{ color: '#667eea' }} />
                                                        <span style={{ fontSize: '12px', color: '#666', fontWeight: '500' }}>Kategori</span>
                                                    </div>
                                                    <p style={{ margin: 0, fontSize: '14px', color: '#333' }}>{report.kategori}</p>
                                                </div>

                                                <div>
                                                    <div style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '8px',
                                                        marginBottom: '5px'
                                                    }}>
                                                        <MapPin size={16} style={{ color: '#667eea' }} />
                                                        <span style={{ fontSize: '12px', color: '#666', fontWeight: '500' }}>Lokasi</span>
                                                    </div>
                                                    <p style={{ margin: 0, fontSize: '14px', color: '#333' }}>{report.lokasi}</p>
                                                </div>

                                                <div>
                                                    <div style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '8px',
                                                        marginBottom: '5px'
                                                    }}>
                                                        <User size={16} style={{ color: '#667eea' }} />
                                                        <span style={{ fontSize: '12px', color: '#666', fontWeight: '500' }}>Pelapor</span>
                                                    </div>
                                                    <p style={{ margin: 0, fontSize: '14px', color: '#333' }}>{report.pelapor}</p>
                                                </div>

                                                <div>
                                                    <div style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '8px',
                                                        marginBottom: '5px'
                                                    }}>
                                                        <Wrench size={16} style={{ color: '#667eea' }} />
                                                        <span style={{ fontSize: '12px', color: '#666', fontWeight: '500' }}>Teknisi</span>
                                                    </div>
                                                    <p style={{ margin: 0, fontSize: '14px', color: '#333' }}>
                                                        {report.teknisi || 'Belum ditugaskan'}
                                                    </p>
                                                </div>

                                                <div>
                                                    <div style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '8px',
                                                        marginBottom: '5px'
                                                    }}>
                                                        <DollarSign size={16} style={{ color: '#667eea' }} />
                                                        <span style={{ fontSize: '12px', color: '#666', fontWeight: '500' }}>Biaya</span>
                                                    </div>
                                                    <p style={{ margin: 0, fontSize: '14px', color: '#333' }}>
                                                        {formatCurrency(report.biaya)}
                                                    </p>
                                                </div>

                                                <div>
                                                    <div style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '8px',
                                                        marginBottom: '5px'
                                                    }}>
                                                        <Calendar size={16} style={{ color: '#667eea' }} />
                                                        <span style={{ fontSize: '12px', color: '#666', fontWeight: '500' }}>Tanggal Lapor</span>
                                                    </div>
                                                    <p style={{ margin: 0, fontSize: '14px', color: '#333' }}>
                                                        {formatDate(report.tanggal_lapor)}
                                                    </p>
                                                </div>

                                                {report.tanggalSelesai && (
                                                    <div>
                                                        <div style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '8px',
                                                            marginBottom: '5px'
                                                        }}>
                                                            <CheckCircle size={16} style={{ color: '#11998e' }} />
                                                            <span style={{ fontSize: '12px', color: '#666', fontWeight: '500' }}>Tanggal Selesai</span>
                                                        </div>
                                                        <p style={{ margin: 0, fontSize: '14px', color: '#333' }}>
                                                            {formatDate(report.tanggal_aelesai)}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </section>y
                </div>
            </main>
        </div>
    );
}

export default Home;
