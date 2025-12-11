(() => {
  // --- CONFIG ---
  const SERVER_URL = "https://albasha-ai-server.vercel.app"; // Vercel app
  const PRIMARY = "#A4472E"; // Albasha Red
  const ICON = "💬";

  // --- CACHED CHAT ID (per browser) ---
  let CHAT_ID = null;
  try {
    CHAT_ID = localStorage.getItem("albasha_chat_id") || null;
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
      font-weight: bold;
      text-align: center;
    }

    #albasha-chat-messages {
      flex: 1;
      padding: 12px;
      overflow-y: auto;
      font-size: 15px;
      display: flex;
      flex-direction: column;
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
      font-weight: 600;
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

  const inputEl = chat.querySelector("#albasha-chat-text");
  const sendBtn = chat.querySelector("#albasha-send");
  const messagesBox = chat.querySelector("#albasha-chat-messages");

  // --- OPEN/CLOSE ---
  btn.onclick = () => {
    chat.style.display = chat.style.display === "flex" ? "none" : "flex";
  };

  // --- DISPLAY MESSAGE ---
  function addMessage(sender, text) {
    const bubble = document.createElement("div");
    bubble.style.margin = "8px 0";
    bubble.style.padding = "10px 14px";
    bubble.style.borderRadius = "10px";
    bubble.style.maxWidth = "80%";
    bubble.style.whiteSpace = "pre-wrap";

    if (sender === "user") {
      bubble.style.background = "#eee";
      bubble.style.alignSelf = "flex-end";
    } else {
      bubble.style.background = PRIMARY;
      bubble.style.color = "#fff";
      bubble.style.alignSelf = "flex-start";
    }

    bubble.innerText = text;
    messagesBox.appendChild(bubble);
    messagesBox.scrollTop = messagesBox.scrollHeight;
  }

  // --- SEND HANDLER ---
  async function sendMessage() {
    const text = inputEl.value;
    if (!text || !text.trim()) return;

    addMessage("user", text);
    inputEl.value = "";

    try {
      const payload = { message: text };
      if (CHAT_ID) payload.chatId = CHAT_ID;

      const res = await fetch(`${SERVER_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        console.error("chat api status:", res.status);
        addMessage("ai", "Sorry, I couldn't reach the server.");
        return;
      }

      const data = await res.json().catch(() => ({}));

      if (data.chatId) {
        CHAT_ID = data.chatId;
        try {
          localStorage.setItem("albasha_chat_id", CHAT_ID);
        } catch (e) {}
      }

      const replyText =
        data.reply || "Sorry, I couldn't understand that. Please try again.";
      addMessage("ai", replyText);
    } catch (err) {
      console.error("chat api error:", err);
      addMessage("ai", "Sorry, I couldn't reach the server.");
    }
  }

  // --- EVENT LISTENERS ---
  sendBtn.addEventListener("click", sendMessage);
  inputEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter") sendMessage();
  });
})();
