const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const app = express();

const BASE_URL = "https://komikindo2.com";
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  next();
});

async function fetchHTML(url) {
  const { data } = await axios.get(url, { headers: { "User-Agent": "Mozilla/5.0" } });
  return cheerio.load(data);
}

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/docs.html");
});

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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server ready on port " + PORT));

module.exports = app;
