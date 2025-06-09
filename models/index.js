import db, { mysqlDb, postgresDb, testConnections } from "../config/Database.js";
import Users from "./UserModel.js";
import Laporan from "./LaporanModel.js";

// ==================== RELASI ANTAR MODEL ====================

// Relasi Users dengan Laporan (One-to-Many)
// Satu user bisa memiliki banyak laporan, satu laporan dimiliki oleh satu user
Users.hasMany(Laporan, { 
  foreignKey: "pelapor_id", 
  as: "laporan",
  onDelete: "SET NULL", // Jika user dihapus, laporan tetap ada tapi pelapor_id jadi null
  onUpdate: "CASCADE"
});

Laporan.belongsTo(Users, { 
  foreignKey: "pelapor_id", 
  as: "User",
  allowNull: true // Memungkinkan laporan tanpa pelapor (anonymous)
});

// Relasi Users dengan Lokasi (jika diperlukan)
// Users.belongsTo(Lokasi, { foreignKey: "lokasiId", as: "lokasi" });
// Lokasi.hasMany(Users, { foreignKey: "lokasiId", as: "users" });

// Relasi Users dengan Kategori (jika diperlukan)
// Users.belongsToMany(Kategori, { through: "UserKategori", foreignKey: "userId" });
// Kategori.belongsToMany(Users, { through: "UserKategori", foreignKey: "kategoriId" });

// Relasi Lokasi dengan Kategori (jika diperlukan)
// Lokasi.hasMany(Kategori, { foreignKey: "lokasiId", as: "kategori" });
// Kategori.belongsTo(Lokasi, { foreignKey: "lokasiId", as: "lokasi" });

// Relasi Laporan dengan Lokasi (jika menggunakan tabel terpisah untuk lokasi)
// Laporan.belongsTo(Lokasi, { foreignKey: "lokasiId", as: "lokasiDetail" });
// Lokasi.hasMany(Laporan, { foreignKey: "lokasiId", as: "laporan" });

// Relasi Laporan dengan Kategori (jika menggunakan tabel terpisah untuk kategori)
// Laporan.belongsTo(Kategori, { foreignKey: "kategoriId", as: "kategoriDetail" });
// Kategori.hasMany(Laporan, { foreignKey: "kategoriId", as: "laporan" });

// ==================== SINKRONISASI DATABASE ====================
(async () => {
  try {
    // Tes koneksi kedua database menggunakan fungsi yang sudah ada
    await testConnections();

    // Tes query sederhana untuk PostgreSQL
    try {
      const result = await postgresDb.query('SELECT NOW() as current_time');
      console.log("🕐 PostgreSQL server time:", result[0][0].current_time);
    } catch (pgError) {
      console.error("❌ Gagal test query PostgreSQL:", pgError.message);
    }

    // Sinkronisasi semua tabel di MySQL dengan urutan yang benar
    // Sinkronisasi Users dulu (parent table)
    await Users.sync({ alter: true });
    console.log("✅ Tabel Users berhasil disinkronisasi");
    
    // Kemudian sinkronisasi Laporan (child table)
    await Laporan.sync({ alter: true });
    console.log("✅ Tabel Laporan berhasil disinkronisasi");
    
    // Sinkronisasi seluruh database
    await db.sync({ 
      alter: true, // Mengubah tabel yang sudah ada
      // force: true // Uncomment jika ingin drop dan recreate semua tabel
    });
    
    console.log("✅ Semua tabel berhasil disinkronisasi.");
    console.log("📋 Tabel yang tersedia:");
    console.log("   - Users");
    console.log("   - Laporan (dengan relasi ke Users)");
    console.log("   - Summary Laporan");
    
    console.log("🔗 Relasi yang aktif:");
    console.log("   - Users hasMany Laporan (foreignKey: pelapor_id)");
    console.log("   - Laporan belongsTo Users (foreignKey: pelapor_id, as: 'User')");
    
    // Test relasi dengan sample query
    try {
      const sampleLaporan = await Laporan.findOne({
        include: [{
          model: Users,
          as: 'User',
          attributes: ['id', 'nama', 'email']
        }]
      });
      
      if (sampleLaporan) {
        console.log("✅ Test relasi berhasil - Laporan dengan User data ditemukan");
      } else {
        console.log("ℹ️  Belum ada data laporan untuk test relasi");
      }
    } catch (relationError) {
      console.warn("⚠️  Warning: Test relasi gagal:", relationError.message);
    }
    
  } catch (err) {
    console.error("❌ Gagal konek DB:", err.message);
    process.exit(1); // Keluar dari aplikasi jika gagal koneksi
  }
})();

// ==================== EXPORT MODELS ====================
export { 
  Users, 
  Laporan,
  db,
  mysqlDb,
  postgresDb,
  testConnections
};