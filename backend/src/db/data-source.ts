import { ENV } from "config/env";
import { DataSource } from "typeorm";

export const AppDataSource = new DataSource({
  type: "sqlite",
  database: "db.db",
  // host: ENV.DB_HOST,
  // port: ENV.DB_PORT,
  // username: ENV.DB_USER,
  // password: ENV.DB_PASSWORD,
  // database: ENV.DB_NAME,
  synchronize: true,
  logging: false,
  entities: ["src/**/*.entity.ts"],
  migrations: ["src/db/migrations/*.ts"],
  subscribers: ["src/db/subscribers/*.ts"],
});
