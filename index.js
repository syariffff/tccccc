import express from "express";
import cors from "cors";
import route from "./routes/route.js";
import "./models/index.js"; // Sinkronisasi DB
import cookieParser from "cookie-parser";

const app = express();
const port = process.env.PORT || 5000;

// Konfigurasi CORS (sesuai domain frontend yang kamu punya)
const corsOptions = {
  origin: [
    "",
    "http://localhost:3000",
  ],
  credentials: true, // Mengizinkan cookie dikirim
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // preflight requests

app.use(express.json());
app.use(cookieParser());

app.use(route);

// Fallback route untuk 404 jika route tidak ditemukan
app.all("*", (req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});
