
import api from "@/api/api";

export const getTickets = async (params = {}) => {
  const response = await api.get("/tickets", { params });
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
  const response = await api.patch(`/tickets/${ticketId}/status`, {
    status,
  });

  return response.data;
};

export const assignTicketToMe = async (ticketId) => {
  const response = await api.patch(`/tickets/${ticketId}/assign-me`);
  return response.data;
};
