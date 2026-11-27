import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname, "public")));

const port = Number(process.env.PORT || 3000);

app.get("/api/config", (_req, res) => {
  res.json({
    configured: Boolean(process.env.AI_API_KEY && process.env.AI_MODEL),
    model: process.env.AI_MODEL || null
  });
});

app.post("/api/chat", async (req, res) => {
  const apiKey = process.env.AI_API_KEY;
  const baseUrl = (process.env.AI_BASE_URL || "").replace(/\/+$/, "");
  const model = process.env.AI_MODEL;
  const chatPath = process.env.AI_CHAT_PATH || "/chat/completions";

  if (!apiKey || !baseUrl || !model) {
    return res.status(503).json({
      error: "BLES AI is not configured yet. Add AI_API_KEY, AI_BASE_URL and AI_MODEL to your .env file."
    });
  }

  const messages = req.body?.messages;
  if (!Array.isArray(messages) || messages.length === 0 || messages.length > 60) {
    return res.status(400).json({ error: "Please send a valid conversation." });
  }

  const safeMessages = messages
    .filter(m => m && ["system", "user", "assistant"].includes(m.role) && typeof m.content === "string")
    .map(m => ({ role: m.role, content: m.content.slice(0, 20000) }));

  if (!safeMessages.length) {
    return res.status(400).json({ error: "No valid messages were provided." });
  }

  let upstream;
  try {
    upstream = await fetch(`${baseUrl}${chatPath.startsWith("/") ? chatPath : `/${chatPath}`}`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model,
        messages: safeMessages,
        stream: true,
        temperature: 0.7
      })
    });
  } catch {
    return res.status(502).json({ error: "Could not reach your AI provider. Check AI_BASE_URL and your internet connection." });
  }

  if (!upstream.ok) {
    const detail = await upstream.text();
    return res.status(upstream.status).json({
      error: `AI provider returned ${upstream.status}.`,
      detail: detail.slice(0, 1200)
    });
  }

  if (!upstream.body) {
    return res.status(502).json({ error: "The provider did not return a response stream." });
  }

  res.setHeader("Content-Type", upstream.headers.get("content-type") || "text/event-stream; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("X-Accel-Buffering", "no");
  res.setHeader("Connection", "keep-alive");

  const reader = upstream.body.getReader();
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (res.destroyed) {
        await reader.cancel();
        break;
      }
      res.write(Buffer.from(value));
    }
    res.end();
  } catch {
    if (!res.destroyed) res.end();
  }
});

app.listen(port, () => {
  console.log(`BLES AI is running at http://localhost:${port}`);
});