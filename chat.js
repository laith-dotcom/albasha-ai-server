import fetch from "node-fetch";

export default async function handler(req, res) {
  try {
    const { message } = JSON.parse(req.body);

    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        messages: [
          {
            role: "system",
            content: `
You are the official Albasha AI Assistant.
You speak Arabic and English.
You help customers find products, answer questions, increase sales, 
and guide them through meat shipping, international orders, and store policies.

Rules:
- Free shipping on orders over $200, EXCEPT meat.
- Meat requires express shipping.
- International orders: customer must email contact@albasha.store.
- Store location: 11321 Village Square Ln, Fishers, IN 46038.
- Phone: 317-578-0040.
- Speak naturally, friendly, helpful, professional.
`
          },
          { role: "user", content: message }
        ]
      })
    });

    const data = await openaiRes.json();
    const reply = data.choices?.[0]?.message?.content || "Error, please try again.";

    res.status(200).json({ reply });

  } catch (error) {
    console.error(error);
    res.status(500).json({ reply: "Server error." });
  }
}