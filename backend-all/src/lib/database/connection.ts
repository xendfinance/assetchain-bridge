import "reflect-metadata";
import { DataSource } from "typeorm";
import { AppDataSource } from "./data-source";
import EventLogger from "../logger/index.logger";

class DatabaseConnection {
  private static instance: DatabaseConnection;
  private dataSource: DataSource | null = null;

  private constructor() {}

  public static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }

  public async connect() {
    try {
      if (!this.dataSource) {
        this.dataSource = AppDataSource;
        await this.dataSource.initialize();
        EventLogger.info("Database connection established successfully");
      }
      return this.dataSource;
    } catch (error: any) {
      EventLogger.error(`Error connecting to database ${error.message}`);
      throw error;
    }
  }

  public async disconnect() {
    try {
      if (this.dataSource && this.dataSource.isInitialized) {
        await this.dataSource.destroy();
        this.dataSource = null;
        EventLogger.info("Database connection closed");
      }
    } catch (error:any) {
      EventLogger.error("Error disconnecting from database:" + error.message);
      throw error;
    }
  }

  public getDataSource() {
    return this.dataSource;
  }

  public async runMigrations() {
    try {
      if (!this.dataSource) {
        await this.connect();
      }
      
      if (this.dataSource && this.dataSource.isInitialized) {
        await this.dataSource.runMigrations();
        EventLogger.info("Migrations completed successfully");
      }
    } catch (error:any) {
      EventLogger.error("Error running migrations:" + error.message);
      throw error;
    }
  }

  public async undoLastMigration() {
    try {
      if (!this.dataSource) {
        await this.connect();
      }
      
      if (this.dataSource && this.dataSource.isInitialized) {
        await this.dataSource.undoLastMigration();
        EventLogger.info("Last migration reverted successfully");
      }
    } catch (error:any) {
      EventLogger.error("Error reverting migration:" + error.message);
      throw error;
    }
  }

  public isConnected() {
    return this.dataSource ? this.dataSource.isInitialized : false;
  }
}

export const dbConnection = DatabaseConnection.getInstance();
export default dbConnection;
