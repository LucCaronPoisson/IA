const form = document.getElementById("chat-form");
const input = document.getElementById("message-input");
const messages = document.getElementById("messages");
const button = form.querySelector("button");


// Ajouter un message dans le chat
function addMessage(text, sender) {

  const message = document.createElement("div");

  message.classList.add("message", sender);


  const bubble = document.createElement("div");

  bubble.classList.add("bubble");

  bubble.textContent = text;


  message.appendChild(bubble);

  messages.appendChild(message);


  // Descendre automatiquement en bas
  messages.scrollTop = messages.scrollHeight;
}


// Quand l'utilisateur envoie le formulaire
form.addEventListener("submit", async (event) => {

  event.preventDefault();


  const message = input.value.trim();


  // Ne rien faire si le message est vide
  if (message === "") {
    return;
  }


  // Afficher le message de l'utilisateur
  addMessage(message, "user");


  // Nettoyer l'input
  input.value = "";


  // Désactiver pendant la requête
  input.disabled = true;

  button.disabled = true;

  button.textContent = "Envoi...";


  try {

    // Envoyer le message au serveur
    const response = await fetch("/api/chat", {

      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({
        message: message
      })

    });


    const data = await response.json();


    // Vérifier si le serveur a renvoyé une erreur
    if (!response.ok) {

      throw new Error(
        data.error || "Une erreur est survenue."
      );

    }


    // Afficher la réponse de Gemini
    addMessage(data.answer, "ai");


  } catch (error) {

    // Afficher l'erreur dans le chat
    addMessage(
      "Erreur : " + error.message,
      "ai"
    );

  }


  // Réactiver l'input
  input.disabled = false;

  button.disabled = false;

  button.textContent = "Envoyer";

  input.focus();

});