import axios from "axios";

export const API_BASE_URL =
	(import.meta as ImportMeta & { env: { VITE_API_BASE_URL?: string } }).env
		.VITE_API_BASE_URL || "/api";

const api = axios.create({
	baseURL: API_BASE_URL,
});

export default api;
