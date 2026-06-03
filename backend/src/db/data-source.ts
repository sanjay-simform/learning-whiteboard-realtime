import { ENV } from "../config/env";
import { DataSource } from "typeorm";

export const AppDataSource = new DataSource({
  type: "sqlite",
  database: "db.db",
  // host: ENV.DB_HOST,qqqq
  // port: ENV.DB_PORT,
  // username: ENV.DB_USER,
  // password: ENV.DB_PASSWORD,
  // database: ENV.DB_NAME,
  synchronize: true,
  logging: false,
  entities: ["dist/**/*.entity.js"],
  migrations: ["dist/db/migrations/*.js"],
  subscribers: ["dist/db/subscribers/*.js"],
});
