import { PrismaClient } from '@prisma/client'

interface DatabaseClientConfig {
  serverUrl: string
  isServer: boolean
}

export class DatabaseClient {
  private config: DatabaseClientConfig
  private prisma?: PrismaClient

  constructor(config: DatabaseClientConfig) {
    this.config = config
    
    if (config.isServer) {
      // Server mode: use direct Prisma client
      this.prisma = new PrismaClient()
    }
    // Client mode: API calls only (no Prisma instance)
  }

  private async apiCall(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${this.config.serverUrl}${endpoint}`
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    })

    if (!response.ok) {
      throw new Error(`API call failed: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  async findMany(model: string, params: any = {}): Promise<any[]> {
    if (this.config.isServer && this.prisma) {
      return (this.prisma as any)[model].findMany(params)
    }
    
    return this.apiCall(`/api/db/${model}/findMany`, {
      body: JSON.stringify(params)
    })
  }

  async findUnique(model: string, params: any): Promise<any> {
    if (this.config.isServer && this.prisma) {
      return (this.prisma as any)[model].findUnique(params)
    }
    
    return this.apiCall(`/api/db/${model}/findUnique`, {
      body: JSON.stringify(params)
    })
  }

  async create(model: string, params: any): Promise<any> {
    if (this.config.isServer && this.prisma) {
      return (this.prisma as any)[model].create(params)
    }
    
    return this.apiCall(`/api/db/${model}/create`, {
      body: JSON.stringify(params)
    })
  }

  async update(model: string, params: any): Promise<any> {
    if (this.config.isServer && this.prisma) {
      return (this.prisma as any)[model].update(params)
    }
    
    return this.apiCall(`/api/db/${model}/update`, {
      body: JSON.stringify(params)
    })
  }

  async delete(model: string, params: any): Promise<any> {
    if (this.config.isServer && this.prisma) {
      return (this.prisma as any)[model].delete(params)
    }
    
    return this.apiCall(`/api/db/${model}/delete`, {
      body: JSON.stringify(params)
    })
  }

  async queryRaw(query: string, params: any[] = []): Promise<any> {
    if (this.config.isServer && this.prisma) {
      return this.prisma.$queryRawUnsafe(query, ...params)
    }
    
    return this.apiCall('/api/db/raw', {
      body: JSON.stringify({ query, params })
    })
  }

  async authenticate(email: string, password: string): Promise<any> {
    if (this.config.isServer && this.prisma) {
      // Direct authentication for server mode
      const bcrypt = require('bcryptjs')
      const user = await this.prisma.user.findUnique({ where: { email } })
      
      if (!user || !await bcrypt.compare(password, user.password)) {
        throw new Error('Invalid credentials')
      }

      const { password: _, ...userWithoutPassword } = user
      return { user: userWithoutPassword }
    }
    
    return this.apiCall('/api/auth/login', {
      body: JSON.stringify({ email, password })
    })
  }

  async disconnect(): Promise<void> {
    if (this.config.isServer && this.prisma) {
      await this.prisma.$disconnect()
    }
  }

  async connect(): Promise<void> {
    if (this.config.isServer && this.prisma) {
      await this.prisma.$connect()
    } else {
      // Test connection to API server
      const response = await fetch(`${this.config.serverUrl}/api/health`)
      if (!response.ok) {
        throw new Error(`Cannot connect to database server at ${this.config.serverUrl}`)
      }
    }
  }

  // Helper method to check if server is reachable (for client mode)
  async isServerReachable(): Promise<boolean> {
    if (this.config.isServer) return true
    
    try {
      const response = await fetch(`${this.config.serverUrl}/api/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000) // 5 second timeout
      })
      return response.ok
    } catch {
      return false
    }
  }
}
