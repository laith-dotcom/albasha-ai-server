// Simple proxy: Albasha widget -> Vercel -> n8n webhook

export default async function handler(req, res) {
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
    const n8nResponse = await fetch(
      "https://n8n.srv1182142.hstgr.cloud/webhook-test/Albasha-Chat",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, chatId }),
      }
    );

    const data = await n8nResponse.json().catch(() => ({}));

    // Pass through status + JSON
    res.status(n8nResponse.status).json(data);
  } catch (err) {
    console.error("chat api error:", err);
    res.status(500).json({
      reply: "Sorry, there was an internal server error.",
      error: String(err),
    });
  }
}
