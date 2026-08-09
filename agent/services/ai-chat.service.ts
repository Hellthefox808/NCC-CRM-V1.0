import { json } from "@backend/lib/ncc-db";

const SYSTEM_PROMPT = `You are "Subedar Major AI Assistant" for 19 Jharkhand Battalion NCC (19 JHR BN NCC), Ranchi, under Bihar and Jharkhand Directorate, serving the Sarala Birla University (SBU) Ranchi NCC Company.
Your mission is to provide accurate, authoritative, highly structured, encouraging, and patriotic guidance to prospective cadets, enrolled cadets, ANOs, and parents.

KEY OFFICIAL INFORMATION:
- Unit: 19 Jharkhand Battalion NCC, Ranchi
- Directorate: Bihar and Jharkhand Directorate (Patna / Ranchi HQ)
- Institution: Sarala Birla University (SBU), Mahilong, Purulia Road, Ranchi, Jharkhand (834010)
- Company Officer: Associate NCC Officer (ANO) Capt. Dr. Animesh Roy, SBU Coy
- Motto: "Unity and Discipline" (Ekta aur Anushasan)
- Wings: Senior Division (SD - Male Cadets) & Senior Wing (SW - Female Cadets)
- Duration: 3-Year Training Course for 'B' & 'C' Certificates

ENROLLMENT & PHYSICAL ELIGIBILITY:
- SD (Male): Min Height ~170 cm (relaxations per govt rules), 1.6 km Run (Target < 6 min 30 sec for top ranking), Push-ups (20+), Sit-ups (30+), Chin-ups.
- SW (Female): Min Height ~152 cm, 1.6 km Run / 800m Run, Physical Fitness & Flexibility.
- Selection Process: Online Application → Document Verification → Physical Efficiency Test (PET) → Written Test (Defense & General Knowledge) → Medical Inspection → Final Merit List.

CERTIFICATES & SSB BENEFITS:
- 'B' Certificate: Awarded after 2 years of training + 1 Mandatory Camp (ATC/CATC).
- 'C' Certificate: Awarded after 3 years of training + 'B' Cert + 2 Camps (including RDC, TSC, EBSB, or AAC).
- Direct SSB Benefit (NCC Special Entry Scheme): Cadets with 'C' Certificate (Grade 'A' or 'B') get DIRECT 5-day SSB interview calls for Indian Army (IMA/OTA), Indian Navy, and Indian Air Force WITHOUT appearing for CDSE written exams.
- Bonus Marks: Extra marks in State Police, CAPF (BSF, CISF, CRPF, ITBP, SSB) recruitment examinations.

SQUAD DRILL WORDS OF COMMAND:
- Savadhan (Attention) | Vishram (Stand at Ease) | Aaram Se (Relax)
- Dahine Mud (Right Turn - 90°) | Bayen Mud (Left Turn - 90°) | Peeche Mud (About Turn - 180°)
- Tez Chal (Quick March - 120 paces/min) | Kadam Taal (Mark Time) | Thamb (Halt)

Instructions:
1. Always maintain high military courtesy, starting responses with "Jai Hind!" or regimental greetings.
2. Structure answers with clean bullet points and clear headings.
3. Be precise, motivating, patriotic, and authoritative.`;

// In-Memory Query Response Cache (1-hour TTL) for high-frequency queries
interface CacheEntry {
  reply: string;
  timestamp: number;
}
const queryCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 60 * 60 * 1000;

