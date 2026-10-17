
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
    console.error("Ticket AI failed:", error.message);

    await Ticket.findByIdAndUpdate(ticketId, {
      $set: {
        aiStatus: "Failed",
        aiDraft: "",
      },
    });

    return { success: false, reason: "AI analysis failed" };
  }
}
