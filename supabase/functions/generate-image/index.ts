import { corsHeaders, handleCors } from "../_shared/cors.ts";
import { getAdminClient, requireUser } from "../_shared/supabase.ts";

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY") ?? "";
const OPENAI_IMAGE_MODEL = Deno.env.get("OPENAI_IMAGE_MODEL") ?? "gpt-image-1";
const STORAGE_BUCKET = Deno.env.get("STORAGE_BUCKET") ?? "slide-backgrounds";

function base64ToBytes(base64: string) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

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

    const { user, error: authError } = await requireUser(req);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const prompt = body?.prompt;

    if (!prompt) {
      return new Response(JSON.stringify({ error: "Missing prompt" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const openaiResponse = await fetch("https://api.openai.com/v1/images", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: OPENAI_IMAGE_MODEL,
        prompt,
        size: "1024x1792",
        response_format: "b64_json",
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
    const imageData = openaiJson?.data?.[0]?.b64_json;
    if (!imageData) {
      return new Response(JSON.stringify({ error: "OpenAI response missing image data" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const bytes = base64ToBytes(imageData);
    const fileName = `${crypto.randomUUID()}.png`;
    const filePath = `generated/${fileName}`;

    const supabaseAdmin = getAdminClient();
    const { error: uploadError } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, bytes, {
        contentType: "image/png",
        upsert: false,
      });

    if (uploadError) {
      return new Response(JSON.stringify({ error: "Storage upload failed", details: uploadError.message }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: publicUrlData } = supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(filePath);

    return new Response(JSON.stringify({ url: publicUrlData.publicUrl }), {
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
