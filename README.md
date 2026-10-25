# MotionForge Studio

Mobile-first motion graphics editor built with Tauri 2 and Rust.

## Android debug APK

This repository is being connected to the MotionForge Android build workflow. **No verified APK exists yet.** A successful Actions build is required before any download link is offered.

### Local build

```bash
npm install
npx tauri android init --ci
npx tauri android build --apk --debug --ci
```

Android SDK, NDK, Rust targets, Java 17 and a compatible Node.js runtime are required.

## Current status

Project upload in progress. The complete previous MotionForge v0.5 source is not yet synced. Do not treat GitHub Actions as a verified release until compilation succeeds.
