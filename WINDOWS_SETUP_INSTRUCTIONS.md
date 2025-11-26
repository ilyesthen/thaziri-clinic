# Thaziri Clinic Management System - Windows Setup Guide

## Overview

Thaziri now supports **client-server architecture** for LAN database sharing:

- **Server Version** (Admin PC): Hosts the database and provides API access
- **Client Version** (Other PCs): Connects to the server over LAN network

## Installation Instructions

### 1. Server Installation (Admin PC)

**Download:** `Thaziri-Server-Setup-x.x.x.exe` (or 32-bit version if needed)

1. **Install the server version** on your main admin PC
2. **Run the application** - it will automatically start the database server
3. **Import your existing data** (if you have an existing SQLite database):
   ```
   Open Command Prompt as Administrator
   Navigate to Thaziri installation folder
   Run: npm run db:migrate-to-server
   ```
4. **Note the server IP address** shown in the application console
5. **Configure Windows Firewall** to allow port 3001 for LAN access

### 2. Client Installation (Other PCs)

**Download:** `Thaziri-Client-Setup-x.x.x.exe` (or 32-bit version if needed)

1. **Install the client version** on each additional PC
2. **Run the application** 
3. **Configure server connection**:
   - Go to Settings → Network Configuration
   - Enter the admin PC's IP address (e.g., `192.168.1.100`)
   - Test connection
4. **Login** with your user credentials

## Network Requirements

- **All PCs must be on the same LAN network**
- **Port 3001** must be accessible between admin PC and client PCs
- **Admin PC must remain powered on** when clients need access

## Firewall Configuration

### Windows Defender Firewall (Admin PC):

1. Open Windows Defender Firewall
2. Click "Allow an app through firewall"
3. Add `Thaziri.exe` to the exceptions
4. Allow both Private and Public networks
5. **Alternative**: Allow port 3001 specifically

### Network Discovery:

1. Enable "Network Discovery" in Network Settings
2. Enable "File and Printer Sharing"

## Troubleshooting

### Client Cannot Connect to Server:

1. **Check IP address**: Ensure correct admin PC IP is configured
2. **Check firewall**: Temporarily disable firewall to test
3. **Check network**: Ping admin PC from client PC
4. **Check server status**: Verify server shows "API server running" message

### Performance Issues:

1. **Network speed**: Use wired connections when possible
2. **Admin PC specs**: Ensure adequate RAM and CPU on server
3. **Database size**: Large databases may need more powerful hardware

### Data Migration Issues:

1. **Backup first**: Always backup existing data before migration
2. **Check file permissions**: Ensure admin rights for migration script
3. **Check disk space**: Ensure sufficient space for new database

## System Requirements

### Server (Admin PC):
- **Windows 7/8/10/11** (32-bit or 64-bit)
- **4GB RAM minimum** (8GB+ recommended for multiple clients)
- **SSD recommended** for better database performance
- **Reliable network connection**

### Client PCs:
- **Windows 7/8/10/11** (32-bit or 64-bit)  
- **2GB RAM minimum**
- **Network connection to admin PC**

## Security Notes

- **Use strong passwords** for user accounts
- **Keep admin PC physically secure**
- **Regular backups** are essential
- **Consider VPN** for remote access if needed

## Support

For technical support or issues:
1. Check application console for error messages
2. Verify network connectivity between PCs
3. Ensure all PCs have the correct version installed
4. Contact system administrator for network configuration help
