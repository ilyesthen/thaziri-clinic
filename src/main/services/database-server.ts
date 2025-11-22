import * as net from 'net';
import * as path from 'path';
const { PrismaClient } = require('@prisma/client');
import { app } from 'electron';
import { loadDatabaseConfig } from '../config/database-config';

interface RequestMessage {
  id: string;
  method: string;
  table: string;
  action: string;
  params?: any;
}

interface ResponseMessage {
  id: string;
  success: boolean;
  data?: any;
  error?: string;
}

export class DatabaseServer {
  private server: net.Server | null = null;
  private prisma: PrismaClient;
  private clients: Set<net.Socket> = new Set();
  private port: number = 5432;

  constructor() {
    const config = loadDatabaseConfig();
    this.port = config.serverPort || 5432;
    
    // Initialize Prisma with the server database
    this.prisma = new PrismaClient({
      datasources: {
        db: {
          url: `file:${config.databasePath || path.join(app.getPath('userData'), 'thaziri.db')}`
        }
      }
    });
  }

  async start(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.server = net.createServer((socket) => {
        console.log('Client connected from:', socket.remoteAddress);
        this.clients.add(socket);

        socket.on('data', async (data) => {
          try {
            const request: RequestMessage = JSON.parse(data.toString());
            const response = await this.handleRequest(request);
            socket.write(JSON.stringify(response));
          } catch (error: any) {
            console.error('Error handling request:', error);
            const errorResponse: ResponseMessage = {
              id: 'error',
              success: false,
              error: error.message
            };
            socket.write(JSON.stringify(errorResponse));
          }
        });

        socket.on('close', () => {
          console.log('Client disconnected');
          this.clients.delete(socket);
        });

        socket.on('error', (error) => {
          console.error('Socket error:', error);
          this.clients.delete(socket);
        });
      });

      this.server.on('error', (error) => {
        console.error('Server error:', error);
        reject(error);
      });

      // Listen on all network interfaces
      this.server.listen(this.port, '0.0.0.0', () => {
        console.log(`Database server listening on port ${this.port}`);
        resolve();
      });
    });
  }

  async stop(): Promise<void> {
    return new Promise((resolve) => {
      this.clients.forEach(client => client.destroy());
      this.clients.clear();
      
      if (this.server) {
        this.server.close(() => {
          console.log('Database server stopped');
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  private async handleRequest(request: RequestMessage): Promise<ResponseMessage> {
    try {
      const { id, table, action, params } = request;
      let result: any;

      // Route to appropriate Prisma model based on table
      const model = (this.prisma as any)[table];
      if (!model) {
        throw new Error(`Table ${table} not found`);
      }

      switch (action) {
        case 'findMany':
          result = await model.findMany(params);
          break;
        case 'findFirst':
          result = await model.findFirst(params);
          break;
        case 'findUnique':
          result = await model.findUnique(params);
          break;
        case 'create':
          result = await model.create(params);
          break;
        case 'update':
          result = await model.update(params);
          break;
        case 'upsert':
          result = await model.upsert(params);
          break;
        case 'delete':
          result = await model.delete(params);
          break;
        case 'deleteMany':
          result = await model.deleteMany(params);
          break;
        case 'count':
          result = await model.count(params);
          break;
        default:
          throw new Error(`Unknown action: ${action}`);
      }

      return {
        id,
        success: true,
        data: result
      };
    } catch (error: any) {
      return {
        id: request.id,
        success: false,
        error: error.message
      };
    }
  }

  broadcastToClients(message: any): void {
    const data = JSON.stringify(message);
    this.clients.forEach(client => {
      if (client.writable) {
        client.write(data);
      }
    });
  }
}
