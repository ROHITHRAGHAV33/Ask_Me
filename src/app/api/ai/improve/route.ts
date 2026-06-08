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

    const { draftQuestion, draftOptions, category, style, isPoll } = await req.json();

    if (!draftQuestion?.trim()) {
      return NextResponse.json({ error: "Draft question content is required." }, { status: 400 });
    }

    // We will query Gemini 3.5 Flash as it is supported for this key
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`;

    const promptText = `
You are an expert fitness instructor, sports nutritionist, and exercise scientist.
Improve the following draft ${isPoll ? "poll" : "quiz question"}:
Draft: "${draftQuestion}"
${draftOptions && draftOptions.length > 0 ? `Proposed Options: ${JSON.stringify(draftOptions)}` : ""}
Target Category: "${category || "Fitness"}"

Tone / Style guidelines:
- "standard": clear, professional, educational.
- "expert": challenging, deep exercise science terminology (e.g. sarcoplasmic hypertrophy, VO2 max, ATP-PC system, myofibrillar).
- "funny": witty, engaging, lighthearted, with a bit of gym humor or relatable struggles.
- "scientific": heavy focus on clinical evidence, meta-analyses, and physiological pathways.
Target Style: "${style || "standard"}"

Instructions:
1. Rewrite the question body to be polished, engaging, and scientifically accurate.
2. Provide exactly 4 clear, plausible options.
3. If it is a quiz question (isPoll is false), identify the single correct option index (0-3).
4. If it is a poll (isPoll is true), you MUST set "correct_option" to -1.
5. Provide a detailed, educational, and scientifically sound explanation (1-3 sentences) explaining the science behind the correct choice (or, for a poll, summarizing the scientific consensus/insight on the topic).
6. Set the final category appropriate for the question (e.g. "Strength", "Nutrition", "Cardio", "Recovery", "Health").
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
            body: { type: "STRING", description: "The improved question or poll body" },
            options: {
              type: "ARRAY",
              items: { type: "STRING" },
              description: "Exactly 4 options"
            },
            correct_option: { 
              type: "INTEGER", 
              description: "The index of the correct option (0-3) for a quiz question, or exactly -1 if it is a poll" 
            },
            explanation: { 
              type: "STRING", 
              description: "Educational explanation or background context" 
            },
            category: { 
              type: "STRING", 
              description: "The category tag for the question" 
            }
          },
          required: ["body", "options", "correct_option", "explanation", "category"]
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
