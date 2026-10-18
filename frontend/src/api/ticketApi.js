
import api from "@/api/api";

export const getTickets = async (params = {}) => {
  const response = await api.get("/admin/tickets", { params });
  return response.data;
};

export const getMyTickets = async (params = {}) => {
  const response = await api.get("/tickets/mine", { params });
  return response.data;
};

export const getTicketById = async (ticketId) => {
  const response = await api.get(`/tickets/${ticketId}`);
  return response.data;
};

export const createTicket = async (ticketData) => {
  const response = await api.post("/tickets", ticketData);
  return response.data;
};

export const updateTicketStatus = async (ticketId, status) => {
  const response = await api.patch(`/admin/tickets/${ticketId}/status`, {
    status,
  });

  return response.data;
};

export const updateTicketClassification = async (ticketId, changes) => {
  const response = await api.patch(`/admin/tickets/${ticketId}/classification`, changes);
  return response.data;
};
export const updateTicketAssignment = async (ticketId) => {
  const response = await api.patch(`/admin/tickets/${ticketId}/assign`, { assignedTo: "self" });
  return response.data;
};

export const assignTicketToMe = async (ticketId) => {
  const response = await api.patch(`/admin/tickets/${ticketId}/assign`, { assignedTo: "self" });
  return response.data;
};
export const regenerateTicketAI = async (ticketId) => {
  const response = await api.post(
    `/admin/tickets/${ticketId}/ai-draft`
  );

  return response.data;
};
