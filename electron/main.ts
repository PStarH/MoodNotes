import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import * as fs from 'fs/promises';

let mainWindow: BrowserWindow | null;

// Get the media storage directory
function getMediaStoragePath(): string {
  const userDataPath = app.getPath('userData');
  const mediaPath = path.join(userDataPath, 'media');
  return mediaPath;
}

// Ensure media directory exists
async function ensureMediaDirectory(): Promise<void> {
  const mediaPath = getMediaStoragePath();
  try {
    await fs.access(mediaPath);
  } catch {
    await fs.mkdir(mediaPath, { recursive: true });
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false, // Disable Node.js integration for security
      contextIsolation: true, // Enable context isolation for security
    },
  });

  const startURL = process.env.VITE_DEV_SERVER_URL
    ? process.env.VITE_DEV_SERVER_URL
    : `file://${path.join(__dirname, '../dist/index.html')}`;
  mainWindow.loadURL(startURL);

  // Open DevTools if in development mode
  if (!app.isPackaged) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// IPC Handlers for media file operations

// Save media file
ipcMain.handle('media:save', async (event, { filename, buffer }: { filename: string; buffer: ArrayBuffer }) => {
  try {
    await ensureMediaDirectory();
    const mediaPath = getMediaStoragePath();
    const filePath = path.join(mediaPath, filename);
    await fs.writeFile(filePath, Buffer.from(buffer));
    return { success: true, path: filePath };
  } catch (error: any) {
    console.error('Error saving media file:', error);
    return { success: false, error: error.message };
  }
});

// Read media file
ipcMain.handle('media:read', async (event, filename: string) => {
  try {
    const mediaPath = getMediaStoragePath();
    const filePath = path.join(mediaPath, filename);
    const buffer = await fs.readFile(filePath);
    return { success: true, buffer: buffer };
  } catch (error: any) {
    console.error('Error reading media file:', error);
    return { success: false, error: error.message };
  }
});

// Delete media file
ipcMain.handle('media:delete', async (event, filename: string) => {
  try {
    const mediaPath = getMediaStoragePath();
    const filePath = path.join(mediaPath, filename);
    await fs.unlink(filePath);
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting media file:', error);
    return { success: false, error: error.message };
  }
});

// Get media storage path
ipcMain.handle('media:get-path', async () => {
  try {
    await ensureMediaDirectory();
    const mediaPath = getMediaStoragePath();
    return { success: true, path: mediaPath };
  } catch (error: any) {
    console.error('Error getting media path:', error);
    return { success: false, error: error.message };
  }
});

// List all media files
ipcMain.handle('media:list', async () => {
  try {
    await ensureMediaDirectory();
    const mediaPath = getMediaStoragePath();
    const files = await fs.readdir(mediaPath);
    return { success: true, files };
  } catch (error: any) {
    console.error('Error listing media files:', error);
    return { success: false, error: error.message };
  }
});

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
