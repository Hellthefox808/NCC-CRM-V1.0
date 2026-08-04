import { GoogleGenAI } from "@google/genai";

// Maintain conversational memory in-memory for this loop
// Map of sessionId -> messages array
const conversationStore = new Map<string, any[]>();

export class AIService {
  private ai: GoogleGenAI | null = null;
  private systemPrompt = `You are "Subedar Major AI Assistant" for the 19 Jharkhand Battalion NCC (19 JHR BN NCC), Ranchi, under Bihar and Jharkhand Directorate, serving the Sarala Birla University (SBU) Ranchi NCC Company.
Your job is to assist prospective cadets, current enrolled cadets, and parents with accurate NCC information.
Key facts:
- Unit: 19 Jharkhand Battalion NCC, Ranchi
- Directorate: Bihar and Jharkhand Directorate (Patna / Ranchi HQ)
- Institution: Sarala Birla University (SBU), Mahilong, Purulia Road, Ranchi, Jharkhand
- Company Officer: Associate NCC Officer (ANO) SBU Coy
- Motto: "Unity and Discipline" (Ekta aur Anushasan)
- Divisions: Senior Division (SD - Male) & Senior Wing (SW - Female)
- Course Duration: 3 Years for B & C Certificates (2 Years for B, 3rd year for C Certificate)
- Benefits: Direct SSB interview entries for defense.
- Physical Criteria: SD Height min ~170 cm, SW Height min ~152 cm. 1600m run, pushups, sit-ups, medical fitness.
- Camps: ATC, CATC, RDC, TSC, EBSB, AAC, Trekking & Mountaineering.

Provide respectful, motivating, patriotic, clear, and structured answers. Always uphold high military discipline.`;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      this.ai = new GoogleGenAI({ apiKey });
    }
  }

  async handleChat(sessionId: string, message: string, isLowLatency: boolean = false): Promise<string> {
    if (!this.ai) {
      return this.fallbackResponse(message);
    }

    const primaryModel = isLowLatency ? "gemini-3.1-flash-lite" : "gemini-3.6-flash";
    
    if (!conversationStore.has(sessionId)) {
      conversationStore.set(sessionId, [
        { role: "system", parts: [{ text: this.systemPrompt }] }
      ]);
    }
    
    const history = conversationStore.get(sessionId)!;
    history.push({ role: "user", parts: [{ text: message }] });

    try {
      const response = await this.ai.models.generateContent({
        model: primaryModel,
        contents: history,
        // Tools would be added here in a future iteration
      });
      
      const reply = response.text || "";
      history.push({ role: "model", parts: [{ text: reply }] });
      return reply;
    } catch (err) {
      console.error("AI Generation Error:", err);
      return this.fallbackResponse(message);
    }
  }

  private fallbackResponse(message: string): string {
    const lowerMsg = message.toLowerCase();
    if (lowerMsg.includes("document") || lowerMsg.includes("paper")) {
      return "Jai Hind! Required Documents for 19 JHR BN NCC Enrollment at SBU:\n1. 10th & 12th marksheets\n2. Aadhaar Card\n3. SBU Student ID\n4. Bank Passbook\n5. Medical Fitness Certificate";
    } else if (lowerMsg.includes("physical") || lowerMsg.includes("run")) {
      return "Jai Hind! Physical Standards:\n• SD (Male): Min Height ~170 cm, 1.6 KM Run under 6 mins 30 secs.\n• SW (Female): Min Height ~152 cm, 800m / 1.6 KM Run.";
    }
    return `Jai Hind! Thank you for contacting 19 Jharkhand Battalion NCC. For enrollment guidance, please contact ANO Dr. Animesh Roy at SBU.`;
  }
}

export const aiService = new AIService();
