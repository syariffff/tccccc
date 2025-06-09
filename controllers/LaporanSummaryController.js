// controllers/LaporanSummaryController.js
import LaporanSummary from '../models/LaporanSummaryModel.js';
import { Op } from 'sequelize';
import { postgresDb as sequelize } from '../config/Database.js'; // ← Gunakan PostgreSQL

// GET /api/laporan-summary - Mendapatkan semua data laporan summary
export const getAll = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      prioritas,
      kategori,
      search,
      sortBy = 'created_at',
      order = 'DESC'
    } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = {};

    // Filter berdasarkan status
    if (status) {
      whereClause.status = status;
    }

    // Filter berdasarkan prioritas
    if (prioritas) {
      whereClause.prioritas = prioritas;
    }

    // Filter berdasarkan kategori
    if (kategori) {
      whereClause.kategori = kategori;
    }

    // Search berdasarkan judul, pelapor, atau teknisi
    if (search) {
      whereClause[Op.or] = [
        { judul: { [Op.iLike]: `%${search}%` } },
        { pelapor: { [Op.iLike]: `%${search}%` } },
        { teknisi: { [Op.iLike]: `%${search}%` } },
        { lokasi: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const { count, rows } = await LaporanSummary.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [[sortBy, order.toUpperCase()]]
    });

    res.json({
      success: true,
      data: {
        laporan: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        }
      }
    });

  } catch (error) {
    console.error('Error in getAll:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data laporan summary',
      error: error.message
    });
  }
};

// GET /api/laporan-summary/:id - Mendapatkan satu data laporan summary
export const getById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const laporan = await LaporanSummary.findByPk(id);
    
    if (!laporan) {
      return res.status(404).json({
        success: false,
        message: 'Laporan summary tidak ditemukan'
      });
    }

    res.json({
      success: true,
      data: laporan
    });

  } catch (error) {
    console.error('Error in getById:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data laporan summary',
      error: error.message
    });
  }
};

// POST /api/laporan-summary - Membuat laporan summary baru
export const create = async (req, res) => {
  try {
    const {
      laporan_id,
      judul,
      kategori,
      lokasi,
      pelapor,
      teknisi,
      status,
      prioritas,
      biaya,
      tanggal_lapor,
      tanggal_selesai
    } = req.body;

    // Validasi laporan_id wajib diisi
    if (!laporan_id) {
      return res.status(400).json({
        success: false,
        message: 'Laporan ID wajib diisi'
      });
    }

    // Hitung lama penyelesaian jika tanggal lengkap
    let lama_penyelesaian_hari = null;
    if (tanggal_lapor && tanggal_selesai) {
      const diffTime = Math.abs(new Date(tanggal_selesai) - new Date(tanggal_lapor));
      lama_penyelesaian_hari = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    // Prepare data tanpa timestamp otomatis
    const createData = {
      laporan_id,
      judul,
      kategori,
      lokasi,
      pelapor,
      teknisi,
      status,
      prioritas,
      biaya,
      tanggal_lapor,
      tanggal_selesai,
      lama_penyelesaian_hari
    };

    const laporan = await LaporanSummary.create(createData);

    res.status(201).json({
      success: true,
      message: 'Laporan summary berhasil dibuat',
      data: laporan
    });

  } catch (error) {
    console.error('Error in create:', error);
    
    // Handle Sequelize validation errors
    if (error.name === 'SequelizeValidationError') {
      const validationErrors = error.errors.map(err => ({
        field: err.path,
        message: err.message
      }));
      
      return res.status(400).json({
        success: false,
        message: 'Validasi gagal',
        errors: validationErrors
      });
    }

    // Handle unique constraint errors
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        success: false,
        message: 'Data sudah ada',
        error: error.message
      });
    }

    res.status(400).json({
      success: false,
      message: 'Gagal membuat laporan summary',
      error: error.message
    });
  }
};

// PUT /api/laporan-summary/:id - Update laporan summary
export const update = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    const laporan = await LaporanSummary.findByPk(id);
    
    if (!laporan) {
      return res.status(404).json({
        success: false,
        message: 'Laporan summary tidak ditemukan'
      });
    }

    // Hitung ulang lama penyelesaian jika tanggal diupdate
    if (updateData.tanggal_lapor || updateData.tanggal_selesai) {
      const tanggalLapor = updateData.tanggal_lapor || laporan.tanggal_lapor;
      const tanggalSelesai = updateData.tanggal_selesai || laporan.tanggal_selesai;
      
      if (tanggalLapor && tanggalSelesai) {
        const diffTime = Math.abs(new Date(tanggalSelesai) - new Date(tanggalLapor));
        updateData.lama_penyelesaian_hari = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      }
    }

    // Hapus timestamp manual karena tidak ada di tabel
    // updateData.updated_at = new Date();

    await laporan.update(updateData);

    // Reload untuk mendapatkan data terbaru
    await laporan.reload();

    res.json({
      success: true,
      message: 'Laporan summary berhasil diupdate',
      data: laporan
    });

  } catch (error) {
    console.error('Error in update:', error);
    
    // Handle Sequelize validation errors
    if (error.name === 'SequelizeValidationError') {
      const validationErrors = error.errors.map(err => ({
        field: err.path,
        message: err.message
      }));
      
      return res.status(400).json({
        success: false,
        message: 'Validasi gagal',
        errors: validationErrors
      });
    }

    res.status(400).json({
      success: false,
      message: 'Gagal mengupdate laporan summary',
      error: error.message
    });
  }
};

