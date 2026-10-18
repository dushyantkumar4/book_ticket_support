
import { GoogleGenAI } from "@google/genai";

// Use the existing knowledge-base text from your project here.
const BOOKLEAF_KNOWLEDGE_BASE = `
BookLeaf publishes and distributes books for authors.

Royalty split: 80% author and 20% BookLeaf.
Net royalties are calculated from MRP minus printing costs,
marketplace commissions, and shipping.
Royalties are paid quarterly within 45 days after quarter end.
The minimum payout threshold is INR 1,000.

BookLeaf handles cover design, typesetting, ISBN assignment,
printing, distribution, and royalties.
Printing usually takes 5-7 business days.
New distribution listings usually take 7-10 business days.
Metadata changes usually take 3-5 business days.
Distribution sync may take 24-48 hours.

Use only the information in this knowledge base.
If information is missing, say the support team needs to verify it.
`;

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const CATEGORIES = [
  "Royalty & Payments",
  "ISBN & Metadata Issues",
  "Printing & Quality",
  "Distribution & Availability",
  "Book Status & Production Updates",
  "General Inquiry",
];

const PRIORITIES = ["Critical", "High", "Medium", "Low"];

export const analyzeTicket = async ({ subject, description }) => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is missing from backend .env");
  }

  const response = await ai.models.generateContent({
    model: process.env.GEMINI_MODEL || "gemini-3.8-flash",

    contents: `
You are a support assistant for BookLeaf.

Analyze this support ticket using the supplied knowledge base.

KNOWLEDGE BASE:
${BOOKLEAF_KNOWLEDGE_BASE}

TICKET SUBJECT:
${subject}

TICKET DESCRIPTION:
${description}

Return:
- category: one exact category from the allowed categories
- priority: Critical, High, Medium, or Low
- reasoning: brief explanation for the classification
- draft: a professional, empathetic reply to the author

Allowed categories:
${CATEGORIES.join(", ")}

Priority guidance:
- Critical: urgent issue requiring immediate escalation
- High: significant issue, such as an ISBN error affecting production
- Medium: normal support request
- Low: general information request

Do not invent policies, payment dates, or guarantees.
If information is uncertain, say the team will verify it.
The draft must address the author's actual issue.
`,

    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "OBJECT",
        properties: {
          category: {
            type: "STRING",
            enum: CATEGORIES,
          },
          priority: {
            type: "STRING",
            enum: PRIORITIES,
          },
          reasoning: { type: "STRING" },
          draft: { type: "STRING" },
        },
        required: ["category", "priority", "reasoning", "draft"],
      },
    },
  });

  const text = response.text;

  if (!text) {
    throw new Error("Gemini returned an empty response");
  }

  const result = JSON.parse(text);

  // Validate the response before saving it to MongoDB.
  if (
    !CATEGORIES.includes(result.category) ||
    !PRIORITIES.includes(result.priority) ||
    typeof result.reasoning !== "string" ||
    typeof result.draft !== "string"
  ) {
    throw new Error("Gemini returned an invalid ticket analysis");
  }

  return result;
};
