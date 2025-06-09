// LaporanModel.js
import { DataTypes } from "sequelize";
import db from "../config/Database.js";
import Users from "./UserModel.js";

const Laporan = db.define("laporan", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  judul: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
  deskripsi: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  kategori: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  lokasi: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  pelapor_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: Users,
      key: 'id'
    }
  },
  teknisi: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('pending', 'proses', 'selesai'),
    allowNull: false,
    defaultValue: 'pending',
  },
  prioritas: {
    type: DataTypes.ENUM('rendah', 'sedang', 'tinggi'),
    allowNull: false,
    defaultValue: 'sedang',
  },
  foto: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  biaya: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  tanggal_lapor: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  tanggal_selesai: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'laporan_baru',
  timestamps: false,
});

Users.hasMany(Laporan, {
  foreignKey: 'pelapor_id',
  as: 'laporan_dibuat'
});

export default Laporan;