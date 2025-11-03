import express from "express";
import axios from "axios";
import * as cheerio from "cheerio";
import path from "path";
import { fileURLToPath } from "url";

// Setup path (karena __dirname gak ada di ESM)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const BASE_URL = "https://komikindo2.com";

// Middleware: CORS & JSON header
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  next();
});

// Fungsi ambil HTML dari target
async function fetchHTML(url) {
  const { data } = await axios.get(url, {
    headers: { "User-Agent": "Mozilla/5.0" },
  });
  return cheerio.load(data);
}

// Route utama (docs)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "docs.html"));
});

// Route API utama
app.get("/api", async (req, res) => {
  try {
    if (req.query.latest !== undefined) {
      const page = req.query.page || 1;
      const $ = await fetchHTML(`${BASE_URL}/komik-terbaru/page/${page}`);
      const result = [];

      $(".animepost").each((_, el) => {
        result.push({
          judul: $(el).find(".tt h4").text().trim(),
          gambar: $(el).find("img").attr("src"),
          link: $(el).find("a").attr("href"),
        });
      });

      return res.json({ status: true, data: result });
    }

    res.json({ status: true, message: "CuymangaAPI - simple mode" });
  } catch (e) {
    res.status(500).json({ status: false, message: e.message });
  }
});

// Jalankan server lokal (Vercel auto handle)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server ready on port ${PORT}`));

export default app;
