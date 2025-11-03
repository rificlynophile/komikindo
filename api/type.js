import axios from "axios";
import * as cheerio from "cheerio";

const BASE_URL = "https://komikindo2.com";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Content-Type", "application/json; charset=utf-8");

  const type = req.query.name;
  const page = req.query.page || 1;

  if (!type) return res.status(400).json({ status: false, message: "Missing type" });

  try {
    const { data } = await axios.get(`${BASE_URL}/type/${type}/page/${page}`, {
      headers: { "User-Agent": "Mozilla/5.0" },
    });
    const $ = cheerio.load(data);

    const result = [];
    $(".animepost").each((_, el) => {
      result.push({
        judul: $(el).find(".tt h4").text().trim(),
        gambar: $(el).find("img").attr("src"),
        link: $(el).find("a").attr("href"),
      });
    });

    res.status(200).json({ status: true, data: result });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
}
