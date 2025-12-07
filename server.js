// server.js
const express = require("express");
const { MongoClient, ServerApiVersion } = require("mongodb");

const app = express();
app.use(express.json());

// Porta usada pelo Render
const PORT = process.env.PORT || 3000;

// URI do MongoDB Atlas
const MONGO_URI = "mongodb+srv://abraaotavares84_db_user:verificacao@cluster0.wieydkm.mongodb.net/verificacao?retryWrites=true&w=majority";

let playersCollection;

// ------- CONECTAR AO MONGO -------
async function conectarDB() {
  try {
    const client = new MongoClient(MONGO_URI, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      },

      // Configurações 100% compatíveis com Node 22 + MongoDB
      maxPoolSize: 10,
      minPoolSize: 1,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      keepAliveInitialDelay: 300000, // 5 min
    });

    await client.connect();

    const db = client.db("verificacao");
    playersCollection = db.collection("players");

    console.log("✅ Conectado ao MongoDB Atlas!");

    app.listen(PORT, () => {
      console.log(`🚀 API rodando na porta ${PORT}`);
    });

  } catch (err) {
    console.error("❌ Erro ao conectar ao MongoDB:", err);

    // evita crash no Render
    setTimeout(conectarDB, 5000);
  }
}

// ------- POST /verify -------
app.post("/verify", async (req, res) => {
  if (!playersCollection)
    return res.status(500).json({ success: false, error: "DB não conectado" });

  const player = req.body.player?.toLowerCase();
  if (!player)
    return res.json({ success: false, error: "Missing player" });

  try {
    const existe = await playersCollection.findOne({ name: player });

    if (!existe) {
      await playersCollection.insertOne({ name: player });
    }

    return res.json({ success: true, player });

  } catch (err) {
    console.error(err);
    return res.json({ success: false, error: "Erro ao acessar DB" });
  }
});

// ------- GET /check -------
app.get("/check", async (req, res) => {
  if (!playersCollection)
    return res.status(500).json({ verified: false });

  const player = req.query.player?.toLowerCase();
  if (!player)
    return res.json({ verified: false });

  try {
    const existe = await playersCollection.findOne({ name: player });
    return res.json({ verified: !!existe });

  } catch (err) {
    console.error(err);
    return res.json({ verified: false });
  }
});

// Iniciar conexão
conectarDB();