// routes/index.js (updated with laporan endpoints)
import express from "express";
import {
  Register,
  Login,
  refreshToken,
  logout,
  getUserProfile,
  getAllUsers
} from "../controllers/UserController.js";
import {
  getAll,
  getById,
  create,
  update,
  deleteById,
  getStats
} from "../controllers/LaporanSummaryController.js";
import {
  getAllLaporan,
  getLaporanById,
  createLaporan,
  updateLaporan,
  deleteLaporan,
  getLaporanByUser,
  updateStatusLaporan,
  getDashboardStats
} from "../controllers/LaporanController.js";
import { verifyToken } from "../middleware/VerifyToken.js";

const router = express.Router();

// ==================== AUTH ROUTES ====================
// Public routes - tidak memerlukan authentication
router.post("/register", Register);
router.post("/login", Login);
router.get("/token", refreshToken); // Refresh access token
router.delete("/logout", logout);

// ==================== USER ROUTES ====================
// Protected routes - memerlukan authentication
router.get("/users/profile", verifyToken, getUserProfile); // Get current user profile
router.get("/users", verifyToken, getAllUsers); // Admin only - get all users

// ==================== LAPORAN ROUTES ====================
// Public routes untuk laporan (read only)
router.get("/laporan/stats", getDashboardStats); // Get dashboard statistics
router.get("/laporan", getAllLaporan); // Get all laporan with pagination & filters
router.get("/laporan/:id", getLaporanById); // Get laporan by ID
router.get("/laporan/user/:userId", getLaporanByUser); // Get laporan by user ID

// Protected routes untuk laporan - memerlukan authentication
router.post("/laporan", verifyToken, createLaporan); // Create new laporan
router.put("/laporan/:id", verifyToken, updateLaporan); // Update laporan (full update)
router.patch("/laporan/:id/status", verifyToken, updateStatusLaporan); // Update status laporan only
router.delete("/laporan/:id", verifyToken, deleteLaporan); // Delete laporan

// ==================== LAPORAN SUMMARY ROUTES ====================
// Public routes untuk laporan summary (read only)
router.get("/laporan-summary/stats", getStats); // Get statistik laporan
router.get("/laporan-summary", getAll); // Get all laporan summary with pagination & filter
router.get("/laporan-summary/:id", getById); // Get laporan summary by ID

// Protected routes untuk laporan summary
router.post("/laporan-summary", verifyToken, create); // Create new laporan summary
router.put("/laporan-summary/:id", verifyToken, update); // Update laporan summary
router.delete("/laporan-summary/:id", verifyToken, deleteById); // Delete laporan summary

// ==================== HEALTH CHECK ROUTE ====================
router.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "API is running",
    timestamp: new Date().toISOString()
  });
});

// ==================== 404 HANDLER ====================
router.use("*", (req, res) => {
  res.status(404).json({
    message: "Route tidak ditemukan",
    path: req.originalUrl,
    method: req.method
  });
});

export default router;