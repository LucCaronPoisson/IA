const button = document.getElementById("actionButton");
const message = document.getElementById("message");

button.addEventListener("click", function () {
    message.textContent = "Le JavaScript fonctionne !";
});