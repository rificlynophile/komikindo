import axios from "axios";
import * as cheerio from "cheerio";

const BASE_URL = "https://komikindo2.com";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Content-Type", "application/json; charset=utf-8");

  const slug = req.query.slug;
  if (!slug) return res.status(400).json({ status: false, message: "Missing slug" });

  try {
    const { data } = await axios.get(`${BASE_URL}/komik/${slug}`, {
      headers: { "User-Agent": "Mozilla/5.0" },
      timeout: 10000
    });
    const $ = cheerio.load(data);

    // FIX: Better selectors
    const title = $("h1.entry-title").text().trim() || 
                  $(".komik-info h1").text().trim() ||
                  $("h1").first().text().trim();
    
    const author = $(".komik-info .author").text().replace("Author:", "").trim() ||
                   $(".info-content .author").text().trim();
    
    const genre = $(".komik-info .genre").text().replace("Genre:", "").trim() ||
                  $(".genre-info").text().trim();

    const chapters = [];
    $(".chapter-link, .lchx a, .eplister li a").each((_, el) => {
      const href = $(el).attr("href");
      if (href) {
        chapters.push({
          title: $(el).text().trim(),
          slug: href.split("/").filter(Boolean).pop(),
        });
      }
    });

    res.status(200).json({
      status: true,
      title,
      author,
      genre,
      chapters,
    });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
}}
