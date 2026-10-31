
const form = document.getElementById("chatForm");
const input = document.getElementById("messageInput");
const messages = document.getElementById("messages");
const micBtn = document.getElementById("micBtn");

let history = [];

function addMessage(text, type) {
  const p = document.createElement("p");
  p.className = type;
  p.textContent = text;
  messages.appendChild(p);
  messages.scrollTop = messages.scrollHeight;
}

async function sendMessage(message) {
  message = message.trim();
  if (!message) return;

  addMessage(message, "user");
  input.value = "";

  const local = message.toLowerCase();

  if (local.includes("what time")) {
    addMessage("The time is " + new Date().toLocaleTimeString(), "assistant");
    return;
  }

  if (local.includes("today's date")) {
    addMessage(new Date().toDateString(), "assistant");
    return;
  }

  const loading = document.createElement("p");
  loading.className = "assistant";
  loading.textContent = "JARVIS is thinking...";
  messages.appendChild(loading);

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        history
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "AI connection failed");
    }

    loading.textContent = data.reply;

    history.push(
      { role: "user", content: message },
      { role: "assistant", content: data.reply }
    );

    history = history.slice(-12);

    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(data.reply);
      utterance.rate = 1;
      speechSynthesis.speak(utterance);
    }

  } catch (error) {
    loading.textContent = "JARVIS: " + error.message;
  }
}

form.addEventListener("submit", function(event) {
  event.preventDefault();
  sendMessage(input.value);
});

const SpeechRecognition =
  window.SpeechRecognition ||
  window.webkitSpeechRecognition;

if (SpeechRecognition) {
  const recognition = new SpeechRecognition();
  recognition.lang = "en-IN";

  micBtn.addEventListener("click", function() {
    recognition.start();
  });

  recognition.onresult = function(event) {
    input.value = event.results[0][0].transcript;
    form.requestSubmit();
  };
} else {
  micBtn.addEventListener("click", function() {
    
    addMessage("Voice input is not supported in this browser.", "assistant");
  });
}
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  });
}
