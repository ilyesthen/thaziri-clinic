import { app } from 'electron';
import * as path from 'path';
import * as fs from 'fs';

export interface DatabaseConfig {
  mode: 'server' | 'client';
  serverHost?: string;
  serverPort?: number;
  databasePath?: string;
}

const CONFIG_FILE = path.join(app.getPath('userData'), 'db-config.json');

export function getDefaultConfig(): DatabaseConfig {
  return {
    mode: 'server',
    serverPort: 5432,
    databasePath: path.join(app.getPath('userData'), 'thaziri.db')
  };
}

export function loadDatabaseConfig(): DatabaseConfig {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const data = fs.readFileSync(CONFIG_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading database config:', error);
  }
  return getDefaultConfig();
}

export function saveDatabaseConfig(config: DatabaseConfig): void {
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
  } catch (error) {
    console.error('Error saving database config:', error);
  }
}

export function isServerMode(): boolean {
  const config = loadDatabaseConfig();
  return config.mode === 'server';
}

export function isClientMode(): boolean {
  const config = loadDatabaseConfig();
  return config.mode === 'client';
}
