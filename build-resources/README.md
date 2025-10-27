# Build Resources

This directory contains icon files for building the application.

## Icon Requirements

For best results across all platforms, you need:

### macOS (.icns)
- Required for macOS .app bundles
- Should contain multiple resolutions: 16x16, 32x32, 64x64, 128x128, 256x256, 512x512, 1024x1024

### Windows (.ico)
- Required for Windows .exe files
- Should contain multiple resolutions: 16x16, 32x32, 48x48, 64x64, 128x128, 256x256

### Linux (.png)
- 512x512 or 1024x1024 PNG works fine

## Converting icon1.png

If you only have icon1.png, you can convert it using these tools:

### macOS:
```bash
# Install iconutil (comes with Xcode Command Line Tools)
# Create .iconset directory with multiple sizes
mkdir icon.iconset
sips -z 16 16     icon1.png --out icon.iconset/icon_16x16.png
sips -z 32 32     icon1.png --out icon.iconset/icon_16x16@2x.png
sips -z 32 32     icon1.png --out icon.iconset/icon_32x32.png
sips -z 64 64     icon1.png --out icon.iconset/icon_32x32@2x.png
sips -z 128 128   icon1.png --out icon.iconset/icon_128x128.png
sips -z 256 256   icon1.png --out icon.iconset/icon_128x128@2x.png
sips -z 256 256   icon1.png --out icon.iconset/icon_256x256.png
sips -z 512 512   icon1.png --out icon.iconset/icon_256x256@2x.png
sips -z 512 512   icon1.png --out icon.iconset/icon_512x512.png
sips -z 1024 1024 icon1.png --out icon.iconset/icon_512x512@2x.png

# Convert to .icns
iconutil -c icns icon.iconset -o icon.icns
```

### Windows (using online converter or ImageMagick):
```bash
# Using ImageMagick
magick convert icon1.png -define icon:auto-resize=256,128,64,48,32,16 icon.ico
```

### Or use online tools:
- https://iconverticons.com/online/
- https://convertico.com/

## Current Setup

For now, we're using `icon1.png` directly. electron-builder will attempt to convert it automatically, but for production releases, it's better to provide properly formatted .icns and .ico files.
