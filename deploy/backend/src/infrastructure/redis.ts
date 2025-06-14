import { createClient } from "redis";

import { config } from "./../config/config";
import { logger } from "./../config/logger";

export const redisClient = createClient({
  socket: {
    host: config.redis.host,
    port: config.redis.port,
  },
});

redisClient.on("error", (err) => {
  logger.error(err);
});
