// Supabase Edge Function: generate-trip
// Moves the Gemini API call server-side to protect the API key
//
// Deploy with:
//   supabase functions deploy generate-trip
//   supabase secrets set GEMINI_API_KEY=your-key-here
//
// Call from frontend:
//   const { data, error } = await supabase.functions.invoke('generate-trip', {
//     body: { destination, days, budget, style }
//   });

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("GEMINI_API_KEY");
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY not configured");
    }

    const { destination, days, budget, style } = await req.json();

    if (!destination || !days || !budget || !style) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: destination, days, budget, style" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const prompt = `You are a travel expert. Return ONLY valid JSON with no markdown fences. Plan a ${days}-day trip to ${destination}. Budget: ₹${budget}. Travel style: ${style}. Return this exact JSON structure: {"days":[{"dayNumber":1,"theme":"Day theme string","summary":"Summary string","activities":[{"title":"Activity name","timeSlot":"09:00 AM","category":"food","cost":500,"location":"Exact place name","notes":"Helpful tip"}]}]}`;

    // Call Gemini API via REST
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const geminiResponse = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.4,
          responseMimeType: "application/json",
        },
      }),
    });

    if (!geminiResponse.ok) {
      const errText = await geminiResponse.text();
      throw new Error(`Gemini API error: ${geminiResponse.status} ${errText}`);
    }

    const geminiData = await geminiResponse.json();
    const text = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      throw new Error("Empty response from Gemini API");
    }

    // Validate JSON
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      return new Response(
        JSON.stringify({ error: "AI returned invalid JSON. Please retry." }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify(parsed),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: (error as Error).message || "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
