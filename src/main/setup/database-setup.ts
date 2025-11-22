import { BrowserWindow, dialog, ipcMain } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import { 
  loadDatabaseConfig, 
  saveDatabaseConfig, 
  DatabaseConfig 
} from '../config/database-config';

export class DatabaseSetupManager {
  private setupWindow: BrowserWindow | null = null;

  async checkAndShowSetup(): Promise<boolean> {
    const config = loadDatabaseConfig();
    
    // Check if config exists and is valid
    if (!config.mode) {
      return await this.showSetupDialog();
    }
    
    return true;
  }

  private async showSetupDialog(): Promise<boolean> {
    return new Promise((resolve) => {
      const choice = dialog.showMessageBoxSync(null as any, {
        type: 'question',
        buttons: ['Server (Main PC)', 'Client (Connected PC)', 'Cancel'],
        defaultId: 0,
        title: 'Database Setup',
        message: 'Configure Database Mode',
        detail: 'Choose how this computer will operate:\n\n' +
                'SERVER: This will be the main PC that hosts the database\n' +
                'CLIENT: This PC will connect to the main server PC\n\n' +
                'You can change this later in settings.'
      });

      if (choice === 2) {
        resolve(false);
        return;
      }

      if (choice === 0) {
        // Server mode
        this.setupServerMode(resolve);
      } else {
        // Client mode
        this.setupClientMode(resolve);
      }
    });
  }

  private setupServerMode(callback: (result: boolean) => void): void {
    const config: DatabaseConfig = {
      mode: 'server',
      serverPort: 5432,
      databasePath: path.join(process.env.APPDATA || process.env.HOME || '', 'Thaziri', 'database', 'thaziri.db')
    };
    
    // Ensure database directory exists
    const dbDir = path.dirname(config.databasePath!);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
    
    saveDatabaseConfig(config);
    
    // Get local IP address
    const interfaces = os.networkInterfaces();
    let localIP = 'Unknown';
    
    for (const name of Object.keys(interfaces)) {
      for (const iface of interfaces[name]!) {
        if (iface.family === 'IPv4' && !iface.internal) {
          localIP = iface.address;
          break;
        }
      }
    }
    
    dialog.showMessageBox(null as any, {
      type: 'info',
      title: 'Server Configuration Complete',
      message: 'Database Server Configured',
      detail: `This PC is now configured as the main database server.\n\n` +
              `Server IP: ${localIP}\n` +
              `Port: ${config.serverPort}\n\n` +
              `Other computers should connect to: ${localIP}:${config.serverPort}\n\n` +
              `Database location: ${config.databasePath}`
    });
    
    callback(true);
  }

  private setupClientMode(callback: (result: boolean) => void): void {
    const response = dialog.showMessageBoxSync(null as any, {
      type: 'question',
      buttons: ['Manual Entry', 'Auto-Detect', 'Cancel'],
      defaultId: 0,
      title: 'Client Setup',
      message: 'Connect to Server',
      detail: 'Choose how to connect to the main server PC:'
    });

    if (response === 2) {
      callback(false);
      return;
    }

    if (response === 0) {
      // Manual entry
      this.showManualEntryDialog(callback);
    } else {
      // Auto-detect
      this.autoDetectServer(callback);
    }
  }

  private showManualEntryDialog(callback: (result: boolean) => void): void {
    // Create a simple HTML form for input
    this.setupWindow = new BrowserWindow({
      width: 400,
      height: 300,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false
      },
      autoHideMenuBar: true,
      resizable: false
    });

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            padding: 20px;
            background: #f5f5f5;
          }
          h2 { color: #2A6484; }
          input {
            width: 100%;
            padding: 8px;
            margin: 10px 0;
            border: 1px solid #ddd;
            border-radius: 4px;
          }
          button {
            background: #429898;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 4px;
            cursor: pointer;
            margin-right: 10px;
          }
          button:hover { background: #3a8888; }
        </style>
      </head>
      <body>
        <h2>Connect to Database Server</h2>
        <label>Server IP Address:</label>
        <input type="text" id="serverHost" placeholder="e.g., 192.168.1.100" value="192.168.">
        <label>Port (default 5432):</label>
        <input type="text" id="serverPort" value="5432">
        <br><br>
        <button onclick="connect()">Connect</button>
        <button onclick="window.close()">Cancel</button>
        <script>
          const { ipcRenderer } = require('electron');
          function connect() {
            const host = document.getElementById('serverHost').value;
            const port = document.getElementById('serverPort').value;
            if (host && port) {
              ipcRenderer.send('setup-client', { host, port });
              window.close();
            } else {
              alert('Please enter both server IP and port');
            }
          }
        </script>
      </body>
      </html>
    `;

    this.setupWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);

    ipcMain.once('setup-client', (_event, data) => {
      const config: DatabaseConfig = {
        mode: 'client',
        serverHost: data.host,
        serverPort: parseInt(data.port) || 5432
      };
      
      saveDatabaseConfig(config);
      
      dialog.showMessageBox(null as any, {
        type: 'info',
        title: 'Client Configuration Complete',
        message: 'Connected to Server',
        detail: `This PC will connect to the server at:\n${config.serverHost}:${config.serverPort}`
      });
      
      callback(true);
    });

    this.setupWindow.on('closed', () => {
      this.setupWindow = null;
    });
  }

  private async autoDetectServer(callback: (result: boolean) => void): Promise<void> {
    // Scan local network for servers
    const net = require('net');
    const subnet = this.getLocalSubnet();
    let found = false;

    dialog.showMessageBox(null as any, {
      type: 'info',
      title: 'Scanning Network',
      message: 'Looking for Thaziri servers...',
      detail: `Scanning ${subnet}.1 to ${subnet}.254 on port 5432`
    });

    for (let i = 1; i <= 254 && !found; i++) {
      const host = `${subnet}.${i}`;
      const client = new net.Socket();
      
      await new Promise<void>((resolve) => {
        client.setTimeout(100);
        
        client.connect(5432, host, () => {
          found = true;
          client.destroy();
          
          const config: DatabaseConfig = {
            mode: 'client',
            serverHost: host,
            serverPort: 5432
          };
          
          saveDatabaseConfig(config);
          
          dialog.showMessageBox(null as any, {
            type: 'info',
            title: 'Server Found',
            message: 'Connected to Server',
            detail: `Found and connected to server at:\n${host}:5432`
          });
          
          callback(true);
          resolve();
        });
        
        client.on('error', () => {
          client.destroy();
          resolve();
        });
        
        client.on('timeout', () => {
          client.destroy();
          resolve();
        });
      });
    }

    if (!found) {
      dialog.showMessageBox(null as any, {
        type: 'warning',
        title: 'No Server Found',
        message: 'Could not find server',
        detail: 'No Thaziri database server was found on your network.\nPlease use manual configuration.'
      });
      
      this.showManualEntryDialog(callback);
    }
  }

  private getLocalSubnet(): string {
    const interfaces = os.networkInterfaces();
    
    for (const name of Object.keys(interfaces)) {
      for (const iface of interfaces[name]!) {
        if (iface.family === 'IPv4' && !iface.internal) {
          const parts = iface.address.split('.');
          return `${parts[0]}.${parts[1]}.${parts[2]}`;
        }
      }
    }
    
    return '192.168.1';
  }
}
