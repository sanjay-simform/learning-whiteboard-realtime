import { ENV } from "config/env";
import { DataSource } from "typeorm";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: ENV.DB_HOST,
  port: ENV.DB_PORT,
  username: ENV.DB_USER,
  password: ENV.DB_PASSWORD,
  database: ENV.DB_NAME,
  synchronize: ENV.NODE_ENV === "development",
  logging: false,
  entities: ["src/**/*.entity.ts"],
  migrations: ["src/db/migrations/*.ts"],
  subscribers: ["src/db/subscribers/*.ts"],
});
