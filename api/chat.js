
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const key = process.env.OPENAI_API_KEY;

  if (!key) {
    return res.status(503).json({
      error: "JARVIS AI is not configured yet."
    });
  }

  try {
    const { message, history = [] } = req.body || {};

    if (!message || typeof message !== "string") {
      return res.status(400).json({
        error: "Please enter a message."
      });
    }

    const safeHistory = Array.isArray(history)
      ? history.slice(-8).filter(x =>
          x &&
          ["user", "assistant"].includes(x.role) &&
          typeof x.content === "string"
        )
      : [];

    const response = await fetch(
      "https://api.openai.com/v1/responses",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${key}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "gpt-4.1-mini",
          instructions:
            "You are JARVIS, a helpful personal AI assistant. Give clear and useful answers.",
          input: [
            ...safeHistory,
            { role: "user", content: message.trim() }
          ]
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: "AI service error. Please try again."
      });
    }

    const answer = (data.output || [])
      .flatMap(item => item.content || [])
      .filter(item => item.type === "output_text")
      .map(item => item.text)
      .join("\n");

    return res.status(200).json({
      reply: answer || "Please try again."
    });

  } catch (error) {
    return res.status(500).json({
      error: "Connection problem."
    });
  }
}
