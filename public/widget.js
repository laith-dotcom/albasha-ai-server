// api/chat.js
// Proxy from the Albasha widget -> Vercel -> n8n webhook

const N8N_WEBHOOK_URL =
  "https://n8n.srv1182142.hstgr.cloud/webhook/Albasha-Chat";

// Small helper to add CORS headers
function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "https://albasha.store");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

export default async function handler(req, res) {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    setCors(res);
    res.status(200).end();
    return;
  }

  setCors(res);

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const { message, chatId } = req.body || {};

    if (!message || typeof message !== "string") {
      res.status(400).json({ error: "Missing message" });
      return;
    }

    // Forward to n8n
    const n8nResponse = await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, chatId }),
    });

    const data = await n8nResponse.json().catch(() => ({}));

    // If n8n doesn’t send a reply field, give a fallback
    const replyText =
      data.reply || "Sorry, I couldn't understand that, try again.";

    res.status(n8nResponse.status).json({
      ...data,
      reply: replyText,
    });
  } catch (err) {
    console.error("chat api error:", err);
    res.status(500).json({
      reply: "Sorry, there was an internal server error.",
      error: String(err),
    });
  }
}
