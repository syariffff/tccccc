// LaporanController.js
import Laporan from "../models/LaporanModel.js";
import Users from "../models/UserModel.js";
import { Op } from "sequelize";

// GET - Mendapatkan semua laporan
export const getAllLaporan = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, prioritas, kategori, search } = req.query;
    const offset = (page - 1) * limit;
    
    // Build filter conditions
    const whereCondition = {};
    
    if (status) whereCondition.status = status;
    if (prioritas) whereCondition.prioritas = prioritas;
    if (kategori) whereCondition.kategori = { [Op.like]: `%${kategori}%` };
    if (search) {
      whereCondition[Op.or] = [
        { judul: { [Op.like]: `%${search}%` } },
        { deskripsi: { [Op.like]: `%${search}%` } },
        { lokasi: { [Op.like]: `%${search}%` } }
      ];
    }

    const { count, rows } = await Laporan.findAndCountAll({
      where: whereCondition,
      include: [{
        model: Users,
        as: 'User',
        attributes: ['id', 'nama', 'email']
      }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['tanggal_lapor', 'DESC']]
    });

    res.status(200).json({
      success: true,
      message: "Data laporan berhasil diambil",
      data: {
        laporan: rows,
        pagination: {
          totalItems: count,
          totalPages: Math.ceil(count / limit),
          currentPage: parseInt(page),
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Gagal mengambil data laporan",
      error: error.message
    });
  }
};

// GET - Mendapatkan laporan berdasarkan ID
export const getLaporanById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const laporan = await Laporan.findByPk(id, {
      include: [{
        model: Users,
        as: 'User',
        attributes: ['id', 'nama', 'email']
      }]
    });

    if (!laporan) {
      return res.status(404).json({
        success: false,
        message: "Laporan tidak ditemukan"
      });
    }

    res.status(200).json({
      success: true,
      message: "Data laporan berhasil diambil",
      data: laporan
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Gagal mengambil data laporan",
      error: error.message
    });
  }
};

// POST - Membuat laporan baru
export const createLaporan = async (req, res) => {
  try {
    const {
      judul,
      deskripsi,
      kategori,
      lokasi,
      pelapor_id,
      prioritas = 'sedang',
      foto
    } = req.body;

    // Validasi input required
    if (!judul || !deskripsi) {
      return res.status(400).json({
        success: false,
        message: "Judul dan deskripsi harus diisi"
      });
    }

    // Validasi pelapor_id jika ada
    if (pelapor_id) {
      const user = await Users.findByPk(pelapor_id);
      if (!user) {
        return res.status(400).json({
          success: false,
          message: "User pelapor tidak ditemukan"
        });
      }
    }

    const newLaporan = await Laporan.create({
      judul,
      deskripsi,
      kategori,
      lokasi,
      pelapor_id,
      prioritas,
      foto,
      status: 'pending'
    });

    // Ambil data lengkap dengan relasi
    const laporanWithUser = await Laporan.findByPk(newLaporan.id, {
      include: [{
        model: Users,
        as: 'User',
        attributes: ['id', 'nama', 'email']
      }]
    });

    res.status(201).json({
      success: true,
      message: "Laporan berhasil dibuat",
      data: laporanWithUser
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Gagal membuat laporan",
      error: error.message
    });
  }
};

// PUT - Update laporan
export const updateLaporan = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const laporan = await Laporan.findByPk(id);
    if (!laporan) {
      return res.status(404).json({
        success: false,
        message: "Laporan tidak ditemukan"
      });
    }

    // Validasi pelapor_id jika diupdate
    if (updateData.pelapor_id) {
      const user = await Users.findByPk(updateData.pelapor_id);
      if (!user) {
        return res.status(400).json({
          success: false,
          message: "User pelapor tidak ditemukan"
        });
      }
    }

    // Update tanggal_selesai jika status diubah ke 'selesai'
    if (updateData.status === 'selesai' && laporan.status !== 'selesai') {
      updateData.tanggal_selesai = new Date();
    }

    await laporan.update(updateData);

    // Ambil data terbaru dengan relasi
    const updatedLaporan = await Laporan.findByPk(id, {
      include: [{
        model: Users,
        as: 'User',
        attributes: ['id', 'nama', 'email']
      }]
    });

    res.status(200).json({
      success: true,
      message: "Laporan berhasil diupdate",
      data: updatedLaporan
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Gagal mengupdate laporan",
      error: error.message
    });
  }
};

