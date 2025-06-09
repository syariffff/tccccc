import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import { Shield, Plus, FileText, AlertTriangle, CheckCircle, Clock, User, LogOut } from "lucide-react";
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
        recentReports: [],
        loading: true,
        error: null
    });

    const [user, setUser] = useState({
        nama: 'Loading...',
        email: ''
    });

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
            console.log('Token:', token);
            
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

            // Fetch all reports data (used for both stats and recent reports)
            let allReports = [];
            let statsData = { pending: 0, proses: 0, selesai: 0, total: 0 };
            
            try {
                const recentResponse = await axios.get('/laporan', config);
                console.log('All reports response:', recentResponse.data);
                
                // Handle different possible response structures
                if (recentResponse.data) {
                    if (recentResponse.data.data && recentResponse.data.data.laporan) {
                        // Structure: { data: { laporan: [...] } }
                        allReports = recentResponse.data.data.laporan;
                    } else if (recentResponse.data.data && Array.isArray(recentResponse.data.data)) {
                        // Structure: { data: [...] }
                        allReports = recentResponse.data.data;
                    } else if (Array.isArray(recentResponse.data)) {
                        // Structure: [...] (direct array)
                        allReports = recentResponse.data;
                    } else if (recentResponse.data.laporan && Array.isArray(recentResponse.data.laporan)) {
                        // Structure: { laporan: [...] }
                        allReports = recentResponse.data.laporan;
                    }
                }
                
                console.log('Processed all reports:', allReports);
                
                // Calculate statistics from all reports
                if (Array.isArray(allReports) && allReports.length > 0) {
                    statsData = {
                        pending: allReports.filter(report => report.status === 'pending').length,
                        proses: allReports.filter(report => report.status === 'proses').length,
                        selesai: allReports.filter(report => report.status === 'selesai').length,
                        total: allReports.length
                    };
                }
                
                console.log('Calculated stats:', statsData);
                
            } catch (reportsError) {
                console.warn('Reports endpoint error:', reportsError);
                console.warn('Error details:', reportsError.response?.data);
                // Continue with empty array and default stats
            }

            // Prepare recent reports (sorted by most recent, limited to 5)
            let recentReports = [];
            if (Array.isArray(allReports) && allReports.length > 0) {
                recentReports = [...allReports]
                    .sort((a, b) => new Date(b.tanggal_lapor || b.created_at) - new Date(a.tanggal_lapor || a.created_at))
                    .slice(0, 5);
            }

            setDashboardData({
                stats: statsData,
                recentReports: recentReports,
                loading: false,
                error: null
            });

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            console.error('Error response:', error.response?.data);
            
            let errorMessage = 'Gagal memuat data dashboard';
            if (error.response) {
                // Server responded with error status
                errorMessage = error.response.data?.message || `Server error: ${error.response.status}`;
            } else if (error.request) {
                // Request was made but no response received
                errorMessage = 'Server tidak merespon. Pastikan server backend berjalan.';
            } else {
                // Something else happened
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
        try {
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
        } catch (error) {
            return 'Waktu tidak valid';
        }
    };

    const getStatusColor = (status) => {
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

    const getStatusText = (status) => {
        switch (status) {
            case 'pending': return 'Pending';
            case 'proses': return 'Diproses';
            case 'selesai': return 'Selesai';
            default: return 'Pending';
        }
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

                    {/* Error Display */}
                    {dashboardData.error && (
                        <div className="error-container">
                            <AlertTriangle size={20} />
                            <p>{dashboardData.error}</p>
                            <button onClick={fetchDashboardData}>Coba Lagi</button>
                        </div>
                    )}

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

                    {/* Action Section */}
                    <section className="action-section">
                        <div className="action-grid">
                            <div className="action-card main-action" style={{backgroundColor: "white"}}>
                                <div className="action-icon">
                                    <Link to="/input">
                                        <Plus size={32} />
                                    </Link>
                                </div>
                                <div className="action-content">
                                    <h3>Buat Laporan Baru</h3>
                                    <p>Laporkan kerusakan sarana prasarana yang ditemukan</p>
                                    <Link to="/input" className="action-button primary">
                                        Buat Laporan
                                    </Link>
                                </div>
                            </div>
                            
                            <div className="action-card">
                                <div className="action-icon secondary">
                                    <FileText size={28} />
                                </div>
                                <div className="action-content">
                                    <h3>Lihat Laporan</h3>
                                    <p>Pantau status semua laporan yang telah dibuat</p>
                                    <Link to="/reports" className="action-button secondary">
                                        Lihat Semua
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Recent Reports */}
                    <section className="recent-section">
                        <h3>Laporan Terbaru</h3>
                        <div className="recent-list">
                            {dashboardData.recentReports && dashboardData.recentReports.length > 0 ? (
                                dashboardData.recentReports.map((report) => (
                                    <div key={report.id} className="recent-item">
                                        <div className={`recent-status ${getStatusColor(report.status)}`}>
                                            {getStatusIcon(report.status)}
                                        </div>
                                        <div className="recent-content">
                                            <h4>{report.judul || report.title || 'Laporan Tanpa Judul'}</h4>
                                            <p>Dilaporkan {formatTimeAgo(report.tanggal_lapor || report.created_at)}</p>
                                            {report.lokasi && (
                                                <p className="location-info">
                                                    {report.lokasi.ruangan && `${report.lokasi.ruangan}, `}
                                                    {report.lokasi.lantai && `Lantai ${report.lokasi.lantai}, `}
                                                    {report.lokasi.gedung && `Gedung ${report.lokasi.gedung}`}
                                                </p>
                                            )}
                                            {/* Fallback for location if it's a string */}
                                            {typeof report.lokasi === 'string' && (
                                                <p className="location-info">{report.lokasi}</p>
                                            )}
                                        </div>
                                        <span className={`recent-badge ${getStatusColor(report.status)}`}>
                                            {getStatusText(report.status)}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <div className="no-reports">
                                    <FileText size={48} />
                                    <p>Belum ada laporan terbaru</p>
                                    <p>Data tersedia: {JSON.stringify(dashboardData.recentReports)}</p>
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}

export default Home;