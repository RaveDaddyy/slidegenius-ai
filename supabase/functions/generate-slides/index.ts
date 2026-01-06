import { corsHeaders, handleCors } from "../_shared/cors.ts";
import { requireUser } from "../_shared/supabase.ts";

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY") ?? "";
const OPENAI_MODEL = Deno.env.get("OPENAI_TEXT_MODEL") ?? "gpt-4.1";

Deno.serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405, headers: corsHeaders });
  }

  try {
    if (!OPENAI_API_KEY) {
      return new Response(JSON.stringify({ error: "Missing OPENAI_API_KEY" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const authHeader = req.headers.get("Authorization") ?? "";
    const authMeta = {
      present: Boolean(authHeader),
      bearer: authHeader.startsWith("Bearer "),
      length: authHeader.length,
      segments: authHeader.startsWith("Bearer ") ? authHeader.slice(7).split(".").length : 0,
    };

    const { user, error: authError } = await requireUser(req);
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized", details: authError?.message ?? "Unknown", auth: authMeta }),
        {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const body = await req.json().catch(() => ({}));
    const prompt = body?.prompt;
    const responseJsonSchema = body?.response_json_schema;

    if (!prompt || !responseJsonSchema) {
      return new Response(JSON.stringify({ error: "Missing prompt or response_json_schema" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const openaiResponse = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        input: prompt,
        text: {
          format: {
            type: "json_schema",
            name: "slides_schema",
            schema: responseJsonSchema,
          },
        },
      }),
    });

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      return new Response(JSON.stringify({ error: "OpenAI request failed", details: errorText }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const openaiJson = await openaiResponse.json();
    const outputText =
      openaiJson.output_text ??
      openaiJson.output?.[0]?.content?.[0]?.text ??
      openaiJson.output?.[0]?.content?.[0]?.text?.value ??
      null;
    if (!outputText) {
      return new Response(JSON.stringify({ error: "OpenAI response missing output_text" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let parsed;
    try {
      parsed = JSON.parse(outputText);
    } catch (parseError) {
      return new Response(JSON.stringify({ error: "Failed to parse OpenAI JSON", raw: outputText }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(parsed), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Unexpected error", details: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
