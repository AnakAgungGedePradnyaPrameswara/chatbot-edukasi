let userName = "";
let userEmail = "";

document.addEventListener("DOMContentLoaded", async () => {
  const response = await fetch("/intro");
  const data = await response.json();
  appendMessage(data.reply, "bot");

  // Setelah perkenalan, minta user memasukkan nama dan email
  setTimeout(requestUserInfo, 2000);
});

async function requestUserInfo() {
  userName = prompt("Masukkan nama lengkap Anda:");
  userEmail = prompt("Masukkan alamat email Anda:");

  if (!validateEmail(userEmail)) {
    alert("Alamat email tidak valid! Silakan coba lagi.");
    requestUserInfo();
    return;
  }

  appendMessage(`Terima kasih, ${userName}! Alamat emailmu valid. Berikut adalah informasimu:\n\n{{nama: ${userName}}} {{email: ${userEmail}}}\n\nSilakan ajukan pertanyaan tentang Informatika.`, "bot");

  document.getElementById("messageInput").disabled = false;
  document.getElementById("sendBtn").disabled = false;
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function sendMessage() {
  const message = document.getElementById("messageInput").value.trim();
  if (!message) return;

  appendMessage(message, "user");
  document.getElementById("messageInput").value = "";

  const response = await fetch("/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: userName, email: userEmail, message }),
  });

  const data = await response.json();
  appendMessage(data.reply, "bot");
}

function appendMessage(text, sender) {
  const chatBox = document.getElementById("chatBox");
  const messageDiv = document.createElement("div");
  messageDiv.classList.add("message", sender);
  messageDiv.textContent = text;
  chatBox.appendChild(messageDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
}
