require("dotenv").config();

const path = require("path");
const express = require("express");
const { MongoClient, ServerApiVersion } = require("mongodb");

const app = express();
const port = process.env.PORT || 8000;
const publicUrl = process.env.PUBLIC_URL || "";
const mongoUri = process.env.MONGODB_URI || "";
const dbName = process.env.MONGODB_DB || "independencia_indigena";

let mongoClient;
let database;

app.use(express.json({ limit: "20kb" }));
app.use(express.static(__dirname));

const getDatabase = async () => {
  if (!mongoUri) return null;
  if (database) return database;

  mongoClient = new MongoClient(mongoUri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  });

  await mongoClient.connect();
  database = mongoClient.db(dbName);
  await database.collection("visits").createIndex({ createdAt: -1 });
  await database.collection("shares").createIndex({ createdAt: -1 });
  return database;
};

const getClientIp = (request) => {
  const forwardedFor = request.headers["x-forwarded-for"];
  if (typeof forwardedFor === "string") return forwardedFor.split(",")[0].trim();
  return request.socket.remoteAddress || "";
};

app.get("/api/config", (request, response) => {
  const origin = `${request.protocol}://${request.get("host")}`;
  response.json({
    publicUrl: publicUrl || origin,
    databaseEnabled: Boolean(mongoUri),
  });
});

app.get("/api/health", async (request, response) => {
  try {
    const db = await getDatabase();
    if (db) await db.command({ ping: 1 });

    response.json({
      ok: true,
      database: db ? "connected" : "not-configured",
    });
  } catch (error) {
    response.status(500).json({
      ok: false,
      database: "error",
      message: "No se pudo conectar con MongoDB.",
    });
  }
});

app.post("/api/visits", async (request, response) => {
  try {
    const db = await getDatabase();
    if (!db) {
      response.status(202).json({ ok: true, saved: false });
      return;
    }

    await db.collection("visits").insertOne({
      page: request.body.page || "/",
      userAgent: request.headers["user-agent"] || "",
      ip: getClientIp(request),
      createdAt: new Date(),
    });

    response.status(201).json({ ok: true, saved: true });
  } catch (error) {
    response.status(500).json({ ok: false, message: "No se pudo guardar la visita." });
  }
});

app.post("/api/shares", async (request, response) => {
  try {
    const db = await getDatabase();
    if (!db) {
      response.status(202).json({ ok: true, saved: false });
      return;
    }

    await db.collection("shares").insertOne({
      method: request.body.method || "unknown",
      url: request.body.url || "",
      userAgent: request.headers["user-agent"] || "",
      ip: getClientIp(request),
      createdAt: new Date(),
    });

    response.status(201).json({ ok: true, saved: true });
  } catch (error) {
    response.status(500).json({ ok: false, message: "No se pudo guardar el evento." });
  }
});

app.get("*", (request, response) => {
  response.sendFile(path.join(__dirname, "index.html"));
});

let server;

const startServer = () => {
  server = app.listen(port, "0.0.0.0", () => {
    console.log(`Sitio disponible en http://localhost:${port}`);
  });

  return server;
};

const shutdown = async () => {
  if (server) server.close();
  if (mongoClient) await mongoClient.close();
  process.exit(0);
};

if (require.main === module) {
  startServer();
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

module.exports = { app, startServer };
