// models/LaporanSummaryModel.js
import { DataTypes } from 'sequelize';
import { postgresDb } from '../config/Database.js'; // Menggunakan PostgreSQL connection

const LaporanSummaryModel = postgresDb.define('LaporanSummary', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  laporan_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true, // Menambahkan unique constraint
    validate: {
      notNull: {
        msg: 'Laporan ID tidak boleh kosong'
      },
      notEmpty: {
        msg: 'Laporan ID tidak boleh kosong'
      },
      isInt: {
        msg: 'Laporan ID harus berupa angka'
      }
    }
  },
  judul: {
    type: DataTypes.STRING(500), // Diperbesar untuk judul yang panjang
    allowNull: true,
    validate: {
      len: {
        args: [0, 500],
        msg: 'Judul maksimal 500 karakter'
      }
    }
  },
  kategori: {
    type: DataTypes.STRING(100),
    allowNull: true,
    validate: {
      len: {
        args: [0, 100],
        msg: 'Kategori maksimal 100 karakter'
      }
    }
  },
  lokasi: {
    type: DataTypes.STRING(300), // Diperbesar untuk alamat yang panjang
    allowNull: true,
    validate: {
      len: {
        args: [0, 300],
        msg: 'Lokasi maksimal 300 karakter'
      }
    }
  },
  pelapor: {
    type: DataTypes.STRING(150),
    allowNull: true,
    validate: {
      len: {
        args: [0, 150],
        msg: 'Nama pelapor maksimal 150 karakter'
      }
    }
  },
  teknisi: {
    type: DataTypes.STRING(150),
    allowNull: true,
    validate: {
      len: {
        args: [0, 150],
        msg: 'Nama teknisi maksimal 150 karakter'
      }
    }
  },
  status: {
    type: DataTypes.STRING(20),
    allowNull: true,
    defaultValue: 'pending',
    validate: {
      isIn: {
        args: [['pending', 'progress', 'completed', 'cancelled', 'on_hold']],
        msg: 'Status harus salah satu dari: pending, progress, completed, cancelled, on_hold'
      }
    }
  },
  prioritas: {
    type: DataTypes.STRING(20),
    allowNull: true,
    defaultValue: 'medium',
    validate: {
      isIn: {
        args: [['low', 'medium', 'high', 'urgent', 'critical']],
        msg: 'Prioritas harus salah satu dari: low, medium, high, urgent, critical'
      }
    }
  },
  biaya: {
    type: DataTypes.DECIMAL(15, 2), // Diperbesar untuk biaya yang besar
    allowNull: true,
    validate: {
      isDecimal: {
        msg: 'Biaya harus berupa angka desimal'
      },
      min: {
        args: [0],
        msg: 'Biaya tidak boleh negatif'
      },
      max: {
        args: [999999999999.99],
        msg: 'Biaya terlalu besar'
      }
    }
  },
  tanggal_lapor: {
    type: DataTypes.DATE,
    allowNull: true,
    validate: {
      isDate: {
        msg: 'Tanggal lapor harus berupa tanggal yang valid'
      },
      notFuture(value) {
        if (value && new Date(value) > new Date()) {
          throw new Error('Tanggal lapor tidak boleh di masa depan');
        }
      }
    }
  },
  tanggal_selesai: {
    type: DataTypes.DATE,
    allowNull: true,
    validate: {
      isDate: {
        msg: 'Tanggal selesai harus berupa tanggal yang valid'
      },
      isAfterTanggalLapor(value) {
        if (value && this.tanggal_lapor && new Date(value) < new Date(this.tanggal_lapor)) {
          throw new Error('Tanggal selesai tidak boleh sebelum tanggal lapor');
        }
      }
    }
  },
  lama_penyelesaian_hari: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      isInt: {
        msg: 'Lama penyelesaian harus berupa angka'
      },
      min: {
        args: [0],
        msg: 'Lama penyelesaian tidak boleh negatif'
      },
      max: {
        args: [36500], // Maksimal 100 tahun
        msg: 'Lama penyelesaian terlalu besar'
      }
    }
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'laporan_summary',
  timestamps: true, // Menggunakan timestamps Sequelize
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      unique: true,
      fields: ['laporan_id']
    },
    {
      fields: ['status']
    },
    {
      fields: ['prioritas']
    },
    {
      fields: ['kategori']
    },
    {
      fields: ['teknisi']
    },
    {
      fields: ['tanggal_lapor']
    },
    {
      fields: ['created_at']
    },
    {
      // Composite index untuk search yang sering dilakukan
      fields: ['status', 'prioritas']
    }
  ],
  // Hooks untuk auto-calculate lama penyelesaian
  hooks: {
    beforeSave: (instance, options) => {
      // Auto calculate lama_penyelesaian_hari jika belum diset
      if (instance.tanggal_lapor && instance.tanggal_selesai && !instance.lama_penyelesaian_hari) {
        const diffTime = Math.abs(new Date(instance.tanggal_selesai) - new Date(instance.tanggal_lapor));
        instance.lama_penyelesaian_hari = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      }
      
      // Update status jika tanggal_selesai diisi
      if (instance.tanggal_selesai && instance.status === 'progress') {
        instance.status = 'completed';
      }
    }
  }
});

