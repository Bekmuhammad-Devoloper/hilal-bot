import axios from "axios";
import { config } from "./config";

const api = axios.create({
  baseURL: config.apiUrl,
  timeout: 10000,
});

// ============ USERS ============
export async function registerUser(
  telegramId: number,
  username: string,
  firstName: string,
  lastName: string,
  photoUrl?: string,
) {
  const { data } = await api.post("/users/register", {
    telegramId,
    username,
    firstName,
    lastName,
    photoUrl,
  });
  return data;
}

export async function getUser(telegramId: number) {
  const { data } = await api.get(`/users/telegram/${telegramId}`);
  return data;
}

// ============ PLANS ============
export async function getPlans() {
  const { data } = await api.get("/plans");
  return data;
}

export async function getPlan(id: number) {
  const { data } = await api.get(`/plans/${id}`);
  return data;
}

// ============ SUBSCRIPTIONS ============
export async function getActiveSubscription(telegramId: number) {
  const { data } = await api.get(`/subscriptions/active/${telegramId}`);
  // API returns {active: false} when no subscription
  if (!data || !data.id) return null;
  // endDate validligini tekshirish
  if (data.endDate) {
    const endDate = new Date(data.endDate);
    if (isNaN(endDate.getTime())) {
      console.error(`Invalid endDate for user ${telegramId}:`, data.endDate);
      return null;
    }
  } else {
    console.error(`No endDate in subscription for user ${telegramId}`);
    return null;
  }
  return data;
}

export async function getUserSubscriptions(telegramId: number) {
  const { data } = await api.get(`/subscriptions/user/${telegramId}`);
  return data;
}

export async function cancelSubscription(telegramId: number) {
  const { data } = await api.post(`/subscriptions/cancel/${telegramId}`);
  return data;
}

export async function getInviteLink(telegramId: number) {
  const { data } = await api.get(`/subscriptions/invite/${telegramId}`);
  return data;
}

// ============ PAYMENTS ============
export async function createPayment(telegramId: number, planId: number, method?: string) {
  const { data } = await api.post("/payments/create", { telegramId, planId, method });
  return data;
}

export async function confirmPayment(paymentId: number, cardLast4?: string) {
  const { data } = await api.post(`/payments/confirm/${paymentId}`, { cardLast4 });
  return data;
}

export async function getUserPayments(telegramId: number) {
  const { data } = await api.get(`/payments/user/${telegramId}`);
  return data;
}

// ============ SETTINGS ============
export async function getSettings() {
  const { data } = await api.get("/settings");
  return data;
}

// ============ AUTH ============
export async function generateAuthCode(telegramId: number) {
  const { data } = await api.post("/auth/generate-code", { telegramId });
  return data;
}
