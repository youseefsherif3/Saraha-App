import { log } from "console";
import { redisClient } from "./redis.db.js";

export const revokedKey = ({ userId, jti }) => {
  return `revokedToken:${userId}::${jti}`;
};

export const getKey = ({ userId }) => {
  return `revokedToken:${userId}`;
};

export const OTP_Key = ({ email }) => {
  return `otp::${email}`;
};

export const max_OTP_Key = ({ email }) => {
  return `max_otp::${email}`;
};

export const block_OTP_Key = ({ email }) => {
  return `block_otp::${email}`;
};

export const reset_Password_OTP_Key = ({ email }) => {
  return `reset_password_otp::${email}`;
};

export const two_Step_Enable_OTP_Key = ({ email }) => {
  return `two_step_enable_otp::${email}`;
};

export const two_Step_Login_OTP_Key = ({ email }) => {
  return `two_step_login_otp::${email}`;
};

export const setMethod = async ({ key, value, ttl } = {}) => {
  try {
    const data = typeof value === "string" ? value : JSON.stringify(value);

    return ttl
      ? await redisClient.set(key, data, { EX: ttl })
      : await redisClient.set(key, data);
  } catch (error) {
    console.error("Error setting value in Redis:", error);
  }
};

export const updateMethod = async ({ key, value } = {}) => {
  try {
    if (!(await redisClient.exists(key))) {
      return 0;
    }
    const data = typeof value === "string" ? value : JSON.stringify(value);

    return await redisClient.set(key, data);
  } catch (error) {
    console.error("Error updating value in Redis:", error);
  }
};

export const getMethod = async (key) => {
  try {
    try {
      return JSON.parse(await redisClient.get(key));
    } catch (error) {
      return await redisClient.get(key);
    }
  } catch (error) {
    console.error("Error getting value from Redis:", error);
  }
};

export const deleteMethod = async (key) => {
  try {
    return await redisClient.del(key);
  } catch (error) {
    console.error("Error deleting value from Redis:", error);
  }
};

export const existsMethod = async (key) => {
  try {
    return await redisClient.exists(key);
  } catch (error) {
    console.error("Error checking existence of key in Redis:", error);
  }
};

export const checkTTLMethod = async (key) => {
  try {
    return await redisClient.ttl(key);
  } catch (error) {
    console.error("Error checking TTL of key in Redis:", error);
  }
};

export const keys = async (patterns) => {
  try {
    return await redisClient.keys(`${patterns}*`);
  } catch (error) {
    console.error("Error fetching keys from Redis:", error);
  }
};

export const flushAll = async () => {
  try {
    return await redisClient.flushAll();
  } catch (error) {
    console.error("Error flushing all keys from Redis:", error);
  }
};

export const disconnect = async () => {
  try {
    await redisClient.quit();
    console.log("Disconnected from Redis successfully");
  } catch (error) {
    console.error("Error disconnecting from Redis:", error);
  }
};

export const incrMethod = async (key) => {
  try {
    return await redisClient.incr(key);
  } catch (error) {
    log("Error incrementing value in Redis:", error);
  }
};
