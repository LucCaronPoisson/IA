const form = document.getElementById("chat-form");
const input = document.getElementById("message-input");
const messages = document.getElementById("messages");
const button = form.querySelector("button");
const history = [];
let context = "";

function addMessage(text, sender) {
  const message = document.createElement("div");
  message.classList.add("message", sender);
  const bubble = document.createElement("div");
  bubble.classList.add("bubble");
  bubble.textContent = text;
  message.appendChild(bubble);
  messages.appendChild(message);
  messages.scrollTop = messages.scrollHeight;
}


// Quand l'utilisateur envoie un message
form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const message = input.value.trim();
  if (message === "") {
    return;
  }
  addMessage(message, "user");
  input.value = "";
  input.disabled = true;
  button.disabled = true;
  button.textContent = "Envoi...";


  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: message,
        history: history,
        context: context
      })
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Une erreur est survenue.");
    }
    addMessage(data.answer, "ai");
    context = data.context;

    history.push({
      role: "user",
      text: message
    });

    history.push({
      role: "model",
      text: data.answer
    });
    console.log("Contexte actuel :", context);
  } catch (error) {
    addMessage(
      "Erreur : " + error.message,
      "ai"
    );
  }

  // Réactiver le formulaire
  input.disabled = false;
  button.disabled = false;
  button.textContent = "Envoyer";
  input.focus();
});