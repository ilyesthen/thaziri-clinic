const { PrismaClient } = require('@prisma/client');
import { DatabaseServer } from './services/database-server';
import { DatabaseClient } from './services/database-client';
import { loadDatabaseConfig, isServerMode, isClientMode } from './config/database-config';
import * as path from 'path';
import { app } from 'electron';

export class DatabaseManager {
  private static instance: DatabaseManager;
  private prisma: PrismaClient | null = null;
  private server: DatabaseServer | null = null;
  private client: DatabaseClient | null = null;
  private isInitialized = false;

  private constructor() {}

  static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    const config = loadDatabaseConfig();
    
    if (isServerMode()) {
      console.log('Starting in SERVER mode');
      
      // Initialize local Prisma instance
      this.prisma = new PrismaClient({
        datasources: {
          db: {
            url: `file:${config.databasePath || path.join(app.getPath('userData'), 'thaziri.db')}`
          }
        }
      });
      
      // Start database server
      this.server = new DatabaseServer();
      await this.server.start();
      
    } else if (isClientMode()) {
      console.log('Starting in CLIENT mode');
      console.log(`Connecting to server at ${config.serverHost}:${config.serverPort}`);
      
      // Initialize database client
      this.client = new DatabaseClient();
      await this.client.connect();
    }
    
    this.isInitialized = true;
  }

  async shutdown(): Promise<void> {
    if (this.server) {
      await this.server.stop();
      this.server = null;
    }
    
    if (this.client) {
      await this.client.disconnect();
      this.client = null;
    }
    
    if (this.prisma) {
      await this.prisma.$disconnect();
      this.prisma = null;
    }
    
    this.isInitialized = false;
  }

  getDatabase(): any {
    if (isServerMode() && this.prisma) {
      return this.prisma;
    } else if (isClientMode() && this.client) {
      // Return proxy object that mimics Prisma structure
      return new Proxy({}, {
        get: (_target, prop: string) => {
          return this.client!.createProxy(prop);
        }
      });
    }
    throw new Error('Database not initialized');
  }

  isServer(): boolean {
    return isServerMode();
  }

  isClient(): boolean {
    return isClientMode();
  }
}
