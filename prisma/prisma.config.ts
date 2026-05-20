import 'dotenv/config';

/**
 * Prisma configuration for migrations and CLI when using Prisma 7+
 * Exposes the database URL for migrate operations.
 */
const config = {
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
};

export default config;