// DELETE /api/laporan-summary/:id - Hapus laporan summary
export const deleteById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const laporan = await LaporanSummary.findByPk(id);
    
    if (!laporan) {
      return res.status(404).json({
        success: false,
        message: 'Laporan summary tidak ditemukan'
      });
    }

    await laporan.destroy();

    res.json({
      success: true,
      message: 'Laporan summary berhasil dihapus'
    });

  } catch (error) {
    console.error('Error in deleteById:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal menghapus laporan summary',
      error: error.message
    });
  }
};

// GET /api/laporan-summary/stats - Mendapatkan statistik laporan
export const getStats = async (req, res) => {
  try {
    // Total laporan
    const totalLaporan = await LaporanSummary.count();
    
    // Distribusi status
    const statusStats = await LaporanSummary.findAll({
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['status'],
      raw: true
    });

    // Distribusi prioritas
    const prioritasStats = await LaporanSummary.findAll({
      attributes: [
        'prioritas',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['prioritas'],
      raw: true
    });

    // Rata-rata lama penyelesaian
    const avgPenyelesaian = await LaporanSummary.findOne({
      attributes: [
        [sequelize.fn('AVG', sequelize.col('lama_penyelesaian_hari')), 'avg_days']
      ],
      where: {
        lama_penyelesaian_hari: { [Op.ne]: null }
      },
      raw: true
    });

    // Total biaya
    const totalBiaya = await LaporanSummary.findOne({
      attributes: [
        [sequelize.fn('SUM', sequelize.col('biaya')), 'total_biaya']
      ],
      where: {
        biaya: { [Op.ne]: null }
      },
      raw: true
    });

    // Laporan per bulan (6 bulan terakhir)
    const laporanPerBulan = await LaporanSummary.findAll({
      attributes: [
        [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('tanggal_lapor')), 'bulan'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'jumlah']
      ],
      where: {
        tanggal_lapor: {
          [Op.gte]: sequelize.literal("DATE_TRUNC('month', CURRENT_DATE - INTERVAL '6 months')")
        }
      },
      group: [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('tanggal_lapor'))],
      order: [[sequelize.fn('DATE_TRUNC', 'month', sequelize.col('tanggal_lapor')), 'ASC']],
      raw: true
    });

    // Kategori terbanyak
    const kategoriStats = await LaporanSummary.findAll({
      attributes: [
        'kategori',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where: {
        kategori: { [Op.ne]: null }
      },
      group: ['kategori'],
      order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']],
      limit: 5,
      raw: true
    });

    // Teknisi terbanyak
    const teknisiStats = await LaporanSummary.findAll({
      attributes: [
        'teknisi',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where: {
        teknisi: { [Op.ne]: null }
      },
      group: ['teknisi'],
      order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']],
      limit: 5,
      raw: true
    });

    res.json({
      success: true,
      data: {
        total_laporan: totalLaporan,
        status_distribution: statusStats,
        prioritas_distribution: prioritasStats,
        avg_penyelesaian_hari: parseFloat(avgPenyelesaian?.avg_days || 0).toFixed(2),
        total_biaya: parseFloat(totalBiaya?.total_biaya || 0).toFixed(2),
        laporan_per_bulan: laporanPerBulan,
        top_kategori: kategoriStats,
        top_teknisi: teknisiStats
      }
    });

  } catch (error) {
    console.error('Error in getStats:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil statistik laporan',
      error: error.message
    });
  }
};

// GET /api/laporan-summary/filter-options - Mendapatkan opsi untuk filter
export const getFilterOptions = async (req, res) => {
  try {
    // Ambil semua status yang tersedia
    const statusOptions = await LaporanSummary.findAll({
      attributes: ['status'],
      where: { status: { [Op.ne]: null } },
      group: ['status'],
      raw: true
    });

    // Ambil semua prioritas yang tersedia
    const prioritasOptions = await LaporanSummary.findAll({
      attributes: ['prioritas'],
      where: { prioritas: { [Op.ne]: null } },
      group: ['prioritas'],
      raw: true
    });

    // Ambil semua kategori yang tersedia
    const kategoriOptions = await LaporanSummary.findAll({
      attributes: ['kategori'],
      where: { kategori: { [Op.ne]: null } },
      group: ['kategori'],
      raw: true
    });

    // Ambil semua teknisi yang tersedia
    const teknisiOptions = await LaporanSummary.findAll({
      attributes: ['teknisi'],
      where: { teknisi: { [Op.ne]: null } },
      group: ['teknisi'],
      raw: true
    });

    res.json({
      success: true,
      data: {
        status: statusOptions.map(item => item.status),
        prioritas: prioritasOptions.map(item => item.prioritas),
        kategori: kategoriOptions.map(item => item.kategori),
        teknisi: teknisiOptions.map(item => item.teknisi)
      }
    });

  } catch (error) {
    console.error('Error in getFilterOptions:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil opsi filter',
      error: error.message
    });
  }
};