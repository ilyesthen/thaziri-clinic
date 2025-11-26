import express, { Request, Response } from 'express'
import cors from 'cors'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

export class DatabaseApiServer {
  private app: express.Application
  private server: any
  private prisma: PrismaClient
  private port: number

  constructor(port: number = 3001) {
    this.app = express()
    this.port = port
    this.prisma = new PrismaClient()
    this.setupMiddleware()
    this.setupRoutes()
  }

  private setupMiddleware() {
    this.app.use(cors({
      origin: true, // Allow all origins for LAN access
      credentials: true
    }))
    this.app.use(express.json({ limit: '50mb' }))
    this.app.use(express.urlencoded({ extended: true, limit: '50mb' }))
  }

  private setupRoutes() {
    // Health check
    this.app.get('/api/health', (_req: Request, res: Response) => {
      res.json({ status: 'ok', timestamp: new Date().toISOString() })
    })

    // User authentication routes
    this.app.post('/api/auth/login', async (req: Request, res: Response) => {
      try {
        const { email, password } = req.body
        const user = await this.prisma.user.findUnique({ where: { email } })
        
        if (!user || !await bcrypt.compare(password, user.password)) {
          return res.status(401).json({ error: 'Invalid credentials' })
        }

        const { password: _, ...userWithoutPassword } = user
        res.json({ user: userWithoutPassword })
      } catch (error) {
        console.error('Login error:', error)
        res.status(500).json({ error: 'Login failed' })
      }
    })

    // Generic database query routes
    this.app.post('/api/db/:model/findMany', async (req: Request, res: Response) => {
      try {
        const { model } = req.params
        const { where, select, orderBy, take, skip } = req.body
        
        if (!(model in this.prisma)) {
          return res.status(400).json({ error: 'Invalid model' })
        }

        const result = await (this.prisma as any)[model].findMany({
          where,
          select,
          orderBy,
          take,
          skip
        })
        
        res.json(result)
      } catch (error) {
        console.error(`Query error for ${req.params.model}:`, error)
        res.status(500).json({ error: 'Database query failed' })
      }
    })

    this.app.post('/api/db/:model/findUnique', async (req: Request, res: Response) => {
      try {
        const { model } = req.params
        const { where, select } = req.body
        
        if (!(model in this.prisma)) {
          return res.status(400).json({ error: 'Invalid model' })
        }

        const result = await (this.prisma as any)[model].findUnique({
          where,
          select
        })
        
        res.json(result)
      } catch (error) {
        console.error(`Query error for ${req.params.model}:`, error)
        res.status(500).json({ error: 'Database query failed' })
      }
    })

    this.app.post('/api/db/:model/create', async (req: Request, res: Response) => {
      try {
        const { model } = req.params
        const { data } = req.body
        
        if (!(model in this.prisma)) {
          return res.status(400).json({ error: 'Invalid model' })
        }

        const result = await (this.prisma as any)[model].create({ data })
        
        res.json(result)
      } catch (error) {
        console.error(`Create error for ${req.params.model}:`, error)
        res.status(500).json({ error: 'Database create failed' })
      }
    })

    this.app.post('/api/db/:model/update', async (req: Request, res: Response) => {
      try {
        const { model } = req.params
        const { where, data } = req.body
        
        if (!(model in this.prisma)) {
          return res.status(400).json({ error: 'Invalid model' })
        }

        const result = await (this.prisma as any)[model].update({ where, data })
        
        res.json(result)
      } catch (error) {
        console.error(`Update error for ${req.params.model}:`, error)
        res.status(500).json({ error: 'Database update failed' })
      }
    })

    this.app.post('/api/db/:model/delete', async (req: Request, res: Response) => {
      try {
        const { model } = req.params
        const { where } = req.body
        
        if (!(model in this.prisma)) {
          return res.status(400).json({ error: 'Invalid model' })
        }

        const result = await (this.prisma as any)[model].delete({ where })
        
        res.json(result)
      } catch (error) {
        console.error(`Delete error for ${req.params.model}:`, error)
        res.status(500).json({ error: 'Database delete failed' })
      }
    })

    // Raw SQL queries for complex operations
    this.app.post('/api/db/raw', async (req: Request, res: Response) => {
      try {
        const { query, params } = req.body
        const result = await this.prisma.$queryRawUnsafe(query, ...params)
        res.json(result)
      } catch (error) {
        console.error('Raw query error:', error)
        res.status(500).json({ error: 'Raw query failed' })
      }
    })
  }

  async start(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.server = this.app.listen(this.port, '0.0.0.0', () => {
          console.log(`🚀 Database API server running on port ${this.port}`)
          console.log(`   - LAN Access: http://[YOUR-IP]:${this.port}`)
          console.log(`   - Health Check: http://localhost:${this.port}/api/health`)
          resolve()
        })
      } catch (error) {
        reject(error)
      }
    })
  }

  async stop(): Promise<void> {
    if (this.server) {
      await new Promise<void>((resolve) => {
        this.server.close(() => {
          console.log('Database API server stopped')
          resolve()
        })
      })
    }
    await this.prisma.$disconnect()
  }

  getLocalIP(): string {
    const { networkInterfaces } = require('os')
    const nets = networkInterfaces()
    
    for (const name of Object.keys(nets)) {
      for (const net of nets[name]) {
        if (net.family === 'IPv4' && !net.internal) {
          return net.address
        }
      }
    }
    return 'localhost'
  }
}