// DELETE - Hapus laporan
export const deleteLaporan = async (req, res) => {
  try {
    const { id } = req.params;

    const laporan = await Laporan.findByPk(id);
    if (!laporan) {
      return res.status(404).json({
        success: false,
        message: "Laporan tidak ditemukan"
      });
    }

    await laporan.destroy();

    res.status(200).json({
      success: true,
      message: "Laporan berhasil dihapus"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Gagal menghapus laporan",
      error: error.message
    });
  }
};

// GET - Mendapatkan laporan berdasarkan user/pelapor
export const getLaporanByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;

    const whereCondition = { pelapor_id: userId };
    if (status) whereCondition.status = status;

    const { count, rows } = await Laporan.findAndCountAll({
      where: whereCondition,
      include: [{
        model: Users,
        as: 'User',
        attributes: ['id', 'nama', 'email']
      }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['tanggal_lapor', 'DESC']]
    });

    res.status(200).json({
      success: true,
      message: "Data laporan user berhasil diambil",
      data: {
        laporan: rows,
        pagination: {
          totalItems: count,
          totalPages: Math.ceil(count / limit),
          currentPage: parseInt(page),
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Gagal mengambil data laporan user",
      error: error.message
    });
  }
};

// PATCH - Update status laporan
export const updateStatusLaporan = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, teknisi } = req.body;

    if (!['pending', 'proses', 'selesai'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status tidak valid. Gunakan: pending, proses, atau selesai"
      });
    }

    const laporan = await Laporan.findByPk(id);
    if (!laporan) {
      return res.status(404).json({
        success: false,
        message: "Laporan tidak ditemukan"
      });
    }

    const updateData = { status };
    
    // Update teknisi jika ada
    if (teknisi) updateData.teknisi = teknisi;
    
    // Set tanggal_selesai jika status berubah ke selesai
    if (status === 'selesai' && laporan.status !== 'selesai') {
      updateData.tanggal_selesai = new Date();
    }

    await laporan.update(updateData);

    const updatedLaporan = await Laporan.findByPk(id, {
      include: [{
        model: Users,
        as: 'User',
        attributes: ['id', 'nama', 'email']
      }]
    });

    res.status(200).json({
      success: true,
      message: "Status laporan berhasil diupdate",
      data: updatedLaporan
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Gagal mengupdate status laporan",
      error: error.message
    });
  }
};

// GET - Dashboard statistics
export const getDashboardStats = async (req, res) => {
  try {
    const totalLaporan = await Laporan.count();
    const pendingCount = await Laporan.count({ where: { status: 'pending' } });
    const prosesCount = await Laporan.count({ where: { status: 'proses' } });
    const selesaiCount = await Laporan.count({ where: { status: 'selesai' } });
    
    const prioritasStats = await Laporan.findAll({
      attributes: [
        'prioritas',
        [db.fn('COUNT', db.col('prioritas')), 'count']
      ],
      group: ['prioritas']
    });

    const kategoriStats = await Laporan.findAll({
      attributes: [
        'kategori',
        [db.fn('COUNT', db.col('kategori')), 'count']
      ],
      group: ['kategori'],
      where: {
        kategori: { [Op.not]: null }
      }
    });

    res.status(200).json({
      success: true,
      message: "Dashboard statistics berhasil diambil",
      data: {
        total: totalLaporan,
        byStatus: {
          pending: pendingCount,
          proses: prosesCount,
          selesai: selesaiCount
        },
        byPrioritas: prioritasStats,
        byKategori: kategoriStats
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Gagal mengambil dashboard statistics",
      error: error.message
    });
  }
};