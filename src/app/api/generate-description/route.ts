import { NextResponse } from 'next/server';

const fallbackKeys = [
  'AIzaSyAbsX7P71HK6E-CTXrCR29H4983XTDjEG8',
  'AIzaSyALbvGtn5OfxkCUzD94ArcfOIDOWW9Fgoc',
  'AIzaSyC1X2oDaC1gtk7ApLlURkL2sSG-V2b9cWo'
];

let currentKeyIndex = 0;

// Simple in-memory rate limiting map
// Maps IP to last request timestamp
const rateLimitMap = new Map<string, number>();
const RATE_LIMIT_MS = 5000; // 5 seconds between requests

export async function POST(req: Request) {
  try {
    // 1. Basic IP-based Rate Limiting
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const now = Date.now();
    const lastRequest = rateLimitMap.get(ip);
    if (lastRequest && (now - lastRequest < RATE_LIMIT_MS)) {
      return NextResponse.json({ error: 'Please wait a few seconds before generating another description.' }, { status: 429 });
    }
    rateLimitMap.set(ip, now);

    const { title, imageBase64 } = await req.json();

    let contents: any[] = [];
    let textPrompt = `You are an expert Indian chef, food writer, and nutritionist.

Write a short, natural-sounding menu description for a food item named "${title}".

Guidelines:
* Make the description appetizing and customer-friendly, like a premium food delivery app.
Highlight key ingredients, flavors, texture, and preparation style if relevant.
Mention nutritional benefits naturally (protein, fiber, vitamins, healthy fats, etc.) without sounding medical.
Include whether it is best suited for breakfast, lunch, dinner, snacks, post-workout meals, or a healthy everyday meal.
Use simple Indian English that customers can easily understand.
Keep the description between 25-50 words.
Do not use bullet points.
Do not start with "A delicious..." or similar generic phrases.
Make each description unique and specific to the dish name.
If the dish is a traditional Indian item, reflect its authentic taste and cultural appeal.
Return only the description text.`;

    if (imageBase64) {
      const matches = imageBase64.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        contents.push({
          role: "user",
          parts: [
            { text: textPrompt },
            { inline_data: { mime_type: matches[1], data: matches[2] } }
          ]
        });
      } else {
        contents.push({ role: "user", parts: [{ text: textPrompt }] });
      }
    } else {
      contents.push({ role: "user", parts: [{ text: textPrompt }] });
    }

    // --- Robust API Calling with Retries and Key Rotation ---
    let lastError = null;
    // Try all keys in the fallback array
    for (let i = 0; i < fallbackKeys.length; i++) {
      const apiKey = fallbackKeys[currentKeyIndex];
      // Increment index for next time
      currentKeyIndex = (currentKeyIndex + 1) % fallbackKeys.length;

      try {
        console.log(`📡 Attempting Gemini API call with key index ${currentKeyIndex}...`);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
          if (generatedText) {
            return NextResponse.json({ description: generatedText.trim() });
          }
        } else {
          const errorText = await response.text();
          console.error(`❌ Gemini API Error (Key ${currentKeyIndex}):`, errorText);
          lastError = `API Error: ${response.status}`;
        }
      } catch (err: any) {
        console.error(`⚠️ Connection attempt failed (Key ${currentKeyIndex}):`, err.message);
        lastError = err.message;
        // Continue to next key if it's a network/timeout error
      }
    }

    return NextResponse.json({ error: `Failed after trying multiple keys. Last error: ${lastError}` }, { status: 500 });

  } catch (error: any) {
    console.error('🔥 Fatal error in generate API route:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
