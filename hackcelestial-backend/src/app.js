import express from "express";
import cors from "cors";
import itineraryRoutes from "./routes/itinerary.js";
import disruptRoutes from "./routes/disrupt.js";
import recoveryRoutes from "./routes/recovery.js";
import { getAllTrips } from "./data/store.js";

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get("/api/health", (_req, res) => res.json({ ok: true }));
  app.get("/api/trips", (_req, res) => res.json(getAllTrips()));

  app.use("/api/itinerary", itineraryRoutes);
  app.use("/api", disruptRoutes);   // /api/disrupt, /api/disruption-types
  app.use("/api", recoveryRoutes);  // /api/select-recovery

  app.use((_req, res) => res.status(404).json({ error: "Not found" }));

  // eslint-disable-next-line no-unused-vars
  app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  });

  return app;
}
