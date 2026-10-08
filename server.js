import express from "express";
import "dotenv/config";
import { GoogleGenAI } from "@google/genai";
const app = express();
const PORT = process.env.PORT || 3000;
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});
const MODEL = process.env.GEMINI_MODEL;
app.use(express.json());
app.use(express.static("public"));


app.post("/api/chat", async (req, res) => {
  try {
    const message = req.body.message;
    const history = req.body.history || [];
    const context = req.body.context || "";
    if (!message || !message.trim()) {
      return res.status(400).json({
        error: "Le message est vide."
      });
    }
    if (!MODEL) {
      return res.status(500).json({
        error: "Le modèle Gemini n'est pas configuré dans le fichier .env."
      });
    }

    const prompt = `
Tu es un assistant conversationnel.
Voici le contexte de la conversation :
${context || "Aucun contexte pour le moment."}
Question actuelle de l'utilisateur :
${message}
Réponds à la question en tenant compte du contexte
lorsqu'il est utile.
`;

//préparation pour la 3eme étape

    const response = await ai.models.generateContent({
      model: MODEL,
      contents: prompt
    });
    const answer = response.text;
    let conversation = "";
    for (const item of history) {
      const speaker =
        item.role === "user" ? "Utilisateur" : "Gemini";
      conversation += `${speaker} : ${item.text}\n`;
    }
    conversation += `Utilisateur : ${message}\n`;
    conversation += `Gemini : ${answer}\n`;

    const contextPrompt = `
Tu dois mettre à jour le contexte d'une conversation.
Ancien contexte :
${context || "Aucun contexte pour le moment."}
Échanges récents :
${conversation}
Crée un contexte court et utile pour les prochaines questions.
Conserve les informations importantes, les objectifs,
les préférences et les éléments utiles pour la suite.
Ne conserve pas chaque message mot pour mot.
Ne crée aucune information qui n'a pas été donnée.
Si une information est incertaine, ne la présente pas comme un fait.
Réponds uniquement avec le nouveau contexte, sans introduction.
`;
    const contextResponse = await ai.models.generateContent({
      model: MODEL,
      contents: contextPrompt
    });
    const newContext = contextResponse.text;

    res.json({
      answer: answer,
      context: newContext
    });
  } catch (error) {
    console.error("Erreur Gemini :", error);
    res.status(500).json({
      error: "Une erreur est survenue avec Gemini."
    });
  }
});

app.listen(PORT, () => {
  console.log(`Serveur lancé sur http://localhost:${PORT}`);
});