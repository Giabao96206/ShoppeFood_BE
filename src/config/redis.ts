import Redis from "ioredis";

export const redisClient = new Redis(process.env.REDIS_URL as string);

redisClient.on("connect", () => console.log("🍃 Đã kết nối Redis"));
redisClient.on("error", (err) => console.error("Lỗi Redis:", err));