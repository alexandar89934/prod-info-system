import { config } from "config/config";

import { redisClient } from "./redis";

const { refreshValidity } = config.jwt;

const getKey = (userId: string, device: string) =>
  `refresh:${userId}:${device}`;

export const setRefreshToken = async (
  userId: string,
  refreshToken: string,
  device: string,
): Promise<void> => {
  await redisClient.setEx(
    getKey(userId, device),
    Number(refreshValidity),
    refreshToken,
  );
};

export const getRefreshToken = async (
  userId: string,
  device: string,
): Promise<string | null> => {
  return redisClient.get(getKey(userId, device));
};

export const deleteRefreshToken = async (
  userId: string,
  device: string,
): Promise<void> => {
  await redisClient.del(getKey(userId, device));
};
