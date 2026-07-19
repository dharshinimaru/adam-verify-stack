import "dotenv/config";
import express from "express";
import cors from "cors";
import { loadBatches } from "./data";
import { runVerification } from "./agent";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true }));

app.post("/api/verify", async (_req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  try {
    for await (const event of runVerification(loadBatches())) {
      res.write(`data: ${JSON.stringify(event)}\n\n`);
    }
    res.write("data: [DONE]\n\n");
  } catch (e) {
    res.write(`data: ${JSON.stringify({ type: "log", data: { timestamp: new Date().toLocaleTimeString(), type: "error", message: String(e) } })}\n\n`);
  }
  res.end();
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Adam Verify API :${PORT}`));
