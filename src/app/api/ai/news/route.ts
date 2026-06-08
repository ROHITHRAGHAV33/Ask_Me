import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Google AI API Key is not configured on the server. Please check your .env.local file." },
        { status: 500 }
      );
    }

    // Optional topic requested by the user
    const { topic } = await req.json().catch(() => ({ topic: "" }));

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`;

    const promptText = `
You are a leading health journalist, sports scientist, and biohacker.
Write a fascinating, evidence-based fitness or health news article/insight.
${topic ? `The article should focus on this topic: "${topic}"` : "The article should cover a trending topic in modern fitness science, such as zone 2 cardio, strength longevity, creatine for brain health, muscle hypertrophy biological pathways, sleep hygiene, or gut-muscle connection."}

Your article must be scientifically accurate, referencing hypothetical or real recent clinical studies, and written in a highly engaging, readable, premium journalistic style.

Format requirements:
1. "title": Catchy, professional headline.
2. "category": One of "Longevity", "Nutrition", "Training", "Recovery", "Biohacking", "Science".
3. "readTime": Estimated read time (e.g. "3 min read", "5 min read").
4. "summary": A compelling 1-sentence summary of the article.
5. "content": The full article content. Use standard formatting with 3-4 full paragraphs, explaining the physiological mechanism and practical takeaways for the reader.
6. "date": The current date formatted like "June 6, 2026".
    `;

    const geminiPayload = {
      contents: [
        {
          parts: [
            {
              text: promptText,
            },
          ],
        },
      ],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            title: { type: "STRING" },
            category: { type: "STRING" },
            readTime: { type: "STRING" },
            summary: { type: "STRING" },
            content: { type: "STRING" },
            date: { type: "STRING" }
          },
          required: ["title", "category", "readTime", "summary", "content", "date"]
        }
      }
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(geminiPayload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini 3.5 API Error details:", errorText);
      
      // Fallback: If gemini-3.5-flash fails, attempt gemini-2.5-flash
      console.log("Attempting fallback to gemini-2.5-flash...");
      const fallbackUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
      const fallbackResponse = await fetch(fallbackUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(geminiPayload),
      });

      if (!fallbackResponse.ok) {
        const fbErrorText = await fallbackResponse.text();
        return NextResponse.json(
          { error: `Gemini API failed: ${fbErrorText || errorText}` },
          { status: response.status }
        );
      }
      
      const fallbackData = await fallbackResponse.json();
      const textResult = fallbackData.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!textResult) {
        return NextResponse.json({ error: "Failed to parse content from fallback model." }, { status: 500 });
      }
      return NextResponse.json(JSON.parse(textResult));
    }

    const data = await response.json();
    const textResult = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!textResult) {
      return NextResponse.json({ error: "Failed to parse content from AI response." }, { status: 500 });
    }

    return NextResponse.json(JSON.parse(textResult));
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
