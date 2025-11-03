import axios from "axios";
import * as cheerio from "cheerio";

const BASE_URL = "https://komikindo2.com";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Content-Type", "application/json; charset=utf-8");

  const slug = req.query.slug;
  if (!slug) return res.status(400).json({ status: false, message: "Missing slug" });

  try {
    const { data } = await axios.get(`${BASE_URL}/chapter/${slug}`, {
      headers: { "User-Agent": "Mozilla/5.0" },
    });
    const $ = cheerio.load(data);

    const pages = [];
    $(".chapter-content img").each((_, el) => {
      pages.push({ url: $(el).attr("src") });
    });

    res.status(200).json({
      status: true,
      title: $(".chapter-title").text().trim(),
      pages,
    });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
}
