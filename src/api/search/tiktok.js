// Scrape Toktok Suprot Imeg By Aku Gweh
const axios = require("axios");
const cheerio = require("cheerio");

module.exports = function (app) {
  async function scrapeTiktok(videoUrl) {
    try {
      const url = "https://ttsave.app/download";
      const headers = {
        "Accept": "application/json, text/plain, */*",
        "Content-Type": "application/json"
      };
      const data = {
        query: videoUrl,
        language_id: "2"
      };

      const res = await axios.post(url, data, { headers });
      const $ = cheerio.load(res.data);

      // 🔹 Video tanpa watermark
      let nowatermark = $('a[type="no-watermark"]').attr("href") || null;
      if (nowatermark && nowatermark.toLowerCase().endsWith(".mp3"))
        nowatermark = null;

      // 🔹 Audio
      let audio = $('a[type="audio"]').attr("href") || null;
      if (audio === "") audio = null;

      // 🔹 Slides
      const slides = [];
      $('a[type="slide"]').each((i, el) => {
        const download = $(el).attr("href");
        const img = $(el).prev("div").find("img").attr("src");
        slides.push({
          slide: i + 1,
          image: img,
          download
        });
      });

      return {
        status: true,
        nowatermark,
        audio,
        slides: slides.length > 0 ? slides : null
      };
    } catch (error) {
      throw new Error(
        error.response
          ? `Status: ${error.response.status}`
          : error.message
      );
    }
  }

  // ✅ Endpoint Express
  app.get("/api/tiktok", async (req, res) => {
    try {
      const { url } = req.query;
      if (!url)
        return res
          .status(400)
          .json({ status: false, error: "Parameter 'url' is required" });

      const result = await scrapeTiktok(url);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ status: false, error: error.message });
    }
  });
};