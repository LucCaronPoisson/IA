import express from "express";
import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

const app = express();
const PORT = process.env.PORT || 3000;
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
app.use(express.json());
app.use(express.static("public"));

app.post("/api/chat", async (req, res) => {
  try {
    const message = req.body.message;
    const history = req.body.history || [];
    if (!message || message.trim() === "") {
      return res.status(400).json({
        error: "Le message est vide."
      });
    }

    console.log("Message reçu :", message);
    console.log("Nombre de messages précédents :", history.length);
    const contents = history.map((item) => {

      return {
        role: item.role,
        parts: [{text: item.text}]
      };
    });
    contents.push({
      role: "user",
      parts: [{text: message}]
    });
    console.log(
      "Modèle utilisé :",
      process.env.GEMINI_MODEL
    );

    const response = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || "gemini-3.8-flash",
      contents: contents
    });

    console.log("Réponse Gemini reçue");
    res.json({
      answer: response.text
    });


  } catch (error) {
    console.error("Erreur Gemini :", error);
    res.status(500).json({
      error:
        "Une erreur est survenue avec Gemini."
    });
  }
});


app.listen(PORT, () => {
  console.log(
    `Serveur lancé sur http://localhost:${PORT}`
  );

});
