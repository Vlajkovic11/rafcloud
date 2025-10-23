import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";

const app = express();

app.use(cors({
    origin: "http://localhost:3000", // frontend adresa
    credentials: true
}));

app.use(express.json());

app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
    res.send("Back radi");
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});