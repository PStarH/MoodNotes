MoodNotes — Current Functionality and Outline

Updated: 2025-10-17

This document summarizes what’s implemented today, how it’s wired, and light gaps to help prioritize next steps.

Current user-facing features

- Dashboard
	- Monthly calendar with mood color/emoji per day, indicators for tasks and summaries (click to open editor)
	- Monthly summary cards: words this month, unique tags this year, most used tag, average energy level, cumulative tags, max words per entry, entries/day max, total words, total entries, record days, accumulated counts
	- Daily quote block (static string for now)
- Journal
	- Rich-text daily editor (Quill) with: mood select, weather display (placeholder), tags add/remove, custom sections, comfort-zone note
	- Daily check sliders: energy, stress, productivity
	- Media attachments: image/video/audio previews; stored as data URLs
	- Save/Update/Delete per-day entries; export entry as PDF/Markdown/HTML
- Tasks
	- Simple task list with description, priority (6 levels), due date
	- Add task modal; tasks visible in Dashboard and Tasks tabs; calendar dots on due dates
- Habits
	- Habit list (name/description), add/edit modal
	- 10-day tracking grid with clickable status per day (did/partial/not) and streak badge component
- Sparks
	- Quick text “spark” capture on Dashboard, recent sparks in monthly summary
- Search
	- Search panel with keyword, date range, mood, tags, has-media filters; live result preview and stats (entries count, words, date span)
- Backup & Import
	- Export: JSON (full), CSV (summaries), Markdown (summaries)
	- Import: JSON merge (entries, tasks, habits, sparks)
- Theming and UX
	- Theme switcher with light/dark/auto using CSS vars
	- Toast notifications for success/error/info
	- Keyboard shortcuts: Ctrl+N new entry, Ctrl+F search, Ctrl+B backup, Esc close modals
	- Dev panel (dev only): perf metrics, feature flags, export performance report, clear app data

Screens and navigation

- Routes
	- / → Homepage (main app shell with tabs: Dashboard, Journal, Tasks)
	- /day-summary → DaySummary modal page (currently used as a modal component in Homepage)
- Shell
	- Left sidebar: Home, Calendar (detailed popup), Habits (popup), Search (panel), Backup (panel), Theme switcher
	- Main area: TabNavigation component toggles Dashboard/Journal/Tasks

Data model (store/types)

- DaySummary
	- { date: string, summary: string, mood: string, weather: string,
		habits: [{ name, completed, status }], dailyCheck: { energyLevel, stressLevel, productivity },
		comfortZoneEntry: string, customSections: [{ title, content }], tags: string[], media: [{ type, url }] }
- Task
	- { id: number, description: string, priority: 'Lowest'|'Low'|'Normal'|'Medium'|'High'|'Highest', dueDate: string }
- Habit
	- { id: number, name: string, description: string, statuses: [{ date, status: 'did'|'partial'|'not' }] }

State, persistence, and derived metrics

- Vuex state: daySummaries, tasks, habits, sparks, calendarEntries
- Persistence: localforage (IndexedDB) for all top-level collections; loaded on app start
- Mutations/actions for add/update/delete with setItem after each write
- Getters include: getDaySummary, totalWordsThisMonth(y,m), numberOfTagsThisYear(y), mostUsedTag(y), averageEnergyLevel(y,m)

Electron integration

- Electron main window loads Vite dev server or built index.html
- Security defaults: contextIsolation: true, nodeIntegration: false; simple preload exposing whitelisted IPC channels (no IPC used in app yet)

Key components and composables

- Components: TabNavigation, SummaryCard, EmptyState, HabitStreak, SearchPanel, BackupPanel, Toast, VirtualList, DevPanel
- Composables: useSearch (filters + stats + debounce), useDataBackup (export/import), useTheme (CSS vars + auto), useKeyboardShortcuts, usePerformance (debounce/throttle/virtual list helpers), useToast (programmatic toasts)
- Utilities: performanceMonitor with metrics, long-task observer, MD report export

Known gaps and limitations

- Weather data is placeholder; no external API integration
- Habit per-day statuses in editor are transient; store’s Habit.statuses array isn’t updated from the 10-day grid yet
- Calendar “Last year this day” concept not implemented beyond calendar highlighting
- Media stored as data URLs; no file management or size limits
- No authentication/sync; single-device local data only
- Accessibility: good keyboard focus in calendar, but modals/panels could use focus traps and ARIA improvements
- Tests: no unit or e2e tests present

