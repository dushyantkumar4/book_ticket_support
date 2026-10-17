
import OpenAI from "openai";
import knowledgeBase from "../data/knowledgeBase.js";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 15000,
  maxRetries: 1,
});

const categories = [
  "Royalty & Payments",
  "ISBN & Metadata Issues",
  "Printing & Quality",
  "Distribution & Availability",
  "Book Status & Production Updates",
  "General Inquiry",
];

const priorities = ["Critical", "High", "Medium", "Low"];

export async function analyzeTicket({ subject, description }) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("AI service is not configured.");
  }

  const response = await client.responses.create({
    model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
    store: false,
    instructions: `
You are BookLeaf's support triage assistant.

Use the supplied BookLeaf knowledge base to draft a helpful reply.
Classify the ticket into exactly one allowed category and priority.

Priority guidance:
- Critical: urgent risk requiring immediate human attention.
- High: ISBN errors, serious printing defects, or time-sensitive
  payment or production problems.
- Medium: a normal issue that needs support investigation.
- Low: general questions and non-urgent requests.

Do not mark every complaint as Critical.
Do not claim an action was completed when it has not been completed.
Do not invent account records or specific payment dates.
The draft is a suggestion for an admin to review, not an automatic reply.

Return the required structured output only.
`,
    input: `
BOOKLEAF KNOWLEDGE BASE:
${knowledgeBase}

TICKET SUBJECT:
${subject}

TICKET DESCRIPTION:
${description}
`,
    text: {
      format: {
        type: "json_schema",
        name: "ticket_analysis",
        strict: true,
        schema: {
          type: "object",
          properties: {
            category: {
              type: "string",
              enum: categories,
            },
            priority: {
              type: "string",
              enum: priorities,
            },
            reasoning: {
              type: "string",
            },
            draft: {
              type: "string",
            },
          },
          required: ["category", "priority", "reasoning", "draft"],
          additionalProperties: false,
        },
      },
    },
  });

  if (!response.output_text) {
    throw new Error("AI returned an empty response.");
  }

  const result = JSON.parse(response.output_text);

  // Basic defensive validation before saving to the database.
  if (
    !categories.includes(result.category) ||
    !priorities.includes(result.priority) ||
    !result.draft.trim()
  ) {
    throw new Error("AI returned an invalid ticket analysis.");
  }

  return result;
}
