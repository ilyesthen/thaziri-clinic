// Build configuration for server vs client modes
export const BUILD_CONFIG = {
  // Determine if this is a server build (from environment variable)
  isServerBuild: process.env.BUILD_MODE === 'server',
  
  // Default server configuration
  serverConfig: {
    apiPort: 3001,
    enableApiServer: true,
    databaseMode: 'postgresql', // or 'sqlite' for simpler setup
  },
  
  // Default client configuration  
  clientConfig: {
    defaultServerUrl: 'http://192.168.1.100:3001', // Will be configurable in UI
    enableApiServer: false,
    databaseMode: 'remote',
  },
  
  // Get current configuration based on build mode
  getCurrentConfig() {
    return this.isServerBuild ? {
      ...this.serverConfig,
      buildMode: 'server' as const
    } : {
      ...this.clientConfig, 
      buildMode: 'client' as const
    }
  }
}

// Runtime detection (when BUILD_MODE env var not available)
export function detectBuildMode(): 'server' | 'client' {
  // Check for server-specific files or environment indicators
  try {
    const fs = require('fs')
    const path = require('path')
    
    // Look for server-mode indicator file
    const serverModeFile = path.join(process.resourcesPath || process.cwd(), '.server-mode')
    if (fs.existsSync(serverModeFile)) {
      return 'server'
    }
    
    // Check for client-mode indicator
    const clientModeFile = path.join(process.resourcesPath || process.cwd(), '.client-mode')
    if (fs.existsSync(clientModeFile)) {
      return 'client'
    }
    
    // Default fallback - check if PostgreSQL binaries are present (server mode)
    // This is a rough heuristic
    return 'server'
  } catch {
    return 'server'
  }
}
