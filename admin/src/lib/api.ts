import axios from "axios";

const API_URL = typeof window !== "undefined" && window.location.hostname === "localhost"
  ? "http://localhost:7777/api"
  : "/api";

const api = axios.create({ baseURL: API_URL, timeout: 60000 });

// Auth interceptor
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ========= AUTH =========
export const loginWithCode = async (code: string) => (await api.post("/auth/login-code", { code })).data;
export const loginWithTelegramId = async (telegramId: number) => (await api.post("/auth/login-telegram", { telegramId })).data;
export const getMe = async () => (await api.get("/auth/me")).data;

// ========= USERS =========
export const getUsers = async (page = 1, limit = 20, search?: string) => {
  const params: any = { page, limit };
  if (search) params.search = search;
  return (await api.get("/users", { params })).data;
};
export const getStats = async () => (await api.get("/users/stats")).data;
export const getDashboard = async () => (await api.get("/users/dashboard")).data;
export const setAdmin = async (userId: number, isAdmin: boolean) => (await api.patch(`/users/${userId}/admin`, { isAdmin })).data;
export const blockUser = async (userId: number, isBlocked: boolean) => (await api.patch(`/users/${userId}/block`, { isBlocked })).data;

// ========= PLANS =========
export const getPlans = async () => (await api.get("/plans")).data;
export const getAdminPlans = async () => (await api.get("/plans/admin")).data;
export const createPlan = async (data: any) => (await api.post("/plans", data)).data;
export const updatePlan = async (id: number, data: any) => (await api.put(`/plans/${id}`, data)).data;
export const deletePlan = async (id: number) => (await api.delete(`/plans/${id}`)).data;

// ========= SUBSCRIPTIONS =========
export const getActiveSubscription = async (telegramId: number) => (await api.get(`/subscriptions/active/${telegramId}`)).data;
export const getSubscriptions = async (page = 1, limit = 20, status?: string) => {
  const params: any = { page, limit };
  if (status) params.status = status;
  return (await api.get("/subscriptions", { params })).data;
};
export const getSubStats = async () => (await api.get("/subscriptions/stats")).data;
export const cancelSubscription = async (telegramId: number) => (await api.post(`/subscriptions/cancel/${telegramId}`)).data;
export const checkExpired = async () => (await api.post("/subscriptions/check-expired")).data;

// ========= PAYMENTS =========
export const createPayment = async (telegramId: number, planId: number, method?: string) => (await api.post("/payments/create", { telegramId, planId, method })).data;
export const confirmPayment = async (id: number, cardLast4?: string) => (await api.post(`/payments/confirm/${id}`, { cardLast4 })).data;
export const cancelPayment = async (id: number) => (await api.post(`/payments/cancel/${id}`)).data;
export const getPayments = async (page = 1, limit = 20, status?: string) => {
  const params: any = { page, limit };
  if (status) params.status = status;
  return (await api.get("/payments", { params })).data;
};
export const getPaymentStats = async () => (await api.get("/payments/stats")).data;
export const getUserPayments = async (telegramId: number) => (await api.get(`/payments/user/${telegramId}`)).data;
export const getRecentPayments = async (limit = 5) => (await api.get(`/payments/recent?limit=${limit}`)).data;

// ========= USERS (additional) =========
export const getRecentUsers = async (limit = 5) => (await api.get(`/users/recent?limit=${limit}`)).data;
export const getWeeklyStats = async () => (await api.get("/users/weekly-stats")).data;

// ========= SETTINGS =========
export const getSettings = async () => (await api.get("/settings")).data;
export const updateSettings = async (key: string, value: any) => (await api.put("/settings", { [key]: value })).data;

// ========= BROADCAST =========
export const getBroadcastUsers = async () => (await api.get("/broadcast/users")).data;
export const broadcastAll = async (message: string, mediaType?: string, mediaUrl?: string) => (await api.post("/broadcast/all", { message, mediaType, mediaUrl })).data;
export const broadcastSelected = async (telegramIds: number[], message: string, mediaType?: string, mediaUrl?: string) => (await api.post("/broadcast/selected", { telegramIds, message, mediaType, mediaUrl })).data;
export const sendToUser = async (telegramId: number, message: string, mediaType?: string, mediaUrl?: string) => (await api.post("/broadcast/user", { telegramId, message, mediaType, mediaUrl })).data;

export default api;
