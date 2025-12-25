# Changelog

All notable changes to MoodsNote will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.3/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.3] - 2025-10-27

### 🎉 Initial Release

The first public release of MoodsNote - a local-first journaling app built with care.

### ✨ Features

#### Writing Experience
- **Daily Summary Editor**: Rich text editing powered by Quill with mood and weather tagging
- **Custom Sections**: Add personalized sections to organize your thoughts
- **Tags System**: Tag your entries for easy categorization and retrieval
- **Comfort Zone Entry**: Document what takes you out of your comfort zone
- **Sparks**: Quick capture for fleeting thoughts and inspiration
- **Media Support**: Attach images, videos, and audio to your entries
  - Local storage via Electron (10MB per file, 100MB total)
  - Secure file management with validation
- **Export Options**: 
  - JSON (full data backup)
  - CSV (for spreadsheet analysis)
  - Markdown (human-readable format)

#### Time & Views
- **Calendar View**: Visual overview of your journaling journey with mood indicators
- **This Day Last Year**: Reflect on what you were doing one year ago
- **Daily Quote**: Inspirational quotes to start your day

#### Analytics & Insights
- **Mood Trend Chart**: Visualize your emotional patterns over time
- **Energy & Stress Tracking**: Monitor your daily check-in metrics
  - Energy level (1-10)
  - Stress level (1-10)
  - Productivity (1-10)
- **Word Count Statistics**: Track your writing volume by month
- **Habit Tracking**: 
  - Create and monitor daily habits
  - Track completion status (did/partial/not)
  - View streak and trend insights
  - Today's habit completion summary

#### Data & Privacy
- **Local-First Architecture**: All data stored in IndexedDB via LocalForage
- **Offline-Ready**: Works completely offline with no server dependency
- **Backup & Import**:
  - One-click export with versioned format (v2.0.0)
  - Import with conflict preview and resolution
  - Smart merge strategies (merge/replace/skip)
  - Automatic migration from older backup formats
- **Data Validation**: Runtime type guards ensure data integrity

#### User Experience
- **Keyboard Shortcuts**: Extensible keyboard shortcut system
- **Search Functionality**: Find entries quickly by keyword and date
- **Virtual List**: Performance-optimized rendering for large datasets
- **Lazy Loading**: Images load on-demand for better performance
- **Theme Support**: Light and dark modes
- **Internationalization**: 
  - Chinese (简体中文)
  - English
- **Accessibility**: 
  - Focus trap management
  - Keyboard navigation
  - ARIA labels and semantic HTML
  - Screen reader support

#### Technical Highlights
- **Vue 3 + Composition API**: Modern, maintainable codebase
- **TypeScript**: Type-safe development
- **Vite**: Lightning-fast dev server and builds
- **Electron 33**: Secure desktop app with context isolation
- **Chart.js**: Beautiful, interactive data visualizations
- **Tailwind CSS**: Responsive, utility-first styling
- **Vitest**: Comprehensive test coverage

### 🔒 Security
- Content Security Policy (CSP) implementation
- DOMPurify for XSS protection
- Electron security best practices:
  - Context isolation enabled
  - Node integration disabled
  - Secure preload bridge
- Media file validation and size limits

### 📦 Distribution
- Cross-platform support: macOS, Windows, Linux
- Proper app icons (.icns for Mac, .ico for Windows)
- electron-builder configuration for packaging

### 🐛 Known Issues
- PDF export is planned but not yet implemented
- Code signing not included (users will see security warnings)
- Auto-update mechanism not implemented

### 📝 Documentation
- Comprehensive README in Chinese and English
- Installation and development instructions
- Build and test commands
- FAQ section
- Project structure documentation

---

## [Unreleased]

### Planned Features
- Cloud sync (optional, privacy-focused)
- Mobile apps (iOS/Android)
- Advanced search with filters
- Custom themes and styling
- Encrypted backup option
- PDF export
- Audio recording for voice notes
- More chart types and analytics

---

[1.0.3]: https://github.com/PStarH/MoodsNote/releases/tag/v1.0.0
