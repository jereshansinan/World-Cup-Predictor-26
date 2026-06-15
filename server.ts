import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Server-side API route: Acts as CORS proxy & secure gateway
  app.get("/api/football-matches", async (req, res) => {
    try {
      const apiKey = process.env.FOOTBALL_DATA_API_KEY || "a565b777432f40269b4826777e08faa7";
      console.log(`Proxied request received. Fetching matches via football-data.org...`);

      // 1. Try to fetch World Cup matches specifically
      let response = await fetch("https://api.football-data.org/v4/competitions/WC/matches", {
        method: "GET",
        headers: {
          "X-Auth-Token": apiKey,
          "Accept": "application/json"
        }
      });

      // 2. If WC failed or restricted, fallback to general matches endpoint
      if (!response.ok) {
        console.warn(`World Cup endpoint returned ${response.status}. Trying fallback general matches...`);
        response = await fetch("https://api.football-data.org/v4/matches", {
          method: "GET",
          headers: {
            "X-Auth-Token": apiKey,
            "Accept": "application/json"
          }
        });
      }

      if (response.ok) {
        const data = await response.json();
        res.json(data);
      } else {
        const errorText = await response.text();
        res.status(response.status).json({ error: errorText || "Failed to fetch from football-data" });
      }
    } catch (error: any) {
      console.error("CORS Proxy Error:", error);
      res.status(500).json({ error: error.message || String(error) });
    }
  });

  // Enable Vite middleware in development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Full-stack server running on http://localhost:${PORT}`);
  });
}

startServer();
