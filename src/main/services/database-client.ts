import * as net from 'net';
import { loadDatabaseConfig } from '../config/database-config';
import { v4 as uuidv4 } from 'uuid';

interface PendingRequest {
  resolve: (value: any) => void;
  reject: (reason: any) => void;
}

export class DatabaseClient {
  private socket: net.Socket | null = null;
  private pendingRequests = new Map<string, PendingRequest>();
  private connected = false;
  private serverHost: string;
  private serverPort: number;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private messageBuffer = '';

  constructor() {
    const config = loadDatabaseConfig();
    this.serverHost = config.serverHost || 'localhost';
    this.serverPort = config.serverPort || 5432;
  }

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.connected) {
        resolve();
        return;
      }

      this.socket = new net.Socket();
      
      this.socket.connect(this.serverPort, this.serverHost, () => {
        console.log(`Connected to database server at ${this.serverHost}:${this.serverPort}`);
        this.connected = true;
        resolve();
      });

      this.socket.on('data', (data) => {
        this.messageBuffer += data.toString();
        
        // Process complete messages
        const messages = this.messageBuffer.split('\n');
        this.messageBuffer = messages.pop() || '';
        
        for (const message of messages) {
          if (message.trim()) {
            try {
              const response = JSON.parse(message);
              const pending = this.pendingRequests.get(response.id);
              if (pending) {
                this.pendingRequests.delete(response.id);
                if (response.success) {
                  pending.resolve(response.data);
                } else {
                  pending.reject(new Error(response.error || 'Unknown error'));
                }
              }
            } catch (error) {
              console.error('Error parsing response:', error);
            }
          }
        }
      });

      this.socket.on('close', () => {
        console.log('Connection to database server closed');
        this.connected = false;
        this.attemptReconnect();
      });

      this.socket.on('error', (error) => {
        console.error('Database client error:', error);
        this.connected = false;
        if (this.pendingRequests.size === 0) {
          reject(error);
        }
        this.attemptReconnect();
      });
    });
  }

  private attemptReconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    this.reconnectTimeout = setTimeout(() => {
      console.log('Attempting to reconnect to database server...');
      this.connect().catch(console.error);
    }, 5000);
  }

  async disconnect(): Promise<void> {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    if (this.socket) {
      this.socket.destroy();
      this.socket = null;
    }
    this.connected = false;
  }

  async request(table: string, action: string, params?: any): Promise<any> {
    if (!this.connected) {
      await this.connect();
    }

    return new Promise((resolve, reject) => {
      const id = uuidv4();
      const request = {
        id,
        method: 'query',
        table,
        action,
        params
      };

      this.pendingRequests.set(id, { resolve, reject });

      if (this.socket && this.socket.writable) {
        this.socket.write(JSON.stringify(request));
      } else {
        reject(new Error('Socket not writable'));
      }

      // Timeout after 30 seconds
      setTimeout(() => {
        if (this.pendingRequests.has(id)) {
          this.pendingRequests.delete(id);
          reject(new Error('Request timeout'));
        }
      }, 30000);
    });
  }

  // Proxy methods for Prisma-like interface
  createProxy(tableName: string): any {
    return {
      findMany: (params?: any) => this.request(tableName, 'findMany', params),
      findFirst: (params?: any) => this.request(tableName, 'findFirst', params),
      findUnique: (params: any) => this.request(tableName, 'findUnique', params),
      create: (params: any) => this.request(tableName, 'create', params),
      update: (params: any) => this.request(tableName, 'update', params),
      upsert: (params: any) => this.request(tableName, 'upsert', params),
      delete: (params: any) => this.request(tableName, 'delete', params),
      deleteMany: (params?: any) => this.request(tableName, 'deleteMany', params),
      count: (params?: any) => this.request(tableName, 'count', params)
    };
  }
}
