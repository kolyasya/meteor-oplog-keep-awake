# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

**kolyasya:oplog-keep-awake** is a Meteor package that keeps MongoDB Oplog active by periodically upserting values to a collection. This prevents Oplog from becoming inactive during periods of low database activity.

**Key Purpose**: Maintains Oplog availability for Meteor's real-time reactivity system by ensuring regular write operations occur, even when the application is idle.

## Development Commands

### Running the Example Application

```bash
cd example
meteor npm install
meteor --settings ./settings.json --exclude-archs web.browser.legacy,web.cordova
```

Or use the npm script:
```bash
cd example
npm start
```

### Package Installation (for users)

```bash
meteor add kolyasya:oplog-keep-awake
```

## Architecture

### Package Structure

The actual package code lives in `example/packages/oplog-keep-awake/`:

- **`server.js`**: Main package implementation
  - `OplogKeepAwake` class: Singleton that manages the keep-awake functionality
  - `initOplogKeepAwake()`: Exported initialization function
  - Uses `SyncedCron` to schedule periodic upserts
  - Reads configuration from `Meteor.settings.packages['kolyasya:oplog-keep-awake']`

- **`package.js`**: Meteor package definition
  - Package name: `kolyasya:oplog-keep-awake`
  - Version: `0.1.0-beta.3`
  - Target Meteor version: `3.0-rc.1`
  - Server-only package (no client code)

- **`utils/prepareProperSchedule.js`**: Schedule conversion utility
  - Converts seconds-based intervals to Later.js schedule formats
  - Handles limitation where Later.js cannot handle >60 second intervals directly
  - Converts to minutes/hours when needed

### Dependencies

**Critical**: This package requires `quave:synced-cron` (or `percolatestudio/meteor-synced-cron`) to be installed in the host application. The package will not work without it.

### Configuration

Package settings are defined in `settings.json` under the `packages` key:

```json
{
  "packages": {
    "kolyasya:oplog-keep-awake": {
      "keepAwakeCollectionName": "keepAwake",
      "keepAwakeUpsertIntervalSeconds": 120
    }
  }
}
```

**Default values**:
- `keepAwakeCollectionName`: `"keepAwake"`
- `keepAwakeUpsertIntervalSeconds`: `120`

**Validation**:
- Collection name must be at least 2 characters
- Interval must be >= 1 second

### How It Works

1. On initialization, creates a Mongo.Collection with the configured name
2. Registers a SyncedCron job that runs at the specified interval
3. Each execution:
   - Upserts a document with `_id: "keepAwake"` and current timestamp
   - Cleans up old cron history entries to prevent bloat
4. The singleton pattern ensures only one instance runs even if initialized multiple times

### Example Application

The `example/` directory contains a minimal Meteor 3.0.3 application demonstrating package usage:

- **Meteor version**: 3.0.3
- **Key packages**: 
  - `kolyasya:oplog-keep-awake` (local package)
  - `quave:synced-cron` (dependency)
- **Entry point**: `server/main.js`
- **Configuration**: `settings.json` (sets interval to 5 seconds for testing)

## Testing

The package does not currently have automated tests. To verify functionality:

1. Run the example app with `npm start` in the `example/` directory
2. Monitor console output for initialization messages
3. Observe MongoDB collection for periodic updates to the `keepAwake` document
4. Check SyncedCron collection for job execution history

## Code Editing Notes

- **Singleton enforcement**: The `OplogKeepAwake` class uses a module-level `instance` variable to ensure only one instance exists
- **Async operations**: The package uses `upsertAsync` and `removeAsync` for MongoDB operations (Meteor 3.0 async API)
- **Error handling**: Configuration validation throws `Meteor.Error` on invalid settings
- **Logging**: Uses `console.log`, `console.warn`, and `console.error` for diagnostics
- **Cron cleanup**: Automatically removes old package logs from SyncedCron history to prevent collection growth
