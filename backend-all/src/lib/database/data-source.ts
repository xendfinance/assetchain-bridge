import "reflect-metadata";
import { DataSource } from "typeorm";
import { config } from "../../config";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: config.database.host,
  port: config.database.port,
  username: config.database.username,
  password: config.database.password,
  database: config.database.database,
  synchronize: false, // Set to false when using migrations
  logging: config.database.logging || false,
  entities: [__dirname + "/entities/*.{ts,js}"],
  migrations: [__dirname + "/migrations/*.{ts,js}"],
  subscribers: [__dirname + "/subscribers/*.{ts,js}"],
  migrationsTableName: "migrations",
  ssl: config.database.ssl ? { rejectUnauthorized: false } : false,
});

export default AppDataSource;
