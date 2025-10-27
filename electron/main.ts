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
    icon: path.join(__dirname, '../public/AppIcons/Assets.xcassets/AppIcon.appiconset/512.png'),
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

// Security constants
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB per file
const MAX_TOTAL_SIZE = 100 * 1024 * 1024; // 100MB total storage
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.mp4', '.webm', '.ogg', '.mp3', '.wav'];

// Validate and sanitize filename to prevent path traversal
function validateFilename(filename: string): { valid: boolean; sanitized?: string; error?: string } {
  // Check if filename exists and is a string
  if (!filename || typeof filename !== 'string') {
    return { valid: false, error: 'Invalid filename: must be a non-empty string' };
  }

  // Check filename length
  if (filename.length > 255) {
    return { valid: false, error: 'Invalid filename: exceeds maximum length' };
  }

  // Prevent path traversal by using path.basename
  const normalizedName = path.basename(filename);

  // Check if the filename contains path traversal attempts
  if (normalizedName !== filename) {
    return { valid: false, error: 'Invalid filename: path traversal attempt detected' };
  }

  // Check for null bytes
  if (filename.includes('\0')) {
    return { valid: false, error: 'Invalid filename: null byte detected' };
  }

  // Check file extension
  const ext = path.extname(normalizedName).toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return { valid: false, error: `Invalid file type: ${ext}. Allowed types: ${ALLOWED_EXTENSIONS.join(', ')}` };
  }

  return { valid: true, sanitized: normalizedName };
}

// Check total storage size
async function checkStorageSize(additionalSize: number): Promise<{ ok: boolean; error?: string }> {
  try {
    const mediaPath = getMediaStoragePath();
    const files = await fs.readdir(mediaPath);
    let totalSize = 0;

    for (const file of files) {
      const stats = await fs.stat(path.join(mediaPath, file));
      totalSize += stats.size;
    }

    if (totalSize + additionalSize > MAX_TOTAL_SIZE) {
      return {
        ok: false,
        error: `Total storage limit exceeded. Current: ${(totalSize / 1024 / 1024).toFixed(2)}MB, Limit: ${MAX_TOTAL_SIZE / 1024 / 1024}MB`
      };
    }

    return { ok: true };
  } catch (error: any) {
    return { ok: false, error: `Failed to check storage size: ${error.message}` };
  }
}

// Verify file path is within media directory
function isPathSafe(filePath: string, mediaPath: string): boolean {
  const resolvedFilePath = path.resolve(filePath);
  const resolvedMediaPath = path.resolve(mediaPath);
  return resolvedFilePath.startsWith(resolvedMediaPath);
}

// IPC Handlers for media file operations

// Save media file
ipcMain.handle('media:save', async (event, { filename, buffer }: { filename: string; buffer: ArrayBuffer }) => {
  try {
    // Validate filename
    const validation = validateFilename(filename);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }
    const sanitizedFilename = validation.sanitized!;

    // Check file size
    if (buffer.byteLength > MAX_FILE_SIZE) {
      return {
        success: false,
        error: `File too large: ${(buffer.byteLength / 1024 / 1024).toFixed(2)}MB exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`
      };
    }

    // Check total storage size
    const storageCheck = await checkStorageSize(buffer.byteLength);
    if (!storageCheck.ok) {
      return { success: false, error: storageCheck.error };
    }

    await ensureMediaDirectory();
    const mediaPath = getMediaStoragePath();
    const filePath = path.join(mediaPath, sanitizedFilename);

    // Verify path safety
    if (!isPathSafe(filePath, mediaPath)) {
      return { success: false, error: 'Access denied: invalid file path' };
    }

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
    // Validate filename
    const validation = validateFilename(filename);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }
    const sanitizedFilename = validation.sanitized!;

    const mediaPath = getMediaStoragePath();
    const filePath = path.join(mediaPath, sanitizedFilename);

    // Verify path safety
    if (!isPathSafe(filePath, mediaPath)) {
      return { success: false, error: 'Access denied: invalid file path' };
    }

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
    // Validate filename
    const validation = validateFilename(filename);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }
    const sanitizedFilename = validation.sanitized!;

    const mediaPath = getMediaStoragePath();
    const filePath = path.join(mediaPath, sanitizedFilename);

    // Verify path safety
    if (!isPathSafe(filePath, mediaPath)) {
      return { success: false, error: 'Access denied: invalid file path' };
    }

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
