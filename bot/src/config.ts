import dotenv from "dotenv";
dotenv.config();

export const config = {
  botToken: process.env.BOT_TOKEN || "",
  apiUrl: process.env.API_URL || "http://localhost:3001/api",
  webAppUrl: process.env.WEBAPP_URL || "http://localhost:3000",
  channelId: process.env.CHANNEL_ID || "@gulomjonhoca",
  adminIds: (process.env.ADMIN_IDS || "").split(",").map(Number).filter(Boolean),
};