// Static methods untuk konstanta
LaporanSummaryModel.STATUS = {
  PENDING: 'pending',
  PROGRESS: 'progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  ON_HOLD: 'on_hold'
};

LaporanSummaryModel.PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
  CRITICAL: 'critical'
};

// Static methods untuk query yang sering digunakan
LaporanSummaryModel.findByStatus = function(status) {
  return this.findAll({
    where: { status },
    order: [['created_at', 'DESC']]
  });
};

LaporanSummaryModel.findByPrioritas = function(prioritas) {
  return this.findAll({
    where: { prioritas },
    order: [['created_at', 'DESC']]
  });
};

LaporanSummaryModel.findByTeknisi = function(teknisi) {
  return this.findAll({
    where: { teknisi },
    order: [['created_at', 'DESC']]
  });
};

LaporanSummaryModel.findOverdue = function(days = 30) {
  const overdueDate = new Date();
  overdueDate.setDate(overdueDate.getDate() - days);
  
  return this.findAll({
    where: {
      status: ['pending', 'progress'],
      tanggal_lapor: {
        [DataTypes.Op.lte]: overdueDate
      }
    },
    order: [['tanggal_lapor', 'ASC']]
  });
};

// Instance methods
LaporanSummaryModel.prototype.hitungLamaPenyelesaian = function() {
  if (this.tanggal_lapor && this.tanggal_selesai) {
    const diffTime = Math.abs(new Date(this.tanggal_selesai) - new Date(this.tanggal_lapor));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }
  return null;
};

LaporanSummaryModel.prototype.isOverdue = function(days = 30) {
  if (!this.tanggal_lapor || this.status === 'completed' || this.status === 'cancelled') {
    return false;
  }
  
  const overdueDate = new Date();
  overdueDate.setDate(overdueDate.getDate() - days);
  
  return new Date(this.tanggal_lapor) <= overdueDate;
};

LaporanSummaryModel.prototype.getStatusColor = function() {
  const colors = {
    pending: '#fbbf24',     // yellow
    progress: '#3b82f6',    // blue
    completed: '#10b981',   // green
    cancelled: '#ef4444',   // red
    on_hold: '#6b7280'      // gray
  };
  
  return colors[this.status] || '#6b7280';
};

LaporanSummaryModel.prototype.getPriorityColor = function() {
  const colors = {
    low: '#10b981',         // green
    medium: '#f59e0b',      // amber
    high: '#ef4444',        // red
    urgent: '#dc2626',      // red-600
    critical: '#7c2d12'     // red-900
  };
  
  return colors[this.prioritas] || '#6b7280';
};

LaporanSummaryModel.prototype.toSafeJSON = function() {
  const values = this.toJSON();
  
  // Tambahkan computed fields
  values.lama_penyelesaian_calculated = this.hitungLamaPenyelesaian();
  values.is_overdue = this.isOverdue();
  values.status_color = this.getStatusColor();
  values.priority_color = this.getPriorityColor();
  
  return values;
};

export default LaporanSummaryModel;