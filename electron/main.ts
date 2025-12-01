import { app, BrowserWindow, ipcMain, shell, Menu } from 'electron';
import * as path from 'path';
import * as fs from 'fs/promises';
import * as crypto from 'crypto';

// Extend the Electron app to include isQuitting property
declare global {
  namespace Electron {
    interface App {
      isQuitting?: boolean;
    }
  }
}

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
    : `file://${path.join(__dirname, '../../dist/index.html')}`;

  console.log('Loading URL:', startURL);
  console.log('__dirname:', __dirname);
  console.log('Is packaged:', app.isPackaged);

  mainWindow.loadURL(startURL);

  // Log when page loads
  mainWindow.webContents.on('did-finish-load', () => {
    console.log('Page finished loading');
  });

  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Failed to load:', errorCode, errorDescription);
  });

  // On macOS, hide the window when closed instead of destroying it
  // This allows users to reopen it via the Window menu
  mainWindow.on('close', (event: Electron.Event) => {
    if (process.platform === 'darwin' && !app.isQuitting) {
      event.preventDefault();
      mainWindow?.hide();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Create application menu for macOS
function createMenu() {
  const isMac = process.platform === 'darwin';

  const template: Electron.MenuItemConstructorOptions[] = [
    // App menu (macOS only)
    ...(isMac ? [{
      label: app.name,
      submenu: [
        { role: 'about' as const },
        { type: 'separator' as const },
        { role: 'services' as const },
        { type: 'separator' as const },
        { role: 'hide' as const },
        { role: 'hideOthers' as const },
        { role: 'unhide' as const },
        { type: 'separator' as const },
        { role: 'quit' as const }
      ]
    }] : []),
    // File menu
    {
      label: 'File',
      submenu: [
        isMac ? { role: 'close' as const } : { role: 'quit' as const }
      ]
    },
    // Edit menu
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' as const },
        { role: 'redo' as const },
        { type: 'separator' as const },
        { role: 'cut' as const },
        { role: 'copy' as const },
        { role: 'paste' as const },
        ...(isMac ? [
          { role: 'pasteAndMatchStyle' as const },
          { role: 'delete' as const },
          { role: 'selectAll' as const },
          { type: 'separator' as const },
          {
            label: 'Speech',
            submenu: [
              { role: 'startSpeaking' as const },
              { role: 'stopSpeaking' as const }
            ]
          }
        ] : [
          { role: 'delete' as const },
          { type: 'separator' as const },
          { role: 'selectAll' as const }
        ])
      ]
    },
    // Window menu
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' as const },
        { role: 'zoom' as const },
        { type: 'separator' as const },
        {
          label: 'Show Main Window',
          accelerator: 'CmdOrCtrl+0',
          click: () => {
            if (mainWindow) {
              if (mainWindow.isMinimized()) {
                mainWindow.restore();
              }
              mainWindow.show();
              mainWindow.focus();
            } else {
              createWindow();
            }
          }
        },
        { type: 'separator' as const },
        ...(isMac ? [
          { role: 'front' as const },
          { type: 'separator' as const },
          { role: 'window' as const }
        ] : [
          { role: 'close' as const }
        ])
      ]
    },
    // Help menu
    {
      label: 'Help',
      submenu: [
        {
          label: 'Report an Issue',
          click: async () => {
            await shell.openExternal('https://github.com/PStarH/MoodNotes/issues');
          }
        },
        {
          label: 'View Documentation',
          click: async () => {
            await shell.openExternal('https://github.com/PStarH/MoodNotes#readme');
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// Security constants
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB per file
const MAX_TOTAL_SIZE = 100 * 1024 * 1024; // 100MB total storage
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.mp4', '.webm', '.ogg', '.mp3', '.wav'];
const MANIFEST_FILENAME = 'media-manifest.json';

const EXTENSION_MIME_MAP: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.ogg': 'audio/ogg',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav'
};

interface MediaManifestEntry {
  id: string;
  storedName: string;
  originalName: string;
  mimeType: string;
  size: number;
  checksum: string;
  createdAt: string;
}

interface MediaIntegrity {
  ok: boolean;
  reason?: string;
}

function getManifestPath(): string {
  return path.join(getMediaStoragePath(), MANIFEST_FILENAME);
}

async function loadManifest(options: { reconcile?: boolean } = {}): Promise<MediaManifestEntry[]> {
  await ensureMediaDirectory();
  const manifestPath = getManifestPath();

  try {
    const raw = await fs.readFile(manifestPath, 'utf8');
    let parsed = JSON.parse(raw) as MediaManifestEntry[];
    if (!Array.isArray(parsed)) {
      throw new Error('Invalid manifest content');
    }
    if (options.reconcile) {
      parsed = await ensureManifestConsistency(parsed);
    }
    return parsed;
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      await fs.writeFile(manifestPath, '[]', 'utf8');
      return options.reconcile ? ensureManifestConsistency([]) : [];
    }
    console.error('Failed to load media manifest:', error);
    throw error;
  }
}

async function saveManifest(entries: MediaManifestEntry[]): Promise<void> {
  const manifestPath = getManifestPath();
  const tempPath = `${manifestPath}.tmp`;
  const serialized = JSON.stringify(entries, null, 2);

  // Write to temp file first (atomic operation)
  await fs.writeFile(tempPath, serialized, 'utf8');

  // Rename is atomic on most filesystems - prevents corruption
  await fs.rename(tempPath, manifestPath);
}

function generateId(): string {
  if (typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return crypto.randomBytes(16).toString('hex');
}

function computeChecksum(buffer: Buffer, algorithm: 'sha256' | 'sha512' = 'sha256'): string {
  return crypto.createHash(algorithm).update(buffer).digest('hex');
}

async function computeFileChecksum(filePath: string, algorithm: 'sha256' | 'sha512' = 'sha256'): Promise<string> {
  const hash = crypto.createHash(algorithm);
  const file = await fs.readFile(filePath);
  hash.update(file);
  return hash.digest('hex');
}

async function verifyEntry(entry: MediaManifestEntry): Promise<MediaIntegrity> {
  try {
    const mediaPath = getMediaStoragePath();
    const filePath = path.join(mediaPath, entry.storedName);
    const stats = await fs.stat(filePath);

    if (stats.size !== entry.size) {
      return { ok: false, reason: 'Size mismatch' };
    }

    const checksum = await computeFileChecksum(filePath);
    if (checksum !== entry.checksum) {
      return { ok: false, reason: 'Checksum mismatch' };
    }

    return { ok: true };
  } catch (error: any) {
    return { ok: false, reason: error.message };
  }
}

function detectMimeType(extension: string): string {
  return EXTENSION_MIME_MAP[extension.toLowerCase()] || 'application/octet-stream';
}

async function ensureManifestConsistency(manifest: MediaManifestEntry[]): Promise<MediaManifestEntry[]> {
  await ensureMediaDirectory();
  const mediaPath = getMediaStoragePath();
  const files = await fs.readdir(mediaPath);
  const manifestMap = new Map(manifest.map(entry => [entry.storedName, entry]));
  let changed = false;

  for (const file of files) {
    if (file === MANIFEST_FILENAME) {
      continue;
    }

    const existing = manifestMap.get(file);
    if (existing) {
      continue;
    }

    const filePath = path.join(mediaPath, file);
    const stats = await fs.stat(filePath);
    if (!stats.isFile()) {
      continue;
    }
    const checksum = await computeFileChecksum(filePath);
    const extension = path.extname(file).toLowerCase();
    const mimeType = detectMimeType(extension);
    const createdAt = stats.birthtime instanceof Date && !Number.isNaN(stats.birthtime.valueOf())
      ? stats.birthtime.toISOString()
      : new Date().toISOString();

    const entry: MediaManifestEntry = {
      id: generateId(),
      storedName: file,
      originalName: file,
      mimeType,
      size: stats.size,
      checksum,
      createdAt,
    };

    manifest.push(entry);
    manifestMap.set(file, entry);
    changed = true;
  }

  if (changed) {
    await saveManifest(manifest);
  }

  return manifest;
}

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
    const manifest = await loadManifest({ reconcile: true });
    const totalSize = manifest.reduce((sum, entry) => sum + entry.size, 0);

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
ipcMain.handle('media:save', async (event, payload: { originalName: string; mimeType: string; buffer: ArrayBuffer }) => {
  try {
    const { originalName, mimeType, buffer } = payload;

    // Validate filename and extension from original name
    const validation = validateFilename(originalName);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }
    const sanitizedOriginalName = validation.sanitized!;

    // Check MIME consistency with extension
    if (!mimeType || !mimeType.startsWith('image/') && !mimeType.startsWith('video/') && !mimeType.startsWith('audio/')) {
      return { success: false, error: 'Invalid MIME type supplied' };
    }

    const fileBuffer = Buffer.from(buffer);

    // Check file size
    if (fileBuffer.byteLength > MAX_FILE_SIZE) {
      return {
        success: false,
        error: `File too large: ${(fileBuffer.byteLength / 1024 / 1024).toFixed(2)}MB exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`
      };
    }

    // Check total storage size
    const storageCheck = await checkStorageSize(fileBuffer.byteLength);
    if (!storageCheck.ok) {
      return { success: false, error: storageCheck.error };
    }

    await ensureMediaDirectory();
    const mediaPath = getMediaStoragePath();
    const entryId = generateId();
    const extension = path.extname(sanitizedOriginalName).toLowerCase();
    const storedName = `${Date.now()}-${entryId}${extension}`;
    const filePath = path.join(mediaPath, storedName);

    // Verify path safety
    if (!isPathSafe(filePath, mediaPath)) {
      return { success: false, error: 'Access denied: invalid file path' };
    }

    // Write file to disk
    await fs.writeFile(filePath, fileBuffer);

    const checksum = computeChecksum(fileBuffer);
    const createdAt = new Date().toISOString();

    const manifest = await loadManifest({ reconcile: true });
    const entry: MediaManifestEntry = {
      id: entryId,
      storedName,
      originalName: sanitizedOriginalName,
      mimeType,
      size: fileBuffer.byteLength,
      checksum,
      createdAt,
    };

    manifest.push(entry);

    // Save manifest with rollback on failure
    try {
      await saveManifest(manifest);
    } catch (manifestError: any) {
      // Rollback: delete the file we just wrote
      try {
        await fs.unlink(filePath);
      } catch (unlinkError) {
        console.error('Failed to rollback file after manifest error:', unlinkError);
      }
      throw new Error(`Failed to update manifest: ${manifestError.message}`);
    }

    return {
      success: true,
      entry,
      integrity: { ok: true } as MediaIntegrity,
    };
  } catch (error: any) {
    console.error('Error saving media file:', error);
    return { success: false, error: error.message };
  }
});

// Read media file
ipcMain.handle('media:read', async (event, payload: { id?: string; storedName?: string }) => {
  try {
    const { id, storedName } = payload;
    const manifest = await loadManifest({ reconcile: true });
    const entry = manifest.find(item => (id && item.id === id) || (storedName && item.storedName === storedName));

    if (!entry) {
      return { success: false, error: 'File not found in manifest' };
    }

    const mediaPath = getMediaStoragePath();
    const filePath = path.join(mediaPath, entry.storedName);

    if (!isPathSafe(filePath, mediaPath)) {
      return { success: false, error: 'Access denied: invalid file path' };
    }

    const buffer = await fs.readFile(filePath);
    return { success: true, buffer, entry };
  } catch (error: any) {
    console.error('Error reading media file:', error);
    return { success: false, error: error.message };
  }
});

// Delete media file
ipcMain.handle('media:delete', async (event, payload: { id?: string; storedName?: string }) => {
  try {
    const { id, storedName } = payload;
    const manifest = await loadManifest({ reconcile: true });
    const targetIndex = manifest.findIndex(item => (id && item.id === id) || (storedName && item.storedName === storedName));

    if (targetIndex === -1) {
      return { success: false, error: 'File not found in manifest' };
    }

    const entry = manifest[targetIndex];
    const mediaPath = getMediaStoragePath();
    const filePath = path.join(mediaPath, entry.storedName);

    if (!isPathSafe(filePath, mediaPath)) {
      return { success: false, error: 'Access denied: invalid file path' };
    }

    try {
      await fs.unlink(filePath);
    } catch (error: any) {
      if (error.code !== 'ENOENT') {
        throw error;
      }
      // If file missing, continue to clean manifest
    }

    manifest.splice(targetIndex, 1);
    await saveManifest(manifest);
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
ipcMain.handle('media:list', async (event, options?: { verify?: boolean }) => {
  try {
    await ensureMediaDirectory();
    const verify = options?.verify ?? false;
    const mediaPath = getMediaStoragePath();
    const manifest = await loadManifest({ reconcile: true });

    const filesWithIntegrity = await Promise.all(manifest.map(async entry => {
      const filePath = path.join(mediaPath, entry.storedName);
      let integrity: MediaIntegrity = { ok: true };

      try {
        await fs.access(filePath);
        if (verify) {
          integrity = await verifyEntry(entry);
        }
      } catch (error: any) {
        integrity = { ok: false, reason: error.message };
      }

      return { entry, integrity };
    }));

    return {
      success: true,
      files: filesWithIntegrity,
    };
  } catch (error: any) {
    console.error('Error listing media files:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('media:open', async (event, payload: { id?: string; storedName?: string }) => {
  try {
    const { id, storedName } = payload;
    const manifest = await loadManifest({ reconcile: true });
    const entry = manifest.find(item => (id && item.id === id) || (storedName && item.storedName === storedName));

    if (!entry) {
      return { success: false, error: 'File not found in manifest' };
    }

    const mediaPath = getMediaStoragePath();
    const filePath = path.join(mediaPath, entry.storedName);

    if (!isPathSafe(filePath, mediaPath)) {
      return { success: false, error: 'Access denied: invalid file path' };
    }

    const result = await shell.openPath(filePath);
    if (result) {
      return { success: false, error: result };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error opening media file:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('media:reveal', async (event, payload: { id?: string; storedName?: string }) => {
  try {
    const { id, storedName } = payload;
    const manifest = await loadManifest({ reconcile: true });
    const entry = manifest.find(item => (id && item.id === id) || (storedName && item.storedName === storedName));

    if (!entry) {
      return { success: false, error: 'File not found in manifest' };
    }

    const mediaPath = getMediaStoragePath();
    const filePath = path.join(mediaPath, entry.storedName);

    if (!isPathSafe(filePath, mediaPath)) {
      return { success: false, error: 'Access denied: invalid file path' };
    }

    shell.showItemInFolder(filePath);
    return { success: true };
  } catch (error: any) {
    console.error('Error revealing media file:', error);
    return { success: false, error: error.message };
  }
});

app.whenReady().then(() => {
  createMenu();
  createWindow();

  app.on('activate', () => {
    // On macOS, show the window if it exists but is hidden
    if (mainWindow) {
      mainWindow.show();
      mainWindow.focus();
    } else if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Handle app quit properly on macOS
app.on('before-quit', () => {
  app.isQuitting = true;
});
