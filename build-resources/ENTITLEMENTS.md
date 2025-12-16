# MoodsNote - Mac App Store Entitlements

## Overview

This document explains the entitlements configured for the Mac App Store (MAS) build of MoodsNote and why each is necessary.

## Entitlements Files

### entitlements.mas.plist (Main App)

This file defines the entitlements for the main application process.

**Required Entitlements:**

| Entitlement | Purpose | Why Needed |
|-------------|---------|------------|
| `com.apple.security.app-sandbox` | Enables app sandboxing | **Required** for all Mac App Store apps |
| `com.apple.security.application-groups` | App group access | Allows data sharing between app and helper processes |
| `com.apple.security.files.user-selected.read-write` | Access user-selected files | Allows users to import/export journal entries, attach media files via file picker |
| `com.apple.security.network.client` | Outgoing network connections | May be needed for update checks or future cloud sync features |

**Removed Entitlements:**

- ❌ `com.apple.security.files.downloads.read-write` - **Removed per Apple's feedback**. The app doesn't need to access the Downloads folder directly. Users can select files from Downloads using the file picker (covered by user-selected entitlement).

### entitlements.mas.inherit.plist (Child Processes)

This file defines entitlements that are inherited by child processes (renderer processes in Electron).

**Entitlements:**

| Entitlement | Purpose | Why Needed |
|-------------|---------|------------|
| `com.apple.security.app-sandbox` | Enables app sandboxing | Required for consistency with main process |
| `com.apple.security.inherit` | Inherit parent entitlements | Allows renderer processes to inherit parent capabilities |
| `com.apple.security.cs.allow-jit` | Allow JIT compilation | **Required for Electron/Chromium** - enables JavaScript JIT compiler |
| `com.apple.security.cs.allow-unsigned-executable-memory` | Execute unsigned memory | **Required for Electron/Chromium** - needed for V8 JavaScript engine |
| `com.apple.security.cs.disable-library-validation` | Disable library validation | **Required for Electron** - allows loading of framework libraries |

### entitlements.mac.plist (Development Build)

This file is used for local macOS development builds (notarization), not for App Store submission.

## App Store Compliance

✅ **Minimum Entitlements Policy**: Only includes entitlements necessary for core functionality  
✅ **No Unnecessary Permissions**: Removed downloads folder access per Apple's guidance  
✅ **Sandboxing Enabled**: Full app sandbox compliance  
✅ **User Privacy**: File access only via user selection or app's own container

## Changes Made for App Store Approval

**Version 1.0.1+ Changes:**
- Removed `com.apple.security.files.downloads.read-write` entitlement
- This was flagged by Apple as unnecessary since the app:
  - Stores data in its own application support directory
  - Only needs access to files the user explicitly selects
  - Doesn't automatically access the Downloads folder

## References

- [Apple App Sandboxing Guide](https://developer.apple.com/documentation/security/app_sandbox)
- [Electron Mac App Store Submission Guide](https://www.electronjs.org/docs/latest/tutorial/mac-app-store-submission-guide)
- [Entitlements Documentation](https://developer.apple.com/documentation/bundleresources/entitlements)
