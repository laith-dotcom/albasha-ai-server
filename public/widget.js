(() => {
  // --- CONFIG ---
  const SERVER_URL = "https://albasha-ai-server.vercel.app"; // your Vercel app
  const PRIMARY = "#A4472E"; // Albasha Red
  const ICON = "💬"; // Replace later with your vector icon

  // Persist a chat ID per browser session
  let CHAT_ID = null;
  try {
    CHAT_ID = window.localStorage.getItem("albasha_chat_id") || null;
  } catch (e) {
    CHAT_ID = null;
  }

  // --- STYLES ---
  const style = document.createElement("style");
  style.innerHTML = `
    #albasha-chat-btn {
      position: fixed;
      bottom: 24px;
      right: 24px;
      background: ${PRIMARY};
      color: white;
      width: 70px;
      height: 70px;
      border-radius: 50%;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 30px;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      z-index: 999999;
    }

    #albasha-chat-window {
      position: fixed;
      bottom: 110px;
      right: 24px;
      width: 350px;
      height: 500px;
      background: #fff;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.15);
      display: none;
      flex-direction: column;
      overflow: hidden;
      z-index: 999999;
      border: 2px solid ${PRIMARY};
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }

    #albasha-chat-header {
      background: ${PRIMARY};
      padding: 14px;
      color: #fff;
      font-weight: 600;
      text-align: center;
      font-size: 16px;
    }

    #albasha-chat-messages {
      flex: 1;
      padding: 12px;
      overflow-y: auto;
      font-size: 15px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    #albasha-chat-input {
      display: flex;
      border-top: 1px solid #ddd;
    }

    #albasha-chat-input input {
      flex: 1;
      padding: 12px;
      border: none;
      outline: none;
      font-size: 15px;
    }

    #albasha-chat-input button {
      background: ${PRIMARY};
      color: #fff;
      border: none;
      padding: 0 18px;
      cursor: pointer;
      font-size: 15px;
      font-weight: 500;
    }
  `;
  document.head.appendChild(style);

  // --- BUTTON ---
  const btn = document.createElement("div");
  btn.id = "albasha-chat-btn";
  btn.innerHTML = ICON;
  document.body.appendChild(btn);

  // --- CHAT WINDOW ---
  const chat = document.createElement("div");
  chat.id = "albasha-chat-window";
  chat.innerHTML = `
    <div id="albasha-chat-header">Albasha Assistant</div>
    <div id="albasha-chat-messages"></div>
    <div id="albasha-chat-input">
      <input type="text" id="albasha-chat-text" placeholder="Type here...">
      <button id="albasha-send">Send</button>
    </div>
  `;
  document.body.appendChild(chat);

  const inputEl = document.getElementById("albasha-chat-text");
  const sendBtn = document.getElementById("albasha-send");
  const messagesEl = document.getElementById("albasha-chat-messages");

  // --- OPEN/CLOSE ---
  btn.onclick = () => {
    chat.style.display = chat.style.display === "flex" ? "none" : "flex";
  };

  // Enter to send
  inputEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter") sendMessage();
  });
  // Button to send
  sendBtn.onclick = sendMessage;

  // --- SEND MESSAGE ---
  async function sendMessage() {
    const text = inputEl.value;
    if (!text.trim()) return;

    addMessage("user", text);
    inputEl.value = "";

    const payload = { message: text };
    if (CHAT_ID) payload.chatId = CHAT_ID;

    try {
      const res = await fetch(`${SERVER_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        console.error("Backend error status", res.status);
        addMessage("ai", "Sorry, there was a problem talking to the assistant.");
        return;
      }

      const data = await res.json();

      // If backend sends back a chatId, store it
      if (data.chatId && !CHAT_ID) {
        CHAT_ID = data.chatId;
        try {
          window.localStorage.setItem("albasha_chat_id", CHAT_ID);
        } catch (e) {
          // ignore if localStorage is blocked
        }
      }

      const replyText = data.reply || "Sorry, I couldn't understand that.";
      addMessage("ai", replyText);
    } catch (err) {
      console.error("Fetch error", err);
      addMessage("ai", "Sorry, I couldn't reach the server.");
    }
  }

  // --- DISPLAY MESSAGES ---
  function addMessage(sender, text) {
    const bubble = document.createElement("div");
    bubble.style.padding = "10px 14px";
    bubble.style.borderRadius = "10px";
    bubble.style.maxWidth = "80%";
    bubble.style.whiteSpace = "pre-wrap";

    if (sender === "user") {
      bubble.style.alignSelf = "flex-end";
      bubble.style.background = "#eee";
      bubble.style.color = "#222";
    } else {
      bubble.style.alignSelf = "flex-start";
      bubble.style.background = PRIMARY;
      bubble.style.color = "#fff";
    }

    bubble.innerText = text;
    messagesEl.appendChild(bubble);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }
})();
