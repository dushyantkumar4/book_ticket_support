
import Ticket from "../models/Ticket.js";
import { analyzeTicket } from "./aiService.js";

export async function runTicketAI(ticketId) {
  try {
    const ticket = await Ticket.findById(ticketId);

    if (!ticket) {
      return { success: false, reason: "Ticket not found" };
    }

    const result = await analyzeTicket({
      subject: ticket.subject,
      description: ticket.description,
    });

    // Store AI suggestions separately.
    // The admin can review and apply them later.
    await Ticket.findByIdAndUpdate(ticketId, {
      $set: {
        aiCategory: result.category,
        aiPriority: result.priority,
        aiReasoning: result.reasoning,
        aiDraft: result.draft,
        aiStatus: "Completed",
      },
    });

    return { success: true, result };
  } catch (error) {
    const code = error.code || error.error?.code;
    const status = error.status || error.statusCode;

    console.error("Ticket AI failed:", {
      message: error.message,
      code,
      status,
      type: error.type || error.error?.type,
    });

    let reason =
      "The AI provider request failed. Check the backend logs for details.";

    if (!process.env.GEMINI_API_KEY) {
      reason =
        "Gemini API is not configured. Add GEMINI_API_KEY to the backend .env file and restart the server.";
    } else if (status === 401 || status === 403) {
      reason =
        "Gemini rejected the API key or access to the selected model. Check your key and model access.";
    } else if (status === 429) {
      reason =
        "Gemini's rate limit or quota was reached. Check your free-tier limits and try again later.";
    } else if (status === 404) {
      reason =
        "The configured Gemini model was not found or is unavailable to this project. Check GEMINI_MODEL in the backend .env file.";
    }

    await Ticket.findByIdAndUpdate(ticketId, {
      $set: {
        aiStatus: "Failed",
        aiDraft: "",
      },
    }).catch((dbError) => {
      console.error("Failed to save AI status:", dbError.message);
    });

    return { success: false, reason, code, status };
  }
}
