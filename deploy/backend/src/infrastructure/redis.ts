import { createClient } from "redis";

import { config } from "#config";
import { logger } from "#logger";

export const redisClient = createClient({
  socket: {
    host: config.redis.host,
    port: config.redis.port,
  },
});

redisClient.on("error", (err) => {
  logger.error(err);
});
