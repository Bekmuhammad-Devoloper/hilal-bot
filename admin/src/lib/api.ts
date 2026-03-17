import axios from "axios";

const API_URL = "http://localhost:1001/api";

const api = axios.create({ baseURL: API_URL, timeout: 15000 });

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
export const setAdmin = async (userId: number, isAdmin: boolean) => (await api.patch(`/users/${userId}/admin`, { isAdmin })).data;
export const blockUser = async (userId: number, isBlocked: boolean) => (await api.patch(`/users/${userId}/block`, { isBlocked })).data;

// ========= PLANS =========
export const getPlans = async () => (await api.get("/plans")).data;
export const getPlansAdmin = async () => (await api.get("/plans/admin")).data;
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

// ========= PAYMENTS =========
export const createPayment = async (telegramId: number, planId: number, method?: string) => (await api.post("/payments/create", { telegramId, planId, method })).data;
export const confirmPayment = async (id: number, cardLast4?: string) => (await api.post(`/payments/confirm/${id}`, { cardLast4 })).data;
export const getPayments = async (page = 1, limit = 20, status?: string) => {
  const params: any = { page, limit };
  if (status) params.status = status;
  return (await api.get("/payments", { params })).data;
};
export const getPaymentStats = async () => (await api.get("/payments/stats")).data;
export const getUserPayments = async (telegramId: number) => (await api.get(`/payments/user/${telegramId}`)).data;

// ========= SETTINGS =========
export const getSettings = async () => (await api.get("/settings")).data;
export const updateSettings = async (data: any) => (await api.put("/settings", data)).data;

// ========= BROADCAST =========
export const broadcastAll = async (message: string, photo?: string) => (await api.post("/broadcast/all", { message, photo })).data;
export const sendToUser = async (telegramId: number, message: string) => (await api.post("/broadcast/user", { telegramId, message })).data;

export default api;
