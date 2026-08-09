import { json } from "@backend/lib/ncc-db";

const SYSTEM_PROMPT = `You are "Subedar Major AI Assistant" for the 19 Jharkhand Battalion NCC (19 JHR BN NCC), Ranchi, under Bihar and Jharkhand Directorate, serving the Sarala Birla University (SBU) Ranchi NCC Company.
Your job is to assist prospective cadets, current enrolled cadets, and parents with accurate NCC information, deep career guidance, drill commands, physical fitness preparation, and C-Certificate SSB entry strategy.
Key facts:
- Unit: 19 Jharkhand Battalion NCC, Ranchi
- Directorate: Bihar and Jharkhand Directorate (Patna / Ranchi HQ)
- Institution: Sarala Birla University (SBU), Mahilong, Purulia Road, Ranchi, Jharkhand
- Company Officer: Associate NCC Officer (ANO) SBU Coy
- Motto: "Unity and Discipline" (Ekta aur Anushasan)
- Divisions: Senior Division (SD - Male) & Senior Wing (SW - Female)
- Course Duration: 3 Years for B & C Certificates (2 Years for B, 3rd year for C Certificate)
- Benefits: Direct SSB interview entries for defence forces (IMA, OTA, AFA, Naval Academy)
- Physical Criteria: SD height min ~170 cm, SW height min ~152 cm. 1600m run, pushups, sit-ups, medical fitness
- Camps: ATC, CATC, RDC, TSC, EBSB, AAC, Trekking & Mountaineering

Provide respectful, motivating, patriotic, clear, structured, and deeply analytical answers. Always uphold high military discipline.`;

const FALLBACK =
  "Jai Hind! The AI Cadre Assistant is temporarily off the net. For enrollment, physical standards, camps or certificate queries, please use the enrollment form, the notices board, or contact the ANO office at Sarala Birla University, Ranchi.";

export async function handleAiChatRequest(request: Request) {
  const {
    message,
    lowLatency,
    thinkingMode = true,
  } = (await request.json().catch(() => ({}))) as Record<string, unknown>;

  if (!message) {
    return json({ success: false, error: "Message prompt is required." }, 400);
  }

  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) {
    return json({ success: true, data: { reply: FALLBACK } });
  }

  const model = thinkingMode
    ? "google/gemini-3.1-pro-preview"
    : lowLatency
      ? "google/gemini-3.1-flash-lite"
      : "google/gemini-3.6-flash";

  try {
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: String(message) },
        ],
      }),
    });

    if (!response.ok) {
      console.error("AI gateway error", response.status, await response.text());
      return json({ success: true, data: { reply: FALLBACK } });
    }

    const payload = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const reply = payload?.choices?.[0]?.message?.content || FALLBACK;
    return json({ success: true, data: { reply } });
  } catch (err) {
    console.error("AI chat failure", err);
    return json({ success: false, error: "AI Assistant unavailable right now. Jai Hind!" }, 500);
  }
}
