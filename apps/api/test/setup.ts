import { PostgreSqlContainer } from '@testcontainers/postgresql';
import { RedisContainer } from '@testcontainers/redis';

export async function setupTestContainers() {
  const pgContainer = await new PostgreSqlContainer('postgres:16')
    .withDatabase('nurox_test_db')
    .withUsername('testuser')
    .withPassword('testpass')
    .start();

  const redisContainer = await new RedisContainer('redis:7-alpine').start();

  process.env.DB_HOST = pgContainer.getHost();
  process.env.DB_PORT = pgContainer.getPort().toString();
  process.env.DB_USERNAME = pgContainer.getUsername();
  process.env.DB_PASSWORD = pgContainer.getPassword();
  process.env.DB_DATABASE = pgContainer.getDatabase();

  process.env.REDIS_HOST = redisContainer.getHost();
  process.env.REDIS_PORT = redisContainer.getPort().toString();

  return { pgContainer, redisContainer };
}
