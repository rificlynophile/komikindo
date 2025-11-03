import axios from "axios";
import * as cheerio from "cheerio";

const BASE_URL = "https://komikindo2.com";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Content-Type", "application/json; charset=utf-8");

  const slug = req.query.slug;
  if (!slug) return res.status(400).json({ status: false, message: "Missing slug" });

  try {
    const { data } = await axios.get(`${BASE_URL}/${slug}`, {
      headers: { "User-Agent": "Mozilla/5.0" },
      timeout: 10000
    });
    const $ = cheerio.load(data);

    // FIX: Better selectors for chapter images
    const title = $("h1.entry-title").text().trim() || 
                  $(".chapter-heading").text().trim() ||
                  $("h1").first().text().trim();

    const pages = [];
    $("#chimg img, .reader-area img, .chapter-content img").each((_, el) => {
      const src = $(el).attr("src") || $(el).attr("data-src");
      if (src) {
        pages.push({ url: src });
      }
    });

    res.status(200).json({
      status: true,
      title,
      pages,
    });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
}
