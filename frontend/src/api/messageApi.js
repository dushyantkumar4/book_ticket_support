
import api from "@/api/api";

export const getTicketMessages = async (ticketId) => {
  const response = await api.get(`/tickets/${ticketId}/messages`);
  return response.data;
};

export const sendTicketReply = async (ticketId, body) => {
  const response = await api.post(
    `/tickets/${ticketId}/messages`,
    { body }
  );

  return response.data;
};

export const addInternalNote = async (ticketId, body) => {
  const response = await api.post(
    `/tickets/${ticketId}/notes`,
    { body }
  );

  return response.data;
};
