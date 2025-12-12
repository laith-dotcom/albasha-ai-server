(() => {
  // --- CONFIG ---
  const SERVER_URL = "https://n8n.srv1182142.hstgr.cloud/webhook/Albasha-Chat";
  const PRIMARY = "#A4472E"; // Albasha Red
  const ICON = "💬"; // Replace later with your vector icon

  // --- CHAT ID (per browser) ---
  let CHAT_ID = localStorage.getItem("albasha_chat_id") || null;

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
      gap: 6px;
    }

    .albasha-bubble {
      padding: 10px 14px;
      border-radius: 12px;
      max-width: 80%;
      white-space: pre-wrap;
      font-size: 14px;
    }

    .albasha-bubble.user {
      background: #eee;
      align-self: flex-end;
    }

    .albasha-bubble.ai {
      background: ${PRIMARY};
      color: #fff;
      align-self: flex-start;
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
    }

    .albasha-typing {
      font-size: 12px;
      color: #666;
      margin: 4px 2px;
      align-self: flex-start;
      font-style: italic;
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

  const messagesEl = document.getElementById("albasha-chat-messages");
  const inputEl = document.getElementById("albasha-chat-text");
  const sendBtn = document.getElementById("albasha-send");

  // --- OPEN/CLOSE ---
  btn.onclick = () => {
    const isOpen = chat.style.display === "flex";
    chat.style.display = isOpen ? "none" : "flex";

    // First time open: small greeting
    if (!isOpen && messagesEl.childElementCount === 0) {
      addMessage(
        "ai",
        "Salam! I’m Albasha Assistant. Ask me about any product, price, ingredient, or availability in our store. 😊"
      );
    }
  };

  // --- SEND MESSAGE HANDLER ---
  async function sendMessage() {
    const text = inputEl.value;
    if (!text.trim()) return;

    addMessage("user", text);
    inputEl.value = "";

    // Show typing indicator
    const typingEl = document.createElement("div");
    typingEl.className = "albasha-typing";
    typingEl.innerText = "Assistant is typing...";
    messagesEl.appendChild(typingEl);
    messagesEl.scrollTop = messagesEl.scrollHeight;

    try {
      // Build payload with optional chatId
      const payload = { message: text };
      if (CHAT_ID) payload.chatId = CHAT_ID;

      const res = await fetch(SERVER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        console.error("n8n error status:", res.status);
        messagesEl.removeChild(typingEl);
        addMessage("ai", "Sorry, I couldn't reach the server.");
        return;
      }

      const data = await res.json();
      console.log("Albasha widget response:", data);

      // If backend sends back a new chatId, store it
      if (data.chatId && !CHAT_ID) {
        CHAT_ID = data.chatId;
        localStorage.setItem("albasha_chat_id", CHAT_ID);
      }

      // *** IMPORTANT: support both { reply } and { output } formats ***
      const replyText =
        data.reply ||
        data.output ||      // AI Agent output field
        data.result ||
        data.message ||
        "Sorry, I couldn't understand that.";

      messagesEl.removeChild(typingEl);
      addMessage("ai", replyText);
    } catch (err) {
      console.error("Fetch error:", err);
      if (typingEl.parentNode) messagesEl.removeChild(typingEl);
      addMessage("ai", "Sorry, I couldn't reach the server.");
    }
  }

  sendBtn.onclick = sendMessage;
  inputEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter") sendMessage();
  });

  // --- DISPLAY MESSAGES ---
  function addMessage(sender, text) {
    const bubble = document.createElement("div");
    bubble.classList.add("albasha-bubble", sender === "user" ? "user" : "ai");
    bubble.innerText = text;
    messagesEl.appendChild(bubble);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }
})();