// Domain-Specific Smart Fallback Engine for offline or fallback operation
function getSmartFallback(prompt: string): string {
  const lower = prompt.toLowerCase();

  if (
    lower.includes("physical") ||
    lower.includes("height") ||
    lower.includes("run") ||
    lower.includes("criteria")
  ) {
    return `Jai Hind! Here are the 19 JHR BN NCC Physical Efficiency Test (PET) criteria for SBU Ranchi:

• **Senior Division (SD - Male Cadets)**:
  - Minimum Height: ~170 cm
  - 1.6 km Run: Target under 6 mins 30 secs for top merit ranking
  - Physical Tests: 20+ Push-ups, 30+ Sit-ups, Chin-ups

• **Senior Wing (SW - Female Cadets)**:
  - Minimum Height: ~152 cm
  - 1.6 km / 800m Run & Flexibility Tests

• **Selection Rounds**: Document Verification → Physical Run & Fitness → Written Test → Medical Inspection.`;
  }

  if (
    lower.includes("ssb") ||
    lower.includes("c cert") ||
    lower.includes("certificate") ||
    lower.includes("benefit")
  ) {
    return `Jai Hind! Here is how the NCC 'C' Certificate helps in Direct SSB Interviews:

• **NCC Special Entry Scheme**: Cadets holding 'C' Certificate with Grade 'A' or 'B' can apply directly for Indian Armed Forces SSB Interviews (IMA/OTA Entry) WITHOUT clearing CDSE written examinations.
• **Bonus Weightage**:
  - Direct 5-day SSB interview call for Army (OTA Chennai & IMA Dehradun).
  - Special reservation in Indian Navy & Indian Air Force.
  - Bonus marks in CAPF (BSF, BSF, CISF, CRPF) and State Police examinations.`;
  }

  if (
    lower.includes("drill") ||
    lower.includes("command") ||
    lower.includes("march") ||
    lower.includes("savadhan")
  ) {
    return `Jai Hind! Key Squad Drill Words of Command (Foot Drill):

1. **Savadhan** (Attention): Heels together at 30° angle, chest up, arms still.
2. **Vishram** (Stand at Ease): Left foot moves 12 inches to the left, hands behind back.
3. **Dahine Mud** (Right Turn): Pivot 90° right on right heel & left toe.
4. **Bayen Mud** (Left Turn): Pivot 90° left on left heel & right toe.
5. **Peeche Mud** (About Turn): Turn 180° via the right side.
6. **Tez Chal** (Quick March): 120 paces per minute, left arm swings with right foot.`;
  }

  if (
    lower.includes("document") ||
    lower.includes("verification") ||
    lower.includes("form") ||
    lower.includes("aadhaar")
  ) {
    return `Jai Hind! Documents required for 19 JHR BN NCC Enrollment Physical Verification:

1. Student Identity Card / Admission Slip (Sarala Birla University).
2. Aadhaar Card (Original + Self-Attested Photocopy).
3. Class 10th & 12th Marksheet & Passing Certificates.
4. Bank Passbook / Cancelled Cheque (for stipend credit).
5. Medical Fitness Certificate from a Registered Medical Practitioner.
6. 4 Passport-size photographs in formal attire.`;
  }

  return `Jai Hind! I am Subedar Major AI Assistant for 19 Jharkhand Battalion NCC (SBU Ranchi).

For enrollment applications, physical fitness benchmarks, camp details, or certificate exams, please fill out the Online Enrollment Portal or contact the Associate NCC Officer (ANO) Capt. Dr. Animesh Roy at SBU Campus, Mahilong, Ranchi.`;
}

export async function handleAiChatRequest(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const message = typeof body.message === "string" ? body.message.trim() : "";
  const history = Array.isArray(body.history)
    ? (body.history as Array<{ role: "user" | "assistant"; content: string }>)
    : [];
  const lowLatency = Boolean(body.lowLatency);
  const thinkingMode = body.thinkingMode !== false;

  if (!message) {
    return json({ success: false, error: "Message prompt is required." }, 400);
  }

  // Rate Limiting Protection (Max 15 requests per minute per IP)
  const clientIp = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const { checkRateLimit } = await import("@backend/lib/rate-limiter.server");
  const rateCheck = checkRateLimit(`ai_chat:${clientIp}`, { maxAttempts: 15, windowMs: 60000 });
  if (!rateCheck.allowed) {
    return json(
      {
        success: false,
        error: `Rate limit exceeded. Please wait ${Math.ceil(rateCheck.retryAfterMs / 1000)} seconds before asking again.`,
      },
      429,
    );
  }

  // Check In-Memory Query Cache for instant <10ms response
  const cacheKey = message.toLowerCase().replace(/[^a-z0-9]/g, "");
  const cached = queryCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return json({
      success: true,
      data: { reply: cached.reply },
      meta: { cached: true },
    });
  }

  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) {
    const fallbackReply = getSmartFallback(message);
    queryCache.set(cacheKey, { reply: fallbackReply, timestamp: Date.now() });
    return json({ success: true, data: { reply: fallbackReply } });
  }

  const model = thinkingMode
    ? "google/gemini-3.1-pro-preview"
    : lowLatency
      ? "google/gemini-3.1-flash-lite"
      : "google/gemini-3.6-flash";

  try {
    const formattedMessages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...history.slice(-6).map((h) => ({ role: h.role, content: String(h.content) })),
      { role: "user", content: message },
    ];

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: formattedMessages,
      }),
    });

    if (!response.ok) {
      console.error("[ai-chat] Gateway error", response.status, await response.text());
      const fallbackReply = getSmartFallback(message);
      return json({ success: true, data: { reply: fallbackReply } });
    }

    const payload = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const reply = payload?.choices?.[0]?.message?.content || getSmartFallback(message);

    // Store in query cache for performance optimization
    queryCache.set(cacheKey, { reply, timestamp: Date.now() });

    return json({ success: true, data: { reply } });
  } catch (err) {
    console.error("[ai-chat] Failure", err);
    const fallbackReply = getSmartFallback(message);
    return json({ success: true, data: { reply: fallbackReply } });
  }
}