Prioritized next steps for PM

1) Core journaling depth
	 - Persist habit tracking grid to Habit.statuses and surface in DaySummary
	 - Implement “last year today” view from existing summaries
2) Data reliability and portability
	 - Migrate media to File System Access or Electron file paths; add size/type validation
	 - Add backup import replace/merge modes and conflict detection
3) Insights and calendar utility
	 - Calendar drill-in day view with quick stats and entry/ task list
	 - Trend charts: mood over time, word count per month
4) Polishing and performance
	 - Focus management in modals, keyboard navigation, ARIA labels
	 - Virtualize large lists where needed; lazy-load heavy modules (Quill)
5) Optional integrations
	 - Weather API integration with caching
	 - Optional cloud sync/auth (out of scope of MVP)

Quick reference

- Routes: src/router/index.ts
- Store: src/store/index.ts and src/store/types.ts
- Views: src/views/Homepage.vue, src/views/DaySummary.vue
- Panels: src/components/SearchPanel.vue, src/components/BackupPanel.vue
- Theming: src/composables/useTheme.ts
- Desktop: electron/main.ts, electron/preload.ts

Note for incoming PM
---------------------

Welcome — below is a concise handoff to help you onboard quickly. I focused this summary on what exists today, decisions that were made, where to look for implementation details, and the top-priority workstreams.

1) What’s implemented (short)
	- Full single-device journaling experience: monthly calendar, rich-text daily editor (Quill), mood/tags, media attachments stored as data URLs, and daily check sliders.
	- Tasks, Habits, Sparks, and Search with multi-filtering and live stats.
	- Backup & Import (JSON merge), CSV/Markdown summary export, and simple restore flows using `useDataBackup`.
	- Theming (light/dark/auto), keyboard shortcuts, toast notifications, and a small Dev panel for perf metrics.

2) Important technical choices
	- Framework: Vue 3 + Vite. State: Vuex (single store at `src/store/index.ts`).
	- Persistence: localforage (IndexedDB) for all collections. No server or auth exists.
	- Electron: basic shell present under `/electron` used for desktop builds; preload exposes a tiny whitelist (contextIsolation enabled).
	- Media: stored inline as data URLs inside entries. This is simple but creates bloat and transfer-size concerns.

3) Where to start in the codebase
	- App shell & routing: `src/main.ts`, `src/router/index.ts`, `src/views/Homepage.vue`.
	- Data model & persistence: `src/store/index.ts`, `src/store/types.ts`, `src/composables/useDataBackup.ts`.
	- Editor & exports: Quill usage in Journal components and `src/utils` for PDF/MD helpers.
	- Desktop integration: `electron/main.ts`, `electron/preload.ts`.

4) Immediate risks and blockers
	- Data growth: media as data URLs may make IndexedDB huge and slow; migrate to filesystem or external storage for desktop or use blob storage with references.
	- Merge conflicts during import: import currently attempts a merge but lacks robust conflict resolution UI (duplicates, timestamps, and tag de-duping are simplistic).
	- Habit persistence: UI grid exists but syncing per-day statuses back to the Habit.statuses array is incomplete.

5) Recommended priorities (first 30 days)
	- Fix habit persistence and surface habit history in DaySummary.
	- Implement media migration strategy (electron file paths or FS Access API) with size/type validation and a migration path for existing data URLs.
	- Harden import/backup flows: add replace/preview/conflict resolution and automated tests for sample datasets.
	- Accessibility & focus management for modals/panels (focus traps and ARIA labels).

6) Developer notes — running and building
	- Local dev (app + electron): npm run dev (starts vite + electron). See `package.json` scripts.
	- Build: npm run build (builds web assets then electron build via `electron` package.json).
	- Key dev scripts: `dev`, `vite`, `electron`, `build`, `preview`.

7) Tests and observability
	- There are currently no unit or e2e tests. Add small unit tests around store mutations and import/export logic first.
	- DevPanel exposes some performance metrics; use it to reproduce slow loads when testing large datasets.

If you want, I can also open a small PR that implements one of the 30-day priority items (habit persistence or media migration starter), or prepare a short test plan and sample dataset to exercise the import/export paths.
