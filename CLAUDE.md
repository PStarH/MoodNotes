# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MoodNotes is a local-first journaling application built with Vue 3 + Vite and Electron. It provides mood tracking, habit insights, and data visualization with a focus on privacy and offline-first functionality. All user data is stored locally using IndexedDB (via LocalForage), and media files are stored in the system's userData directory.

## Development Commands

### Setup and Development
```bash
npm install              # Install all dependencies (root + electron)
npm run dev              # Start Vite dev server + Electron in development mode
npm run vite             # Start only Vite dev server (port 3000)
npm run electron         # Start only Electron process
```

### Building
```bash
npm run build            # Build frontend + compile Electron TypeScript
npm run build-electron   # Compile Electron TypeScript only
```

### Packaging
```bash
npm run package          # Package for current platform
npm run package:mac      # Package macOS .dmg and .zip
npm run package:win      # Package Windows installers
npm run package:linux    # Package Linux AppImage and .deb
```

### Testing
```bash
npm run test             # Run tests in watch mode (Vitest)
npm run test:ui          # Run tests with interactive UI
npm run test:run         # Run tests once (CI mode)
npm run test:coverage    # Generate coverage report
npm run type-check       # TypeScript type checking (no emit)
```

## Architecture

### Dual-Process Structure (Electron + Vue)

This is a **two-package architecture**:
1. **Root package** ([package.json](package.json)): Vue 3 frontend with Vite
2. **electron/** ([electron/package.json](electron/package.json)): Electron main and preload scripts

Development workflow uses `concurrently` to run both Vite dev server and Electron simultaneously.

### State Management (Vuex 4)

The application uses Vuex for centralized state management in [src/store/index.ts](src/store/index.ts). Key features:

- **Type Guards**: Runtime validation for all data types (`isDaySummary`, `isTask`, `isHabit`) to ensure data integrity
- **Rollback on Error**: All mutations store original state and rollback if persistence fails
- **Data Validation**: Invalid entries are filtered out during load with console warnings
- **Storage Limits**: 10MB limit for structured data with size checks before saving
- **Lazy Getters**: Uses Map-based O(1) lookups for day summaries

State structure:
- `daySummaries`: Daily journal entries with mood, weather, habits, rich text content
- `tasks`: Task list with priorities and due dates
- `habits`: Habit tracking with historical status records
- `sparks`: Quick inspiration notes
- `calendarEntries`: Date-specific calendar notes
- `settings`: App settings (e.g., `autoSaveOnClose`)

### Data Persistence

**Structured Data**: LocalForage (IndexedDB wrapper) stores all state in browser storage
- Store name: `MoodNotes`
- Database: `mood_notes_store`
- All saves use JSON serialization/deserialization to ensure IndexedDB compatibility

**Media Files** (Electron only): Stored in `app.getPath('userData')/media` via IPC handlers
- Security: Filename validation, path traversal protection, extension whitelist
- Limits: 10MB per file, 100MB total storage
- Allowed types: `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`, `.mp4`, `.webm`, `.ogg`, `.mp3`, `.wav`
- IPC API: `window.api.media.{save, read, delete, getPath, list}`

### Electron IPC Bridge ([electron/preload.ts](electron/preload.ts))

The preload script exposes a secure API at `window.api` using `contextBridge`:
- `media.*`: Media file operations (save/read/delete/list)
- Context isolation is enabled for security

### Backup and Migration System

**Version-Aware Backups** ([src/composables/useDataBackup.ts](src/composables/useDataBackup.ts)):
- Current backup format version: `2.0.0`
- All exports include `version` and `exportDate` fields
- Automatic migration from older formats on import
- Type guards validate imported data to prevent corruption

**Import Conflict Resolution** ([src/composables/useImportConflict.ts](src/composables/useImportConflict.ts)):
- Detects conflicts between existing and imported data
- Supports merge strategies: preview, replace, skip, or merge
- Shows conflict preview before applying changes

### Routing ([src/router/index.ts](src/router/index.ts))

Uses Vue Router with lazy-loaded components:
- `/` - Homepage (calendar view, quick stats, daily quote)
- `/day-summary` - Rich text journal editor with Quill
- `/analytics` - Data visualization (mood trends, energy/stress charts, habit insights)
- `/settings` - App configuration and backup management

### Key Composables

- `useDataBackup`: Export/import functionality with version migration
- `useDataMigration`: Handles backup format upgrades between versions
- `useImportConflict`: Conflict detection and resolution UI
- `useMediaManager`: Electron media file operations via IPC
- `useKeyboardShortcuts`: Global keyboard shortcut system
- `useTheme`: Dark/light theme management
- `usePerformance`: Performance monitoring utilities
- `useStorageMonitor`: IndexedDB usage tracking

### Component Organization

- **components/**: Reusable UI components (charts, pickers, dialogs, panels)
  - Chart components use Chart.js with `vue-chartjs` wrapper
  - Virtual scrolling for large lists via `vue-virtual-scroller`
- **views/**: Page-level route components
- **composables/**: Shared composition functions for business logic

### Internationalization (i18n)

Vue I18n setup in [src/i18n/](src/i18n/) with Chinese (zh) and English (en) locales.

## Build Configuration

### Vite ([vite.config.ts](vite.config.ts))
- Alias: `@/` → `src/`
- Code splitting: Vendor, editor (Quill), utils, icons
- Minification: Terser with console/debugger removal in production
- Base path: `./` (relative for Electron compatibility)

### Vitest ([vitest.config.ts](vitest.config.ts))
- Environment: `happy-dom`
- Setup file: [src/test/setup.ts](src/test/setup.ts)
- Coverage: v8 provider with HTML/JSON/text reports

### Electron Builder ([package.json](package.json) `build` section)
- App ID: `com.pstarh.moodnotes`
- Output: `dist-electron/`
- Icons in `build-resources/`
- Platform-specific targets:
  - macOS: `.dmg` + `.zip`
  - Windows: NSIS installer + portable `.exe` + MSIX
  - Linux: AppImage + `.deb`

## CI/CD

### Workflows ([.github/workflows/](/.github/workflows/))

**ci.yml**: Runs on push/PR to main/develop
- Type checking → Tests → Coverage → Build
- Uploads coverage to Codecov

**build-release.yml**: Triggered by version tags (`v*.*.*`) or manual dispatch
- Matrix build: macOS, Windows, Linux
- Creates GitHub release with artifacts
- Extracts release notes from [CHANGELOG.md](CHANGELOG.md)

## Important Implementation Notes

### Data Integrity
- Always use type guards when loading/importing data to filter invalid entries
- Mutations should store original state for rollback on persistence errors
- Use JSON serialization before saving to IndexedDB to ensure compatibility
- Check storage size limits before committing mutations

### Electron Security
- Context isolation is enabled
- Node integration is disabled in renderer
- All filesystem operations go through validated IPC handlers
- Media filenames are sanitized to prevent path traversal

### Performance Considerations
- Day summaries use Map-based getters for O(1) lookups
- Routes are lazy-loaded
- Virtual scrolling for large lists
- Manual chunk splitting in Vite config

### Error Handling
- Storage errors use `handleStorageError` utility ([src/utils/storageErrorHandler.ts](src/utils/storageErrorHandler.ts))
- Failed operations rollback state mutations
- User-friendly error messages for quota exceeded, offline, etc.

## TypeScript Configuration

Path alias `@/*` maps to `src/*` in both [tsconfig.json](tsconfig.json) and [vite.config.ts](vite.config.ts).

Module resolution: `bundler` mode for ESNext compatibility.
